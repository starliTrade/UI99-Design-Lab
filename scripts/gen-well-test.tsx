#!/usr/bin/env bun
/**
 * LIMINAL — the well, before and after it had a name.
 *
 * Nineteen sites hand-picked a `(level, rim)` pair. Most of them mapped onto a
 * role exactly and render byte for byte the same. Three did not, and this page
 * exists to show those three:
 *
 *   Card.Well        was (1, 2, concave)  ->  now the inset of its host (0)
 *   EmptyState       was (1.5, 2, concave) ->  now the inset of `work` (0.5)
 *   an invalid Input was (2, 2)            ->  now the field's own edge (3)
 *
 * Each is one component, rendered twice: the rule as it is now, and the same
 * markup with the rim's gradient rewritten to the old pair. One value differs.
 *
 * Run: bun scripts/gen-well-test.tsx
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { Card } from '../src/components/containers/Card/Card';
import { EmptyState } from '../src/components/composites/EmptyState/EmptyState';
import { Input } from '../src/components/inputs/Input/Input';
import { LADDER, getTextStyle, getDirectionalRim } from '../src/engine/spec-engine';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/well-test.html');

const TEXT = getTextStyle('primary', 2).color as string;
const DIM = getTextStyle('secondary', 2).color as string;
const FAINT = getTextStyle('tertiary', 2).color as string;
const S = L.SPACE ?? L.SPACING;

const LAYERS = ['liminal-interaction', 'liminal-mist', 'liminal-motion', 'liminal-forced-colors']
  .map((n) => readFileSync(resolve(__dirname, `../src/engine/${n}.css`), 'utf8')).join('\n');
const VARS = (readFileSync(resolve(__dirname, '../src/index.css'), 'utf8').match(/:root\s*\{[\s\S]*?\n\}/) ?? [''])[0];

const noop = () => {};

/**
 * Rewrite the rim's gradient to a different (level, rim, concave) triple.
 *
 * The rim is the only `linear-gradient(180deg, …)` the engine draws, so it can
 * be found and replaced without touching anything else in the style.
 */
function withRim(markup: string, level: number, rim: 0 | 1 | 2 | 3, concave: boolean): string {
  const r = getDirectionalRim(level, rim, concave);
  if (!r) return markup;
  // Replace the WHOLE `background:` value that carries the rim.
  //
  // Not a regex on the gradient: its stops contain `var(--liminal-s1-5)`, so
  // `[^)]*` stops at the FIRST `)` — inside the var — and the declaration ends
  // up corrupt, which makes the entire `background` invalid and the surface
  // silently flat. A style value cannot contain `;` or `"`, so the end of the
  // value is unambiguous.
  let out = markup;
  let from = 0;
  for (;;) {
    const bg = out.indexOf('background:', from);
    if (bg === -1) break;
    let end = bg;
    while (end < out.length && out[end] !== ';' && out[end] !== '"') end++;
    const value = out.slice(bg, end);
    if (!value.includes('180deg')) { from = end; continue; }
    const replacement = `background:${r.cssBackground}`;
    out = out.slice(0, bg) + replacement + out.slice(end);
    from = bg + replacement.length;
  }
  return out;
}

const CASES: { name: string; note: string; html: string; before: string }[] = [
  {
    name: 'Card.Well',
    note: 'چاه داخل کارت — قبل: (۱، ریم ۲) · حالا: inset از میزبان',
    html: renderToStaticMarkup(<Card><Card.Well>چاهِ کارت</Card.Well></Card>),
    before: withRim(renderToStaticMarkup(<Card><Card.Well>چاهِ کارت</Card.Well></Card>), 1, 2, true),
  },
  {
    name: 'EmptyState',
    note: 'حالت خالی — قبل: (۱٫۵، ریم ۲) · حالا: inset از work',
    html: renderToStaticMarkup(<EmptyState title="چیزی نیست" description="هنوز موردی اضافه نشده" />),
    before: withRim(renderToStaticMarkup(<EmptyState title="چیزی نیست" description="هنوز موردی اضافه نشده" />), 1.5, 2, true),
  },
  {
    name: 'Input (error)',
    note: 'ورودی نامعتبر — قبل: ریم (۲، ۲) · حالا: لبهٔ خودِ فیلد (۳، ۲)',
    html: renderToStaticMarkup(<Input label="نام کاربری" error="این نام قبلاً گرفته شده" onChange={noop} />),
    before: withRim(renderToStaticMarkup(<Input label="نام کاربری" error="این نام قبلاً گرفته شده" onChange={noop} />), 2, 2, false),
  },
];

const col = (title: string, note: string, pick: (c: typeof CASES[number]) => string) => `
  <div class="col">
    <div class="head"><b>${title}</b><span class="use">${note}</span></div>
    ${CASES.map((c) => `
      <div class="case">
        <div class="lbl mono">${c.name}</div>
        <div class="stage">${pick(c)}</div>
      </div>`).join('')}
  </div>`;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — چاه، قبل و بعد از اینکه نام بگیرد</title>
<style>
${VARS}
${LAYERS}
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${LADDER[0]}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; padding: 40px 32px 80px; }
  .wrap { max-width: 1180px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 600; margin: 0 0 6px; }
  .sub { color:${DIM}; font-size: 13px; line-height: 1.9; max-width: 76ch; }
  .sub b { color:${TEXT}; font-weight: 600; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }
  .cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18px; margin-top: 26px; }
  .col { border: 1px solid ${LADDER[2]}; border-radius: 14px; overflow: hidden; min-width: 0; }
  .head { display:flex; align-items:baseline; gap:10px; padding: 12px 16px; border-bottom: 1px solid ${LADDER[2]}; background:${LADDER[1]}; }
  .head b { font-size: 13px; font-weight: 600; }
  .head .use { color:${FAINT}; font-size: 11px; }
  .case { display:flex; align-items:center; gap:14px; padding: 14px 16px; border-bottom: 1px solid ${LADDER[1]}; min-width: 0; }
  .case:last-child { border-bottom: none; }
  .lbl { color:${FAINT}; width: 96px; flex: none; }
  .stage { flex: 1; min-width: 0; display:flex; align-items:center; }
  .hint { margin-top: 22px; color:${FAINT}; font-size: 12px; line-height: 2; }
  .hint code { color:${DIM}; }
  @media (max-width: 900px) {
    body { padding: 20px 12px 56px; }
    h1 { font-size: 19px; }
    .sub { font-size: 12px; }
    .cols { grid-template-columns: 1fr; gap: 14px; }
    .case { flex-direction: column; align-items: stretch; gap: 8px; padding: 12px; }
    .lbl { width: auto; }
    .stage { overflow-x: auto; }
    .hint { font-size: 11px; line-height: 1.9; }
  }
</style>
</head>
<body>
<div class="wrap">
  <h1>چاه، قبل و بعد از اینکه نام بگیرد</h1>
  <div class="sub">
    نوزده سایت یک جفتِ <b>دستی</b> <span class="mono">(سطح، ریم)</span> می‌دادند. بیشترشان دقیقاً
    روی یک نقش نشستند و <b>بایت‌به‌بایت</b> همان می‌مانند. سه‌تا ننشستند و این صفحه برای همان سه‌تاست.
    هر کامپوننت یک بار رندر شده؛ ستون «قبل» همان markup است با گرادیانِ ریم که به جفتِ قدیمی بازنویسی شده.
  </div>

  <div class="cols">
    ${col('قبل', 'جفتِ دستی', (c) => c.before)}
    ${col('حالا', 'قاعدهٔ نام‌دار موتور', (c) => c.html)}
  </div>

  <div class="hint">
    <code>well</code> نقشِ تازه‌ای است: سطحِ کار، با لبهٔ تعریف‌شده — پرشدگیِ کنترلی که خاموش است.
    هفت سایت دستی می‌ساختندش چون موتور اسمی برایش نداشت.
    و <code>inset: true</code> همان قاعده‌ای است که <code>resolveInset</code> از قبل می‌گفت:
    یک‌ونیم پله <b>پایین‌تر</b> از نقشی که در آن کنده می‌شود.
  </div>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log(`wrote ${OUT} ${(html.length / 1024).toFixed(1)}KB`);
