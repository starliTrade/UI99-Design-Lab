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
  hoverHex,
  activeRim,
  disabledHex,
  disabledTextCss,
  focusSpec,
  focusCss,
  cardEdge,
  FOCUS_GAP_PX,
  FOCUS_RING_PX,
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

  it('non-floating levels get no shadow, except a card variant on S1..S3', () => {
    for (const level of [0, 1, 2, 3]) {
      expect(() => shadowCss(level)).toThrow(/not floating/);
    }
    expect(shadowCss(2, true)).toBe('0 2px 8px rgba(0,0,0,0.45)');
    expect(() => shadowCss(0, true)).toThrow(/not floating/);
  });
});

describe('LADDER B — states: hover, active, disabled (eye-approved 2026-10-24)', () => {
  it('hover is half a step up: S3 gives #121212', () => {
    expect(hoverHex(3)).toBe('#121212');
  });

  it('active is the half-step rim of the level', () => {
    expect(activeRim(3)).toEqual(rimHalfHex(3));
    expect(activeRim(3)).toEqual({ top: '#121212', side: '#121212', bottom: '#111111' });
  });

  it('disabled is half a step down: S3 gives #101010, below S3', () => {
    expect(disabledHex(3)).toBe('#101010');
    expect(disabledHex(3)).not.toBe(hoverHex(3));
    expect(disabledHex(3)).not.toBe(activeRim(3).top);
  });

  it('disabled text is white at alpha 0.35', () => {
    expect(disabledTextCss()).toBe('rgba(255,255,255,0.35)');
  });

  it('disabled differs from hover and from the active rim top on the same level', () => {
    // Hover and the active rim top both sit at #121212 on S3 (known, approved as shown).
    // The active state is told apart by its rim shape, not by a different value.
    expect(hoverHex(3)).toBe(activeRim(3).top);
    expect(disabledHex(3)).not.toBe(hoverHex(3));
    expect(disabledHex(3)).not.toBe(activeRim(3).top);
  });

  it('disabled has no level below S0', () => {
    expect(() => disabledHex(0)).toThrow(/no step below/);
  });
});

describe('LADDER B — focus: 1px gap, lighter ring (chosen by eye 2026-10-24)', () => {
  it('the approved focus is a 1px gap and a 1px ring', () => {
    expect(FOCUS_GAP_PX).toBe(1);
    expect(FOCUS_RING_PX).toBe(1);
  });

  it('on S3 the gap is S2 and the ring is S4 (lighter, one step)', () => {
    expect(focusSpec(3)).toEqual({ gapHex: '#0E0E0E', ringHex: '#131313', gapPx: 1, ringPx: 1 });
  });

  it('the CSS is a 1px gap then a 2px-wide ring, both from the ladder', () => {
    expect(focusCss(3)).toBe('0 0 0 1px #0E0E0E, 0 0 0 2px #131313');
  });

  it('the ring is always lighter than the control', () => {
    for (let level = 1; level < LADDER_B_TOP; level++) {
      expect(lightnessStar(focusSpec(level).ringHex)).toBeGreaterThan(lightnessStar(ladderHex(level)));
    }
  });

  it('levels without a step above or below have no focus ring', () => {
    expect(() => focusSpec(0)).toThrow(/no focus ring/);
    expect(() => focusSpec(LADDER_B_TOP)).toThrow(/no focus ring/);
  });
});

describe('LADDER B — card variants (rule of 2026-10-24)', () => {
  it('simple has no border, no rim, no shadow', () => {
    expect(cardEdge(1, ['simple'])).toEqual({ border: null, rim: null, shadow: null });
  });

  it('bordered uses the level border; rimmed uses the level rim; shadowed the near shadow', () => {
    expect(cardEdge(2, ['bordered']).border).toBe(borderHalfHex(2));
    expect(cardEdge(2, ['rimmed']).rim).toEqual(rimHalfHex(2));
    expect(cardEdge(2, ['shadowed']).shadow).toBe('0 2px 8px rgba(0,0,0,0.45)');
  });

  it('border and rim may combine on one card', () => {
    const e = cardEdge(3, ['bordered', 'rimmed']);
    expect(e.border).toBe(borderHalfHex(3));
    expect(e.rim).toEqual(rimHalfHex(3));
  });

  it('simple cannot combine with another variant', () => {
    expect(() => cardEdge(1, ['simple', 'bordered'])).toThrow(/cannot be combined/);
  });

  it('a card level is 1..3 only (canvas and floating are not cards)', () => {
    expect(() => cardEdge(0, ['simple'])).toThrow(/not a card level/);
    expect(() => cardEdge(4, ['simple'])).toThrow(/not a card level/);
  });
});
