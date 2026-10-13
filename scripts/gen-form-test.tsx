#!/usr/bin/env bun
/**
 * LIMINAL — the form, by eye.
 *
 * Every state and every size, rendered by the real components. The markup is
 * produced by `renderToStaticMarkup`, so what the page shows is what the
 * component produces — not a hand-built lookalike.
 *
 * Run: bun scripts/gen-form-test.tsx
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { Form, Field } from '../src/components/composites/Form/Form';
import { Input } from '../src/components/inputs/Input/Input';
import { Textarea } from '../src/components/inputs/Textarea/Textarea';
import { Checkbox } from '../src/components/inputs/Checkbox/Checkbox';
import { Button } from '../src/components/atoms/Button/Button';
import { LADDER } from '../src/engine/spec-engine';
import { getTextStyle } from '../src/engine/spec-engine';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/form-test.html');

const TEXT = getTextStyle('primary', 2).color as string;
const DIM = getTextStyle('secondary', 2).color as string;
const FAINT = getTextStyle('tertiary', 2).color as string;
const S = L.SPACING;
const R = L.RADIUS;

/** The CSS layers, inlined so the page is self-contained. */
const LAYERS = ['liminal-interaction', 'liminal-mist', 'liminal-motion', 'liminal-forced-colors']
  .map((n) => readFileSync(resolve(__dirname, `../src/engine/${n}.css`), 'utf8'))
  .join('\n');
/**
 * The variable block, extracted properly.
 *
 * `index.css` OPENS with its `@import` lines, so splitting on `@import` and
 * taking the first piece returns an empty string — which is what happened, and
 * the page rendered every control with no surface at all. The eye test caught
 * it: the inputs were invisible.
 */
const INDEX = readFileSync(resolve(__dirname, '../src/index.css'), 'utf8');
const VARS = (INDEX.match(/:root\s*\{[\s\S]*?\n\}/) ?? [''])[0];

const noop = () => {};
const render = (el: React.ReactElement) => renderToStaticMarkup(el);

const cell = (title: string, note: string, markup: string) => `
  <div class="cell">
    <div class="cellhead"><b>${title}</b><span class="use">${note}</span></div>
    ${markup}
  </div>`;

const STATES = [
  cell('پیش‌فرض', 'برچسب + کنترل', render(<Field name="a" label="نام کاربری"><Input /></Field>)),
  cell('با راهنما', 'hint به‌عنوان aria-describedby', render(<Field name="b" label="نام کاربری" hint="۳ تا ۲۰ کاراکتر، حروف و عدد"><Input /></Field>)),
  cell('اجباری', 'ستاره aria-hidden است؛ aria-required اعلام می‌کند', render(<Field name="c" label="ایمیل" required><Input type="email" /></Field>)),
  cell('خطا', 'role="alert" · aria-invalid · جای hint را می‌گیرد', render(<Field name="d" label="ایمیل" hint="این hint دیده نمی‌شود"><Input type="email" /></Field>).replace('<input', '<input aria-invalid="true" aria-describedby="err"')),
  cell('غیرفعال', 'کنترل واقعاً disabled است', render(<Field name="e" label="نام کاربری"><Input disabled defaultValue="starli" /></Field>)),
  cell('مقداردار', 'مقدار اولیه', render(<Field name="f" label="نام کاربری"><Input defaultValue="starli" /></Field>)),
];

const SIZES = ['sm', 'md', 'lg'].map((size) =>
  cell(`اندازه ${size}`, size === 'md' ? 'پیش‌فرض، و حداقل هدف لمسی' : '', render(<Field name={`s-${size}`} label={`اندازه ${size}`}><Input size={size as 'sm'} defaultValue="starli" /></Field>)),
).join('');

const FORM = render(
  <Form validators={{ email: (v) => (String(v ?? '').includes('@') ? undefined : 'ایمیل معتبر نیست') }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, maxWidth: '420px' }}>
      <Field name="name" label="نام" required hint="نام کامل">
        <Input />
      </Field>
      <Field name="email" label="ایمیل" required>
        <Input type="email" placeholder="you@example.com" />
      </Field>
      <Field name="bio" label="درباره">
        <Textarea rows={3} />
      </Field>
      <Checkbox checked={false} onChange={noop} label="شرایط را می‌پذیرم" />
      <Button type="submit" variant="primary">ثبت</Button>
    </div>
  </Form>,
);

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — فرم</title>
<style>
${VARS}
${LAYERS}
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${LADDER[0]}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; font-size:15px; line-height:1.7; }
  .wrap { max-width:1180px; margin:0 auto; padding:44px 24px 96px; }
  h1 { font-size:28px; margin:0 0 4px; font-weight:700; letter-spacing:-0.02em; }
  h2 { font-size:16px; margin:36px 0 12px; font-weight:600; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.1em; text-transform:uppercase; }
  .lede { color:${DIM}; max-width:78ch; margin:0 0 8px; }
  .note { border-inline-start:2px solid ${LADDER[3]}; padding-inline-start:12px; margin:16px 0 0; color:${DIM}; max-width:78ch; font-size:13.5px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); gap:${S[4]}px; }
  .cell { border:1px solid ${LADDER[3]}; border-radius:${R.card}px; padding:${S[4]}px; background:${LADDER[1]}; }
  .cellhead { display:flex; flex-direction:column; gap:2px; margin-bottom:${S[3]}px; }
  .cellhead b { font-size:14px; }
  .use { color:${FAINT}; font-size:12px; }
  .mono { font-family:ui-monospace,monospace; font-size:12px; }
  .stage { border:1px solid ${LADDER[3]}; border-radius:${R.card}px; padding:${S[5]}px; background:${LADDER[2]}; }
  footer { color:${FAINT}; font-size:12px; margin-top:${S[6]}px; border-top:1px solid ${LADDER[3]}; padding-top:${S[4]}px; }
  code { font-family:ui-monospace,monospace; background:${LADDER[1]}; border:1px solid ${LADDER[3]}; border-radius:4px; padding:1px 5px; font-size:12px; }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">LIMINAL · تست چشمی · فرم</p>
  <h1>فرم — حالت‌ها و اندازه‌ها</h1>
  <p class="lede">
    هر چیزی که می‌بینی توسط <b>خودِ کامپوننت‌ها</b> رندر شده — با <code>renderToStaticMarkup</code>.
    این یک ماکت دست‌ساز نیست.
  </p>

  <h2>حالت‌ها</h2>
  <div class="grid">${STATES.join('')}</div>

  <h2>اندازه‌ها</h2>
  <div class="grid">${SIZES}</div>

  <h2>یک فرم واقعی</h2>
  <div class="stage">${FORM}</div>
  <p class="note">
    <b>اعتبارسنجی در blur و submit است، نه در هر کلید.</b> روی «ثبت» بزن با فیلد خالی —
    فوکوس به <b>اولین فیلد خطادار</b> می‌رود، و خطا با <code>role="alert"</code> اعلام می‌شود.
  </p>

  <footer>
    تولید‌شده توسط <code>scripts/gen-form-test.tsx</code> · بدون شبکه · بدون وابستگی ·
    ${STATES.length} حالت · ${3} اندازه
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
