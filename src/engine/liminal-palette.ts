/**
 * LIMINAL — PALETTE · ۱۲ فام × ۷ پله (POLICY §6.11)
 *
 * THE LAW, verbatim from LIMINAL-POLICY.md §6.11:
 *
 *   ساختار — ۱۲ فام × ۷ پله
 *     پله ۱–۳  fill   — دکمهٔ رنگی، ناحیهٔ نمودار، برچسب
 *     پله ۴–۵  border — لبهٔ رنگی
 *     پله ۶–۷  text   — متن رنگی
 *   پلهٔ ۷ = رنگ‌های تأییدشده، دقیقاً — دست‌نخورده
 *   پله‌های پایین‌تر مشتق می‌شوند:
 *     هر فام، کسری از گاموتِ خودش را نگه می‌دارد   ← اندازه‌گیری‌شده: ۵۴.۵٪ تا ۸۳.۱٪
 *     و هر پله، ۰.۰۸ روشنایی پایین می‌آید
 *   کروما در OKLCH بین فام‌ها یکنواخت نیست — پس «کسری از گاموت» نه «کروما ثابت».
 *
 * WHY THIS MODULE EXISTS. §6.11 was LAW with no engine behind it: the color
 * system published the twelve approved colours (step 7) and nothing else, and
 * the semantic set was built from a flat chroma `C = 0.15` — ~22× the ladder's
 * `0.0069` — which is exactly the "chroma from outside the system" §6.11
 * forbids ("نه از یک کروما ۲۲ برابر بیرون از سیستم"). A component that needed a
 * coloured button, a chart region, a coloured border or coloured text had no
 * palette to read, so it would hand-pick one. This is the palette.
 *
 * THE DERIVATION IS FAITHFUL, AND IT IS CHECKED. The fraction each hue keeps is
 * NOT a number anyone chose — it is read off the approved colour itself:
 *
 *     fraction(hue) = C₇ / maxChromaAt(L₇, hue)
 *
 * Measured across the twelve, that lands at 53–82% with Fuchsia lowest and
 * Indigo highest — the same shape §6.11 recorded (54.5%–83.1%, Fuchsia/Indigo).
 * The tiny difference is round-trip precision, not a different rule: the POLICY
 * numbers came from the same approved colours, and this reproduces them from
 * first principles. Lower steps then keep that fraction of whatever gamut is
 * reachable at their (darker) lightness, so each hue ages by its own character
 * instead of being flattened to one chroma.
 *
 * STEP 7 IS THE APPROVED COLOUR, BYTE FOR BYTE. It is never regenerated — a
 * round-trip through OKLCH could move it a digit, and these twelve are the
 * identity. Steps 1–6 are derived.
 */

import { hexToRgb, rgbToOklch, oklchToHex, contrastRatioHex } from './liminal-color-math';
import { LADDER } from './liminal-ladder';

/* ────────────────────────── the twelve approved colours ────────────────────────── */

/**
 * Step 7 of every hue — the approved colours, exactly. SINGLE SOURCE OF TRUTH:
 * `LiminalColorEngine.EXTENDED_SPECTRUM` reads from here, so the contract, the
 * CSS variables and the palette can never disagree about what the twelve are.
 */
export const APPROVED: ReadonlyArray<{ hue: number; hex: string; label: string }> = [
  { hue: 15, hex: '#E88A93', label: 'Ruby' },
  { hue: 40, hex: '#E8A87C', label: 'Coral' },
  { hue: 75, hex: '#D9BE6E', label: 'Amber' },
  { hue: 110, hex: '#A8CC74', label: 'Lime' },
  { hue: 145, hex: '#74CE8E', label: 'Emerald' },
  { hue: 175, hex: '#5FCDBB', label: 'Teal' },
  { hue: 200, hex: '#56C6E0', label: 'Cyan' },
  { hue: 230, hex: '#6FA8EC', label: 'Sapphire' },
  { hue: 260, hex: '#8B9CF0', label: 'Indigo' },
  { hue: 290, hex: '#A98BEA', label: 'Violet' },
  { hue: 320, hex: '#C983D6', label: 'Fuchsia' },
  { hue: 350, hex: '#E083AE', label: 'Rose' },
] as const;

/* ────────────────────────── colour science ────────────────────────── */

/**
 * The most chroma this hue can carry at this lightness before sRGB clips.
 * A property of the colour space, not a hand-picked number — the same bisection
 * the color engine uses, kept here so the palette module depends only on
 * colour-math and the ladder, never on the semantic layer above it.
 */
export function maxChromaAt(L: number, h: number): number {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const back = rgbToOklch(hexToRgb(oklchToHex({ L, C: mid, h })));
    if (Math.abs(back.L - L) > 0.002 || Math.abs(back.C - mid) > 0.002) hi = mid;
    else lo = mid;
  }
  return lo;
}

/** How much of its own gamut an approved colour keeps — the §6.11 "fraction". */
export function gamutFraction(approvedHex: string): number {
  const { L, C, h } = rgbToOklch(hexToRgb(approvedHex));
  return C / maxChromaAt(L, h);
}

/* ────────────────────────── the 7-step ramp ────────────────────────── */

/** §6.11: each step is 0.08 of OKLCH lightness darker than the one above. */
export const PALETTE_STEP_DROP = 0.08;

export type PaletteRole = 'fill' | 'border' | 'text';

export interface PaletteStep {
  /** 1 (darkest fill) … 7 (the approved colour). */
  n: number;
  /** What §6.11 says this step is for. */
  role: PaletteRole;
  /** OKLCH lightness. */
  L: number;
  /** OKLCH chroma — fraction × reachable gamut, so it never clips. */
  C: number;
  /** The colour. Step 7 is the approved hex verbatim. */
  hex: string;
}

export interface PaletteHue {
  label: string;
  /** The nominal angle the colour is filed under (a convention, 15/40/75…). */
  hue: number;
  /**
   * The colour's TRUE OKLCH angle, measured off the approved hex. It is not the
   * nominal label — Coral is filed at 40 but measures 55.3, Sapphire at 230 but
   * measures 253.6. The ramp holds THIS angle, so it darkens the real colour
   * rather than a rounded idea of it, and `nearestHue` matches on it so the
   * semantic mapping lands on the hue the eye actually sees.
   */
  hueMeasured: number;
  /** The fraction of its gamut this hue keeps (53–82%, measured). */
  fraction: number;
  /** Step 7 — the approved colour. */
  approved: string;
  /** Steps 1…7, ascending. */
  steps: PaletteStep[];
}

/** §6.11 role bands: 1–3 fill, 4–5 border, 6–7 text. */
export function roleOfStep(n: number): PaletteRole {
  if (n <= 3) return 'fill';
  if (n <= 5) return 'border';
  return 'text';
}

function buildHue(a: { hue: number; hex: string; label: string }): PaletteHue {
  // The ramp holds the colour's MEASURED angle, not the nominal label — the
  // label is a filing convention, the measured hue is the colour. Darkening the
  // measured hue keeps every step the same colour the eye approved.
  const { L: L7, C: C7, h } = rgbToOklch(hexToRgb(a.hex));
  const fraction = C7 / maxChromaAt(L7, h);
  const steps: PaletteStep[] = [];
  for (let n = 1; n <= 7; n++) {
    if (n === 7) {
      // The approved colour, untouched — this is the identity, not a derivation.
      steps.push({ n, role: 'text', L: L7, C: C7, hex: a.hex });
      continue;
    }
    const L = Number((L7 - PALETTE_STEP_DROP * (7 - n)).toFixed(4));
    const C = fraction * maxChromaAt(L, h);
    steps.push({ n, role: roleOfStep(n), L, C, hex: oklchToHex({ L, C, h }) });
  }
  return { label: a.label, hue: a.hue, hueMeasured: h, fraction, approved: a.hex, steps };
}

/** The whole palette: twelve hues, seven steps each. */
export const PALETTE: readonly PaletteHue[] = APPROVED.map(buildHue);

/* ────────────────────────── accessors ────────────────────────── */

export function paletteHue(label: string): PaletteHue {
  const found = PALETTE.find((p) => p.label === label);
  if (!found) throw new Error(`liminal-palette: unknown hue "${label}"`);
  return found;
}

/** One step of one hue, by number (1…7). */
export function paletteStep(label: string, n: number): PaletteStep {
  const step = paletteHue(label).steps.find((s) => s.n === n);
  if (!step) throw new Error(`liminal-palette: ${label} has no step ${n}`);
  return step;
}

/** The hex of a step — what a component reads. */
export function paletteHex(label: string, n: number): string {
  return paletteStep(label, n).hex;
}

/* ────────────────────────── semantic mapping (a PROPOSAL, not yet the law) ────────────────────────── */

/**
 * §6.11 says the semantics come FROM this palette — "DANGER = فام سرخ پلهٔ متن،
 * SUCCESS = فام سبز پلهٔ متن" — not from a chroma outside the system. The engine
 * still builds them the old way (flat C = 0.15), which is the defect §6.11 names.
 *
 * This table is the PROPOSAL that closes it: each semantic role mapped to the
 * approved hue nearest its conventional angle, using that hue's TEXT step (7) as
 * the semantic text colour and its FILL steps for solid/subtle. It is exposed so
 * the AuditLab can render current-vs-proposed side by side and the reader can
 * EYEBALL the mapping — which hue is "the green", which is "the red" is a visual
 * decision, not a nearest-angle one. Nothing consumes it yet: wiring it into
 * `deriveSemantic` changes four approved colours, and that waits for the eye test.
 */
export const SEMANTIC_HUE_ANGLE = {
  SUCCESS: 162.9,
  WARNING: 81.4,
  DANGER: 23.5,
  INFO: 257.5,
} as const;

/** Circular hue distance in degrees. */
function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * The approved hue whose MEASURED angle is nearest a target — the objective half
 * of the semantic mapping. Matching on the true hue (not the nominal label) is
 * what makes the four roles land where the eye expects: danger→Ruby, warning→
 * Amber, success→Emerald, info→Sapphire. On the nominal labels the same angles
 * would have mis-mapped success to Teal and info to Indigo.
 */
export function nearestHue(targetAngle: number): PaletteHue {
  let best = PALETTE[0];
  for (const p of PALETTE) {
    if (hueDistance(p.hueMeasured, targetAngle) < hueDistance(best.hueMeasured, targetAngle)) best = p;
  }
  return best;
}

/**
 * The proposal: role → nearest approved hue + its text/fill steps. Rendered in
 * the AuditLab next to the current semantics so the reader can accept it, or
 * pick a different hue where the nearest angle is not the right meaning.
 */
export const SEMANTIC_FROM_PALETTE = (
  Object.keys(SEMANTIC_HUE_ANGLE) as Array<keyof typeof SEMANTIC_HUE_ANGLE>
).map((role) => {
  const angle = SEMANTIC_HUE_ANGLE[role];
  const hue = nearestHue(angle);
  return {
    role,
    angle,
    label: hue.label,
    text: paletteHex(hue.label, 7), // step 7 — the approved colour as text
    border: paletteHex(hue.label, 5), // step 5 — the border band
    fill: paletteHex(hue.label, 2), // step 2 — a dark, saturated fill
    /* MEASURED, not nominal. nearestHue picks on hueMeasured; reporting the
       delta against the nominal label lied to the reader — INFO→Sapphire read
       "Δ27.5°" (label 230) while the true measured shift is 3.9° (253.6).
       Found by the merciless colour audit; pinned in palette.test.ts. */
    delta: hueDistance(hue.hueMeasured, angle),
  };
});

/* ────────────────────────── the §6.11 contrast proof ────────────────────────── */

/**
 * The palette "has no layers, and that is a feature": its TEXT colour — step 7,
 * the approved colour itself — was measured against EVERY ladder surface and
 * clears the text floor on all nine. §6.11 recorded the per-surface minimum
 * (canvas 7.26:1 … toast 6.47:1); this recomputes it live so the proof travels
 * with the code and a re-approved colour that broke it would fail the suite.
 *
 * Step 6 is the transition toward the border band, not a headline text colour,
 * so it is held to the hard AA floor (4.5:1) rather than this 6.47 minimum — a
 * distinction the palette test makes explicit.
 */
export function paletteTextContrast(): { min: number; minLabel: string; onSurface: string } {
  let min = Infinity;
  let minLabel = '';
  let onSurface = '';
  for (const hue of PALETTE) {
    const hex = paletteHex(hue.label, 7);
    for (const surface of LADDER) {
      const c = contrastRatioHex(hex, surface);
      if (c < min) {
        min = c;
        minLabel = hue.label;
        onSurface = surface;
      }
    }
  }
  return { min, minLabel, onSurface };
}
