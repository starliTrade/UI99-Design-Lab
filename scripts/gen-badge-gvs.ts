#!/usr/bin/env bun
/**
 * LIMINAL — Badge: G vs Eg, on every layer of the ladder.
 *
 * Two finalists, nothing else.
 *
 *   G   a glyph, coloured by the semantic role, on a neutral label
 *   Eg  the same, plus a 5px dot carrying the colour
 *
 * The badge's surface is `LADDER[host + 1]`, so a badge looks different on
 * every host. This page walks all nine, because a badge that only works on the
 * work surface is a badge with a hard-coded level.
 *
 * Run: bun scripts/gen-badge-gvs.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LiminalColorEngine } from '../src/engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../src/engine/liminal-layout-engine';
import { LADDER, getLadderColor } from '../src/engine/spec-engine';
import { contrastRatioHex } from '../src/engine/liminal-color-math';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/badge-g-vs-eg.html');

const SEM: any = LiminalColorEngine.SEMANTICS;
const L = LiminalLayoutEngine;
const KEYS = ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const;
const FA: Record<string, string> = { SUCCESS: 'فعال', WARNING: 'هشدار', DANGER: 'خطا', INFO: 'اطلاع' };
const EN: Record<string, string> = { SUCCESS: 'Active', WARNING: 'Warning', DANGER: 'Error', INFO: 'Info' };
const GLYPH: Record<string, string> = { SUCCESS: '✓', WARNING: '!', DANGER: '×', INFO: 'i' };
const ROLE: Record<number, string> = {
  0: 'canvas', 1: 'chrome', 2: 'work', 3: 'panel', 4: 'control',
  5: 'menu', 6: 'popover', 7: 'modal', 8: 'toast',
};

const TEXT = 'rgba(233,236,242,0.92)';
const DIM = 'rgba(233,236,242,0.55)';
const FAINT = 'rgba(233,236,242,0.28)';
const LINE = 'rgba(233,236,242,0.10)';

/** The badge's own surface is one step above whatever hosts it — clamped at the top. */
const surf = (host: number) => LADDER[Math.min(LADDER.length - 1, host + 1)];
const rim = (host: number) => LADDER[Math.min(LADDER.length - 1, host + 1.5)];

const GEOM = (fs: number) => `
  display:inline-flex; align-items:center; gap:${L.SPACING[1]}px;
  border-radius:${L.RADIUS.full}px;
  font-size:${fs}px; letter-spacing:${L.TYPOGRAPHY[1].ls};
  font-weight:${L.TYPOGRAPHY[2].weight};
  padding:${L.SPACING[1]}px ${L.SPACING[3]}px; line-height:1.45; white-space:nowrap;
`;

const badge = (kind: 'G' | 'Eg', k: string, label: string, host: number, fs = 11) => `
  <span class="badge" style="${GEOM(fs)}background:${surf(host)};border:1px solid ${rim(host)};color:${TEXT}">
    ${kind === 'Eg' ? `<i class="dot" style="background:${SEM[k].text}"></i>` : ''}
    <b class="glyph" style="color:${SEM[k].text}">${GLYPH[k]}</b>${label}
  </span>`;

const strip = (kind: 'G' | 'Eg', host: number, lang: 'en' | 'fa', fs = 11) => `
  <div class="strip" style="background:${getLadderColor(host)}" ${lang === 'fa' ? 'dir="rtl"' : ''}>
    ${KEYS.map((k) => badge(kind, k, lang === 'fa' ? FA[k] : EN[k], host, fs)).join('')}
  </div>`;

const ladderRow = (host: number) => `
  <div class="lrow">
    <div class="lhead">
      <span class="lname">S${host} · ${ROLE[host]}</span>
      <span class="lhex">${getLadderColor(host)} → badge ${surf(host)}${host === 8 ? ' <b class="ceil">سقف</b>' : ''}</span>
    </div>
    <div class="pair">
      <div class="half"><span class="tag">G</span>${strip('G', host, 'fa')}</div>
      <div class="half"><span class="tag">Eg</span>${strip('Eg', host, 'fa')}</div>
    </div>
  </div>`;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — G در برابر Eg، روی نُه لایه</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${getLadderColor(0)}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size:14px; line-height:1.75; }
  .wrap { max-width:1080px; margin:0 auto; padding:40px 24px 96px; }
  h1 { font-size:25px; margin:0 0 6px; font-weight:700; letter-spacing:-0.02em; }
  h2 { font-size:16px; margin:34px 0 12px; font-weight:600; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.08em; text-transform:uppercase; }
  .sub { color:${DIM}; margin:0 0 8px; }
  .badge { }
  .dot { width:5px; height:5px; border-radius:999px; display:inline-block; flex-shrink:0; }
  .glyph { font-family:ui-monospace,monospace; font-size:.92em; line-height:1; font-weight:700;
    display:inline-block; min-width:.62em; text-align:center; }
  .lrow { border:1px solid ${LINE}; border-radius:12px; padding:12px 14px; margin-bottom:10px; background:rgba(233,236,242,0.012); }
  .lhead { display:flex; justify-content:space-between; align-items:baseline; gap:14px; margin-bottom:9px; }
  .lname { font-family:ui-monospace,monospace; font-size:12px; color:${TEXT}; }
  .lhex { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; direction:ltr; }
  .ceil { color:#ffb4b4; }
  .pair { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  @media (max-width:820px){ .pair { grid-template-columns:1fr; } }
  .half { position:relative; }
  .tag { position:absolute; top:6px; inset-inline-end:8px; font-family:ui-monospace,monospace;
    font-size:10px; color:${FAINT}; z-index:1; }
  .strip { border-radius:9px; padding:14px 15px; display:flex; gap:9px; flex-wrap:wrap; align-items:center; }
  .dense { border-radius:9px; padding:14px; display:flex; gap:7px; flex-wrap:wrap; }
  table { width:100%; border-collapse:collapse; font-family:ui-monospace,monospace; font-size:12px; }
  th, td { text-align:right; padding:6px 9px; border-bottom:1px solid ${LINE}; }
  th { color:${FAINT}; font-weight:400; }
  .pass { color:#9ee6b4; } .fail { color:#ffb4b4; }
  footer { color:${FAINT}; font-size:12px; margin-top:32px; }
  code { font-family:ui-monospace,monospace; }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">LIMINAL · بج · فینال</p>
  <h1>G در برابر Eg — روی نُه لایه</h1>
  <p class="sub">
    هر دو یک سطح مشتق‌شده دارند: <code>LADDER[host + 1]</code>، با حاشیه‌ی <code>LADDER[host + 1.5]</code> (نیم پله).
    تفاوت فقط در این است که <b>Eg یک نقطه‌ی ۵px اضافه می‌کند و G نه</b>.
  </p>

  <h2>روی هر پله‌ی نردبان</h2>
  <p class="sub" style="margin-bottom:14px">بج باید روی هر نُه سطح کار کند — وگرنه یک سطح ثابت دارد، نه مشتق‌شده.</p>
  ${Array.from({ length: 9 }, (_, i) => ladderRow(i)).join('')}

  <h2>چگالی — هشت بج</h2>
  <div class="pair">
    ${(['G', 'Eg'] as const).map((kind) => `
      <div class="lrow">
        <div class="lhead"><span class="lname">${kind}</span></div>
        <div class="dense" style="background:${getLadderColor(2)}">
          ${['SUCCESS','WARNING','DANGER','INFO','SUCCESS','WARNING','DANGER','INFO']
            .map((k) => badge(kind, k, FA[k], 2)).join('')}
        </div>
      </div>`).join('')}
  </div>

  <h2>اندازه‌ها</h2>
  ${(['G', 'Eg'] as const).map((kind) => `
    <div class="lrow">
      <div class="lhead"><span class="lname">${kind}</span><span class="lhex">11px · 13px · 15px</span></div>
      ${[11, 13, 15].map((fs) => `<div style="margin-bottom:8px">${strip(kind, 2, 'fa', fs)}</div>`).join('')}
    </div>`).join('')}

  <h2>انگلیسی</h2>
  ${(['G', 'Eg'] as const).map((kind) => `
    <div class="lrow">
      <div class="lhead"><span class="lname">${kind}</span></div>
      ${strip(kind, 2, 'en')}
    </div>`).join('')}

  <h2>اندازه‌گیری — کنتراست روی هر سطح</h2>
  <table>
    <thead><tr><th>سطح</th><th>متن خنثی</th><th>گلیف/نقطه</th><th>آستانه</th></tr></thead>
    <tbody>
      ${Array.from({ length: 9 }, (_, host) => {
        const t = contrastRatioHex('#E9ECF2', surf(host));
        const m = Math.min(...KEYS.map((k) => contrastRatioHex(SEM[k].text, surf(host))));
        return `<tr><td>S${host} · ${ROLE[host]}</td>
          <td class="${t >= 4.5 ? 'pass' : 'fail'}">${t.toFixed(2)}:1</td>
          <td class="${m >= 3 ? 'pass' : 'fail'}">${m.toFixed(2)}:1 <span style="color:${FAINT}">(بدترین معنا)</span></td>
          <td style="color:${FAINT}">متن ≥۴.۵ · نشانگر ≥۳</td></tr>`;
      }).join('')}
    </tbody>
  </table>

  <footer>
    تولید‌شده توسط <code>scripts/gen-badge-g-vs.ts</code> · بدون شبکه ·
    سطح و حاشیه از <code>LADDER</code> · رنگ‌ها از <code>SEMANTICS</code> · فاصله‌ها از <code>SPACING</code>
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
