import { describe, it, expect } from 'vitest';
import { LADDER, HALF, PERCEPTUAL_QUANTUM } from '../liminal-ladder';
import { oklchLightness } from '../liminal-color-math';
import { resolveSurface, ROLE_LEVEL, type SurfaceRole, type SurfaceState } from '../liminal-surface';

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
  it('every state, on every role and every host, is FELT and not SEEN', () => {
    const offenders: string[] = [];
    for (const role of ROLES) {
      for (const on of HOSTS) {
        // A control anchored on a host is the common case; the structural roles
        // ignore `on` and are covered by the unanchored pass.
        if (on !== undefined && role !== 'control') continue;
        const idle = idleOf(role, on);
        for (const state of STATES) {
          const s = resolveSurface({ role, state, on });
          const q = quanta(idle, s.backgroundHex);
          // At the ceiling a positive shift inverts, so hover and focus can sit
          // BELOW the idle. Both directions are fine; zero and a full quantum
          // are not.
          if (q < 0.4 || q >= 1) {
            offenders.push(`${role}${on ? ` on ${on}` : ''} ${state}: ${idle} → ${s.backgroundHex} = ${q.toFixed(2)}q`);
          }
        }
      }
    }
    expect(offenders, 'a state that is invisible or a full quantum away').toEqual([]);
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

  it('the half-steps the engine publishes are the ones it uses', () => {
    // `HALF` existed and went unused for the whole life of the resolver.
    const used = new Set<string>();
    for (const role of ROLES) {
      for (const state of STATES) used.add(resolveSurface({ role, state }).backgroundHex);
    }
    const halves = new Set(HALF as readonly string[]);
    const fromHalves = [...used].filter((hex) => halves.has(hex));
    expect(fromHalves.length, 'state fills that come from HALF').toBeGreaterThan(0);
  });

  it('the ladder is still the ladder — the steps did not move', () => {
    LADDER.slice(1).forEach((hex, i) => {
      const q = quanta(LADDER[i], hex);
      expect(q, `S${i}→S${i + 1}`).toBeGreaterThanOrEqual(1);
    });
  });
});
