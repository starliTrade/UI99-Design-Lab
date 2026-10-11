import { describe, it, expect } from 'vitest';
import {
  resolveSurface,
  ROLE_LEVEL,
  ROLE_RIM,
  ROLE_SHADOW,
  FLOATING_ROLES,
  STATE_SHIFT,
  roleDepthInQuanta,
  type SurfaceRole,
  type SurfaceState,
} from '../liminal-surface';
import { LADDER, PERCEPTUAL_QUANTUM, FOCUS_RING_COLOR } from '../liminal-ladder';
import { contrastRatioHex, oklchLightness } from '../liminal-color-math';

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
