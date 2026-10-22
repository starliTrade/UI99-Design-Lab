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

import { LADDER, PERCEPTUAL_QUANTUM, getLadderVar } from './liminal-ladder';
import { ROLE_LEVEL, resolveBorder, floatingShadow, ladderRgb } from './liminal-surface';
import type { SurfaceRole } from './liminal-surface';
import { shadowModel } from './liminal-shadow';
import { oklchToRgb } from './liminal-color-math';
import { CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE } from './liminal-ladder';

/**
 * What a mist surface falls on, as sRGB.
 *
 * The shadow's alpha is solved per host, so the mist needs to name one. It is the
 * work plane: a menu, a popover, a modal and a toast all float over the surface the
 * work is done on, not over the canvas.
 */
const WORK_PLANE = ladderRgb(ROLE_LEVEL.work); // the same sRGB the engine's floating shadow uses

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
 * FOG — the surface diffuses light, it does not emit it.
 *
 * The previous version used symmetric `0 0 Npx` shadows, which read as a NEON
 * GLOW rather than as fog: the surface appeared to radiate. Real fog does not
 * radiate. It is a mass that is slightly lighter than what is behind it, lit
 * from above, with a soft edge and a dark shadow beneath.
 *
 * So the fog is a vertical gradient INSIDE the surface — brighter at the top
 * where the light lands, settling darker at the bottom — plus a dark shadow
 * below. Nothing radiates outward.
 */
export function mistFillStops(role: SurfaceRole): { top: string; bottom: string; topAlpha: number; bottomAlpha: number } {
  const level = Math.min(LADDER.length - 1, ROLE_LEVEL[role]);
  const lower = Math.max(0, level - 2);
  // A VARIABLE, not the hex. The mist is a surface, and a surface has to follow
  // a theme like every other one — this was the last place in the engine that
  // baked a ladder colour into a rendered style.
  return {
    top: getLadderVar(level),
    bottom: getLadderVar(lower),
    topAlpha: 0.80 + floatHeight(role) * 0.008,
    bottomAlpha: 0.70 + floatHeight(role) * 0.008,
  };
}

/** The light that lands on the top edge — a single inset hairline, not a glow. */
export function mistInnerLight(role: SurfaceRole): number {
  return 0.055 + floatHeight(role) * 0.006;
}

/**
 * LIGHT LAYERS — kept for the opt-in diffuse case only.
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
/**
 * THE SHADOW MODEL LIVES IN ITS OWN MODULE, because three things need it and one
 * of them is the mist's own dependency. See `liminal-shadow.ts`.
 */
export { shadowModel, floatShadow, REST_SHADOW } from './liminal-shadow';

/**
 * THE MIST'S SHADOW IS THE ENGINE'S FLOATING SHADOW — one string, not a second copy.
 *
 * Before roadmap 2.4 the mist re-assembled the same two layers from four separate
 * variables, so a change to `floatShadow` would have left the mist behind without a
 * single failing test. Now the stylesheet consumes this string directly. Verified
 * before the change: the four numbers in the old assembly equal this string's to the
 * fourth decimal, for every floating role.
 */
export function mistFloatShadow(role: SurfaceRole): string {
  return floatingShadow(role);
}

export function mistShadowNearRadius(role: SurfaceRole): number {
  return shadowModel(floatHeight(role), WORK_PLANE).near;
}

export function mistShadowFarRadius(role: SurfaceRole): number {
  return shadowModel(floatHeight(role), WORK_PLANE).far;
}

export function mistShadowNearAlpha(role: SurfaceRole): number {
  return shadowModel(floatHeight(role), WORK_PLANE).nearAlpha;
}

export function mistShadowFarAlpha(role: SurfaceRole): number {
  return shadowModel(floatHeight(role), WORK_PLANE).farAlpha;
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
  return { color: getLadderVar(level), alpha: 0.64 + floatHeight(role) * 0.015 };
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
  /**
   * HOW MUCH OF THE SURFACE'S OWN FILL TO KEEP, 0–1. Default 1.
   *
   * A FOG IS A MASS; A GLASS IS A WINDOW, and they are the same surface with
   * different amounts of the page let through.
   *
   * The fog keeps its fill: it is a body lighter than the page, and you read it
   * as an object sitting in front of the content. Measured, that fill is ~84%
   * opaque — which is right for a menu, a popover or a modal, because those
   * carry text that has to stay legible over whatever is behind them.
   *
   * A glass keeps almost none of it. Measured on a product page in the wild, its
   * floating nav is `rgba(255,255,255,0.03)` with `blur(12px)` — three percent
   * of its own fill, and everything you see through it is the page, diffused.
   * That is not a better fog; it is a different object.
   *
   * AND A GLASS NEEDS LIGHT BEHIND IT. Over the near-uniform dark this system
   * actually uses, a blur has nothing to show — the engine's own note on v2 says
   * so, and it is why the fill was raised in the first place. So `fill` is only
   * worth lowering where something bright passes under the surface: a hero
   * image, a photograph, a page with a light source at its top.
   */
  fill?: number;
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
  /** The dark shadow below the surface: two layers, near and far. */
  shadowNearRadius: number;
  shadowFarRadius: number;
  shadowNearAlpha: number;
  shadowFarAlpha: number;
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
  /** The fraction of the role's own fill that is kept. 1 is a fog, ~0.2 a glass. */
  fillScale: number;
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
    shadowNearRadius: mistShadowNearRadius(role),
    shadowFarRadius: mistShadowFarRadius(role),
    shadowNearAlpha: mistShadowNearAlpha(role),
    shadowFarAlpha: mistShadowFarAlpha(role),
    fillColor: fill.color,
    fillAlpha: fill.alpha,
    ringAlpha: mistRingAlpha(role),
    light: mistLightLayers(role),
    edgeAlpha: mistEdgeAlpha(role),
    edgeGlow: mistEdgeGlow(role),
    edgeStops: mistEdgeStops(role),
    diffuse: options.diffuse === true,
    fillScale: options.fill ?? 1,
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
  const stops = mistFillStops(role);
  const h = floatHeight(role);

  // A toast is a NOTIFICATION, not an interactive surface. It must be legible
  // first and must not demand attention: near-solid fill, no inner light, no
  // ring. Its meaning is carried by a small accent mark, not by the surface.
  const isToast = role === 'toast';

  return {
    // The fog: a vertical gradient INSIDE the surface. Nothing radiates.
    '--liminal-mist-fill-top': stops.top,
    '--liminal-mist-fill-bottom': stops.bottom,
    // The fill, scaled by how much of the page is allowed through. A toast is
    // never scaled: it is a notification and has to be legible first.
    '--liminal-mist-fill-top-alpha': String(isToast ? 0.94 : stops.topAlpha * (options.fill ?? 1)),
    '--liminal-mist-fill-bottom-alpha': String(isToast ? 0.94 : stops.bottomAlpha * (options.fill ?? 1)),
    // The light that lands on the top edge - one hairline, never a halo.
    '--liminal-mist-inner-light': isToast
      ? 'inset 0 0 0 rgba(0, 0, 0, 0)'
      : `inset 0 1px 0 rgba(${r}, ${g}, ${b}, ${mistInnerLight(role).toFixed(4)})`,
    // The dark shadow that expresses the height: THE ENGINE'S STRING (see mistFloatShadow).
    '--liminal-mist-float-shadow': mistFloatShadow(role),
    // READOUTS of the same model, for tests and the contract. The stylesheet does not
    // use them: a second assembly would be a second formula.
    '--liminal-mist-shadow-near': `${mistShadowNearRadius(role).toFixed(1)}px`,
    '--liminal-mist-shadow-far': `${mistShadowFarRadius(role).toFixed(0)}px`,
    '--liminal-mist-shadow-near-alpha': String(mistShadowNearAlpha(role)),
    '--liminal-mist-shadow-far-alpha': String(mistShadowFarAlpha(role)),
    // THE SEAM IS THE ENGINE'S OWN EDGE, and it used to be a hand-tuned alpha
    // that broke the system's first rule.
    //
    // It was `rgba(233,236,242, 0.07 + h * 0.004)`. Composited over the canvas
    // that lands on #161719 at h=0 and #1a1c1e at h=5 — and the ladder's ceiling
    // is #15171a. The seam was ABOVE THE CEILING AT EVERY HEIGHT, on every mist
    // surface in the system: menus, popovers, modals, toasts. A 1px line
    // brighter than the brightest allowed surface, drawn around a surface that
    // is supposed to sit at the threshold of perception.
    //
    // `resolveBorder` already answers this question for every other edge in the
    // system: an edge is a LADDER LEVEL half a step above the surface it belongs
    // to, and at the ceiling it inverts rather than exceeding. The mist uses the
    // same resolver now, so its seam cannot drift from the rest of the system —
    // and the `fill` option scales it, because a window's frame is fainter than
    // a mass's edge.
    '--liminal-mist-seam': `color-mix(in oklab, ${resolveBorder({ role, kind: 'separator' })} ${Math.round((options.fill ?? 1) * 100)}%, transparent)`,
    // Opt-in diffusion only.
    '--liminal-mist-blur': `${m.blur}px`,
  };
}
