import { describe, it, expect } from 'vitest';
import {
  LADDER_B,
  LADDER_B_TOP,
  LADDER_B_EYE_TEST,
  lightnessStar,
  stepLStar,
  ladderHex,
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
