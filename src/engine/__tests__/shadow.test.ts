import { describe, it, expect } from 'vitest';
import { shadowModel, shadowPeakAlpha, floatShadow, REST_SHADOW, SHADOW_FLOOR } from '../liminal-shadow';
import { oklchToRgb } from '../liminal-color-math';
import { CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE } from '../liminal-ladder';

/** The work plane, as sRGB — what a floating surface falls on. */
const HOST = (() => {
  const { r, g, b } = oklchToRgb({ L: CANVAS_L + 2 * LADDER_STEP, C: LADDER_CHROMA, h: LADDER_HUE });
  return [r, g, b];
})();
import { oklchLightness } from '../liminal-color-math';
import { PERCEPTUAL_QUANTUM, LADDER } from '../liminal-ladder';
import { FLOAT_SHADOWS, FLOATING_ROLES, ROLE_LEVEL } from '../liminal-surface';
import { floatHeight, mistShadowNearRadius, mistShadowFarRadius } from '../liminal-mist';

/**
 * ONE PRODUCER, AND TWO JOBS THAT ARE NOT THE SAME JOB.
 *
 * The engine answered "how big is a shadow" twice: a derivation from height, and
 * four hand-written strings called `SHADOWS[1..4]`. Measured side by side at the
 * same four heights they disagreed about everything — the derived far radius
 * grows 18% from the lowest floating layer to the highest, the hand-written one
 * grew 633%. The reader chose the derivation, by eye, and said what a shadow is
 * for: it should be FELT, not seen.
 *
 * These assertions hold the three things that make that true.
 */
describe('shadow — one model, and the two jobs it serves', () => {
  it('the RADIUS grows with height, and the DARKNESS does not', () => {
    /**
     * The darkness is one quantum by construction now, at every height and on every
     * host — the alpha is SOLVED for it rather than written down. So what grows with
     * height is the radius: a surface that floats higher blocks light over a wider
     * area. A shadow that got darker with height would be saying "higher is darker",
     * which is not what height means.
     */
    const low = shadowModel(5, HOST);
    const high = shadowModel(8, HOST);
    expect(high.near).toBeGreaterThan(low.near);
    expect(high.far).toBeGreaterThan(low.far);
    expect(high.peak).toBeCloseTo(low.peak, 6);
    expect(high.nearAlpha).toBeCloseTo(low.nearAlpha, 6);
  });

  /**
   * THE OLD ASSERTION HERE SAID "grows SLOWLY", AND IT WAS PROTECTING THE DEFECT.
   *
   * It was written when the mist's model beat the hand-written scale, and it held
   * that the far radius grows less than 30% across the four floating heights. That
   * was true — and it was the problem: a 40px constant dominated the radius, so
   * every floating surface cast essentially the same wide shadow and the height
   * moved it by 18%.
   *
   * The reader then said the shadow was "blatant, jarring, obvious and separate"
   * while the border and the rim were at the boundary. So the property this file
   * holds is not "grows slowly" — it is "grows ENOUGH to answer the height, and
   * lands at the threshold". Both are asserted below.
   */
  it('the mist and the named view cannot disagree — one formula, two doors', () => {
    for (const role of FLOATING_ROLES) {
      const height = floatHeight(role);
      expect(FLOAT_SHADOWS[role], `${role} shadow`).toBe(floatShadow(height, HOST));
      expect(mistShadowNearRadius(role)).toBe(shadowModel(height, HOST).near);
      expect(mistShadowFarRadius(role)).toBe(shadowModel(height, HOST).far);
    }
  });

  it('is named by ROLE, not by a tier number', () => {
    // `SHADOWS[1..4]` needed a comment — "dropdown, header", "featured card" — to
    // say what each number was for. A number that needs a comment is a name that
    // has not been written.
    expect(Object.keys(FLOAT_SHADOWS).sort()).toEqual([...FLOATING_ROLES].sort());
    for (const role of FLOATING_ROLES) expect(FLOAT_SHADOWS[role]).toContain('px');
  });

  it('an object resting on a surface is NOT a small floating surface', () => {
    // A knob touches its surface, so its shadow is a contact shadow: tight, dark,
    // directly below. The defect was never that there were two shadows — it was
    // that one record tried to be both.
    expect(REST_SHADOW).not.toBe(floatShadow(ROLE_LEVEL.control, HOST));
    // A contact shadow is tight: no radius anywhere near a floating one.
    const radii = [...REST_SHADOW.matchAll(/(\d+)px/g)].map((m) => Number(m[1]));
    expect(Math.max(...radii), 'a contact shadow must stay tight').toBeLessThan(8);
  });

  it('the PEAK is within a quantum of the threshold, at every height', () => {
    /**
     * THE ASSERTION THE OLD MODEL WOULD HAVE FAILED.
     *
     * A shadow is two layers, and where they overlap the darkness is not either
     * alpha: it is `1 - (1-a)(1-b)`. The old model's peak was 0.642 combined,
     * which composites to #040507 over the work plane — 4.07q, FOUR times the
     * threshold. That is why the reader called the shadow "blatant, jarring,
     * obvious and separate" while the border and the rim were at the boundary.
     *
     * `felt, not seen` is a number, and the number is one quantum.
     */
    // The peak is one quantum below whatever it falls on, at EVERY host — because
    // the alpha is solved per host rather than written down once. Measured in
    // CONTINUOUS space: rounding the composite to a hex first would measure the
    // display rather than the system.
    const linear = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const L = (c: number[]) => {
      const [R, G, B] = c.map(linear);
      const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
      const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
      const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
      return 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    };
    const hostRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    for (const hostHex of [LADDER[0], LADDER[2], LADDER[3]]) {
      const host = hostRgb(hostHex);
      const peak = shadowPeakAlpha(host);
      const composite = host.map((b, i) => b + peak * ([1, 2, 3][i] - b));
      const quanta = Math.abs((L(composite) - L(host)) / PERCEPTUAL_QUANTUM);
      expect(quanta, `on ${hostHex}: the peak is ${quanta.toFixed(3)}q`).toBeCloseTo(1, 2);
    }
  });

  it('and it scales from the height, with no constant dominating it', () => {
    // The old far radius was `40 + h*3.2`: a 40px constant that was 93% of the
    // value at height 1 and 61% at height 8, so every surface cast the same wide
    // shadow. A shadow that does not answer to height cannot be at the threshold
    // of anything.
    const growth = shadowModel(8, HOST).far / shadowModel(1, HOST).far;
    expect(growth, 'the far radius barely moves with height').toBeGreaterThan(3);
  });

  it('says where a shadow may fall', () => {
    // Both shadow colours are darker than the canvas and the work plane, and
    // NEITHER is darker than a well. Light does not fall upward.
    expect(SHADOW_FLOOR).toContain('never onto a well');
  });
});
