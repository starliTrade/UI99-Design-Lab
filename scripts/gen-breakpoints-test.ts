#!/usr/bin/env bun
/**
 * LIMINAL — Step 2.2 eye test: the derived breakpoints.
 *
 * Generates design-lab/breakpoints-test.html — a self-contained page where you
 * DRAG a width and watch the real components answer to it.
 *
 * Two rules this file obeys:
 *
 *  1. No parallel copy of a number. Every breakpoint, spacing value and type
 *     size is read from LiminalLayoutEngine; every component is the real
 *     component rendered to static markup.
 *
 *  2. Each specimen lives in its own iframe, because the three mechanisms
 *     answer to three different things:
 *        container query  -> its own box      (grid, form)
 *        media query      -> the viewport     (shell, sidebar)
 *        vw in clamp()    -> the viewport     (fluid type)
 *     Resizing a <div> can only demonstrate the first. An iframe is a real
 *     viewport, so all three behave exactly as they do in production.
 *
 * Run:  bun scripts/gen-breakpoints-test.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';

import { LiminalLayoutEngine } from '../src/engine/liminal-layout-engine';
import { Grid, GridCol } from '../src/components/layout/Grid/Grid';
import { AppShell } from '../src/components/layout/AppShell/AppShell';
import { Sidebar } from '../src/components/nav/Sidebar/Sidebar';
import FormLayout from '../src/components/composites/FormLayout/FormLayout';
import { Input } from '../src/components/inputs/Input/Input';
import { getLadderColor } from '../src/engine/spec-engine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/breakpoints-test.html');

const E = LiminalLayoutEngine;
const BP = E.BREAKPOINTS;
const S = E.SPACING;
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8] as const;
const ROLES: Record<number, string> = {
  1: 'meta · quaternary', 2: 'label · tertiary', 3: 'body · secondary', 4: 'lead · h4',
  5: 'h3', 6: 'h2', 7: 'h1', 8: 'display',
};

const h = React.createElement;
const strip = (html: string) => html.replace(/<style>[\s\S]*?<\/style>/g, '');
const styleOf = (html: string) =>
  (html.match(/<style>([\s\S]*?)<\/style>/g) ?? []).map((s) => s.replace(/<\/?style>/g, '')).join('\n');

// ── The real components, rendered once ──────────────────────────────────────
const gridHtml = renderToStaticMarkup(
  h(Grid, { gap: 'md' },
    ...[1, 2, 3, 4].map((i) =>
      h(GridCol, { key: i, col: 3, md: 6, sm: 12 },
        h('div', { className: 'cell' }, `کارت ${i}`)))),
);

const formHtml = renderToStaticMarkup(
  h(FormLayout, {},
    h(FormLayout.Section, { title: 'بخش اول' },
      h(FormLayout.Row, { cols: 2 },
        h(FormLayout.Field, { label: 'نام' }, h(Input, { placeholder: 'نام' })),
        h(FormLayout.Field, { label: 'نام خانوادگی' }, h(Input, { placeholder: 'نام خانوادگی' })),
      ),
    ),
  ),
);

const shellHtml = renderToStaticMarkup(
  h(AppShell, {
    topbar: h('div', { className: 'shell-topbar' }, 'Topbar'),
    sidebar: h(Sidebar, {}, h('div', { className: 'shell-nav' }, 'ناوبری')),
    mobileNav: h('div', { className: 'shell-mobile-nav' }, 'ناوبری موبایل'),
    maxWidth: 1280,
  }, h('div', { className: 'shell-content' }, 'محتوا')),
);

const gridCss = styleOf(gridHtml);
const formCss = styleOf(formHtml);
const shellCss = styleOf(shellHtml);

// ── The counterfactual, derived rather than hand-written ────────────────────
// The real component emits `@container liminal-grid (max-width: 944px)`.
// Swapping that one token for `@media` reproduces exactly the pre-2.2 code.
const mediaCss = gridCss
  .replace(/@container liminal-grid \(max-width: (\d+)px\)/g, '@media (max-width: $1px)')
  .replace(/\.liminal-grid \{[^}]*\}/, '');

// ── Page palette, read from the ladder ──────────────────────────────────────
const canvas = getLadderColor(0);
const work = getLadderColor(2);
const TEXT = 'rgba(233,236,242,0.92)';
const DIM = 'rgba(233,236,242,0.55)';
const FAINT = 'rgba(233,236,242,0.28)';
const LINE = 'rgba(233,236,242,0.10)';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A self-contained specimen: real component + its own readout, inside a viewport. */
function specimen(opts: { body: string; css: string; readout: string; height: number; width?: string }) {
  const doc = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><style>
    *{box-sizing:border-box}
    html{font-size:16px}
    body{margin:0;background:${canvas};color:${TEXT};
      font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;font-size:13px}
    .cell{background:${work};border-radius:8px;padding:14px 10px;text-align:center;color:${DIM};font-size:12px}
    .shell-topbar,.shell-nav,.shell-content,.shell-mobile-nav{background:${work};border-radius:8px;padding:14px;color:${DIM};font-size:12px}
    .ro{position:sticky;bottom:0;margin:0;padding:7px 10px;background:rgba(0,0,0,0.55);
      font-family:ui-monospace,monospace;font-size:11px;color:${TEXT};border-top:1px solid ${LINE}}
    .ro b{color:#9ecbff}
    ${opts.css}
  </style></head><body>
    <div class="stage">${opts.body}</div>
    <pre class="ro" id="ro">…</pre>
    <script>
      const ro = document.getElementById('ro');
      function paint() {
        try { ro.innerHTML = (${opts.readout})(); } catch (e) { ro.textContent = 'خطا: ' + e.message; }
      }
      paint();
      new ResizeObserver(paint).observe(document.documentElement);
      window.addEventListener('resize', paint);
    </script>
  </body></html>`;
  return `<iframe loading="eager" style="width:${opts.width ?? 'var(--w)'};height:${opts.height}px"
    srcdoc="${esc(doc)}" title="specimen"></iframe>`;
}

const gridSpecimen = specimen({
  body: strip(gridHtml),
  css: gridCss,
  height: 190,
  readout: `() => {
    const c = document.querySelector('.liminal-grid-col');
    const g = document.querySelector('.liminal-grid');
    const span = getComputedStyle(c).gridColumn;
    const n = span.match(/span (\\d+)/);
    return 'عرض گرید <b>' + Math.round(g.getBoundingClientRect().width) + 'px</b> · span ستون اول <b>' + span + '</b>' +
      ' · ' + (n && +n[1] === 3 ? '۱۲ستونه (کامل)' : n && +n[1] === 6 ? '۶ستونه (میانی)' : 'تک‌ستونه');
  }`,
});

const formSpecimen = specimen({
  body: strip(formHtml),
  css: formCss,
  height: 300,
  readout: `() => {
    const r = document.querySelector('.liminal-form-row');
    const w = Math.round(document.querySelector('.liminal-form-layout').getBoundingClientRect().width);
    const cols = getComputedStyle(r).gridTemplateColumns.split(' ').length;
    return 'عرض فرم <b>' + w + 'px</b> · ستون‌های ردیف <b>' + cols + '</b> · ' + (cols >= 2 ? 'دو فیلد کنار هم' : 'تک‌ستونه');
  }`,
});

const shellSpecimen = specimen({
  body: strip(shellHtml),
  css: shellCss,
  height: 320,
  readout: `() => {
    const bar = document.querySelector('.liminal-shell-sidebar');
    const nav = document.querySelector('.liminal-shell-mobile-nav');
    const barVis = bar && getComputedStyle(bar).display !== 'none';
    const navVis = nav && getComputedStyle(nav).display !== 'none';
    return 'عرض <b>' + window.innerWidth + 'px</b> · سایدبار <b>' + (barVis ? 'دیده می‌شود' : 'پنهان') + '</b>' +
      ' · ناوبری موبایل <b>' + (navVis ? 'دیده می‌شود' : 'پنهان') + '</b>';
  }`,
});

// The type scale: eight levels rendered from the published fluid variables,
// next to the static px the components actually render today.
const typeBody = LEVELS.map((n) =>
  `<div class="trow"><span class="tnum">${n}</span><span class="trole">${ROLES[n]}</span>` +
  `<span class="tfluid" style="font-size:var(--liminal-fs-${n})">آفرینش</span>` +
  `<span class="tstatic" style="font-size:${E.TYPOGRAPHY[n].fs}px">آفرینش</span></div>`).join('');

const typeSpecimen = specimen({
  body: typeBody,
  css: `
    :root{--liminal-type-base:${E.TYPE_BASE_CSS};${LEVELS.map((n) =>
      `--liminal-fs-${n}:calc(var(--liminal-type-base) * ${E.typeScale(n).toFixed(6)});`).join('')}}
    .trow{display:grid;grid-template-columns:22px 150px 1fr 1fr;gap:10px;align-items:baseline;
      padding:5px 0;border-bottom:1px solid ${LINE}}
    .tnum{font-family:ui-monospace,monospace;font-size:11px;color:${FAINT}}
    .trole{font-family:ui-monospace,monospace;font-size:10px;color:${FAINT}}
    .tfluid{color:${TEXT}}
    .tstatic{color:${DIM};opacity:.75}
    .thead{display:grid;grid-template-columns:22px 150px 1fr 1fr;gap:10px;padding-bottom:6px;
      font-family:ui-monospace,monospace;font-size:10px;color:${FAINT};border-bottom:1px solid ${LINE}}
  `,
  height: 400,
  readout: `() => {
    const p = document.createElement('div'); p.style.cssText='position:absolute;visibility:hidden'; document.body.appendChild(p);
    const out = [];
    for (let n=1;n<=8;n++){ p.style.fontSize='var(--liminal-fs-'+n+')';
      out.push(n + ':' + (Math.round(parseFloat(getComputedStyle(p).fontSize)*100)/100)); }
    p.remove();
    return 'پایه‌ی شناور در ' + window.innerWidth + 'px → <b>' + out.join('  ') + '</b> px';
  }`,
});

const presets = [
  { w: 320, label: '۳۲۰', note: 'WCAG 1.4.10' },
  { w: BP.formRow, label: String(BP.formRow), note: 'formRow' },
  { w: BP.gridMid, label: String(BP.gridMid), note: 'gridMid' },
  { w: BP.shellSidebar, label: String(BP.shellSidebar), note: 'shellSidebar' },
  { w: BP.gridWide, label: String(BP.gridWide), note: 'gridWide' },
  { w: 1440, label: '۱۴۴۰', note: 'دسکتاپ' },
];

const witness = (label: string, w: number, css: string, note: string, body = strip(gridHtml)) =>
  `<figure class="witness">
     <figcaption><b>${label}</b><span>${w}px</span></figcaption>
     ${specimen({ body, css, height: 176, width: `${w}px`, readout: `() => {
        const g = document.querySelector('.liminal-grid-col');
        if (g) { const n = getComputedStyle(g).gridColumn.match(/span (\\d+)/);
          return 'عرض <b>' + Math.round(g.parentElement.getBoundingClientRect().width) + '</b> · span <b>' + (n ? n[1] : '?') + '</b>'; }
        const r = document.querySelector('.liminal-form-row');
        if (r) { return 'عرض <b>' + Math.round(r.getBoundingClientRect().width) + '</b> · <b>' + getComputedStyle(r).gridTemplateColumns.split(' ').length + '</b> ستون'; }
        return '—'; }` })}
     <p class="witness-note">${note}</p>
   </figure>`;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — تست چشمی نقطه‌های شکست · Step 2.2</title>
<style>
  :root { color-scheme: dark; --w: ${BP.gridWide}px; }
  * { box-sizing: border-box; }
  body { margin:0; background:${canvas}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size:14px; line-height:1.75; }
  .wrap { max-width:1180px; margin:0 auto; padding:40px 24px 96px; }
  h1 { font-size:26px; margin:0 0 6px; font-weight:700; letter-spacing:-0.02em; }
  h2 { font-size:17px; margin:0 0 6px; font-weight:600; }
  .sub { color:${DIM}; margin:0 0 28px; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.08em; text-transform:uppercase; }
  section { border:1px solid ${LINE}; border-radius:14px; padding:20px; margin:0 0 20px; background:rgba(233,236,242,0.012); }
  .deriv { font-family:ui-monospace,monospace; font-size:12px; color:${DIM};
    background:rgba(233,236,242,0.045); border-radius:8px; padding:10px 12px; margin:10px 0 16px; white-space:pre-wrap; }
  .deriv b { color:${TEXT}; }
  .frame { border:1px dashed rgba(233,236,242,0.22); border-radius:10px; padding:10px; overflow-x:auto; background:${canvas}; }
  .frame iframe { border:0; display:block; margin:0 auto; }
  .controls { position:sticky; top:0; z-index:5; background:${canvas}; padding:16px 0 14px;
    border-bottom:1px solid ${LINE}; margin-bottom:24px; }
  input[type=range] { width:100%; accent-color:#9ecbff; }
  .presets { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }
  .presets button { background:rgba(233,236,242,0.06); border:1px solid ${LINE}; color:${TEXT};
    border-radius:8px; padding:6px 11px; font-family:ui-monospace,monospace; font-size:12px; cursor:pointer; }
  .presets button:hover { background:rgba(233,236,242,0.12); }
  .presets button small { display:block; color:${FAINT}; font-size:10px; }
  .witnesses { display:flex; gap:16px; flex-wrap:wrap; }
  .witness { margin:0; flex:0 0 auto; }
  .witness figcaption { font-family:ui-monospace,monospace; font-size:12px; margin-bottom:6px;
    display:flex; justify-content:space-between; gap:12px; }
  .witness figcaption span { color:${FAINT}; }
  .witness iframe { border:0; outline:1px solid ${LINE}; outline-offset:-1px; border-radius:8px; }
  .witness-note { font-size:11px; color:${FAINT}; margin:6px 0 0; max-width:280px; }
  .cols { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
  @media (max-width:820px){ .cols { grid-template-columns:1fr; } }
  .cols iframe { width:100%; border:1px solid ${LINE}; border-radius:8px; }
  .tag { display:inline-block; font-family:ui-monospace,monospace; font-size:11px; padding:2px 8px;
    border-radius:999px; border:1px solid ${LINE}; color:${DIM}; }
  .tag.bad { color:#ffb4b4; border-color:rgba(255,120,120,0.35); }
  .tag.good { color:#9ee6b4; border-color:rgba(120,230,150,0.35); }
  .muted { color:${DIM}; }
  footer { color:${FAINT}; font-size:12px; margin-top:32px; }
  code { font-family:ui-monospace,monospace; background:rgba(233,236,242,0.06); padding:1px 5px; border-radius:4px; }
</style>
</head>
<body>
<div class="wrap">

  <p class="eyebrow">LIMINAL · Step 2.2 · تست چشمی</p>
  <h1>نقطه‌های شکست مشتق‌شده — زنده</h1>
  <p class="sub">
    اسلایدر را بکش. هر نقطه‌ی شکست از <b>عرض خودِ محتوا</b> مشتق شده، نه از دسته‌بندی دستگاه.
    اعداد از <code>LiminalLayoutEngine.BREAKPOINTS</code> خوانده می‌شوند، و هر نمونه یک کامپوننت واقعی
    داخل یک viewport واقعی است — چون هر مکانیزم به چیز متفاوتی جواب می‌دهد:
    <code>container query</code> به جعبه‌ی خودش · <code>media query</code> به viewport · <code>vw</code> به viewport.
  </p>

  <div class="controls">
    <input id="w" type="range" min="280" max="1600" step="1" value="${BP.gridWide}">
    <div class="presets">
      ${presets.map((p) => `<button data-w="${p.w}">${p.label}<small>${p.note}</small></button>`).join('')}
      <button data-w="-1">${'عرض کامل'}<small>reset</small></button>
    </div>
  </div>

  <section>
    <h2>۱ — گرید <span class="tag">container query</span></h2>
    <div class="deriv"><b>gridWide</b> = 12 × CELL_MIN(${E.CELL_MIN}) + 11 × SPACING[4](${S[4]}) = <b>${BP.gridWide}px</b>
<b>gridMid</b>  =  6 × CELL_MIN(${E.CELL_MIN}) +  5 × SPACING[4](${S[4]}) = <b>${BP.gridMid}px</b>

دوازده خانه در کفِ خودشان جا می‌شوند؛ یک پیکسل کمتر، خانه‌ها زیر کف فشرده می‌شوند.</div>
    <div class="frame">${gridSpecimen}</div>
  </section>

  <section>
    <h2>۲ — ردیف فرم <span class="tag">container query</span></h2>
    <div class="deriv"><b>formRow</b> = 2 × FIELD_MIN(${E.FIELD_MIN}) + SPACING[5](${S[5]}) = <b>${BP.formRow}px</b>

دو فیلد کنار هم، به‌علاوه‌ی فاصله‌ی بینشان. زیر این عرض، ردیف تک‌ستونه می‌شود.</div>
    <div class="frame">${formSpecimen}</div>
  </section>

  <section>
    <h2>۳ — پوسته و سایدبار <span class="tag">media query</span></h2>
    <div class="deriv"><b>shellSidebar</b> = SIDEBAR_W(${E.SIDEBAR_W}) + SPACING[5](${S[5]}) + MEASURE_MIN(${E.MEASURE_MIN}) + 2 × SPACING[5](${S[5]}) = <b>${BP.shellSidebar}px</b>

سایدبار + فاصله + یک ستون خوانا + پدینگ بدنه.
ناوبری موبایل <b>همان عرض</b> را دارد — چون همان رویداد است. جفت قدیمی (۸۰۰ / ۶۴۰)
نواری می‌ساخت که در آن نه سایدبار بود نه ناوبری.</div>
    <div class="frame">${shellSpecimen}</div>
  </section>

  <section>
    <h2>۴ — برد اصلی: container query در برابر media query</h2>
    <p class="muted" style="margin:0 0 14px">
      یک گرید ۱۲ستونه داخل یک سایدبار ${E.SIDEBAR_W}px، روی یک viewport پهن.
      هر دو قاب <b>عرض یکسان</b> دارند — تفاوت فقط در این است که گرید به چه چیزی گوش می‌دهد.
    </p>
    <div class="frame" style="display:flex;flex-direction:column;gap:14px">
      <div>
        <p class="eyebrow">media query — رفتار قبل از Step 2.2 · viewport 1100px</p>
        ${specimen({ body: `<div class="side">${strip(gridHtml)}</div>`, css: `${mediaCss}\n.side{width:${E.SIDEBAR_W}px;padding:12px}`,
          height: 210, width: '1100px', readout: `() => {
            const c=document.querySelector('.liminal-grid-col'); const n=getComputedStyle(c).gridColumn.match(/span (\\d+)/);
            return 'viewport <b>' + window.innerWidth + 'px</b> · گرید <b>' + Math.round(document.querySelector('.liminal-grid').getBoundingClientRect().width) + 'px</b> · span <b>' + (n?n[1]:'?') + '</b>'; }` })}
        <p class="witness-note"><span class="tag bad">می‌شکند</span> viewport پهن است، پس <code>@media (max-width: ${BP.gridWide}px)</code> هرگز شلیک نمی‌شود؛ گرید ۱۲ستونه در ${E.SIDEBAR_W}px فشرده می‌ماند.</p>
      </div>
      <div>
        <p class="eyebrow">container query — رفتار Step 2.2 · همان viewport</p>
        ${specimen({ body: `<div class="side">${strip(gridHtml)}</div>`, css: `${gridCss}\n.side{width:${E.SIDEBAR_W}px;padding:12px}`,
          height: 210, width: '1100px', readout: `() => {
            const c=document.querySelector('.liminal-grid-col'); const n=getComputedStyle(c).gridColumn.match(/span (\\d+)/);
            return 'viewport <b>' + window.innerWidth + 'px</b> · گرید <b>' + Math.round(document.querySelector('.liminal-grid').getBoundingClientRect().width) + 'px</b> · span <b>' + (n?n[1]:'?') + '</b>'; }` })}
        <p class="witness-note"><span class="tag good">درست</span> گرید به عرض ${E.SIDEBAR_W}px خودش گوش می‌دهد و جمع می‌شود — هرچقدر هم viewport پهن باشد.</p>
      </div>
    </div>
  </section>

  <section>
    <h2>۵ — شاهد: مرز دقیقاً کجاست؟</h2>
    <p class="muted" style="margin:0 0 8px">
      ادعای مشتق این است: <b>در نقطه، چیدمان دقیقاً روی کف خودش جا می‌شود؛ یک پیکسل کمتر، فشرده می‌شود.</b>
      پس باید در <code>BP</code> هنوز چیدمان کامل باشد و در <code>BP − 1</code> بشکند.
    </p>
    <p class="muted" style="margin:0 0 16px">
      هر ردیف سه قاب دارد: یک پیکسل پایین‌تر، روی نقطه، یک پیکسل بالاتر.
    </p>
    ${[['gridMid', BP.gridMid, gridCss, strip(gridHtml), 'گرید'],
       ['gridWide', BP.gridWide, gridCss, strip(gridHtml), 'گرید'],
       ['formRow', BP.formRow, formCss, strip(formHtml), 'فرم']].map(([name, bp, css, body, kind]) => `
      <div style="margin-bottom:18px">
        <p class="eyebrow">${name} = <b>${bp}px</b></p>
        <div class="witnesses">
          ${witness(`${bp} − 1`, (bp as number) - 1, css as string, 'یک پیکسل زیر کف — اینجا باید بشکند.', body as string)}
          ${witness(`${bp}`, bp as number, css as string, '<b>روی نقطه</b> — اینجا باید کامل باشد.', body as string)}
          ${witness(`${bp} + 1`, (bp as number) + 1, css as string, 'یک پیکسل بالای کف.', body as string)}
        </div>
      </div>`).join('')}
  </section>

  <section>
    <h2>۶ — مقیاس نوع شناور</h2>
    <div class="deriv">TYPE_RATIO = ${E.TYPE_RATIO} · TYPE_BASE_LEVEL = ${E.TYPE_BASE_LEVEL}
TYPE_BASE_CSS = ${E.TYPE_BASE_CSS}</div>
    <p class="muted" style="margin:0 0 14px">
      ستون سوم با <code>var(--liminal-fs-N)</code> رندر می‌شود (شناور)، ستون چهارم با همان px ثابتی
      که کامپوننت‌ها <b>الان</b> استفاده می‌کنند. اگر با هم جلو نمی‌روند، یعنی شناور وصل نشده.
    </p>
    <div class="frame">${typeSpecimen}</div>
  </section>

  <footer>
    تولید‌شده توسط <code>scripts/gen-breakpoints-test.ts</code> · بدون شبکه · بدون build ·
    اعداد از <code>LiminalLayoutEngine</code> · کامپوننت‌ها از خود سورس رندر شده‌اند
  </footer>
</div>

<script>
  const slider = document.getElementById('w');
  const full = ${BP.gridWide};
  function setWidth(w) {
    document.documentElement.style.setProperty('--w', w + 'px');
  }
  slider.addEventListener('input', () => setWidth(+slider.value));
  document.querySelectorAll('.presets button').forEach((b) => b.addEventListener('click', () => {
    const v = +b.dataset.w;
    const w = v < 0 ? full : v;
    slider.value = w; setWidth(w);
  }));
  setWidth(+slider.value);
</script>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
