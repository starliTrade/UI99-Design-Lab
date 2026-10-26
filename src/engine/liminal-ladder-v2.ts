/**
 * LIMINAL LADDER v2.0 — the locked engine reference (ui_engine_reference_v2.pdf, 2026.10).
 *
 * Base: 9 layers (S0..S8), pure JND, dY = k × √Y with k = 0.025 (De Vries–Rose).
 * Component = (parent + 1) × enhancement, enhancement ∈ { plain, border, shadow, rim }.
 * Each enhancement is perceived at 0.5 × JND.
 *
 * Every colour comes from the ladder. Nothing leaves it.
 */

export interface LayerSpec {
  readonly level: number;
  readonly role: string;
  readonly hex: string;
}

export const LADDER_V2 = [
  { level: 0, role: 'canvas', hex: '#060709' },
  { level: 1, role: 'surface', hex: '#0B0B0B' },
  { level: 2, role: 'elevated', hex: '#0F0F0F' },
  { level: 3, role: 'overlay', hex: '#131313' },
  { level: 4, role: 'sub-overlay', hex: '#171717' },
  { level: 5, role: 'popover', hex: '#1B1B1B' },
  { level: 6, role: 'sub-popover', hex: '#1F1F1F' },
  { level: 7, role: 'modal', hex: '#232323' },
  { level: 8, role: 'extension', hex: '#272727' },
] as const satisfies readonly LayerSpec[];

export const LADDER_TOP = LADDER_V2.length - 1; // 8
export const JND_K = 0.025;
export const PERCEPTUAL_FACTOR = 0.5;

export type Enhancement = 'plain' | 'border' | 'shadow' | 'rim';
export const ENHANCEMENTS = ['plain', 'border', 'shadow', 'rim'] as const;

function assertLevel(level: number): void {
  if (!Number.isInteger(level) || level < 0 || level > LADDER_TOP) {
    throw new RangeError(`level ${level} is outside the ladder (0..${LADDER_TOP})`);
  }
}

/** Relative luminance Y of a #RRGGBB colour (sRGB, WCAG). */
export function luminanceY(hex: string): number {
  const toLin = (c: number): number => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}

/** The JND (dY) at a level: k × √Y. */
export function jndAt(level: number): number {
  assertLevel(level);
  return JND_K * Math.sqrt(luminanceY(LADDER_V2[level].hex));
}

/** dY between a level and the one above it, in JND units. Locked reference mean ≈ 1.034. */
export function stepInJnd(level: number): number {
  assertLevel(level);
  if (level === 0) throw new RangeError('S0 has no step below it');
  const prev = luminanceY(LADDER_V2[level - 1].hex);
  const dy = luminanceY(LADDER_V2[level].hex) - prev;
  return dy / (JND_K * Math.sqrt(prev));
}

/** The colour of a layer. */
export function layerHex(level: number): string {
  assertLevel(level);
  return LADDER_V2[level].hex;
}

/** Border (M2): the child layer colour at 50% alpha, 1px. Parent 0..7. */
export function borderCss(parent: number): string {
  assertLevel(parent);
  if (parent >= LADDER_TOP) throw new RangeError('S8 has no child layer for a border');
  const hex = LADDER_V2[parent + 1].hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `1px solid rgba(${r}, ${g}, ${b}, 0.5)`;
}

/**
 * Shadow (M3): opacity = 0.5 × k / √Y_parent, blur = 4 + 8 × (Y_parent / 0.02), offset 2px.
 * Y_parent is the luminance of the parent layer.
 */
export function shadowCss(parent: number): string {
  assertLevel(parent);
  const y = luminanceY(LADDER_V2[parent].hex);
  const opacity = (PERCEPTUAL_FACTOR * JND_K) / Math.sqrt(y);
  const blur = 4 + 8 * (y / 0.02);
  return `0 2px ${blur.toFixed(1)}px rgba(0, 0, 0, ${opacity.toFixed(3)})`;
}

/** Rim (V2): 1px top highlight at 75% width (12.5% inset each side), with a faint shadow and glow. */
export const RIM_V2 = {
  widthPercent: 75,
  heightPx: 1,
  peakAlpha: 0.16,
  edgeAlpha: 0.08,
  shadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
  glow: '0 0 12px 2px rgba(255, 255, 255, 0.020)',
} as const;

export interface ComponentSpec {
  readonly parent: number;
  readonly level: number;
  readonly enhancement: Enhancement;
  readonly background: string;
  readonly border: string | null;
  readonly boxShadow: string | null;
  readonly rim: boolean;
}

/**
 * A component on top of `parent`: it sits at parent + 1 and carries exactly one enhancement.
 * The parent may be 0..7 (S8 has no child).
 */
export function component(parent: number, enhancement: Enhancement): ComponentSpec {
  assertLevel(parent);
  if (parent >= LADDER_TOP) throw new RangeError('S8 cannot hold a child component');
  if (!ENHANCEMENTS.includes(enhancement)) {
    throw new RangeError(`enhancement "${enhancement}" is not one of ${ENHANCEMENTS.join(', ')}`);
  }
  const level = parent + 1;
  return {
    parent,
    level,
    enhancement,
    background: LADDER_V2[level].hex,
    border: enhancement === 'border' ? borderCss(parent) : null,
    boxShadow: enhancement === 'shadow' ? shadowCss(parent) : null,
    rim: enhancement === 'rim',
  };
}
