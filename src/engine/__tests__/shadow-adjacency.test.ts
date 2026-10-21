// THE ADJACENCY RULE, applied to shadows: a floating surface on S(n) casts its shadow
// onto S(n-1) ONLY. Its darkness is computed from that host — never from a level two below.
import { describe, it, expect } from 'vitest';
import { shadowPeakAlpha, shadowModel, floatShadow } from '../liminal-shadow';
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
// the lightness drop, in quanta, that a shadow of alpha `a` makes over `host`
const dropOver = (a: number, host: readonly number[]) => (L(over(a, host)) - L(host)) / Q;

describe('adjacency — a floating shadow falls only on the layer directly below', () => {
  it('the shadow of S(n) is anchored to S(n-1): its peak is one quantum under THAT host', () => {
    for (let n = 1; n < LADDER.length; n++) {
      const host = rgb(LADDER[n - 1]);
      const dq = dropOver(shadowPeakAlpha(host), host);
      expect(dq, `S${n} onto S${n - 1}`).toBeGreaterThan(-1.005);
      expect(dq, `S${n} onto S${n - 1}`).toBeLessThan(-0.995);
    }
  });

  it('the shadow built for S(n-1) is NOT the one that lands on S(n-2) — each layer has its own host', () => {
    for (let n = 2; n < LADDER.length; n++) {
      const aBelow = shadowPeakAlpha(rgb(LADDER[n - 1]));
      const dqSkipped = dropOver(aBelow, rgb(LADDER[n - 2]));
      expect(Math.abs(dqSkipped + 1), `S${n}'s shadow over S${n - 2}`).toBeGreaterThan(0.005);
    }
  });

  it('the CSS of a floating shadow on S(n) carries the alpha of its host S(n-1)', () => {
    for (let n = 1; n < LADDER.length; n++) {
      const h = n; // a surface at height n sits on S(n-1)
      const { nearAlpha } = shadowModel(h, rgb(LADDER[n - 1]));
      expect(floatShadow(h, rgb(LADDER[n - 1])), `S${n}`).toContain(`rgba(1, 2, 3, ${nearAlpha.toFixed(4)})`);
    }
  });

  it('a shadow onto the canvas (S0) is the one for S0 — no shadow reads from above the host', () => {
    const canvas = rgb(LADDER[0]);
    expect(dropOver(shadowPeakAlpha(canvas), canvas)).toBeGreaterThan(-1.005);
    expect(dropOver(shadowPeakAlpha(canvas), canvas)).toBeLessThan(-0.995);
  });
});
