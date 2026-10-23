// POLICY §5 — the shadow peak is exactly one quantum below its host, on every
// ladder level; the two layers recombine to that peak; radius is linear in height.
import { describe, it, expect } from 'vitest';
import { SHADOW_REACH_STEPS, shadowPeakAlpha, shadowModel, floatShadow } from '../liminal-shadow';
import { LADDER } from '../liminal-ladder';

const Q = 0.0083;
const SHADOW = [1, 2, 3];
const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lin = (v: number) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
function L(c: readonly number[]): number {
  const [R, G, B] = c.map(lin);
  const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  return 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
}
const over = (a: number, host: readonly number[]) => host.map((b, i) => b + a * (SHADOW[i] - b));

describe('POLICY §5 — shadow peak = one quantum, on every level', () => {
  it('the peak lands exactly −1q below each ladder level', () => {
    LADDER.forEach((hex, n) => {
      const host = rgb(hex);
      const a = shadowPeakAlpha(host);
      const dq = (L(over(a, host)) - L(host)) / Q;
      expect(dq, `S${n}`).toBeGreaterThan(-1.005);
      expect(dq, `S${n}`).toBeLessThan(-0.995);
    });
  });

  it('two equal layers recombine to exactly that peak', () => {
    LADDER.forEach((hex, n) => {
      const host = rgb(hex);
      const { nearAlpha, farAlpha, peak } = shadowModel(5, host);
      const combined = 1 - (1 - nearAlpha) * (1 - farAlpha);
      expect(combined, `S${n}`).toBeCloseTo(peak, 9);
    });
  });

  it('the radius is linear in height, one step pulled in (SHADOW_REACH_STEPS)', () => {
    const host = rgb(LADDER[2]);
    for (const h of [5, 6, 7, 8]) {
      const m = shadowModel(h, host);
      expect(m.near).toBeCloseTo(2 + (h - SHADOW_REACH_STEPS) * 1.5, 9);
      expect(m.far).toBeCloseTo(4 + (h - SHADOW_REACH_STEPS) * 6, 9);
    }
  });

  it('the darkness does not grow with height — one quantum at every height', () => {
    const host = rgb(LADDER[3]);
    const p = (h: number) => shadowModel(h, host).peak;
    expect(p(5)).toBeCloseTo(p(8), 12);
  });

  it('writes the shadow as the two-layer CSS value', () => {
    expect(floatShadow(5, rgb(LADDER[2]))).toMatch(/^0 \d+\.\dpx \d+px rgba\(1, 2, 3, [\d.]+\), 0 2px/);
  });
});
