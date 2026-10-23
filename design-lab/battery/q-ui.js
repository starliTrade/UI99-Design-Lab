// ui99-battery-v2 · UI. Uses QCore (logic) and the stimulus helpers. Single file, no network.
const LEVELS = [0.128, 0.1565, 0.1943];   // canvas #060709 and the two levels above it
const F = DITH_F_BASE;
const $ = (id) => document.getElementById(id);
const rnd = Math.random;

function levelCandidates(bL) {
  const pure = pureCandidates().filter((c) => c.bL === bL)
    .map((c) => ({ kind: 'pure', x: c.x, key: 'p:' + c.hex, hex: c.hex, bh: c.bh }));
  const dith = [];
  DITH_PAIRS.forEach((pair, pi) => {
    if (pair.bL !== bL) return;
    for (let t = 0.02; t <= 0.5001; t += 0.02) {
      const x = ditherX(pair, F, F + t);
      dith.push({ kind: 'dith', x: +x.toFixed(3), key: 'd:' + pi + ':' + t.toFixed(2), pi, t: +t.toFixed(2) });
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

function show(id) { ['s-intro', 's-test', 's-res'].forEach((x) => $(x).classList.toggle('hidden', x !== id)); }
function setProg(p) { $('prog').style.width = (Math.max(0, Math.min(1, p)) * 100).toFixed(0) + '%'; }
function wrap(node) { const d = document.createElement('div'); d.className = 'panel'; d.appendChild(node); return d; }

function startLevel() {
  const bL = LEVELS[S.levelIdx];
  S.block = QCore.makeBlock(levelCandidates(bL), catchFor(bL), rnd);
  S.bL = bL;
  show('s-test');
  nextTrial();
}

function nextTrial() {
  const stim = S.block.next();
  if (!stim) return finishLevel();
  S.cur = stim;
  const panels = $('panels');
  panels.innerHTML = '';
  const base = oklchToHex(S.bL);
  let seamNode, plainNode;
  if (stim.kind === 'pure' || stim.kind === 'catch') {
    const seam = document.createElement('div');
    seam.innerHTML = `<div style="height:50%;background:${stim.bh}"></div><div style="height:50%;background:${stim.hex}"></div>`;
    const plain = document.createElement('div');
    plain.innerHTML = `<div style="height:50%;background:${stim.bh}"></div><div style="height:50%;background:${stim.bh}"></div>`;
    seamNode = seam; plainNode = plain;
  } else if (stim.kind === 'dith') {
    const pair = DITH_PAIRS[stim.pi];
    seamNode = ditherPanel(pair, F, F + stim.t);
    plainNode = ditherPanel(pair, F, F);
  } else { // null: two identical plain panels
    const a = document.createElement('div');
    a.innerHTML = `<div style="height:50%;background:${base}"></div><div style="height:50%;background:${base}"></div>`;
    const b = document.createElement('div');
    b.innerHTML = a.innerHTML;
    seamNode = a; plainNode = b;
  }
  const seamP = wrap(seamNode), plainP = wrap(plainNode);
  const [left, right] = stim.seamLeft ? [seamP, plainP] : [plainP, seamP];
  panels.appendChild(left); panels.appendChild(right);
  const n = S.block.trials.length + 1;
  $('counter').textContent = `سطح ${S.levelIdx + 1} از ${LEVELS.length} · کوشش ${n}`;
  setProg((S.levelIdx + Math.min(1, S.block.trials.length / 40)) / LEVELS.length);
}

function answer(choseLeft) {
  if (!S.cur) return;
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
  if (!S.cur) return;
  if (e.key === 'ArrowLeft') answer(true);
  if (e.key === 'ArrowRight') answer(false);
});
show('s-intro');
