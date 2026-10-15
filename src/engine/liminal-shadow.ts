/**
 * LIMINAL · THE SHADOW MODEL
 *
 * ONE producer, and it takes a NUMBER — the height above what the shadow falls
 * on — so it imports nothing. That matters: it is used by the mist (which owns
 * the floating surface), by the surface resolver (which attaches a shadow to a
 * floating role), and by the generators that write the contract, the CSS
 * variables and the DTCG tokens. A model that imported any of them would make a
 * cycle, and it did — `spec-engine` → mist → surface → `spec-engine` — the first
 * time this was written in the wrong place.
 *
 * WHY IT EXISTS AT ALL. The engine answered "how big is a shadow" twice: this
 * derivation, and four hand-written strings called `SHADOWS[1..4]`. Measured side
 * by side at the same four heights they disagreed about everything — the derived
 * far radius grows 18% from the lowest floating layer to the highest, the
 * hand-written one grew 633%. Both cannot be right.
 *
 * The reader chose this one, by eye, and said what a shadow is for: it should be
 * FELT, not seen. So the hand-written scale is gone and this is the only answer.
 */

/**
 * Height in, radius and darkness out.
 *
 * A floating surface blocks light over a wide area because it is FAR from what it
 * falls on, and the further it floats the wider and softer the shadow.
 *
 * AND IT NOW SCALES FROM THE HEIGHT, WHICH IT DID NOT. The old far radius was
 * `40 + h*3.2` — a 40px CONSTANT that was 93% of the value at height 1 and 61% at
 * height 8. So every floating surface cast essentially the same wide shadow, and
 * the height — the one quantity this system derives everything else from — moved
 * it by 18%. A shadow that does not answer to height cannot be at the threshold of
 * anything. The constant is gone: 10px at height 1, 52px at height 8.
 */
export function shadowModel(height: number) {
  return {
    near: 2 + height * 1.5,
    far: 4 + height * 6,
    nearAlpha: 0.05 + height * 0.006,
    farAlpha: 0.05 + height * 0.005,
  };
}

/**
 * THE PEAK — both layers overlapping just below the surface.
 *
 * A shadow is TWO layers, and where they overlap the darkness is not either
 * alpha: it is `1 - (1-a)(1-b)`. The old model's peak was 0.642 combined, which
 * composites to #040507 over the work plane — **4.07q**, four times the
 * threshold. That is why the reader said the shadow was "blatant, jarring,
 * obvious and separate" while the border and the rim were at the boundary: the
 * shadow was not at the boundary of anything.
 *
 * The alphas are set so the peak lands within a quantum of the threshold at every
 * height, which is what "felt, not seen" means as a number.
 */
export function shadowPeakAlpha(height: number): number {
  const { nearAlpha, farAlpha } = shadowModel(height);
  return 1 - (1 - nearAlpha) * (1 - farAlpha);
}
/** A floating surface's shadow, as a CSS value. */
export function floatShadow(height: number): string {
  const { near, far, nearAlpha, farAlpha } = shadowModel(height);
  return `0 ${near.toFixed(1)}px ${far.toFixed(0)}px rgba(1, 2, 3, ${farAlpha.toFixed(3)}), 0 2px ${near.toFixed(1)}px rgba(1, 2, 3, ${nearAlpha.toFixed(3)})`;
}

/**
 * THE SHADOW OF AN OBJECT RESTING ON A SURFACE — a knob, a thumb, an active tab.
 *
 * NOT a smaller floating shadow, and that is why it has its own name. A floating
 * surface blocks light over a wide area because it is far from what it falls on;
 * an object touches its surface, so its shadow is a CONTACT shadow: tight, dark,
 * directly below, with a hairline of the object's own edge in it.
 *
 * One model cannot serve both. The defect was never that there were two shadows —
 * it was that ONE record tried to be both, so a toggle's knob and a modal's sheet
 * were told they were the same kind of thing.
 */
export const REST_SHADOW = '0 1px 2px rgba(1, 2, 3, 0.35), 0 0 0 1px rgba(1, 2, 3, 0.12)';

/**
 * A SHADOW IS ONLY VISIBLE ON A SURFACE LIGHTER THAN IT.
 *
 * Both shadow colours are darker than the canvas (#060709) and the work plane
 * (#090b0d) — and NEITHER is darker than a well (#030406). A shadow cast onto a
 * well is a shadow nobody can see, which is a constraint rather than a rule to
 * remember: the well is below the canvas, and light does not fall upward.
 */
export const SHADOW_FLOOR = 'canvas or above — never onto a well';
