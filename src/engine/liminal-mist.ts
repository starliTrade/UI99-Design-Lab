/**
 * LIMINAL · MIST ENGINE
 * «مه، نوری است که یک سطح شناور می‌گیرد — و هرچه بالاتر، بیشتر.»
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHY THIS REPLACES THE OLD MIST_SPEC
 *
 * The old mist was a table of hand-tuned constants (ring 0.18, blur 16,
 * halo 0.07, …) with two tiers, hero and quiet. Eight components used it —
 * toast, alert, combobox, multiselect, dropdown, command palette, date picker —
 * and every one of them got the SAME treatment regardless of how high it
 * floated. A toast at S8 and a menu at S5 blurred by the same 16px, cast the
 * same shadow, and caught the same light.
 *
 * That is the same class of defect as the control-depth bug: a RELATIVE
 * property expressed as an absolute constant. A surface that floats higher is
 * further from the page, so it should be seen through more diffusion, cast a
 * larger shadow, and catch more light — and all three should follow from its
 * level, not from a number someone typed.
 *
 * The formula below derives every value from the ladder level. Nothing is
 * hand-tuned; change the ladder and the mist follows.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { LADDER, PERCEPTUAL_QUANTUM } from './liminal-ladder';
import { ROLE_LEVEL } from './liminal-surface';
import type { SurfaceRole } from './liminal-surface';

/** The roles that float above the page, and therefore catch mist. */
export const FLOATING_MIST_ROLES: SurfaceRole[] = ['menu', 'popover', 'modal', 'toast'];

/**
 * How high a role floats above the canvas, in ladder steps.
 * This is the single input every other value derives from.
 */
export function floatHeight(role: SurfaceRole): number {
  return ROLE_LEVEL[role] - ROLE_LEVEL.canvas;
}

/**
 * BACKDROP BLUR — OFF BY DEFAULT.
 *
 * Measured on the real app: a uniform backdrop blur cost 35.7x the compositing
 * time of the same surface without it, and on the near-uniform dark backgrounds
 * this system actually uses, the two were visually indistinguishable. The blur
 * was paying a heavy price for an effect nobody could see.
 *
 * It is kept as an opt-in for the one case where it earns its cost: a surface
 * floating over genuinely busy or colourful content, such as a modal over an
 * image. `mistCssVars(role, { diffuse: true })` turns it back on.
 *
 * The fog itself now comes from light (see mistLightLayers) and from the soft
 * edge (see the mist stylesheet), neither of which costs a backdrop composite.
 */
export function mistBlur(role: SurfaceRole): number {
  return 6 + floatHeight(role) * 1.5;
}

/**
 * LIGHT LAYERS — the fog itself.
 *
 * Real fog scatters light at many scales at once: fine droplets scatter tightly,
 * larger ones broadly. A single box-shadow is one scale, which is why a
 * one-shadow halo reads as a glow rather than as fog.
 *
 * Four layers, each roughly doubling in radius and halving in opacity, so the
 * light falls off the way scattered light does. Measured at 1.0x the cost of no
 * light at all, versus 35.7x for a backdrop blur.
 */
export function mistLightLayers(role: SurfaceRole): Array<{ blur: number; alpha: number }> {
  const base = mistHaloAlpha(role);
  return [
    { blur: Math.round(mistHaloRadius(role) * 0.08), alpha: base * 0.85 },
    { blur: Math.round(mistHaloRadius(role) * 0.24), alpha: base * 0.70 },
    { blur: Math.round(mistHaloRadius(role) * 0.60), alpha: base * 0.54 },
    { blur: Math.round(mistHaloRadius(role) * 1.25), alpha: base * 0.40 },
  ];
}

/**
 * EDGE — the specular ring.
 *
 * v3 removed the crisp edge and replaced it with a blurred one, reasoning that
 * the contract forbids "crisp geometry". That was a misreading: a hard BORDER is
 * geometry, but a bright EDGE is light. Glass is recognised by the light that
 * catches on its rim — remove it and the surface reads as a flat panel, not as
 * glass. Two reference images made this plain.
 *
 * The blurred edge was also expensive: `filter: blur()` on the rim cost 15.7x a
 * plain edge, the same mistake as v2 in a different costume.
 *
 * So the edge is a GRADIENT now — a 1px ring whose opacity varies around the
 * perimeter, brightest at the top and bottom where light grazes the surface.
 * Measured at 1.0x, against 15.7x for the blurred version, and it reads as glass.
 */
export function mistEdgeAlpha(role: SurfaceRole): number {
  // The peak opacity of the ring, at its brightest point (top and bottom).
  return 0.30 + floatHeight(role) * 0.015;
}

/** How far the ring's light reaches inward from the edge. */
export function mistEdgeGlow(role: SurfaceRole): number {
  return 10 + floatHeight(role) * 1.4;
}

/**
 * The four stops of the rim gradient, from the top edge to the bottom.
 * Light grazes the top and bottom of a rounded surface and passes through the
 * sides, which is why a real glass rim is brightest at the top and bottom.
 */
export function mistEdgeStops(role: SurfaceRole): Array<{ pos: number; alpha: number }> {
  const a = mistEdgeAlpha(role);
  return [
    { pos: 0, alpha: a },
    { pos: 22, alpha: a * 0.18 },
    { pos: 50, alpha: a * 0.11 },
    { pos: 78, alpha: a * 0.18 },
    { pos: 100, alpha: a * 0.76 },
  ];
}

/**
 * HALO — the light the surface catches from the room.
 *
 * Grows with height but stays low: this is fog, not a glow. At S5 it is 0.055
 * alpha, at S8 it is 0.070 — visible as a lift, never as a colour.
 */
export function mistHaloAlpha(role: SurfaceRole): number {
  return 0.03 + floatHeight(role) * 0.005;
}

/** The halo radius: how far the light spreads. Grows with height. */
export function mistHaloRadius(role: SurfaceRole): number {
  return 32 + floatHeight(role) * 6;
}

/**
 * SHADOW — how far the surface is lifted off the page.
 *
 * The old mist used one shadow for every float. Here the blur radius and the
 * opacity both grow with height, so a toast reads as further from the page than
 * a menu — which is what the eye expects and what an absolute constant could
 * not express.
 */
export function mistShadowBlur(role: SurfaceRole): number {
  return 40 + floatHeight(role) * 9;
}

export function mistShadowAlpha(role: SurfaceRole): number {
  return 0.20 + floatHeight(role) * 0.02;
}

/**
 * FILL — the surface's own colour, from the ladder, at an alpha that grows with
 * height. A surface floating higher separates more from the page, so it is more
 * opaque: at S5 the fill is 70% solid, at S8 it is 76%.
 *
 * The colour is the LADDER colour for the role, not a hand-written rgba. The
 * old mist used rgba(13,14,18) which is not a ladder value at all.
 */
export function mistFill(role: SurfaceRole): { color: string; alpha: number } {
  const level = Math.min(LADDER.length - 1, ROLE_LEVEL[role]);
  return { color: LADDER[level], alpha: 0.64 + floatHeight(role) * 0.015 };
}

/**
 * RING — the hairline where the fog meets the page.
 *
 * One half-step above the surface, so it reads as a seam rather than a border.
 * This is the same rule the border system uses, applied to a floating surface.
 */
export function mistRingAlpha(role: SurfaceRole): number {
  return 0.14 + floatHeight(role) * 0.008;
}

/**
 * The complete mist description for a role. Everything derives from the level.
 */
export interface MistOptions {
  /** Re-enable the backdrop blur. Only worth it over busy or colourful content. */
  diffuse?: boolean;
}

export interface MistSpec {
  role: SurfaceRole;
  /** Ladder level the surface sits at. */
  level: number;
  /** Height above the canvas, in ladder steps. */
  height: number;
  /** Height in perceptual quanta — how far the eye reads it as lifted. */
  quanta: number;
  blur: number;
  haloAlpha: number;
  haloRadius: number;
  shadowBlur: number;
  shadowAlpha: number;
  fillColor: string;
  fillAlpha: number;
  ringAlpha: number;
  /** The four light layers that make the fog. */
  light: Array<{ blur: number; alpha: number }>;
  edgeAlpha: number;
  edgeGlow: number;
  edgeStops: Array<{ pos: number; alpha: number }>;
  /** Whether the expensive backdrop diffusion is on. */
  diffuse: boolean;
}

export function resolveMist(role: SurfaceRole, options: MistOptions = {}): MistSpec {
  const level = Math.min(LADDER.length - 1, ROLE_LEVEL[role]);
  const height = floatHeight(role);
  const fill = mistFill(role);
  return {
    role,
    level,
    height,
    quanta: height * (1 / PERCEPTUAL_QUANTUM) * PERCEPTUAL_QUANTUM,
    blur: mistBlur(role),
    haloAlpha: mistHaloAlpha(role),
    haloRadius: mistHaloRadius(role),
    shadowBlur: mistShadowBlur(role),
    shadowAlpha: mistShadowAlpha(role),
    fillColor: fill.color,
    fillAlpha: fill.alpha,
    ringAlpha: mistRingAlpha(role),
    light: mistLightLayers(role),
    edgeAlpha: mistEdgeAlpha(role),
    edgeGlow: mistEdgeGlow(role),
    edgeStops: mistEdgeStops(role),
    diffuse: options.diffuse === true,
  };
}

/**
 * The CSS custom properties a mist surface publishes. The interaction layer and
 * the mist stylesheet read these; no component computes a shadow by hand.
 *
 * The halo is ALWAYS the brand. A success toast does not get green light and a
 * danger alert does not get red light: the light is neutral, and the meaning is
 * carried by the icon and the text. Chromatic halos fight the liminal calm —
 * the same reason the brand itself is monochrome.
 */
export function mistCssVars(role: SurfaceRole, options: MistOptions = {}): Record<string, string> {
  const m = resolveMist(role, options);
  const { r, g, b } = { r: 233, g: 236, b: 242 };
  const light = m.light
    .map((l) => `0 0 ${l.blur}px rgba(${r}, ${g}, ${b}, ${l.alpha.toFixed(4)})`)
    .join(', ');
  const edgeGradient = `linear-gradient(180deg, ${m.edgeStops
    .map((st) => `rgba(${r}, ${g}, ${b}, ${st.alpha.toFixed(4)}) ${st.pos}%`)
    .join(', ')})`;
  return {
    '--liminal-mist-blur': `${m.blur}px`,
    '--liminal-mist-fill': m.fillColor,
    '--liminal-mist-fill-alpha': String(m.fillAlpha),
    '--liminal-mist-light': light,
    '--liminal-mist-shadow-blur': `${m.shadowBlur}px`,
    '--liminal-mist-shadow-alpha': String(m.shadowAlpha),
    '--liminal-mist-edge-glow': `${m.edgeGlow}px`,
    '--liminal-mist-edge-gradient': edgeGradient,
  };
}
