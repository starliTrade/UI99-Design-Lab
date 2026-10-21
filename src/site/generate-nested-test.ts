/**
 * LIMINAL — NESTED VISUAL TEST GENERATOR · STAGE-ZERO SIGN-OFF GATE
 *
 * خواستِ خواننده (۲۰۲۶-۱۰-۲۱): «یه تستِ تو در توییِ لایه‌ها بده ببینم چشمی که
 * فاصله‌ها نسبت به هم یکی و به یه مقداره — اگر تأیید بود، فرمولِ دقیق را در
 * فایلِ سیاست می‌نویسیم + توضیح + رنگ‌های تولیدشده بر اساسِ فرمولِ ریاضی.»
 *
 * این صفحه دروازهٔ تأییدِ چشمی است برایِ نوشتنِ فرمول در POLICY. چهار آزمون:
 *   ۰۱ چیدمانِ تو در تویِ ۹ لایهٔ واقعی (فقط fill — طبقِ انضباطِ مرحلهٔ صفر)
 *   ۰۲ خط‌کشِ درزها: کالیبراسیون (۰.۶q نامرئی / ۱.۷q واضح) + تک‌تکِ ۸ درز
 *   ۰۳ سه رقیبِ لغزان (گامِ فزاینده/کاهنده/هندسی) با همان دو سرِ pinned —
 *      تا چشم «یکنواخت» را در برابرِ «لغزان» کالیبره کند
 *   ۰۴ آزمونِ کورِ چهارتایی (ترتیبِ seeded از دادهٔ موتور — قطعی بینِ
 *      بازتولیدها) با کلید در انتها
 *
 * همهٔ اعداد زنده از موتور (LADDER، LADDER_STEP، CANVAS_L، q، منحنیِ لجستیکِ
 * روان‌فیزیک). رقیب‌ها ابزارِ دیداری‌اند نه قرارداد — از قانونِ اکسکتِ خودشان
 * با oklchToHex رندر می‌شوند.
 *
 * خروجی: `.lab/nested-test.html` (توسط تستِ nested-test نوشته می‌شود).
 */

import {
  LADDER,
  LADDER_STEP,
  CANVAS_L,
  LADDER_CHROMA,
  LADDER_HUE,
  PERCEPTUAL_QUANTUM as Q,
  RELIABLE_BOUNDARY,
} from '../engine/liminal-ladder';
import { lightnessStep, oklchToHex } from '../engine/liminal-color-math';

/* ── helpers ─────────────────────────────────────────────────────────── */

const q = (dL: number) => dL / Q;
const f4 = (x: number) => x.toFixed(4);
const f2 = (x: number) => x.toFixed(2);
const f1 = (x: number) => x.toFixed(1);
const fa = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function section(num: string, title: string, lede: string, body: string): string {
  return `<section><div class="shead"><span class="snum">${num}</span><div><h2>${esc(title)}</h2><p class="lede">${lede}</p></div></div>${body}</section>`;
}

/* ── the document ────────────────────────────────────────────────────── */

export function buildNestedTestHtml(): string {
  /* ═══ دادهٔ زنده ═══ */

  const L0 = CANVAS_L;
  const L8 = CANVAS_L + 8 * LADDER_STEP; // انتهایِ اکسکتِ قانون — دو سر برایِ همهٔ ستون‌ها یکی
  const T = L8 - L0;
  const exactQ = q(LADDER_STEP);

  const stepsQ = LADDER.slice(0, -1).map((h, n) => q(lightnessStep(h, LADDER[n + 1])));
  const minStepQ = Math.min(...stepsQ);
  const maxStepQ = Math.max(...stepsQ);
  const maxDevQ = Math.max(...stepsQ.map((s) => Math.abs(s - exactQ)));

  // منحنیِ لجستیکِ روان‌فیزیک — همان که صفحهٔ فاز استفاده می‌کند
  const beta = (RELIABLE_BOUNDARY - Q) / Math.log(19);
  const pDetect = (dL: number) => 1 / (1 + Math.exp(-(dL - Q) / beta));

  // سه قانونِ لغزان با همان دو سر: فقط توزیعِ ۷ لایهٔ میانی فرق می‌کند
  const fromWeights = (w: number[]): string[] => {
    const sum = w.reduce((a, b) => a + b, 0);
    const levels = [L0];
    for (let i = 0; i < 8; i++) levels.push(levels[i] + (T * w[i]) / sum);
    return levels.map((L) => oklchToHex({ L, C: LADDER_CHROMA, h: LADDER_HUE }));
  };
  const wInc = Array.from({ length: 8 }, (_, i) => 1 + 0.15 * (i - 3.5));
  const rho = Math.pow(L8 / L0, 1 / 8) - 1; // قانونِ هندسی (Weber-style): گام ∝ سطح
  const geoLevels = Array.from({ length: 9 }, (_, i) => L0 * Math.pow(1 + rho, i));
  const geoHexes = geoLevels.map((L) => oklchToHex({ L, C: LADDER_CHROMA, h: LADDER_HUE }));

  const variants: Array<{ id: string; hexes: string[] }> = [
    { id: 'uniform', hexes: [...LADDER] },
    { id: 'inc', hexes: fromWeights(wInc) },
    { id: 'dec', hexes: fromWeights([...wInc].reverse()) },
    { id: 'geo', hexes: geoHexes },
  ];
  const TITLES: Record<string, string> = {
    uniform: 'یکنواخت — نردبانِ واقعی',
    inc: 'فزاینده',
    dec: 'کاهنده',
    geo: 'هندسی (Weber)',
  };
  // عبارتِ قانون‌ها را زنده بساز (ضریب‌های واقعیِ وزن‌ها)
  const wMin = Math.min(...wInc), wMax = Math.max(...wInc), wSum = wInc.reduce((a, b) => a + b, 0);
  const variantList = variants.map((v) => ({
    ...v,
    title: TITLES[v.id],
    law:
      v.id === 'uniform' ? `هر گام دقیقاً ${f4(exactQ)}q = (سقف−لنگر)/۸` :
      v.id === 'inc' ? `گام‌ها خطی از ${f2((8 * wMin) / wSum)}× تا ${f2((8 * wMax) / wSum)}× میانگین — درزهایِ پایین ضعیف، بالایی قوی` :
      v.id === 'dec' ? `برعکسِ فزاینده — درزهایِ پایین قوی، بالایی ضعیف` :
      `گام ∝ سطح (ρ = ${f2(rho * 100)}٪ در هر پله) — لغزشِ ملایم و فریبنده`,
    rq: (() => {
      const s = v.hexes.slice(0, -1).map((h, n) => q(lightnessStep(h, v.hexes[n + 1])));
      return { min: Math.min(...s), max: Math.max(...s) };
    })(),
  }));

  // ترتیبِ آزمونِ کور — seeded از دادهٔ موتور، قطعی بینِ بازتولیدها
  let seed = [...LADDER.join('')].reduce((a, c) => a + c.charCodeAt(0), 0);
  const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const shuffled = [...variantList];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const LETTERS = ['الف', 'ب', 'پ', 'ت'];
  const blind = shuffled.map((v, i) => ({ ...v, letter: LETTERS[i] }));
  const keyLetter = blind.find((b) => b.id === 'uniform')!.letter;

  // کالیبراسیونِ درز: پایینِ q (تقریباً نامرئی) و بالایِ r (واضح)
  const calHex = (dLq: number) => oklchToHex({ L: L0 + dLq * Q, C: LADDER_CHROMA, h: LADDER_HUE });
  const calWeak = [oklchToHex({ L: L0, C: LADDER_CHROMA, h: LADDER_HUE }), calHex(0.6)];
  const calStrong = [oklchToHex({ L: L0, C: LADDER_CHROMA, h: LADDER_HUE }), calHex(1.7)];

  /* ═══ رندرها ═══ */

  const nstack = (hexes: readonly string[], pad = 13): string => {
    let inner = '<div style="min-height:46px"></div>';
    for (let i = hexes.length - 1; i >= 0; i--) {
      const rad = 8 + (hexes.length - 1 - i) * 2;
      inner = `<div style="background:${hexes[i]};padding:${pad}px;border-radius:${rad}px">${inner}</div>`;
    }
    return `<div class="nstack">${inner}</div>`;
  };

  const seamRow = (a: string, b: string, label: string): string =>
    `<div style="margin-top:10px"><div style="display:flex;height:64px;border-radius:10px;overflow:hidden"><div style="flex:1;background:${a}"></div><div style="flex:1;background:${b}"></div></div><div class="seamlab">${label}</div></div>`;

  /* ═══ ۰۱ — آزمونِ اصلی ═══ */

  const s01 = section('01', 'آزمونِ اصلی — تو در تویِ ۹ لایهٔ واقعی',
    'همان کاری که رابطِ واقعی می‌کند: هر سطح میزبانِ سطحِ بعدی است. فقط fill — بدونِ border، بدونِ سایه، بدونِ ریم (انضباطِ مرحلهٔ صفر). فاصلهٔ عادیِ گوشی، نگاهِ نرم: هر ۸ لبه باید <b>یک وزن</b> داشته باشند. اگر لبه‌ای قوی‌تر یا ضعیف‌تر به چشم آمد، همان‌جا عددش در فهرستِ زیر هست.',
    `${nstack(LADDER)}
<div class="tblwrap" style="margin-top:12px"><table class="numtable">
<tr><th>درز</th><th>Δ محقق (q)</th><th>p (لجستیک)</th><th>Δ از بوم</th></tr>
${LADDER.slice(0, -1).map((_, n) => `<tr><td>S${n}|S${n + 1}</td><td>${f2(stepsQ[n])}</td><td>${fa(Math.round(pDetect(stepsQ[n] * Q) * 100))}٪</td><td>${n + 1 ? f2(q(lightnessStep(LADDER[0], LADDER[n + 1]))) + 'q' : '—'}</td></tr>`).join('\n')}
</table></div>
<div class="note">قانونِ اکسکت: هر ۸ گام = ${f4(exactQ)}q (در قراردادِ oklch دقیقاً برابر). ستونِ «محقق» رُندِ ۸-بیتی است: باندِ ${f2(minStepQ)}–${f2(maxStepQ)}q، انحرافِ بیشینه ${f2(maxDevQ)}q — و همین انحراف چیزی است که این آزمون باید نامرئی بودنش را تأیید کند.</div>`);

  /* ═══ ۰۲ — خط‌کشِ درزها ═══ */

  const s02 = section('02', 'خط‌کشِ درزها — اول کالیبره کن، بعد قضاوت',
    'دو مرجع: درزی که تقریباً نامرئی است (۰.۶q — زیرِ آستانهٔ q) و درزی که واضح است (۱.۷q — بالای مرزِ ۹۵٪). بعد تک‌تکِ ۸ درزِ واقعی، هر کدام تنها — تا هیچ مقایسهٔ همزمانی چشم را گول نزند.',
    `${seamRow(calWeak[0], calWeak[1], `مرجعِ ضعیف · Δ=0.60q — زیرِ آستانه، تقریباً نامرئی (${calWeak[0]}|${calWeak[1]})`)}
${seamRow(calStrong[0], calStrong[1], `مرجعِ قوی · Δ=1.70q — واضح (${calStrong[0]}|${calStrong[1]})`)}
<div style="height:18px"></div>
${LADDER.slice(0, -1).map((hex, n) => seamRow(hex, LADDER[n + 1], `S${n}|S${n + 1} · Δ=${f2(stepsQ[n])}q · ${hex}|${LADDER[n + 1]}`)).join('\n')}
<div class="note">سؤالِ آزمون: بینِ مرجعِ ضعیف و مرجعِ قوی، ۸ درزِ واقعی کجا نشسته‌اند؟ اگر همه‌شان «یک‌جا» به نظر می‌رسند — نه نزدیکِ مرجعِ ضعیف، نه نزدیکِ قوی، و نه پراکنده — یعنی باندِ ${f2(minStepQ)}–${f2(maxStepQ)}q برایِ چشمِ شما یکنواخت است.</div>`);

  /* ═══ ۰۳ — رقیب‌ها ═══ */

  const s03 = section('03', 'رقیب‌ها — یکنواخت در برابرِ سه قانونِ لغزان',
    'هر چهار ستون دقیقاً همان دو سر را دارند (بوم و سقفِ واقعی — هر دو pinned)؛ فقط توزیعِ ۷ لایهٔ میانی فرق می‌کند. رقیب‌ها از قانونِ اکسکتِ خودشان با oklchToHex رندر شده‌اند (ابزارِ دیداری، نه قرارداد). دنبالِ چه بگردید: در ستون‌های لغزان، درزها آرام‌آرام قوی یا ضعیف می‌شوند — در ستونِ واقعی باید یکدست بمانند.',
    `<div class="nestgrid">
${variantList.map((v) => `<div class="card" data-law="${v.id}" style="margin-top:0"><div class="ctitle">${esc(v.title)} · گام‌های محقق ${f2(v.rq.min)}–${f2(v.rq.max)}q</div>${nstack(v.hexes, 11)}<div class="note" style="text-align:center">${esc(v.law)}</div></div>`).join('\n')}
</div>`);

  /* ═══ ۰۴ — آزمونِ کور ═══ */

  const s04 = section('04', 'آزمونِ کور — کدام ستون همهٔ درزهایش یکی است؟',
    'چهار ستون، بدونِ برچسبِ قانون — ترتیبشان از دادهٔ موتور seeded است (بینِ بازتولیدها ثابت). همه دو سرِ یکسان دارند. <b>اول خودت قضاوت کن</b> و حرفت را برایِ خودت بگو، بعد برو پایین به کلید نگاه کن. اگر ستونِ واقعی را از رویِ «یکدستیِ درزها» پیدا کردی (یا لغزشِ بقیه را دیدی)، یکنواختی ادراکی تأییدِ چشمی دارد.',
    `<div class="nestgrid">
${blind.map((b) => `<div class="bstack" data-law="${b.id}" data-letter="${b.letter}"><div class="card" style="margin-top:0"><div class="ctitle" style="text-align:center;font-size:15px">${b.letter}</div>${nstack(b.hexes, 10)}</div></div>`).join('\n')}
</div>
<div style="height:34px"></div>
<div class="qbox"><div class="qtitle">⚠ کلیدِ آزمون — اول قضاوت، بعد این‌جا</div>
<div style="font-size:12.5px;line-height:2.4">پاسخِ ستونِ واقعی: <b>${keyLetter}</b> (یکنواخت — نردبانِ قرارداد).<br>
${blind.map((b) => `${b.letter} = ${esc(b.title)} (${f2(b.rq.min)}–${f2(b.rq.max)}q)`).join(' · ')}</div></div>`);

  /* ═══ ۰۵ — عدد و حکم ═══ */

  const s05 = section('05', 'جدولِ عددی — قانونِ اکسکت در برابرِ رُندِ hex',
    'هر چه چشم دید، این‌جا عددش هست. ستونِ «قانون» هیچ ردیفی فرقی ندارد — یک عددِ ثابت؛ ستونِ «hex» کفِ کوانتیزاسیونِ ۸-بیتی است (پینِ وفاداریِ ΔE ≤ ۰.۰۰۲۵ در موتور).',
    `<div class="tblwrap"><table class="numtable">
<tr><th>لایه</th><th>hex</th><th>قانون (q)</th><th>hex (q)</th><th>انحراف</th><th>p</th></tr>
${LADDER.map((hex, n) => `<tr><td><b>S${n}</b></td><td>${hex}</td><td>${n ? f4(exactQ) : '—'}</td><td>${n ? f2(stepsQ[n - 1]) : '—'}</td><td>${n ? f2(stepsQ[n - 1] - exactQ) : '—'}</td><td>${n ? fa(Math.round(pDetect(stepsQ[n - 1] * Q) * 100)) + '٪' : '—'}</td></tr>`).join('\n')}
</table></div>
<div class="note">جمعِ هشت گامِ محقق = ${f2(stepsQ.reduce((a, b) => a + b, 0))}q در برابرِ قانونِ ${f2(8 * exactQ)}q — رُندِ ۸-بیتی در مجموع هم جبران می‌شود (پایانِ نردبان همان سقفِ اکسکت است). p = احتمالِ ادراکِ لجستیک از q و rِ اندازه‌گیری‌شدهٔ خودِ خواننده: هر ۸ درز بالایِ آستانه و در یک باندِ اطمینان.</div>
<div class="qbox" style="margin-top:14px"><div class="qtitle">قدمِ بعد — مشروط به تأییدِ چشمیِ شما</div>
<div style="font-size:12.5px;line-height:2.4">اگر این صفحه تأیید شود، در <span class="mono">LIMINAL-POLICY.md</span> نوشته می‌شود: فرمولِ دقیقِ <span class="mono">L(n) = CANVAS_L + n × LADDER_STEP</span> (اکسکتِ oklch، گامِ یکنواختِ ${f4(exactQ)}q)، جدولِ ۹ رنگِ تولیدشده از همان فرمول، توضیحِ باقی‌ماندهٔ ۸-بیتی (±${f2(maxDevQ)}q)، و پینِ وفاداریِ hex↔فرمول. تا تأییدِ شما چیزی در سیاست نوشته نمی‌شود.</div></div>`);

  /* ═══ shell ═══ */

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LIMINAL — آزمونِ تو در تویِ لایه‌ها · دروازهٔ تأییدِ چشمی</title>
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
.card{background:#090b0d;border:1px solid #15171a;border-radius:12px;padding:14px;margin-top:12px}
.ctitle{font:11.5px ui-monospace,monospace;color:rgba(233,236,242,.55);margin-bottom:10px;line-height:1.9}
.tblwrap{overflow-x:auto}
table.numtable{border-collapse:collapse;font:10.5px ui-monospace,monospace;direction:ltr;width:100%}
table.numtable td,table.numtable th{padding:5px 7px;text-align:center;border-bottom:1px solid #15171a;white-space:nowrap}
table.numtable th{color:rgba(233,236,242,.4);font-weight:400}
.nstack{width:min(430px,100%);margin:0 auto;direction:ltr}
.nestgrid{display:grid;grid-template-columns:1fr;gap:14px}
@media(min-width:680px){.nestgrid{grid-template-columns:1fr 1fr}}
.seamlab{font:10px ui-monospace,monospace;color:rgba(233,236,242,.5);margin-top:5px;text-align:center;direction:ltr}
.note{font-size:11px;color:rgba(233,236,242,.45);line-height:1.9;margin-top:8px}
.qbox{background:#090b0d;border:1px solid #15171a;border-radius:12px;padding:12px 14px;margin-top:10px}
.qtitle{font:12px ui-monospace,monospace;color:#D9BE6E}
.bstack .card{border-color:#1c1f24}
footer{padding-top:20px;font-size:11px;color:rgba(233,236,242,.35);line-height:2}
footer a{color:#6FA8EC}
</style>
</head>
<body>
<div class="shell">
<header>
  <div class="eyebrow">LIMINAL · STAGE ZERO · NESTED VISUAL TEST · GENERATED FROM THE LIVE ENGINE · 2026-10-21</div>
  <h1>آزمونِ تو در تو — آیا همهٔ درزها یکی‌اند؟</h1>
  <p class="lede">دروازهٔ تأییدِ چشمیِ مرحلهٔ صفر: بوم + ۸ سطح، فقط fill. چهار آزمون دارید — چیدمانِ تو در تویِ واقعی، خط‌کشِ کالیبرهٔ درزها، سه رقیبِ لغزان برایِ مقایسه، و یک آزمونِ کور. هر عدد از موتورِ زنده می‌آید. اگر تأیید کنید، فرمولِ دقیقِ همین جدول در فایلِ سیاست نوشته می‌شود.</p>
  <div class="pills">
    <span class="pill">قانونِ اکسکت: هر گام ${f4(exactQ)}q</span>
    <span class="pill">محقق در hex: ${f2(minStepQ)}–${f2(maxStepQ)}q (±${f2(maxDevQ)})</span>
    <span class="pill">دو سر pinned: ${LADDER[0]} ← ${LADDER[8]}</span>
  </div>
</header>
${s01}${s02}${s03}${s04}${s05}
<footer>
  <div>صفحهٔ مرحلهٔ صفر (فرمول، ریاضی، روان‌فیزیک): <a href="audit-lab-snapshot.html"><span class="mono">.lab/audit-lab-snapshot.html</span></a> · ابزارِ بازسنجیِ q: <a href="../design-lab/threshold-test-precise.html"><span class="mono">design-lab/threshold-test-precise.html</span></a></div>
  <div>ژنراتور: <span class="mono">src/site/generate-nested-test.ts</span> · نگهبان: <span class="mono">src/site/__tests__/nested-test.test.ts</span> — با هر اجرای سوئیت بازتولید می‌شود؛ ترتیبِ آزمونِ کور از دادهٔ موتور seeded است و بینِ بازتولیدها ثابت می‌ماند.</div>
</footer>
</div>
</body>
</html>`;
}
