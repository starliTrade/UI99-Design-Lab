#!/usr/bin/env bun
/**
 * LIMINAL — the component matrix.
 *
 * Every component, every size, every state, rendered by the real components.
 * And a coverage column, because the point is not only to show what works but
 * to show what is MISSING — read from the code rather than from the roadmap.
 *
 * Run: bun scripts/gen-matrix.tsx
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { FIXTURES, coverage } from '../src/components/__matrix__/fixtures';
import { LADDER, getTextStyle } from '../src/engine/spec-engine';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/matrix.html');

const TEXT = getTextStyle('primary', 2).color as string;
const DIM = getTextStyle('secondary', 2).color as string;
const FAINT = getTextStyle('tertiary', 2).color as string;
const S = L.SPACING;
const R = L.RADIUS;

const LAYERS = ['liminal-interaction', 'liminal-mist', 'liminal-motion', 'liminal-forced-colors', 'liminal-bidi', 'liminal-fonts']
  .map((n) => readFileSync(resolve(__dirname, `../src/engine/${n}.css`), 'utf8'))
  .join('\n');
const INDEX = readFileSync(resolve(__dirname, '../src/index.css'), 'utf8');
const VARS = (INDEX.match(/:root\s*\{[\s\S]*?\n\}/) ?? [''])[0];

const render = (el: React.ReactElement) => renderToStaticMarkup(el);

const pct = (n: number) => Math.round(n * 100);
const bar = (n: number) => {
  const filled = Math.round(n * 10);
  return `<span class="bar"><i style="width:${pct(n)}%"></i></span><span class="mono">${pct(n)}%</span>`;
};

const groups = [...new Set(FIXTURES.map((f) => f.group))];

const section = (group: string) => {
  const items = FIXTURES.filter((f) => f.group === group);
  return `
  <h2>${group}</h2>
  ${items.map((f) => {
    const cov = coverage(f);
    const missing = f.expected.filter((s) => !f.states.includes(s));
    const sizes = f.sizes.length ? f.sizes.join(' · ') : '—';
    const cells = f.states.map((state) =>
      `<div class="cell"><div class="cellhead"><span class="mono">${state}</span></div>${render(f.render(state))}</div>`).join('');
    const sizeCells = f.sizes.length
      ? `<div class="sizerow">${f.sizes.map((sz) => `<div class="cell"><div class="cellhead"><span class="mono">${sz}</span></div>${render(f.render(f.states[0], sz))}</div>`).join('')}</div>`
      : '';
    return `
    <section class="comp">
      <header>
        <b>${f.name}</b>
        <span class="mono dim">اندازه: ${sizes}</span>
        <span class="cov">${bar(cov)}</span>
        ${missing.length ? `<span class="miss">غایب: ${missing.join(' · ')}</span>` : `<span class="ok">کامل</span>`}
      </header>
      <div class="grid">${cells}</div>
      ${sizeCells}
    </section>`;
  }).join('')}`;
};

const total = FIXTURES.reduce((n, f) => n + coverage(f), 0) / FIXTURES.length;
const complete = FIXTURES.filter((f) => coverage(f) === 1).length;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — ماتریس کامپوننت‌ها</title>
<style>
${VARS}
${LAYERS}
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${LADDER[0]}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; font-size:15px; line-height:1.7; }
  .wrap { max-width:1280px; margin:0 auto; padding:44px 24px 96px; }
  h1 { font-size:28px; margin:0 0 4px; font-weight:700; letter-spacing:-0.02em; }
  h2 { font-size:15px; margin:36px 0 12px; font-weight:600; color:${DIM}; text-transform:uppercase; letter-spacing:.06em; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.1em; text-transform:uppercase; }
  .lede { color:${DIM}; max-width:80ch; margin:0 0 8px; }
  .summary { display:flex; gap:${S[5]}px; margin:${S[4]}px 0 ${S[5]}px; flex-wrap:wrap; }
  .stat { border:1px solid ${LADDER[3]}; border-radius:${R.card}px; padding:${S[3]}px ${S[4]}px; background:${LADDER[1]}; }
  .stat b { display:block; font-family:ui-monospace,monospace; font-size:24px; }
  .stat span { font-size:12px; color:${FAINT}; }
  .comp { border:1px solid ${LADDER[3]}; border-radius:${R.card}px; padding:${S[4]}px; background:${LADDER[1]}; margin-bottom:${S[4]}px; }
  .comp header { display:flex; align-items:center; gap:${S[3]}px; flex-wrap:wrap; margin-bottom:${S[3]}px; }
  .comp header b { font-size:16px; }
  .dim { color:${FAINT}; }
  .mono { font-family:ui-monospace,monospace; font-size:12px; }
  .cov { display:flex; align-items:center; gap:6px; margin-inline-start:auto; }
  .bar { display:inline-block; width:80px; height:6px; background:${LADDER[3]}; border-radius:3px; overflow:hidden; }
  .bar i { display:block; height:100%; background:${LADDER[6]}; }
  .miss { font-size:11.5px; color:#e0b070; border:1px solid #8a5a2a; background:#1a1410; border-radius:999px; padding:2px 10px; }
  .ok { font-size:11.5px; color:#7fd0a0; border:1px solid #2a5a3a; background:#101a13; border-radius:999px; padding:2px 10px; }
  .grid, .sizerow { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:${S[3]}px; }
  .sizerow { margin-top:${S[3]}px; padding-top:${S[3]}px; border-top:1px dashed ${LADDER[3]}; }
  .cell { border:1px solid ${LADDER[3]}; border-radius:${R.control}px; padding:${S[3]}px; background:${LADDER[2]}; min-height:80px;
    display:flex; flex-direction:column; gap:${S[2]}px; justify-content:flex-start; }
  .cellhead { font-size:11px; color:${FAINT}; }
  footer { color:${FAINT}; font-size:12px; margin-top:${S[6]}px; border-top:1px solid ${LADDER[3]}; padding-top:${S[4]}px; }
  code { font-family:ui-monospace,monospace; background:${LADDER[1]}; border:1px solid ${LADDER[3]}; border-radius:4px; padding:1px 5px; font-size:12px; }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">LIMINAL · ماتریس کامپوننت‌ها</p>
  <h1>هر کامپوننت، هر اندازه، هر حالت</h1>
  <p class="lede">
    هر چیزی که می‌بینی توسط <b>خودِ کامپوننت‌ها</b> رندر شده. و ستون پوشش می‌گوید
    <b>چه چیزی غایب است</b> — خوانده‌شده از کد، نه از نقشه راه.
  </p>
  <div class="summary">
    <div class="stat"><b>${FIXTURES.length}</b><span>کامپوننت در ماتریس</span></div>
    <div class="stat"><b>${complete}</b><span>کامل (همه‌ی حالت‌ها)</span></div>
    <div class="stat"><b>${pct(total)}%</b><span>پوشش میانگین</span></div>
  </div>
  ${groups.map(section).join('')}
  <footer>
    تولید‌شده توسط <code>scripts/gen-matrix.tsx</code> · بدون شبکه ·
    حالت‌های ایستا با <code>renderToStaticMarkup</code> · حالت‌های تعاملی (hover/focus) با CDP
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
console.log(`  ${FIXTURES.length} components · ${complete} complete · ${pct(total)}% average coverage`);
