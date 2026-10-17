#!/usr/bin/env bun
/**
 * LIMINAL — Tag: an eye test before a formula.
 *
 * Tag is Badge's sibling but not its twin. Badge carries a STATUS, so it needs
 * a glyph that survives colour blindness. Tag carries a CATEGORY, and the label
 * itself says which one — the hue is decoration, not information.
 *
 * What Tag shares with the old Badge is the derivation debt:
 *
 *   background  SURFACE_TINT.subtle — a white overlay, on no scale
 *   border      '1px solid rgba(255,255,255,0.06)' — a raw literal that the
 *               lint rule's /^rgba?\(/ anchor misses, because the string starts
 *               with "1px"
 *   padding     '4px 10px' — 10 is on no spacing step
 *   fontSize    TYPOGRAPHY[1].fs — a static px, so it ignores the fluid base
 *
 * Five candidates. Run: bun scripts/gen-tag-test.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LiminalColorEngine } from '../src/engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../src/engine/liminal-layout-engine';
import { SURFACE_TINT, getLadderColor, getTextStyle } from '../src/engine/spec-engine';
import { resolveSurface, resolveBorder } from '../src/engine/liminal-surface';
import { contrastRatioHex } from '../src/engine/liminal-color-math';
import { apcaMagnitude } from '../src/engine/liminal-contrast';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/tag-test.html');

const SP: any = LiminalColorEngine.EXTENDED_SPECTRUM;
const L = LiminalLayoutEngine;
const S = L.SPACING;
const HOST = 2;
const work = getLadderColor(HOST);

const canvas = getLadderColor(0);
const TEXT = 'rgba(233,236,242,0.92)';
const DIM = 'rgba(233,236,242,0.55)';
const FAINT = 'rgba(233,236,242,0.28)';
const LINE = 'rgba(233,236,242,0.10)';

const surface = resolveSurface({ role: 'control', on: 'work' }).background;
const rim = resolveBorder({ role: 'control', kind: 'separator', on: 'work' });
const label = getTextStyle('primary', HOST + 1).color;

/** The geometry every candidate shares — derived, so only colour is in question. */
const GEOM = `
  display:inline-flex; align-items:center; gap:${S[1]}px;
  border-radius:${L.RADIUS.chip}px;
  font-size:${L.TYPOGRAPHY[1].fs}px; letter-spacing:${L.TYPOGRAPHY[1].ls};
  font-weight:${L.TYPOGRAPHY[2].weight};
  padding:${S[1]}px ${S[3]}px; line-height:1.45; white-space:nowrap;
`;

interface Candidate { id: string; name: string; why: string; rule: string; style: (hex: string) => string }

const CANDIDATES: Candidate[] = [
  {
    id: 'A', name: 'امروز — سطح سفید، حاشیه‌ی خام',
    why: 'سطح یک overlay سفید است نه پله‌ی نردبان، حاشیه یک literal خام است که از قاعده‌ی lint رد می‌شود، و padding عدد ۱۰ دارد که روی هیچ پله‌ای نیست.',
    rule: 'bg = SURFACE_TINT.subtle · border = rgba(255,255,255,0.06) · color = hue',
    style: (hex) => `background:${SURFACE_TINT.subtle}; border:1px solid rgba(255,255,255,0.06); color:${hex};`,
  },
  {
    id: 'B', name: 'سطح از نردبان',
    why: 'همان تیماری که بج گرفت: سطح یک پله بالای میزبان، حاشیه نیم پله. رنگ هنوز فقط در متن.',
    rule: 'bg = LADDER[host+1] · border = LADDER[host+1.5] · color = hue',
    style: (hex) => `background:${surface}; border:1px solid ${rim}; color:${hex};`,
  },
  {
    id: 'C', name: 'سطح از هیو رنگ می‌گیرد',
    why: 'برچسب یک تراشه‌ی رنگی است، پس سطح هم رنگ می‌گیرد. پررنگ‌ترین گزینه — سؤال این است که آیا لیمینال است.',
    rule: 'bg = color-mix(LADDER[host+1] 88%, hue 12%) · border = hue @ 0.30 · color = hue',
    style: (hex) => `background:color-mix(in oklab, ${surface} 88%, ${hex} 12%); border:1px solid color-mix(in oklab, ${rim} 70%, ${hex} 30%); color:${hex};`,
  },
  {
    id: 'D', name: 'لبه‌ی رنگی',
    why: 'رنگ روی «لبه» می‌نشیند نه روی سطح — همان منطق میست. سطح از نردبان می‌آید.',
    rule: 'bg = LADDER[host+1] · border = hue @ 0.42 · color = hue',
    style: (hex) => {
      const { r, g, b } = hexRgb(hex);
      return `background:${surface}; border:1px solid rgba(${r}, ${g}, ${b}, 0.42); color:${hex};`;
    },
  },
  {
    id: 'E', name: 'بدون سطح',
    why: 'آرام‌ترین: هیچ سطحی نیست، فقط متن رنگی با یک حاشیه‌ی مویی. برچسب به سطح صفحه می‌چسبد.',
    rule: 'bg = transparent · border = hue @ 0.28 · color = hue',
    style: (hex) => {
      const { r, g, b } = hexRgb(hex);
      return `background:transparent; border:1px solid rgba(${r}, ${g}, ${b}, 0.28); color:${hex};`;
    },
  },
];

function hexRgb(hex: string) {
  const c = hex.replace('#', '');
  return { r: parseInt(c.slice(0, 2), 16), g: parseInt(c.slice(2, 4), 16), b: parseInt(c.slice(4, 6), 16) };
}

const tag = (c: Candidate, item: any) =>
  `<span class="tag" style="${GEOM}${c.style(item.hex)}">${item.label} ${item.hue}</span>`;

const row = (c: Candidate) => `
  <section class="cand">
    <header><span class="cid">${c.id}</span><div><h3>${c.name}</h3><p class="why">${c.why}</p></div></header>
    <p class="rule">${c.rule}</p>
    <div class="strip" style="background:${work}">${SP.map((i: any) => tag(c, i)).join('')}</div>
    <div class="row" style="background:${work}">
      <span class="name">api-gateway</span>${tag(c, SP[4])}${tag(c, SP[7])}
      <span class="name">billing-worker</span>${tag(c, SP[0])}
    </div>
  </section>`;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — تست چشمی Tag</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${canvas}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; font-size:14px; line-height:1.75; }
  .wrap { max-width:1120px; margin:0 auto; padding:40px 24px 96px; }
  h1 { font-size:25px; margin:0 0 6px; font-weight:700; letter-spacing:-0.02em; }
  h2 { font-size:16px; margin:30px 0 10px; font-weight:600; }
  h3 { font-size:15px; margin:0 0 3px; font-weight:600; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.08em; text-transform:uppercase; }
  .sub { color:${DIM}; margin:0 0 8px; }
  .diag { border:1px solid ${LINE}; border-radius:14px; padding:18px; margin:0 0 24px; background:rgba(233,236,242,0.012); }
  table { width:100%; border-collapse:collapse; font-family:ui-monospace,monospace; font-size:12px; }
  th, td { text-align:right; padding:6px 9px; border-bottom:1px solid ${LINE}; }
  th { color:${FAINT}; font-weight:400; }
  .bad { color:#ffb4b4; } .good { color:#9ee6b4; }
  .cand { border:1px solid ${LINE}; border-radius:14px; padding:18px; margin:0 0 18px; background:rgba(233,236,242,0.012); }
  .cand header { display:flex; gap:12px; align-items:flex-start; margin-bottom:8px; }
  .cid { font-family:ui-monospace,monospace; font-size:13px; font-weight:700; border:1px solid ${LINE}; border-radius:8px; padding:3px 10px; flex-shrink:0; }
  .why { margin:0; color:${DIM}; font-size:13px; }
  .rule { font-family:ui-monospace,monospace; font-size:11.5px; color:${FAINT}; margin:0 0 12px; direction:ltr; text-align:left; }
  .strip { border-radius:10px; padding:14px 16px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-bottom:8px; }
  .row { border-radius:10px; padding:12px 16px; display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
  .name { font-family:ui-monospace,monospace; font-size:12px; color:${DIM}; margin-inline-end:4px; }
  footer { color:${FAINT}; font-size:12px; margin-top:32px; }
  code { font-family:ui-monospace,monospace; }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">LIMINAL · تست چشمی · Tag</p>
  <h1>برچسب دسته‌بندی چطور باید بنشیند؟</h1>
  <p class="sub">Tag برادر Badge است ولی دوقلویش نیست: Badge <b>وضعیت</b> را حمل می‌کند، Tag <b>دسته</b> را — و متن خودش می‌گوید کدام. پس هیو تزئین است، نه اطلاعات.</p>

  <div class="diag">
    <h2 style="margin-top:0">تشخیص — بدهی مشتق‌شدن</h2>
    <table>
      <thead><tr><th>ویژگی</th><th>امروز</th><th>روی مقیاس؟</th></tr></thead>
      <tbody>
        <tr><td>سطح</td><td><code>SURFACE_TINT.subtle</code> = rgba(255,255,255,0.03)</td><td class="bad">نه — overlay سفید</td></tr>
        <tr><td>حاشیه</td><td><code>'1px solid rgba(255,255,255,0.06)'</code></td><td class="bad">literal خام، از قاعده‌ی lint رد می‌شود</td></tr>
        <tr><td>padding</td><td><code>4px 10px</code></td><td class="bad">۱۰ روی هیچ پله‌ای نیست</td></tr>
        <tr><td>font-size</td><td><code>TYPOGRAPHY[1].fs</code> = ۱۱px ثابت</td><td class="bad">مقیاس شناور را نادیده می‌گیرد</td></tr>
      </tbody>
    </table>
    <p class="sub" style="margin:12px 0 0">
      هندسه در همه‌ی کاندیدها <b>یکسان و مشتق‌شده</b> است
      (<code>SPACING[1] SPACING[3]</code> · <code>gap SPACING[1]</code>)، تا فقط رنگ قضاوت شود.
    </p>
  </div>

  <h2 style="margin-bottom:14px">کاندیدها — روی سطح کار، هر ۱۲ هیو</h2>
  ${CANDIDATES.map(row).join('')}

  <footer>
    تولید‌شده توسط <code>scripts/gen-tag-test.ts</code> · بدون شبکه ·
    هیوها از <code>EXTENDED_SPECTRUM</code> · سطح و حاشیه از <code>LADDER</code>
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
