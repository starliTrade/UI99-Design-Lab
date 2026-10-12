#!/usr/bin/env bun
/**
 * LIMINAL — Badge: an eye test, before any formula.
 *
 * The question: how should a badge carry meaning in LIMINAL?
 *
 * Today it does not carry it in the surface at all. The surface is
 * `SURFACE_TINT.medium` — a white overlay, not a ladder step — and the colour
 * lives only in the text. So a "blue" badge is a grey pill with blue letters.
 *
 * Seven candidates, each defensible, each implying a different formula. The
 * point of this page is to choose by eye FIRST, then extract the formula from
 * whatever wins. Nothing here is decided.
 *
 * Every number comes from the engine. Run: bun scripts/gen-badge-test.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LiminalColorEngine } from '../src/engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../src/engine/liminal-layout-engine';
import { SURFACE_TINT, getLadderColor } from '../src/engine/spec-engine';
import { hexToRgb } from '../src/engine/liminal-color-math';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/badge-test.html');

const SEM: any = LiminalColorEngine.SEMANTICS;
const SP: any = LiminalColorEngine.EXTENDED_SPECTRUM;
const L = LiminalLayoutEngine;
const KEYS = ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const;
const FA: Record<string, string> = { SUCCESS: 'فعال', WARNING: 'هشدار', DANGER: 'خطا', INFO: 'اطلاع' };
const EN: Record<string, string> = { SUCCESS: 'Active', WARNING: 'Warning', DANGER: 'Error', INFO: 'Info' };

const canvas = getLadderColor(0);
const work = getLadderColor(2);
const menu = getLadderColor(5);
const TEXT = 'rgba(233,236,242,0.92)';
const DIM = 'rgba(233,236,242,0.55)';
const FAINT = 'rgba(233,236,242,0.28)';
const LINE = 'rgba(233,236,242,0.10)';

const rgba = (hex: string, a: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/** The badge's geometry is not in question — only how it carries colour. */
const GEOM = `
  display:inline-flex; align-items:center; gap:6px;
  border-radius:${L.RADIUS.full}px;
  font-size:${L.TYPOGRAPHY[1].fs}px;
  letter-spacing:${L.TYPOGRAPHY[1].ls};
  font-weight:${L.TYPOGRAPHY[2].weight};
  padding:3px 10px; line-height:1.45; white-space:nowrap;
`;

type Style = (key: string, host: number) => string;
interface Candidate { id: string; name: string; why: string; formula: string; style: Style }

const CANDIDATES: Candidate[] = [
  {
    id: 'A', name: 'امروز — سطح خنثی، رنگ فقط در متن',
    why: 'وضعیت فعلی. سطح یک overlay سفید است، نه یک پله‌ی نردبان. رنگ روی سطح نمی‌نشیند.',
    formula: 'bg = SURFACE_TINT.medium (rgba(255,255,255,0.06)) · border = rgba(255,255,255,0.12) · color = SEMANTICS[x].text',
    style: (k) => `background:${SURFACE_TINT.medium}; border:1px solid rgba(255,255,255,0.12); color:${SEM[k].text};`,
  },
  {
    id: 'B', name: 'تینت معنایی',
    why: 'سطح از خود هیو رنگ می‌گیرد. متداول‌ترین راه در سیستم‌های دیگر — سؤال این است که آیا لیمینال است یا نه.',
    formula: 'bg = hue @ 0.14 · border = hue @ 0.30 · color = SEMANTICS[x].text',
    style: (k) => `background:${rgba(SEM[k].text, 0.14)}; border:1px solid ${rgba(SEM[k].text, 0.30)}; color:${SEM[k].text};`,
  },
  {
    id: 'C', name: 'سطح از نردبان',
    why: 'سطح یک پله‌ی واقعی بالای میزبان است، نه overlay سفید. رنگ هنوز فقط در متن — ولی سطح دیگر تصادفی نیست.',
    formula: 'bg = LADDER[host + 1] · border = hairline · color = SEMANTICS[x].text',
    style: (k, host) => `background:${getLadderColor(host + 1)}; border:1px solid ${getLadderColor(host + 1.5)}; color:${SEM[k].text};`,
  },
  {
    id: 'D', name: 'نشانگر لهجه',
    why: 'قاعده‌ی خودِ لیمینال برای توست: «معنا از نشانگر می‌آید، نه از سطح». متن خنثی می‌ماند.',
    formula: 'bg = LADDER[host + 1] · border = hairline · color = neutral text · + یک نوار ۳px در لبه‌ی inline-start',
    style: (k, host) => `background:${getLadderColor(host + 1)}; border:1px solid ${getLadderColor(host + 1.5)}; color:${TEXT};`,
  },
  {
    id: 'E', name: 'نقطه',
    why: 'آرام‌ترین گزینه. یک نقطه‌ی کوچک معنا را حمل می‌کند و بقیه خنثی می‌ماند.',
    formula: 'bg = LADDER[host + 1] · border = hairline · color = neutral text · + یک نقطه‌ی ۵px',
    style: (k, host) => `background:${getLadderColor(host + 1)}; border:1px solid ${getLadderColor(host + 1.5)}; color:${TEXT};`,
  },
  {
    id: 'F', name: 'لبه‌ی رنگی',
    why: 'رنگ روی «لبه» می‌نشیند، نه روی سطح. همان منطق میست: نور روی لبه، نه تابش از سطح.',
    formula: 'bg = LADDER[host + 1] · border = hue @ 0.35 · color = SEMANTICS[x].text',
    style: (k, host) => `background:${getLadderColor(host + 1)}; border:1px solid ${rgba(SEM[k].text, 0.35)}; color:${SEM[k].text};`,
  },
  {
    id: 'G', name: 'سطح نردبان، متمایل به هیو',
    why: 'سطح یک پله‌ی نردبان است که کمی به سمت هیو متمایل شده — نه overlay سفید، نه تینت خالص.',
    formula: 'bg = color-mix(LADDER[host + 1] 90%, hue 10%) · border = hue @ 0.28 · color = SEMANTICS[x].text',
    style: (k, host) => `background:color-mix(in oklab, ${getLadderColor(host + 1)} 90%, ${SEM[k].text} 10%);
      border:1px solid ${rgba(SEM[k].text, 0.28)}; color:${SEM[k].text};`,
  },
];

const badge = (c: Candidate, k: string, host: number, label: string) => {
  // A mark must sit on the LEADING edge, which flips in RTL. A flex child does
  // that on its own; `inset 3px 0 0` would not.
  const mark =
    c.id === 'E' ? `<i class="dot" style="background:${SEM[k].text}"></i>`
    : c.id === 'D' ? `<i class="bar" style="background:${SEM[k].text}"></i>`
    : '';
  return `<span class="badge" style="${GEOM}${c.style(k, host)}">${mark}${label}</span>`;
};

const row = (c: Candidate, host: number) => `
  <section class="cand">
    <header>
      <span class="cid">${c.id}</span>
      <div>
        <h3>${c.name}</h3>
        <p class="why">${c.why}</p>
      </div>
    </header>
    <div class="strip" style="background:${host === 0 ? canvas : host === 2 ? work : menu}">
      ${KEYS.map((k) => badge(c, k, host, EN[k])).join('')}
    </div>
    <div class="strip" style="background:${host === 0 ? canvas : host === 2 ? work : menu}" dir="rtl">
      ${KEYS.map((k) => badge(c, k, host, FA[k])).join('')}
    </div>
    <p class="formula">${c.formula}</p>
  </section>`;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — تست چشمی بج</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${canvas}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size:14px; line-height:1.75; }
  .wrap { max-width:1100px; margin:0 auto; padding:40px 24px 96px; }
  h1 { font-size:26px; margin:0 0 6px; font-weight:700; letter-spacing:-0.02em; }
  h2 { font-size:16px; margin:0 0 8px; font-weight:600; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.08em; text-transform:uppercase; }
  .sub { color:${DIM}; margin:0 0 26px; }
  .problem { border:1px solid ${LINE}; border-radius:14px; padding:18px; margin:0 0 28px; background:rgba(233,236,242,0.012); }
  .problem code { font-family:ui-monospace,monospace; font-size:12px; background:rgba(233,236,242,0.06); padding:1px 5px; border-radius:4px; }
  .cand { border:1px solid ${LINE}; border-radius:14px; padding:18px; margin:0 0 18px; background:rgba(233,236,242,0.012); }
  .cand header { display:flex; gap:12px; align-items:flex-start; margin-bottom:14px; }
  .cid { font-family:ui-monospace,monospace; font-size:13px; font-weight:700; color:${TEXT};
    border:1px solid ${LINE}; border-radius:8px; padding:3px 10px; flex-shrink:0; }
  .cand h3 { font-size:15px; margin:0 0 3px; font-weight:600; }
  .why { margin:0; color:${DIM}; font-size:13px; }
  .strip { border-radius:10px; padding:14px 16px; display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-bottom:8px; }
  .formula { font-family:ui-monospace,monospace; font-size:11.5px; color:${FAINT}; margin:10px 0 0; direction:ltr; text-align:left; }
  .dot { width:5px; height:5px; border-radius:999px; display:inline-block; flex-shrink:0; }
  .bar { width:3px; height:11px; border-radius:2px; display:inline-block; flex-shrink:0; }
  .zoom .badge { zoom:2.4; }
  .zoom .strip { padding:26px 16px; gap:22px; }
  .slabel { font-family:ui-monospace,monospace; font-size:10.5px; color:${FAINT}; margin:0 0 5px; }
  footer { color:${FAINT}; font-size:12px; margin-top:32px; }
  code { font-family:ui-monospace,monospace; }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">LIMINAL · تست چشمی · بج</p>
  <h1>بج چطور باید معنا را حمل کند؟</h1>
  <p class="sub">هفت کاندید. هر کدام قابل‌دفاع، و هر کدام یک فرمول متفاوت را ایجاب می‌کند. اول با چشم انتخاب کن — بعد فرمول را از برنده استخراج می‌کنیم.</p>

  <div class="problem">
    <h2>مشکلی که اندازه گرفتیم</h2>
    <p style="margin:0 0 8px">
      بج امروز رنگ را <b>روی سطح</b> نمی‌نشاند. سطحش <code>SURFACE_TINT.medium</code> است —
      یک overlay سفید، نه یک پله‌ی نردبان — و رنگ فقط در متن زندگی می‌کند.
      پس بجِ «آبی» عملاً یک قرص خاکستری است با حروف آبی.
    </p>
    <p style="margin:0; color:${DIM}">
      و دو تا از چهار هیو معنایی <b>اصلاً روی طیف نیستند</b>:
      SUCCESS روی ۱۵۵ (طیف: ۱۴۵ و ۱۷۵) و WARNING روی ۸۵ (طیف: ۷۵ و ۱۱۰).
      یعنی یک پالت موازی ساخته شده.
    </p>
  </div>

  <h2 style="margin-bottom:14px">کاندیدها — روی سطح کار (S2)</h2>
  ${CANDIDATES.map((c) => row(c, 2)).join('')}

  <h2 style="margin:32px 0 14px">بزرگ‌نمایی ۲.۶× — سه کاندیدِ نزدیک‌تر</h2>
  <div class="cand zoom">
    ${['C', 'D', 'F'].map((id) => {
      const c = CANDIDATES.find((x) => x.id === id)!;
      return `<div class="strip" style="background:${work}">${KEYS.map((k) => badge(c, k, 2, EN[k])).join('')}</div>`;
    }).join('')}
  </div>

  <h2 style="margin:32px 0 14px">همان کاندیدها روی سطح‌های دیگر</h2>
  <p class="sub" style="margin-bottom:14px">بج باید روی هر سه سطح کار کند — وگرنه یک پله‌ی نردبان اشتباه است.</p>
  ${['C', 'F'].map((id) => {
    const c = CANDIDATES.find((x) => x.id === id)!;
    return `<div class="cand">
      <header><span class="cid">${c.id}</span><div><h3>${c.name}</h3></div></header>
      <p class="slabel">canvas · S0</p>
      <div class="strip" style="background:${canvas}">${KEYS.map((k) => badge(c, k, 0, EN[k])).join('')}</div>
      <p class="slabel">work · S2</p>
      <div class="strip" style="background:${work}">${KEYS.map((k) => badge(c, k, 2, EN[k])).join('')}</div>
      <p class="slabel">menu · S5</p>
      <div class="strip" style="background:${menu}">${KEYS.map((k) => badge(c, k, 5, EN[k])).join('')}</div>
    </div>`;
  }).join('')}

  <footer>
    تولید‌شده توسط <code>scripts/gen-badge-test.ts</code> · بدون شبکه · بدون build ·
    همه‌ی رنگ‌ها از <code>LiminalColorEngine</code> و <code>getLadderColor()</code>
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
