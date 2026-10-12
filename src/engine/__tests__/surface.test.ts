import { describe, it, expect } from 'vitest';
import {
  resolveSurface,
  ROLE_LEVEL,
  ROLE_RIM,
  ROLE_SHADOW,
  FLOATING_ROLES,
  STATE_SHIFT,
  roleDepthInQuanta,
  resolveBorder,
  type SurfaceRole,
  type SurfaceState,
} from '../liminal-surface';
import { LADDER, HALF, PERCEPTUAL_QUANTUM, FOCUS_RING_COLOR } from '../liminal-ladder';
import { contrastRatioHex, oklchLightness } from '../liminal-color-math';
import { getLiminalStyle } from '../spec-engine';

const ROLES = Object.keys(ROLE_LEVEL) as SurfaceRole[];
const STATES: SurfaceState[] = ['idle', 'hover', 'focus', 'active', 'disabled'];

/**
 * ============================================================================
 * SURFACE DECISION ENGINE — THE RULES
 * ============================================================================
 * Before this engine every component chose its own depth, which is how the
 * toolbar ended up at S2 while the nav beneath it sat at S1. These tests are
 * what stops that from happening again.
 */
describe('surface decision engine — the hierarchy', () => {
  it('resolves every role in every state without throwing', () => {
    for (const role of ROLES) {
      for (const state of STATES) {
        expect(() => resolveSurface({ role, state }), `${role}/${state}`).not.toThrow();
      }
    }
  });

  it('orders the roles strictly, one step apart', () => {
    const ordered: SurfaceRole[] = [
      'canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast',
    ];
    for (let i = 1; i < ordered.length; i++) {
      expect(
        ROLE_LEVEL[ordered[i]] - ROLE_LEVEL[ordered[i - 1]],
        `${ordered[i - 1]} → ${ordered[i]}`,
      ).toBe(1);
    }
  });

  it('never resolves above the ladder ceiling', () => {
    for (const role of ROLES) {
      const r = resolveSurface({ role, state: 'hover', depth: 3 });
      expect(r.level, `${role} resolved to S${r.level}`).toBeLessThanOrEqual(LADDER.length - 1);
    }
  });

  it('never resolves below the canvas', () => {
    for (const role of ROLES) {
      const r = resolveSurface({ role, state: 'active', depth: 0 });
      expect(r.level, `${role} resolved to S${r.level}`).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('surface decision engine — the shadow rule', () => {
  it('gives a shadow to every floating role', () => {
    for (const role of FLOATING_ROLES) {
      const r = resolveSurface({ role });
      expect(r.shadow, `${role} must cast a shadow`).not.toBe('none');
    }
  });

  it('gives no shadow to anything that sits in the flow', () => {
    const inFlow = ROLES.filter((r) => !FLOATING_ROLES.includes(r));
    for (const role of inFlow) {
      const r = resolveSurface({ role });
      expect(r.shadow, `${role} sits in the flow and must not cast a shadow`).toBe('none');
    }
  });

  it('scales the shadow with how high the element floats', () => {
    const menu = resolveSurface({ role: 'menu' });
    const toast = resolveSurface({ role: 'toast' });
    expect(menu.shadow).not.toBe(toast.shadow);
  });
});

describe('surface decision engine — the rim rule', () => {
  it('gives the canvas no rim', () => {
    expect(resolveSurface({ role: 'canvas' }).rim).toBe(0);
  });

  it('never lets the rim tier decrease as a role rises', () => {
    const ordered: SurfaceRole[] = [
      'canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast',
    ];
    for (let i = 1; i < ordered.length; i++) {
      expect(
        ROLE_RIM[ordered[i]],
        `${ordered[i - 1]} → ${ordered[i]} rim tier went backwards`,
      ).toBeGreaterThanOrEqual(ROLE_RIM[ordered[i - 1]]);
    }
  });

  it('removes the rim when an element is disabled', () => {
    for (const role of ROLES) {
      expect(resolveSurface({ role, state: 'disabled' }).rim, `${role} disabled`).toBe(0);
    }
  });

  it('inverts the rim direction on press (concave)', () => {
    const idle = resolveSurface({ role: 'control', state: 'idle' });
    const active = resolveSurface({ role: 'control', state: 'active' });
    expect(idle.rimColors?.top).not.toBe(active.rimColors?.top);
  });
});

describe('surface decision engine — the state rule', () => {
  it('keeps every state shift below the perceptual quantum', () => {
    // A state change must be felt, not seen. A full step would compete with the
    // hierarchy itself.
    for (const state of STATES) {
      const shift = Math.abs(STATE_SHIFT[state]);
      expect(
        shift * PERCEPTUAL_QUANTUM,
        `${state} shift is ${shift} steps`,
      ).toBeLessThan(PERCEPTUAL_QUANTUM);
    }
  });

  it('raises on hover and focus, lowers on press', () => {
    expect(STATE_SHIFT.hover).toBeGreaterThan(0);
    expect(STATE_SHIFT.focus).toBeGreaterThan(0);
    expect(STATE_SHIFT.active).toBeLessThan(0);
  });

  it('drops a disabled element to its parent level', () => {
    const idle = resolveSurface({ role: 'control', state: 'idle' });
    const disabled = resolveSurface({ role: 'control', state: 'disabled' });
    expect(disabled.level).toBeLessThan(idle.level);
  });

  it('dims a disabled element but keeps it present', () => {
    expect(resolveSurface({ role: 'control', state: 'disabled' }).style.opacity).toBeLessThan(1);
  });
});

describe('surface decision engine — the focus rule', () => {
  it('shows a ring only on focus', () => {
    for (const state of STATES) {
      const r = resolveSurface({ role: 'control', state });
      if (state === 'focus') {
        expect(r.outline, 'focus must produce a ring').toContain(FOCUS_RING_COLOR);
      } else {
        expect(r.outline, `${state} must not produce a ring`).toBe('none');
      }
    }
  });

  it('keeps the focus ring visible on every surface it can appear on', () => {
    for (const role of ROLES) {
      const r = resolveSurface({ role, state: 'focus' });
      const ratio = contrastRatioHex('#E9ECF2', r.background);
      expect(
        ratio,
        `${role} focus ring on ${r.background} = ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(3);
    }
  });
});

describe('surface decision engine — the measured depth', () => {
  it('places the work surface at 2.0–2.6 quanta', () => {
    const q = roleDepthInQuanta('work');
    expect(q, `work surface sits at ${q.toFixed(2)}q`).toBeGreaterThanOrEqual(2.0);
    expect(q, `work surface sits at ${q.toFixed(2)}q`).toBeLessThanOrEqual(2.6);
  });

  it('keeps every adjacent role pair at least one quantum apart', () => {
    const ordered: SurfaceRole[] = [
      'canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast',
    ];
    for (let i = 1; i < ordered.length; i++) {
      const a = oklchLightness(LADDER[ROLE_LEVEL[ordered[i - 1]]]);
      const b = oklchLightness(LADDER[ROLE_LEVEL[ordered[i]]]);
      const quanta = (b - a) / PERCEPTUAL_QUANTUM;
      expect(
        quanta,
        `${ordered[i - 1]} → ${ordered[i]} is only ${quanta.toFixed(2)}q`,
      ).toBeGreaterThanOrEqual(1.0);
    }
  });
});

describe('surface decision engine — the border rule', () => {
  it('makes a hairline a half-step above its surface', () => {
    const surface = resolveSurface({ role: 'work' });
    const hairline = resolveBorder({ role: 'work', kind: 'hairline' });
    const step = oklchLightness(hairline) - oklchLightness(surface.background);
    const quanta = step / PERCEPTUAL_QUANTUM;
    expect(quanta, `hairline is ${quanta.toFixed(2)}q above the surface`).toBeLessThan(1);
    expect(quanta).toBeGreaterThan(0);
  });

  it('makes an edge a full step above its surface', () => {
    const surface = resolveSurface({ role: 'work' });
    const edge = resolveBorder({ role: 'work', kind: 'edge' });
    const step = oklchLightness(edge) - oklchLightness(surface.background);
    const quanta = step / PERCEPTUAL_QUANTUM;
    expect(quanta, `edge is ${quanta.toFixed(2)}q above the surface`).toBeGreaterThanOrEqual(1);
  });

  it('scales the border with the role — a divider on a popover is stronger than on the work surface', () => {
    const onWork = resolveBorder({ role: 'work' });
    const onPopover = resolveBorder({ role: 'popover' });
    expect(oklchLightness(onPopover)).toBeGreaterThan(oklchLightness(onWork));
  });

  it('always resolves a border to a real ladder colour', () => {
    // A border may be a full step (LADDER) or a half step (HALF) — never a value
    // that does not exist, and never something off the scale.
    const known = new Set<string>([...LADDER, ...HALF]);
    for (const role of ROLES) {
      for (const kind of ['hairline', 'edge'] as const) {
        const c = resolveBorder({ role: role as SurfaceRole, kind, state: 'hover' });
        expect(known, `${role}/${kind} resolved to ${c}`).toContain(c);
      }
    }
  });

  it('inverts the border at the ceiling, where there is no room above', () => {
    const surface = resolveSurface({ role: 'toast' });
    const hairline = resolveBorder({ role: 'toast' });
    expect(hairline, 'a ceiling separator must not vanish').not.toBe(surface.background);
    expect(oklchLightness(hairline)).toBeLessThan(oklchLightness(surface.background));
  });

  it('keeps a hairline visible against its own surface', () => {
    // Below the quantum it is a seam; it must still be distinguishable at all.
    for (const role of ROLES) {
      const surface = resolveSurface({ role: role as SurfaceRole });
      const hairline = resolveBorder({ role: role as SurfaceRole });
      expect(hairline, `${role} hairline equals its surface`).not.toBe(surface.background);
    }
  });
});

describe('surface decision engine — controls are relative to their host', () => {
  const HOSTS: SurfaceRole[] = ['canvas', 'chrome', 'work', 'panel', 'menu', 'popover', 'modal'];

  it('places a control one step above whatever hosts it', () => {
    for (const host of HOSTS) {
      const control = resolveSurface({ role: 'control', on: host });
      const hostSurface = resolveSurface({ role: host });
      const step = oklchLightness(control.background) - oklchLightness(hostSurface.background);
      const quanta = step / PERCEPTUAL_QUANTUM;
      expect(
        quanta,
        `control on ${host} sits at ${quanta.toFixed(2)}q`,
      ).toBeGreaterThanOrEqual(1.0);
      expect(
        quanta,
        `control on ${host} sits at ${quanta.toFixed(2)}q`,
      ).toBeLessThanOrEqual(1.5);
    }
  });

  it('never sinks a control below its host', () => {
    // The bug this replaces: a control pinned to an absolute level sat 3.29q
    // BELOW a modal, i.e. sunken into the surface it was supposed to sit on.
    for (const host of HOSTS) {
      const control = resolveSurface({ role: 'control', on: host });
      const hostSurface = resolveSurface({ role: host });
      expect(
        oklchLightness(control.background),
        `control on ${host} must not be darker than its host`,
      ).toBeGreaterThan(oklchLightness(hostSurface.background));
    }
  });

  it('keeps the relationship identical at every depth', () => {
    const quanta = HOSTS.map((host) => {
      const c = resolveSurface({ role: 'control', on: host });
      const h = resolveSurface({ role: host });
      return (oklchLightness(c.background) - oklchLightness(h.background)) / PERCEPTUAL_QUANTUM;
    });
    const spread = Math.max(...quanta) - Math.min(...quanta);
    expect(spread, `the lift varies by ${spread.toFixed(2)}q across depths`).toBeLessThanOrEqual(0.2);
  });

  it('clamps at the ceiling rather than running off the ladder', () => {
    const control = resolveSurface({ role: 'control', on: 'toast' });
    expect(control.level).toBeLessThanOrEqual(LADDER.length - 1);
  });
});

/**
 * There are two depth engines in this repo, and until now they disagreed.
 *
 * `liminal-surface.resolveSurface` derived its ceiling from the ladder:
 * `const MAX_LEVEL = LADDER.length - 1` (8). `spec-engine.getLiminalStyle`
 * wrote `Math.min(5, ...)` in four places — a hard-coded 5 that predates the
 * ladder growing to nine steps. So anything at S6, S7 or S8 was silently
 * flattened onto the work surface, and the two engines gave different answers
 * for the same depth.
 *
 * A hard-coded ceiling is the same class of defect as a hard-coded breakpoint:
 * a number that used to be right, left behind when the thing it described
 * changed underneath it.
 */
describe('the two depth engines agree on the ladder', () => {
  it('getLiminalStyle can reach the ladder ceiling', () => {
    const top = getLiminalStyle({ surfaceLevel: LADDER.length - 1, isContainer: true });
    expect(top.n).toBe(LADDER.length - 1);
    expect(top.bg).toBe(LADDER[LADDER.length - 1]);
  });

  it('getLiminalStyle distinguishes every ladder step', () => {
    const seen = new Set<string>();
    for (let n = 0; n < LADDER.length; n++) {
      seen.add(getLiminalStyle({ surfaceLevel: n, isContainer: true }).bg);
    }
    expect(seen.size).toBe(LADDER.length);
  });

  it('a hover step below the ceiling still moves', () => {
    // Before the fix this was 5 -> 5: the level had already been flattened, so
    // the hover had nowhere to go. At the ceiling itself a clamp is correct —
    // there is no room above the top of the ladder, and this engine has no
    // inversion rule (resolveBorder has one; getLiminalStyle does not).
    const top = LADDER.length - 2;
    const idle = getLiminalStyle({ surfaceLevel: top, isContainer: true });
    const hover = getLiminalStyle({ surfaceLevel: top, isContainer: true, state: 'hover' });
    expect(idle.n).toBe(top);
    expect(hover.n).toBeGreaterThan(idle.n);
  });

  it('clamps at the ceiling rather than running off the ladder', () => {
    const hover = getLiminalStyle({
      surfaceLevel: LADDER.length - 1,
      isContainer: true,
      state: 'hover',
    });
    expect(hover.n).toBe(LADDER.length - 1);
  });
});

describe('the ceiling inversion also applies when the level came from a host', () => {
  // `resolveBorder` clamps to the ceiling before deciding whether there is room
  // above. Without that clamp a control anchored on the toast lands at 8 + 1 = 9,
  // `above` is 9.5, and the inversion computes 9 - 0.5 = 8.5 — still above the
  // ceiling, so the border came back as the surface colour and vanished.
  const ceiling = LADDER[LADDER.length - 1];

  it('a control anchored on the toast still gets a visible hairline', () => {
    const rim = resolveBorder({ role: 'control', kind: 'hairline', on: 'toast' });
    expect(rim).not.toBe(ceiling);
    expect(contrastRatioHex(rim, ceiling)).toBeGreaterThan(1);
  });

  it('the inverted rim is DARKER than the surface, not lighter', () => {
    const rim = resolveBorder({ role: 'control', kind: 'hairline', on: 'toast' });
    const steps = LADDER as readonly string[];
    expect(steps.indexOf(rim)).toBeLessThan(steps.indexOf(ceiling));
  });

  it('below the ceiling the rim is still a highlight, unchanged', () => {
    expect(resolveBorder({ role: 'control', kind: 'hairline', on: 'work' })).toBe(HALF[3]);
    expect(resolveBorder({ role: 'control', kind: 'hairline', on: 'menu' })).toBe(HALF[6]);
  });
});
