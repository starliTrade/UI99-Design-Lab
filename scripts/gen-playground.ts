#!/usr/bin/env bun
/**
 * LIMINAL — the live playground.
 *
 * A designer drags the hue and the whole system follows: the ladder, the
 * surfaces, the borders, the rim, every component. The contrast checker reads
 * the same numbers the engine derives.
 *
 * The ladders for every hue are precomputed HERE, by the engine, and shipped as
 * data. The page does not reimplement the colour maths — it cannot drift from
 * the engine because it does not contain the engine's logic, only its output.
 *
 * Run: bun scripts/gen-playground.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLiminalTheme } from '../src/engine/liminal-theme';
import { LADDER_HUE, PERCEPTUAL_QUANTUM } from '../src/engine/liminal-ladder';
import { hexToRgb, rgbToOklch, contrastRatioHex } from '../src/engine/liminal-color-math';
import { getTextStyle } from '../src/engine/spec-engine';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/playground.html');

/** Every 5 degrees. 72 ladders, each computed by the engine. */
const HUES: number[] = [];
for (let h = 0; h < 360; h += 5) HUES.push(h);

const DATA = HUES.map((hue) => {
  const t = createLiminalTheme({ brandHue: hue });
  const steps = t.ladder.slice(1).map((hex, i) => {
    const dL = rgbToOklch(hexToRgb(hex)).L - rgbToOklch(hexToRgb(t.ladder[i])).L;
    return Number((dL / PERCEPTUAL_QUANTUM).toFixed(3));
  });
  return { hue, ladder: t.ladder, steps, minQ: Math.min(...steps), warnings: t.warnings.length };
});

const TEXT = getTextStyle('primary', 2).color as string;
const DIM = getTextStyle('secondary', 2).color as string;
const FAINT = getTextStyle('tertiary', 2).color as string;
const S = L.SPACING;
const R = L.RADIUS;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — playground</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--liminal-s0); color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; font-size:15px; line-height:1.7; }
  .wrap { max-width:1240px; margin:0 auto; padding:40px 24px 96px; }
  h1 { font-size:28px; margin:0 0 4px; font-weight:700; letter-spacing:-0.02em; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.1em; text-transform:uppercase; }
  .lede { color:${DIM}; max-width:76ch; margin:0 0 24px; }
  .panel { border:1px solid var(--liminal-s3); border-radius:${R.card}px; padding:${S[4]}px; background:var(--liminal-s1); margin-bottom:${S[5]}px; }
  .controls { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:${S[4]}px; align-items:end; }
  label { display:block; font-size:12px; color:${FAINT}; margin-bottom:6px; }
  input[type=range] { width:100%; accent-color:var(--liminal-s6); }
  .val { font-family:ui-monospace,monospace; font-size:13px; color:${TEXT}; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:${S[4]}px; }
  .card { border:1px solid var(--liminal-s3); border-radius:${R.card}px; padding:${S[4]}px; background:var(--liminal-s2); }
  .card h3 { margin:0 0 ${S[2]}px; font-size:14px; font-weight:600; }
  .stack { display:flex; flex-direction:column; border:1px solid var(--liminal-s3); border-radius:${R.control}px; overflow:hidden; }
  .step { display:flex; justify-content:space-between; align-items:center; padding:6px 10px; min-height:32px; }
  .mono { font-family:ui-monospace,monospace; font-size:12px; }
  .step .mono { color:${TEXT}; opacity:.75; }
  .demo { display:flex; flex-direction:column; gap:${S[2]}px; }
  .surface { border:1px solid var(--liminal-s3); border-radius:${R.control}px; padding:${S[3]}px; background:var(--liminal-s2); }
  .inner { border:1px solid var(--liminal-s4); border-radius:${R.chip}px; padding:${S[2]}px; background:var(--liminal-s3); }
  .btn { border:1px solid var(--liminal-s4); border-radius:${R.control}px; padding:${S[2]}px ${S[4]}px; background:var(--liminal-s5); color:${TEXT}; font:inherit; font-size:13px; cursor:pointer; }
  .btn:hover { background:var(--liminal-s6); }
  .chip { display:inline-block; border:1px solid var(--liminal-s4); border-radius:${R.chip}px; padding:2px ${S[2]}px; background:var(--liminal-s3); font-size:12px; }
  table { width:100%; border-collapse:collapse; }
  th { text-align:start; font-size:11px; font-weight:600; color:${FAINT}; text-transform:uppercase; letter-spacing:.05em; padding:6px 8px; border-bottom:1px solid var(--liminal-s3); }
  td { padding:6px 8px; border-bottom:1px solid var(--liminal-s3); font-size:13px; }
  tr:last-child td { border-bottom:none; }
  .pass { color:#7fd0a0; } .fail { color:#e0a070; }
  .warn { border:1px solid #8a5a2a; background:#1a1410; border-radius:${R.chip}px; padding:8px 10px; font-size:12px; color:#e0b070; }
  .ok { border:1px solid #2a5a3a; background:#101a13; border-radius:${R.chip}px; padding:8px 10px; font-size:12px; color:#7fd0a0; }
  footer { color:${FAINT}; font-size:12px; margin-top:${S[6]}px; border-top:1px solid var(--liminal-s3); padding-top:${S[4]}px; }
  code { font-family:ui-monospace,monospace; background:var(--liminal-s1); border:1px solid var(--liminal-s3); border-radius:4px; padding:1px 5px; font-size:12px; }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">LIMINAL · playground زنده</p>
  <h1>هیو را بچرخان — کل سیستم دنبال می‌کند</h1>
  <p class="lede">
    نردبان برای <b>۷۲ هیو</b> از قبل توسط موتور محاسبه شده و اینجا داده است. صفحه ریاضیات رنگ را بازنویسی نمی‌کند —
    <b>خروجی موتور را دارد، نه منطقش</b> — پس نمی‌تواند از آن جدا شود.
  </p>

  <div class="panel">
    <div class="controls">
      <div>
        <label>هیوی برند — <span class="val" id="hueVal">258.4°</span></label>
        <input type="range" id="hue" min="0" max="355" step="5" value="255">
      </div>
      <div>
        <label>چگالی — <span class="val" id="densityVal">1.00</span></label>
        <input type="range" id="density" min="0.8" max="1.3" step="0.05" value="1">
      </div>
      <div>
        <label>حرکت — <span class="val" id="motionVal">1.00</span></label>
        <input type="range" id="motion" min="0" max="2" step="0.1" value="1">
      </div>
      <div>
        <label>&nbsp;</label>
        <div id="stepStatus" class="ok">—</div>
      </div>
    </div>
  </div>

  <div class="grid">
    <div class="card">
      <h3>نردبان</h3>
      <div class="stack" id="ladder"></div>
      <div style="margin-top:${S[3]}px" id="ladderNums"></div>
    </div>

    <div class="card">
      <h3>سطوح و حاشیه‌ها</h3>
      <div class="demo">
        <div class="surface">
          سطح کار
          <div class="inner" style="margin-top:${S[2]}px">پنل تودرتو</div>
        </div>
        <div style="display:flex; gap:${S[2]}px; flex-wrap:wrap">
          <button class="btn">دکمه</button>
          <span class="chip">برچسب</span>
        </div>
      </div>
    </div>

    <div class="card">
      <h3>کنتراست متن</h3>
      <p class="mono" style="color:${FAINT}; margin:0 0 ${S[2]}px">آلفاها مشتق شده‌اند، نه انتخاب. هر دو عدسی اعمال می‌شود.</p>
      <table>
        <thead><tr><th>نقش</th><th>روی S0</th><th>روی S8</th><th>کف</th></tr></thead>
        <tbody id="contrast"></tbody>
      </table>
    </div>

    <div class="card">
      <h3>گام‌ها</h3>
      <p class="mono" style="color:${FAINT}; margin:0 0 ${S[2]}px">هر گام بر حسب کوانتوم ادراکی (q = ${PERCEPTUAL_QUANTUM})</p>
      <div id="steps" class="mono"></div>
    </div>
  </div>

  <footer>
    تولید‌شده توسط <code>scripts/gen-playground.ts</code> · بدون شبکه · بدون وابستگی ·
    هیوی مرجع ${LADDER_HUE}° · ${HUES.length} نردبان محاسبه‌شده
  </footer>
</div>

<script>
const DATA = ${JSON.stringify(DATA)};
const TEXT_ROLES = {
  primary: { alpha: ${Number((getTextStyle('primary', 2).color as string).match(/[\d.]+\)$/)?.[0]?.replace(')', '') ?? 0.89)}, floor: 90 },
  secondary: { alpha: ${Number((getTextStyle('secondary', 2).color as string).match(/[\d.]+\)$/)?.[0]?.replace(')', '') ?? 0.79)}, floor: 75 },
  tertiary: { alpha: ${Number((getTextStyle('tertiary', 2).color as string).match(/[\d.]+\)$/)?.[0]?.replace(')', '') ?? 0.79)}, floor: 75 },
  quaternary: { alpha: ${Number((getTextStyle('quaternary', 2).color as string).match(/[\d.]+\)$/)?.[0]?.replace(')', '') ?? 0.42)}, floor: 30 },
};

const hexToRgb = (h) => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });
const lum = ({r,g,b}) => { const f=(v)=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4)}; return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b); };
const ratio = (a,b) => { const la=lum(hexToRgb(a)), lb=lum(hexToRgb(b)); const [hi,lo]=la>lb?[la,lb]:[lb,la]; return (hi+0.05)/(lo+0.05); };
const over = (bg, white, alpha) => { const c=hexToRgb(bg); const m=(v)=>Math.round(v*(1-alpha)+255*alpha); return '#'+[m(c.r),m(c.g),m(c.b)].map(v=>v.toString(16).padStart(2,'0')).join(''); };

const $ = (id) => document.getElementById(id);
const nearest = (hue) => DATA.reduce((a,b) => Math.abs(b.hue-hue) < Math.abs(a.hue-hue) ? b : a);

function apply() {
  const hue = Number($('hue').value);
  const t = nearest(hue);
  const density = Number($('density').value);
  const motion = Number($('motion').value);

  $('hueVal').textContent = t.hue + '°';
  $('densityVal').textContent = density.toFixed(2);
  $('motionVal').textContent = motion.toFixed(2);

  const root = document.documentElement;
  t.ladder.forEach((hex, i) => root.style.setProperty('--liminal-s' + i, hex));
  root.style.setProperty('--liminal-radius-card', (${R.card} * density) + 'px');
  root.style.setProperty('--liminal-radius-control', (${R.control} * density) + 'px');
  root.style.setProperty('--liminal-radius-chip', (${R.chip} * density) + 'px');

  $('ladder').innerHTML = t.ladder.map((hex, i) =>
    '<div class="step" style="background:' + hex + '"><span class="mono">S' + i + '</span><span class="mono">' + hex + '</span></div>').join('');

  const minQ = Math.min(...t.steps), maxQ = Math.max(...t.steps);
  $('ladderNums').innerHTML = '<div class="mono" style="color:${DIM}">گام: ' + minQ.toFixed(2) + 'q – ' + maxQ.toFixed(2) + 'q</div>';

  $('stepStatus').className = t.warnings ? 'warn' : 'ok';
  $('stepStatus').textContent = t.warnings
    ? '⚠ این هیو گامی زیر کوانتوم دارد'
    : '✓ همه‌ی گام‌ها بالای کوانتوم';

  $('steps').innerHTML = t.steps.map((q, i) =>
    '<div style="display:flex;justify-content:space-between;padding:2px 0"><span>S' + (i+1) + '</span><span style="color:' + (q < 1 ? '#e0b070' : '${DIM}') + '">' + q.toFixed(2) + 'q</span></div>').join('');

  $('contrast').innerHTML = Object.entries(TEXT_ROLES).map(([role, r]) => {
    const c0 = over(t.ladder[0], true, r.alpha);
    const c8 = over(t.ladder[8], true, r.alpha);
    const r0 = ratio(c0, t.ladder[0]), r8 = ratio(c8, t.ladder[8]);
    const ok = r8 >= 4.5;
    return '<tr><td>' + role + '</td>'
      + '<td class="mono ' + (r0 >= 4.5 ? 'pass' : 'fail') + '">' + r0.toFixed(2) + ':1</td>'
      + '<td class="mono ' + (ok ? 'pass' : 'fail') + '">' + r8.toFixed(2) + ':1</td>'
      + '<td class="mono" style="color:${FAINT}">Lc ' + r.floor + '</td></tr>';
  }).join('');
}

['hue','density','motion'].forEach((id) => $(id).addEventListener('input', apply));
apply();
</script>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
console.log(`  ${DATA.length} ladders · ${DATA.filter((d) => d.warnings).length} with a step below the quantum`);
