#!/usr/bin/env bun
/**
 * LIMINAL — what should a control do when it is PRESSED?
 *
 * The producer's default is the engine's active level: one half-step below the
 * control's own. Ten sites pass `active` explicitly instead, and nine of them
 * pass the SAME expression they passed for `hover` — press keeps the lift
 * rather than dropping. The line is a copy of the hover line, the contract says
 * nothing about press, and the layer's own comment says "active one half-step
 * below, pressed". So it is probably a habit. It is also a visible difference,
 * so it is a decision, and the decision is made by eye.
 *
 * Both answers are rendered side by side, live: hover and press the real
 * components. Press is transient, so hold the mouse down.
 *
 * Run: bun scripts/gen-press-test.tsx
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { Toggle } from '../src/components/atoms/Toggle/Toggle';
import { Checkbox } from '../src/components/inputs/Checkbox/Checkbox';
import { Radio } from '../src/components/inputs/Radio/Radio';
import { Tabs } from '../src/components/nav/Tabs/Tabs';
import { NavItem } from '../src/components/nav/NavItem/NavItem';
import { Table, TableHeader, TableRow, TableHead, TableCell } from '../src/components/data/Table';
import { Calendar } from '../src/components/data/Calendar/Calendar';
import { Toast } from '../src/components/feedback/Toast/Toast';
import { DropdownMenuContext } from '../src/components/nav/DropdownMenu/DropdownMenu';
import { DropdownMenuItem } from '../src/components/nav/DropdownMenu/DropdownMenuItem';
import { LADDER, getTextStyle } from '../src/engine/spec-engine';
import { resolveSurface, type SurfaceRole } from '../src/engine/liminal-surface';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/press-test.html');

const TEXT = getTextStyle('primary', 2).color as string;
const DIM = getTextStyle('secondary', 2).color as string;
const FAINT = getTextStyle('tertiary', 2).color as string;
const S = L.SPACING;

const LAYERS = ['liminal-interaction', 'liminal-mist', 'liminal-motion', 'liminal-forced-colors']
  .map((n) => readFileSync(resolve(__dirname, `../src/engine/${n}.css`), 'utf8')).join('\n');
const VARS = (readFileSync(resolve(__dirname, '../src/index.css'), 'utf8').match(/:root\s*\{[\s\S]*?\n\}/) ?? [''])[0];

const noop = () => {};
const render = (el: React.ReactElement) => renderToStaticMarkup(el);

/**
 * The role each component declares to the engine, so the value the producer
 * WOULD have used can be computed rather than guessed. This is the whole
 * comparison: the component's own value against the engine's.
 */
const ROLE: Record<string, { role: SurfaceRole; on?: SurfaceRole }> = {
  Toggle: { role: 'control', on: 'work' },
  Checkbox: { role: 'control', on: 'work' },
  Radio: { role: 'control', on: 'work' },
  Tabs: { role: 'control', on: 'work' },
  Table: { role: 'work' },
  Calendar: { role: 'control', on: 'work' },
  Toast: { role: 'control', on: 'toast' },
  DropdownMenuItem: { role: 'menu' },
  NavItem: { role: 'chrome' },
};

const engineActive = (name: string) =>
  resolveSurface({ role: ROLE[name].role, state: 'active', on: ROLE[name].on }).background;

/** The same markup, with the pressed fill replaced by the engine's. */
const withEngineActive = (markup: string, name: string) =>
  markup.replace(/--liminal-surface-active:[^;"]*/g, `--liminal-surface-active:${engineActive(name)}`);

/** What the component publishes for `active` today. */
const ownActive = (markup: string) => (markup.match(/--liminal-surface-active:([^;"]*)/) ?? [])[1] ?? '—';

const menuCtx = {
  isOpen: true, open: noop, close: noop, toggle: noop,
  triggerRef: { current: null }, floatingRef: { current: null },
  position: {} as never, updatePosition: noop,
} as never;

const CASES: { name: string; note: string; el: React.ReactElement }[] = [
  { name: 'Toggle', note: 'خاموش', el: <Toggle checked={false} onChange={noop} aria-label="فعال" /> },
  { name: 'Checkbox', note: 'تیک‌نخورده', el: <Checkbox checked={false} onChange={noop} label="می‌پذیرم" /> },
  { name: 'Radio', note: 'انتخاب‌نشده', el: <Radio checked={false} onChange={noop} name="p" value="a" label="گزینه" /> },
  {
    name: 'Tabs', note: 'تبِ غیرفعال',
    // The deviation is on the INACTIVE tab, and the probe reads the first one.
    el: <Tabs value="b" onChange={noop} items={[{ id: 'a', label: 'غیرفعال' }, { id: 'b', label: 'فعال' }]} />,
  },
  {
    name: 'Table', note: 'ردیفِ انتخاب‌نشده',
    el: (
      <Table>
        <TableHeader><TableRow><TableHead>نام</TableHead></TableRow></TableHeader>
        <tbody><TableRow><TableCell>ستارلی</TableCell></TableRow></tbody>
      </Table>
    ),
  },
  {
    name: 'Calendar', note: 'روزِ انتخاب‌نشده',
    el: <Calendar month={new Date(Date.UTC(2026, 9, 1))} />,
  },
  {
    name: 'DropdownMenuItem', note: 'آیتمِ منو',
    el: (
      <DropdownMenuContext.Provider value={menuCtx}>
        <div style={{ background: 'var(--liminal-s5)', borderRadius: `${L.RADIUS.chip}px`, padding: `${S[1]}px`, width: 220 }}>
          <DropdownMenuItem>تغییر نام</DropdownMenuItem>
        </div>
      </DropdownMenuContext.Provider>
    ),
  },
  { name: 'NavItem', note: 'آیتمِ غیرفعال', el: <NavItem onClick={noop}>داشبورد</NavItem> },
];

const rows = CASES.map((c) => {
  const a = render(c.el);
  return { ...c, a, b: withEngineActive(a, c.name), own: ownActive(a), engine: engineActive(c.name) };
});

/**
 * Toast renders through a portal, and a portal does not survive
 * renderToStaticMarkup — so its action button cannot be shown here. Its values
 * are read from the code instead and listed, so the comparison is still whole.
 */
const PORTALLED = [{ name: 'Toast', note: 'دکمهٔ اکشن — پورتال، استاتیک رندر نمی‌شود', own: 'SURFACE_TINT.medium', engine: engineActive('Toast') }];

const col = (title: string, note: string, body: string, cls = '') => `
  <div class="col ${cls}">
    <div class="head"><b>${title}</b><span class="use">${note}</span></div>
    ${body}
  </div>`;

const cell = (label: string, markup: string) => `
  <div class="case">
    <div class="lbl mono">${label}</div>
    <div class="stage">${markup}</div>
  </div>`;

const table = [...rows, ...PORTALLED].map((r) => `
  <tr>
    <td class="mono" data-label="کامپوننت">${r.name}</td>
    <td class="muted" data-label="حالت">${r.note}</td>
    <td class="mono" data-label="مقدار فعلی (A)">${r.own}</td>
    <td class="mono" data-label="پیش‌فرض (B)">${r.engine}</td>
    <td class="${r.own === r.engine ? 'same' : 'diff'}" data-label="نتیجه">${r.own === r.engine ? 'بدون تفاوت' : 'تفاوت دارد'}</td>
  </tr>`).join('');

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — فشردن: بلندی بماند یا یک پله پایین؟</title>
<style>
${VARS}
${LAYERS}
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${LADDER[0]}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif; padding: 40px 32px 80px; }
  .wrap { max-width: 1180px; margin: 0 auto; }
  h1 { font-size: 22px; font-weight: 600; margin: 0 0 6px; }
  .sub { color:${DIM}; font-size: 13px; line-height: 1.9; max-width: 74ch; }
  .sub b { color:${TEXT}; font-weight: 600; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 11px; }
  .muted { color:${FAINT}; font-size: 12px; }
  table { width:100%; border-collapse: collapse; margin: 26px 0 34px; }
  th, td { text-align: right; padding: 8px 10px; border-bottom: 1px solid ${LADDER[2]}; font-size: 12px; }
  th { color:${FAINT}; font-weight: 500; font-size: 11px; }
  .diff { color: #ffbdb6; }
  .same { color:${FAINT}; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .col { border: 1px solid ${LADDER[2]}; border-radius: 14px; overflow: hidden; background:${LADDER[0]}; }
  .head { display:flex; align-items:baseline; gap:10px; padding: 12px 16px; border-bottom: 1px solid ${LADDER[2]}; background:${LADDER[1]}; }
  .head b { font-size: 13px; font-weight: 600; }
  .head .use { color:${FAINT}; font-size: 11px; }
  .case { display:flex; align-items:center; gap:14px; padding: 12px 16px; border-bottom: 1px solid ${LADDER[1]}; }
  .case:last-child { border-bottom: none; }
  .lbl { color:${FAINT}; width: 132px; flex: none; }
  .stage { flex: 1; min-width: 0; display:flex; align-items:center; }
  .hint { margin-top: 22px; color:${FAINT}; font-size: 12px; line-height: 2; }
  .hint code { color:${DIM}; }
  /* The layer's own :active rule, applied by a class so a still frame can show
     it. Identical declarations — only the trigger differs. */
  .pressed [data-liminal-surface] {
    background: var(--liminal-surface-active);
    transform: translateY(0.5px);
  }
  .bar { display:flex; align-items:baseline; gap:12px; margin: 22px 0 6px; }
  .bar b { font-size: 13px; font-weight: 600; }
  .bar span { color:${FAINT}; font-size: 12px; }
  .cols + .cols { margin-top: 18px; }

  /* ── Narrow screens ──────────────────────────────────────────────────────
   * This page IS a comparison, and a comparison needs room. Side by side on a
   * phone gives each column about 150px: the label takes 132 of them, the
   * component gets a sliver, and the Calendar pushes the whole layout viewport
   * wider than the device — measured at 507px on a 390px screen.
   *
   * Below 900px the columns stack, the label moves above the component, and
   * the values table becomes one card per row. Nothing is hidden: every value
   * that was readable on a desktop is readable on a phone.
   */
  @media (max-width: 900px) {
    body { padding: 20px 12px 56px; }
    h1 { font-size: 19px; }
    .sub { font-size: 12px; }
    .cols { grid-template-columns: 1fr; gap: 14px; }
    .cols + .cols { margin-top: 14px; }
    .case { flex-direction: column; align-items: stretch; gap: 8px; padding: 12px; }
    .lbl { width: auto; }
    /* A component still wider than the screen scrolls inside its own row
       rather than dragging the page. The Calendar is the one that does. */
    .stage { overflow-x: auto; }
    .bar { flex-direction: column; gap: 2px; margin: 18px 0 6px; }
    thead { display: none; }
    table { margin: 18px 0 22px; }
    tr { display: block; border: 1px solid ${LADDER[2]}; border-radius: 12px; padding: 10px 12px; margin-bottom: 10px; }
    td { display: flex; justify-content: space-between; align-items: baseline; gap: 14px; border: none; padding: 3px 0; }
    td::before { content: attr(data-label); color:${FAINT}; font-size: 11px; flex: none; }
    .hint { font-size: 11px; line-height: 1.9; }
  }
</style>
</head>
<body>
<div class="wrap">
  <h1>فشردن: بلندی بماند، یا یک پله پایین برود؟</h1>
  <div class="sub">
    ده سایت <span class="mono">active</span> را دستی می‌دهند، و نُهِ آن‌ها دقیقاً همان عبارتی را می‌دهند که به
    <span class="mono">hover</span> داده‌اند — یعنی هنگام فشردن، بلندی حفظ می‌شود. پیش‌فرض تولیدکننده سطحِ
    <span class="mono">active</span> موتور است: یک پله پایین‌تر. هر دو، زنده و کنار هم. <b>موس را نگه دار</b> تا حالت فشرده را ببینی.
  </div>

  <table>
    <thead><tr><th>کامپوننت</th><th>حالت</th><th>مقدار فعلی (A)</th><th>پیش‌فرض تولیدکننده (B)</th><th></th></tr></thead>
    <tbody>${table}</tbody>
  </table>

  <div class="bar"><b>زنده</b><span>موس را روی کامپوننت‌ها نگه دار و فشار بده — هر دو ستون واقعی‌اند.</span></div>
  <div class="cols">
    ${col('A — بلندی حفظ می‌شود', 'همان چیزی که امروز در کد است', rows.map((r) => cell(r.name, r.a)).join(''))}
    ${col('B — یک پله پایین می‌رود', 'پیش‌فرض تولیدکننده', rows.map((r) => cell(r.name, r.b)).join(''))}
  </div>

  <div class="bar"><b>فشرده</b><span>حالت فشرده، ثابت — همان تعریف‌های <code>:active</code> خودِ لایه، با کلاس به‌جای شبه‌کلاس.</span></div>
  <div class="cols">
    ${col('A — فشرده', 'بلندی حفظ می‌شود', rows.map((r) => cell(r.name, r.a)).join(''), 'pressed')}
    ${col('B — فشرده', 'یک پله پایین می‌رود', rows.map((r) => cell(r.name, r.b)).join(''), 'pressed')}
  </div>

  <div class="hint">
    هر دو ستون کامپوننت‌های واقعی‌اند، با همان لایهٔ تعامل. تنها تفاوت، مقدار
    <code>--liminal-surface-active</code> است.<br>
    در ستون A، فشردن رنگ hover را نگه می‌دارد (فقط ۰٫۵px پایین می‌رود). در ستون B، فشردن به سطح
    <code>active</code> موتور برمی‌گردد.
  </div>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log(`wrote ${OUT} ${(html.length / 1024).toFixed(1)}KB`);
for (const r of [...rows, ...PORTALLED]) console.log(`  ${r.name.padEnd(17)} A=${r.own.padEnd(18)} B=${r.engine.padEnd(14)} ${r.own === r.engine ? 'same' : 'DIFFERS'}`);
