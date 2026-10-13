#!/usr/bin/env bun
/**
 * LIMINAL — should Toggle, Checkbox and Radio have a hover state?
 *
 * The probe says they do not: they never set `--liminal-surface-hover`, so the
 * layer has nothing to apply. For a control the pointer lands on, hover is
 * expected — so this is a decision, and the decision is made by eye.
 *
 * Both answers are rendered side by side. Hover cannot be shown statically, so
 * the hovered surface is applied as the idle one: what you see in the right
 * column is what the pointer would produce.
 *
 * Run: bun scripts/gen-hover-test.tsx
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { Toggle } from '../src/components/atoms/Toggle/Toggle';
import { Checkbox } from '../src/components/inputs/Checkbox/Checkbox';
import { Radio } from '../src/components/inputs/Radio/Radio';
import { LADDER, getTextStyle } from '../src/engine/spec-engine';
import { resolveSurface } from '../src/engine/liminal-surface';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/hover-test.html');

const TEXT = getTextStyle('primary', 2).color as string;
const DIM = getTextStyle('secondary', 2).color as string;
const FAINT = getTextStyle('tertiary', 2).color as string;
const S = L.SPACING;
const R = L.RADIUS;

const LAYERS = ['liminal-interaction', 'liminal-mist', 'liminal-motion', 'liminal-forced-colors']
  .map((n) => readFileSync(resolve(__dirname, `../src/engine/${n}.css`), 'utf8')).join('\n');
const VARS = (readFileSync(resolve(__dirname, '../src/index.css'), 'utf8').match(/:root\s*\{[\s\S]*?\n\}/) ?? [''])[0];

const noop = () => {};
const render = (el: React.ReactElement) => renderToStaticMarkup(el);

/** The hover surface, applied as the idle one, so a still frame can show it. */
const hoverSurface = resolveSurface({ role: 'control', state: 'hover' }).background;

const card = (title: string, note: string, body: string) => `
  <div class="col">
    <div class="head"><b>${title}</b><span class="use">${note}</span></div>
    ${body}
  </div>`;

const row = (label: string, idle: string, hovered: string) => `
  <div class="cmp">
    <div class="lbl mono">${label}</div>
    <div class="pair">
      <div class="box"><span class="tag mono">idle</span>${idle}</div>
      <div class="box hovered"><span class="tag mono">hover</span>${hovered}</div>
    </div>
  </div>`;

/** The same component, with the surface forced to the hover value. */
const forced = (el: React.ReactElement) =>
  render(el).replace(/--liminal-surface-idle:[^;"]*/g, `--liminal-surface-idle:${hoverSurface}`);

const TOGGLE_IDLE = render(<Toggle checked={false} onChange={noop} aria-label="فعال" />);
const CHECKBOX_IDLE = render(<Checkbox checked={false} onChange={noop} label="میپذیرم" />);
const RADIO_IDLE = render(<Radio checked={false} onChange={noop} name="h" value="a" label="گزینه" />);

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — hover برای سه کنترل</title>
<style>
${VARS}
${LAYERS}
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${LADDER[0]}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; font-size:15px; line-height:1.7; }
  .wrap { max-width:1080px; margin:0 auto; padding:44px 24px 96px; }
  h1 { font-size:27px; margin:0 0 4px; font-weight:700; letter-spacing:-0.02em; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.1em; text-transform:uppercase; }
  .lede { color:${DIM}; max-width:80ch; margin:0 0 8px; }
  .claim { border-inline-start:2px solid ${LADDER[3]}; padding-inline-start:14px; margin:18px 0 28px; color:${DIM}; max-width:80ch; }
  .claim b { color:${TEXT}; }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:${S[4]}px; }
  @media (max-width:760px){ .grid { grid-template-columns:1fr; } }
  .col { border:1px solid ${LADDER[3]}; border-radius:${R.card}px; padding:${S[4]}px; background:${LADDER[1]}; }
  .head { display:flex; flex-direction:column; gap:2px; margin-bottom:${S[4]}px; }
  .head b { font-size:16px; }
  .use { color:${FAINT}; font-size:12px; }
  .mono { font-family:ui-monospace,monospace; font-size:12px; }
  .cmp { margin-bottom:${S[4]}px; }
  .lbl { color:${FAINT}; margin-bottom:${S[2]}px; }
  .pair { display:grid; grid-template-columns:1fr 1fr; gap:${S[2]}px; }
  .box { border:1px solid ${LADDER[3]}; border-radius:${R.control}px; padding:${S[3]}px; background:${LADDER[2]};
    display:flex; flex-direction:column; gap:${S[2]}px; align-items:flex-start; min-height:76px; }
  .box.hovered { border-color:${LADDER[5]}; }
  .tag { color:${FAINT}; font-size:10.5px; text-transform:uppercase; letter-spacing:.06em; }
  footer { color:${FAINT}; font-size:12px; margin-top:${S[6]}px; border-top:1px solid ${LADDER[3]}; padding-top:${S[4]}px; }
  code { font-family:ui-monospace,monospace; background:${LADDER[1]}; border:1px solid ${LADDER[3]}; border-radius:4px; padding:1px 5px; font-size:12px; }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">LIMINAL · تست چشمی · hover</p>
  <h1>آیا این سه کنترل باید hover داشته باشند؟</h1>
  <p class="lede">
    پروب می‌گوید <b>ندارند</b> — هیچ‌وقت <code>--liminal-surface-hover</code> را ست نمی‌کنند، پس لایه چیزی برای اعمال ندارد.
  </p>
  <p class="claim">
    برای کنترلی که <b>مکان‌نما رویش می‌نشیند</b>، hover انتظار می‌رود. پس این یک <b>تصمیم</b> است، و تصمیم با چشم گرفته می‌شود.
    <br>ستون راست <b>شبیه‌سازی hover</b> است: سطح hover به‌عنوان سطح idle اعمال شده، چون hover در یک فریم ثابت دیده نمی‌شود.
  </p>

  <div class="grid">
    ${card('الف — با hover', 'سطح یک نیم‌پله بالا می‌رود، مثل بقیه‌ی سیستم', `
      ${row('Toggle', TOGGLE_IDLE, forced(<Toggle checked={false} onChange={noop} aria-label="فعال" />))}
      ${row('Checkbox', CHECKBOX_IDLE, forced(<Checkbox checked={false} onChange={noop} label="می‌پذیرم" />))}
      ${row('Radio', RADIO_IDLE, forced(<Radio checked={false} onChange={noop} name="h2" value="a" label="گزینه" />))}
    `)}
    ${card('ب — بدون hover', 'همان چیزی که امروز هست', `
      ${row('Toggle', TOGGLE_IDLE, TOGGLE_IDLE)}
      ${row('Checkbox', CHECKBOX_IDLE, CHECKBOX_IDLE)}
      ${row('Radio', RADIO_IDLE, RADIO_IDLE)}
    `)}
  </div>

  <footer>
    تولید‌شده توسط <code>scripts/gen-hover-test.tsx</code> · بدون شبکه ·
    سطح hover از موتور: <code>${hoverSurface}</code>
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
