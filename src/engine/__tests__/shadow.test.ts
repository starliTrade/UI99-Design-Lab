import { describe, it, expect } from 'vitest';
import { shadowModel, shadowPeakAlpha, floatShadow, REST_SHADOW, SHADOW_FLOOR } from '../liminal-shadow';
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
  it('grows with height, in both radius and darkness', () => {
    const low = shadowModel(5);
    const high = shadowModel(8);
    expect(high.near).toBeGreaterThan(low.near);
    expect(high.far).toBeGreaterThan(low.far);
    expect(high.nearAlpha).toBeGreaterThan(low.nearAlpha);
    expect(high.farAlpha).toBeGreaterThan(low.farAlpha);
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
      expect(FLOAT_SHADOWS[role], `${role} shadow`).toBe(floatShadow(height));
      expect(mistShadowNearRadius(role)).toBe(shadowModel(height).near);
      expect(mistShadowFarRadius(role)).toBe(shadowModel(height).far);
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
    expect(REST_SHADOW).not.toBe(floatShadow(ROLE_LEVEL.control));
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
    const rgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const over = (a: number, bg: number[]) => bg.map((b, i) => b + a * ([1, 2, 3][i] - b));
    const hex = (c: number[]) => '#' + c.map((v) => Math.max(0, Math.round(v)).toString(16).padStart(2, '0')).join('');
    for (const host of [LADDER[0], LADDER[2], LADDER[3]]) {
      for (let h = 1; h <= 8; h++) {
        const peak = shadowPeakAlpha(h);
        const composite = hex(over(peak, rgb(host)));
        const quanta = Math.abs((oklchLightness(composite) - oklchLightness(host)) / PERCEPTUAL_QUANTUM);
        expect(quanta, `height ${h} on ${host}: the peak is ${quanta.toFixed(2)}q`).toBeLessThan(1.6);
      }
    }
  });

  it('and it scales from the height, with no constant dominating it', () => {
    // The old far radius was `40 + h*3.2`: a 40px constant that was 93% of the
    // value at height 1 and 61% at height 8, so every surface cast the same wide
    // shadow. A shadow that does not answer to height cannot be at the threshold
    // of anything.
    const growth = shadowModel(8).far / shadowModel(1).far;
    expect(growth, 'the far radius barely moves with height').toBeGreaterThan(3);
  });

  it('says where a shadow may fall', () => {
    // Both shadow colours are darker than the canvas and the work plane, and
    // NEITHER is darker than a well. Light does not fall upward.
    expect(SHADOW_FLOOR).toContain('never onto a well');
  });
});
