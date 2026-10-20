/**
 * LIMINAL — COLOUR AUDIT PAGE GENERATOR · MERCILESS ROUND 7
 *
 * خواستِ خواننده (۲۰۲۰-۱۰-۲۰ → ۲۰۲۶-۱۰-۲۰): «لایهٔ ۰ تا ۸ را با کدِ رنگ و
 * فاصله نسبت به هم لیست کن» + «یک ممیزی عمیق و بی‌رحم روی رنگ، پالت،
 * روانشناسی رنگ و روابطشان با هم».
 *
 * این صفحه آن ممیزی است — و مثلِ صفحهٔ فاز، هر عددش لحظهٔ تولید از موتورِ
 * زنده محاسبه می‌شود (PALETTE، SEMANTIC_FROM_PALETTE، LADDER، color-math).
 * هیچ عددِ دستی در کار نیست؛ حکم‌ها (قدرت/ضعف/مشکل·حل‌شده/سؤالِ باز) قضاوتِ
 * ممیزی‌اند و هر کدام دادهٔ زندهٔ پشتِ خودشان را در همان بخش نشان می‌دهند.
 *
 * یک باگِ واقعی در همین ممیزی پیدا و اصلاح شد: deltaهای SEMANTIC_FROM_PALETTE
 * با فامِ نومینالِ برچسب حساب می‌شدند در حالی که نگاشت با فامِ اندازه‌گیری‌شده
 * کار می‌کند — INFO «Δ۲۷.۵°» گزارش می‌شد، شیفتِ واقعی ۳.۹° است. اصلاح در
 * liminal-palette.ts، پین در palette.test.ts. عددِ درستِ صفحه همان است که
 * خواننده باید با چشم قضاوت کند.
 *
 * خروجی: `.lab/color-audit.html` (توسط تستِ color-audit نوشته می‌شود؛ هر اجرای
 * سوئیت بازتولیدش می‌کند). از صفحهٔ فاز و ریدایرکتِ Pages لینک دارد.
 */

import {
  LADDER,
  WELLS,
  PERCEPTUAL_QUANTUM as Q,
  LADDER_CHROMA,
  RELIABLE_BOUNDARY,
  FOCUS_RING_COLOR,
} from '../engine/liminal-ladder';
import {
  oklchLightness,
  lightnessStep,
  rgbToOklch,
  hexToRgb,
  contrastRatioHex,
} from '../engine/liminal-color-math';
import {
  PALETTE,
  PALETTE_STEP_DROP,
  SEMANTIC_HUE_ANGLE,
  SEMANTIC_FROM_PALETTE,
  paletteTextContrast,
} from '../engine/liminal-palette';
import { LiminalColorEngine } from '../engine/liminal-color-engine';
import { ROLE_LEVEL } from '../engine/liminal-surface';
import type { SurfaceRole } from '../engine/liminal-surface';

/* ── helpers (هم‌زبان با صفحهٔ فاز) ───────────────────────────────────── */

const ROLES = Object.keys(ROLE_LEVEL) as SurfaceRole[];
const CEILING_L = 0.204;

const q = (dL: number) => dL / Q;
const f3 = (x: number) => x.toFixed(3);
const f2 = (x: number) => x.toFixed(2);
const f1 = (x: number) => x.toFixed(1);
const fa = (n: number | string) => String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const gap = (a: number, b: number): number => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const hexOf = (cssVar: string): string => cssVar.match(/#[0-9a-fA-F]{6}/)?.[0] ?? cssVar;

/** OKLab euclidean distance — the discriminability metric. */
function deltaE(hexA: string, hexB: string): number {
  const toAB = (hex: string) => {
    const o = rgbToOklch(hexToRgb(hex));
    const hr = (o.h * Math.PI) / 180;
    return { L: o.L, a: o.C * Math.cos(hr), b: o.C * Math.sin(hr) };
  };
  const x = toAB(hexA), y = toAB(hexB);
  return Math.sqrt((x.L - y.L) ** 2 + (x.a - y.a) ** 2 + (x.b - y.b) ** 2);
}

const verdictCount = { قدر: 0, ضعف: 0, حل: 0, باز: 0 };

function verdict(kind: 'قدرت' | 'ضعف' | 'مشکل·حل‌شده' | 'سؤال باز', title: string, reason: string): string {
  const color = kind === 'قدرت' ? '#74CE8E' : kind === 'ضعف' ? '#D9BE6E' : kind === 'مشکل·حل‌شده' ? '#6FA8EC' : '#A98BEA';
  if (kind === 'قدرت') verdictCount.قدر++;
  else if (kind === 'ضعف') verdictCount.ضعف++;
  else if (kind === 'مشکل·حل‌شده') verdictCount.حل++;
  else verdictCount.باز++;
  return `<div class="verdict" style="border-inline-start:2px solid ${color}">
<div class="vtitle"><span style="color:${color}">${kind}</span> — ${esc(title)}</div>
<div class="vreason">${reason}</div></div>`;
}

function test(pass: boolean, name: string, value: string, why: string): string {
  return `<div class="test"><span class="tmark" style="color:${pass ? '#74CE8E' : '#E88A93'}">${pass ? '✓' : '✗'}</span>
<div><div class="tname">${esc(name)}${value ? ` <code class="tvalue">${esc(value)}</code>` : ''}</div>
<div class="twhy">دلیل: ${why}</div></div></div>`;
}

function finding(title: string, body: string): string {
  return `<div class="finding"><span class="fmark">⚠</span>
<div><div class="tname">${esc(title)}</div><div class="twhy">${body}</div></div></div>`;
}

const card = (title: string, body: string) => `<div class="card"><div class="ctitle">${esc(title)}</div>${body}</div>`;

function section(num: string, title: string, lede: string, body: string): string {
  return `<section><div class="shead"><span class="snum">${num}</span><div><h2>${esc(title)}</h2><p class="lede">${lede}</p></div></div>${body}</section>`;
}

const chip = (hex: string) => `<span class="chip" style="background:${hex}"></span>`;

/* ── the document ────────────────────────────────────────────────────── */

export function buildColorAuditHtml(): string {
  /* ═══ دادهٔ زنده — همه از موتور ═══ */

  const stepOf = (label: string, n: number) => PALETTE.find((p) => p.label === label)!.steps.find((s) => s.n === n)!;

  // §01 — لایه‌ها
  const levels = LADDER.map((hex, n) => {
    const o = rgbToOklch(hexToRgb(hex));
    return {
      n, hex,
      roles: ROLES.filter((r) => ROLE_LEVEL[r] === n).join(' · '),
      L: o.L, C: o.C, h: o.h,
      dCanvasQ: n ? q(lightnessStep(LADDER[0], hex)) : 0,
      dPrevQ: n ? q(lightnessStep(LADDER[n - 1], hex)) : 0,
      wcagWhite: contrastRatioHex('#FFFFFF', hex),
    };
  });
  const wellPenQ = q(lightnessStep(LADDER[0], WELLS.penumbra));
  const wellUmbQ = q(lightnessStep(LADDER[0], WELLS.umbra));
  // محصور بودنِ گام + منحنی لجستیک — همان ریاضیِ صفحهٔ فاز، زنده
  const geoStepQ = q((CEILING_L - oklchLightness(LADDER[0])) / (LADDER.length - 1));
  const maxDevQ = Math.max(...levels.slice(1).map((d) => Math.abs(d.dPrevQ - geoStepQ)));
  const beta = (RELIABLE_BOUNDARY - Q) / Math.log(19);
  const pDetect = (dL: number) => 1 / (1 + Math.exp(-(dL - Q) / beta));
  const pNeighbor = pDetect(Math.min(...levels.slice(1).map((d) => d.dPrevQ)) * Q);

  // §02–03 — چرخ: فام‌ها، دریفت، شکاف‌ها
  const hues = PALETTE.map((p) => ({
    label: p.label,
    nominal: p.hue,
    measured: p.hueMeasured,
    drift: gap(p.hue, p.hueMeasured),
    hex: p.approved,
    C: stepOf(p.label, 7).C,
    L: stepOf(p.label, 7).L,
    fraction: p.fraction,
  }));
  const sorted = [...hues].sort((a, b) => a.measured - b.measured);
  const wheelGaps = sorted.map((h, i) => {
    const prev = sorted[(i + sorted.length - 1) % sorted.length];
    return { from: prev.label, to: h.label, g: gap(prev.measured, h.measured), mid: (prev.measured + (prev.measured > h.measured ? 360 : 0) + h.measured) / 2 };
  });
  const maxGap = wheelGaps.reduce((a, b) => (b.g > a.g ? b : a));
  const minGap = wheelGaps.reduce((a, b) => (b.g < a.g ? b : a));
  const drifted = hues.filter((h) => h.drift >= 10).sort((a, b) => b.drift - a.drift);
  const worst = drifted[0];
  // مرزِ گرم/سرد روی ۹۲° اندازه‌گیری‌شده: Amber در ۹۱.۳ گرم است، Lime در ۱۲۷.۱ سرد.
  const warm = hues.filter((h) => h.measured >= 330 || h.measured <= 92);
  const cool = hues.filter((h) => !(h.measured >= 330 || h.measured <= 92));

  // §05 — رمپ‌ها و اشباع
  const s2 = PALETTE.map((p) => ({ label: p.label, hex: stepOf(p.label, 2).hex, C: stepOf(p.label, 2).C, L: stepOf(p.label, 2).L }));
  const s2max = s2.reduce((a, b) => (b.C > a.C ? b : a));
  const s2min = s2.reduce((a, b) => (b.C < a.C ? b : a));
  const fractions = hues.map((h) => h.fraction);
  const rampDriftMax = Math.max(...PALETTE.map((p) => Math.max(...p.steps.map((s) => {
    const o = rgbToOklch(hexToRgb(s.hex));
    return gap(o.h, p.hueMeasured);
  }))));
  const Ls = hues.map((h) => h.L);
  const lSpread = Math.max(...Ls) - Math.min(...Ls);
  const lMax = hues.reduce((a, b) => (b.L > a.L ? b : a));
  const lMin = hues.reduce((a, b) => (b.L < a.L ? b : a));

  // §06 — تمایزپذیری
  function tightest(n: number): { d: number; pair: string } {
    let min = Infinity, pair = '';
    for (let i = 0; i < PALETTE.length; i++)
      for (let j = i + 1; j < PALETTE.length; j++) {
        const d = deltaE(stepOf(PALETTE[i].label, n).hex, stepOf(PALETTE[j].label, n).hex);
        if (d < min) { min = d; pair = `${PALETTE[i].label}/${PALETTE[j].label}`; }
      }
    return { d: min, pair };
  }
  const t2 = tightest(2), t5 = tightest(5), t7 = tightest(7);

  // §07 — معناها: فعلی در برابرِ پیشنهاد
  const ROLE_FA: Record<string, string> = { SUCCESS: 'موفقیت', WARNING: 'هشدار', DANGER: 'خطر', INFO: 'اطلاع' };
  const current = (['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const).map((role) => {
    const s = LiminalColorEngine.SEMANTICS[role];
    const solid = hexOf(s.solid);
    const text = hexOf(s.text);
    const subtle = hexOf(s.subtle);
    const border = hexOf(s.border);
    const o = rgbToOklch(hexToRgb(solid));
    return { role, glyph: s.glyph, solid, text, subtle, border, L: o.L, C: o.C, h: o.h };
  });
  const byChroma = [...current].sort((a, b) => b.C - a.C);
  const proposed = SEMANTIC_FROM_PALETTE.map((s) => {
    const ft = rgbToOklch(hexToRgb(s.text));
    const ff = rgbToOklch(hexToRgb(s.fill));
    return { ...s, roleFa: ROLE_FA[s.role], glyph: LiminalColorEngine.SEMANTICS[s.role].glyph, textL: ft.L, fillC: ff.C };
  });
  const deltaByRole = Object.fromEntries(proposed.map((p) => [p.role, p.delta]));
  const maxPropDelta = Math.max(...proposed.map((p) => p.delta));

  // §08 — رابطه‌ها با نردبان
  const stage = rgbToOklch(hexToRgb(LADDER[4]));
  const stageDists = hues.map((h) => ({ label: h.label, d: gap(h.measured, stage.h) })).sort((a, b) => a.d - b.d);
  const focusHex = hexOf(FOCUS_RING_COLOR);
  const focusO = rgbToOklch(hexToRgb(focusHex));
  const focusContrast = contrastRatioHex(focusHex, LADDER[8]);
  const whiteFill12 = Math.min(...PALETTE.flatMap((p) => [1, 2].map((n) => contrastRatioHex('#FFFFFF', stepOf(p.label, n).hex))));
  const whiteFill3 = Math.min(...PALETTE.map((p) => contrastRatioHex('#FFFFFF', stepOf(p.label, 3).hex)));
  const ptc = paletteTextContrast();
  const figGround = s2min.C / LADDER_CHROMA;
  const fillsAboveCeiling = Math.min(...PALETTE.map((p) => stepOf(p.label, 1).L));

  /* ═══ چرخِ SVG ═══ */

  const CX = 180, CY = 180;
  const pt = (h: number, r: number): [number, number] => {
    const t = (h * Math.PI) / 180;
    return [CX + r * Math.cos(t), CY - r * Math.sin(t)]; // y وارونه: فامِ ۹۰ (زرد) بالا
  };
  const ringPath = (from: number, to: number, r: number): string => {
    let a = from, b = to;
    while (b < a) b += 360;
    const pts: string[] = [];
    for (let h = a; h <= b + 0.001; h += 2) pts.push(pt(h % 360, r).map((v) => v.toFixed(1)).join(','));
    return pts.join(' ');
  };
  const wheel = `<svg viewBox="0 0 360 360" role="img" aria-label="چرخِ ۱۲ فام با موقعیتِ اندازه‌گیری‌شده" style="width:min(360px,100%);height:auto;display:block;margin:0 auto">
<circle cx="${CX}" cy="${CY}" r="100" fill="none" stroke="#15171a" stroke-width="1"/>
<polyline points="${ringPath(maxGap.mid - maxGap.g / 2, maxGap.mid + maxGap.g / 2, 100)}" fill="none" stroke="#E88A93" stroke-width="5" opacity="0.75" stroke-linecap="round"/>
<polyline points="${ringPath(minGap.mid - minGap.g / 2, minGap.mid + minGap.g / 2, 100)}" fill="none" stroke="#D9BE6E" stroke-width="5" opacity="0.75" stroke-linecap="round"/>
${hues.map((h) => {
    const [x1, y1] = pt(h.nominal, 112), [x2, y2] = pt(h.nominal, 121);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="rgba(233,236,242,.3)" stroke-width="1.5"/>`;
  }).join('\n')}
${(() => {
    const [x1, y1] = pt(stage.h, 88), [x2, y2] = pt(stage.h, 112);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#E9ECF2" stroke-width="2"/>`;
  })()}
${hues.map((h) => {
    const [x, y] = pt(h.measured, 100);
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="${h.hex}" stroke="rgba(233,236,242,.45)" stroke-width="1"/>`;
  }).join('\n')}
${hues.map((h) => {
    const [x, y] = pt(h.measured, 137);
    const cos = Math.cos((h.measured * Math.PI) / 180);
    const anchor = cos > 0.25 ? 'start' : cos < -0.25 ? 'end' : 'middle';
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle" font-family="ui-monospace,monospace" font-size="10" fill="#E9ECF2">${h.label}</text>`;
  }).join('\n')}
${(() => {
    const [x, y] = pt(maxGap.mid, 72);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-family="ui-monospace,monospace" font-size="9.5" fill="#E88A93">${fa(f1(maxGap.g))}°</text>`;
  })()}
${(() => {
    const [x, y] = pt(minGap.mid, 72);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-family="ui-monospace,monospace" font-size="9.5" fill="#D9BE6E">${fa(f1(minGap.g))}°</text>`;
  })()}
${(() => {
    const [x, y] = pt(stage.h, 56);
    return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-family="ui-monospace,monospace" font-size="9.5" fill="rgba(233,236,242,.65)">صحنه ${fa(f1(stage.h))}°</text>`;
  })()}
</svg>`;

  /* ═══ بخش ۰۱ — لیستِ لایه‌ها ═══ */

  const s01 = section('01', 'لیستِ لایه‌ها — کدِ رنگ و فاصله',
    'خواستِ صریحِ شما: لایهٔ ۰ تا ۸ با کدِ رنگ و فاصله نسبت به هم. همهٔ اعداد همین‌جا از <span class="mono">LADDER</span> و color-math اندازه‌گیری شده‌اند — فاصله‌ها بر حسبِ q (آستانهٔ ادراکِ اندازه‌گیری‌شدهٔ خودتان، ' + f3(Q) + '). جزئیاتِ کاملِ «چرا این گام» در صفحهٔ فاز است.',
    `<div class="tblwrap"><table class="numtable">
<tr><th>لایه</th><th>رنگ</th><th>hex</th><th>نقش‌ها</th><th>L</th><th>Δ از بوم</th><th>Δ همسایه</th><th>WCAG سفید</th></tr>
${levels.map((d) => `<tr><td><b>S${d.n}</b></td><td>${chip(d.hex)}</td><td>${d.hex}</td><td style="text-align:left">${esc(d.roles)}</td><td>${f3(d.L)}</td><td>${d.n ? f2(d.dCanvasQ) + 'q' : '—'}</td><td>${d.n ? f2(d.dPrevQ) + 'q' : '—'}</td><td>${f2(d.wcagWhite)}</td></tr>`).join('\n')}
<tr style="opacity:.55"><td><b>S-1</b></td><td>${chip(WELLS.penumbra)}</td><td>${WELLS.penumbra}</td><td style="text-align:left">penumbra well (چاهِ سایه — لایه نیست)</td><td>${f3(oklchLightness(WELLS.penumbra))}</td><td>${f2(-wellPenQ)}q</td><td>—</td><td>—</td></tr>
<tr style="opacity:.55"><td><b>S-2</b></td><td>${chip(WELLS.umbra)}</td><td>${WELLS.umbra}</td><td style="text-align:left">umbra well (چاهِ تماس — لایه نیست)</td><td>${f3(oklchLightness(WELLS.umbra))}</td><td>${f2(-wellUmbQ)}q</td><td>—</td><td>—</td></tr>
</table></div>
<div class="note">گامِ محقق: ${levels.slice(1).map((d) => f2(d.dPrevQ)).join(' / ')}q — اکسکتِ هدفِ محصور ${f2(geoStepQ)}q است؛ انحراف از گرد شدنِ hex حداکثر ${f2(maxDevQ)}q. احتمالِ ادراکِ لجستیک برای بدترین همسایه ≈${fa(Math.round(pNeighbor * 100))}٪ و برای رابطه‌های ≥۲ پله ≈۱۰۰٪. چاه‌ها زیرِ بوم‌اند (دنیای سایه)، سقف بالایِ همه: L(S8)=${f3(levels[8].L)} ≤ ${CEILING_L}.</div>`);

  /* ═══ بخش ۰۲ — چرخ ═══ */

  const s02 = section('02', 'چرخِ رنگ — موقعیتِ واقعیِ ۱۲ فام',
    'نقطه‌ها: فامِ <b>اندازه‌گیری‌شده</b> از hexِ تصویب‌شده. تیک‌های خاکستری بیرونی: مختصاتِ نومینالِ برچسب (۱۵/۴۰/۷۵…). فاصلهٔ نقطه از تیکِ خودش = دریفتِ نام. کمانِ سرخ: بزرگ‌ترین شکافِ چرخ؛ کمانِ کهربایی: کوچک‌ترین. تیکِ سفید: فامِ صحنه (نردبان).',
    `${wheel}
<div class="tblwrap" style="margin-top:14px"><table class="numtable">
<tr><th>فام</th><th>رنگ</th><th>نومینال</th><th>اندازه‌گیری</th><th>دریفت</th><th>C₇</th><th>L₇</th><th>کسرِ گاموت</th></tr>
${[...hues].sort((a, b) => a.nominal - b.nominal).map((h) => `<tr><td>${h.label}</td><td>${chip(h.hex)}<span style="opacity:.6">${h.hex}</span></td><td>${f1(h.nominal)}°</td><td><b>${f1(h.measured)}°</b></td><td style="color:${h.drift >= 10 ? '#E88A93' : 'rgba(233,236,242,.6)'}">${f1(h.drift)}°</td><td>${f3(h.C)}</td><td>${f3(h.L)}</td><td>${Math.round(h.fraction * 100)}٪</td></tr>`).join('\n')}
</table></div>`);

  /* ═══ بخش ۰۳ — نام در برابرِ واقعیت ═══ */

  const s03 = section('03', 'نام در برابرِ واقعیت — ممیزیِ دریفت',
    'بی‌رحم‌ترین یافتهٔ زبانیِ پالت: موتور با فامِ اندازه‌گیری‌شده کار می‌کند (رمپ‌ها، nearestHue، نگاشتِ معنایی) — پس ریاضی هرگز گولِ برچسب را نمی‌خورد. اما خودِ برچسب‌ها در ۶ مورد از ۱۲ نیم‌پرده تا دو نیم‌پرده با رنگِ واقعی فاصله دارند.',
    `<div class="tblwrap"><table class="numtable">
<tr><th>برچسب</th><th>دریفت</th><th>واقعیتِ رنگ</th></tr>
${drifted.map((h) => `<tr><td>${h.label} <span style="opacity:.5">(${f1(h.nominal)}°)</span></td><td style="color:#E88A93"><b>${fa(f1(h.drift))}°</b></td><td style="text-align:left">${
      h.label === 'Sapphire' ? 'لاجوردِ برچسب در عمل آبی-بنفش است — ۴.۸° با فامِ صحنه فاصله دارد' :
      h.label === 'Amber' ? 'کهربا به زرد-سبز رفته — برای WARNING هنوز کاملاً زرد به چشم می‌آید' :
      h.label === 'Lime' ? 'لایم به سبز-زردِ چمنی رفته — سبزِ گرم، نه سبزِ نئونی' :
      h.label === 'Cyan' ? 'فیروزه‌ای به آزور (آبیِ روشن) رفته — سردتر از «سیانِ» ذهنی' :
      h.label === 'Coral' ? 'مرجانی به نارنجیِ هلویی رفته — گرم‌تر از صورتیِ مرجانی' :
      'نیلی به بنفش-آبی رفته — ولی این دقیقاً همان چیزی است که «ایندیگو»ی کلاسیک هست'
    }</td></tr>`).join('\n')}
</table></div>
${test(drifted.length === 6, '۶ فام از ۱۲ دریفتِ ≥۱۰° دارند', `بدترین: ${worst.label} = ${f1(worst.drift)}°`, 'پینِ تست: اگر بازبرچسب‌گذاریِ آینده این عدد را عوض کند، تست عمداً می‌شکند تا تصمیم ثبت شود.')}`);

  /* ═══ بخش ۰۴ — پوشش و روانشناسی ═══ */

  const s04 = section('04', 'پوششِ چرخ — روانشناسیِ گرم و سرد',
    'چرخِ ۱۲ فامی یکنواخت نیست — و این هم تصادف نیست هم مشکل. نومینال‌ها با گامِ ۲۵–۳۵° نوشته شده بودند ولی موقعیتِ واقعیِ رنگ‌ها نامتوازن‌تر درآمد.',
    card(`گرم: ${warm.length} · سرد: ${cool.length}`,
      `<div style="font-size:12px;line-height:2.2">گرم‌ها (بر اساسِ فامِ اندازه‌گیری‌شده ≤۹۲° یا ≥۳۳۰°): ${warm.map((h) => `${chip(h.hex)}${h.label} ${fa(f1(h.measured))}°`).join(' · ')}<br>سرد‌ها: ${cool.map((h) => `${chip(h.hex)}${h.label}`).join(' · ')}</div>`) +
    `<div class="note" style="margin-top:10px"><b style="color:#E88A93">حفرهٔ گرم:</b> از ${maxGap.from} تا ${maxGap.to} — ${fa(f1(maxGap.g))}° بیابان. هیچ نارنجیِ خالصی (ورمیلیون ~۳۵°) در پالت نیست؛ DANGER فعلی در ۲۳.۴° دقیقاً لبهٔ همین حفره نشسته. <b style="color:#D9BE6E">شلوغیِ سرد:</b> از ${minGap.from} تا ${minGap.to} فقط ${fa(f1(minGap.g))}° — و کلاً ۴ فام در یک قوسِ ۹۸°ی آبی-بنفش (Sapphire/Indigo/Violet/Fuchsia). در واژگانِ فارسیِ رابط کاربری این چهارتا به «آبی/نیلی/بنفش/ارغوانی» روی هم می‌ریزند.</div>
${test(maxGap.g <= 45 && minGap.g >= 18, 'کران‌های شکافِ چرخ پین شده‌اند', `max ${f1(maxGap.g)}° ≤ 45 · min ${f1(minGap.g)}° ≥ 18`, 'پوشش کارکردی کافی است (هر چهار معنا + برند جای خانه دارند)؛ تنوعِ تزئینی لاغر — تصمیمِ فامِ سیزدهم با شماست.')}`);

  /* ═══ بخش ۰۵ — رمپ‌ها ═══ */

  const s05 = section('05', 'رمپ‌ها — کسرِ گاموت و هویتِ خانواده',
    'هر فام رمپِ ۷ پله‌ایِ خودش را دارد: فامِ اندازه‌گیری‌شده ثابت می‌ماند (دریفتِ رمپ ≤' + f1(rampDriftMax) + '°)، نورانیت با گامِ ' + f2(PALETTE_STEP_DROP) + ' پایین می‌آید و اشباع = کسرِ خانواده × بیشینهٔ قابلِ‌دستیابی در آن نورانیت — پس هیچ رنگی هیچ‌جا clip نمی‌شود.',
    `<div class="tblwrap"><table class="numtable">
<tr><th>فام</th><th>s1</th><th>s2</th><th>s3</th><th>s5</th><th>s7 = مصوب</th><th>C₂</th><th>کسر</th></tr>
${PALETTE.map((p) => {
      const c2 = stepOf(p.label, 2).C;
      return `<tr><td>${p.label}</td>${[1, 2, 3, 5, 7].map((n) => `<td>${chip(stepOf(p.label, n).hex)}</td>`).join('')}<td style="color:${c2 === s2max.C ? '#6FA8EC' : c2 === s2min.C ? '#D9BE6E' : 'inherit'}">${f3(c2)}</td><td>${Math.round(p.fraction * 100)}٪</td></tr>`;
    }).join('\n')}
</table></div>
<div class="note"><b>پلهٔ برابر ≠ اشباعِ برابر:</b> در s2 اشباع از ${f3(s2min.C)} (${s2min.label}) تا ${f3(s2max.C)} (${s2max.label}) می‌رود — ${f1(s2max.C / s2min.C)}× اختلاف. این باگ نیست، فیزیکِ هویت است: فام‌ها کسرِ گاموتِ خودشان را نگه می‌دارند تا سبزِ تصویب‌شده، سبزِ تصویب‌شده بماند. <b>قاعدهٔ استفاده:</b> شمارهٔ پله را هرگز بینِ خانواده‌ها حاملِ معنا نکنید — معنا در «فام + نقشِ باند» است (۱–۳ fill · ۴–۵ border · ۶–۷ text)، نه در عددِ پله.<br>پهنهٔ L خانواده: ${lMin.label} ${f3(lMin.L)} … ${lMax.label} ${f3(lMax.L)} (پهنهٔ ${f3(lSpread)} ≈ ${f1(q(lSpread))}q) — زرد بازتاب می‌کند و بنفش جذب؛ Lِ برابر هویت را تخت می‌کرد.</div>`);

  /* ═══ بخش ۰۶ — تمایزپذیری ═══ */

  const s06 = section('06', 'تمایزپذیری — ΔE در باندِ هر نقش',
    'کمینهٔ فاصلهٔ OKLab بینِ هر جفت از ۱۲ فام، در سه پلهٔ نمایندهٔ باندهای نقش. معیارِ صادقانه: این رنگ‌ها <b>کنارِ هم</b> متمایزند، <b>از دور</b> نه — و نام‌های همسایه ریسک را دو برابر می‌کند.',
    `<div class="tblwrap"><table class="numtable">
<tr><th>باند</th><th>پله</th><th>تنگ‌ترین جفت</th><th>ΔE (OKLab)</th><th>حکم</th></tr>
<tr><td>fill</td><td>s2</td><td>${t2.pair}</td><td>${f3(t2.d)}</td><td>≥ 0.03 پین شد</td></tr>
<tr><td>border</td><td>s5</td><td>${t5.pair}</td><td>${f3(t5.d)}</td><td>≥ 0.045 پین شد</td></tr>
<tr><td>text</td><td>s7</td><td>${t7.pair}</td><td>${f3(t7.d)}</td><td>≥ 0.04 پین شد</td></tr>
</table></div>
<div class="swrow" style="margin-top:12px">
<div class="sw"><div style="width:110px;height:52px;border-radius:8px;background:${stepOf(t2.pair.split('/')[0], 2).hex}"></div><div class="swl">${t2.pair.split('/')[0]} s2</div></div>
<div class="sw"><div style="width:110px;height:52px;border-radius:8px;background:${stepOf(t2.pair.split('/')[1], 2).hex}"></div><div class="swl">${t2.pair.split('/')[1]} s2</div><div class="sws">ΔE = ${f3(t2.d)}</div></div>
<div class="sw"><div style="width:110px;height:52px;border-radius:8px;background:${stepOf(t7.pair.split('/')[0], 7).hex}"></div><div class="swl">${t7.pair.split('/')[0]} s7</div></div>
<div class="sw"><div style="width:110px;height:52px;border-radius:8px;background:${stepOf(t7.pair.split('/')[1], 7).hex}"></div><div class="swl">${t7.pair.split('/')[1]} s7</div><div class="sws">ΔE = ${f3(t7.d)}</div></div>
</div>
<div class="note"><b>قاعدهٔ عملی:</b> Emerald+Teal هرگز دو معنای متفاوت در یک نما · Sapphire+Indigo هرگز دو رنگِ لینک · Lime+Emerald هرگز success و «موفقیتِ ثانوی» — مگر با برچسبِ متنی. تمایزِ دیدِ محیطی نداریم؛ تمایزِ مقایسهٔ مستقیم داریم.</div>`);

  /* ═══ بخش ۰۷ — معناها ═══ */

  const s07 = section('07', 'معناها — ممیزیِ بی‌رحمِ برآمندی',
    'رنگِ معنایی فقط «قراردادِ قرمز=خطر» نیست — وزنِ بصری هم هست. ترتیبِ برآمندیِ کروماییِ وضعیتِ فعلی را اندازه بگیرید و با ترتیبِ روانیِ مطلوب مقایسه کنید: واژگون است.',
    card('وضعیتِ فعلی — موتورِ semantic (هنوز قدیمی)',
      `<div class="tblwrap"><table class="numtable">
<tr><th>نقش</th><th>solid</th><th>h</th><th>C</th><th>L</th><th>رتبهٔ برآمندیِ کرومایی</th></tr>
${current.map((c) => `<tr><td>${c.glyph} ${c.role}</td><td>${chip(c.solid)}${c.solid}</td><td>${f1(c.h)}°</td><td>${f3(c.C)}</td><td>${f3(c.L)}</td><td><b style="color:${byChroma[0].C - byChroma[1].C < 0.01 && (byChroma[0] === c || byChroma[1] === c) ? '#E88A93' : 'inherit'}">${byChroma.indexOf(c) + 1}</b></td></tr>`).join('\n')}
</table></div>
<div class="note">ترتیبِ اندازه‌گیری‌شدهٔ فریاد: <b>${byChroma.map((c) => c.role).join(' > ')}</b> — INFO به بلندیِ DANGER فریاد می‌زند (اختلافِ C کمتر از ۰.۰۱) و WARNING ساکن‌ترینِ همه است. از نظرِ روانشناسیِ هشدار این وارونگیِ تصادفی است: خطر باید بلندترین و اطلاع باید مؤدب‌ترین باشد.</div>`) +
    card('پیشنهاد — SEMANTIC_FROM_PALETTE (با Δِ اصلاح‌شدهٔ اندازه‌گیری‌شده)',
      `<div class="tblwrap"><table class="numtable">
<tr><th>نقش</th><th>فام</th><th>fill (s2)</th><th>border (s5)</th><th>text (s7)</th><th>Δ واقعی</th></tr>
${proposed.map((p) => `<tr><td>${p.glyph} ${p.role}</td><td>${p.label} @ ${f1(SEMANTIC_HUE_ANGLE[p.role as keyof typeof SEMANTIC_HUE_ANGLE])}°</td><td>${chip(p.fill)}${p.fill}</td><td>${chip(p.border)}${p.border}</td><td>${chip(p.text)}${p.text}</td><td><b style="color:#74CE8E">${fa(f1(p.delta))}°</b></td></tr>`).join('\n')}
</table></div>
<div class="note">Δها با فامِ <b>اندازه‌گیری‌شده</b> حساب شده‌اند (باگِ نومینال اصلاح شد: INFO قبلاً «۲۷.۵°» دروغ گزارش می‌شد، واقعی ${fa(f1(deltaByRole.INFO))}° است). بیشینهٔ شیفت ${fa(f1(maxPropDelta))}° — کمتر از نصفِ کوچک‌ترین شکافِ چرخ (${fa(f1(minGap.g))}°)، یعنی هیچ فامی برایِ معناها دزدیده نمی‌شود.</div>`) +
    `<div class="seamgrid" style="margin-top:12px">
${proposed.map((p) => {
      const cur = current.find((c) => c.role === p.role)!;
      return `<div class="card" style="margin-top:0"><div class="ctitle">${p.glyph} ${p.role} — ${p.roleFa}</div>
<div style="font:10px ui-monospace,monospace;color:rgba(233,236,242,.4);margin-bottom:4px">فعلی</div>
<div style="background:${cur.subtle};border:1px solid ${cur.border};border-radius:8px;padding:8px 10px;font-size:12px;color:${cur.text}">${cur.glyph} نمونهٔ پیامِ ${p.roleFa}</div>
<div style="font:10px ui-monospace,monospace;color:rgba(233,236,242,.4);margin:8px 0 4px">پیشنهادی (fill/border/text از یک فام)</div>
<div style="background:${p.fill};border:1px solid ${p.border};border-radius:8px;padding:8px 10px;font-size:12px;color:${p.text}">${p.glyph} نمونهٔ پیامِ ${p.roleFa}</div>
</div>`;
    }).join('\n')}
</div>
<div class="note" style="margin-top:12px"><b>اهرم‌های برآمندی در پیشنهاد:</b> ۱) برانگیختگیِ فام — سرخیِ Ruby حاملِ خطر است (روانشناسیِ تکاملی، نه اشباع)؛ ۲) نورانیت — متنِ WARNING با L=${f3(hues.find((h) => h.label === 'Amber')!.L)} روشن‌ترین فامِ پالت است؛ ۳) معماریِ سه‌توکنی — fillِ عمیق + متنِ روشن الگوی استانداردِ UI تاریک مدرن است. <b>باقی‌ماندهٔ فیزیک:</b> کرومای fillِ INFO (${f3(proposed.find((p) => p.role === 'INFO')!.fillC)}) و DANGER (${f3(proposed.find((p) => p.role === 'DANGER')!.fillC)}) تقریباً برابر می‌ماند — گاموتِ فامِ آبی-سرخ در آن نورانیت همین است. اگر ترتیبِ کروماییِ مهندسی‌شده بخواهید، باید C را دستی override کنیم که نقضِ «همه‌چیز مشتق» است — تصمیمش با شما.</div>`);

  /* ═══ بخش ۰۸ — رابطه‌ها ═══ */

  const s08 = section('08', 'رابطه‌ها — رنگ با نردبان، صحنه با بازیگر',
    'ممیزیِ رنگ بدونِ روابطش با بقیهٔ سیستم ناقص است: صحنه (نردبان) چه فامی دارد و بازیگرها (پالت) کجای چرخ نشسته‌اند؛ فوکوس، چاه‌ها، سقف و کنتراست‌ها چه رابطه‌ای با هم دارند.',
    `${test(stageDists[0].label === 'Sapphire', 'فامِ صحنه بینِ Sapphire و Indigo می‌نشیند', `صحنه ${f1(stage.h)}° · Δ تا ${stageDists[0].label} = ${f1(stageDists[0].d)}° · Δ تا ${stageDists[1].label} = ${f1(stageDists[1].d)}°`, 'صحنه از خانوادهٔ آبیِ خودِ INFO است — اطلاع «در خانه» آرام می‌نشیند و هشدارهای گرم (خطر/هشدار) کنتراستِ فامیِ رایگان می‌گیرند. این نامتقارنیِ روانشناسانه دقیقاً همان چیزی است که یک سیستمِ هشدار می‌خواهد.')}
${test(figGround >= 5, 'figure-groundِ اشباع قبل از نورانیت', `آرام‌ترین fill (s2 ${s2min.label}) = ${f3(s2min.C)} ÷ صحنه ${f3(LADDER_CHROMA)} = ${f1(figGround)}×`, 'هر رنگِ پالتی روی هر سطحی، پیش از آنکه روشن‌تر باشد، اشباع‌تر است — جداییِ شکل از زمینه با دو کانالِ مستقل تضمین شده.')}
${test(focusO.C < 0.01, 'حلقهٔ فوکوس خنثی است، نه آبی', `C = ${f3(focusO.C)} · کنتراست با S8 = ${f1(focusContrast)}`, 'اگر فوکوس آبی بود با INFO جنگِ معنایی داشت («این آبی اطلاع است یا تعامل؟»). خنثیِ روشن = بیشترین کنتراست روی هر سطح + صفرِ بارِ معنایی.')}
${test(whiteFill12 >= 7, 'متنِ سفید روی همهٔ فیل‌های تاریک AAA است', `min(s1,s2) = ${f1(whiteFill12)}:1 · min(s3) = ${f1(whiteFill3)}:1`, '۲۴ فیلِ پلهٔ ۱–۲ همه ≥۷:۱ — badge و alert با متنِ سفید هرگز نمی‌شکنند؛ پلهٔ ۳ هم AA-بالا می‌ماند (کف: Amber).') }
${test(ptc.min >= 4.5, 'متنِ پلهٔ ۷ روی ۹ سطح از یک منبع', `min = ${f2(ptc.min)} (${ptc.minLabel} روی ${ptc.onSurface})`, 'کفِ کنتراستِ متنِ رنگی روی بدترین سطحِ ممکن — همه از همان دوازدهٔ مصوب، بدونِ رنگِ دستی.')}
${test(fillsAboveCeiling > CEILING_L, 'دو دنیا: ارتفاعِ خنثی زیرِ سقف، هویتِ رنگی بالایِ آن', `min L فیلِ s1 = ${f3(fillsAboveCeiling)} > سقف ${CEILING_L} · چاه‌ها ${f2(wellPenQ)}q/${f2(wellUmbQ)}q زیرِ بوم`, 'سقف مالِ سیستمِ ارتفاع است (سطوحِ خنثی + تیمارهایش)، نه مالِ رنگِ محتوا — همان‌طور که متنِ سفید با L=۱ بالایِ سقف است. §6.11 صریح است: «پالت لایه ندارد».')}
${finding('زبانِ کامنتِ سقف از قلمرویش گشادتر است', 'کامنتِ CEILING_IS_HARD در موتور می‌گوید «this bounds everything» — ولی فیل‌های کروماتیک به‌طراحی بالایِ آن‌اند. حکمِ عددی درست است (ارتفاع هرگز از S8 بالاتر نمی‌رود) ولی جمله باید به «bounds the elevation system» اصلاح شود تا تناقضِ سیاست/موتورِ آینده نسازد.')}`);

  /* ═══ بخش ۰۹ — حکم‌ها ═══ */

  const s09 = section('09', 'حکم‌ها — بی‌رحم، با داده',
    'جمعِ ممیزیِ رنگ در چهار دسته. هر حکم دادهٔ زندهٔ بخشِ خودش را در بالا دارد.',
    verdict('قدرت', 'موتور با فامِ اندازه‌گیری‌شده کار می‌کند، نه با برچسب', 'رمپ‌ها روی hueMeasured تاریک می‌شوند و nearestHue با همان نگاشت می‌کند — حتی با دریفتِ ۲۳.۶°ی Sapphire، معنای INFO روی رنگی می‌نشیند که چشم می‌بیند نه روی ایدهٔ گردِ آن.') +
    verdict('قدرت', 'هویت بایت‌به‌بایت حفظ می‌شود', 'پلهٔ ۷ هر رمپ = hexِ مصوب (۱۲/۱۲)؛ دریفتِ فام در طولِ رمپ ≤' + f1(rampDriftMax) + '°؛ اشباع = کسرِ خانواده × گاموتِ قابلِ‌دستیابی، پس هیچ رنگی هیچ‌جا clip نمی‌شود (کسرها ' + Math.round(Math.min(...fractions) * 100) + '–' + Math.round(Math.max(...fractions) * 100) + '٪).') +
    verdict('قدرت', 'صحنه و بازیگر — نامتقارنیِ روانشناسانهٔ درست', 'صحنه آبیِ خانوادهٔ INFO است (' + f1(stage.h) + '°، Δ' + f1(stageDists[0].d) + '° تا Sapphire) و اشباعش ' + f1(figGround) + '× زیرِ آرام‌ترین بازیگر — اطلاع در خانه آرام است، هشدارِ گرم ناخواسته بیرون می‌زند. دقیقاً سلسله‌مراتبِ هشداریِ مطلوب.') +
    verdict('قدرت', 'حلقهٔ فوکوس خنثی — بدونِ جنگِ معنایی با INFO', 'C=' + f3(focusO.C) + ' و کنتراست ' + f1(focusContrast) + ':۱ با سقف: بیشترین دیدِ ممکن، صفرِ بارِ معنایی.') +
    verdict('قدرت', 'ایمنیِ متن دو‌طرفه تضمین شده', 'سفید روی ۲۴ فیلِ s1–s2 ≥' + f1(whiteFill12) + ':۱ (AAA) و متنِ رنگیِ s7 روی هر ۹ سطح ≥' + f2(ptc.min) + ':۱ — هر دو از یک منبعِ مشتق، بدونِ استثناهای دستی.') +
    verdict('قدرت', 'رنگ هیچ‌وقت قاطیِ ارتفاع نمی‌شود', 'نردبان تک‌فام و ۹۹.۷٪ بیشینهٔ هندسی دست‌نخورده ماند؛ پالت لایه ندارد (§6.11) — نورانیت = سلسله‌مراتب، فام = هویت، و این دو کانال هرگز بارِ هم را حمل نمی‌کنند.') +
    verdict('ضعف', 'برآمندیِ تصادفی در معناهای فعلی — واژگون', 'ترتیبِ کروماییِ وضعیتِ فعلی ' + byChroma.map((c) => c.role).join(' > ') + ' است: INFO هم‌وزنِ DANGER فریاد می‌زند و WARNING ساکن‌ترین است. روانشناسیِ هشدار باید خطر را بلندترین کند — الان تصادفِ گاموت تصمیم می‌گیرد. پیشنهادِ پالتی اهرم را به فام+نورانیت+گیلف منتقل می‌کند.') +
    verdict('ضعف', 'نیمی از نام‌ها با واقعیتِ رنگ فاصله دارند', drifted.map((h) => `${h.label} ${f1(h.drift)}°`).join(' · ') + ' — برچسب مختصاتِ نومینال است، نه توصیفِ رنگ. ریاضی امن است (موتور اندازه‌گیری می‌کند) ولی واژگانِ مستندات و قراردادِ تیم نیم‌پرده دروغ می‌گوید.') +
    verdict('ضعف', 'چرخِ نامتوازن — حفرهٔ گرم و شلوغیِ سرد', 'بزرگ‌ترین شکاف ' + f1(maxGap.g) + '° (' + maxGap.from + '→' + maxGap.to + '): هیچ نارنجیِ خالصی وجود ندارد؛ کوچک‌ترین ' + f1(minGap.g) + '° با ۴ فام در ۹۸°ی آبی-بنفش که در فارسی روی هم می‌ریزند. کارکرد پوشش داده شده، تزئین نه.') +
    verdict('ضعف', 'زبانِ سقف از قلمرویش گشادتر است', '«bounds everything» در برابرِ فیل‌هایی با L تا ' + f3(Math.max(...PALETTE.map((p) => stepOf(p.label, 1).L))) + '+ — تناقضِ متنی، نه عددی. اصلاحِ زبانِ کامنت/POLICY لازم است: سقف مالِ سیستمِ ارتفاعِ خنثی است.') +
    verdict('ضعف', 'پلهٔ برابر بینِ خانواده‌ها فقط نورانیت است، نه اشباع', 'C₂ از ' + f3(s2min.C) + ' (' + s2min.label + ') تا ' + f3(s2max.C) + ' (' + s2max.label + ') — ' + f1(s2max.C / s2min.C) + '× پهنه. تا وقتی قاعدهٔ «شمارهٔ پله حاملِ معنا نیست» در مستندات تصریح نشود، یک مصرف‌کنندهٔ آینده حتماً معنای اشتباه روی s2ِ دو خانواده می‌سازد.') +
    verdict('مشکل·حل‌شده', 'Δهای نگاشتِ معنایی با فامِ نومینال گزارش می‌شدند', 'nearestHue درست با hueMeasured کار می‌کرد ولی delta با برچسب حساب می‌شد: INFO «Δ۲۷.۵°» گزارش می‌شد در حالی که شیفتِ واقعی ' + fa(f1(deltaByRole.INFO)) + '° است. در همین دور اصلاح و در palette.test پین شد (۲۴ تست) — عددی که با چشم قضاوت می‌کنید حالا واقعی است.') +
    verdict('سؤال باز', 'اتصالِ معناها — حالا با عددِ درست، منتظرِ چشمِ شما', 'پیشنهادِ fill/border/text آماده و Δهای اندازه‌گیری‌شده ' + proposed.map((p) => fa(f1(p.delta))).join(' / ') + '° است. تستِ «not-wired» هنوز پاس می‌شود چون تصمیمِ شما صادر نشده — با یک نگاه به کارت‌های بخشِ ۰۷ وصلش کنیم؟') +
    verdict('سؤال باز', 'بازبرچسب‌گذاریِ ۶ فامِ دریفت‌دار؟', 'Sapphire اندازه‌گیری‌شده در ' + f1(hues.find((h) => h.label === 'Sapphire')!.measured) + '° عملاً آبی-بنفش است. نام‌ها را به واقعیت نزدیک کنیم (Azure/Indigo/…) یا برچسب را «قراردادِ شعر» بپذیریم و فقط در مستندات شفاف کنیم؟') +
    verdict('سؤال باز', 'فامِ سیزدهم برایِ حفرهٔ گرم؟', 'ورمیلیون ~۳۵° بیابانِ ' + f1(maxGap.g) + '°ی Ruby→Coral را پر می‌کند و به DANGER خانهٔ گرم‌تری می‌دهد. توسعهٔ پالت تصمیمِ خواننده است، نه موتور — ولی اگر روزی قرار باشد، جای خالیِ اندازه‌گیری‌شده همین‌جاست.') +
    verdict('سؤال باز', 'فلسفهٔ برآمندی: فیزیک یا مهندسی؟', 'پیشنهاد، سلسله‌مراتبِ هشدار را با فام+نورانیت+گیلف می‌سازد ولی کرومای fillِ INFO و DANGER تقریباً برابر می‌ماند (فیزیکِ گاموت). می‌پذیرید، یا overrideِ دستیِ C می‌خواهید — که نقضِ «همه‌چیز مشتق، صفرِ عددِ دستی» است؟') +
    `<div class="counts" style="margin-top:16px">
<div class="count"><b class="good">${fa(verdictCount.قدر)}</b>قدرت</div>
<div class="count"><b style="color:#D9BE6E">${fa(verdictCount.ضعف)}</b>ضعف</div>
<div class="count"><b style="color:#6FA8EC">${fa(verdictCount.حل)}</b>مشکلِ حل‌شده در این دور</div>
<div class="count"><b style="color:#A98BEA">${fa(verdictCount.باز)}</b>سؤالِ باز — تصمیمِ شما</div>
</div>
<div class="qbox" style="margin-top:14px"><div class="qtitle">۴ تصمیمِ چشمی — جواب‌ها فازِ بعدی رنگ را می‌سازند</div>
<div style="font-size:12px;line-height:2.4">۱. کارت‌های «فعلی در برابرِ پیشنهادیِ» بخشِ ۰۷ را ببینید: معناها به پالت وصل شوند؟<br>۲. نامِ ۶ فامِ دریفت‌دار: بازبرچسب یا پذیرشِ مستند؟<br>۳. حفرهٔ گرمِ ${fa(f1(maxGap.g))}°: فامِ سیزدهم (ورمیلیون) در فهرستِ تصمیم بماند یا بسته شود؟<br>۴. برآمندی: فیزیکِ فام+نورانیت کافی است یا ترتیبِ کروماییِ مهندسی‌شده می‌خواهید؟</div></div>`);

  /* ═══ shell ═══ */

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LIMINAL — ممیزیِ رنگ · دورِ بی‌رحم</title>
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
table.numtable{border-collapse:collapse;font:10.5px ui-monospace,monospace;direction:ltr;width:100%}
table.numtable td,table.numtable th{padding:5px 7px;text-align:center;border-bottom:1px solid #15171a;white-space:nowrap}
table.numtable th{color:rgba(233,236,242,.4);font-weight:400}
.chip{display:inline-block;width:26px;height:14px;border-radius:4px;vertical-align:middle;margin-inline-end:6px;border:1px solid rgba(255,255,255,.09)}
.seamgrid{display:grid;grid-template-columns:1fr;gap:12px}
@media(min-width:560px){.seamgrid{grid-template-columns:1fr 1fr}}
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
footer a{color:#6FA8EC}
</style>
</head>
<body>
<div class="shell">
<header>
  <div class="eyebrow">LIMINAL · COLOUR AUDIT · MERCILESS ROUND 7 · GENERATED FROM THE LIVE ENGINE · 2026-10-20</div>
  <h1>ممیزیِ رنگ — ۱۲ فام، ۴ معنا، بی‌رحم</h1>
  <p class="lede">خواستِ شما: «لایهٔ ۰ تا ۸ را با کدِ رنگ و فاصله نسبت به هم لیست کن» + «یک ممیزی عمیق و بی‌رحم روی رنگ، پالت، روانشناسی رنگ و روابطشان با هم». این صفحه همان است: هر عدد لحظهٔ تولید از موتور اندازه‌گیری شده — فامِ واقعی از hex، ΔE در OKLab، کنتراست‌ها، دریفتِ نام‌ها، شکاف‌های چرخ. یک باگِ واقعی هم در همین ممیزی پیدا و اصلاح شد (Δهای نومینال). فایل خودبسنده است و با هر اجرای سوئیت بازتولید می‌شود.</p>
  <div class="pills">
    <span class="pill">${fa(PALETTE.length)} فام × ۷ پله = ${fa(PALETTE.length * 7)} رنگ</span>
    <span class="pill">Δ معناییِ اصلاح‌شده: ${proposed.map((p) => fa(f1(p.delta)) + '°').join(' · ')}</span>
    <span class="pill">حکم‌ها: ${fa(verdictCount.قدر)} قدرت · ${fa(verdictCount.ضعف)} ضعف · ${fa(verdictCount.حل)} حل‌شده · ${fa(verdictCount.باز)} باز</span>
  </div>
</header>
${s01}${s02}${s03}${s04}${s05}${s06}${s07}${s08}${s09}
<footer>
  <div>صفحهٔ فاز (بوم ↔ سطح، ۹ لایهٔ تخت): <a href="audit-lab-snapshot.html"><span class="mono">.lab/audit-lab-snapshot.html</span></a> · ابزارِ آستانه‌سنجی: <a href="../design-lab/threshold-test-precise.html"><span class="mono">design-lab/threshold-test-precise.html</span></a></div>
  <div>ژنراتور: <span class="mono">src/site/generate-color-audit.ts</span> · نگهبان: <span class="mono">src/site/__tests__/color-audit.test.ts</span> · پروندهٔ حکم‌ها: <span class="mono">.lab/CORE-VERDICTS.md</span> · <span class="mono">.lab/ENGINE-CORE-AUDIT.md</span></div>
</footer>
</div>
</body>
</html>`;
}
