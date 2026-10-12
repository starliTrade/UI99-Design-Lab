#!/usr/bin/env bun
/**
 * LIMINAL — Badge: C vs D vs E, under audit.
 *
 * All three keep colour OFF the surface. The question is how each one carries
 * meaning, and what each one costs:
 *
 *   C  colour in the TEXT only          — survives nothing but full colour vision
 *   D  a 3px bar on the leading edge    — the pattern the toast already uses
 *   E  a 5px dot before the label       — the same idea, smaller
 *
 * This page measures rather than asserts. Run: bun scripts/gen-badge-final.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LiminalColorEngine } from '../src/engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../src/engine/liminal-layout-engine';
import { getLadderColor } from '../src/engine/spec-engine';
import { contrastRatioHex, hexToRgb } from '../src/engine/liminal-color-math';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/badge-final.html');

const SEM: any = LiminalColorEngine.SEMANTICS;
const L = LiminalLayoutEngine;
const KEYS = ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const;
const FA: Record<string, string> = { SUCCESS: 'فعال', WARNING: 'هشدار', DANGER: 'خطا', INFO: 'اطلاع' };
const EN: Record<string, string> = { SUCCESS: 'Active', WARNING: 'Warning', DANGER: 'Error', INFO: 'Info' };

const canvas = getLadderColor(0);
const work = getLadderColor(2);
const menu = getLadderColor(5);
const TEXT = 'rgba(233,236,242,0.92)';
const DIM = 'rgba(233,236,242,0.55)';
const FAINT = 'rgba(233,236,242,0.28)';
const LINE = 'rgba(233,236,242,0.10)';

const rgba = (hex: string, a: number) => { const { r, g, b } = hexToRgb(hex); return `rgba(${r}, ${g}, ${b}, ${a})`; };
const host = 2;
const SURF = getLadderColor(host + 1);
const HAIRLINE = getLadderColor(host + 1.5);

const GEOM = (fs: number) => `
  display:inline-flex; align-items:center; gap:6px;
  border-radius:${L.RADIUS.full}px;
  font-size:${fs}px; letter-spacing:${L.TYPOGRAPHY[1].ls};
  font-weight:${L.TYPOGRAPHY[2].weight};
  padding:3px 10px; line-height:1.45; white-space:nowrap;
  background:${SURF}; border:1px solid ${HAIRLINE};
`;

const CAND = {
  C: (k: string, label: string, fs = 11) => `<span class="badge" style="${GEOM(fs)}color:${SEM[k].text}">${label}</span>`,
  D: (k: string, label: string, fs = 11) => `<span class="badge" style="${GEOM(fs)}color:${TEXT}"><i class="bar" style="background:${SEM[k].text}"></i>${label}</span>`,
  E: (k: string, label: string, fs = 11) => `<span class="badge" style="${GEOM(fs)}color:${TEXT}"><i class="dot" style="background:${SEM[k].text}"></i>${label}</span>`,
};
const GLYPH: Record<string, string> = { SUCCESS: '✓', WARNING: '!', DANGER: '×', INFO: 'i' };

const CAND2 = {
  Dg: (k: string, label: string, fs = 11) => `<span class="badge" style="${GEOM(fs)}color:${TEXT}"><i class="bar" style="background:${SEM[k].text}"></i><b class="glyph">${GLYPH[k]}</b>${label}</span>`,
  Eg: (k: string, label: string, fs = 11) => `<span class="badge" style="${GEOM(fs)}color:${TEXT}"><i class="dot" style="background:${SEM[k].text}"></i><b class="glyph">${GLYPH[k]}</b>${label}</span>`,
  G: (k: string, label: string, fs = 11) => `<span class="badge" style="${GEOM(fs)}color:${TEXT}"><b class="glyph" style="color:${SEM[k].text}">${GLYPH[k]}</b>${label}</span>`,
};
const NAMES: Record<string, string> = { C: 'رنگ در متن', D: 'نوار لهجه', E: 'نقطه' };
const NAMES2: Record<string, string> = {
  Dg: 'نوار + گلیف', Eg: 'نقطه + گلیف', G: 'گلیف تنها',
};

const strip2 = (id: string, bg: string, lang: 'en' | 'fa' = 'en', fs = 11) =>
  `<div class="strip" style="background:${bg}" ${lang === 'fa' ? 'dir="rtl"' : ''}>
     ${KEYS.map((k) => (CAND2 as any)[id](k, lang === 'fa' ? FA[k] : EN[k], fs)).join('')}
   </div>`;

// ── measurements, not claims ────────────────────────────────────────────────
const textContrast = (k: string) => contrastRatioHex(SEM[k].text, SURF);
const markContrast = (k: string) => contrastRatioHex(SEM[k].text, SURF);
const neutralContrast = contrastRatioHex('#E9ECF2', SURF);

const cvd = [
  { id: 'protanopia', label: 'پروتانوپیا (بدون قرمز)', m: '0.567 0.433 0 0 0  0.558 0.442 0 0 0  0 0.242 0.758 0 0  0 0 0 1 0' },
  { id: 'deuteranopia', label: 'دوترانوپیا (بدون سبز)', m: '0.625 0.375 0 0 0  0.7 0.3 0 0 0  0 0.3 0.7 0 0  0 0 0 1 0' },
  { id: 'tritanopia', label: 'تریتانوپیا (بدون آبی)', m: '0.95 0.05 0 0 0  0 0.433 0.567 0 0  0 0.475 0.525 0 0  0 0 0 1 0' },
  { id: 'achromatopsia', label: 'بی‌رنگی کامل', m: '0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0.299 0.587 0.114 0 0  0 0 0 1 0' },
];

const strip = (id: string, bg: string, label: string, lang: 'en' | 'fa' = 'en', fs = 11) =>
  `<div class="strip" style="background:${bg}" ${lang === 'fa' ? 'dir="rtl"' : ''}>
     ${KEYS.map((k) => (CAND as any)[id](k, lang === 'fa' ? FA[k] : EN[k], fs)).join('')}
   </div>`;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — ممیزی بج: C · D · E</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${canvas}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size:14px; line-height:1.75; }
  .wrap { max-width:1120px; margin:0 auto; padding:40px 24px 96px; }
  h1 { font-size:25px; margin:0 0 6px; font-weight:700; letter-spacing:-0.02em; }
  h2 { font-size:16px; margin:34px 0 10px; font-weight:600; }
  h3 { font-size:14px; margin:0 0 4px; font-weight:600; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.08em; text-transform:uppercase; }
  .sub { color:${DIM}; margin:0 0 8px; }
  section { border:1px solid ${LINE}; border-radius:14px; padding:18px; margin:0 0 18px; background:rgba(233,236,242,0.012); }
  .strip { border-radius:10px; padding:13px 15px; display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:8px; }
  .badge { color:${TEXT}; }
  .dot { width:5px; height:5px; border-radius:999px; display:inline-block; flex-shrink:0; }
  .bar { width:3px; height:11px; border-radius:2px; display:inline-block; flex-shrink:0; }
  table { width:100%; border-collapse:collapse; font-family:ui-monospace,monospace; font-size:12px; }
  th, td { text-align:right; padding:7px 10px; border-bottom:1px solid ${LINE}; }
  th { color:${FAINT}; font-weight:400; }
  .pass { color:#9ee6b4; } .fail { color:#ffb4b4; }
  .grid3 { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
  @media (max-width:900px){ .grid3 { grid-template-columns:1fr; } }
  .cell { border:1px solid ${LINE}; border-radius:10px; padding:12px; }
  .cell h3 { margin-bottom:8px; color:${DIM}; font-family:ui-monospace,monospace; font-size:11px; }
  .cvd { filter:url(#cvd); }
  .row { display:flex; gap:10px; align-items:center; padding:9px 12px; border-bottom:1px solid ${LINE}; }
  .row:last-child { border-bottom:0; }
  .row .name { flex:1; color:${DIM}; font-size:13px; }
  .dense { display:flex; gap:6px; flex-wrap:wrap; }
  .glyph { font-family:ui-monospace,monospace; font-size:10px; line-height:1; font-weight:700;
    color:${DIM}; display:inline-block; min-width:7px; text-align:center; }
  footer { color:${FAINT}; font-size:12px; margin-top:32px; }
  code { font-family:ui-monospace,monospace; }
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute">
  <filter id="cvd"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"/></filter>
</svg>
<div class="wrap">
  <p class="eyebrow">LIMINAL · ممیزی بج</p>
  <h1>C · D · E — سه کاندیدی که رنگ را روی سطح نمی‌نشانند</h1>
  <p class="sub">هر سه از یک پله‌ی واقعی نردبان به‌عنوان سطح استفاده می‌کنند. تفاوت در این است که <b>معنا را چه چیزی حمل می‌کند</b>.</p>

  <section>
    <h2 style="margin-top:0">۱ — روی سطح کار (S2)، اندازه‌ی واقعی</h2>
    <div class="grid3">
      ${['C', 'D', 'E'].map((id) => `<div class="cell"><h3>${id} — ${NAMES[id]}</h3>${strip(id, SURF, '')}</div>`).join('')}
    </div>
    <h2>همان‌ها در فارسی و RTL</h2>
    <div class="grid3">
      ${['C', 'D', 'E'].map((id) => `<div class="cell"><h3>${id}</h3>${strip(id, SURF, '', 'fa')}</div>`).join('')}
    </div>
    <p class="sub" style="margin:10px 0 0">D و E نشانگر را به‌عنوان <code>flex child</code> می‌گذارند، پس در RTL خودشان به لبه‌ی راست می‌روند. C چیزی برای چرخاندن ندارد.</p>
  </section>

  <section>
    <h2 style="margin-top:0">۲ — کوررنگی</h2>
    <p class="sub">این محورِ تعیین‌کننده است. C معنا را <b>فقط</b> با رنگ حمل می‌کند؛ D و E با <b>شکل و جایگاه</b> به‌علاوه‌ی رنگ.</p>
    ${cvd.map((c) => `
      <h3 style="margin-top:14px; color:${DIM}">${c.label}</h3>
      <div style="filter:url(#f-${c.id})">
        <svg width="0" height="0" style="position:absolute"><filter id="f-${c.id}"><feColorMatrix type="matrix" values="${c.m}"/></filter></svg>
        <div class="grid3">
          ${['C', 'D', 'E'].map((id) => `<div class="cell"><h3>${id}</h3>${strip(id, SURF, '')}</div>`).join('')}
        </div>
      </div>`).join('')}
  </section>

  <section>
    <h2 style="margin-top:0">۲ب — با گلیف: کوررنگی دیگر معنا را از بین نمی‌برد</h2>
    <p class="sub">
      نتیجه‌ی بخش ۲ این است که <b>هیچ‌کدام از C، D، E از کوررنگی جان سالم به‌در نمی‌برند</b> — چون در هر سه،
      <b>رنگ تنها حامل معناست</b>. در بی‌رنگی کامل، C کاملاً یکسان می‌شود و D/E فقط یک نشانگر خاکستری می‌مانند
      که نمی‌گوید کدام.
      <br><br>
      ولی قاعده‌ی خودِ لیمینال جواب را از قبل داده بود: <i>«معنا از آیکون + نشانگر می‌آید، نه از رنگ.»</i>
      پس یک لایه اضافه می‌کنیم: <b>گلیف</b> می‌گوید <b>کدام</b>، نشانگر می‌گوید <b>که</b>.
    </p>
    ${cvd.filter((c) => c.id === 'achromatopsia' || c.id === 'deuteranopia').map((c) => `
      <h3 style="margin-top:14px; color:${DIM}">${c.label}</h3>
      <div style="filter:url(#g-${c.id})">
        <svg width="0" height="0" style="position:absolute"><filter id="g-${c.id}"><feColorMatrix type="matrix" values="${c.m}"/></filter></svg>
        <div class="grid3">
          ${['Dg', 'Eg', 'G'].map((id) => `<div class="cell"><h3>${id} — ${NAMES2[id]}</h3>${strip2(id, SURF)}</div>`).join('')}
        </div>
      </div>`).join('')}
    <h3 style="margin-top:18px; color:${DIM}">رنگ عادی، فارسی</h3>
    <div class="grid3">
      ${['Dg', 'Eg', 'G'].map((id) => `<div class="cell"><h3>${id}</h3>${strip2(id, SURF, 'fa')}</div>`).join('')}
    </div>
  </section>

  <section>
    <h2 style="margin-top:0">۳ — در بافت واقعی</h2>
    <div class="grid3">
      ${['C', 'D', 'E'].map((id) => `
        <div class="cell"><h3>${id} — در یک ردیف جدول</h3>
          <div class="row"><span class="name">api-gateway</span>${(CAND as any)[id]('SUCCESS', 'فعال')}</div>
          <div class="row"><span class="name">billing-worker</span>${(CAND as any)[id]('WARNING', 'هشدار')}</div>
          <div class="row"><span class="name">legacy-auth</span>${(CAND as any)[id]('DANGER', 'خطا')}</div>
          <div class="row"><span class="name">metrics-sink</span>${(CAND as any)[id]('INFO', 'اطلاع')}</div>
        </div>`).join('')}
    </div>
    <h2>همان ردیف، با G و Eg</h2>
    <div class="grid3">
      ${['G', 'Eg', 'Dg'].map((id) => `
        <div class="cell"><h3>${id} — ${NAMES2[id] ?? NAMES[id]}</h3>
          <div class="row"><span class="name">api-gateway</span>${(CAND2 as any)[id]('SUCCESS', 'فعال')}</div>
          <div class="row"><span class="name">billing-worker</span>${(CAND2 as any)[id]('WARNING', 'هشدار')}</div>
          <div class="row"><span class="name">legacy-auth</span>${(CAND2 as any)[id]('DANGER', 'خطا')}</div>
          <div class="row"><span class="name">metrics-sink</span>${(CAND2 as any)[id]('INFO', 'اطلاع')}</div>
        </div>`).join('')}
    </div>
    <h2>چگالی — هشت بج پشت سر هم</h2>
    <div class="grid3">
      ${['C', 'D', 'E', 'G', 'Eg'].map((id) => `<div class="cell"><h3>${id}</h3><div class="dense">${
        ['SUCCESS','WARNING','DANGER','INFO','SUCCESS','WARNING','DANGER','INFO']
          .map((k) => ((CAND as any)[id] ?? (CAND2 as any)[id])(k, 'فعال')).join('')}</div></div>`).join('')}
    </div>
  </section>

  <section>
    <h2 style="margin-top:0">۴ — اندازه‌ها</h2>
    <div class="grid3">
      ${['C', 'D', 'E'].map((id) => `<div class="cell"><h3>${id}</h3>
        ${[11, 13, 15].map((fs) => `<div style="margin-bottom:8px">${strip(id, SURF, '', 'fa', fs)}</div>`).join('')}
      </div>`).join('')}
    </div>
  </section>

  <section>
    <h2 style="margin-top:0">۵ — اندازه‌گیری‌ها</h2>
    <table>
      <thead><tr><th>معنا</th><th>متن رنگی (C)</th><th>نشانگر (D/E)</th><th>متن خنثی (D/E)</th><th>آستانه</th></tr></thead>
      <tbody>
        ${KEYS.map((k) => {
          const t = textContrast(k), m = markContrast(k);
          return `<tr><td>${k}</td>
            <td class="${t >= 4.5 ? 'pass' : 'fail'}">${t.toFixed(2)}:1</td>
            <td class="${m >= 3 ? 'pass' : 'fail'}">${m.toFixed(2)}:1</td>
            <td class="${neutralContrast >= 4.5 ? 'pass' : 'fail'}">${neutralContrast.toFixed(2)}:1</td>
            <td style="color:${FAINT}">متن ≥۴.۵ · نشانگر ≥۳</td></tr>`;
        }).join('')}
      </tbody>
    </table>
    <p class="sub" style="margin:12px 0 0">
      سطح بج: <code>LADDER[${host + 1}] = ${SURF}</code> · حاشیه: <code>LADDER[${host + 1.5}] = ${HAIRLINE}</code>
    </p>
  </section>

  <footer>
    تولید‌شده توسط <code>scripts/gen-badge-final.ts</code> · بدون شبکه · همه‌ی رنگ‌ها از موتور
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
console.log('neutral text on the badge surface:', neutralContrast.toFixed(2) + ':1');
