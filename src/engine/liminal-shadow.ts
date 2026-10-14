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
 * falls on, and the further it floats the wider and softer the shadow. Nothing
 * here is hand-picked: four numbers, all linear in the height.
 */
export function shadowModel(height: number) {
  return {
    near: 4 + height * 0.5,
    far: 40 + height * 3.2,
    nearAlpha: 0.30 + height * 0.005,
    farAlpha: 0.42 + height * 0.010,
  };
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
