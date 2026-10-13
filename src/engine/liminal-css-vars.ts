/**
 * LIMINAL · CSS VARIABLE GENERATOR
 *
 * Emits the `:root` token block from the engine. The engine is the single
 * source of truth; this file is the only place that turns it into CSS.
 *
 * Why generate instead of hand-writing: the hand-written block covered ~19 of
 * ~90 tokens, so most of the system could not be themed at runtime and nothing
 * caught the drift. A test (src/engine/__tests__/css-vars.test.ts) asserts that
 * src/index.css matches this output exactly, so the two cannot diverge.
 *
 * Run: bun run gen:css   (writes the block into src/index.css)
 */

import { LADDER, HALF, WELLS } from './liminal-ladder';
import { PERSIAN_FONT_STACK, PERSIAN_LINE_HEIGHT_FLOOR } from './liminal-persian';
import {
  RIM,
  SHADOWS,
  SURFACE_TINT,
  VEIL,
  BRAND_ALPHA,
  Z_INDEX,
  TEXT_HIERARCHY,
  getDirectionalRim,
} from './spec-engine';
import { LiminalLayoutEngine } from './liminal-layout-engine';
import { LiminalMotionEngine } from './liminal-motion-engine';
import { LiminalColorEngine } from './liminal-color-engine';

const lines: string[] = [];
const section = (title: string) => {
  lines.push('');
  lines.push(`  /* ── ${title} ${'─'.repeat(Math.max(0, 58 - title.length))} */`);
};
const v = (name: string, value: string | number, note?: string) => {
  const suffix = note ? ` /* ${note} */` : '';
  lines.push(`  --liminal-${name}: ${value};${suffix}`);
};

export function generateCssVars(): string {
  lines.length = 0;

  // ── 1. TONAL LADDER ────────────────────────────────────────────────
  section('1. TONAL LADDER');
  LADDER.forEach((hex, i) => v(`s${i}`, hex, i === 0 ? 'canvas' : undefined));
  // The half-steps are part of the system, not an implementation detail: the
  // hover of a surface and the pulse of a skeleton both land on one. They were
  // reachable only from JavaScript, so a keyframe that needed one had to
  // interpolate it at runtime — which is how a stylesheet ended up with
  // `getLadderColor(2.5)` written inside it.
  // `HALF[i]` sits BETWEEN `LADDER[i]` and `LADDER[i + 1]`, so it is named for
  // the pair: `s0-5` is the step between S0 and S1. Naming it `s${i}` collided
  // with the ladder and silently overwrote every surface — which is the defect
  // this system keeps finding, so there is a test for it now.
  HALF.forEach((hex, i) => v(`s${i}-5`, hex));
  v('s-minus-1', WELLS.penumbra, 'penumbra');
  v('s-minus-2', WELLS.umbra, 'contact umbra');

  // ── 2. DIRECTIONAL RIM ─────────────────────────────────────────────
  section('2. RIM');
  ([1, 2, 3] as const).forEach((level) => {
    const rim = getDirectionalRim(level, level);
    if (!rim) return;
    v(`rim-${level}-top`, rim.top);
    v(`rim-${level}-side`, rim.side);
    v(`rim-${level}-bottom`, rim.bot);
  });

  // ── 3. SUB-CANVAS SHADOW ───────────────────────────────────────────
  section('3. SHADOW');
  ([1, 2, 3, 4] as const).forEach((e) => v(`shadow-e${e}`, SHADOWS[e]));

  // ── 4. SURFACE TINT ────────────────────────────────────────────────
  section('4. SURFACE TINT (fills — never for type)');
  Object.entries(SURFACE_TINT).forEach(([k, val]) => v(`tint-${k}`, val));

  // ── 5. VEIL ────────────────────────────────────────────────────────
  section('5. VEIL');
  Object.entries(VEIL).forEach(([k, val]) => v(`veil-${k}`, val));

  // ── 6. TEXT ────────────────────────────────────────────────────────
  section('6. TEXT (never pure white)');
  // TEXT_HIERARCHY holds one alpha PER SURFACE — the alpha a role needs depends
  // on what it sits on. A CSS custom property can only carry one value, so it
  // carries the S0 alpha: the largest of the nine, and therefore the one that
  // is safe on every surface. Per-surface values come from getTextStyle().
  //
  // Do NOT interpolate the array itself. `${array}` comma-joins, which shipped
  // an rgba() with eleven arguments for two years of commits.
  v('text-primary', `rgba(255, 255, 255, ${TEXT_HIERARCHY.primary[0]})`, 'S0 alpha — safe on every surface');
  v('text-secondary', `rgba(255, 255, 255, ${TEXT_HIERARCHY.secondary[0]})`, 'S0 alpha — safe on every surface');
  v('text-tertiary', `rgba(255, 255, 255, ${TEXT_HIERARCHY.tertiary[0]})`, 'S0 floor; AA ≥4.5:1');
  v('text-quaternary', `rgba(255, 255, 255, ${TEXT_HIERARCHY.quaternary[0]})`, '≥3:1, non-text only');

  // ── 7. SEMANTICS ───────────────────────────────────────────────────
  section('7. SEMANTICS');
  (['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const).forEach((role) => {
    const s = LiminalColorEngine.SEMANTICS[role];
    const key = role.toLowerCase();
    v(key, s.solid.replace(/var\([^,]+,\s*/, '').replace(/\)$/, ''));
    v(`${key}-text`, s.text);
    v(`${key}-subtle`, s.subtle);
    v(`${key}-border`, s.border);
    v(`${key}-on`, s.onSolid);
  });

  // ── 8. BRAND ───────────────────────────────────────────────────────
  section('8. BRAND');
  const brand = LiminalColorEngine.BRAND_PRIMARY;
  v('brand', brand.hex.replace(/var\([^,]+,\s*/, '').replace(/\)$/, ''));
  v('brand-on', brand.onColor.replace(/var\([^,]+,\s*/, '').replace(/\)$/, ''));
  v('brand-hover', brand.hover);
  v('brand-active', brand.active);
  v('brand-subtle', BRAND_ALPHA.subtle);

  // ── 9. EXTENDED SPECTRUM ───────────────────────────────────────────
  section('9. EXTENDED SPECTRUM (12 hues)');
  LiminalColorEngine.EXTENDED_SPECTRUM.forEach((h) => v(`hue-${h.hue}`, h.hex, h.label));

  // ── 10. SPACING ────────────────────────────────────────────────────
  section('10. SPACING (atom 4)');
  Object.entries(LiminalLayoutEngine.SPACING).forEach(([k, val]) => v(`space-${k}`, `${val}px`, k === '0' ? 'sub-atom: optical only' : undefined));
  Object.entries(LiminalLayoutEngine.CONTROL).forEach(([k, val]) => v(`control-${k}`, `${val}px`));
  v('target-min', `${LiminalLayoutEngine.TARGET.min}px`, 'WCAG 2.5.5 AAA');
  Object.entries(LiminalLayoutEngine.BORDER).forEach(([k, val]) => v(`border-${k}`, `${val}px`));

  // ── 11. RADIUS ─────────────────────────────────────────────────────
  section('11. RADIUS');
  (['chip', 'control', 'card', 'panel', 'container', 'full'] as const).forEach((role) =>
    v(`radius-${role}`, `${LiminalLayoutEngine.RADIUS[role]}px`),
  );

  // ── 12. TYPE ───────────────────────────────────────────────────────
  // The ratio is the design; the base is the reading condition. Every level is
  // derived from `--liminal-type-base`, so nothing here is hand-picked.
  section('12. TYPE (modular 1.2, fluid base)');
  v('type-ratio', LiminalLayoutEngine.TYPE_RATIO, 'fixed — this is the design');
  v('type-base', LiminalLayoutEngine.TYPE_BASE_CSS, 'fluid 14→16.5px; rem-based for WCAG 1.4.4');
  Object.entries(LiminalLayoutEngine.TYPOGRAPHY).forEach(([level, t]) => {
    v(`fs-${level}`, LiminalLayoutEngine.getTypeSizeCss(Number(level)));
    // `lh` is a unitless multiplier, not a length. Publishing it as `px` would
    // collapse every line box to ~1.6px.
    v(`lh-${level}`, t.lh, 'unitless multiplier');
    v(`weight-${level}`, t.weight);
  });

  // ── 13. MOTION ─────────────────────────────────────────────────────
  // ── 12b. FONTS ─────────────────────────────────────────────────────
  // The Latin stack is the consumer's choice. The Persian stack is not: the
  // line-height floor in liminal-persian.ts is derived from Vazirmatn's own
  // metrics, so a different Persian face would need the floor re-derived.
  section('12b. FONTS');
  // Inter first, then the system stack. The body asked for Inter and nothing
  // loaded it, so every page silently fell back — and the type scale was
  // measured against a face nobody chose. `scripts/fetch-latin-font.mjs`
  // self-hosts it; the stack stays as the fallback for a page that has not.
  v('font-en', 'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif');
  v('font-fa', PERSIAN_FONT_STACK);
  v('line-height-fa-floor', String(PERSIAN_LINE_HEIGHT_FLOOR), 'from Vazirmatn metrics');

  section('13. MOTION');
  Object.entries(LiminalMotionEngine.DURATION).forEach(([k, val]) => v(`duration-${k}`, `${val}ms`));
  Object.entries(LiminalMotionEngine.EASING).forEach(([k, val]) => v(`ease-${k}`, val));

  // ── 14. LAYER ──────────────────────────────────────────────────────
  section('14. LAYER');
  Object.entries(Z_INDEX).forEach(([k, val]) => v(`z-${k}`, val));

  return `:root {\n${lines.join('\n')}\n}\n`;
}

/** The same block, but scoped to `.dark` — the system is dark-only today. */
export function generateDarkScope(): string {
  const root = generateCssVars();
  return root.replace(/^:root \{/, '.dark {');
}

export const CSS_VARS_START = '/* @liminal-generated:start */';
export const CSS_VARS_END = '/* @liminal-generated:end */';
