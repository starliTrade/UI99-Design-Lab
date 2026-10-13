#!/usr/bin/env bun
/**
 * LIMINAL — the contrast curve.
 *
 * Why does tertiary have that alpha? The answer is a derivation, and a
 * derivation that cannot be seen is a claim. This draws it: APCA and WCAG
 * against alpha, for every surface, with the declared floors marked and the
 * derived point shown on the curve.
 *
 * The point is not the numbers — the playground already shows those. It is the
 * SHAPE: where the curve crosses each floor, and how far the two lenses
 * disagree before the stricter one wins.
 *
 * Run: bun scripts/gen-contrast-curve.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LADDER, getTextStyle } from '../src/engine/spec-engine';
import { TEXT_ROLE_SPEC, deriveTextToken } from '../src/engine/liminal-contrast';
import { apcaMagnitude } from '../src/engine/liminal-contrast';
import { hexToRgb, rgbToOklch, contrastRatioHex } from '../src/engine/liminal-color-math';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/contrast-curve.html');

const TEXT = getTextStyle('primary', 2).color as string;
const DIM = getTextStyle('secondary', 2).color as string;
const FAINT = getTextStyle('tertiary', 2).color as string;
const S = L.SPACING;
const R = L.RADIUS;

const toHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const over = (bg: string, alpha: number) => {
  const c = hexToRgb(bg);
  return toHex(c.r * (1 - alpha) + 255 * alpha, c.g * (1 - alpha) + 255 * alpha, c.b * (1 - alpha) + 255 * alpha);
};

/** One sample per 2% of alpha. */
const SAMPLES = Array.from({ length: 51 }, (_, i) => i / 50);

const ROLES = ['primary', 'secondary', 'tertiary', 'quaternary'] as const;

/** The derived alpha for a role, read back out of the engine. */
const derivedAlpha = (role: string, level: number) => {
  const c = getTextStyle(role as 'primary', level).color as string;
  const m = c.match(/rgba?\(([^)]+)\)/);
  return m ? Number(m[1].split(',')[3]) : 1;
};

const chart = (level: number, bg: string) => {
  const W = 460, H = 180, PAD = 26;
  const apca = SAMPLES.map((a) => apcaMagnitude(over(bg, a), bg));
  const wcag = SAMPLES.map((a) => contrastRatioHex(over(bg, a), bg));
  const apcaMax = Math.max(...apca, 100);
  const wcagMax = Math.max(...wcag, 8);
  const x = (i: number) => PAD + (i / (SAMPLES.length - 1)) * (W - PAD * 2);
  const yA = (v: number) => H - PAD - (v / apcaMax) * (H - PAD * 2);
  const yW = (v: number) => H - PAD - (v / wcagMax) * (H - PAD * 2);
  const path = (vals: number[], y: (v: number) => number) =>
    vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  // the floors, as lines across the chart
  const floorLine = (v: number, y: (n: number) => number, colour: string, label: string) =>
    `<line x1="${PAD}" y1="${y(v).toFixed(1)}" x2="${W - PAD}" y2="${y(v).toFixed(1)}" stroke="${colour}" stroke-dasharray="3 3" stroke-width="1"/>
     <text x="${W - PAD + 2}" y="${(y(v) + 3).toFixed(1)}" font-size="9" fill="${colour}">${label}</text>`;

  const markers = ROLES.map((role) => {
    const a = derivedAlpha(role, level);
    const spec = TEXT_ROLE_SPEC[role];
    return `<circle cx="${x(Math.round(a * 50)).toFixed(1)}" cy="${yA(apca[Math.round(a * 50)]).toFixed(1)}" r="3.5" fill="${LADDER[level]}" stroke="${TEXT}" stroke-width="1.5"/>
            <text x="${(x(Math.round(a * 50)) + 6).toFixed(1)}" y="${(yA(apca[Math.round(a * 50)]) - 5).toFixed(1)}" font-size="9" fill="${TEXT}">${role}</text>`;
  }).join('');

  return `
  <div class="chart">
    <div class="chead"><b>S${level}</b><span class="mono">${bg} · L ${rgbToOklch(hexToRgb(bg)).L.toFixed(3)}</span></div>
    <svg viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="APCA and WCAG against alpha on S${level}">
      <rect x="${PAD}" y="${PAD}" width="${W - PAD * 2}" height="${H - PAD * 2}" fill="none" stroke="${LADDER[3]}"/>
      ${floorLine(90, yA, '#7fd0a0', 'Lc90')}
      ${floorLine(75, yA, '#7fd0a0', 'Lc75')}
      ${floorLine(30, yA, '#e0b070', 'Lc30')}
      ${floorLine(4.5, yW, '#6fa8ec', '4.5:1')}
      <path d="${path(apca, yA)}" fill="none" stroke="#7fd0a0" stroke-width="2"/>
      <path d="${path(wcag, yW)}" fill="none" stroke="#6fa8ec" stroke-width="2"/>
      ${markers}
      <text x="${PAD}" y="${H - 6}" font-size="9" fill="${FAINT}">alpha 0 → 1</text>
      <text x="${PAD}" y="${PAD - 8}" font-size="9" fill="#7fd0a0">APCA (Lc)</text>
      <text x="${PAD + 78}" y="${PAD - 8}" font-size="9" fill="#6fa8ec">WCAG (ratio)</text>
    </svg>
    <div class="legend">
      ${ROLES.map((role) => {
        const a = derivedAlpha(role, level);
        const spec = TEXT_ROLE_SPEC[role];
        return `<span class="mono">${role} α ${a.toFixed(3)} · کف Lc ${spec.apca} · ${spec.wcag}:1</span>`;
      }).join('')}
    </div>
  </div>`;
};

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — منحنی کنتراست</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${LADDER[0]}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; font-size:15px; line-height:1.7; }
  .wrap { max-width:1180px; margin:0 auto; padding:44px 24px 96px; }
  h1 { font-size:27px; margin:0 0 4px; font-weight:700; letter-spacing:-0.02em; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.1em; text-transform:uppercase; }
  .lede { color:${DIM}; max-width:80ch; margin:0 0 8px; }
  .claim { border-inline-start:2px solid ${LADDER[3]}; padding-inline-start:14px; margin:18px 0 28px; color:${DIM}; max-width:82ch; }
  .claim b { color:${TEXT}; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(420px,1fr)); gap:${S[4]}px; }
  .chart { border:1px solid ${LADDER[3]}; border-radius:${R.card}px; padding:${S[4]}px; background:${LADDER[1]}; }
  .chead { display:flex; align-items:baseline; gap:${S[2]}px; margin-bottom:${S[2]}px; }
  .chead b { font-size:15px; }
  .mono { font-family:ui-monospace,monospace; font-size:11.5px; color:${FAINT}; }
  .legend { display:flex; flex-wrap:wrap; gap:${S[3]}px; margin-top:${S[2]}px; }
  footer { color:${FAINT}; font-size:12px; margin-top:${S[6]}px; border-top:1px solid ${LADDER[3]}; padding-top:${S[4]}px; }
  code { font-family:ui-monospace,monospace; background:${LADDER[1]}; border:1px solid ${LADDER[3]}; border-radius:4px; padding:1px 5px; font-size:12px; }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">LIMINAL · منحنی کنتراست</p>
  <h1>چرا آن آلفا؟ — جواب، دیدنی است</h1>
  <p class="lede">دو عدسی، در برابر آلفا، روی هر سطح. خطوط چین‌دار کف‌های اعلام‌شده‌اند؛ نقطه‌ها آلفای <b>مشتق‌شده</b>.</p>
  <p class="claim">
    <b>شکل مهم است، نه عدد.</b> ببین کجا هر منحنی از کفش می‌گذرد، و <b>چقدر دو عدسی اختلاف دارند</b> پیش از آنکه سخت‌گیرتر برنده شود.
    <br>و ببین چرا <b>secondary و tertiary یک آلفا دارند</b>: کفشان یکی است، پس جوابشان یکی است — و سلسله‌مراتبشان <b>اندازه و وزن</b> است، نه رنگ.
  </p>
  <div class="grid">
    ${LADDER.map((bg, i) => chart(i, bg)).join('')}
  </div>
  <footer>
    تولید‌شده توسط <code>scripts/gen-contrast-curve.ts</code> · بدون شبکه ·
    کف‌ها از <code>TEXT_ROLE_SPEC</code> · آلفاها از <code>getTextStyle</code> · ${SAMPLES.length} نمونه در هر منحنی
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
