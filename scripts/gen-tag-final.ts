#!/usr/bin/env bun
/**
 * LIMINAL — Tag, after the treatment: an eye test on every layer.
 *
 * Tag now takes the badge's treatment — a surface one ladder step above its
 * host, a hairline half a step above that. Both derived, both bounded by the
 * ladder. It used to sit on a white overlay at 0.03, which measured L 0.2342 on
 * the toast level: above the ladder's ceiling of 0.2038.
 *
 * Run: bun scripts/gen-tag-final.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LiminalColorEngine } from '../src/engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../src/engine/liminal-layout-engine';
import { LADDER, getLadderColor, getTextStyle } from '../src/engine/spec-engine';
import { resolveSurface, resolveBorder } from '../src/engine/liminal-surface';
import { contrastRatioHex } from '../src/engine/liminal-color-math';
import { apcaMagnitude } from '../src/engine/liminal-contrast';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/tag-final.html');

const SP: any = LiminalColorEngine.EXTENDED_SPECTRUM;
const L = LiminalLayoutEngine;
const S = L.SPACING;
const ROLE: Record<number, string> = {
  0: 'canvas', 1: 'chrome', 2: 'work', 3: 'panel', 4: 'control',
  5: 'menu', 6: 'popover', 7: 'modal', 8: 'toast',
};

const canvas = getLadderColor(0);
const TEXT = 'rgba(233,236,242,0.92)';
const DIM = 'rgba(233,236,242,0.55)';
const FAINT = 'rgba(233,236,242,0.28)';
const LINE = 'rgba(233,236,242,0.10)';

const GEOM = `
  display:inline-flex; align-items:center; gap:${S[1]}px;
  border-radius:${L.RADIUS.chip}px;
  font-size:${L.TYPOGRAPHY[1].fs}px; letter-spacing:${L.TYPOGRAPHY[1].ls};
  font-weight:${L.TYPOGRAPHY[2].weight};
  padding:${S[1]}px ${S[3]}px; line-height:1.45; white-space:nowrap;
`;

const tag = (item: any, host: number) => {
  const bg = resolveSurface({ role: 'control', on: ROLE[host] as any }).background;
  const rim = resolveBorder({ role: 'control', kind: 'separator', on: ROLE[host] as any });
  return `<span class="tag" style="${GEOM}background:${bg};border:1px solid ${rim};color:${item.hex}">${item.label} ${item.hue}</span>`;
};

const ladderRow = (host: number) => {
  const bg = resolveSurface({ role: 'control', on: ROLE[host] as any }).background;
  const rim = resolveBorder({ role: 'control', kind: 'separator', on: ROLE[host] as any });
  return `
    <div class="lrow">
      <div class="lhead">
        <span class="lname">S${host} · ${ROLE[host]}</span>
        <span class="lhex">host ${getLadderColor(host)} → surface ${bg} · rim ${rim}</span>
      </div>
      <div class="strip" style="background:${getLadderColor(host)}">
        ${[SP[0], SP[4], SP[7], SP[10]].map((i: any) => tag(i, host)).join('')}
      </div>
    </div>`;
};

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
  .wrap { max-width:1080px; margin:0 auto; padding:40px 24px 96px; }
  h1 { font-size:25px; margin:0 0 6px; font-weight:700; letter-spacing:-0.02em; }
  h2 { font-size:16px; margin:32px 0 12px; font-weight:600; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.08em; text-transform:uppercase; }
  .sub { color:${DIM}; margin:0 0 8px; }
  .lrow { border:1px solid ${LINE}; border-radius:12px; padding:12px 14px; margin-bottom:10px; background:rgba(233,236,242,0.012); }
  .lhead { display:flex; justify-content:space-between; align-items:baseline; gap:14px; margin-bottom:9px; }
  .lname { font-family:ui-monospace,monospace; font-size:12px; }
  .lhex { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; direction:ltr; }
  .strip { border-radius:9px; padding:14px 15px; display:flex; gap:9px; flex-wrap:wrap; align-items:center; }
  .row { border-radius:9px; padding:12px 15px; display:flex; gap:9px; align-items:center; flex-wrap:wrap; }
  .name { font-family:ui-monospace,monospace; font-size:12px; color:${DIM}; margin-inline-end:4px; }
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
  <p class="eyebrow">LIMINAL · تست چشمی · Tag</p>
  <h1>برچسب با تیمار بج — روی هر نُه لایه</h1>
  <p class="sub">
    سطح یک پله بالای میزبان، حاشیه نیم پله بالای آن. هر دو از نردبان، و هر دو در سقف قاعده دارند.
    شکل یک <b>chip</b> (شعاع ۶px) می‌ماند، در حالی که بج یک <b>pill</b> است — تفاوت در معنا، نه فقط در رنگ.
  </p>

  <h2>روی هر پله‌ی نردبان</h2>
  ${Array.from({ length: 9 }, (_, i) => ladderRow(i)).join('')}

  <h2>هر ۱۲ هیو، روی سطح کار</h2>
  <div class="strip" style="background:${getLadderColor(2)}">${SP.map((i: any) => tag(i, 2)).join('')}</div>

  <h2>در بافت واقعی</h2>
  <div class="row" style="background:${getLadderColor(2)}">
    <span class="name">api-gateway</span>${tag(SP[4], 2)}${tag(SP[7], 2)}
    <span class="name">billing-worker</span>${tag(SP[0], 2)}${tag(SP[9], 2)}
  </div>

  <h2>اندازه‌گیری — متن روی سطح برچسب</h2>
  <table>
    <thead><tr><th>سطح میزبان</th><th>حاشیه (نیم پله)</th><th>بدترین کنتراست متن</th><th>آستانه</th></tr></thead>
    <tbody>
      ${Array.from({ length: 9 }, (_, host) => {
        const bg = resolveSurface({ role: 'control', on: ROLE[host] as any }).background;
        const rim = resolveBorder({ role: 'control', kind: 'separator', on: ROLE[host] as any });
        const worstW = Math.min(...SP.map((s: any) => contrastRatioHex(s.hex, bg)));
        const worstA = Math.min(...SP.map((s: any) => apcaMagnitude(s.hex, bg)));
        return `<tr><td>S${host} · ${ROLE[host]}</td><td>${rim}</td>
          <td class="${worstW >= 4.5 ? 'pass' : 'fail'}">WCAG ${worstW.toFixed(2)}:1 · Lc ${worstA.toFixed(1)}</td>
          <td style="color:${FAINT}">AA ≥۴.۵</td></tr>`;
      }).join('')}
    </tbody>
  </table>

  <footer>
    تولید‌شده توسط <code>scripts/gen-tag-final.ts</code> · بدون شبکه ·
    سطح و حاشیه از <code>LADDER</code> · هیوها از <code>EXTENDED_SPECTRUM</code>
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
