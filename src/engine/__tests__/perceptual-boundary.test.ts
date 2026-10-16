import { describe, it, expect } from 'vitest';
import { LADDER, HALF, PERCEPTUAL_QUANTUM } from '../liminal-ladder';
import { oklchLightness } from '../liminal-color-math';
import { STATE_SHIFT, resolveSurface, ROLE_LEVEL, type SurfaceRole, type SurfaceState } from '../liminal-surface';

/**
 * THE FIRST RULE, AS A TEST.
 *
 * LIMINAL's first rule is that a change lands ON the perceptual boundary —
 * felt, not seen. A state change is a HALF step, and `HALF` is published with
 * the comment "used for state changes (hover / active) … deliberately below the
 * threshold: a state change should be felt, not seen".
 *
 * `resolveSurface` rounded the level anyway, and the result was measured:
 *
 *   hover   +0.5 step  →  1.07–1.21q   VISIBLE    (a full quantum)
 *   active  −0.5 step  →  0.00q        INVISIBLE  (the idle fill)
 *
 * Every role, every host. It broke the rule in all of them, and it was the root
 * of the patches this session kept making: the "active equals hover" habit
 * existed because active was a no-op.
 *
 * So the rule is asserted now, over every role and every host, because a rule
 * that is not asserted is a habit.
 */
const ROLES = Object.keys(ROLE_LEVEL) as SurfaceRole[];
const HOSTS: (SurfaceRole | undefined)[] = [undefined, 'canvas', 'chrome', 'work', 'panel', 'modal', 'toast'];
const STATES: SurfaceState[] = ['hover', 'focus', 'active'];

const quanta = (a: string, b: string) => Math.abs(oklchLightness(a) - oklchLightness(b)) / PERCEPTUAL_QUANTUM;

/** The idle fill for a role, anchored or not — the thing a state moves away from. */
const idleOf = (role: SurfaceRole, on?: SurfaceRole) =>
  resolveSurface({ role, state: 'idle', on }).backgroundHex;

describe('a state change lands on the perceptual boundary', () => {
  /**
   * THE OLD ASSERTION HERE SAID "FELT AND NOT SEEN", AND IT WAS THE DEFECT.
   *
   * It required every state change to land between 0.4q and 1q — under the threshold, on
   * purpose. The reasoning was that a state change should be felt rather than seen, and
   * that a full step "would compete with the hierarchy". Measured by eye at four layers,
   * the reader chose the opposite: hover one step, active two.
   *
   * AND THE OLD RULE WAS SELF-CONTRADICTORY. It demanded a change under one quantum, which
   * is a change the eye cannot see — and a state nobody can see is not a state. The border
   * settled this first: "a border has to be a border" at one step, because half a step is a
   * hint. A hover has the same problem and the same answer.
   *
   * So the property is inverted: every state change CLEARS the threshold, and the two
   * directions are deliberate — a hover lifts one step, a press sinks two, because a press
   * says more than a point.
   */
  it('every state change CLEARS the flat-surface threshold', () => {
    const offenders: string[] = [];
    for (const role of ROLES) {
      for (const on of HOSTS) {
        // A control anchored on a host is the common case; the structural roles ignore
        // `on` and are covered by the unanchored pass.
        if (on !== undefined && role !== 'control') continue;
        const idle = idleOf(role, on);
        for (const state of STATES) {
          if (state === 'idle' || state === 'disabled') continue;
          const s = resolveSurface({ role, state, on });
          const q = Math.abs(quanta(idle, s.backgroundHex));
          // At the ceiling a positive shift inverts, so a hover can sit below the idle.
          // The magnitude is what matters, and it has to be at least one quantum.
          if (q < 1) {
            offenders.push(`${role}${on ? ` on ${on}` : ''} ${state}: ${idle} → ${s.backgroundHex} = ${q.toFixed(2)}q`);
          }
        }
      }
    }
    expect(offenders, 'a state change the eye cannot see').toEqual([]);
  });

  it('and the two directions are deliberate: hover lifts one, press sinks two', () => {
    // The asymmetry is the point — a press is a bigger event than a point.
    expect(STATE_SHIFT.hover).toBe(1);
    expect(STATE_SHIFT.focus).toBe(1);
    expect(STATE_SHIFT.active).toBe(-2);
    expect(Math.abs(STATE_SHIFT.active), 'a press says more than a hover').toBeGreaterThan(STATE_SHIFT.hover);
  });

  it('no state is a no-op', () => {
    const frozen: string[] = [];
    for (const role of ROLES) {
      const idle = idleOf(role);
      for (const state of STATES) {
        if (resolveSurface({ role, state }).backgroundHex === idle) frozen.push(`${role} ${state}`);
      }
    }
    expect(frozen, 'a state that changes nothing').toEqual([]);
  });

  it('and NO state fill comes from a half-step', () => {
    /**
     * THIS ASSERTION IS THE OPPOSITE OF WHAT IT SAID, and the old version was the defect.
     *
     * It held that some state fills must come from `HALF` — "the half-steps the engine
     * publishes are the ones it uses". They are, but not for this: the ladder's integer
     * steps are SURFACES and its half-steps are BORDERS. A state moves a surface, so a
     * state fill that comes from `HALF` is a surface filled with the colour of a line —
     * measured, hover resolved to #0c0e10, exactly `HALF[3]`, and the reader called it
     * "not beautiful" before anyone had named why.
     */
    const used = new Set<string>();
    for (const role of ROLES) {
      for (const state of STATES) used.add(resolveSurface({ role, state }).backgroundHex);
    }
    const halves = new Set(HALF as readonly string[]);
    const fromHalves = [...used].filter((hex) => halves.has(hex));
    expect(fromHalves, 'a surface filled with a border colour').toEqual([]);
    // And the guard proves it is looking at real values, or it would pass by finding none.
    expect(used.size, 'no state fills were collected').toBeGreaterThan(3);
  });

  it('the ladder is still the ladder — the steps did not move', () => {
    LADDER.slice(1).forEach((hex, i) => {
      const q = quanta(LADDER[i], hex);
      expect(q, `S${i}→S${i + 1}`).toBeGreaterThanOrEqual(1);
    });
  });
});
