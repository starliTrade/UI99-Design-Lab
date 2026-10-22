// POLICY §6 — the rim is ONE light on the top edge: top +1.5 steps, side +1, bottom +0.5.
// Pinned in OKLab lightness, in quanta (q), so the numbers are the ones the policy quotes.
import { describe, it, expect } from 'vitest';
import { getDirectionalRim, RIM } from '../spec-engine';
import { LADDER, LADDER_STEP } from '../liminal-ladder';
import { ROLE_RIM } from '../liminal-surface';
import { getLadderColor } from '../liminal-ladder';

const Q = 0.0083;
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
function L(c: readonly number[]): number {
  const [R, G, B] = c.map(lin);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
}
const toHex = (c: string) => (c.startsWith('#') ? c : null);
// lightness of the rim stop, relative to its surface, in quanta
const dq = (stop: string, n: number) => (L(hex(stop)) - L(hex(LADDER[n]))) / Q;

describe('POLICY §6 — the rim: one light, three stops, one step apart', () => {
  it('the offsets are 1.5 / 1 / 0.5 steps', () => {
    expect(RIM).toEqual({ t: 1.5, s: 1.0, b: 0.5 });
  });

  it('with room, the top is 1.71q, the side 1.14q, the bottom 0.57q above the surface (S0–S5)', () => {
    for (let n = 0; n <= 5; n++) {
      const [top] = [getDirectionalRim(n, true)!.top];
      expect(dq(top, n), `S${n} top`).toBeGreaterThan(1.71 - 0.15);
      expect(dq(top, n), `S${n} top`).toBeLessThan(1.71 + 0.15);
      expect(dq(getDirectionalRim(n, true)!.side, n), `S${n} side`).toBeGreaterThan(1.14 - 0.15);
      expect(dq(getDirectionalRim(n, true)!.side, n), `S${n} side`).toBeLessThan(1.14 + 0.15);
      expect(dq(getDirectionalRim(n, true)!.bot, n), `S${n} bottom`).toBeGreaterThan(0.57 - 0.15);
      expect(dq(getDirectionalRim(n, true)!.bot, n), `S${n} bottom`).toBeLessThan(0.57 + 0.15);
    }
  });

  it('the step itself is the one quantum scale: 1.5 steps ≈ 1.71q', () => {
    expect((RIM.t * LADDER_STEP) / Q).toBeGreaterThan(1.70);
    expect((RIM.t * LADDER_STEP) / Q).toBeLessThan(1.72);
  });

  it('the rim is ordered: top is the brightest, bottom the faintest, all above the surface', () => {
    for (let n = 0; n <= 5; n++) {
      const [t, s, b] = [getDirectionalRim(n, true)!.top, getDirectionalRim(n, true)!.side, getDirectionalRim(n, true)!.bot].map((c) => dq(c, n));
      expect(t, `S${n}`).toBeGreaterThan(s);
      expect(s, `S${n}`).toBeGreaterThan(b);
      expect(b, `S${n}`).toBeGreaterThan(0);
    }
  });

  it('near the ceiling the rim COMPRESSES, it does not invert: S7 keeps its direction', () => {
    const [t, , b] = [getDirectionalRim(7, true)!.top, getDirectionalRim(7, true)!.side, getDirectionalRim(7, true)!.bot].map((c) => dq(c, 7));
    expect(t).toBeGreaterThan(0);
    expect(b).toBeGreaterThan(0);
    expect(t).toBeGreaterThan(b);
  });

  it('at S8 there is no room above, so the whole rim sits below and is darker than its surface', () => {
    [getDirectionalRim(8, true)!.top, getDirectionalRim(8, true)!.side, getDirectionalRim(8, true)!.bot].forEach((c) => expect(dq(c, 8)).toBeLessThan(0));
  });

  it('a well (concave) inverts: its top is darker, its bottom lighter, than its surface', () => {
    const stops = [getDirectionalRim(2, true, true)!.top, getDirectionalRim(2, true, true)!.side, getDirectionalRim(2, true, true)!.bot];
    expect(dq(stops[0], 2)).toBeLessThan(0);
    expect(dq(stops[2], 2)).toBeGreaterThan(0);
  });

  it('a surface without a rim gets none; the roles that have one are the ones the policy names', () => {
    expect(getDirectionalRim(3, false)).toBeNull();
    const withRim = Object.entries(ROLE_RIM).filter(([, v]) => v).map(([k]) => k).sort();
    expect(withRim).toEqual(['control', 'menu', 'modal', 'panel', 'popover', 'toast', 'well']);
    expect(ROLE_RIM.canvas).toBe(false);
    expect(ROLE_RIM.region).toBe(false);
  });
});
