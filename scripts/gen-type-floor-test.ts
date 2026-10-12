#!/usr/bin/env bun
/**
 * LIMINAL — the small end of the fluid scale: an eye test.
 *
 * The fluid base is 14px at 320 and 16.5px at 1440. Level 1 is base / 1.2^2,
 * so at 320px it resolves to 9.72px — smaller than the 11px it replaced.
 *
 * The system says the ratio is the design and the base is a reading condition,
 * so 9.72px on a phone held close is meant to read like 11.11px on a monitor.
 * Whether it does is an empirical question, so here it is at real size, next to
 * the two ways of changing it.
 *
 * Run: bun scripts/gen-type-floor-test.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LiminalLayoutEngine } from '../src/engine/liminal-layout-engine';
import { getLadderColor, getTextStyle } from '../src/engine/spec-engine';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/type-floor-test.html');

const L = LiminalLayoutEngine;
const canvas = getLadderColor(0);
const work = getLadderColor(2);
const TEXT = getTextStyle('primary', 2).color;
const DIM = getTextStyle('secondary', 2).color;
const FAINT = getTextStyle('quaternary', 2).color;
const LINE = 'rgba(233,236,242,0.10)';

/** The base as a function of viewport width, from the engine's own clamp. */
const BASE_MIN = 14, BASE_MAX = 16.5, VW_MIN = 320, VW_MAX = 1440;
const slope = (BASE_MAX - BASE_MIN) / (VW_MAX - VW_MIN);
const baseAt = (vw: number) => Math.min(BASE_MAX, Math.max(BASE_MIN, slope * vw + (BASE_MIN - slope * VW_MIN)));

/**
 * The three answers to "level 1 is 9.72px at 320".
 *
 * A floor on the LEVEL breaks the ratio, which the system calls the design.
 * A floor on the BASE keeps the ratio and moves everything together.
 */
const OPTIONS = [
  {
    id: 'today', name: 'امروز — بدون کف',
    why: 'پایه ۱۴→۱۶.۵. سطح ۱ = پایه ÷ ۱.۴۴. در ۳۲۰px میشود ۹.۷۲px.',
    base: (vw: number) => baseAt(vw),
  },
  {
    id: 'floor-base', name: 'کف روی پایه — ۱۵px',
    why: 'پایه هرگز زیر ۱۵px نمیرود. نسبت ۱.۲ دستنخورده. سطح ۱ در ۳۲۰px میشود ۱۰.۴۲px.',
    base: (vw: number) => Math.max(15, baseAt(vw)),
  },
  {
    id: 'floor-base-16', name: 'کف روی پایه — ۱۶px',
    why: 'پایه هرگز زیر ۱۶px نمیرود. سطح ۱ در ۳۲۰px میشود ۱۱.۱۱px — همان مرجع دسکتاپ.',
    base: (vw: number) => Math.max(16, baseAt(vw)),
  },
];

const scale = (base: number, n: number) => base * Math.pow(L.TYPE_RATIO, n - L.TYPE_BASE_LEVEL);

const ROLES: Record<number, string> = {
  1: 'meta · caption', 2: 'label · tertiary', 3: 'body · secondary',
  4: 'lead · h4', 5: 'h3', 6: 'h2', 7: 'h1', 8: 'display',
};

const row = (o: typeof OPTIONS[number]) => `
  <section class="cand">
    <header><span class="cid">${o.id === 'today' ? 'حالا' : o.id === 'floor-base' ? 'الف' : 'ب'}</span>
      <div><h3>${o.name}</h3><p class="why">${o.why}</p></div></header>
    <div class="grid">
      ${[320, 390, 768, 1440].map((vw) => {
        const base = o.base(vw);
        return `
        <div class="col">
          <p class="vw">${vw}px · پایه ${base.toFixed(2)}px</p>
          ${[1, 2, 3].map((n) => `
            <div class="sample" style="font-size:${scale(base, n).toFixed(3)}px; line-height:${L.TYPOGRAPHY[n].lh}; letter-spacing:${L.TYPOGRAPHY[n].ls}; font-weight:${L.TYPOGRAPHY[n].weight}; color:${n === 1 ? DIM : TEXT}">
              ${n === 1 ? 'Meta caption 11px class' : n === 2 ? 'Label text' : 'Body copy reads like this'}
            </div>
            <p class="num">سطح ${n} · ${scale(base, n).toFixed(2)}px · ${ROLES[n]}</p>`).join('')}
        </div>`;
      }).join('')}
    </div>
  </section>`;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — انتهای کوچک مقیاس نوع</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${canvas}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; font-size:14px; line-height:1.75; }
  .wrap { max-width:1120px; margin:0 auto; padding:40px 24px 96px; }
  h1 { font-size:25px; margin:0 0 6px; font-weight:700; letter-spacing:-0.02em; }
  h2 { font-size:16px; margin:30px 0 10px; font-weight:600; }
  h3 { font-size:15px; margin:0 0 3px; font-weight:600; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.08em; text-transform:uppercase; }
  .sub { color:${DIM}; margin:0 0 10px; }
  .cand { border:1px solid ${LINE}; border-radius:14px; padding:18px; margin:0 0 18px; background:rgba(233,236,242,0.012); }
  .cand header { display:flex; gap:12px; align-items:flex-start; margin-bottom:14px; }
  .cid { font-family:ui-monospace,monospace; font-size:12px; font-weight:700; border:1px solid ${LINE}; border-radius:8px; padding:3px 10px; flex-shrink:0; }
  .why { margin:0; color:${DIM}; font-size:13px; }
  .grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:14px; }
  @media (max-width:900px){ .grid { grid-template-columns:repeat(2, 1fr); } }
  .col { border:1px solid ${LINE}; border-radius:10px; padding:12px; background:${work}; }
  .vw { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; margin:0 0 10px; }
  .sample { margin:0; }
  .num { font-family:ui-monospace,monospace; font-size:10px; color:${FAINT}; margin:2px 0 12px; }
  footer { color:${FAINT}; font-size:12px; margin-top:32px; }
  code { font-family:ui-monospace,monospace; }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">LIMINAL · تست چشمی · مقیاس نوع</p>
  <h1>انتهای کوچک مقیاس — ۹.۷۲px در ۳۲۰px خوانده میشود؟</h1>
  <p class="sub">
    سیستم میگوید <b>نسبت، طرح است؛ پایه، شرط خواندن.</b> پس ۹.۷۲px روی گوشیِ نزدیک، باید مثل ۱۱.۱۱px روی مانیتور خوانده شود.
    این یک سؤال تجربی است، پس اینجاست — در اندازهی واقعی، کنار دو راه تغییرش.
  </p>
  <p class="sub" style="margin-bottom:22px">
    <b>کف روی سطح</b> نسبت ۱.۲ را میشکند — یعنی طرح را نقض میکند تا یک عدد را درست کند.
    <b>کف روی پایه</b> نسبت را دستنخورده نگه میدارد و همهچیز را با هم حرکت میدهد.
  </p>
  ${OPTIONS.map(row).join('')}
  <footer>
    تولید‌شده توسط <code>scripts/gen-type-floor-test.ts</code> · بدون شبکه ·
    نسبت، پایه و وزن‌ها از <code>LiminalLayoutEngine</code>
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
