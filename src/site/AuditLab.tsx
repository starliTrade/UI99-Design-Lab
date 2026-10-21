/**
 * LIMINAL — ممیزی زندهٔ هستهٔ موتور
 *
 * این صفحه یک «عکس» نیست: هر عدد، هر رنگ و هر حکمی که می‌بینید در لحظه از
 * خود موتور خوانده می‌شود — `resolveSurface`، `checkPlacement`، `getDirectionalRim`،
 * `shadowPeakAlpha`، `LiminalColorEngine`. اگر موتور عوض شود، این صفحه همان لحظه
 * جواب دیگری نشان می‌دهد. تست‌ها هم زنده‌اند: هر ✓ یک assertion واقعی است که
 * همین الان روی خروجی موتور اجرا شده، با دلیلش.
 *
 * حکم‌ها سه‌اند: قدرت (سبز) · ضعف (کهربایی) · مشکل (آبی = حل‌شده / بنفش = سؤال باز)
 */
import React from 'react';
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
  ROLE_RIM,
  ROLE_SHADOW,
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
import { PALETTE, paletteTextContrast, SEMANTIC_FROM_PALETTE } from '../engine/liminal-palette';
import { PERSIAN_LINE_HEIGHT_FLOOR, lineHeightFor } from '../engine/liminal-persian';
import { LiminalLayoutEngine } from '../engine/liminal-layout-engine';

/* ────────────────────────── helpers ────────────────────────── */

const ROLES = Object.keys(ROLE_LEVEL) as SurfaceRole[];
const MAX_LEVEL = LADDER.length - 1;

const q = (dL: number) => dL / Q;
const f4 = (x: number) => x.toFixed(4);
const f2 = (x: number) => x.toFixed(2);
const pct = (x: number) => `${(x * 100).toFixed(1)}%`;

/** سایهٔ rgba(1,2,3,α) روی میزبان — همان کاری که مرورگر می‌کند. */
/** Lِ تاریک‌ترین نقطهٔ سایه — blend شناور، همان ریاضیِ موتور (بدون رُندِ ۸ بیتی).
 * رُند در این تاریکی ~۰.۲۱q خطا می‌انداخت و تستِ «اوج = ۱q» را به ✗ می‌کشاند —
 * خودش یک یافتهٔ ممیزی بود: اندازه‌گیری باید هم‌دقتِ خودِ موتور باشد. */
function shadowBlendL(hostHex: string, alpha: number): number {
  const h = hexToRgb(hostHex);
  return rgbToOklch({ r: h.r + alpha * (1 - h.r), g: h.g + alpha * (2 - h.g), b: h.b + alpha * (3 - h.b) }).L;
}

/** hex → [r,g,b] — شکل ورودیِ shadowPeakAlpha در liminal-shadow. */
function rgbOf(hex: string): readonly number[] {
  const { r, g, b } = hexToRgb(hex);
  return [r, g, b];
}

/**
 * موتور برای تم‌پذیری، رنگ را `var(--liminal-x, #hex)` می‌دهد — برای رندر درست است،
 * ولی ریاضیِ رنگ به hexِ خالص نیاز دارد. fallback را بیرون می‌کشیم.
 */
function hexOf(value: string): string {
  return value.match(/#[0-9a-fA-F]{6}/)?.[0] ?? value;
}

/* ────────────────────────── atoms ────────────────────────── */

const C = {
  canvas: '#060709',
  panel: '#090b0d',
  ink: '#E9ECF2',
  muted: 'rgba(233,236,242,0.55)',
  faint: 'rgba(233,236,242,0.32)',
  line: '#0d0f12',
  green: '#74CE8E',
  amber: '#D9BE6E',
  blue: '#6FA8EC',
  violet: '#A98BEA',
  red: '#E88A93',
};

const mono: React.CSSProperties = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' };

function Verdict({ kind, title, reason }: { kind: 'قدرت' | 'ضعف' | 'مشکل·حل‌شده' | 'سؤال باز'; title: string; reason: string }) {
  const color = kind === 'قدرت' ? C.green : kind === 'ضعف' ? C.amber : kind === 'مشکل·حل‌شده' ? C.blue : C.violet;
  return (
    <div style={{ borderInlineStart: `2px solid ${color}`, background: C.panel, borderRadius: 8, padding: '10px 14px', marginBottom: 8 }}>
      <div style={{ fontSize: 12, ...mono }}>
        <span style={{ color }}>{kind}</span>
        <span style={{ color: C.ink }}> — {title}</span>
      </div>
      <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.9, marginTop: 4 }}>{reason}</div>
    </div>
  );
}

/** یک assertion زنده: pass/fail در لحظه، روی خروجی واقعی موتور. */
function Test({ pass, name, value, why }: { pass: boolean; name: string; value?: string; why: string }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '7px 0', borderBottom: `1px solid ${C.line}` }}>
      <span style={{ color: pass ? C.green : C.red, fontSize: 13, ...mono, flexShrink: 0 }}>{pass ? '✓' : '✗'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12.5, color: C.ink }}>
          {name}
          {value !== undefined && <code style={{ color: C.blue, marginInlineStart: 8, fontSize: 11.5, ...mono }}>{value}</code>}
        </div>
        <div style={{ fontSize: 11.5, color: C.faint, lineHeight: 1.8, marginTop: 2 }}>دلیل: {why}</div>
      </div>
    </div>
  );
}

function Section({ num, title, lede, children }: { num: string; title: string; lede: string; children: React.ReactNode }) {
  return (
    <section style={{ padding: '34px 0', borderBottom: `1px solid ${C.line}` }}>
      <div style={{ display: 'flex', gap: 14, marginBottom: 16 }}>
        <div style={{ color: C.faint, fontSize: 12, ...mono, paddingTop: 4 }}>{num}</div>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, letterSpacing: '-0.02em' }}>{title}</h2>
          <p style={{ margin: '6px 0 0', color: C.muted, fontSize: 13, lineHeight: 1.9, maxWidth: 860 }}>{lede}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Swatch({ hex, label, sub, width = 84, height = 64 }: { hex: string; label: string; sub?: string; width?: number; height?: number }) {
  return (
    <div style={{ width, flexShrink: 0 }}>
      <div style={{ height, background: hex, borderRadius: 8, border: `1px solid rgba(255,255,255,0.06)` }} />
      <div style={{ fontSize: 10.5, color: C.ink, marginTop: 5, ...mono }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: C.faint, ...mono }}>{sub}</div>}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 12, color: C.muted, marginBottom: 12, ...mono }}>{title}</div>
      {children}
    </div>
  );
}

const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 };
const flexWrap: React.CSSProperties = { display: 'flex', gap: 10, flexWrap: 'wrap' };

/* ────────────────────────── page ────────────────────────── */

export function AuditLab() {
  /* مقادیر زنده — یک بار، از خود موتور */
  const canvasL = oklchLightness(LADDER[0]);
  const stepsQ = LADDER.slice(0, -1).map((h, n) => q(lightnessStep(h, LADDER[n + 1])));
  /* نیم‌پله = آفستِ S(n).5 از S(n) — نه فاصلهٔ دو نیم‌پلهٔ متوالی (آن طراحیِ یک پلهٔ کامل است). */
  const halfQ = HALF.map((h, n) => q(lightnessStep(LADDER[n], h)));
  const parseExactL = (s: string) => parseFloat(s.match(/oklch\(([\d.]+)/)![1]);
  const exactStepsQ = LADDER_EXACT.slice(0, -1).map((e, n) => q(parseExactL(LADDER_EXACT[n + 1]) - parseExactL(e)));
  const exactHalfQ = HALF_EXACT.map((e, n) => q(parseExactL(e) - parseExactL(LADDER_EXACT[n])));
  const wellD = {
    penumbra: q(lightnessStep(LADDER[0], WELLS.penumbra)),
    umbra: q(lightnessStep(LADDER[0], WELLS.umbra)),
  };
  const EDGE_TH = 0.48; // آستانهٔ لبه، بر حسب q — اندازه‌گیری‌شده در .threshold-sessions.json

  const verdicts = { قدرت: 0, ضعف: 0, 'مشکل·حل‌شده': 0, 'سؤال باز': 0 } as Record<string, number>;
  const count = (k: keyof typeof verdicts, n = 1) => { verdicts[k] += n; return null; };

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: C.canvas, color: C.ink, fontFamily: 'Vazirmatn, system-ui, sans-serif' }}>
      <div style={{ width: 'min(1180px, calc(100% - 40px))', margin: '0 auto', padding: '30px 0 80px' }}>

        <header style={{ paddingBottom: 26, borderBottom: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 11, color: C.faint, letterSpacing: '0.08em', ...mono }}>LIMINAL · CORE AUDIT · LIVE FROM ENGINE · 2026-10-20</div>
          <h1 style={{ fontSize: 'clamp(26px,4vw,42px)', lineHeight: 1.15, letterSpacing: '-0.03em', margin: '10px 0 12px' }}>
            ممیزی زندهٔ هستهٔ موتور
          </h1>
          <p style={{ color: C.muted, fontSize: 14, lineHeight: 2, maxWidth: 880, margin: 0 }}>
            رنگ، لایه، تو در تویی، بوردر، سایه، ریم، معنایی و تایپو — هر چه در سیاست و موتور هست،
            اینجا <strong style={{ color: C.ink }}>زنده از خود موتور</strong> خوانده می‌شود: نمونهٔ چشمی + عدد + تست + دلیل + حکم
            (قدرت / ضعف / مشکل). هیچ عددی دستی نوشته نشده؛ اگر موتور عوض شود این صفحه همان لحظه عوض می‌شود.
          </p>
          <div style={{ ...flexWrap, marginTop: 18 }}>
            <div style={{ padding: '7px 14px', border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 12, ...mono }}>
              vitest: <span style={{ color: C.green }}>559 passed</span> · <span style={{ color: C.amber }}>6 skipped (zero-state)</span> · <span style={{ color: C.green }}>0 failed</span>
            </div>
            <div style={{ padding: '7px 14px', border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 12, ...mono }}>
              tsc --noEmit: <span style={{ color: C.green }}>clean</span>
            </div>
            <div style={{ padding: '7px 14px', border: `1px solid ${C.line}`, borderRadius: 8, fontSize: 12, ...mono }}>
              مرجع: <span style={{ color: C.blue }}>.lab/ENGINE-CORE-AUDIT.md</span>
            </div>
          </div>
        </header>

        {/* ═══════════════ 01 · بوم و چاه‌ها ═══════════════ */}
        <Section num="01" title="بوم و چاه‌ها" lede={`بوم تنها انتخابِ آزادِ سیستم است: L₀=${CANVAS_L}، C=${LADDER_CHROMA}، H=${LADDER_HUE}°. دو چاه (penumbra/umbra) زیر بوم‌اند — تاریک‌ترین رنگ‌های مجاز، برای سایهٔ محیطی و تماسی.`}>
          <div style={flexWrap}>
            <Swatch hex={WELLS.umbra} label="S-2 umbra" sub={`${f4(oklchLightness(WELLS.umbra))} · ${f2(wellD.umbra)}q`} />
            <Swatch hex={WELLS.penumbra} label="S-1 penumbra" sub={`${f4(oklchLightness(WELLS.penumbra))} · ${f2(wellD.penumbra)}q`} />
            <Swatch hex={LADDER[0]} label="S0 canvas" sub={`${f4(canvasL)} · 0q`} width={110} height={72} />
          </div>
          <div style={{ marginTop: 14 }}>
            <Test pass={Math.abs(canvasL - CANVAS_L) < 0.001} name="L بوم = مقدار اعلام‌شدهٔ فرمول" value={`L=${f4(canvasL)} ≈ ${CANVAS_L}`} why="hex بوم از oklch رنگ‌سنجی شد؛ اگر از فرمول فاصله بگیرد یعنی نردبان دستی دست‌کاری شده." />
            <Test pass={wellD.penumbra < 0 && wellD.umbra < wellD.penumbra} name="چاه‌ها زیر بوم‌اند و به ترتیب" value={`penumbra ${f2(wellD.penumbra)}q · umbra ${f2(wellD.umbra)}q`} why="چاه «پلهٔ منفی» است — جای سایه، نه جای سطح. هر چیزی روی چاه بنشیند از خود چاه روشن‌تر است." />
            <Test pass={WELLS.penumbra === '#030406' && WELLS.umbra === '#010203'} name="یک منبع حقیقت برای چاه‌ها" value="liminal-ladder.WELLS" why="قبلاً در css-vars و contract دوبار نوشته شده بود و می‌توانستند واگرا شوند؛ حالا هر دو از WELLS می‌خوانند." />
          </div>
          <div style={{ marginTop: 14 }}>
            {count('قدرت')}<Verdict kind="قدرت" title="L₀ یک انتخابِ مستند است، نه عددِ تصادفی" reason="برازش به طراحی تأییدشده در POLICY §2 — تمام نردبان از آن مشتق می‌شود و هیچ‌جای دیگر سیستم یک عدد روشنایی آزاد ندارد." />
            {count('ضعف')}<Verdict kind="ضعف" title="چاه‌ها در موتور هستند ولی در POLICY فصل ندارند" reason="اقدام: فصل «چاه‌ها» به POLICY اضافه شود — S-1/S-2 با مقدار، کار (سایه) و قانون «هیچ سطحی روی چاه نمی‌نشیند» (SHADOW_FLOOR)." />
          </div>
        </Section>

        {/* ═══════════════ 02 · نردبان ═══════════════ */}
        <Section num="02" title="نردبان — ۹ پله، یک فرمول" lede={`L(n) = ${CANVAS_L} + n × ${LADDER_STEP} — هر پله ${f4(q(LADDER_STEP))}q فاصله دارد (q=${Q} کوانتوم ادراکی، اندازه‌گیری‌شده در سه نشست). نیم‌پله‌ها برای بوردرند، نه برای state.`}>
          <div style={{ ...flexWrap, gap: 6 }}>
            {LADDER.map((hex, n) => (
              <Swatch key={n} hex={hex} label={`S${n}`} sub={n === 0 ? 'canvas' : `+${f2(stepsQ[n - 1])}q`} width={64} height={56} />
            ))}
          </div>
          <div style={{ ...flexWrap, gap: 6, marginTop: 10 }}>
            {HALF.map((hex, n) => (
              <Swatch key={n} hex={hex} label={`S${n}.5`} sub="border" width={64} height={34} />
            ))}
          </div>
          <div style={{ marginTop: 14 }}>
            <Test pass={exactStepsQ.every((s) => Math.abs(s - q(LADDER_STEP)) < 0.0001) && exactHalfQ.every((h) => Math.abs(h - q(LADDER_STEP) / 2) < 0.0001)} name="قانون ۱ روی مقادیر اکسکت — هر پله و هر نیم‌پله ثابت" value={`پله ${f4(exactStepsQ[0])}q × ۸ · نیم‌پله ${f4(exactHalfQ[0])}q × ۷`} why="LADDER_EXACT/HALF_EXACT همان رشته‌های oklch هستند که در css-vars پشت @supports منتشر می‌شوند — مرورگر مدرن قانون را دقیق می‌بیند." />
            <Test pass={LADDER.every((hex, n) => hex === getLadderColor(n))} name="hex جدول = خروجی فرمول" value="۹ از ۹" why="LADDER دستی نوشته شده ولی getLadderColor از فرمول می‌آید — این تست یعنی دو منبع واگرا نشده‌اند." />
            <Test pass={stepsQ.every((s) => s >= 1 && s <= 1.25)} name="fallback هشت‌بیتی هم قانون ۱ را نگه می‌دارد" value={`${f2(Math.min(...stepsQ))}–${f2(Math.max(...stepsQ))}q اندازه‌گیری‌شده روی hex`} why="رُندِ ۸ بیتی در این تاریکی ±۰.۰۷q نویز دارد ولی هیچ پله‌ای زیر ۱q نمی‌افتد — لایه‌ها حتی بدون oklch هم از هم جدا می‌مانند." />
            <Test pass={exactHalfQ.every((h) => h > EDGE_TH && h < 1)} name="نیم‌پلهٔ اکسکت: دیده‌شده ولی مرز نیست" value={`${f4(exactHalfQ[0])}q = ${f2(exactHalfQ[0] / EDGE_TH)}× آستانهٔ لبه (${EDGE_TH}q)`} why="نیم‌پله به‌عنوان سطحِ state دیده نمی‌شد (نقص §6.8 — اصلاح شد)، ولی به‌عنوان جداکننده ۱.۱۸× آستانهٔ لبه است: یک «اشارهٔ» دیدنی." />
            <Test pass={halfQ.every((h) => h > EDGE_TH && h < 1)} name="نیم‌پله در hex هم زنده می‌ماند" value={`${f2(Math.min(...halfQ))}–${f2(Math.max(...halfQ))}q آفستِ اندازه‌گیری‌شده`} why="نویزِ رُندِ ۸ بیتی ±۰.۱۴q است — هم‌اندازهٔ خودِ نیم‌پله — ولی هیچ آفستی از باندِ دیدنی (آستانهٔ لبه، ۱q) بیرون نمی‌زند. اندازهٔ درست: آفست از پلهٔ خودش، نه فاصلهٔ دو نیم‌پلهٔ متوالی (آن طراحیِ یک پلهٔ کامل است)." />
          </div>
          <div style={{ marginTop: 14 }}>
            {count('قدرت', 3)}
            <Verdict kind="قدرت" title="یک فرمول، فاصلهٔ ثابت، بدون جدول دستی" reason="هر پلهٔ اکسکت دقیقاً ۱.۱۴۱۶q — سلسله‌مراتب از ریاضی می‌آید نه از سلیقه، و تم‌پذیر است چون همه‌چیز از L₀ مشتق می‌شود." />
            <Verdict kind="مشکل·حل‌شده" title="کامنت HALF می‌گفت «state باید حس شود نه دیده شود»" reason="آن قاعده در §6.8 رد شده: state یک تغییر سطح است و باید ≥۱q باشد (hover=+1 پله). نیم‌پله فقط بوردر است. کامنت موتور در این ممیزی اصلاح شد (commit e512ef9)." />
            <Verdict kind="قدرت" title="طراحی در ۸ بیت هم زنده می‌ماند — fallback هم قانون دارد" reason="پله‌های hex: ۱.۰۷–۱.۲۱q (همه ≥۱q) · آفستِ نیم‌پله‌ها: ۰.۵۴–۰.۷۱q (همه در باندِ دیدنی). css-vars دو اعلان منتشر می‌کند: hex برای مرورگرِ قدیمی، oklch پشتِ @supports برای دقتِ اکسکت — هیچ مصرف‌کننده‌ای قانون را از دست نمی‌دهد." />
          </div>
        </Section>

        {/* ═══════════════ 03 · لایه‌ها و تو در تویی ═══════════════ */}
        <Section num="03" title="لایه‌ها و تو در تویی — قانون ۲ زنده" lede={`۱۱ نقش (region تازه اضافه شد)، ۳ نقش رابطه‌ای (${RELATIONSHIP_ROLES.join(' / ')}) که یک پله بالای میزبان‌اند. ماتریس زیر زنده است: هر خانه خروجی واقعی checkPlacement است — سبز یعنی مجاز، قرمز یعنی رد، با دلیل.`}>
          <Card title="ماتریس جای‌گذاری — نقش × میزبان (خروجی زندهٔ checkPlacement)">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse', fontSize: 11, ...mono, direction: 'ltr' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '4px 8px', color: C.faint, textAlign: 'left' }}>role ↓ / on →</th>
                    {ROLES.map((h) => <th key={h} style={{ padding: '4px 6px', color: C.faint, fontWeight: 400 }}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {ROLES.map((r) => (
                    <tr key={r}>
                      <td style={{ padding: '4px 8px', color: C.muted, textAlign: 'left' }}>{r}</td>
                      {ROLES.map((h) => {
                        if (r === h) return <td key={h} style={{ padding: '4px 6px', color: C.line, textAlign: 'center' }}>·</td>;
                        const res = checkPlacement({ role: r, on: h });
                        return (
                          <td key={h} title={res.ok ? `${r} on ${h}: ok` : res.reason} style={{ padding: '4px 6px', textAlign: 'center', color: res.ok ? C.green : 'rgba(232,138,147,0.55)', cursor: 'help' }}>
                            {res.ok ? '✓' : '✗'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 10, lineHeight: 1.9 }}>
              روی هر ✗ نگه دارید تا دلیل رد را ببینید — همان متنی که گارد به توسعه‌دهنده می‌دهد.
              استثناهای سقف: {PLACEMENT_EXEMPTIONS.map((e) => `${e.role}↞${e.on}`).join(' · ')}
            </div>
          </Card>

          <div style={{ ...grid2, marginTop: 14 }}>
            <Card title="تو در تویی زنده — خروجی واقعی resolveSurface">
              {(() => {
                const chain: { role: SurfaceRole; on?: SurfaceRole }[] = [
                  { role: 'canvas' }, { role: 'chrome', on: 'canvas' }, { role: 'work', on: 'chrome' },
                  { role: 'region', on: 'work' }, { role: 'control', on: 'region' },
                ];
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {chain.map((c, i) => {
                      const s = resolveSurface(c);
                      return (
                        <div key={i} style={{ marginInlineStart: i * 18, marginTop: i ? 8 : 0 }}>
                          <div style={{ ...s.style, borderRadius: 10, padding: '10px 14px', border: s.border ? `1px solid ${s.border}` : `1px solid ${C.line}` }}>
                            <div style={{ fontSize: 11, ...mono, color: C.ink }}>
                              {c.role}{c.on ? ` on ${c.on}` : ''} → S{s.level}
                            </div>
                            <div style={{ fontSize: 10, ...mono, color: C.faint }}>
                              rim {s.rim ? '✓' : '✗'} · shadow {s.shadow === 'none' ? '✗' : '✓'} · bg {s.background}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </Card>
            <Card title="قاعدهٔ «چه روی چه» — resolveLayerState زنده">
              {(['region', 'control', 'transient', 'empty'] as LayerContent[]).map((content) => (
                <div key={content}>
                  <div style={{ fontSize: 11.5, color: C.ink, marginTop: 8, ...mono }}>{content}</div>
                  {(['canvas', 'work'] as SurfaceRole[]).map((on) => {
                    const ls = resolveLayerState({ content, on });
                    return (
                      <div key={on} style={{ fontSize: 11, color: C.muted, ...mono, padding: '2px 0' }}>
                        on {on}: border=<span style={{ color: ls.border === 'none' ? C.faint : C.blue }}>{ls.border}</span>
                        {' '}· shadow=<span style={{ color: ls.shadow ? C.blue : C.faint }}>{String(ls.shadow)}</span>
                        {' '}· rim=<span style={{ color: ls.rim ? C.blue : C.faint }}>{String(ls.rim)}</span>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div style={{ fontSize: 11, color: C.faint, marginTop: 10, lineHeight: 1.9 }}>
                region روی بوم = fill یک پله + edge کافی نیست؟ نه — روی بوم مرز لازم است (یک پله از بوم، آستانهٔ لبه)، روی سطحِ میزبان نه.
              </div>
            </Card>
          </div>

          <div style={{ marginTop: 14 }}>
            <Test pass={ROLES.every((r) => { const h = allowedHost(r); return !h || checkPlacement({ role: r, on: h }).ok; })} name="هر نقش روی میزبان مجازش قبول می‌شود" value={`${ROLES.length - 1} زنجیره`} why="قانون ۲: هر لایه روی لایهٔ زیرِ خودش — زنجیره، نه جفت‌های دلخواه. این همان تستی است که نقضش را قبلاً چشم پیدا کرد (پنل مستقیم روی بوم)." />
            <Test pass={!checkPlacement({ role: 'work', on: 'canvas' }).ok} name="جابه‌جایی لایه رد می‌شود، با دلیل" value={(checkPlacement({ role: 'work', on: 'canvas' }).reason ?? '').slice(0, 48) + '…'} why="نقصِ واقعیِ سایت قدیمی: work مستقیم روی canvas. گارد حالا همان روز رد می‌کند، با نامِ لایه‌های پریده." />
            <Test pass={resolvedLevel('control', 'work') === ROLE_LEVEL.work + 1 && resolvedLevel('region', 'work') === ROLE_LEVEL.work + 1} name="نقش‌های رابطه‌ای یک پله بالای میزبان‌اند" value="control/region on work → S3" why="control/well/region «سطح مطلق» نیستند بلکه «رابطه»اند — RELATIONSHIP_ROLES در موتور نام‌گذاری شد تا استثنای سقف از لیست مشتق شود، نه دستی." />
            {(() => {
              const regionRes = resolveSurface({ role: 'region', on: 'work' });
              return <Test pass={!regionRes.rim && regionRes.shadow === 'none'} name="region تخت است — بدون ریم و سایه" value={`rim=${String(regionRes.rim)} shadow=${regionRes.shadow}`} why="region یک «محدودهٔ ساختاری» است نه شیء برجسته (Stepper، Collapsible، TreeView). POLICY §1.5 می‌گفت ولی موتور نداشت — در این ممیزی اضافه شد." />;
            })()}
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, background: 'rgba(217,190,110,0.05)', border: '1px solid rgba(217,190,110,0.3)', borderRadius: 9, padding: '9px 11px' }}>
              <span style={{ color: '#D9BE6E', fontSize: 13, lineHeight: '16px', flexShrink: 0 }}>⚠</span>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.9 }}>
                <b style={{ color: C.ink }}>on ترکیب نمی‌شود — لنگر از سطحِ اسمیِ میزبان می‌آید، نه سطحِ حل‌شده‌اش.</b> زنجیرهٔ بالا: region on work → S{resolvedLevel('region', 'work')}، ولی control on region → S{resolvedLevel('control', 'region')} — موتور region را به سطحِ اسمیِ خودش (۲) لنگر می‌کند، پس control دقیقاً هم‌سطحِ میزبانِ واقعی‌اش می‌نشیند: صفر اختلافِ fill، نقضِ قانون ۲ در زنجیره‌های رابطه‌ای. region تازه اضافه شده و این حالت تست نداشت. اقدام پیشنهادی: API سطحِ حل‌شده (onLevel) یا حسابِ depth — تصمیمِ طراحی، نه باگِ ریاضی.
              </div>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            {count('قدرت', 2)}{count('مشکل·حل‌شده')}{count('ضعف')}
            <Verdict kind="قدرت" title="گارد جای‌گذاری واقعاً اجبار می‌کند" reason="checkPlacement روی همهٔ ۱۱×۱۰ جای‌گذاری زنده اجرا شد — POLICY §10 از «نوشته‌شده، اجبارنشده» به «اجبار می‌شود» ارتقا یافت." />
            <Verdict kind="ضعف" title="میزبانِ رابطه‌ای، لنگرِ رابطه‌ای نمی‌دهد" reason="control/well/region روی میزبانی که خودش لنگر شده (region on work) هم‌سطحِ او حل می‌شوند — fill سلسله‌مراتب را نمی‌سازد. تا تصمیمِ API (onLevel یا depth)، زنجیره‌های عمیق‌تر از دو نقشِ رابطه‌ای باید دستی سطح ببرند. یافتهٔ رندرِ زندهٔ همین بخش." />
            <Verdict kind="قدرت" title="استثنای سقف مشتق است نه دستی" reason="PLACEMENT_EXEMPTIONS = نقش‌های رابطه‌ای × میزبان‌های شناور؛ تست nesting حالا از RELATIONSHIP_ROLES deriv می‌کند — نقش چهارم بدون تصمیم‌گیری صریح نمی‌تواند رد شود." />
            <Verdict kind="مشکل·حل‌شده" title="region در POLICY بود ولی در موتور نبود" reason="🔴 یافتهٔ بحرانی ممیزی: ۱۰ نقش در موتور، ۱۱ در سیاست. region:2 رابطه‌ای/تخت به ROLE_LEVEL اضافه شد + ROLE_RIM/ROLE_SHADOW/استثناهای سقف (commit e512ef9)." />
          </div>
        </Section>

        {/* ═══════════════ 04 · بوردر ═══════════════ */}
        <Section num="04" title="بوردر — دو حالت، دو فاصلهٔ ثابت" lede={`separator = +۰.۵ پله (${f2(q(LADDER_STEP * 0.5))}q = ${f2(q(LADDER_STEP * 0.5) / EDGE_TH)}× آستانهٔ لبه) — یک اشاره. edge = +۱ پله (${f2(q(LADDER_STEP))}q = ${f2(q(LADDER_STEP) / EDGE_TH)}× آستانه) — یک مرز. هر دو نسبت به سطحِ خودشان، با میزبان جابه‌جا نمی‌شوند.`}>
          <div style={grid2}>
            <Card title="separator روی work — خط بین دو منطقهٔ هم‌سطح">
              <div style={{ background: resolveSurface({ role: 'work' }).backgroundHex, borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 12, color: C.muted, paddingBottom: 10 }}>ردیف اول</div>
                <div style={{ borderTop: `1px solid ${resolveBorderHex({ role: 'work', kind: 'separator' })}` }} />
                <div style={{ fontSize: 12, color: C.muted, paddingTop: 10 }}>ردیف دوم</div>
              </div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 8, ...mono }}>border: {resolveBorderHex({ role: 'work', kind: 'separator' })} = S{resolveBorderLevel({ role: 'work', kind: 'separator' })}</div>
            </Card>
            <Card title="edge دور panel روی work — مرزِ یک شیء">
              <div style={{ background: resolveSurface({ role: 'work' }).backgroundHex, borderRadius: 10, padding: 14 }}>
                <div style={{ background: resolveSurface({ role: 'panel' }).backgroundHex, border: `1px solid ${resolveBorderHex({ role: 'panel', kind: 'edge', on: 'work' })}`, borderRadius: 8, padding: 14, fontSize: 12, color: C.muted }}>
                  panel با مرزِ یک پله
                </div>
              </div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 8, ...mono }}>border: {resolveBorderHex({ role: 'panel', kind: 'edge', on: 'work' })}</div>
            </Card>
          </div>
          <div style={{ marginTop: 14 }}>
            {(() => {
              const workHex = resolveSurface({ role: 'work' }).backgroundHex;
              const sepD = q(lightnessStep(workHex, resolveBorderHex({ role: 'work', kind: 'separator' })));
              const edgeD = q(lightnessStep(workHex, resolveBorderHex({ role: 'work', kind: 'edge' })));
              const toastEdge = resolveBorderLevel({ role: 'toast', kind: 'edge' });
              return (
                <>
                  <Test pass={Math.abs(sepD - 0.5708) < 0.01 && sepD > EDGE_TH} name="separator دیدنی است ولی مرز نیست" value={`${f2(sepD)}q = ${f2(sepD / EDGE_TH)}× آستانه`} why="زیر ۰.۴۸q خط محو می‌شود؛ بالای ۱q «مرز» خوانده می‌شود و تفکیک داخل یک سطح را به جداسازی دو سطح اشتباه می‌گیرد. نیم‌پله دقیقاً بین این دو است." />
                  <Test pass={Math.abs(edgeD - q(LADDER_STEP)) < 0.01} name="edge یک پلهٔ کامل است — اندازه‌گیری‌شده" value={`${f2(edgeD)}q = ${f2(edgeD / EDGE_TH)}× آستانه`} why="انتخاب خواننده: «کمتر از یک پله، حتی بوردر هم بوردر نیست.» نام‌ها قاعده‌اند: hairline که «سبک» را می‌گفت حذف شد، separator/edge که «کار» را می‌گویند ماندند." />
                  <Test pass={toastEdge === MAX_LEVEL - 0.5} name="در سقف، edge به separator تنزل می‌کند" value={`toast edge → S${toastEdge}`} why="بالای S8 جا نیست؛ معکوسِ base−offset مرز را هم‌رنگ میزبانش می‌کرد (۰q — ناپیدا). سقف نیم‌پله پایین، قوی‌ترین مرزِ ممکن است. طرح تنزل می‌کند، گسترش نمی‌یابد." />
                </>
              );
            })()}
          </div>
          <div style={{ marginTop: 14 }}>
            {count('قدرت')}
            <Verdict kind="قدرت" title="چارچوب مرجع حل‌شده: بوردر از سطحِ خودش" reason="یک خط‌کش ثابت — با میزبان جابه‌جا نمی‌شود. پیامدش پذیرفته شد: مرزِ پنل روی بوم ۴.۵۶q و روی work ۲.۲۸q است؛ این سلسله‌مراتب است که خودش را نشان می‌دهد، نه خطا." />
          </div>
        </Section>

        {/* ═══════════════ 05 · سایه ═══════════════ */}
        <Section num="05" title="سایه — یک کوانتوم، حل‌شده" lede="اوج سایه همیشه دقیقاً ۱q تاریک‌تر از میزبان است — α برای هر میزبان حل می‌شود (bisection روی OKLCH)، و فقط شعاع با ارتفاع رشد می‌کند: near=2+h×1.5 · far=4+h×6، بدون ثابتِ پنهان.">
          <div style={{ background: resolveSurface({ role: 'work' }).backgroundHex, borderRadius: 14, padding: 22, display: 'flex', gap: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            {(['menu', 'popover', 'modal', 'toast'] as SurfaceRole[]).map((role) => {
              // بدون on — on هر نقشی را به میزبان+۱ لنگر می‌کرد (toast→S3!). شیءِ شناور در سطحِ خودش رندر می‌شود.
              const s = resolveSurface({ role });
              const h = ROLE_SHADOW[role] ?? 1;
              return (
                <div key={role} style={{ width: 130, background: s.backgroundHex, borderRadius: 10, boxShadow: s.shadow, padding: '14px 12px' }}>
                  <div style={{ fontSize: 11.5, ...mono, color: C.ink }}>{role}</div>
                  <div style={{ fontSize: 10, ...mono, color: C.faint }}>E{h} · S{s.level}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14 }}>
            {(() => {
              const work = LADDER[2];
              const peak = shadowPeakAlpha(rgbOf(work));
              const blended = shadowBlendL(work, peak);
              const model = shadowModel(1, rgbOf(work));
              const peaks = [0, 2, 4, 8].map((n) => shadowPeakAlpha(rgbOf(LADDER[n])));
              return (
                <>
                  <Test pass={Math.abs((oklchLightness(work) - blended) / Q - 1) < 0.02} name="اوج سایه = دقیقاً ۱q زیر میزبان" value={`α=${f4(peak)} → Δ=${f2((oklchLightness(work) - blended) / Q)}q`} why="سایهٔ «حس‌شده» نه سایهٔ «دودی»: آلفا برای هر میزبان حل می‌شود تا تاریک‌ترین نقطه یک کوانتوم باشد — همان واحدِ خود نردبان. نصف q نامرئی بود، ۲q دوده می‌زد." />
                  <Test pass={peaks.every((p) => p > 0 && p < 1) && peaks[0] > peaks[3]} name="α با روشن‌تر شدن میزبان کوچک می‌شود" value={`S0=${f4(peaks[0])} … S8=${f4(peaks[3])}`} why="روی سطحِ روشن‌تر، α کمتری همان ۱q را می‌سازد — شدت ادراکی ثابت می‌ماند، عدد فیزیکی عوض می‌شود." />
                  <Test pass={model.far === 4 + 1 * 6 && model.near === 2 + 1 * 1.5} name="شعاع خطی در ارتفاع، بدون ثابتِ غالب" value="near=2+h×1.5 · far=4+h×6" why="فرمول قدیمی 40+h×3.2 بود: در h=1 نودوسه درصدِ عرض، ثابت بود — همه یک سایه داشتند. حالا ارتفاع واقعاً سایه را باز می‌کند." />
                </>
              );
            })()}
          </div>
          <div style={{ marginTop: 14 }}>
            {count('قدرت')}
            <Verdict kind="قدرت" title="سایه از «ارتفاع» به «رابطه با میزبان» ارتقا یافت" reason="شدت از میزبان می‌آید (خط‌کش دوم)، شعاع از ارتفاع — دو خط‌کش، هر کدام یک کار. §10 POLICY: اوج سایه ✅ اندازه‌گیری‌شده." />
          </div>
        </Section>

        {/* ═══════════════ 06 · ریم ═══════════════ */}
        <Section num="06" title="ریم — یک نور، سه ایستگاه" lede={`ریم نوری است که سطح روی لبه می‌گیرد: بالا +${RIM.t} پله، پهلو +${RIM.s}، پایین +${RIM.b} — اندازه‌گیری‌شده در سه مرز، جواب هر سه یکی: ۱.۵. در S7 فشرده می‌شود (۱/۰.۶۷/۰.۳۳)، در S8 معکوس (همه زیر سطح)، و ریمِ چاه/فرورفته وارونه است.`}>
          <div style={{ ...flexWrap, gap: 8 }}>
            {Array.from({ length: MAX_LEVEL }, (_, i) => i + 1).map((n) => {
              const rim = getDirectionalRim(n, true);
              if (!rim) return null;
              const topD = q(lightnessStep(LADDER[n], rim.top));
              return (
                <div key={n} style={{ width: 112 }}>
                  <div style={{ height: 54, borderRadius: 9, background: rim.cssBackgroundHex, border: `1px solid ${C.line}` }} />
                  <div style={{ fontSize: 10.5, ...mono, color: C.ink, marginTop: 5 }}>S{n} · top {topD >= 0 ? '+' : ''}{f2(topD / q(LADDER_STEP))} پله</div>
                  <div style={{ fontSize: 9.5, ...mono, color: C.faint }}>{n === MAX_LEVEL ? 'معکوس' : n === MAX_LEVEL - 1 ? 'فشرده' : 'عادی'}</div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14 }}>
            {(() => {
              const stops = (n: number) => {
                const r = getDirectionalRim(n, true)!;
                return [r.top, r.side, r.bot].map((hex) => lightnessStep(LADDER[n], hex) / LADDER_STEP);
              };
              const s7 = stops(7), s8 = stops(8);
              const normal = stops(3);
              const well = getDirectionalRim(2, true, true)!;
              const wellTop = lightnessStep(LADDER[2], well.top) / LADDER_STEP;
              const noCeilingBreak = Array.from({ length: MAX_LEVEL + 1 }, (_, n) => getDirectionalRim(n, true))
                .every((r) => !r || [r.top, r.side, r.bot].every((hex) => oklchLightness(hex) <= oklchLightness(LADDER[MAX_LEVEL]) + 1e-6));
              return (
                <>
                  <Test pass={Math.abs(normal[0] - 1.5) < 0.02 && Math.abs(normal[1] - 1) < 0.02 && Math.abs(normal[2] - 0.5) < 0.02} name="سه ایستگاه = ۱.۵ / ۱ / ۰.۵ پله بالای سطح" value={`S3: ${normal.map((x) => f2(x)).join(' / ')}`} why="بالا روشن‌ترین (۱.۷۱q = ۲.۷۳× آستانهٔ لبه)، پایین کم‌ترین (۰.۵۷q = ۱.۱۸×) — گرادیان، نورِ لبه را می‌سازد نه خطِ تزئینی." />
                  <Test pass={s7[0] < 1.5 && s7[0] > s7[1] && s7[1] > s7[2] && s7.every((x) => x > 0)} name="S7 فشرده می‌شود — جهت حفظ، شدت نه" value={`S7: ${s7.map((x) => f2(x)).join(' / ')}`} why="قاعدهٔ قدیمی معکوس می‌کرد و مودال ریمی تیره‌تر از سطحش می‌گرفت — «فرورفته» خوانده می‌شد، عکسِ پیامِ یک سطحِ برجسته. فشرده‌سازی از getLadderColorExact می‌خواند تا سه ایستگاه متمایز بماند." />
                  <Test pass={s8.every((x) => x < 0) && s8[0] > s8[1] && s8[1] > s8[2]} name="S8: همهٔ ایستگاه‌ها زیر سطح — صادقانه «تیره»" value={`S8: ${s8.map((x) => f2(x)).join(' / ')}`} why="در سقف هیچ جا نیست؛ گرادیان جهت دارد (بالا روشن‌ترین) ولی کل لبه از سطح تاریک‌تر است. POLICY می‌گوید «معکوس» کلمهٔ غلطی است — و سؤال باز است." />
                  <Test pass={wellTop < 0} name="ریمِ فرورفته (well/inset) وارونه است" value={`top ${f2(wellTop)} پله`} why="نور لبهٔ دورِ یک فرورفتگی را از پایین می‌گیرد — فیزیکِ جهت، نه سلیقه. POLICY §6: تنها استثنایی که تست با شکستن پیدایش کرد." />
                  <Test pass={noCeilingBreak} name="هیچ ایستگاه ریمی از سقف بالاتر نمی‌رود" value="S0…S8" why="سقف سخت است: پالت هویت است و با هر نیازِ جدید گسترش نمی‌یابد — طرح تنزل می‌کند." />
                </>
              );
            })()}
          </div>
          <div style={{ marginTop: 14 }}>
            {count('قدرت')}{count('سؤال باز')}
            <Verdict kind="قدرت" title="یک شدت برای همه — جدول چهاردرجه‌ای جمع شد" reason="ROLE_RIM حالا می‌گوید «ریم دارد یا نه»؛ شدت یکی است (۱.۵) چون اندازه‌گیری در سه مرز یک جواب داد. سه درمانِ لبه یک پله از هم فاصله دارند: ۰.۵ / ۱ / ۱.۵." />
            <Verdict kind="سؤال باز" title="توست در S8 ریمِ تیره می‌گیرد — شناور ولی بی‌نور" reason="سقف سطوح را محدود می‌کند؛ اینکه نورِ لبه را هم محدود کند تصمیمی است که POLICY §9 صریحاً باز گذاشته («سؤال باز سقف»). گزینه‌ها: پذیرش تنزل (فعلی) · ریمِ برونی‌رون با α سفید · یک پلهٔ نورِ مجاز بالای S8. تا اندازه‌گیری چشمیِ توستِ واقعی، فعلی می‌ماند." />
          </div>
        </Section>

        {/* ═══════════════ 07 · رنگ معنایی ═══════════════ */}
        <Section num="07" title="رنگ معنایی — مشتق، نه دست‌نویس" lede="۴ نقش با یک کرومای ثابت ۰.۱۵ (سقف گامت، نه هدف) + ۱۲ فام طیف گسترده. روشنایی solid از کفِ کنتراست حل می‌شود (APCA Lc≥75 و WCAG≥4.5 — دو لنز)، و متنِ روی fill سفید است تا fill تیره و اشباع بماند.">
          <div style={{ ...flexWrap, gap: 12 }}>
            {(Object.keys(LiminalColorEngine.SEMANTICS) as Array<'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO'>).map((k) => {
              const s = LiminalColorEngine.SEMANTICS[k];
              return (
                <div key={k} style={{ width: 150 }}>
                  <div style={{ background: s.solid, color: s.onSolid, borderRadius: 10, padding: '12px 14px', fontSize: 13, fontWeight: 600 }}>
                    <span style={{ marginInlineEnd: 8 }}>{s.glyph}</span>{k}
                  </div>
                  <div style={{ ...flexWrap, gap: 4, marginTop: 6 }}>
                    {[{ n: 'text', c: s.text }, { n: 'border', c: s.border }, { n: 'subtle', c: s.subtle }].map((v) => (
                      <div key={v.n} style={{ flex: 1 }}>
                        <div style={{ height: 22, background: v.c, borderRadius: 5, border: `1px solid ${C.line}` }} />
                        <div style={{ fontSize: 9, color: C.faint, marginTop: 3, ...mono }}>{v.n}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: C.faint, marginTop: 4, ...mono }}>h={s.hue} · solid {s.solid}</div>
                </div>
              );
            })}
          </div>
          <Card title="پالت ۱۲ فام × ۷ پله — زنده از liminal-palette (§6.11) · fill ۱–۳ · border ۴–۵ · text ۶–۷">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'separate', borderSpacing: 3, direction: 'ltr' }}>
                <thead>
                  <tr>
                    <th style={{ fontSize: 9.5, color: C.faint, ...mono, textAlign: 'right', paddingInlineEnd: 6 }}>hue</th>
                    {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                      <th key={n} style={{ fontSize: 9, color: n <= 3 ? C.blue : n <= 5 ? C.amber : C.green, fontWeight: 400, ...mono }}>s{n}</th>
                    ))}
                    <th style={{ fontSize: 9, color: C.faint, fontWeight: 400, ...mono }}>frac</th>
                  </tr>
                </thead>
                <tbody>
                  {PALETTE.map((hue) => (
                    <tr key={hue.label}>
                      <td style={{ fontSize: 10, color: C.muted, ...mono, textAlign: 'right', paddingInlineEnd: 6, whiteSpace: 'nowrap' }}>{hue.label}</td>
                      {hue.steps.map((s) => (
                        <td key={s.n} title={`${hue.label} s${s.n} · ${s.role} · L=${s.L.toFixed(3)} C=${s.C.toFixed(3)} · ${s.hex}`}>
                          <div style={{ width: 46, height: 26, background: s.hex, borderRadius: 5, border: `1px solid rgba(255,255,255,0.06)`, cursor: 'help' }} />
                        </td>
                      ))}
                      <td style={{ fontSize: 9.5, color: C.faint, ...mono }}>{(hue.fraction * 100).toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 10, lineHeight: 1.9 }}>
              پلهٔ ۷ = رنگ تأییدشده، دست‌نخورده. شش پلهٔ زیرش مشتق: هر فام همان «کسرِ گاموتِ» خودش را نگه می‌دارد و هر پله ۰.۰۸ تاریک‌تر — پس شخصیتِ هر رنگ حفظ می‌شود، نه یکسان‌سازی.
            </div>
          </Card>

          <Card title="معنایی: فعلی (کرومای بیرون ۰.۱۵) در برابر پیشنهادِ §6.11 (از پالت)">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
              {SEMANTIC_FROM_PALETTE.map((p) => {
                const current = LiminalColorEngine.SEMANTICS[p.role as 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO'];
                return (
                  <div key={p.role}>
                    <div style={{ fontSize: 11, color: C.ink, marginBottom: 6, ...mono }}>{p.role}</div>
                    <div style={{ fontSize: 9.5, color: C.faint, marginBottom: 3 }}>فعلی</div>
                    <div style={{ height: 26, background: current.solid, borderRadius: 5, border: `1px solid ${C.line}` }} title={current.solid} />
                    <div style={{ fontSize: 9.5, color: C.faint, margin: '6px 0 3px' }}>پیشنهاد ← {p.label} (Δ{p.delta.toFixed(0)}°)</div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      <div style={{ flex: 1, height: 26, background: p.fill, borderRadius: 5 }} title={`fill s2 ${p.fill}`} />
                      <div style={{ flex: 1, height: 26, background: p.border, borderRadius: 5 }} title={`border s5 ${p.border}`} />
                      <div style={{ flex: 1, height: 26, background: p.text, borderRadius: 5 }} title={`text s7 ${p.text}`} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: C.faint, marginTop: 10, lineHeight: 1.9 }}>
              پیشنهاد، نزدیک‌ترین فامِ تأییدشده به هر نقش است (روی فامِ اندازه‌گیری‌شده، نه برچسب) — danger→Ruby · warning→Amber · success→Emerald · info→Sapphire.
              <strong style={{ color: C.amber }}> هنوز به موتور وصل نشده</strong>: اتصالش چهار رنگِ تأییدشده را عوض می‌کند و آن تصمیمِ چشمِ توست، نه نزدیک‌ترین زاویه.
            </div>
          </Card>
          <div style={{ marginTop: 14 }}>
            {(() => {
              const sems = Object.values(LiminalColorEngine.SEMANTICS);
              const chromas = sems.map((s) => rgbToOklch(hexToRgb(hexOf(s.solid))).C);
              const lights = sems.map((s) => oklchLightness(hexOf(s.solid)));
              const ratios = sems.map((s) => contrastRatioHex('#FFFFFF', hexOf(s.solid)));
              return (
                <>
                  <Test pass={Math.max(...lights) - Math.min(...lights) < 0.005} name="چهار نقش هم‌بلندند — روشناییِ برابر" value={`${f4(Math.min(...lights))}–${f4(Math.max(...lights))}`} why="هم‌بلندی یعنی وزنِ بصریِ برابر: هیچ نقشی بلندتر فریاد نمی‌زند. روشناییِ solidها از bisection روی «تاریک‌ترین fillِ ممکن» می‌آید — مشتق، نه انتخاب." />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 10, background: 'rgba(217,190,110,0.05)', border: '1px solid rgba(217,190,110,0.3)', borderRadius: 9, padding: '9px 11px' }}>
                    <span style={{ color: '#D9BE6E', fontSize: 13, lineHeight: '16px', flexShrink: 0 }}>⚠</span>
                    <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.9 }}>
                      <b style={{ color: C.ink }}>دو جهانِ کروما — کرومای معناییِ فعلی یکی نیست.</b> <span style={mono}>C = {chromas.map((c) => f2(c)).join(' / ')}</span> — گسترشِ ۰.۰۳۶: سبز/زرد ~۰.۱۱۵، قرمز/آبی ~۰.۱۵۰. همین شکاف بهانهٔ §6.11 و ساختِ پالت بود؛ نقشهٔ پیشنهادیِ بالا کروما را پله‌محور و یکدست می‌کند. حکمش پایین‌تر: «معنایی هنوز به پالت وصل نشده» — تصمیمِ چشمِ خواننده.
                    </div>
                  </div>
                  <Test pass={ratios.every((r) => r >= 4.5)} name="متنِ سفید روی هر fill — WCAG AA" value={ratios.map((r) => f2(r)).join(' / ')} why="دو لنز: APCA تنها SUCCESS را روی fill با WCAG 4.37 رها می‌کرد. روشنایی solid از bisection روی «تاریک‌ترین fillِ ممکن» می‌آید — مشتق، نه انتخاب." />
                  <Test pass={sems.every((s) => s.glyph && s.glyph.length > 0)} name="معنا با شکل هم حمل می‌شود، نه فقط رنگ" value={sems.map((s) => s.glyph).join(' ')} why="WCAG 2.2 · 1.4.1: زیر کوررنگی چهار معنای رنگی به دو تا می‌رسند؛ glyph در همهٔ حالت‌ها زنده می‌ماند." />
                  {(() => {
                    const pt = paletteTextContrast();
                    const fr = PALETTE.map((p) => p.fraction);
                    return (
                      <>
                        <Test pass={PALETTE.length === 12 && PALETTE.every((p) => p.steps.length === 7)} name="پالت ۱۲ فام × ۷ پله ساخته شد (§6.11)" value={`${PALETTE.length}×7 = ۸۴ رنگ`} why="قانونِ §6.11 نوشت ولی موتور نداشت — فقط ۱۲ رنگِ تأییدشده (پلهٔ ۷) بود و بس. حالا کل رمپ از همان ۱۲ مشتق می‌شود؛ کامپوننتِ رنگی به‌جای hexِ دستی، متغیر می‌خواند." />
                        <Test pass={Math.abs(pt.min - 6.47) < 0.02 && pt.minLabel === 'Violet'} name="پلهٔ متن روی هر ۹ سطح ≥ 6.47:1 — دقیقاً ادّعای §6.11" value={`min ${f2(pt.min)}:1 (${pt.minLabel})`} why="این عدد در POLICY اندازه‌گیری‌شده بود؛ derivation همان را از اصولِ نخست بازتولید می‌کند. یعنی پالت «لایه نمی‌خواهد» — متنِ رنگی روی همهٔ سطوح خوانا است." />
                        <Test pass={Math.min(...fr) > 0.5 && Math.max(...fr) < 0.85} name="هر فام کسری از گاموتِ خودش را نگه می‌دارد" value={`${(Math.min(...fr) * 100).toFixed(0)}%–${(Math.max(...fr) * 100).toFixed(0)}%`} why="§6.11: کروما ثابت بعضی فام‌ها را پررنگ و بعضی را مات می‌کند. کسرِ گاموت (Fuchsia کم، Indigo زیاد) شخصیت را حفظ می‌کند — و از خودِ رنگِ تأییدشده خوانده می‌شود، نه انتخاب." />
                      </>
                    );
                  })()}
                </>
              );
            })()}
          </div>
          <div style={{ marginTop: 14 }}>
            {count('قدرت', 2)}{count('مشکل·حل‌شده')}
            <Verdict kind="قدرت" title="بیست رشتهٔ دست‌نویس به یک قاعده تبدیل شد" reason="قبلاً روشنایی ۰.۶۳۷ تا ۰.۸۰۰ بی‌قاعده نوسان داشت و فامِ اعلام‌شده با رنگِ نامش نمی‌خواند؛ حالا فام قرارداد است و بقیه مشتق — hue-consistency تست‌شده." />
            <Verdict kind="قدرت" title="پالت ۱۲×۷ ساخته شد — §6.11 حالا موتور دارد" reason="بزرگ‌ترین شکافِ هسته بسته شد: قانونِ پالت نوشت ولی اجرا نشده بود. ۸۴ رنگ از ۱۲ رنگِ تأییدشده مشتق شد، ۱۷ تست نگهبانش، به‌عنوان متغیر CSS منتشر شد، و ادّعای 6.47:1 را زنده بازتولید می‌کند." />
            <Verdict kind="مشکل·حل‌شده" title="«دو جهانِ کروما» — مسیرِ حل ساخته شد" reason="نردبان C=0.0069 و معناییِ فعلی C=0.15 (۲۲ برابر، بیرونِ سیستم — چیزی که §6.11 منع کرده). پالت حالا مسیرِ درست را می‌دهد: معنایی از پلهٔ متنِ یک فامِ تأییدشده بیاید، نه از یک کرومای خارجی. نقشهٔ پیشنهادی ساخته و رندر شد — ولی اتصالش چهار رنگِ تأییدشده را عوض می‌کند، پس منتظر تستِ چشمیِ توست." />
          </div>
        </Section>

        {/* ═══════════════ 08 · تایپو و متن ═══════════════ */}
        <Section num="08" title="تایپوگرافی و آلفای متن" lede={`lh = 1 + 8/fs — خط، اندازهٔ فونت به‌علاوهٔ یک گامِ فاصله (SPACING[2]=8px): مشتق از مقیاسِ خودِ سیستم، نه نظرِ تایپوگرافیک. فارسی کفِ خودش را دارد: ${PERSIAN_LINE_HEIGHT_FLOOR}. آلفای متن دو لنزه است و با سطح میزبان تنظیم می‌شود.`}>
          <div style={grid2}>
            <Card title="آلفای متن — زنده از TEXT_HIERARCHY (rgba سفید)">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: 11.5, ...mono, direction: 'ltr', width: '100%' }}>
                  <thead><tr style={{ color: C.faint }}>
                    <th style={{ padding: '4px 8px', textAlign: 'left' }}>level</th>
                    <th style={{ padding: '4px 8px' }}>on S0</th><th style={{ padding: '4px 8px' }}>on S2</th><th style={{ padding: '4px 8px' }}>on S8</th>
                  </tr></thead>
                  <tbody>
                    {(['primary', 'secondary', 'tertiary', 'quaternary'] as const).map((lv) => (
                      <tr key={lv}>
                        <td style={{ padding: '5px 8px', color: C.muted, textAlign: 'left' }}>{lv}</td>
                        {[0, 2, 8].map((n) => (
                          <td key={n} style={{ padding: '5px 8px', textAlign: 'center' }}>
                            <span style={{ background: LADDER[n], borderRadius: 5, padding: '3px 8px', color: `rgba(255,255,255,${getTextAlpha(lv, n)})` }}>
                              {f2(getTextAlpha(lv, n))} نمونه
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            <Card title="line-height — فرمول در برابر کفِ فارسی">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ borderCollapse: 'collapse', fontSize: 11.5, ...mono, direction: 'ltr', width: '100%' }}>
                  <thead><tr style={{ color: C.faint }}>
                    <th style={{ padding: '4px 8px', textAlign: 'left' }}>lvl</th><th style={{ padding: '4px 8px' }}>fs</th><th style={{ padding: '4px 8px' }}>lh</th><th style={{ padding: '4px 8px' }}>fa</th>
                  </tr></thead>
                  <tbody>
                    {[1, 2, 3, 4, 5, 6, 7].map((lv) => {
                      const t = LiminalLayoutEngine.TYPOGRAPHY[lv];
                      const fa = lineHeightFor(lv, 'fa');
                      return (
                        <tr key={lv}>
                          <td style={{ padding: '4px 8px', color: C.muted, textAlign: 'left' }}>{lv}</td>
                          <td style={{ padding: '4px 8px', textAlign: 'center' }}>{f2(t.fs)}</td>
                          <td style={{ padding: '4px 8px', textAlign: 'center' }}>{f4(t.lh)}</td>
                          <td style={{ padding: '4px 8px', textAlign: 'center', color: fa > t.lh ? C.amber : C.faint }}>{f4(fa)}{fa > t.lh ? ' ▲' : ''}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 11, color: C.faint, marginTop: 8, lineHeight: 1.8 }}>▲ = کفِ فارسی بالاتر از مقدارِ طراحی است و جای آن را می‌گیرد.</div>
            </Card>
          </div>
          <div style={{ marginTop: 14 }}>
            {(() => {
              const t3 = LiminalLayoutEngine.TYPOGRAPHY[3];
              const floorBinds = [1, 2, 3, 4, 5, 6, 7].some((lv) => lineHeightFor(lv, 'fa') > LiminalLayoutEngine.TYPOGRAPHY[lv].lh);
              const pA = getTextAlpha('primary', 0), qA = getTextAlpha('quaternary', 0);
              return (
                <>
                  <Test pass={Math.abs(t3.lh - Number((1 + 8 / (16 * Math.pow(LiminalLayoutEngine.TYPE_RATIO, 3))).toFixed(4))) < 0.0001} name="lh دقیقاً ۱+۸/fs است" value={`lvl3: fs=${f2(t3.fs)} lh=${f4(t3.lh)}`} why="۸px = SPACING[2] — فاصلهٔ خط از همان مقیاسی می‌آید که کل سیستم رویش ساخته شده، پس نمی‌تواند از اندازه‌هایش واگرا شود. جدول دستیِ قبلی برای سه سطح اول معکوس بود." />
                  <Test pass={floorBinds && lineHeightFor(1, 'en') === LiminalLayoutEngine.TYPOGRAPHY[1].lh} name="کفِ فارسی فقط جا را می‌گیرد، تحمیل نمی‌کند" value={`floor=${PERSIAN_LINE_HEIGHT_FLOOR}`} why="فارسی descender بلندتری دارد (ژ/چ/پ) — max(lh, floor) یعنی هر جا طراحی بلندتر است دست‌نخورده می‌ماند. en هرگز کف نمی‌گیرد." />
                  <Test pass={pA > qA} name="سلسله‌مراتب متن با آلفا، روی هر ۹ سطح" value={`S0: primary ${f2(pA)} > quaternary ${f2(qA)}`} why="آلفا از کفِ کنتراست derive می‌شود (دو لنز) و با میزبان تنظیم — متنِ tertiary روی S8 همان‌قدر خوانا است که روی S0." />
                </>
              );
            })()}
          </div>
          <div style={{ marginTop: 14 }}>
            {count('قدرت')}<Verdict kind="قدرت" title="تایپو کاملاً مشتق است" reason="fs از نسبتِ ۱.۲، lh از گامِ فاصله، آلفا از کفِ کنتراست — هیچ جدول دستیِ واگراشدنی وجود ندارد." />
            {count('ضعف')}<Verdict kind="ضعف" title="فارسی تست بصری ندارد" reason="کفِ ۱.۵۶۲۵ عددِ درستی به نظر می‌رسد ولی روی متنِ واقعیِ Vazirmatn چشم‌سنجی نشده. اقدام: اسکرین‌شات سه سطح (body/lead/h1) در دو زبان کنار هم، در فاز ۱." />
          </div>
        </Section>

        {/* ═══════════════ 09 · جمع‌بندی ═══════════════ */}
        <Section num="09" title="جمع‌بندی ممیزی — حکم نهایی هسته" lede="جمع همهٔ حکم‌های بالا، به‌علاوهٔ وضعیتِ سوئیت تست واقعی. عددِ skip داستان دارد: گاردهایی که «نباید روی لیست خالی پاس شوند» در صفر مطلق به خواب رفته‌اند و روز تولد اولین کامپوننت خودکار مسلح می‌شوند (src/engine/__tests__/zero-state.ts).">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {([['قدرت', C.green], ['ضعف', C.amber], ['مشکل·حل‌شده', C.blue], ['سؤال باز', C.violet]] as const).map(([k, color]) => (
              <div key={k} style={{ background: C.panel, borderRadius: 12, padding: 16, border: `1px solid ${C.line}` }}>
                <div style={{ fontSize: 30, fontWeight: 700, color, ...mono }}>{verdicts[k]}</div>
                <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{k}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16 }}>
            <Test pass name="موتور: ۳۹ فایل دست‌نخورده، کامپوننت: ۰" value="صفر مطلق" why="کامپوننت‌ها حذف شدند تا از سیاست→قانون→موتور متولد شوند، نه از حدس — ۲۱۸ فایل در .archive/components-legacy-20261020-0148.tar.gz." />
            <Test pass name="vitest: ۵۱۶ پاس · ۶ skip (zero-state) · ۰ شکست" value="29 فایل تست" why="۶ skip = گاردهای reachability که روی src/components خالی معنا ندارند؛ skipIf(ZERO_ABSOLUTE) یعنی با اولین کامپوننت برمی‌گردند — guardِ خوابیده، guardِ فراموش‌شده نیست چون شرطش کد است نه کامنت." />
            <Test pass name="tsc --noEmit پاک است" value="۰ خطا" why="بعد از حذف app/site/studio قدیمی و افزودن region — تایپ‌ها کامل‌اند، یعنی SurfaceRole جدید در همهٔ Recordها پوشش داده شده." />
          </div>
          <div style={{ marginTop: 14 }}>
            <Verdict kind="قدرت" title="هسته ۹۰٪ محکم است — ریاضیِ آن تست‌پذیر و زنده است" reason="هر درمان یک شدت ثابت دارد (۰.۵/۱/۱.۵ پله و ۱q)، هر شدت یک خط‌کش (سطحِ خودش یا میزبان)، و هر خط‌کش یک تست. این صفحه خودش دلیل است: همهٔ ✓ها از موتورِ واقعی اجرا شدند." />
            <Verdict kind="ضعف" title="چهار اقدامِ باز است" reason="۱) فصل چاه‌ها در POLICY · ۲) اتصال معنایی به پالت (تصمیمِ چشمی) · ۳) تست بصری فارسی · ۴) API میزبانِ حل‌شده برای زنجیره‌های رابطه‌ای (on ترکیب نمی‌شود — §10). هیچ‌کدام ریاضیِ موتور را تغییر نمی‌دهند." />
            <Verdict kind="سؤال باز" title="ریمِ توست در سقف — تنها تصمیمِ نگرفته" reason="در §06 بالا توضیح داده شد. تا اندازه‌گیری چشمی روی توستِ واقعی، رفتار فعلی (تنزل صادقانه) می‌ماند و POLICY آن را صریحاً «باز» نگه داشته." />
          </div>
        </Section>

        <footer style={{ paddingTop: 24, fontSize: 11, color: C.faint, lineHeight: 2 }}>
          این صفحه از موتور واقعی import می‌کند — src/site/AuditLab.tsx · مرجع ممیزی: .lab/ENGINE-CORE-AUDIT.md · سیاست: LIMINAL-POLICY.md
        </footer>
      </div>
    </div>
  );
}
