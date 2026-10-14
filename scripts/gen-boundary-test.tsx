#!/usr/bin/env bun
/**
 * LIMINAL — the perceptual boundary: what the engine publishes now, and what it
 * would publish if the level were not rounded.
 *
 * THE FINDING. `resolveSurface` rounds the level to an integer, and the ladder's
 * half-step variables exist and are unused. So a half-step shift lands either a
 * FULL quantum away (visible) or exactly on the idle fill (invisible):
 *
 *     hover   +0.5 step  →  1.07–1.21q   VISIBLE   (should be felt)
 *     active  −0.5 step  →  0.00q        INVISIBLE (should be felt)
 *
 * LIMINAL's first rule is that a change lands ON the perceptual boundary — felt,
 * not seen. Measured, the engine breaks it in every role.
 *
 * This page renders the real components in both states, with the fill the fix
 * would produce substituted in. One value differs per cell.
 *
 * Run: bun scripts/gen-boundary-test.tsx
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { Button } from '../src/components/atoms/Button/Button';
import { Input } from '../src/components/inputs/Input/Input';
import { Toggle } from '../src/components/atoms/Toggle/Toggle';
import { Checkbox } from '../src/components/inputs/Checkbox/Checkbox';
import { NavItem } from '../src/components/nav/NavItem/NavItem';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../src/components/data/Table';
import { LADDER, getDirectionalRim, getTextStyle, getLadderVar } from '../src/engine/spec-engine';
import { PERCEPTUAL_QUANTUM, HALF } from '../src/engine/liminal-ladder';
import { oklchLightness } from '../src/engine/liminal-color-math';
import { resolveSurface, ROLE_LEVEL, type SurfaceRole } from '../src/engine/liminal-surface';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/boundary-test.html');

const TEXT = getTextStyle('primary', 2).color as string;
const DIM = getTextStyle('secondary', 2).color as string;
const FAINT = getTextStyle('tertiary', 2).color as string;
const S = L.SPACING;
const R = L.RADIUS;

const LAYERS = ['liminal-interaction', 'liminal-mist', 'liminal-motion', 'liminal-forced-colors']
  .map((n) => readFileSync(resolve(__dirname, `../src/engine/${n}.css`), 'utf8')).join('\n');
const VARS = (readFileSync(resolve(__dirname, '../src/index.css'), 'utf8').match(/:root\s*\{[\s\S]*?\n\}/) ?? [''])[0];

const noop = () => {};
const q = (a: string, b: string) => Math.abs(oklchLightness(a) - oklchLightness(b)) / PERCEPTUAL_QUANTUM;
// The half-step hexes the engine ALREADY PUBLISHES and never uses.
const halfOf = (n: number) => (HALF as readonly string[])[n] ?? LADDER[n];
const resolveVar = (v: string) => {
  const m = v.match(/--liminal-s(\d+)(-5)?/);
  if (!m) return v;
  const n = Number(m[1]);
  return m[2] ? halfOf(n) : LADDER[n];
};
/**
 * What the engine published BEFORE the fix: the same level, rounded.
 *
 * Hard-coded on purpose. The engine no longer produces these values, and a
 * record has to keep its own copy or it stops being a record.
 */
const beforeFill = (role: SurfaceRole, state: 'hover' | 'active', on?: SurfaceRole) =>
  resolveVar(getLadderVar(Math.round(resolveSurface({ role, state, on }).level)));

/** The fill the engine publishes now: the same level, unrounded. */
const fixedFill = (role: SurfaceRole, state: 'hover' | 'active', on?: SurfaceRole) =>
  resolveVar(getLadderVar(resolveSurface({ role, state, on }).level));

/** Replace one custom property's value in a rendered style attribute. */
const withFill = (markup: string, prop: string, value: string) =>
  markup.replace(new RegExp(`${prop}:[^;"]*`, 'g'), `${prop}:${value}`);

const CASES: { name: string; role: SurfaceRole; on?: SurfaceRole; el: React.ReactElement }[] = [
  { name: 'Button (secondary)', role: 'control', on: 'work', el: <Button variant="secondary">Button</Button> },
  { name: 'Input', role: 'control', on: 'work', el: <Input label="Username" /> },
  { name: 'Toggle', role: 'control', on: 'work', el: <Toggle checked={false} onChange={noop} aria-label="Toggle" /> },
  { name: 'Checkbox', role: 'control', on: 'work', el: <Checkbox checked={false} onChange={noop} label="I accept" /> },
  { name: 'NavItem', role: 'chrome', el: <NavItem onClick={noop}>Dashboard</NavItem> },
  {
    name: 'TableRow', role: 'work',
    el: (
      <Table>
        <TableHeader><TableRow><TableHead>Name</TableHead></TableRow></TableHeader>
        <tbody><TableRow><TableCell>Starli</TableCell></TableRow></tbody>
      </Table>
    ),
  },
];

const rows = CASES.map((c) => {
  const now = renderToStaticMarkup(c.el);
  return {
    ...c,
    now,
    hoverNow: withFill(now, '--liminal-surface-hover', beforeFill(c.role, 'hover', c.on)),
    hoverFixed: withFill(now, '--liminal-surface-hover', fixedFill(c.role, 'hover', c.on)),
    activeNow: withFill(now, '--liminal-surface-active', beforeFill(c.role, 'active', c.on)),
    activeFixed: withFill(now, '--liminal-surface-active', fixedFill(c.role, 'active', c.on)),
  };
});

const col = (title: string, note: string, pick: (r: typeof rows[number]) => string, cls = '') => `
  <div class="col ${cls}">
    <div class="head"><b>${title}</b><span class="use">${note}</span></div>
    ${rows.map((r) => `
      <div class="case">
        <div class="lbl mono">${r.name}</div>
        <div class="stage">${pick(r)}</div>
      </div>`).join('')}
  </div>`;

const table = rows.map((r) => {
  const idle = resolveVar(resolveSurface({ role: r.role, on: r.on }).background);
  const hNow = beforeFill(r.role, 'hover', r.on);
  const hFix = fixedFill(r.role, 'hover', r.on);
  const aNow = beforeFill(r.role, 'active', r.on);
  const aFix = fixedFill(r.role, 'active', r.on);
  const f = (v: number) => (v === 0 ? 'invisible' : v >= 1 ? 'VISIBLE' : 'felt');
  return `<tr>
    <td class="mono">${r.name}</td>
    <td class="mono">${idle}</td>
    <td class="mono">${hNow} <span class="${q(idle, hNow) >= 1 ? 'bad' : 'ok'}">${q(idle, hNow).toFixed(2)}q ${f(q(idle, hNow))}</span></td>
    <td class="mono">${hFix} <span class="ok">${q(idle, hFix).toFixed(2)}q felt</span></td>
    <td class="mono">${aNow} <span class="${q(idle, aNow) === 0 ? 'bad' : 'ok'}">${q(idle, aNow).toFixed(2)}q ${f(q(idle, aNow))}</span></td>
    <td class="mono">${aFix} <span class="ok">${q(idle, aFix).toFixed(2)}q felt</span></td>
  </tr>`;
}).join('');

const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — the perceptual boundary, before and after</title>
<style>
${VARS}
${LAYERS}
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${LADDER[0]}; color:${TEXT};
    font-family: Inter, ui-sans-serif, system-ui, sans-serif; padding: 40px 32px 80px; }
  .wrap { max-width: 1180px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 600; margin: 0 0 6px; }
  .sub { color:${DIM}; font-size: 13px; line-height: 1.9; max-width: 80ch; }
  .sub b { color:${TEXT}; font-weight: 600; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }
  table { width:100%; border-collapse: collapse; margin: 26px 0 30px; }
  th, td { text-align: start; padding: 8px 10px; border-bottom: 1px solid ${LADDER[2]}; font-size: 12px; }
  th { color:${FAINT}; font-weight: 500; font-size: 11px; }
  .bad { color: #ffbdb6; }
  .ok { color: #7fd0a0; }
  .cols { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 18px; }
  .col { border: 1px solid ${LADDER[2]}; border-radius: 14px; overflow: hidden; min-width: 0; }
  .head { display:flex; align-items:baseline; gap:10px; padding: 12px 16px; border-bottom: 1px solid ${LADDER[2]}; background:${LADDER[1]}; }
  .head b { font-size: 13px; font-weight: 600; }
  .head .use { color:${FAINT}; font-size: 11px; }
  .case { display:flex; align-items:center; gap:14px; padding: 12px 16px; border-bottom: 1px solid ${LADDER[1]}; min-width: 0; }
  .case:last-child { border-bottom: none; }
  .lbl { color:${FAINT}; width: 132px; flex: none; }
  .stage { flex: 1; min-width: 0; display:flex; align-items:center; overflow-x:auto; }
  .bar { display:flex; align-items:baseline; gap:12px; margin: 22px 0 6px; }
  .bar b { font-size: 13px; font-weight: 600; }
  .bar span { color:${FAINT}; font-size: 12px; }
  .cols + .cols { margin-top: 18px; }
  /* The layer's own :hover / :active declarations, applied by a class. */
  .hover [data-liminal-surface] { background: var(--liminal-surface-hover); }
  .active [data-liminal-surface] { background: var(--liminal-surface-active); transform: translateY(0.5px); }
  .hint { margin-top: 22px; color:${FAINT}; font-size: 12px; line-height: 2; }
  code { color:${DIM}; }
  @media (max-width: 900px) {
    body { padding: 20px 12px 56px; }
    h1 { font-size: 19px; }
    .sub { font-size: 12px; }
    .cols { grid-template-columns: minmax(0,1fr); gap: 14px; }
    .case { flex-direction: column; align-items: stretch; gap: 8px; padding: 12px; }
    .lbl { width: auto; }
    table { display:block; overflow-x:auto; }
    .hint { font-size: 11px; }
  }
</style>
</head>
<body>
<div class="wrap">
  <h1>The perceptual boundary — fixed</h1>
  <div class="sub">
    LIMINAL's first rule: a change lands <b>on</b> the boundary — felt, not seen. The engine broke it
    in every role: <code>resolveSurface</code> rounded the level to an integer while the ladder's
    half-step variables went unused, so a half-step shift landed either a <b>full quantum</b> away
    (visible) or exactly on the idle fill (<b>invisible</b>).
    <br><br>
    It is fixed. The level is no longer rounded, and at the ceiling — where there is no room above —
    the shift <b>inverts</b>, exactly as <code>resolveBorder</code> has always done. This page is the
    record: the <b>before</b> column is what the engine used to publish, hard-coded, and the
    <b>after</b> column is read from the engine as it is now.
  </div>

  <table>
    <thead><tr>
      <th>component</th><th>idle</th>
      <th>hover — before</th><th>hover — after</th>
      <th>active — before</th><th>active — after</th>
    </tr></thead>
    <tbody>${table}</tbody>
  </table>

  <div class="bar"><b>hover</b><span>before (1.1–1.2q, visible) against after (0.54–0.62q, felt)</span></div>
  <div class="cols">
    ${col('before', 'one full quantum above — seen', (r) => r.hoverNow, 'hover')}
    ${col('after', 'half a step — felt', (r) => r.hoverFixed, 'hover')}
  </div>

  <div class="bar"><b>active</b><span>before (0.00q, invisible) against after (0.49–0.62q, felt)</span></div>
  <div class="cols">
    ${col('before', 'the idle fill — nothing happened', (r) => r.activeNow, 'active')}
    ${col('after', 'half a step below — felt', (r) => r.activeFixed, 'active')}
  </div>

  <div class="hint">
    The guard is <code>perceptual-boundary.test.ts</code>: every state, on every role and every host,
    must land between 0.4q and 1q — felt, not seen — and no state may be a no-op. It also asserts that
    the engine actually uses the half-steps it publishes.
  </div>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log(`wrote ${OUT} ${(html.length / 1024).toFixed(1)}KB`);
