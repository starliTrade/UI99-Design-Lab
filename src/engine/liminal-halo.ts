/**
 * HALO — a separate system piece (owner, 2026-10-24). Not a rim, not an enhancement.
 * Approved halos: soft (H1), medium (H2), wide (H4). H3 was rejected.
 * Targets may take any approved halo. The default is none.
 * Values are independent of the ladder; they were eye-approved on the B palette and
 * must be re-checked on the v2 ladder before use (see policy v2, section 5).
 */

export interface HaloSpec {
  readonly blur: number;
  readonly spread: number;
  readonly alpha: number;
}

export const HALO = {
  soft: { blur: 6, spread: 1, alpha: 0.03 },
  medium: { blur: 12, spread: 2, alpha: 0.03 },
  wide: { blur: 16, spread: 4, alpha: 0.02 },
} as const satisfies Record<string, HaloSpec>;

export type HaloName = keyof typeof HALO;

export function haloCss(name: HaloName): string {
  if (!Object.prototype.hasOwnProperty.call(HALO, name)) {
    throw new RangeError(`halo "${name}" is not approved (soft, medium, wide)`);
  }
  const h = HALO[name];
  return `0 0 ${h.blur}px ${h.spread}px rgba(255, 255, 255, ${h.alpha})`;
}

export const HALO_TARGETS = ['surface', 'card', 'button', 'input', 'floating', 'focus', 'chip', 'tab'] as const;
export type HaloTarget = (typeof HALO_TARGETS)[number];

export function haloFor(target: HaloTarget, name: HaloName | null): string | null {
  if (!(HALO_TARGETS as readonly string[]).includes(target)) {
    throw new RangeError(`target "${target}" is not a halo target`);
  }
  return name === null ? null : haloCss(name);
}
