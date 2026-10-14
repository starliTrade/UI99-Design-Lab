import { describe, it, expect } from 'vitest';
import { shadowModel, floatShadow, REST_SHADOW, SHADOW_FLOOR } from '../liminal-shadow';
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

  it('grows SLOWLY — a floating surface does not double its shadow per step', () => {
    // The hand-written scale grew 633% across the four heights; this grows 18%.
    // A shadow that tracks height that steeply is a shadow that reads as a
    // graphic rather than as light.
    const growth = shadowModel(8).far / shadowModel(5).far;
    expect(growth).toBeGreaterThan(1);
    expect(growth).toBeLessThan(1.3);
  });

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

  it('says where a shadow may fall', () => {
    // Both shadow colours are darker than the canvas and the work plane, and
    // NEITHER is darker than a well. Light does not fall upward.
    expect(SHADOW_FLOOR).toContain('never onto a well');
  });
});
