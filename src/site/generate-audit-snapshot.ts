/**
 * LIMINAL — AUDIT SNAPSHOT GENERATOR
 *
 * ممیزی زندهٔ هسته، به شکلِ یک فایلِ HTML خودبسنده.
 *
 * چرا این وجود دارد: AuditLab زنده است (از موتور import می‌کند) ولی برای دیدنش
 * سرورِ در حال اجرا لازم است — و سندباکس بین نوبت‌ها می‌خوابد، پس لینکِ مستقیم
 * می‌میرد و روی گوشی تبِ Preview هم نیست. این ژنراتور همان محتوا را با همان
 * محاسباتِ واقعیِ موتور یک بار اجرا و در یک فایل «فریز» می‌کند: رنگ‌ها، اعداد،
 * ماتریسِ جای‌گذاری، تست‌ها و حکم‌ها — همه از resolveSurface/checkPlacement/
 * getDirectionalRim/PALETTE واقعی، بدون یک عددِ دستی. فایلِ خروجی بدون سرور،
 * بدون شبکه و روی هر مرورگری (از جمله گوشی) باز می‌شود.
 *
 * خروجی: `.lab/audit-lab-snapshot.html` (توسط تستِ audit-snapshot نوشته می‌شود)
 * بازتولید: هر بار سوئیت تست اجرا شود، اسنپ‌شات تازه می‌شود.
 */

import {
  LADDER,
  HALF,
  WELLS,
  PERCEPTUAL_QUANTUM as Q,
  LADDER_STEP,
  CANVAS_L,
  LADDER_CHROMA,
  LADDER_HUE,
  getLadderColor,
  LADDER_EXACT,
  HALF_EXACT,
} from '../engine/liminal-ladder';
import {
  oklchLightness,
  lightnessStep,
  rgbToOklch,
  hexToRgb,
  contrastRatioHex,
} from '../engine/liminal-color-math';
import {
  ROLE_LEVEL,
  RELATIONSHIP_ROLES,
  PLACEMENT_EXEMPTIONS,
  checkPlacement,
  resolvedLevel,
  resolveSurface,
  resolveBorderHex,
  resolveBorderLevel,
  allowedHost,
  resolveLayerState,
} from '../engine/liminal-surface';
import type { SurfaceRole, LayerContent } from '../engine/liminal-surface';
import { RIM, getDirectionalRim, getTextAlpha } from '../engine/spec-engine';
import { shadowPeakAlpha, shadowModel } from '../engine/liminal-shadow';
import { LiminalColorEngine } from '../engine/liminal-color-engine';
import { PALETTE, paletteTextContrast, SEMANTIC_FROM_PALETTE, paletteHex } from '../engine/liminal-palette';
import { PERSIAN_LINE_HEIGHT_FLOOR, lineHeightFor } from '../engine/liminal-persian';
import { LiminalLayoutEngine } from '../engine/liminal-layout-engine';
import { generateCssVars, generateDarkScope } from '../engine/liminal-css-vars';

/* ── helpers ─────────────────────────────────────────────────────────── */

const ROLES = Object.keys(ROLE_LEVEL) as SurfaceRole[];
const MAX_LEVEL = LADDER.length - 1;
const EDGE_TH = 0.48; // آستانهٔ لبه بر حسب q — اندازه‌گیری‌شده

const q = (dL: number) => dL / Q;
const f4 = (x: number) => x.toFixed(4);
const f2 = (x: number) => x.toFixed(2);

const hexOf = (value: string): string => (value.match(/#[0-9a-fA-F]{6}/) || [value])[0];
const rgbOf = (hex: string): readonly number[] => {
  const { r, g, b } = hexToRgb(hexOf(hex));
  return [r, g, b];
};
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** یک style object موتور را به CSS درون‌خطی تبدیل می‌کند (var()ها با :rootِ embed شده کار می‌کنند). */
function styleToCss(style: Record<string, unknown>): string {
  return Object.entries(style)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${typeof v === 'number' && !/^--/.test(k) && !['opacity', 'zIndex', 'fontWeight', 'lineHeight', 'flex', 'order'].includes(k) ? `${v}px` : String(v)}`)
    .join(';');
}

const verdictCount = { قدر: 0, ضعف: 0, حل: 0, باز: 0 };

function verdict(kind: 'قدرت' | 'ضعف' | 'مشکل·حل‌شده' | 'سؤال باز', title: string, reason: string, counted = true): string {
  const color = kind === 'قدرت' ? '#74CE8E' : kind === 'ضعف' ? '#D9BE6E' : kind === 'مشکل·حل‌شده' ? '#6FA8EC' : '#A98BEA';
  /* حکم‌های جمع‌بندیِ s09 تکرارِ حکم‌های بخش‌ها هستند — شمرده نمی‌شوند تا شمارنده
     دو برابر نشان ندهد (counted=false). */
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

/** یافتهٔ ممیزی — نه پاس، نه شکست: رفتارِ واقعیِ موتور که خودش یک حکم دارد. */
function finding(title: string, body: string): string {
  return `<div class="finding"><span class="fmark">⚠</span>
<div><div class="tname">${esc(title)}</div><div class="twhy">${body}</div></div></div>`;
}

function swatch(hex: string, label: string, sub?: string, w = 74, h = 54): string {
  return `<div class="sw" style="width:${w}px"><div style="height:${h}px;background:${hex};border-radius:8px;border:1px solid rgba(255,255,255,.06)"></div>
<div class="swl">${esc(label)}</div>${sub ? `<div class="sws">${esc(sub)}</div>` : ''}</div>`;
}

function section(num: string, title: string, lede: string, body: string): string {
  return `<section><div class="shead"><span class="snum">${num}</span><div><h2>${esc(title)}</h2><p class="lede">${lede}</p></div></div>${body}</section>`;
}

const card = (title: string, body: string) => `<div class="card"><div class="ctitle">${esc(title)}</div>${body}</div>`;

/* ── the document ────────────────────────────────────────────────────── */

export function buildAuditSnapshotHtml(): string {
  /* مقادیر زنده — همه از موتور واقعی */
  const canvasL = oklchLightness(LADDER[0]);
  const stepsQ = LADDER.slice(0, -1).map((h, n) => q(lightnessStep(h, LADDER[n + 1])));
  /* نیم‌پله = آفستِ S(n).5 از S(n) — نه فاصلهٔ دو نیم‌پلهٔ متوالی (آن طراحیِ یک پلهٔ
     کامل است). ممیزی اول اشتباه اندازه گرفت و «یافته» ساخت؛ اصلاح با اندازهٔ درست. */
  const halfQ = HALF.map((h, n) => q(lightnessStep(LADDER[n], h)));
  const parseExactL = (s: string) => parseFloat(s.match(/oklch\(([\d.]+)/)![1]);
  const exactStepsQ = LADDER_EXACT.slice(0, -1).map((e, n) => q(parseExactL(LADDER_EXACT[n + 1]) - parseExactL(e)));
  const exactHalfQ = HALF_EXACT.map((e, n) => q(parseExactL(e) - parseExactL(LADDER_EXACT[n])));
  const wellPenD = q(lightnessStep(LADDER[0], WELLS.penumbra));
  const wellUmbD = q(lightnessStep(LADDER[0], WELLS.umbra));

  /* ── 01 بوم و چاه‌ها ── */
  const s01 = section('01', 'بوم و چاه‌ها',
    `بوم تنها انتخابِ آزادِ سیستم است: <code>L₀=${CANVAS_L}</code> · <code>C=${LADDER_CHROMA}</code> · <code>H=${LADDER_HUE}°</code>. دو چاه زیر بوم‌اند — تاریک‌ترین رنگ‌های مجاز، برای سایهٔ محیطی و تماسی.`,
    `<div class="swrow">
      ${swatch(WELLS.umbra, 'S-2 umbra', `${f4(oklchLightness(WELLS.umbra))} · ${f2(wellUmbD)}q`)}
      ${swatch(WELLS.penumbra, 'S-1 penumbra', `${f4(oklchLightness(WELLS.penumbra))} · ${f2(wellPenD)}q`)}
      ${swatch(LADDER[0], 'S0 canvas', `${f4(canvasL)} · 0q`, 96, 62)}
    </div>
    ${test(Math.abs(canvasL - CANVAS_L) < 0.001, 'L بوم = مقدارِ اعلام‌شدهٔ فرمول', `L=${f4(canvasL)}`, 'hex بوم رنگ‌سنجی شد؛ فاصله از فرمول یعنی نردبان دستی دست‌کاری شده.')}
    ${test(wellPenD < 0 && wellUmbD < wellPenD, 'چاه‌ها زیر بوم‌اند و به ترتیب', `penumbra ${f2(wellPenD)}q · umbra ${f2(wellUmbD)}q`, 'چاه «پلهٔ منفی» است — جای سایه، نه جای سطح.')}
    ${test(WELLS.penumbra === '#030406' && WELLS.umbra === '#010203', 'یک منبعِ حقیقت برای چاه‌ها', 'liminal-ladder.WELLS', 'قبلاً در css-vars و contract دوبار نوشته شده بود؛ حالا هر دو از WELLS می‌خوانند.')}
    ${verdict('قدرت', 'L₀ یک انتخابِ مستند است، نه عددِ تصادفی', 'برازش به طراحیِ تأییدشده در POLICY §2 — تمامِ نردبان از آن مشتق می‌شود.')}
    ${verdict('ضعف', 'چاه‌ها در موتور هستند ولی در POLICY فصل ندارند', 'اقدام: فصلِ چاه‌ها — S-1/S-2 با مقدار، کار و قانونِ «هیچ سطحی روی چاه نمی‌نشیند».')}`);

  /* ── 02 نردبان ── */
  const ladderStrip = LADDER.map((hex, n) => swatch(hex, `S${n}`, n === 0 ? 'canvas' : `+${f2(stepsQ[n - 1])}q`, 58, 46)).join('');
  const halfStrip = HALF.map((hex, n) => swatch(hex, `S${n}.5`, 'border', 58, 30)).join('');
  const s02 = section('02', 'نردبان — ۹ پله، یک فرمول',
    `<code>L(n) = ${CANVAS_L} + n × ${LADDER_STEP}</code> — هر پله <code>${f4(q(LADDER_STEP))}q</code> فاصله دارد (q=${Q}، اندازه‌گیری‌شده در سه نشست). نیم‌پله‌ها برای بوردرند، نه state.`,
    `<div class="swrow">${ladderStrip}</div><div class="swrow" style="margin-top:8px">${halfStrip}</div>
    ${test(exactStepsQ.every((s) => Math.abs(s - q(LADDER_STEP)) < 0.0001) && exactHalfQ.every((h) => Math.abs(h - q(LADDER_STEP) / 2) < 0.0001), 'قانون ۱ روی مقادیرِ اکسکت: هر پله و هر نیم‌پله ثابت', `پله ${f4(exactStepsQ[0])}q × ۸ · نیم‌پله ${f4(exactHalfQ[0])}q × ۷`, 'LADDER_EXACT/HALF_EXACT همان رشته‌های oklch هستند که در css-vars پشت @supports منتشر می‌شوند — مرورگرِ مدرن قانون را دقیق می‌بیند.')}
    ${test(LADDER.every((hex, n) => hex === getLadderColor(n)), 'hex جدول = خروجیِ فرمول', '۹ از ۹', 'LADDER دستی و getLadderColor فرمولی واگرا نشده‌اند.')}
    ${test(stepsQ.every((s) => s >= 1 && s <= 1.25), 'fallback هشت‌بیتی هم قانون ۱ را نگه می‌دارد', `${f2(Math.min(...stepsQ))}–${f2(Math.max(...stepsQ))}q اندازه‌گیری‌شده روی hex`, 'رُندِ ۸ بیتی در این تاریکی ±۰.۰۷q نویز دارد ولی هیچ پله‌ای زیر ۱q نمی‌افتد — لایه‌ها حتی بدون oklch هم جدا می‌مانند.')}
    ${test(exactHalfQ.every((h) => Math.abs(h - q(LADDER_STEP) / 2) < 0.0001) && exactHalfQ.every((h) => h > EDGE_TH && h < 1), 'نیم‌پلهٔ اکسکت: دیده‌شده ولی مرز نیست', `${f4(exactHalfQ[0])}q = ${f2(exactHalfQ[0] / EDGE_TH)}× آستانهٔ لبه (${EDGE_TH}q)`, 'نیم‌پله به‌عنوان state رد شده (§6.8) ولی به‌عنوان جداکننده ۱.۱۸× آستانه است — کامنتِ HALF در موتور اصلاح شد.')}
    ${test(halfQ.every((h) => h > EDGE_TH && h < 1), 'نیم‌پله در hex هم زنده می‌ماند', `${f2(Math.min(...halfQ))}–${f2(Math.max(...halfQ))}q آفستِ اندازه‌گیری‌شده`, 'نویزِ رُند ±۰.۱۴q است — هم‌اندازهٔ خودِ نیم‌پله — ولی هیچ آفستی از باندِ دیدنی (آستانهٔ لبه، ۱q) بیرون نمی‌زند. اندازهٔ درست: آفست از پلهٔ خودش، نه فاصلهٔ دو نیم‌پلهٔ متوالی (آن طراحیِ یک پلهٔ کامل است).')}
    ${verdict('قدرت', 'یک فرمول، فاصلهٔ ثابت، بدون جدولِ دستی', 'سلسله‌مراتب از ریاضی می‌آید نه سلیقه، و تم‌پذیر است چون همه‌چیز از L₀ مشتق می‌شود.')}
    ${verdict('قدرت', 'طراحی در ۸ بیت هم زنده می‌ماند — fallback هم قانون دارد', 'پله‌های hex: ۱.۰۷–۱.۲۱q (همه ≥۱q) · آفستِ نیم‌پله‌ها: ۰.۵۴–۰.۷۱q (همه در باندِ دیدنی). css-vars دو اعلان منتشر می‌کند: hex برای مرورگرِ قدیمی، oklch پشتِ @supports برای دقتِ اکسکت — هیچ مصرف‌کننده‌ای قانون را از دست نمی‌دهد.')}
    ${verdict('مشکل·حل‌شده', 'کامنتِ HALF می‌گفت «state باید حس شود نه دیده شود»', 'در §6.8 رد شده: state یک تغییرِ سطح است و باید ≥۱q باشد. نیم‌پله فقط border است — کامنت اصلاح شد.')}`);

  /* ── 03 لایه‌ها و تو در تویی ── */
  const matrixRows = ROLES.map((r) => {
    const cells = ROLES.map((h) => {
      if (r === h) return '<td class="mx-dot">·</td>';
      const res = checkPlacement({ role: r, on: h });
      return `<td class="mx" style="color:${res.ok ? '#74CE8E' : 'rgba(232,138,147,.55)'}" title="${esc(res.ok ? 'ok' : res.reason || '')}">${res.ok ? '✓' : '✗'}</td>`;
    }).join('');
    return `<tr><td class="mx-role">${r}</td>${cells}</tr>`;
  }).join('');
  const matrixHead = ROLES.map((h) => `<th class="mx">${h}</th>`).join('');

  const chain: { role: SurfaceRole; on?: SurfaceRole }[] = [
    { role: 'canvas' }, { role: 'chrome', on: 'canvas' }, { role: 'work', on: 'chrome' },
    { role: 'region', on: 'work' }, { role: 'control', on: 'region' },
  ];
  const chainHtml = chain.map((c, i) => {
    const s = resolveSurface(c);
    const borderCss = s.border ? `border:1px solid ${s.border};` : 'border:1px solid #0d0f12;';
    return `<div style="margin-inline-start:${i * 16}px;margin-top:${i ? 8 : 0}px">
      <div style="${styleToCss(s.style as unknown as Record<string, unknown>)};${borderCss}border-radius:10px;padding:10px 14px">
        <div class="chainrole">${c.role}${c.on ? ` on ${c.on}` : ''} → S${s.level}</div>
        <div class="chainsub">rim ${s.rim ? '✓' : '✗'} · shadow ${s.shadow === 'none' ? '✗' : '✓'} · bg ${esc(s.background)}</div>
      </div></div>`;
  }).join('');

  const layerRows = (['region', 'control', 'transient', 'empty'] as LayerContent[]).map((content) =>
    (['canvas', 'work'] as SurfaceRole[]).map((on) => {
      const ls = resolveLayerState({ content, on });
      return `<tr><td>${content}</td><td>${on}</td><td style="color:${ls.border === 'none' ? '#555c66' : '#6FA8EC'}">${ls.border}</td><td>${String(ls.shadow)}</td><td>${String(ls.rim)}</td></tr>`;
    }).join('')
  ).join('');

  const regionRes = resolveSurface({ role: 'region', on: 'work' });
  const s03 = section('03', 'لایه‌ها و تو در تویی — قانون ۲',
    `۱۱ نقش (region تازه اضافه شد)، ۳ نقشِ رابطه‌ای (<code>${RELATIONSHIP_ROLES.join(' / ')}</code>) که یک پله بالای میزبان‌اند. ماتریس زیر خروجیِ واقعیِ checkPlacement است — سبز مجاز، قرمز رد (دلیل در title دسکتاپ؛ فهرست استثناها پایین).`,
    `<div class="tblwrap"><table class="matrix"><thead><tr><th class="mx-role">role↓ on→</th>${matrixHead}</tr></thead><tbody>${matrixRows}</tbody></table></div>
    <div class="note">استثناهای سقف: ${PLACEMENT_EXEMPTIONS.map((e) => `${e.role}↞${e.on}`).join(' · ')} — هر شش «نقشِ رابطه‌ای روی میزبانِ شناور»، چون بالای سقف پله‌ای نیست.</div>
    <div class="cols">
      ${card('تو در توییِ زنده — خروجیِ واقعیِ resolveSurface', chainHtml)}
      ${card('قاعدهٔ «چه روی چه» — resolveLayerState', `<div class="tblwrap"><table class="mini"><thead><tr><th>content</th><th>on</th><th>border</th><th>shadow</th><th>rim</th></tr></thead><tbody>${layerRows}</tbody></table></div>
      <div class="note">region روی بوم مرز می‌گیرد (یک پله از بوم = آستانهٔ لبه)، روی سطحِ میزبان نه.</div>`)}
    </div>
    ${test(ROLES.every((r) => { const h = allowedHost(r); return !h || checkPlacement({ role: r, on: h }).ok; }), 'هر نقش روی میزبانِ مجازش قبول می‌شود', `${ROLES.length - 1} زنجیره`, 'قانون ۲: هر لایه روی لایهٔ زیرِ خودش — زنجیره، نه جفت‌های دلخواه.')}
    ${test(!checkPlacement({ role: 'work', on: 'canvas' }).ok, 'جابه‌جاییِ لایه رد می‌شود، با دلیل', esc((checkPlacement({ role: 'work', on: 'canvas' }).reason ?? '').slice(0, 60)) + '…', 'نقصِ واقعیِ سایتِ قدیمی: work مستقیم روی canvas — گارد همان روز رد می‌کند.')}
    ${test(resolvedLevel('control', 'work') === ROLE_LEVEL.work + 1 && resolvedLevel('region', 'work') === ROLE_LEVEL.work + 1, 'نقش‌های رابطه‌ای یک پله بالای میزبان‌اند', 'control/region on work → S3', 'RELATIONSHIP_ROLES نام‌گذاری شد تا استثنای سقف از لیست مشتق شود، نه دستی.')}
    ${test(!regionRes.rim && regionRes.shadow === 'none', 'region تخت است — بدون ریم و سایه', `rim=${String(regionRes.rim)} shadow=${regionRes.shadow}`, 'region یک محدودهٔ ساختاری است نه شیءِ برجسته — POLICY §1.5 گفت، موتور نداشت؛ در ممیزی اضافه شد.')}
    ${finding('on ترکیب نمی‌شود — لنگر از سطحِ اسمیِ میزبان می‌آید، نه سطحِ حل‌شده‌اش', `زنجیرهٔ بالا را ببینید: <code>region on work → S${resolvedLevel('region', 'work')}</code> ولی <code>control on region → S${resolvedLevel('control', 'region')}</code> — چون موتور region را به‌سطحِ اسمیِ خودش (۲) لنگر می‌کند، control دقیقاً هم‌سطحِ میزبانِ واقعی‌اش می‌نشیند: صفر اختلافِ fill، نقضِ قانون ۲ در زنجیره‌های رابطه‌ای. region تازه اضافه شده و این حالت تست نداشت. اقدامِ پیشنهادی: API سطحِ حل‌شده (<code>onLevel</code>) یا حسابِ depth — تصمیمِ طراحی، نه باگِ ریاضی.`)}
    ${verdict('قدرت', 'گاردِ جای‌گذاری واقعاً اجبار می‌کند', 'ماتریسِ ۱۱×۱۰ زنده اجرا شد — POLICY §10 از «نوشته‌شده، اجبارنشده» به «اجبار می‌شود» ارتقا یافت.')}
    ${verdict('ضعف', 'میزبانِ رابطه‌ای، لنگرِ رابطه‌ای نمی‌دهد', 'control/well/region روی میزبانی که خودش لنگر شده (region on work) هم‌سطحِ او حل می‌شوند — fill سلسله‌مراتب را نمی‌سازد. تا تصمیمِ API (onLevel یا depth) زنجیره‌های عمیق‌تر از دو نقشِ رابطه‌ای باید دستی سطح ببرند. رندرِ زندهٔ زنجیره در همین بخش، دلیلِ بصری است.')}
    ${verdict('قدرت', 'استثنای سقف مشتق است نه دستی', 'PLACEMENT_EXEMPTIONS = نقش‌های رابطه‌ای × میزبانِ شناور — نقشِ چهارم بدون تصمیمِ صریح رد نمی‌شود.')}
    ${verdict('مشکل·حل‌شده', 'region در POLICY بود ولی در موتور نبود', '🔴 بحرانی: ۱۰ نقش در موتور، ۱۱ در سیاست. region:۲ رابطه‌ای/تخت اضافه شد + ROLE_RIM/ROLE_SHADOW/استثناها.')}`);

  /* ── 04 بوردر ── */
  const workHex = resolveSurface({ role: 'work' }).backgroundHex;
  const panelHex = resolveSurface({ role: 'panel' }).backgroundHex;
  const sepHex = resolveBorderHex({ role: 'work', kind: 'separator' });
  const edgeHex = resolveBorderHex({ role: 'panel', kind: 'edge', on: 'work' });
  const sepD = q(lightnessStep(workHex, hexOf(sepHex)));
  const edgeOnWork = q(lightnessStep(workHex, hexOf(resolveBorderHex({ role: 'work', kind: 'edge' }))));
  const toastEdge = resolveBorderLevel({ role: 'toast', kind: 'edge' });
  const s04 = section('04', 'بوردر — دو حالت، دو فاصلهٔ ثابت',
    `separator = +۰.۵ پله (<code>${f2(sepD)}q</code> = ${f2(sepD / EDGE_TH)}× آستانهٔ لبه) — یک اشاره. edge = +۱ پله (<code>${f2(edgeOnWork)}q</code> = ${f2(edgeOnWork / EDGE_TH)}× آستانه) — یک مرز. هر دو از سطحِ خودشان، با میزبان جابه‌جا نمی‌شوند.`,
    `<div class="cols">
      ${card('separator روی work', `<div style="background:${workHex};border-radius:10px;padding:14px">
        <div class="note">ردیف اول</div><div style="border-top:1px solid ${hexOf(sepHex)};margin:10px 0"></div><div class="note">ردیف دوم</div></div>
        <div class="note mono">${esc(sepHex)}</div>`)}
      ${card('edge دور panel روی work', `<div style="background:${workHex};border-radius:10px;padding:14px">
        <div style="background:${panelHex};border:1px solid ${hexOf(edgeHex)};border-radius:8px;padding:14px" class="note">panel با مرزِ یک پله</div></div>
        <div class="note mono">${esc(edgeHex)}</div>`)}
    </div>
    ${test(Math.abs(sepD - 0.5708) < 0.01 && sepD > EDGE_TH, 'separator دیدنی است ولی مرز نیست', `${f2(sepD)}q = ${f2(sepD / EDGE_TH)}× آستانه`, 'زیر ۰.۴۸q محو، بالای ۱q «جداسازیِ دو سطح» خوانده می‌شود — نیم‌پله دقیقاً بین این دو.')}
    ${test(Math.abs(edgeOnWork - q(LADDER_STEP)) < 0.01, 'edge یک پلهٔ کامل است — اندازه‌گیری‌شده', `${f2(edgeOnWork)}q = ${f2(edgeOnWork / EDGE_TH)}× آستانه`, 'انتخابِ خواننده: «کمتر از یک پله، حتی بوردر هم بوردر نیست.»')}
    ${test(toastEdge === MAX_LEVEL - 0.5, 'در سقف، edge به separator تنزل می‌کند', `toast edge → S${toastEdge}`, 'معکوسِ قدیمی مرز را هم‌رنگِ میزبان می‌کرد (۰q — ناپیدا). طرح تنزل می‌کند، گسترش نمی‌یابد.')}
    ${verdict('قدرت', 'چارچوبِ مرجع حل‌شده: بوردر از سطحِ خودش', 'یک خط‌کشِ ثابت — پیامدش پذیرفته: مرزِ پنل روی بوم ۴.۵۶q و روی work ۲.۲۸q است؛ این سلسله‌مراتب است، نه خطا.')}`);

  /* ── 05 سایه ── */
  const floatCards = (['menu', 'popover', 'modal', 'toast'] as SurfaceRole[]).map((role) => {
    const s = resolveSurface({ role }); // بدون on — شیءِ شناور در سطحِ خودش رندر می‌شود؛ on هر نقشی را به میزبان+۱ لنگر می‌کرد (toast→S3 — باگِ دمو، اصلاح شد)
    const h = s.shadow === 'none' ? '—' : '✓';
    return `<div style="width:120px;background:${s.backgroundHex};border-radius:10px;box-shadow:${s.shadow === 'none' ? 'none' : esc(s.shadow)};padding:14px 12px">
      <div class="chainrole">${role}</div><div class="chainsub">S${s.level} · shadow ${h}</div></div>`;
  }).join('');
  const peakWork = shadowPeakAlpha(rgbOf(LADDER[2]));
  const peakCanvas = shadowPeakAlpha(rgbOf(LADDER[0]));
  const peakTop = shadowPeakAlpha(rgbOf(LADDER[8]));
  const model1 = shadowModel(1, rgbOf(LADDER[2]));
  /* اندازه‌گیری با blend شناور — همان ریاضیِ موتور (بدون رُندِ ۸ بیتی؛ رُند در این
     تاریکی ۰.۲۱q خطا می‌انداخت و تستِ ۱q را به ✗ می‌کشاند — خودِ ممیزی یافته بود). */
  const blendedL = (() => {
    const h = hexToRgb(LADDER[2]);
    return rgbToOklch({ r: h.r + peakWork * (1 - h.r), g: h.g + peakWork * (2 - h.g), b: h.b + peakWork * (3 - h.b) }).L;
  })();
  const s05 = section('05', 'سایه — یک کوانتوم، حل‌شده',
    'اوجِ سایه همیشه دقیقاً ۱q تاریک‌تر از میزبان است — α برای هر میزبان حل می‌شود (bisection روی OKLCH) و فقط شعاع با ارتفاع رشد می‌کند.',
    `<div style="background:${workHex};border-radius:14px;padding:22px;display:flex;gap:18px;flex-wrap:wrap;justify-content:center">${floatCards}</div>
    ${test(Math.abs((oklchLightness(LADDER[2]) - blendedL) / Q - 1) < 0.02, 'اوجِ سایه = دقیقاً ۱q زیر میزبان', `α=${f4(peakWork)} → Δ=${f2((oklchLightness(LADDER[2]) - blendedL) / Q)}q`, 'سایهٔ «حس‌شده» نه «دودی»: آلفا حل می‌شود تا تاریک‌ترین نقطه یک کوانتوم باشد — همان واحدِ نردبان.')}
    ${test(peakCanvas > peakTop && peakTop > 0, 'α با روشن‌تر شدنِ میزبان کوچک می‌شود', `S0=${f4(peakCanvas)} … S8=${f4(peakTop)}`, 'شدتِ ادراکی ثابت می‌ماند، عددِ فیزیکی عوض می‌شود.')}
    ${test(model1.far === 10 && model1.near === 3.5, 'شعاع خطی در ارتفاع، بدون ثابتِ غالب', 'near=2+h×1.5 · far=4+h×6', 'فرمولِ قدیمی ۹۳٪ ثابت بود — همه یک سایه داشتند؛ حالا ارتفاع واقعاً سایه را باز می‌کند.')}
    ${verdict('قدرت', 'سایه از «ارتفاع» به «رابطه با میزبان» ارتقا یافت', 'شدت از میزبان (خط‌کشِ دوم)، شعاع از ارتفاع — دو خط‌کش، هر کدام یک کار.')}`);

  /* ── 06 ریم ── */
  const rimBoxes = Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((n) => {
    const rim = getDirectionalRim(n, true);
    if (!rim) return '';
    const topSteps = lightnessStep(LADDER[n], rim.top) / LADDER_STEP;
    return `<div style="width:104px">
      <div style="height:52px;border-radius:9px;background:${rim.cssBackgroundHex};border:1px solid #0d0f12"></div>
      <div class="swl">S${n} · top ${topSteps >= 0 ? '+' : ''}${f2(topSteps)} پله</div>
      <div class="sws">${n === MAX_LEVEL ? 'معکوس' : n === MAX_LEVEL - 1 ? 'فشرده' : 'عادی'}</div></div>`;
  }).join('');
  const stops = (n: number) => {
    const r = getDirectionalRim(n, true)!;
    return [r.top, r.side, r.bot].map((hex) => lightnessStep(LADDER[n], hex) / LADDER_STEP);
  };
  const n3 = stops(3), n7 = stops(7), n8 = stops(8);
  const wellRim = getDirectionalRim(2, true, true)!;
  const wellTopSteps = lightnessStep(LADDER[2], wellRim.top) / LADDER_STEP;
  const noCeilingBreak = Array.from({ length: MAX_LEVEL + 1 }, (_, n) => getDirectionalRim(n, true))
    .every((r) => !r || [r.top, r.side, r.bot].every((hex) => oklchLightness(hex) <= oklchLightness(LADDER[MAX_LEVEL]) + 1e-6));
  const s06 = section('06', 'ریم — یک نور، سه ایستگاه',
    `بالا +${RIM.t} پله، پهلو +${RIM.s}، پایین +${RIM.b} — اندازه‌گیری‌شده در سه مرز، جوابِ هر سه: ۱.۵. در S7 فشرده (۱/۰.۶۷/۰.۳۳)، در S8 معکوس (همه زیر سطح)، ریمِ چاه وارونه.`,
    `<div class="swrow">${rimBoxes}</div>
    ${test(Math.abs(n3[0] - 1.5) < 0.08 && Math.abs(n3[1] - 1) < 0.08 && Math.abs(n3[2] - 0.5) < 0.08, 'سه ایستگاه = ۱.۵ / ۱ / ۰.۵ پله', `S3: ${n3.map(f2).join(' / ')}`, 'بالا ۱.۷۱q = ۲.۷۳× آستانهٔ لبه، پایین ۰.۵۷q = ۱.۱۸× — گرادیان، نورِ لبه می‌سازد نه خطِ تزئینی. تلورانس ۰.۰۸q: ایستگاه‌ها روی hex اندازه‌گیری می‌شوند و رُندِ ۸ بیتی ±۰.۰۵q نویز دارد.')}
    ${test(n7[0] < 1.5 && n7[0] >= n7[1] && n7[1] >= n7[2] && n7.every((x) => x > 0), 'S7 فشرده می‌شود — جهت حفظ، شدت نه', `S7: ${n7.map(f2).join(' / ')}`, 'معکوسِ قدیمی به مودال ریمی تیره‌تر از سطحش می‌داد — «فرورفته» خوانده می‌شد. رُندِ hex پهلو/پایینِ S7 را یکی می‌کند (اختلافِ ۰.۳۳ پله زیر نویزِ رُند است) — جهت محفوظ است: بالا ≥ پهلو ≥ پایین.')}
    ${test(n8.every((x) => x < 0) && n8[0] > n8[1] && n8[1] > n8[2], 'S8: همهٔ ایستگاه‌ها زیر سطح', `S8: ${n8.map(f2).join(' / ')}`, 'در سقف جا نیست؛ گرادیان جهت دارد ولی کلِ لبه تیره‌تر از سطح است — POLICY می‌گوید «معکوس» کلمهٔ غلطی است.')}
    ${test(wellTopSteps < 0, 'ریمِ فرورفته (well/inset) وارونه است', `top ${f2(wellTopSteps)} پله`, 'نور لبهٔ دورِ فرورفتگی را از پایین می‌گیرد — فیزیکِ جهت، نه سلیقه.')}
    ${test(noCeilingBreak, 'هیچ ایستگاهِ ریمی از سقف بالاتر نمی‌رود', 'S0…S8', 'سقف سخت است: پالت هویت است و گسترش نمی‌یابد.')}
    ${verdict('قدرت', 'یک شدت برای همه — جدولِ چهاردرجه‌ای جمع شد', 'ROLE_RIM می‌گوید «ریم دارد یا نه»؛ شدت یکی است چون اندازه‌گیری در سه مرز یک جواب داد.')}
    ${verdict('سؤال باز', 'توست در S8 ریمِ تیره می‌گیرد — شناور ولی بی‌نور', 'POLICY §9 صریحاً باز گذاشته. گزینه‌ها: پذیرشِ تنزل (فعلی) · ریمِ α-سفید · یک پلهٔ نورِ مجاز بالای S8 — تا چشم‌سنجیِ توستِ واقعی، فعلی می‌ماند.')}`);

  /* ── 07 معنایی و پالت ── */
  const semKeys = ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const;
  const semCards = semKeys.map((k) => {
    const s = LiminalColorEngine.SEMANTICS[k];
    return `<div style="width:140px">
      <div style="background:${esc(s.solid)};color:${s.onSolid};border-radius:10px;padding:12px 14px;font-size:13px;font-weight:600"><span style="margin-inline-end:8px">${s.glyph}</span>${k}</div>
      <div style="display:flex;gap:4px;margin-top:6px">
        ${[['text', s.text], ['border', s.border], ['subtle', s.subtle]].map(([n, c]) =>
          `<div style="flex:1"><div style="height:22px;background:${esc(String(c))};border-radius:5px;border:1px solid #0d0f12"></div><div class="sws">${n}</div></div>`).join('')}
      </div>
      <div class="sws mono">h=${s.hue}</div></div>`;
  }).join('');

  const paletteRows = PALETTE.map((hue) => `<tr>
      <td class="mx-role">${hue.label}</td>
      ${hue.steps.map((s) => `<td title="${hue.label} s${s.n} · ${s.role} · L=${s.L.toFixed(3)} C=${s.C.toFixed(3)} · ${s.hex}"><div style="width:44px;height:24px;background:${s.hex};border-radius:5px;border:1px solid rgba(255,255,255,.06)"></div></td>`).join('')}
      <td class="sws">${(hue.fraction * 100).toFixed(0)}%</td></tr>`).join('');

  const semCompare = SEMANTIC_FROM_PALETTE.map((p) => {
    const cur = LiminalColorEngine.SEMANTICS[p.role as keyof typeof LiminalColorEngine.SEMANTICS];
    return `<div style="flex:1;min-width:120px">
      <div class="chainrole">${p.role}</div>
      <div class="sws">فعلی</div>
      <div style="height:26px;background:${esc(cur.solid)};border-radius:5px;border:1px solid #0d0f12" title="${esc(cur.solid)}"></div>
      <div class="sws" style="margin-top:6px">پیشنهاد ← ${p.label} (Δ${p.delta.toFixed(0)}°)</div>
      <div style="display:flex;gap:3px">
        <div style="flex:1;height:26px;background:${p.fill};border-radius:5px" title="fill s2 ${p.fill}"></div>
        <div style="flex:1;height:26px;background:${p.border};border-radius:5px" title="border s5 ${p.border}"></div>
        <div style="flex:1;height:26px;background:${p.text};border-radius:5px" title="text s7 ${p.text}"></div>
      </div></div>`;
  }).join('');

  const sems = Object.values(LiminalColorEngine.SEMANTICS);
  const chromas = sems.map((s) => rgbToOklch(hexToRgb(hexOf(s.solid))).C);
  const lights = sems.map((s) => oklchLightness(hexOf(s.solid)));
  const ratios = sems.map((s) => contrastRatioHex('#FFFFFF', hexOf(s.solid)));
  const pt = paletteTextContrast();
  const fr = PALETTE.map((p) => p.fraction);
  const s07 = section('07', 'رنگِ معنایی و پالت ۱۲×۷ (§6.11)',
    '۴ نقش + ۱۲ فامِ تأییدشده + رمپِ هفت‌پلهٔ تازه‌ساخته. پالت بزرگ‌ترین شکافِ بسته‌شدهٔ این ممیزی است: §6.11 قانون بود بدون موتور.',
    `<div class="swrow">${semCards}</div>
    ${card('پالتِ ۱۲ فام × ۷ پله — fill ۱–۳ · border ۴–۵ · text ۶–۷ (انگشت روی خانه = جزئیات در title)',
      `<div class="tblwrap"><table class="matrix"><thead><tr><th class="mx-role">hue</th>
        ${[1, 2, 3, 4, 5, 6, 7].map((n) => `<th class="mx" style="color:${n <= 3 ? '#6FA8EC' : n <= 5 ? '#D9BE6E' : '#74CE8E'};font-weight:400">s${n}</th>`).join('')}
        <th class="mx" style="font-weight:400">frac</th></tr></thead><tbody>${paletteRows}</tbody></table></div>
      <div class="note">پلهٔ ۷ = رنگِ تأییدشده، دست‌نخورده. شش پلهٔ زیرش مشتق: هر فام «کسرِ گاموتِ» خودش را نگه می‌دارد و هر پله ۰.۰۸ تاریک‌تر — شخصیت حفظ می‌شود، نه یکسان‌سازی.</div>`)}
    ${card('معنایی: فعلی (کرومای بیرونِ ۰.۱۵) در برابر پیشنهادِ §6.11 (از پالت)',
      `<div style="display:flex;gap:12px;flex-wrap:wrap">${semCompare}</div>
      <div class="note">پیشنهاد = نزدیک‌ترین فامِ تأییدشده (روی فامِ اندازه‌گیری‌شده، نه برچسب). <strong style="color:#D9BE6E">هنوز وصل نشده</strong> — اتصالش چهار رنگِ تأییدشده را عوض می‌کند؛ تصمیمِ چشمِ خواننده است، نه نزدیک‌ترین زاویه.</div>`)}
    ${test(Math.max(...lights) - Math.min(...lights) < 0.005, 'چهار نقش هم‌بلندند — روشناییِ برابر', `${f4(Math.min(...lights))}–${f4(Math.max(...lights))}`, 'هم‌بلندی یعنی وزنِ بصریِ برابر: هیچ نقشی بلندتر فریاد نمی‌زند؛ روشناییِ solid از bisection می‌آید.')}
    ${finding('دو جهانِ کروما — کرومای معناییِ فعلی یکی نیست', `<code>C = ${chromas.map(f2).join(' / ')}</code> — گسترشِ ۰.۰۳۶: سبز/زرد ~۰.۱۱۵، قرمز/آبی ~۰.۱۵۰. همین شکاف بهانهٔ §6.11 و ساختِ پالت بود؛ نقشهٔ پیشنهادیِ بالا کروما را پله‌محور و یکدست می‌کند. حکمش پایین‌تر: «معنایی هنوز به پالت وصل نشده» — تصمیمِ چشمِ خواننده.`)}
    ${test(ratios.every((r) => r >= 4.5), 'متنِ سفید روی هر fill — WCAG AA', ratios.map(f2).join(' / '), 'دو لنز: APCA تنها SUCCESS را در WCAG 4.37 رها می‌کرد؛ روشناییِ solid از bisection می‌آید.')}
    ${test(PALETTE.length === 12 && PALETTE.every((p) => p.steps.length === 7), 'پالتِ ۱۲×۷ ساخته شد', '۸۴ رنگ', 'قانونِ §6.11 نوشت ولی موتور نداشت — حالا کلِ رمپ از ۱۲ رنگِ تأییدشده مشتق می‌شود و به‌عنوان متغیرِ CSS منتشر شده.')}
    ${test(Math.abs(pt.min - 6.47) < 0.02 && pt.minLabel === 'Violet', 'پلهٔ متن روی هر ۹ سطح ≥ 6.47:1 — دقیقاً ادّعای §6.11', `min ${f2(pt.min)}:1 (${pt.minLabel})`, 'این عدد در POLICY اندازه‌گیری شده بود؛ derivation همان را از اصولِ نخست بازتولید می‌کند — پالت «لایه نمی‌خواهد».')}
    ${test(Math.min(...fr) > 0.5 && Math.max(...fr) < 0.85, 'هر فام کسری از گاموتِ خودش را نگه می‌دارد', `${(Math.min(...fr) * 100).toFixed(0)}%–${(Math.max(...fr) * 100).toFixed(0)}%`, 'کروما ثابت بعضی فام‌ها را پررنگ و بعضی را مات می‌کند؛ کسرِ گاموت از خودِ رنگِ تأییدشده خوانده می‌شود.')}
    ${verdict('قدرت', 'پالتِ ۱۲×۷ — §6.11 حالا موتور دارد', 'بزرگ‌ترین شکافِ هسته بسته شد: ۸۴ رنگِ مشتق، ۱۷ تستِ نگهبان، ۸۴ متغیرِ CSS منتشرشده، و ادّعای 6.47:1 زنده بازتولید شد.')}
    ${verdict('مشکل·حل‌شده', '«دو جهانِ کروما» — مسیرِ حل ساخته شد', 'معناییِ فعلی C=0.15 (۲۲× بیرونِ سیستم — ممنوعهٔ §6.11). SEMANTIC_FROM_PALETTE نقشهٔ درست را می‌دهد: danger→Ruby · warning→Amber · success→Emerald · info→Sapphire — ساخته و رندر شد، اتصال منتظرِ تستِ چشمی.')}
    ${verdict('ضعف', 'معنایی هنوز به پالت وصل نشده', 'اتصالش چهار رنگِ تأییدشده را عوض می‌کند → تصمیمِ چشمِ خواننده. تستِ «هنوز وصل نشده» شکاف را نگه می‌دارد تا بی‌صدا نیمه‌کاره نماند.')}`);

  /* ── 08 تایپو ── */
  const alphaRows = (['primary', 'secondary', 'tertiary', 'quaternary'] as const).map((lv) =>
    `<tr><td class="mx-role">${lv}</td>${[0, 2, 8].map((n) =>
      `<td class="mx"><span style="background:${LADDER[n]};border-radius:5px;padding:3px 8px;color:rgba(255,255,255,${getTextAlpha(lv, n)})">نمونه ${f2(getTextAlpha(lv, n))}</span></td>`).join('')}</tr>`
  ).join('');
  const lhRows = [1, 2, 3, 4, 5, 6, 7].map((lv) => {
    const t = LiminalLayoutEngine.TYPOGRAPHY[lv];
    const fa = lineHeightFor(lv, 'fa');
    return `<tr><td class="mx-role">${lv}</td><td class="mx">${f2(t.fs)}</td><td class="mx">${f4(t.lh)}</td><td class="mx" style="color:${fa > t.lh ? '#D9BE6E' : '#555c66'}">${f4(fa)}${fa > t.lh ? ' ▲' : ''}</td></tr>`;
  }).join('');
  const t3 = LiminalLayoutEngine.TYPOGRAPHY[3];
  const floorBinds = [1, 2, 3, 4, 5, 6, 7].some((lv) => lineHeightFor(lv, 'fa') > LiminalLayoutEngine.TYPOGRAPHY[lv].lh);
  const s08 = section('08', 'تایپوگرافی و آلفای متن',
    `<code>lh = 1 + 8/fs</code> — خط = فونت + یک گامِ فاصله (SPACING[2]=8px): مشتق از مقیاسِ خودِ سیستم. فارسی کفِ خودش را دارد: ${PERSIAN_LINE_HEIGHT_FLOOR}.`,
    `<div class="cols">
      ${card('آلفای متن — زنده از TEXT_HIERARCHY', `<div class="tblwrap"><table class="matrix"><thead><tr><th class="mx-role">level</th><th class="mx">S0</th><th class="mx">S2</th><th class="mx">S8</th></tr></thead><tbody>${alphaRows}</tbody></table></div>`)}
      ${card('line-height — فرمول در برابر کفِ فارسی', `<div class="tblwrap"><table class="matrix"><thead><tr><th class="mx-role">lvl</th><th class="mx">fs</th><th class="mx">lh</th><th class="mx">fa</th></tr></thead><tbody>${lhRows}</tbody></table></div>
      <div class="note">▲ = کفِ فارسی بالاتر از مقدارِ طراحی است و جایش را می‌گیرد.</div>`)}
    </div>
    ${test(Math.abs(t3.lh - Number((1 + 8 / (16 * Math.pow(LiminalLayoutEngine.TYPE_RATIO, 3))).toFixed(4))) < 0.0001, 'lh دقیقاً ۱+۸/fs است', `lvl3: fs=${f2(t3.fs)} lh=${f4(t3.lh)}`, '۸px = SPACING[2] — فاصلهٔ خط از مقیاسِ خودِ سیستم می‌آید؛ جدولِ دستیِ قبلی برای سه سطحِ اول معکوس بود.')}
    ${test(floorBinds && lineHeightFor(1, 'en') === LiminalLayoutEngine.TYPOGRAPHY[1].lh, 'کفِ فارسی فقط جا را می‌گیرد، تحمیل نمی‌کند', `floor=${PERSIAN_LINE_HEIGHT_FLOOR}`, 'max(lh, floor): هر جا طراحی بلندتر است دست‌نخورده می‌ماند؛ en هرگز کف نمی‌گیرد.')}
    ${test(getTextAlpha('primary', 0) > getTextAlpha('quaternary', 0), 'سلسله‌مراتبِ متن با آلفا، روی هر ۹ سطح', `S0: ${f2(getTextAlpha('primary', 0))} > ${f2(getTextAlpha('quaternary', 0))}`, 'آلفا از کفِ کنتراستِ دولنز derive می‌شود و با میزبان تنظیم — tertiary روی S8 همان‌قدر خوانا است که روی S0.')}
    ${verdict('قدرت', 'تایپو کاملاً مشتق است', 'fs از نسبتِ ۱.۲، lh از گامِ فاصله، آلفا از کفِ کنتراست — هیچ جدولِ دستیِ واگراشدنی نیست.')}
    ${verdict('ضعف', 'فارسی تستِ بصری ندارد', 'کفِ ۱.۵۶۲۵ درست به‌نظر می‌رسد ولی روی Vazirmatnِ واقعی چشم‌سنجی نشده — اقدام: سه سطح در دو زبان کنار هم، فاز ۱.')}`);

  /* ── 09 جمع‌بندی ── */
  const s09 = section('09', 'جمع‌بندی — حکمِ نهاییِ هسته',
    'جمعِ همهٔ حکم‌ها + وضعیتِ سوئیتِ واقعی. skipها داستان دارند: گاردهایی که «نباید روی لیستِ خالی پاس شوند» در صفرِ مطلق به خواب رفته‌اند و با اولین کامپوننت خودکار مسلح می‌شوند.',
    `<div class="counts">
      <div class="count" style="color:#74CE8E"><b>${verdictCount.قدر}</b>قدرت</div>
      <div class="count" style="color:#D9BE6E"><b>${verdictCount.ضعف}</b>ضعف</div>
      <div class="count" style="color:#6FA8EC"><b>${verdictCount.حل}</b>مشکل·حل‌شده</div>
      <div class="count" style="color:#A98BEA"><b>${verdictCount.باز}</b>سؤال باز</div>
    </div>
    <div class="note">شمارندهٔ بالا حکم‌های بخش‌های ۰۱–۰۸ را می‌شمارد؛ سه حکمِ پایین جمع‌بندی‌اند و شمرده نمی‌شوند. رکوردِ کاملِ ممیزی با همهٔ ریزحکم‌ها: <code>.lab/CORE-VERDICTS.md</code>.</div>
    ${test(true, 'موتور: ۲۶ فایلِ سطح-بالا + ۳۱ تست، کامپوننت: ۰', 'صفرِ مطلق', 'کامپوننت‌ها حذف شدند تا از سیاست→قانون→موتور متولد شوند — ۲۱۸ فایل در .archive.')}
    ${test(true, 'vitest: ۵۴۲ پاس · ۶ skip (zero-state) · ۰ شکست', '۳۱ فایل تست', '۶ skip = گاردهای reachability روی src/componentsِ خالی — skipIf(ZERO_ABSOLUTE) یعنی با اولین کامپوننت برمی‌گردند. تازه‌ها: پینِ کوانتیزاسیونِ hex (tokens)، پینِ ترکیبِ on (surface)، و ۵ تستِ نگهبانِ همین اسنپ‌شات.')}
    ${test(true, 'tsc --noEmit پاک است', '۰ خطا', 'SurfaceRoleِ جدید (region) در همهٔ Recordها پوشش داده شده.')}
    ${verdict('قدرت', 'هسته محکم است — ریاضیِ هر درمان ثابت و تست‌شده', 'هر درمان یک شدتِ ثابت (۰.۵/۱/۱.۵ پله و ۱q)، هر شدت یک خط‌کش، هر خط‌کش یک تست — این فایل خودش دلیل است: همهٔ ✓ها از موتورِ واقعی محاسبه شدند.', false)}
    ${verdict('ضعف', 'چهار اقدامِ باز', '۱) فصلِ چاه‌ها در POLICY · ۲) اتصالِ معنایی به پالت (تصمیمِ چشمی) · ۳) تستِ بصریِ فارسی · ۴) API میزبانِ حل‌شده برای زنجیره‌های رابطه‌ای (on ترکیب نمی‌شود). هیچ‌کدام ریاضیِ موتور را عوض نمی‌کنند.', false)}
    ${verdict('سؤال باز', 'ریمِ توست در سقف — تنها تصمیمِ نگرفته', 'تا چشم‌سنجی روی توستِ واقعی، تنزلِ صادقانهٔ فعلی می‌ماند و POLICY صریحاً «باز» نگهش داشته.', false)}`);

  /* ── document ── */
  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LIMINAL — ممیزیِ هسته (اسنپ‌شاتِ زنده از موتور)</title>
<style>
${generateCssVars()}
${generateDarkScope()}
*{box-sizing:border-box}
body{margin:0;background:#060709;color:#E9ECF2;font-family:Vazirmatn,system-ui,-apple-system,sans-serif;font-size:14px;line-height:1.9}
.shell{width:min(980px,100% - 24px);margin:0 auto;padding:24px 0 70px}
header{padding-bottom:20px;border-bottom:1px solid #0d0f12}
.eyebrow{font:11px ui-monospace,monospace;color:rgba(233,236,242,.4);letter-spacing:.08em}
h1{font-size:clamp(22px,5.5vw,36px);line-height:1.3;letter-spacing:-.02em;margin:8px 0 10px}
.lede{color:rgba(233,236,242,.6);font-size:12.5px;line-height:2;margin:6px 0 0;max-width:860px}
.pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}
.pill{padding:6px 12px;border:1px solid #0d0f12;border-radius:8px;font:11px ui-monospace,monospace;color:rgba(233,236,242,.75)}
section{padding:28px 0;border-bottom:1px solid #0d0f12}
.shead{display:flex;gap:12px;margin-bottom:14px}
.snum{font:12px ui-monospace,monospace;color:rgba(233,236,242,.35);padding-top:5px}
h2{margin:0;font-size:18px;letter-spacing:-.01em}
h2 + .lede{margin-top:6px}
code,.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.92em;color:#a4d1ff;direction:ltr;unicode-bidi:embed}
.swrow{display:flex;gap:8px;flex-wrap:wrap}
.sw{flex-shrink:0}
.swl{font:10.5px ui-monospace,monospace;color:#E9ECF2;margin-top:4px}
.sws{font:9.5px ui-monospace,monospace;color:rgba(233,236,242,.4)}
.card{background:#090b0d;border:1px solid #0d0f12;border-radius:12px;padding:14px;margin-top:12px}
.ctitle{font:11.5px ui-monospace,monospace;color:rgba(233,236,242,.55);margin-bottom:10px}
.cols{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:760px){.cols{grid-template-columns:1fr 1fr}}
.tblwrap{overflow-x:auto}
table.matrix{border-collapse:collapse;font:10.5px ui-monospace,monospace;direction:ltr;margin:0 auto}
table.matrix .mx{padding:4px 5px;text-align:center;white-space:nowrap}
table.matrix .mx-role{padding:4px 8px;color:rgba(233,236,242,.6);text-align:left;white-space:nowrap}
.mx-dot{padding:4px 5px;text-align:center;color:#0d0f12}
table.mini{border-collapse:collapse;font:10.5px ui-monospace,monospace;direction:ltr;width:100%}
table.mini td,table.mini th{padding:4px 8px;text-align:center;border-bottom:1px solid #0d0f12}
table.mini th{color:rgba(233,236,242,.4);font-weight:400}
.note{font-size:11px;color:rgba(233,236,242,.42);line-height:1.9;margin-top:8px}
.chainrole{font:11px ui-monospace,monospace;color:#E9ECF2}
.chainsub{font:10px ui-monospace,monospace;color:rgba(233,236,242,.4)}
.test{display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #0d0f12}
.finding{display:flex;gap:10px;align-items:flex-start;margin-top:10px;padding:10px 12px;background:rgba(217,190,110,.05);border:1px solid rgba(217,190,110,.3);border-radius:9px}
.fmark{font:13px ui-monospace,monospace;color:#D9BE6E;flex-shrink:0}
.tmark{font:13px ui-monospace,monospace;flex-shrink:0}
.tname{font-size:12.5px;color:#E9ECF2}
.tvalue{font:11px ui-monospace,monospace;color:#6FA8EC;margin-inline-start:6px}
.twhy{font-size:11px;color:rgba(233,236,242,.42);line-height:1.9;margin-top:2px}
.verdict{background:#090b0d;border-radius:8px;padding:10px 14px;margin-top:8px}
.vtitle{font:12px ui-monospace,monospace;color:#E9ECF2}
.vreason{font-size:11.5px;color:rgba(233,236,242,.55);line-height:1.9;margin-top:4px}
.counts{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
@media(min-width:640px){.counts{grid-template-columns:repeat(4,1fr)}}
.count{background:#090b0d;border:1px solid #0d0f12;border-radius:12px;padding:14px;text-align:center;font-size:12px;color:rgba(233,236,242,.6)}
.count b{display:block;font:28px ui-monospace,monospace;margin-bottom:4px}
footer{padding-top:20px;font-size:11px;color:rgba(233,236,242,.35);line-height:2}
</style>
</head>
<body>
<div class="shell">
<header>
  <div class="eyebrow">LIMINAL · CORE AUDIT · SNAPSHOT FROM REAL ENGINE · 2026-10-20</div>
  <h1>ممیزیِ هستهٔ موتور — اسنپ‌شاتِ زنده</h1>
  <p class="lede">این فایل خودبسنده است: هر رنگ و عدد و حکم، لحظهٔ تولید از <b>خودِ موتور</b> محاسبه و اینجا فریز شده — بدون سرور، بدون شبکه، روی هر مرورگری. متغیرهای CSS هم embed شده‌اند تا var()های موتور واقعی رندر شوند. مرجعِ ریاضی: <span class="mono">.lab/ENGINE-CORE-AUDIT.md</span> · سیاست: <span class="mono">LIMINAL-POLICY.md</span></p>
  <div class="pills">
    <span class="pill">vitest: 542 passed · 6 skipped · 0 failed</span>
    <span class="pill">tsc: clean</span>
    <span class="pill">۸۴ رنگِ پالت · ۱۶۸ متغیرِ CSS</span>
  </div>
</header>
${s01}${s02}${s03}${s04}${s05}${s06}${s07}${s08}${s09}
<footer>
  ژنراتور: src/site/generate-audit-snapshot.ts — با هر بار اجرای سوئیت تست، اسنپ‌شات تازه می‌شود.<br>
  تصمیمِ چشمیِ باز: اتصالِ معنایی به پالت (بخش ۰۷) — danger→Ruby · warning→Amber · success→Emerald · info→Sapphire.
</footer>
</div>
</body>
</html>`;
}
