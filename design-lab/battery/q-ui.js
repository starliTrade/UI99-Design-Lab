// ui99-battery-v2 · UI. Uses QCore (logic) and the stimulus helpers. Single file, no network.
const LEVELS = [0.1565, 0.1943];   // canvas #060709 is NOT tested: its steps are below the 8-bit display floor (protocol §11)
const F = DITH_F_BASE;
const $ = (id) => document.getElementById(id);
const rnd = Math.random;

// Dither pairs for a base, searched in a WIDER window than the original test (which found none at the
// canvas level). Hue deviation is capped at 2°; every pair is recorded so the report can show it.
function pairsFor(bL) {
  const lo = oklchToHex(bL), loLin = linOf(lo), loLab = labOfLin(loLin);
  const [r0, g0, b0] = [1, 3, 5].map((i) => parseInt(oklchToHex(bL + 1.1 * Q).slice(i, i + 2), 16));
  const found = [];
  for (let dr = -8; dr <= 8; dr++) for (let dg = -8; dg <= 8; dg++) for (let db = -8; db <= 8; db++) {
    const hx = '#' + [r0 + dr, g0 + dg, b0 + db].map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
    const lab = labOfLin(linOf(hx));
    const x = (lab.L - loLab.L) / Q, dh = hueGap(lab.h, loLab.h);
    if (x >= 0.8 && x <= 1.6 && dh <= 2) found.push({ hx, dh, x });
  }
  found.sort((a, b) => a.dh - b.dh);
  const best = found.slice(0, 3);
  return best.map((b) => ({ bL, lo, hi: b.hx, loLin, hiLin: linOf(b.hx), dh: +b.dh.toFixed(2), xTop: +b.x.toFixed(2) }));
}
function levelCandidates(bL) {
  const pure = pureCandidates().filter((c) => c.bL === bL)
    .map((c) => ({ kind: 'pure', x: c.x, key: 'p:' + c.hex, hex: c.hex, bh: c.bh }));
  const dith = [];
  pairsFor(bL).forEach((pair, pi) => {
    for (let t = 0.02; t <= 0.5001; t += 0.02) {
      const x = ditherX(pair, F, F + t);
      dith.push({ kind: 'dith', x: +x.toFixed(3), key: 'd:' + bL + ':' + pi + ':' + t.toFixed(2), pair, t: +t.toFixed(2) });
    }
  });
  return [...pure, ...dith].filter((c) => c.x > 0.02).sort((a, b) => a.x - b.x);
}
function catchFor(bL) {
  const pure = pureCandidates().filter((c) => c.bL === bL);
  let best = pure[0];
  for (const c of pure) if (Math.abs(c.x - 2.5) < Math.abs(best.x - 2.5)) best = c;
  return { kind: 'pure', x: best.x, key: 'catch', hex: best.hex, bh: best.bh };
}

const S = { levelIdx: 0, block: null, cur: null, results: [], started: null };

function show(id) { if (id !== 's-test') document.body.style.background = '#060709'; ['s-intro', 's-test', 's-res'].forEach((x) => $(x).classList.toggle('hidden', x !== id)); }
function setProg(p) { $('prog').style.width = (Math.max(0, Math.min(1, p)) * 100).toFixed(0) + '%'; }
const INTERVAL_MS = 700, GAP_MS = 350;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// The seam is a full-width step across the whole field. There is NO panel box, NO outline and NO
// surround that differs from the base, so the only edge a reader can see is the seam itself.
// Two intervals are shown one after the other (2IFC): the observer says which one had the seam.
function fieldSeam(bh, hex) {
  const d = document.createElement('div');
  d.style.cssText = 'width:100%;height:100%;display:flex;flex-direction:column';
  d.innerHTML = `<div style="flex:1;background:${bh}"></div><div style="flex:1;background:${hex}"></div>`;
  return d;
}
function fieldPlain(bh) {
  const d = document.createElement('div');
  d.style.cssText = `width:100%;height:100%;background:${bh}`;
  return d;
}
function fieldDither(pair, fTop, fBot) {
  const field = $('field');
  const W = Math.max(60, Math.round(field.clientWidth * Math.max(1, devicePixelRatio || 1)));
  const H = Math.max(60, Math.round(field.clientHeight * Math.max(1, devicePixelRatio || 1)));
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  cv.style.cssText = 'width:100%;height:100%;display:block';
  const ctx = cv.getContext('2d');
  const img = ctx.createImageData(W, H);
  const lo = [1, 3, 5].map((i) => parseInt(pair.lo.slice(i, i + 2), 16));
  const hi = [1, 3, 5].map((i) => parseInt(pair.hi.slice(i, i + 2), 16));
  for (let y = 0; y < H; y++) {
    const f = y < H / 2 ? fTop : fBot;
    for (let x = 0; x < W; x++) {
      const c = BAYER8[(y % 8) * 8 + (x % 8)] < f ? hi : lo;
      const k = (y * W + x) * 4;
      img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return cv;
}
function buildInterval(stim, seam) {
  const base = oklchToHex(S.bL);
  if (stim.kind === 'dith') {
    const pair = stim.pair;
    return seam ? fieldDither(pair, F, F + stim.t) : fieldDither(pair, F, F);
  }
  if (stim.kind === 'pure' || stim.kind === 'catch') return seam ? fieldSeam(stim.bh, stim.hex) : fieldPlain(stim.bh);
  return fieldPlain(base); // null
}
function setField(node) { const f = $('field'); f.replaceChildren(node || document.createTextNode('')); }

let busy = false;
async function nextTrial() {
  const stim = S.block.next();
  if (!stim) return finishLevel();
  S.cur = stim;
  busy = true; setButtons(false);
  const n = S.block.trials.length + 1;
  $('counter').textContent = `سطح ${S.levelIdx + 1} از ${LEVELS.length} · کوشش ${n}`;
  setProg((S.levelIdx + Math.min(1, S.block.trials.length / 40)) / LEVELS.length);
  // first interval, gap, second interval — the seam is in the first one if seamLeft
  const first = buildInterval(stim, stim.seamLeft), second = buildInterval(stim, !stim.seamLeft);
  $('prompt').textContent = 'بازهٔ ۱';
  setField(first); await sleep(INTERVAL_MS);
  setField(null); $('prompt').textContent = '…'; await sleep(GAP_MS);
  $('prompt').textContent = 'بازهٔ ۲';
  setField(second); await sleep(INTERVAL_MS);
  setField(null);
  $('prompt').textContent = 'کدام بازه درز داشت؟';
  busy = false; setButtons(true);
}
function setButtons(on) { $('btn-left').disabled = !on; $('btn-right').disabled = !on; }

function startLevel() {
  const bL = LEVELS[S.levelIdx];
  document.body.style.background = oklchToHex(bL);   // the surround equals the base: no outline cue
  S.block = QCore.makeBlock(levelCandidates(bL), catchFor(bL), rnd);
  S.bL = bL;
  show('s-test');
  nextTrial();
}

function answer(choseLeft) {
  if (!S.cur || busy) return;
  S.block.answer(choseLeft);
  S.cur = null;
  nextTrial();
}

function finishLevel() {
  const r = QCore.blockResult(S.block);
  S.results.push({ L: S.bL, ...r });
  S.levelIdx++;
  if (S.levelIdx < LEVELS.length) startLevel();
  else finishAll();
}

function finishAll() {
  setProg(1);
  const allValid = S.results.every((r) => r.valid);
  const qValid = S.results.filter((r) => r.valid).map((r) => r.qBg);
  const qAll = Math.max(...S.results.map((r) => r.qBg));
  const overall = { valid: allValid, qBg: allValid ? +qAll.toFixed(3) : null, qBgIfValid: +qAll.toFixed(3), validLevels: qValid.length };
  const out = {
    schema: 'ui99-battery-v2', at: new Date().toISOString(),
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: { w: screen.width, h: screen.height, dpr: devicePixelRatio },
    protocol: 'PROTOCOL-PERCEPTION-V1 §5 (k=2)',
    levels: S.results, overall,
  };
  const ok = (v) => v ? '<span class="ok">معتبر</span>' : '<span class="bad">نامعتبر</span>';
  $('res-body').innerHTML = S.results.map((r) => `
    <div class="card"><b>سطح L=${r.L}</b> ${ok(r.valid)}<br>
      آستانه (۷۵٪): <b>${r.x75} q</b> · بازه (۱۰–۹۰٪): ${r.lo} … ${r.hi} · q_bg = ${r.qBg}<br>
      کوشش‌های تطبیقی: ${r.adaptive} · کل: ${r.trials} · کنترل: ${r.catchAcc} · دو زنجیره: ${r.replicateA} / ${r.replicateB}
      ${r.reasons.length ? '<br><span class="bad">' + r.reasons.join(' · ') + '</span>' : ''}
    </div>`).join('') +
    `<div class="card"><b>جمع</b> ${ok(overall.valid)}<br>
      ${overall.valid ? `q_bg پیشنهادی (بزرگ‌ترین سطح): <b>${overall.qBg}</b>` : 'هیچ عدد پیشنهادی گزارش نمی‌شود: یک یا چند سطح نامعتبر است و باید دوباره اجرا شود.'}</div>`;
  $('res-json').value = JSON.stringify(out);
  try { localStorage.setItem('ui99-battery-v2-last', JSON.stringify(out)); } catch (e) { /* storage blocked: the JSON box still has it */ }
  show('s-res');
}

$('btn-start').onclick = () => { S.levelIdx = 0; S.results = []; S.started = Date.now(); startLevel(); };
$('btn-left').onclick = () => answer(true);
$('btn-right').onclick = () => answer(false);
$('btn-restart').onclick = () => { show('s-intro'); };
$('btn-copy').onclick = () => { $('res-json').select(); navigator.clipboard?.writeText($('res-json').value); };
document.addEventListener('keydown', (e) => {
  if (!S.cur || busy) return;
  if (e.key === 'ArrowLeft') answer(true);
  if (e.key === 'ArrowRight') answer(false);
});
show('s-intro');
