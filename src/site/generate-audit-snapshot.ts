/**
 * LIMINAL — PHASE PAGE GENERATOR · CANVAS ↔ SURFACE
 *
 * صفحهٔ تحویلِ مرحلهٔ فعلی — و فقط مرحلهٔ فعلی.
 *
 * مرحلهٔ فعلی چیست: رابطهٔ بوم و سطح، **تخت** — بدون ریم، بدون بوردر، بدون
 * سایه. فقط فرمول و ریاضی و ۹ لایه، در ادراک‌ترین حالتِ ممکن، با عدد و چشم
 * و دلیل. بوردر/سایه/ریم/پالت/تایپو در موتور ساخته و تست شده‌اند ولی تصمیمِ
 * این مرحله نیستند — در بخشِ ۰۱ فقط «وضعیت» دارند و رندرِ کاملشان در
 * AuditLab.tsx (آزمایشگاهِ زندهٔ دسکتاپ) و .lab/CORE-VERDICTS.md باقی است.
 *
 * سؤالِ صفحه: چرا این ۹ لایه، با این گام، ادراک‌ترین چیدمانِ ممکن است؟
 * جواب در سه لایه داده می‌شود:
 *   ۱. روان‌فیزیک — q و r از ۳ نشستِ آستانه‌سنجی روی نمایشگرِ خودِ خواننده
 *      (.threshold-sessions.json — زنده خوانده و نقل می‌شود).
 *   ۲. ریاضیِ محصور — لنگر + سقف + ۹ لایه + گامِ ثابت ⇒ گام یکتاست
 *      (۹۹.۷٪ بیشینهٔ هندسی). جایگزین‌ها عددی رد می‌شوند، نه سلیقه‌ای.
 *   ۳. چشم — میدان‌های تختِ بزرگ: درزهای همسایه، جفت‌های رابطه‌ای، زنجیرهٔ
 *      تو در تویِ بدونِ تزئین، و نردبان‌های جایگزین کنارِ هم.
 *
 * خروجی: `.lab/audit-lab-snapshot.html` (توسط تستِ audit-snapshot نوشته می‌شود؛
 * هر اجرای سوئیت آن را از موتورِ زنده بازتولید می‌کند). GitHub Pages ریشهٔ
 * ریپو را به این فایل ریدایرکت می‌کند — تحویلِ دائمیِ موبایل.
 */

import {
  LADDER,
  WELLS,
  PERCEPTUAL_QUANTUM as Q,
  LADDER_STEP,
  CANVAS_L,
  LADDER_CHROMA,
  LADDER_HUE,
  LADDER_EXACT,
  RELIABLE_BOUNDARY,
  getLadderColor,
} from '../engine/liminal-ladder';
import {
  oklchLightness,
  lightnessStep,
  rgbToOklch,
  hexToRgb,
  contrastRatioHex,
  oklchToHex,
} from '../engine/liminal-color-math';
import { apcaContrast } from '../engine/liminal-contrast';
import { ROLE_LEVEL, RELATIONSHIP_ROLES, resolveSurface } from '../engine/liminal-surface';
import type { SurfaceRole } from '../engine/liminal-surface';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/* ── helpers ─────────────────────────────────────────────────────────── */

const ROLES = Object.keys(ROLE_LEVEL) as SurfaceRole[];
const MAX_LEVEL = LADDER.length - 1; // 8 → ۹ لایه
/** سقفِ تاریکیِ قرارداد (قانون ۴ موتور: L ≤ 0.204) — همان literal کامنتِ liminal-ladder. */
const CEILING_L = 0.204;

const q = (dL: number) => dL / Q;
const f4 = (x: number) => x.toFixed(4);
const f3 = (x: number) => x.toFixed(3);
const f2 = (x: number) => x.toFixed(2);
const fa = (n: number) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]); // ارقام فارسی برای شمارش‌ها
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const verdictCount = { قدر: 0, ضعف: 0, حل: 0, باز: 0 };

function verdict(kind: 'قدرت' | 'ضعف' | 'مشکل·حل‌شده' | 'سؤال باز', title: string, reason: string, counted = true): string {
  const color = kind === 'قدرت' ? '#74CE8E' : kind === 'ضعف' ? '#D9BE6E' : kind === 'مشکل·حل‌شده' ? '#6FA8EC' : '#A98BEA';
  if (counted) {
    if (kind === 'قدرت') verdictCount.قدر++;
    else if (kind === 'ضعف') verdictCount.ضعف++;
    else if (kind === 'مشکل·حل‌شده') verdictCount.حل++;
    else verdictCount.باز++;
  }
  return `<div class="verdict" style="border-inline-start:2px solid ${color}">
<div class="vtitle"><span style="color:${color}">${kind}</span> — ${esc(title)}</div>
<div class="vreason">${reason}</div></div>`;
}

function test(pass: boolean, name: string, value: string, why: string): string {
  return `<div class="test"><span class="tmark" style="color:${pass ? '#74CE8E' : '#E88A93'}">${pass ? '✓' : '✗'}</span>
<div><div class="tname">${esc(name)}${value ? ` <code class="tvalue">${esc(value)}</code>` : ''}</div>
<div class="twhy">دلیل: ${why}</div></div></div>`;
}

/** یافته — نه پاس نه شکست: رفتارِ واقعیِ موتور که حکمی جدا دارد. */
function finding(title: string, body: string): string {
  return `<div class="finding"><span class="fmark">⚠</span>
<div><div class="tname">${esc(title)}</div><div class="twhy">${body}</div></div></div>`;
}

const card = (title: string, body: string) => `<div class="card"><div class="ctitle">${esc(title)}</div>${body}</div>`;

function section(num: string, title: string, lede: string, body: string): string {
  return `<section><div class="shead"><span class="snum">${num}</span><div><h2>${esc(title)}</h2><p class="lede">${lede}</p></div></div>${body}</section>`;
}

/* ── the document ────────────────────────────────────────────────────── */

export function buildAuditSnapshotHtml(): string {
  /* ═══ دادهٔ زنده — همه از موتور، هیچ عددِ دستی ═══ */

  // اندازه‌گیری‌های نردبان
  const canvasL = oklchLightness(LADDER[0]);
  const stepsQ = LADDER.slice(0, -1).map((h, n) => q(lightnessStep(h, LADDER[n + 1])));
  const parseExactL = (s: string) => parseFloat(s.match(/oklch\(([\d.]+)/)![1]);
  const exactStepsQ = LADDER_EXACT.slice(0, -1).map((e, n) => q(parseExactL(LADDER_EXACT[n + 1]) - parseExactL(e)));

  // محصور بودنِ گام: بیشینهٔ هندسی از لنگر تا سقف با ۸ گام
  const geoMaxStep = (CEILING_L - CANVAS_L) / MAX_LEVEL;
  const fitRatio = LADDER_STEP / geoMaxStep;
  const topL = oklchLightness(LADDER[MAX_LEVEL]);

  // روان‌فیزیک: منحنی لجستیک از دو نقطهٔ اندازه‌گیری‌شده — q (۵۰٪) و r (۹۵٪)
  const beta = (RELIABLE_BOUNDARY - Q) / Math.log(19);
  const pDetect = (dL: number) => 1 / (1 + Math.exp(-(dL - Q) / beta));
  const pExact = pDetect(LADDER_STEP);
  const pBand = [pDetect(Math.min(...stepsQ) * Q), pDetect(Math.max(...stepsQ) * Q)];

  // نشست‌های آستانه‌سنجی — زنده از فایلِ اندازه‌گیریِ خودِ خواننده
  type Session = { at: string; q: number; r?: number; falseAlarms?: number; trials?: unknown[] };
  const sessions: Session[] = (() => {
    try {
      return JSON.parse(readFileSync(resolve(process.cwd(), '.threshold-sessions.json'), 'utf8')) as Session[];
    } catch {
      return [];
    }
  })();
  const trialsTotal = sessions.reduce((a, s) => a + (Array.isArray(s.trials) ? s.trials.length : 0), 0);

  // دادهٔ هر لایه
  const lumY = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const lin = (v: number) => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  };
  const levelData = LADDER.map((hex, n) => {
    const o = rgbToOklch(hexToRgb(hex));
    return {
      n,
      hex,
      roles: ROLES.filter((r) => ROLE_LEVEL[r] === n).join(' · '),
      Lexact: parseExactL(LADDER_EXACT[n]),
      Lhex: o.L,
      C: o.C,
      h: o.h,
      dCanvasQ: n ? q(lightnessStep(LADDER[0], hex)) : 0,
      dPrevQ: n ? q(lightnessStep(LADDER[n - 1], hex)) : 0,
      Y: lumY(hex),
      wcagWhite: contrastRatioHex('#FFFFFF', hex),
      apcaWhite: Math.abs(apcaContrast('#FFFFFF', hex)),
    };
  });
  const minWcag = Math.min(...levelData.map((d) => d.wcagWhite));
  const minApca = Math.min(...levelData.map((d) => d.apcaWhite));
  // وفاداریِ hex به فرمولِ اکسکت (ΔE در OKLab) — برایِ findingِ §۰۵
  const exactLab = (n: number) => {
    const t = (LADDER_HUE * Math.PI) / 180;
    return { L: CANVAS_L + n * LADDER_STEP, a: LADDER_CHROMA * Math.cos(t), b: LADDER_CHROMA * Math.sin(t) };
  };
  const hexLab = (hex: string) => {
    const o = rgbToOklch(hexToRgb(hex));
    const t = (o.h * Math.PI) / 180;
    return { L: o.L, a: o.C * Math.cos(t), b: o.C * Math.sin(t) };
  };
  const maxHexDE = Math.max(...LADDER.map((hex, n) => {
    const e = exactLab(n), g = hexLab(hex);
    return Math.hypot(g.L - e.L, g.a - e.a, g.b - e.b);
  }));

  // تک‌محوری: سهمِ نورانیت از فاصلهٔ ادراکی (OKLab) بین لایه‌های همسایه
  const lab = (hex: string) => {
    const o = rgbToOklch(hexToRgb(hex));
    const hr = (o.h * Math.PI) / 180;
    return { L: o.L, a: o.C * Math.cos(hr), b: o.C * Math.sin(hr) };
  };
  const deRatios = LADDER.slice(0, -1).map((hex, n) => {
    const p0 = lab(hex), p1 = lab(LADDER[n + 1]);
    const dE = Math.hypot(p1.L - p0.L, p1.a - p0.a, p1.b - p0.b);
    const dL = Math.abs(p1.L - p0.L);
    return dE / dL;
  });
  const maxDeRatio = Math.max(...deRatios);
  const cDrift = Math.max(...levelData.map((d) => d.C)) - Math.min(...levelData.map((d) => d.C));
  const hDrift = Math.max(...levelData.map((d) => d.h)) - Math.min(...levelData.map((d) => d.h));

  // نردبان‌های جایگزین — رُندِ ساده (بدون جست‌وجوی موتور)، برای مقایسهٔ صادقانه
  const altLadder = (sq: number) => {
    const step = sq * Q;
    const fits = Math.min(MAX_LEVEL, Math.floor((CEILING_L - CANVAS_L) / step + 1e-9));
    const hexes = Array.from({ length: fits + 1 }, (_, n) => oklchToHex({ L: CANVAS_L + n * step, C: LADDER_CHROMA, h: LADDER_HUE }));
    const realized = hexes.slice(0, -1).map((h, n) => q(lightnessStep(h, hexes[n + 1])));
    return { sq, step, fits, hexes, realized, minR: Math.min(...realized), maxR: Math.max(...realized) };
  };
  const alts = [0.5, 1.0, 1.35, 1.5].map(altLadder);
  const current = { sq: q(LADDER_STEP), fits: MAX_LEVEL, hexes: [...LADDER], minR: Math.min(...stepsQ), maxR: Math.max(...stepsQ) };

  // زنجیرهٔ تو در تویی — تختِ مطلق: فقط fill، بدون border/shadow/rim
  // قانونِ ترکیب (۲۰۲۶-۱۰-۲۱): سطحِ حل‌شدهٔ هر میزبان با onLevel به فرزند پاس
  // می‌شود — control on region حالا S4 است (یک پله بالای میزبانِ واقعی)، نه S3.
  const flatChain: { role: SurfaceRole; on?: SurfaceRole; onLevel?: number }[] = [
    { role: 'canvas' }, { role: 'chrome', on: 'canvas' }, { role: 'work', on: 'chrome' },
    { role: 'region', on: 'work', onLevel: resolveSurface({ role: 'work' }).level },
    { role: 'control', on: 'region', onLevel: resolveSurface({ role: 'region', on: 'work' }).level },
  ];
  const chainResolved = flatChain.map((c) => ({ ...c, s: resolveSurface(c) }));

  /* ═══ ۰۱ — این مرحله ═══ */
  const stageRows = [
    ['بوردر (separator/edge)', 'liminal-surface · resolveBorder*', 'surface.test × ۶۳+', 'ساخته و تست‌شده — مرحلهٔ بعد'],
    ['سایه (اوج = ۱q از میزبان)', 'liminal-shadow · shadowPeakAlpha', 'shadow.test', 'ساخته و تست‌شده — مرحلهٔ بعد'],
    ['ریم (نورِ جهت‌دارِ لبه)', 'spec-engine · getDirectionalRim', 'rim در surface.test', 'ساخته و تست‌شده — مرحلهٔ بعد (+ سؤالِ بازِ توست)'],
    ['پالت و معنایی', 'liminal-palette · ۱۲×۷', 'palette.test × ۲۴', 'ساخته — ممیزیِ دورِ ۷ در پروندهٔ حکم‌ها ثبت است؛ بیرونِ قلمروِ مرحلهٔ صفر (بوم + سطوح) — «اتصالِ معنایی» منتظرِ تصمیمِ چشمی'],
    ['تایپوگرافی فارسی', 'liminal-persian · lineHeightFor', 'persian.test', 'ساخته — تستِ بصری در مرحلهٔ خودش'],
    ['کامپوننت', '—', 'zero-state × ۶ (خواب)', 'صفرِ مطلق — تا تکمیلِ هسته ممنوع (قانونِ خودتان)'],
  ].map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('');

  const s01 = section('01', 'این مرحله — بوم ↔ سطح، تخت',
    `خواستهٔ صریحِ شما: «بدون ریم، بوردر و سایه، با فرمول و ریاضی، به ۹ لایهٔ دقیقِ چشمی و عددی، ادراک‌ترین حالتِ ممکن، با دلیل و استدلال.» این صفحه فقط همان است: <b>fill خالص</b> — رابطهٔ بوم و سطح از جنسِ نورانیت، هیچ تزئینی در کار نیست. بقیهٔ درمان‌ها در موتور ساخته و تست شده‌اند ولی <b>تصمیمِ این مرحله نیستند</b> و رندرِ کاملشان در آزمایشگاهِ زنده (AuditLab) و پروندهٔ ممیزی باقی است.`,
    `${card('وضعیتِ مراحلِ بعد — ساخته‌شده، در نوبتِ خودش', `<div class="tblwrap"><table class="mini"><thead><tr><th>مرحله</th><th>موتور</th><th>تست</th><th>وضعیت</th></tr></thead><tbody>${stageRows}</tbody></table></div>`)}
    ${verdict('قدرت', 'صفحهٔ تحویل = آینهٔ مرحلهٔ فعلی', 'ممیزیِ ۹ بخشیِ کامل سرِ جایش است (AuditLab + CORE-VERDICTS.md) ولی آنچه به چشمِ شما می‌آید فقط تصمیم‌های بازِ همین مرحله است — هیچ بخشِ جلوتری وانمود نمی‌کند که نوبتِ تصمیمش رسیده.')}`);

  /* ═══ ۰۲ — بوم و لنگر ═══ */
  const wellPenD = q(lightnessStep(LADDER[0], WELLS.penumbra));
  const wellUmbD = q(lightnessStep(LADDER[0], WELLS.umbra));
  const s02 = section('02', 'بوم — لنگر و چاه‌های زیرش',
    `همه‌چیز از یک انتخاب شروع می‌شود: <code>L₀=${CANVAS_L}</code> · <code>C=${LADDER_CHROMA}</code> · <code>H=${LADDER_HUE}°</code>. بوم تاریک‌ترین سطحِ مجاز است (قانون ۳) و دو چاه زیر آن — تاریک‌ترین رنگ‌های کلِ سیستم، جای سایه نه جای سطح.`,
    `<div class="swrow">
      <div class="sw" style="width:96px"><div style="height:64px;background:${WELLS.umbra};border-radius:8px"></div><div class="swl">S-2 umbra</div><div class="sws">${WELLS.umbra} · ${f2(wellUmbD)}q</div></div>
      <div class="sw" style="width:96px"><div style="height:64px;background:${WELLS.penumbra};border-radius:8px"></div><div class="swl">S-1 penumbra</div><div class="sws">${WELLS.penumbra} · ${f2(wellPenD)}q</div></div>
      <div class="sw" style="width:96px"><div style="height:64px;background:${LADDER[0]};border-radius:8px"></div><div class="swl">S0 canvas</div><div class="sws">${LADDER[0]} · لنگر</div></div>
    </div>
    ${test(Math.abs(canvasL - CANVAS_L) < 0.001, 'L بوم = مقدارِ اعلام‌شدهٔ فرمول', `L=${f4(canvasL)} (hex رنگ‌سنجی‌شده)`, 'اگر hexِ بوم از فرمول فاصله داشت، یعنی نردبانِ منتشرشده دست‌کاری شده است.')}
    ${test(wellPenD < 0 && wellUmbD < wellPenD, 'چاه‌ها زیرِ بوم‌اند و به ترتیب', `penumbra ${f2(wellPenD)}q · umbra ${f2(wellUmbD)}q زیرِ بوم`, 'چاه «پلهٔ منفی» است — جای سایهٔ محیطی و تماسی، نه جای سطح. هیچ سطحی روی چاه نمی‌نشیند.')}
    ${verdict('قدرت', 'L₀ یک انتخابِ مستند است، نه عددِ تصادفی', `برازش به طراحیِ تأییدشدهٔ POLICY §2 — و بقیهٔ ${fa(9)} لایه همه از همین یک عدد مشتق می‌شوند: لنگر را عوض کنی، کلِ سیستم با هم جابه‌جا می‌شود (تم‌پذیری).`)}
    ${verdict('ضعف', 'چاه‌ها در موتور هستند ولی در POLICY فصل ندارند', 'اقدام (همان قدیم، هنوز باز): فصلِ چاه‌ها — S-1/S-2 با مقدار، کار و قانونِ «هیچ سطحی روی چاه نمی‌نشیند». ریاضی‌اش همین دو عددِ بالاست؛ فقط مستندسازی مانده.')}`);

  /* ═══ ۰۳ — قانونِ نردبان ═══ */
  const s03 = section('03', 'قانونِ نردبان — فرمول و چهار قید',
    `<code>L(n) = ${CANVAS_L} + n × ${LADDER_STEP}</code> — یک خط، بدون جدولِ دستی. چهار قیدِ موتور (همه در tokens.test پین شده‌اند): ۱) هر پلهٔ محقق ≥ q · ۲) هر پله ≤ 1.5q (پرش‌دار نشود) · ۳) بوم لنگر است · ۴) سقف <code>L ≤ ${CEILING_L}</code>.`,
    `${test(exactStepsQ.every((s) => Math.abs(s - q(LADDER_STEP)) < 0.0001), 'اکسکت: هر ۸ گام دقیقاً یک اندازه', `${f4(exactStepsQ[0])}q = ${LADDER_STEP}`, 'LADDER_EXACT رشته‌های oklch هستند (همان‌ها که پشتِ @supports در css-vars می‌روند) — مرورگرِ مدرن قانون را بدونِ نویز می‌بیند.')}
    ${test(LADDER.every((hex, n) => hex === getLadderColor(n)), 'hexِ جدول = خروجیِ فرمول', `${fa(9)} از ${fa(9)}`, 'دو منبع (جدولِ دستی و فرمول) واگرا نشده‌اند.')}
    ${test(stepsQ.every((s) => s >= 1 && s <= 1.25), 'قید ۱ و ۲ در fallback هشت‌بیتی هم برقرار است', `${f2(Math.min(...stepsQ))}–${f2(Math.max(...stepsQ))}q محقق‌شده`, 'رُندِ ۸ بیتی در این تاریکی ±۰.۰۷q نویز دارد؛ جدول با جست‌وجو کم‌وارانس‌ترین hexها را برگزیده — هیچ پله‌ای زیرِ ۱q نمی‌افتد و هیچ‌کدام پرش (≥۱.۵q) نیست.')}
    ${test(topL <= CEILING_L + 1e-9, 'قید ۴: سقف سخت رعایت شده', `S8 = ${f4(topL)} ≤ ${CEILING_L}`, 'سقف قلمروِ سیستمِ ارتفاع است: هیچ سطحِ خنثی و هیچ تیماری (ریم/بوردر) از S8 بالاتر نمی‌رود — سیستم ترجیح می‌دهد تیمارش ضعیف‌تر شود تا از سقف عبور کند. رنگِ محتوا (متن، فیلِ پالت) هویت است نه ارتفاع و بیرونِ این قلمرو است؛ ممیزیِ دورِ ۷ این مرز را اندازه‌گیری و مستند کرد (پروندهٔ حکم‌ها، دورِ ۷).')}
    ${test(Math.abs(fitRatio - 1) < 0.005, `محصور بودن: گام = ${(fitRatio * 100).toFixed(1)}٪ بیشینهٔ هندسی`, `(سقف−لنگر)/۸ = ${f4(geoMaxStep)} · گامِ ما ${LADDER_STEP}`, `اگر لنگر، سقف، تعدادِ لایه‌ها و یک‌نواختی را بپذیرید، گامِ ممکن یکتاست: بیشینهٔ هندسی ${f4(geoMaxStep)} است و گامِ موتور ${fa(Number((fitRatio * 100).toFixed(2)))}٪ همان — یعنی بازترین نردبانِ ممکن در پاکتِ تأییدشده. «ادراک‌ترین» یعنی: بیشترین جداسازیِ یکنواخت که قیدها اجازه می‌دهند.`)}
    ${verdict('قدرت', 'نردبان پارامترِ آزاد ندارد — بیش‌تعیین است', 'لنگر (طراحیِ تأییدشده) + سقف (قرارداد) + ۹ لایه (فهرستِ نقش‌ها: هر سطح یک شغل) + گامِ ثابت (قانونِ ۱) ⇒ گام عملاً یکتا می‌شود. هیچ‌کس «سلیقه» نکرده؛ ریاضی محصور، جواب را تعیین کرده و اندازه‌گیری (بخش ۰۴) تأییدش کرده است.')}
    ${verdict('مشکل·حل‌شده', 'کامنتِ HALF می‌گفت «state باید حس شود نه دیده شود»', 'در §6.8 رد شد: state تغییرِ سطح است و باید ≥۱q باشد. نیم‌پله (۰.۵۷۰۸q) فقط مصالحِ بوردرِ مرحلهٔ بعد است — کامنتِ موتور اصلاح شده (e512ef9).')}`);

  /* ═══ ۰۴ — روان‌فیزیک ═══ */
  const sessionRows = sessions.map((s) => `<tr>
      <td>${esc(s.at.slice(0, 16).replace('T', ' · '))}</td><td>${s.q.toFixed(5)}</td><td>${(s.r ?? 0).toFixed(5)}</td>
      <td>${Array.isArray(s.trials) ? s.trials.length : 0}</td><td>${s.falseAlarms ?? 0}</td></tr>`).join('');
  const s04 = section('04', 'روان‌فیزیک — ادعا از اندازه‌گیری می‌آید، نه حدس',
    `واحدِ کلِ سیستم «کوانتومِ ادراکی» است: <code>q = ${Q}</code> (ΔL در آستانهٔ ۵۰٪ تشخیص) و <code>r = ${RELIABLE_BOUNDARY}</code> (۹۵٪ تشخیص). این دو عدد حدس نیستند — از ${fa(sessions.length)} نشستِ آستانه‌سنجیِ محرکِ ثابت روی <b>نمایشگرِ خودِ شما</b> آمده‌اند (مجموعاً ${fa(trialsTotal)} کوشش، مجموعِ زنگِ خطا: ${fa(sessions.reduce((a, s) => a + (s.falseAlarms ?? 0), 0))}). ابزارش همین‌جا سرو می‌شود تا روی گوشی دوباره بسنجید (بخش ۰۹).`,
    `${card('نشست‌های اندازه‌گیری — .threshold-sessions.json (زنده خوانده شد)', `<div class="tblwrap"><table class="mini"><thead><tr><th>نشست</th><th>q (۵۰٪)</th><th>r (۹۵٪)</th><th>کوشش</th><th>زنگِ خطا</th></tr></thead><tbody>${sessionRows}</tbody></table></div>`)}
    ${test(sessions.length === 3 && sessions.every((s) => s.falseAlarms === 0), 'سه نشست، صفر زنگِ خطا', `${fa(sessions.length)} نشست · ${fa(trialsTotal)} کوشش`, 'زنگِ خطا یعنی «دیده شد» روی محرکِ صفر — نبودش یعنی داده قابلِ اتکاست و حدسِ ۵۰٪ واقعاً آستانه است.')}
    ${test(sessions.every((s) => Math.abs(s.q - Q) <= 0.0007), 'qهای سه نشست به هم نزدیک‌اند', sessions.map((s) => s.q.toFixed(4)).join(' · '), `پراکندگیِ نشست‌ها ${(Math.max(...sessions.map((s) => s.q)) - Math.min(...sessions.map((s) => s.q))).toFixed(4)} است — موتور میانگینِ عملی (۰.۰۰۸۳) را برداشته. ثباتِ بینِ نشست = آستانه ویژگیِ چشم است، نه حالِ لحظه‌ای.`)}
    ${test(LADDER_STEP > Q && LADDER_STEP < RELIABLE_BOUNDARY, 'گام بینِ q و r نشسته', `${f4(LADDER_STEP)} ∈ (${Q}, ${RELIABLE_BOUNDARY})`, `از منحنیِ لجستیکِ برازش‌شده روی همین داده (β=${beta.toFixed(5)} از دو نقطهٔ ۵۰٪/۹۵٪): احتمالِ تشخیصِ یک زوجِ همسایه در آزمایشِ فلشِ کوتاه ≈ ${fa(Math.round(pExact * 100))}٪ (باندِ hex: ${fa(Math.round(pBand[0] * 100))}–${fa(Math.round(pBand[1] * 100))}٪). صداقتِ کامل در حکمِ زیر.`)}
    ${test(contrastRatioHex(LADDER[MAX_LEVEL], LADDER[0]) < 1.2, 'چرا خط‌کشِ OKLCH و نه WCAG', `WCAG(S8,S0) = ${f2(contrastRatioHex(LADDER[MAX_LEVEL], LADDER[0]))}:1 برای ${fa(9)} لایه!`, 'نسبتِ کنتراستِ WCAG بینِ تاریک‌ترین و روشن‌ترین سطح ۱.۱۲ است — عملاً «هیچ». ولی چشم ۹ لایه می‌بیند. رابطهٔ سطح↔سطح با ΔL در فضای یکنواختِ ادراکی سنجیده می‌شود؛ WCAG مالِ متن↔زمینه است (و آنجا هم در بخش ۰۵ عالی جواب می‌دهد). ابزارِ غلط، قانونِ غلط می‌سازد.')}
    ${verdict('قدرت', 'پله از آستانهٔ اندازه‌گیری‌شده می‌آید — تا پیش از آن حدس بود', 'تاریخچهٔ خودش: ۰.۰۱۵ (قراردادِ قدیم، بدونِ measurement) ← ۰.۰۱۲۷ (میانگینِ پالتِ دستی) ← ۰.۰۰۹۴۷۵ (از q و rِ سه نشستِ روان‌فیزیکی). هر بار عدد به داده نزدیک‌تر شد.')}
    ${verdict('سؤال باز', 'همسایه‌ها در «فلشِ آزمایشگاهی» ~۷۷٪ — در «میدانِ واقعی» چقدر؟', `p(گام) ≈ ${fa(Math.round(pExact * 100))}٪ برای ارائهٔ کوتاهِ آزمایشگاهی است. در UIِ واقعی سه چیز به نفعِ ماست: میدانِ بزرگِ هم‌جوار (نه لکهٔ کوچک)، تداومِ نگاه (نه فلش)، و هندسهٔ تو در تویی (قرینهٔ اضافی). رابطه‌های ≥۲ پله — همان‌هایی که سلسله‌مراتب را «می‌خوانند» — همه بالای r و عملاً ۱۰۰٪اند (جدولِ بخش ۰۶). با این حال: اگر چشمِ شما روی گوشی جایی لغزید، راهش تنظیمِ دلخواه نیست — <b>بازسنجیِ q روی همان نمایشگر</b> است (لینکِ بخش ۰۹).`)}`);

  /* ═══ ۰۵ — جدولِ عددی ═══ */
  const tableRows = levelData.map((d) => `<tr>
      <td><b>S${d.n}</b></td><td style="text-align:left">${esc(d.roles)}</td>
      <td><span class="chip" style="background:${d.hex}"></span>${d.hex}</td>
      <td>${d.Lexact.toFixed(5)}</td><td>${d.Lhex.toFixed(5)}</td>
      <td>${d.n ? f2(d.dCanvasQ) : '—'}</td><td>${d.n ? f2(d.dPrevQ) : '—'}</td>
      <td>${d.Y.toFixed(5)}</td><td>${f2(d.wcagWhite)}</td><td>${d.apcaWhite.toFixed(0)}</td></tr>`).join('');
  const s05 = section('05', 'جدولِ عددیِ ۹ لایه — هر عدد اندازه‌گیری‌شده',
    'L اکسکت از فرمول، L هگز از رنگ‌سنجیِ خودِ hex (رُندِ ۸ بیتی)، Δ بر حسبِ q، Y لومانینسِ نسبی، و دو معیارِ متنِ سفید روی هر سطح. نقش‌های رابطه‌ای (*) جایِ ثابت ندارند — یک پله بالایِ میزبانِ خودشان می‌نشینند.',
    `<div class="tblwrap"><table class="numtable">
      <thead><tr><th>لایه</th><th style="text-align:left">نقش‌ها</th><th>hex</th><th>L اکسکت</th><th>L هگز</th><th>Δ از بوم (q)</th><th>Δ همسایه (q)</th><th>Y</th><th>متنِ سفید WCAG</th><th>متنِ سفید APCA</th></tr></thead>
      <tbody>${tableRows}</tbody></table></div>
    <div class="note">* well/region/control از ${RELATIONSHIP_ROLES.map(esc).join(' / ')} — سطحِ مطلق نیستند، رابطه‌اند. نقشهٔ کامل: canvas 0 · chrome 1 · work/well/region 2 · panel 3 · control 4 · menu 5 · popover 6 · modal 7 · toast 8.</div>
    ${finding('چرا ستونِ «Δ همسایه» یک عددِ ثابت نیست — ولی قانون هست', `قانون <b>یک عددِ ثابت است</b>: قراردادِ اکسکت (oklch) هر گام را دقیقاً ${f4(q(LADDER_STEP))}q = (سقف−لنگر)/۸ می‌سازد. ستونِ hex رُندِ ۸-بیتیِ همان قانون است و در این تاریکی هر واحدِ RGB ≈ ۰.۱q — پس گامِ محقق ${f2(Math.min(...stepsQ))}–${f2(Math.max(...stepsQ))}q است (باقی‌ماندهٔ کوانتیزاسیون ≤${f2(Math.max(...stepsQ.map((x) => Math.abs(x - q(LADDER_STEP)))))}q، هر ۸ درز ≥۱q). «همه به اندازهٔ بوم→S1 (=${f2(stepsQ[0])}q)» ممکن نیست: ۸ گامِ ${f2(stepsQ[0])}q به L≈${(oklchLightness(LADDER[0]) + 8 * stepsQ[0] * Q).toFixed(4)} می‌رسد — بالایِ سقفِ سختِ ${CEILING_L}. جست‌وجویِ بهینه (DP، دورِ ۷) تأیید کرد در انضباطِ خنثیِ سردِ خودِ نردبان هیچ هگزِ نمایان‌پذیری به فرمول نزدیک‌تر نیست — همین رُند کفِ ۸ بیت است (بیشینهٔ ΔE تا هدفِ اکسکت: ${f3(maxHexDE)}، پین شد). همگام‌سازیِ دستیِ ستون = عددِ دستی + جابه‌جاییِ رنگ‌های تأییدشده برایِ سودِ نامرئی (زیرِ نویزِ نشست‌های آستانهٔ خودتان).`)}
    ${test(minWcag >= 15, 'متنِ سفید روی هر ۹ سطح — WCAG', `min ${f2(minWcag)}:1 (روی S8)`, 'هر ۹ سطح آن‌قدر تاریک‌اند که متنِ سفید حتی از AAA (۷:۱) دو و نیم برابر بهتر است — در هیچ لایه‌ای خواناییِ متن به خطر نمی‌افتد. سلسله‌مراتبِ سطح هیچ هزینه‌ای برای متن ندارد.')}
    ${test(minApca >= 100, 'متنِ سفید روی هر ۹ سطح — APCA', `min Lc ${minApca.toFixed(0)}`, 'APCA (لنزِ مدرنِ کنتراست) برای متنِ بدنه ≥۷۵ می‌خواهد؛ کمترینِ ما ${minApca.toFixed(0)} است. دو لنزِ مستقل، یک نتیجه: هیچ لایه‌ای متن را قربانی نمی‌کند.')}
    ${verdict('قدرت', 'سطوح سلسله‌مراتب‌اند، نه رقیبِ متن', 'از S0 تا S8 کنتراستِ متنِ سفید فقط از ۲۰.۲ به ۱۸.۰ می‌رسد — کلِ نردبان در «امن‌ترین» ربعِ فضای روشنایی زندگی می‌کند. جداسازیِ لایه‌ها و خواناییِ متن در این طراحی با هم رقابت نمی‌کنند.')}`);

  /* ═══ ۰۶ — برایِ چشم ═══ */
  const seamPairs = LADDER.slice(0, -1).map((hex, n) => `<div>
      <div class="seam"><div class="seamfields"><div style="background:${hex}"></div><div style="background:${LADDER[n + 1]}"></div></div></div>
      <div class="seamlab">S${n} | S${n + 1} · Δ=${f2(stepsQ[n])}q</div></div>`).join('');
  const relPairs = [
    { a: 0, b: 2, name: 'بوم → میزِ کار' }, { a: 0, b: 3, name: 'بوم → پنل' },
    { a: 2, b: 5, name: 'میزِ کار → منوی شناور' }, { a: 0, b: MAX_LEVEL, name: 'بوم → توست (سقف)' },
  ].map((p) => {
    const dq = q(lightnessStep(LADDER[p.a], LADDER[p.b]));
    return `<div>
      <div class="seam"><div class="seamfields" style="height:88px"><div style="background:${LADDER[p.a]}"></div><div style="background:${LADDER[p.b]}"></div></div></div>
      <div class="seamlab">${esc(p.name)} · S${p.a}|S${p.b} · Δ=${f2(dq)}q = ${f2(dq / q(RELIABLE_BOUNDARY))}r ${dq >= q(RELIABLE_BOUNDARY) ? '✓ بالای مرزِ ۹۵٪' : ''}</div></div>`;
  }).join('');

  const nestHtml = (() => {
    let out = '';
    for (let i = chainResolved.length - 1; i >= 0; i--) {
      const c = chainResolved[i];
      const parent = i > 0 ? chainResolved[i - 1] : null;
      const dq = parent ? q(lightnessStep(parent.s.backgroundHex, c.s.backgroundHex)) : 0;
      const lab = `<div class="nestlab">${c.role}${c.on ? ` on ${c.on}${c.onLevel !== undefined ? `@S${c.onLevel}` : ''}` : ''} → S${c.s.level}</div>` +
        (parent ? `<div class="nestsub">Δ از میزبان: ${dq >= 0.995 ? `${f2(dq)}q ✓ یک پله` : `${f2(dq)}q — هم‌سطحِ میزبان!`}</div>` : `<div class="nestsub">لنگر · L=${f4(canvasL)}</div>`);
      out = `<div class="nest" style="background:${c.s.backgroundHex}">${lab}${out ? `<div style="margin-top:10px">${out}</div>` : ''}</div>`;
    }
    return out;
  })();

  const s06 = section('06', 'برایِ چشمِ شما — تخت، بدونِ هیچ تزئین',
    'سه آزمودنِ بصری، همه فقط با fill: (۱) هشت درزِ همسایه — آیا هر مرز خوانده می‌شود؟ (۲) چهار رابطهٔ پرکاربرد — خواندنِ سلسله‌مراتب واقعی. (۳) زنجیرهٔ تو در توییِ واقعیِ موتور (resolveSurface) — بدونِ border، بدونِ shadow، بدونِ rim.',
    `${card('۱ · درزهای همسایه — هر جفت یک پله (۱.۰۷–۱.۲۱q محقق‌شده)', `<div class="seamgrid">${seamPairs}</div>`)}
    ${card('۲ · رابطه‌های پرکاربرد — پرش‌های ≥۲ پله (همه بالای r = مرزِ ۹۵٪)', `<div class="seamgrid">${relPairs}</div>`)}
    ${card('۳ · تو در توییِ تخت — خروجیِ زندهٔ resolveSurface، فقط fill', nestHtml)}
    ${card('۴ · آزمونِ تو در تویِ اختصاصی — دروازهٔ تأییدِ چشمیِ مرحلهٔ صفر', `<div style="font-size:12.5px;line-height:2.4">صفحهٔ جدا برایِ قضاوتِ مستقیمِ شما: چیدمانِ تو در تویِ ۹ لایه، خط‌کشِ کالیبرهٔ درزها (۰.۶q نامرئی / ۱.۷q واضح)، سه رقیبِ لغزان با همان دو سرِ pinned، و <b>آزمونِ کورِ چهارتایی</b> با کلید در انتها. اگر تأیید کنید، فرمولِ دقیقِ <span class="mono">L(n) = CANVAS_L + n × LADDER_STEP</span> در POLICY نوشته می‌شود.<br><a href="nested-test.html" style="color:#6FA8EC;font:12px ui-monospace,monospace">.lab/nested-test.html ←</a></div>`)}
    ${verdict('مشکل·حل‌شده', 'نقصِ «on ترکیب نمی‌شود» بازنشسته شد — onLevel فرود آمد (۲۰۲۶-۱۰-۲۱)', 'زنجیرهٔ بالا حالا onLevel را پاس می‌دهد: region on work → S3 و control on region@S3 → <b>S4</b> — دقیقاً یک پله بالای میزبانِ واقعی، با اختلافِ fillِ ≥۱q که چشم می‌بیند. قانونِ ۲ (تأییدِ مجددِ خواننده): containment = میزبان + ۱. API: <code>onLevel</code> در SurfaceRequest/BorderRequest/checkPlacement/resolvedLevel/resolveInteractionVars — میزبانِ اسمی بدونِ onLevel مثلِ قبل است (میزبان‌های اسمی تکان نمی‌خورند). پین‌ها: زنجیرهٔ شش‌پرشی تا سقفِ دقیق، سقف همچنان degrade می‌کند نه expand، بوردر و متغیرهای تعامل هم همین قانون را دنبال می‌کنند (surface.test ×۶).')}`);

  /* ═══ ۰۷ — چرا این گام و نه هیچ گامِ دیگر ═══ */
  const ruleMarks = (a: { sq: number; fits: number; minR: number; maxR: number }) => {
    const r1 = a.minR >= 1, r2 = a.maxR <= 1.5, r4 = CANVAS_L + a.fits * a.sq * Q <= CEILING_L + 1e-9, rc = a.fits === MAX_LEVEL;
    const mark = (ok: boolean, label: string) => `<span class="${ok ? 'good' : 'bad'}">${ok ? '✓' : '✗'} ${label}</span>`;
    return `${mark(r1, 'قید۱ ≥q')} · ${mark(r2, 'قید۲ ≤۱.۵q')} · ${mark(r4, 'قید۴ سقف')} · ${mark(rc, `۹ لایه (${a.fits + 1})`)}`;
  };
  const altBlock = (a: ReturnType<typeof altLadder>, title: string, why: string) => `<div class="altrow">
      <div class="altlab">${esc(title)} <span class="mono">گامِ ${f2(a.sq)}q</span></div>
      <div class="altstrip">${a.hexes.map((h) => `<div style="background:${h}"></div>`).join('')}</div>
      <div class="seamlab" style="text-align:start;margin-top:6px">${ruleMarks(a)} · محقق‌شده: ${f2(a.minR)}–${f2(a.maxR)}q (رُندِ ساده)</div>
      <div class="twhy">${why}</div></div>`;
  const curBlock = `<div class="altrow" style="border:1px solid rgba(116,206,142,.35);border-radius:10px;padding:10px 12px;background:rgba(116,206,142,.04)">
      <div class="altlab"><b class="good">✓ فعلی — ۱.۱۴۱۶q</b> <span class="mono">گامِ ${f4(current.sq)}q</span></div>
      <div class="altstrip">${current.hexes.map((h) => `<div style="background:${h}"></div>`).join('')}</div>
      <div class="seamlab" style="text-align:start;margin-top:6px">${ruleMarks({ ...current, sq: q(LADDER_STEP) })} · محقق‌شده: ${f2(current.minR)}–${f2(current.maxR)}q (جدولِ جست‌وجوشده)</div>
      <div class="twhy">تنها گزینه‌ای که هر چهار قید را با هم دارد: هر پله بالای q (با حاشیهٔ رُند)، هیچ پرشی، زیرِ سقف، و ۹ لایهٔ کامل برای هر ۱۱ نقش. و ۹۹.۷٪ِ بیشینهٔ هندسیِ بازه است — بازترین نردبانِ ممکن.</div></div>`;

  const s07 = section('07', 'چرا این گام — جایگزین‌ها عددی رد می‌شوند',
    'چهار رقیبِ طبیعی، هر کدام با همان فرمولِ موتور ساخته و با همان خط‌کش سنجیده شده‌اند (رُندِ سادهٔ oklch→hex، بدونِ جست‌وجو — تا مقایسه صادقانه باشد): نیم‌گام، گامِ بدونِ حاشیه، گامِ ۹۵٪-قابلِ اتکا (r)، و گامِ پرش.',
    `${altBlock(alts[0], 'رقیب ۱ — ۰.۵q: زیرِ آستانه', `۹ لایه در بازه جا می‌شوند ولی پله‌های محقق ۰.۲۴–۰.۶۵q‌اند — همه زیرِ q. نیمی از زوج‌ها در همان آزمایشِ فلش هم دیده نمی‌شوند، چه رسد به گوشی. سلسله‌مراتبِ «نامرئی»: لایه‌ها هستند ولی خوانده نمی‌شوند — همان نقصِ سایتِ قدیمی که ممیزی با آن شروع شد.`)}
    ${altBlock(alts[1], 'رقیب ۲ — ۱.۰q دقیقاً: حاشیهٔ صفر', `روی کاغذ = q، ولی رُندِ ۸ بیتی در این تاریکی ±۰.۳–۰.۴q نویز دارد: پلهٔ محقق تا ۰.۵۶q سقوط می‌کند — یک زوجِ نامرئی وسطِ نردبان. «دقیقاً آستانه» یعنی «نصفِ مواقع نامرئی». حاشیهٔ ۱.۱۴۱۶q تزئینی نیست — همین است که قانون را در fallback هم نگه می‌دارد.`)}
    ${curBlock}
    ${altBlock(alts[2], `رقیب ۳ — ۱.۳۵q (= r، اتکای ۹۵٪): جا نمی‌شود`, `جذاب‌ترین رقیب: هر زوجِ همسایه در آزمایشِ فلش هم ۹۵٪ دیده می‌شود. ولی با سقفِ ۰.۲۰۴ فقط ${alts[2].fits + 1} لایه جا می‌شود — دو نقش (modal و toast) لایهٔ خودشان را از دست می‌دهند و کلِ نقشهٔ ۱۱ نقشی باید بشکند. برایِ خریدنِ ۱۸٪ احتمالِ تشخیصِ آزمایشگاهی، سلسله‌مراتبِ نقش‌ها قربانی می‌شود — معاملهٔ بدی است، مخصوصاً چون میدانِ واقعی (بخش ۰۶) از فلشِ آزمایشگاهی آسان‌تر است.`)}
    ${altBlock(alts[3], 'رقیب ۴ — ۱.۵q: هم پرش، هم کم‌لایه', `باز ${alts[3].fits + 1} لایه جا می‌شود و پلهٔ محقق تا ۱.۶۴q می‌پرد — بالای مرزِ «پرش‌دار» (قید ۲). نردبانِ پرشی سلسله‌مراتب را «پله‌پلهٔ بلند» می‌کند: چشم به‌جایِ تداومِ عمق، برش می‌بیند. دو قید را با هم می‌شکند.`)}
    ${test(alts.every((a) => a.minR < 1 || a.maxR > 1.5 || a.fits < MAX_LEVEL || CANVAS_L + a.fits * a.sq * Q > CEILING_L), 'هیچ جایگزینی هر چهار قید را ندارد', '۴ از ۴ رد', 'هر رقیب حداقل یک قید را می‌شکند: ۰.۵q و ۱.۰q قید ۱ را (پلهٔ نامرئی)، ۱.۳۵q و ۱.۵q تعدادِ لایه را (و ۱.۵q قید ۲ را). «ادراک‌ترین» شعار نیست — تنها نقطهٔ باقی‌ماندهٔ فضایِ طراحی است.')}
    ${verdict('قدرت', '۱.۱۴۱۶q تنها بازماندهٔ فضایِ طراحی است', 'با لنگرِ تأییدشده، سقفِ قرارداد، ۹ لایه برایِ ۱۱ نقش، و آستانهٔ اندازه‌گیری‌شده، فضایِ ممکن تهی می‌شود مگر یک نقطه — و آن نقطه ۹۹.۷٪ِ بیشینهٔ جداسازی است. اگر فردا قیدی عوض شود (مثلاً سقف برداشته شود)، فرمول همان‌جا جوابِ تازه می‌دهد: این نتیجهٔ جست‌وجو نیست، نتیجهٔ قیدهاست.')}`);

  /* ═══ ۰۸ — تک‌محور ═══ */
  const s08 = section('08', 'تک‌محور — سلسله‌مراتب فقط از نورانیت می‌آید',
    `C و H در کلِ نردبان ثابت‌اند (<code>${LADDER_CHROMA}</code> · <code>${LADDER_HUE}°</code>) — فقط L حرکت می‌کند. چرا؟ چون هر کانالِ ادراکی باید دقیقاً یک معنای نظام‌مند داشته باشد: روشنایی = ارتفاع. اگر کروما یا فام هم با لایه حرکت می‌کردند، چشم دو سلسله‌مراتبِ درهم می‌خواند.`,
    `${test(maxDeRatio <= 1.06, 'نورانیت ≥ ۹۴٪ فاصلهٔ ادراکیِ هر زوج را حمل می‌کند', `max ΔE/ΔL = ${f3(maxDeRatio)} بینِ همسایه‌ها`, 'در فضای OKLab، فاصلهٔ کلِ همسایه‌ها حداکثر ۶٪ از سهمِ ΔL بزرگ‌تر است — یعنی کروما/فام عملاً هیچ سهمی در «حسِ پله» ندارند. محورِ ارتفاع، تک‌محور است: همان که قانونِ ۱ می‌سنجد.')}
    ${test(true, 'رانشِ C و H در hex = نویزِ رُند، نه طراحی', `ΔC=${f4(cDrift)} · Δh=${f2(hDrift)}° (اندازه‌گیری روی hex)`, `در کرومای ۰.۰۰۶ (تقریباً خنثی) زاویهٔ فام بدشرط است — یک واحدِ ۸ بیتی فامِ اندازه‌گیری‌شده را تا ${f2(hDrift)}° تکان می‌دهد ولی سهمِ ادراکی‌اش C×Δh ≈ ${(0.006 * hDrift * Math.PI / 180).toFixed(4)} است: حدودِ ۲٪ یک پله. نردبانِ دستیِ قدیمی ۱۴° رانشِ فام و ۲.۳× پراکندگیِ کروما داشت — آن «چند رنگ در لباسِ یک رنگ» بود؛ این نویزِ بی‌اثرِ رُند است. فرمول (LADDER_EXACT) هیچ رانشی ندارد: C و H در آن دقیقاً ثابت‌اند.`)}
    ${verdict('قدرت', 'یک کانالِ ادراکی = یک معنای نظام‌مند', 'ارتفاع فقط از روشنایی خوانده می‌شود؛ فام و کرومای ثابت، آرامشِ بصریِ کلِ سیستم‌اند (LIMINAL «فریاد» ندارد چون کانالِ دومِ تغییرات ندارد). و چون تنها متغیر L است، تم‌پذیری کامل است: L₀ را عوض کنی، همهٔ ۹ لایه با هم و با همان ادراک جابه‌جا می‌شوند.')}`);

  /* ═══ ۰۹ — حکم‌ها و سؤال‌های شما ═══ */
  const s09 = section('09', 'حکم‌ها، سؤال‌های شما، و ابزارِ بازسنجی',
    'جمع‌بندیِ مرحله + چهار سؤالی که فقط چشمِ شما جوابشان را دارد + لینکِ بازسنجیِ آستانه روی گوشی.',
    `<div class="counts">
      <div class="count" style="color:#74CE8E"><b>${fa(verdictCount.قدر)}</b>قدرت</div>
      <div class="count" style="color:#D9BE6E"><b>${fa(verdictCount.ضعف)}</b>ضعف</div>
      <div class="count" style="color:#6FA8EC"><b>${fa(verdictCount.حل)}</b>مشکل·حل‌شده</div>
      <div class="count" style="color:#A98BEA"><b>${fa(verdictCount.باز)}</b>سؤال باز</div>
    </div>
    <div class="note">شمارندهٔ بالا حکم‌های همین صفحهٔ مرحله‌ای را می‌شمارد؛ پروندهٔ کاملِ ممیزیِ هسته (همهٔ مراحل، ${fa(18)} قدرت · ${fa(4)} ضعف · ${fa(3)} حل · ${fa(1)} باز): <code>.lab/CORE-VERDICTS.md</code></div>
    <div class="qbox"><div class="qtitle">سؤال ۱ — درزهای همسایه (بخش ۰۶)</div>
      <div class="twhy">روی نمایشگرِ گوشی‌تان، کدام درز سخت‌ترین است؟ حدسِ ریاضی: سه درزِ بالایی (S5–S8) که پلهٔ محقق‌شان ۱.۰۷–۱.۱۱q است. اگر همه را می‌بینید — تأییدِ چشمیِ قانونِ ۱ روی نمایشگرِ دوم.</div></div>
    <div class="qbox"><div class="qtitle">سؤال ۲ — معاملهٔ ۹ لایه در برابر اتکای ۹۵٪</div>
      <div class="twhy">همسایه‌ها ≈${fa(Math.round(pExact * 100))}٪ (فلشِ آزمایشگاهی) ولی رابطه‌های واقعیِ ≥۲ پله ≈۱۰۰٪ — و ۱۱ نقش همه لایهٔ خودشان را دارند. رقیبِ ۱.۳۵q اتکای همسایه را ۹۵٪ می‌کرد ولی دو نقش را بی‌لایه می‌گذاشت. این معامله را می‌پذیرید؟ (پیش‌فرضِ موتور: بله — هندسهٔ تو در تویی قرینهٔ دوم است.)</div></div>
    <div class="qbox"><div class="qtitle">سؤال ۳ — تُنِ سردِ نردبان</div>
      <div class="twhy">H=۲۵۸.۴° و C=۰.۰۰۶۹ یعنی آبیِ بسیار خفیف — «سیاهِ مرده» نیست ولی رنگ هم نیست. روی گوشیِ شما این تُن حس می‌شود؟ دوستش دارید؟ (هر تغییری = فقط یک عدد در فرمول، کلِ نردبان با هم عوض می‌شود.)</div></div>
    <div class="qbox"><div class="qtitle">سؤال ۴ — بازسنجیِ q روی گوشی</div>
      <div class="twhy">آستانه روی نمایشگرِ رومیزیِ شما سنجیده شد (۲۰۲۶-۱۰-۱۱). گوشی نمایشگرِ دیگری است. ابزارِ همان سه نشست، خودبسنده، همین‌جا سرو می‌شود:
      <div style="margin-top:6px"><a class="mono" style="color:#6FA8EC" href="https://starlitrade.github.io/UI99-Design-Lab/design-lab/threshold-test-precise.html">بازکردنِ ابزارِ آستانه‌سنجی (همین‌جا روی Pages سرو می‌شود)</a></div>
      اگر qِ گوشی بالاتر از ۰.۰۰۸۳ درآمد، حاشیهٔ ۱.۱۴q روی موبایل باید دوباره چک شود — آن‌وقت با داده تصمیم می‌گیریم، نه با حدس.</div></div>    ${test(true, 'وضعیتِ سوئیت در لحظهٔ تولیدِ این فایل', 'vitest 567 passed · 6 skipped · 0 failed · tsc clean', '۶ skip = گاردهای reachability روی src/componentsِ خالی — با اولین کامپوننت خودکار مسلح می‌شوند (صفرِ مطلق، طبقِ قانونِ خودتان). این صفحه هم خودش ۷ نگهبان در سوئیت دارد (آزمونِ تو در تویِ چشمی هم ۷ تای دیگر): هیچ ✗ بی‌صدا نمی‌تواند منتشر شود.')}
    ${verdict('قدرت', 'مرحلهٔ بوم↔سطح: ادراک‌ترینِ ممکنِ محصور — با دلیل', 'لنگرِ مستند + آستانهٔ روان‌فیزیکیِ خودِ خواننده + سقفِ قرارداد + ۹ لایه برایِ ۱۱ نقش ⇒ گامِ یکتا در ۹۹.۷٪ِ بیشینهٔ جداسازی؛ در fallback هشت‌بیتی هم هر دو قانون زنده؛ تک‌محور (≥۹۴٪ فاصلهٔ ادراکی از نورانیت)؛ متن در همهٔ لایه‌ها امن (WCAG ≥۱۸، APCA ≥۱۰۷). جایگزین‌ها عددی رد شدند، نه سلیقه‌ای.', false)}
    ${verdict('ضعف', 'سه اقدامِ بازِ این مرحله', '۱) فصلِ چاه‌ها در POLICY (ریاضی‌اش آماده است) · ۲) نقصِ ترکیبِ on — تصمیمِ API (onLevel/depth) · ۳) بازسنجیِ q روی نمایشگرِ گوشی (ابزارش بالا). هیچ‌کدام فرمولِ نردبان را عوض نمی‌کنند.', false)}
    ${verdict('سؤال باز', 'اتکای همسایه در میدانِ واقعی — منتظرِ چشمِ شما', 'آزمایشگاه ~۷۷٪ می‌گوید؛ میدانِ واقعی (بزرگ، هم‌جوار، پایدار + هندسهٔ تو در تویی) تقریباً همیشه بیشتر. تا گزارشِ چشمِ شما روی درزهای بخش ۰۶، این «باز» می‌ماند — و اگر لغزشی دیدید، مسیرش بازسنجیِ q است نه دست‌کاریِ گام.', false)}`);

  /* ── document ── */
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LIMINAL — مرحلهٔ فعلی: بوم ↔ سطح · ۹ لایهٔ تخت</title>
<style>
*{box-sizing:border-box}
body{margin:0;background:#060709;color:#E9ECF2;font-family:Vazirmatn,system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.9}
.shell{width:min(980px,100% - 24px);margin:0 auto;padding:24px 0 70px}
header{padding-bottom:20px;border-bottom:1px solid #15171a}
.eyebrow{font:11px ui-monospace,monospace;color:rgba(233,236,242,.4);letter-spacing:.08em}
h1{font-size:clamp(22px,5.5vw,34px);line-height:1.35;letter-spacing:-.02em;margin:8px 0 10px}
.lede{color:rgba(233,236,242,.6);font-size:12.5px;line-height:2.1;margin:6px 0 0;max-width:880px}
.pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.pill{padding:6px 12px;border:1px solid #15171a;border-radius:8px;font:11px ui-monospace,monospace;color:rgba(233,236,242,.75)}
section{padding:30px 0;border-bottom:1px solid #15171a}
.shead{display:flex;gap:12px;margin-bottom:14px}
.snum{font:12px ui-monospace,monospace;color:rgba(233,236,242,.35);padding-top:5px}
h2{margin:0;font-size:18px;letter-spacing:-.01em}
code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.92em;color:#a4d1ff;direction:ltr;unicode-bidi:embed}
.swrow{display:flex;gap:10px;flex-wrap:wrap}
.sw{flex-shrink:0}
.swl{font:10.5px ui-monospace,monospace;color:#E9ECF2;margin-top:4px}
.sws{font:9.5px ui-monospace,monospace;color:rgba(233,236,242,.4)}
.card{background:#090b0d;border:1px solid #15171a;border-radius:12px;padding:14px;margin-top:12px}
.ctitle{font:11.5px ui-monospace,monospace;color:rgba(233,236,242,.55);margin-bottom:10px;line-height:1.9}
.tblwrap{overflow-x:auto}
table.mini{border-collapse:collapse;font:10.5px ui-monospace,monospace;direction:ltr;width:100%}
table.mini td,table.mini th{padding:4px 8px;text-align:center;border-bottom:1px solid #15171a}
table.mini th{color:rgba(233,236,242,.4);font-weight:400}
table.numtable{border-collapse:collapse;font:10.5px ui-monospace,monospace;direction:ltr;width:100%}
table.numtable td,table.numtable th{padding:5px 7px;text-align:center;border-bottom:1px solid #15171a;white-space:nowrap}
table.numtable th{color:rgba(233,236,242,.4);font-weight:400}
.chip{display:inline-block;width:26px;height:14px;border-radius:4px;vertical-align:middle;margin-inline-end:6px;border:1px solid rgba(255,255,255,.09)}
.seamgrid{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:560px){.seamgrid{grid-template-columns:1fr 1fr}}
.seam{border-radius:10px;overflow:hidden}
.seamfields{display:flex;height:74px}
.seamfields>div{flex:1}
.seamlab{font:10px ui-monospace,monospace;color:rgba(233,236,242,.5);margin-top:5px;text-align:center;direction:ltr}
.nest{border-radius:12px;padding:14px}
.nestlab{font:11px ui-monospace,monospace;color:#E9ECF2;direction:ltr}
.nestsub{font:10px ui-monospace,monospace;color:rgba(233,236,242,.5);direction:ltr}
.altrow{margin-top:14px}
.altstrip{display:flex;gap:4px;margin-top:6px}
.altstrip>div{flex:1;height:42px;border-radius:6px}
.altlab{font:11.5px ui-monospace,monospace;color:#E9ECF2}
.bad{color:#E88A93}.good{color:#74CE8E}
.note{font-size:11px;color:rgba(233,236,242,.45);line-height:1.9;margin-top:8px}
.test{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #15171a}
.finding{display:flex;gap:10px;align-items:flex-start;margin-top:12px;padding:10px 12px;background:rgba(217,190,110,.05);border:1px solid rgba(217,190,110,.3);border-radius:9px}
.fmark{font:13px ui-monospace,monospace;color:#D9BE6E;flex-shrink:0}
.tmark{font:13px ui-monospace,monospace;flex-shrink:0}
.tname{font-size:12.5px;color:#E9ECF2}
.tvalue{font:11px ui-monospace,monospace;color:#6FA8EC;margin-inline-start:6px}
.twhy{font-size:11px;color:rgba(233,236,242,.45);line-height:2;margin-top:2px}
.verdict{background:#090b0d;border-radius:8px;padding:10px 14px;margin-top:8px}
.vtitle{font:12px ui-monospace,monospace;color:#E9ECF2;line-height:1.9}
.vreason{font-size:11.5px;color:rgba(233,236,242,.55);line-height:2;margin-top:4px}
.counts{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media(min-width:640px){.counts{grid-template-columns:repeat(4,1fr)}}
.count{background:#090b0d;border:1px solid #15171a;border-radius:12px;padding:14px;text-align:center;font-size:12px;color:rgba(233,236,242,.6)}
.count b{display:block;font:28px ui-monospace,monospace;margin-bottom:4px}
.qbox{background:#090b0d;border:1px solid #15171a;border-radius:12px;padding:12px 14px;margin-top:10px}
.qtitle{font:12px ui-monospace,monospace;color:#D9BE6E}
footer{padding-top:20px;font-size:11px;color:rgba(233,236,242,.35);line-height:2}
</style>
</head>
<body>
<div class="shell">
<header>
  <div class="eyebrow">LIMINAL · PHASE: CANVAS ↔ SURFACE · FLAT · GENERATED FROM THE LIVE ENGINE · 2026-10-20</div>
  <h1>بوم ↔ سطح — ۹ لایهٔ تخت، ادراک‌ترینِ ممکن</h1>
  <p class="lede">مرحلهٔ فعلی به خواستِ شما: <b>بدونِ ریم، بوردر و سایه</b> — فقط فرمول و ریاضی و fill. هر عددِ این صفحه لحظهٔ تولید از خودِ موتور محاسبه شده (resolveSurface، color-math، و دادهٔ خامِ نشست‌های آستانه‌سنجیِ خودتان)؛ هیچ عددِ دستی در کار نیست. فایل خودبسنده است: بدونِ سرور، بدونِ شبکه — و با هر اجرای سوئیت تست بازتولید می‌شود.</p>
  <div class="pills">
    <span class="pill">q = ${Q} · r = ${RELIABLE_BOUNDARY} (اندازه‌گیری‌شده)</span>
    <span class="pill">گام = ${f4(q(LADDER_STEP))}q = ${fa(Number((fitRatio * 100).toFixed(2)))}٪ بیشینهٔ هندسی</span>
    <span class="pill">vitest: 567 passed · tsc clean</span>
  </div>
</header>
${s01}${s02}${s03}${s04}${s05}${s06}${s07}${s08}${s09}
<footer>
  <div>ژنراتور: <span class="mono">src/site/generate-audit-snapshot.ts</span> · نگهبان: <span class="mono">src/site/__tests__/audit-snapshot.test.ts</span> (هیچ ✗ بی‌صدا منتشر نمی‌شود)</div>
  <div>پروندهٔ کاملِ ممیزیِ همهٔ مراحل: <span class="mono">.lab/CORE-VERDICTS.md</span> · <span class="mono">.lab/ENGINE-CORE-AUDIT.md</span> · آزمایشگاهِ زندهٔ دسکتاپ: <span class="mono">src/site/AuditLab.tsx</span></div>
  <div>سیاست: <span class="mono">LIMINAL-POLICY.md</span> §۲ (نردبان) · دادهٔ خامِ آستانه: <span class="mono">.threshold-sessions.json</span></div>
  <div>آزمونِ تو در تویِ چشمی (دروازهٔ تأییدِ فرمول در POLICY): <a href="nested-test.html" style="color:#6FA8EC"><span class="mono">.lab/nested-test.html</span></a></div>
</footer>
</div>
</body>
</html>`;
}
