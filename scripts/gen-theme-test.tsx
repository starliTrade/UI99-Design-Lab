#!/usr/bin/env bun
/**
 * LIMINAL — does a theme reach everything it should?
 *
 * The engine's rule is that a rendered surface is a VARIABLE: `getLadderVar(n)`
 * for a style, `getLadderColor(n)` for arithmetic and tests. A theme overrides
 * the variables, so a surface that follows the rule moves and a surface that
 * bakes a hex does not.
 *
 * This renders the same components twice: once on the system's own ladder, once
 * on a warm one. Everything that is a surface should move. If something looks
 * identical in both panels, it is either hue-independent by design — a black
 * shadow, a white text alpha, the locked monochrome brand — or it is a defect.
 *
 * Run: bun scripts/gen-theme-test.tsx
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { FIXTURES } from '../src/components/__matrix__/fixtures';
import { LADDER, getTextStyle } from '../src/engine/spec-engine';
import { createLiminalTheme } from '../src/engine/liminal-theme';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/theme-test.html');

const TEXT = getTextStyle('primary', 2).color as string;
const DIM = getTextStyle('secondary', 2).color as string;
const FAINT = getTextStyle('tertiary', 2).color as string;
const S = L.SPACING;

const LAYERS = ['liminal-interaction', 'liminal-mist', 'liminal-motion', 'liminal-forced-colors']
  .map((n) => readFileSync(resolve(__dirname, `../src/engine/${n}.css`), 'utf8')).join('\n');
const VARS = (readFileSync(resolve(__dirname, '../src/index.css'), 'utf8').match(/:root\s*\{[\s\S]*?\n\}/) ?? [''])[0];

/** The system's own ladder, and a warm one. Both are real themes. */
const SYSTEM = createLiminalTheme({ name: 'system' });
const EMBER = createLiminalTheme({ brandHue: 20, brandChroma: 0.015, name: 'ember' });

/** The components that show a surface. The guard covers all of them; this shows them. */
const SHOWN = ['Button', 'Card', 'Panel', 'Input', 'Select', 'Checkbox', 'Radio', 'Toggle',
  'Badge', 'Tag', 'Alert', 'Stat', 'Progress', 'Avatar', 'Pagination', 'NavItem', 'Breadcrumb',
  'Skeleton', 'EmptyState', 'Divider', 'Table', 'Calendar', 'FilterBar', 'Form', 'FormLayout', 'Mist'];

const rows = SHOWN.map((name) => {
  const f = FIXTURES.find((x) => x.name === name);
  if (!f) return null;
  const html = renderToStaticMarkup(f.render(f.states[0]));
  return { name, html };
}).filter(Boolean) as { name: string; html: string }[];

const panel = (title: string, note: string, scope: string, ladder: string[]) => `
  <div class="col">
    <div class="head">
      <b>${title}</b><span class="use">${note}</span>
    </div>
    <div class="ladder mono">${ladder.join(' ')}</div>
    <div class="scope" data-liminal-theme="${scope}">
      ${rows.map((r) => `
        <div class="case">
          <div class="lbl mono">${r.name}</div>
          <div class="stage">${r.html}</div>
        </div>`).join('')}
    </div>
  </div>`;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — یک تم به همه‌جا می‌رسد؟</title>
<style>
${VARS}
${LAYERS}
${SYSTEM.css}
${EMBER.css}
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${LADDER[0]}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; padding: 40px 32px 80px; }
  .wrap { max-width: 1180px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 600; margin: 0 0 6px; }
  .sub { color:${DIM}; font-size: 13px; line-height: 1.9; max-width: 76ch; }
  .sub b { color:${TEXT}; font-weight: 600; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 26px; }
  .col { border: 1px solid ${LADDER[2]}; border-radius: 14px; overflow: hidden; }
  .head { display:flex; align-items:baseline; gap:10px; padding: 12px 16px; border-bottom: 1px solid ${LADDER[2]}; background:${LADDER[1]}; }
  .head b { font-size: 13px; font-weight: 600; }
  .head .use { color:${FAINT}; font-size: 11px; }
  .ladder { padding: 8px 16px; color:${FAINT}; border-bottom: 1px solid ${LADDER[1]}; word-spacing: 2px; }
  .case { display:flex; align-items:center; gap:14px; padding: 12px 16px; border-bottom: 1px solid ${LADDER[1]}; }
  .case:last-child { border-bottom: none; }
  .lbl { color:${FAINT}; width: 118px; flex: none; }
  .stage { flex: 1; min-width: 0; display:flex; align-items:center; }
  .hint { margin-top: 22px; color:${FAINT}; font-size: 12px; line-height: 2; }
  .hint code { color:${DIM}; }

  /* ── Narrow screens ──────────────────────────────────────────────────────
   * Two panels side by side on a phone give each about 150px, which crushes
   * the label and lets the Calendar out of its box. Below 900px they stack. */
  @media (max-width: 900px) {
    body { padding: 20px 12px 56px; }
    h1 { font-size: 19px; }
    .sub { font-size: 12px; }
    .cols { grid-template-columns: 1fr; gap: 14px; }
    .case { flex-direction: column; align-items: stretch; gap: 8px; padding: 12px; }
    .lbl { width: auto; }
    .stage { overflow-x: auto; }
    .ladder { word-break: break-all; }
    .hint { font-size: 11px; line-height: 1.9; }
  }
</style>
</head>
<body>
<div class="wrap">
  <h1>یک تم به همه‌جا می‌رسد؟</h1>
  <div class="sub">
    همان کامپوننت‌ها، دو بار. هر سطحی که <b>متغیر</b> است با تم حرکت می‌کند؛ هر چیزی که
    <b>hex پخته</b> باشد سر جایش می‌ماند. پس هر چیزی که در دو پنل یکسان به نظر می‌رسد یا
    عمداً مستقل از هیو است — سایهٔ مشکی، آلفای متن سفید، برندِ تک‌رنگِ قفل‌شده — یا یک باگ است.
  </div>

  <div class="cols">
    ${panel('تمِ خودِ سیستم', 'نردبان پیش‌فرض — hue ۲۵۸٫۴', 'system', SYSTEM.ladder)}
    ${panel('تمِ گرم', 'hue ۲۰ · chroma ۰٫۰۱۵ — عمداً بزرگ‌نمایی‌شده تا رسیدنِ تم دیده شود', 'ember', EMBER.ladder)}
  </div>

  <div class="hint">
    نگهبانِ این ادعا یک تست است: هیچ کامپوننتی نباید یک رنگِ نردبان را در style رندرشده پخته باشد.
    <code>src/engine/__tests__/theme-reach.test.ts</code> — هر ۴۲ کامپوننت را رندر می‌کند و می‌گردد.
  </div>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log(`wrote ${OUT} ${(html.length / 1024).toFixed(1)}KB`);
console.log('  system ladder:', SYSTEM.ladder.slice(0, 3).join(' '), '…');
console.log('  ember  ladder:', EMBER.ladder.slice(0, 3).join(' '), '…');
console.log('  components shown:', rows.length);
