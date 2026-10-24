import { describe, it, expect } from 'vitest';
import {
  LADDER_B,
  LADDER_B_TOP,
  LADDER_B_EYE_TEST,
  lightnessStar,
  stepLStar,
  ladderHex,
  BORDER_HALF_B,
  FLOATING_LEVELS_B,
  borderHalfHex,
  computeBorderHalfHex,
  RIM_HALF_B,
  rimHalfHex,
  computeRimHalf,
  SHADOW_NEAR_B,
  shadowCss,
} from '../liminal-ladder-b';

/** Approved on 2026-10-24. Changing any of these is a new decision, not a refactor. */
const APPROVED = ['#060709', '#0B0B0B', '#0E0E0E', '#111111', '#131313', '#151515', '#171717'];

describe('LADDER B — the approved ladder', () => {
  it('has the approved hexes, in order, canvas first', () => {
    expect(LADDER_B.map((s) => s.hex)).toEqual(APPROVED);
  });

  it('has six levels above the canvas and no more', () => {
    expect(LADDER_B_TOP).toBe(6);
    expect(() => ladderHex(7)).toThrow(RangeError);
    expect(() => ladderHex(-1)).toThrow(RangeError);
    expect(() => ladderHex(1.5)).toThrow(RangeError);
  });

  it('every step above the canvas is neutral (R = G = B)', () => {
    for (const s of LADDER_B.slice(1)) {
      const r = s.hex.slice(1, 3), g = s.hex.slice(3, 5), b = s.hex.slice(5, 7);
      expect([g, b]).toEqual([r, r]);
    }
  });

  it('lightness rises strictly from the canvas to the top', () => {
    const L = LADDER_B.map((s) => lightnessStar(s.hex));
    for (let i = 1; i < L.length; i++) expect(L[i]).toBeGreaterThan(L[i - 1]);
  });
});

describe('LADDER B — the steps are the ones the eye accepted', () => {
  it('every step is about one L* (the approved band is 0.8 – 1.2)', () => {
    for (let level = 1; level <= LADDER_B_TOP; level++) {
      const d = stepLStar(level);
      expect(d).toBeGreaterThanOrEqual(0.8);
      expect(d).toBeLessThanOrEqual(1.2);
    }
  });

  it('the top stays under the recorded ceiling (L* ≈ 7.7)', () => {
    expect(lightnessStar(LADDER_B[LADDER_B_TOP].hex)).toBeLessThan(7.8);
  });
});

describe('LADDER B — the eye-test record is internally consistent', () => {
  const t = LADDER_B_EYE_TEST;

  it('every adjacent pair was seen', () => {
    expect(t.adjacentSeen).toBe(t.adjacentPairs);
    expect(t.adjacentPairs).toBe(LADDER_B_TOP * 3);
  });

  it('identical pairs were not reported as different', () => {
    expect(t.falseAlarms).toBeLessThanOrEqual(1);
    expect(t.catchPairs).toBeGreaterThan(0);
  });

  it('the ordering was correct', () => {
    expect(t.orderCorrect).toBe(true);
  });

  it('is marked as ONE observer on ONE device — not a validated measurement', () => {
    expect(t.observers).toBe(1);
    expect(t.device).toContain('phone');
  });
});


describe('LADDER B — the border is half a step (eye-approved 2026-10-24)', () => {
  it('the table matches the computed half-step for every non-floating level', () => {
    for (let level = 0; level <= 3; level++) {
      expect(BORDER_HALF_B[level]).toBe(computeBorderHalfHex(level));
    }
  });

  it('every border is neutral and sits between its level and the next', () => {
    for (let level = 0; level <= 3; level++) {
      const b = lightnessStar(BORDER_HALF_B[level]);
      expect(b).toBeGreaterThan(lightnessStar(LADDER_B[level].hex));
      expect(b).toBeLessThan(lightnessStar(LADDER_B[level + 1].hex));
    }
  });

  it('floating levels (S4, S5, S6) have no border — they are separated by shadow only', () => {
    expect(FLOATING_LEVELS_B).toEqual([4, 5, 6]);
    for (const level of FLOATING_LEVELS_B) {
      expect(() => borderHalfHex(level)).toThrow(/floating/);
    }
    expect(() => borderHalfHex(-1)).toThrow(RangeError);
  });
});


describe('LADDER B — the rim is half a step (eye-approved 2026-10-24)', () => {
  it('the table matches the computed rim for S1..S4', () => {
    for (const level of [1, 2, 3, 4]) {
      expect(RIM_HALF_B[level]).toEqual(computeRimHalf(level));
    }
  });

  it('the shape is top > sides > bottom, and every rim is lighter than its surface', () => {
    for (const level of [1, 2, 3, 4]) {
      const r = RIM_HALF_B[level];
      const base = lightnessStar(LADDER_B[level].hex);
      expect(lightnessStar(r.top)).toBeGreaterThanOrEqual(lightnessStar(r.side));
      expect(lightnessStar(r.side)).toBeGreaterThanOrEqual(lightnessStar(r.bottom));
      expect(lightnessStar(r.bottom)).toBeGreaterThanOrEqual(base);
    }
  });

  it('there is no rim on the canvas, on S5 or on S6 (ceiling and canvas rules)', () => {
    expect(() => rimHalfHex(0)).toThrow(RangeError);
    expect(() => rimHalfHex(5)).toThrow(RangeError);
    expect(() => rimHalfHex(6)).toThrow(RangeError);
  });
});


describe('LADDER B — the shadow is NEAR (chosen by eye 2026-10-24)', () => {
  it('the approved shadow is the near candidate', () => {
    expect(SHADOW_NEAR_B).toEqual({ offsetY: 2, blur: 8, alpha: 0.45 });
  });

  it('floating levels get the shadow, as a CSS box-shadow', () => {
    for (const level of FLOATING_LEVELS_B) {
      expect(shadowCss(level)).toBe('0 2px 8px rgba(0,0,0,0.45)');
    }
  });

  it('non-floating levels get no shadow', () => {
    for (const level of [0, 1, 2, 3]) {
      expect(() => shadowCss(level)).toThrow(/not floating/);
    }
  });
});
