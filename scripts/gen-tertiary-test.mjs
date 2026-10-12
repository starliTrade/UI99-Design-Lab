import { writeFileSync } from 'node:fs';
import { apcaMagnitude } from '../src/engine/liminal-contrast.ts';
import { LADDER } from '../src/engine/liminal-ladder.ts';
import { blendAlpha, hexToRgb, whiteAlphaContrastOn, minWhiteAlphaForContrast } from '../src/engine/liminal-color-math.ts';

function apcaOn(bg, a) {
  const c = hexToRgb(bg);
  const t = blendAlpha({ r:255,g:255,b:255 }, c, a);
  const hex = '#' + [t.r,t.g,t.b].map(v=>v.toString(16).padStart(2,'0')).join('');
  return apcaMagnitude(hex, bg);
}
function minApca(bg, target) {
  for (let a=0;a<=1;a+=0.001) if (apcaOn(bg,a) >= target) return Math.round(a*1000)/1000;
  return 1;
}

const S = LADDER[0];
const wcag45 = minWhiteAlphaForContrast(S, 4.5);

// The three candidate tertiary alphas
const VARIANTS = [
  { key:'now',  name:'وضعیت امروز',      note:'آلفای دستی',                       alpha: 0.46 },
  { key:'B',    name:'ب · کف Lc ۶۰',      note:'انحراف آگاهانه ثبت‌شده در قرارداد', alpha: Math.max(wcag45, minApca(S, 60)) },
  { key:'A',    name:'الف · کف Lc ۷۵',    note:'صادقانه‌ترین — هم‌کف با secondary', alpha: Math.max(wcag45, minApca(S, 75)) },
];

// Fixed roles (unchanged in all variants)
const FIXED = [
  { role:'primary',    alpha: Math.max(wcag45, minApca(S, 90)), size:'19px', weight:600, sample:'سطح تصمیم‌گیری' },
  { role:'secondary',  alpha: Math.max(wcag45, minApca(S, 75)), size:'14px', weight:400, sample:'متن بدنه در این سلسله‌مراتب قرار می‌گیرد و باید راحت خوانده شود.' },
  { role:'quaternary', alpha: Math.max(minWhiteAlphaForContrast(S,3), minApca(S, 30)), size:'11px', weight:500, sample:'METADATA · ۱۲ مورد' },
];

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

let cols = '';
for (const v of VARIANTS) {
  const lc = apcaOn(S, v.alpha);
  const w  = whiteAlphaContrastOn(S, v.alpha);
  let rows = '';
  // primary
  const p = FIXED[0];
  rows += `<div class="row"><div class="lbl">primary · ${p.size} / ${p.weight}</div>
    <div style="font-size:${p.size};font-weight:${p.weight};line-height:1.35;color:rgba(255,255,255,${p.alpha})">${esc(p.sample)}</div>
    <div class="m">α=${p.alpha.toFixed(3)} · WCAG ${whiteAlphaContrastOn(S,p.alpha).toFixed(1)} · Lc ${apcaOn(S,p.alpha).toFixed(0)}</div></div>`;
  // secondary — varies only in variant A (same floor 75)
  const secA = Math.max(wcag45, minApca(S,75));
  rows += `<div class="row"><div class="lbl">secondary · 14px / 400</div>
    <div style="font-size:14px;font-weight:400;line-height:1.7;color:rgba(255,255,255,${secA})">${esc(FIXED[1].sample)}</div>
    <div class="m">α=${secA.toFixed(3)} · WCAG ${whiteAlphaContrastOn(S,secA).toFixed(1)} · Lc ${apcaOn(S,secA).toFixed(0)}</div></div>`;
  // TERTIARY — the variable
  const terSample = 'توضیح فرعی، برچسب ستون جدول، و کپشن تصویر.';
  rows += `<div class="row hl"><div class="lbl">tertiary · 12.5px / 500  ← متغیر</div>
    <div style="font-size:12.5px;font-weight:500;line-height:1.6;color:rgba(255,255,255,${v.alpha})">${esc(terSample)}</div>
    <div class="m">α=${v.alpha.toFixed(3)} · WCAG ${w.toFixed(2)} · <b>Lc ${lc.toFixed(1)}</b></div></div>`;
  // quaternary
  const q = FIXED[2];
  rows += `<div class="row"><div class="lbl">quaternary · ${q.size} / ${q.weight}</div>
    <div style="font-size:${q.size};font-weight:${q.weight};color:rgba(255,255,255,${q.alpha})">${esc(q.sample)}</div>
    <div class="m">α=${q.alpha.toFixed(3)} · WCAG ${whiteAlphaContrastOn(S,q.alpha).toFixed(1)} · Lc ${apcaOn(S,q.alpha).toFixed(0)}</div></div>`;
  // hierarchy width
  const alphas = [p.alpha, secA, v.alpha, q.alpha];
  const spread = alphas[0] - alphas[3];
  const secTerGap = secA - v.alpha;
  cols += `<div class="col ${v.key==='A'?'rec':''}">
    <h2>${esc(v.name)}<small>${esc(v.note)}</small></h2>
    <div class="body">${rows}</div>
    <div class="foot">
      <div>گستره سلسله‌مراتب: <b>${spread.toFixed(3)}</b></div>
      <div>فاصله secondary↔tertiary: <b>${secTerGap.toFixed(3)}</b>${secTerGap < 0.01 ? ' ← <span class="warn">یکسان</span>' : ''}</div>
    </div></div>`;
}

const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LIMINAL · تست چشمی tertiary</title><style>
body{margin:0;background:#060709;color:rgba(255,255,255,.88);
font:14px/1.7 ui-sans-serif,system-ui,"Segoe UI",Tahoma,sans-serif;padding:28px 20px 70px}
h1{font-size:20px;font-weight:600;margin:0 0 6px}
.sub{color:rgba(255,255,255,.5);font-size:12.5px;margin:0 0 26px;max-width:80ch}
.grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.col{border:1px solid rgba(255,255,255,.08);border-radius:10px;background:#07090b;overflow:hidden}
.col.rec{border-color:rgba(255,255,255,.26)}
.col h2{font-size:12.5px;font-weight:600;margin:0;padding:11px 13px;border-bottom:1px solid rgba(255,255,255,.08);
display:flex;flex-direction:column;gap:3px}
.col h2 small{font-weight:400;color:rgba(255,255,255,.42);font-size:11px}
.body{padding:14px 13px}
.row{padding:11px 0;border-bottom:1px solid rgba(255,255,255,.05)}
.row:last-child{border-bottom:0}
.row.hl{background:rgba(255,255,255,.028);margin:0 -13px;padding:11px 13px}
.lbl{font-size:9.5px;font-family:ui-monospace,monospace;color:rgba(255,255,255,.3);margin-bottom:5px;letter-spacing:.03em}
.m{font-size:9.5px;font-family:ui-monospace,monospace;color:rgba(255,255,255,.34);margin-top:5px}
.m b{color:rgba(255,255,255,.7)}
.foot{padding:10px 13px;border-top:1px solid rgba(255,255,255,.08);font-size:11px;
color:rgba(255,255,255,.5);font-family:ui-monospace,monospace;display:flex;flex-direction:column;gap:3px}
.foot b{color:rgba(255,255,255,.8)}
.warn{color:#e0b25e}
</style></head><body>
<h1>تست چشمی — کف کنتراست tertiary</h1>
<p class="sub">هر سه ستون یکسان‌اند جز آلفای <b>tertiary</b>. متن‌ها با اندازه و وزن واقعی LIMINAL رندر شده‌اند
(heading ۱۹px/۶۰۰ · body ۱۴px/۴۰۰ · caption ۱۲.۵px/۵۰۰ · mark ۱۱px/۵۰۰) روی سطح S0.
زیر هر نمونه: آلفا، نسبت WCAG، و Lc. ستون «الف» کف صادقانه است؛ «ب» انحراف آگاهانه.</p>
<div class="grid">${cols}</div>
</body></html>`;

writeFileSync('design-lab/tertiary-test.html', html);
console.log('wrote design-lab/tertiary-test.html');
console.log('\nALPHAS:');
for (const v of VARIANTS) console.log(`  ${v.key.padEnd(4)} a=${v.alpha.toFixed(3)}  Lc=${apcaOn(S,v.alpha).toFixed(1)}  WCAG=${whiteAlphaContrastOn(S,v.alpha).toFixed(2)}`);
console.log(`  WCAG 4.5 floor alpha = ${wcag45.toFixed(3)}`);
