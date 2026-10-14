import { describe, it, expect } from 'vitest';
import {
  resolveSurface,
  ROLE_LEVEL,
  ROLE_RIM,
  ROLE_SHADOW,
  FLOATING_ROLES,
  STATE_SHIFT,
  roleDepthInQuanta,
  resolveBorderHex,
  resolveBorder,
  resolveInteractionVars,
  type SurfaceRole,
  type SurfaceState,
} from '../liminal-surface';
import { LADDER, HALF, PERCEPTUAL_QUANTUM, FOCUS_RING_COLOR } from '../liminal-ladder';
import { getDirectionalRim, getLadderColor } from '../spec-engine';
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
      const ratio = contrastRatioHex('#E9ECF2', r.backgroundHex);
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
    const hairline = resolveBorderHex({ role: 'work', kind: 'hairline' });
    const step = oklchLightness(hairline) - oklchLightness(surface.backgroundHex);
    const quanta = step / PERCEPTUAL_QUANTUM;
    expect(quanta, `hairline is ${quanta.toFixed(2)}q above the surface`).toBeLessThan(1);
    expect(quanta).toBeGreaterThan(0);
  });

  it('makes an edge a full step above its surface', () => {
    const surface = resolveSurface({ role: 'work' });
    const edge = resolveBorderHex({ role: 'work', kind: 'edge' });
    const step = oklchLightness(edge) - oklchLightness(surface.backgroundHex);
    const quanta = step / PERCEPTUAL_QUANTUM;
    expect(quanta, `edge is ${quanta.toFixed(2)}q above the surface`).toBeGreaterThanOrEqual(1);
  });

  it('scales the border with the role — a divider on a popover is stronger than on the work surface', () => {
    const onWork = resolveBorderHex({ role: 'work' });
    const onPopover = resolveBorderHex({ role: 'popover' });
    expect(oklchLightness(onPopover)).toBeGreaterThan(oklchLightness(onWork));
  });

  it('always resolves a border to a real ladder colour', () => {
    // A border may be a full step (LADDER) or a half step (HALF) — never a value
    // that does not exist, and never something off the scale.
    const known = new Set<string>([...LADDER, ...HALF]);
    for (const role of ROLES) {
      for (const kind of ['hairline', 'edge'] as const) {
        const c = resolveBorderHex({ role: role as SurfaceRole, kind, state: 'hover' });
        expect(known, `${role}/${kind} resolved to ${c}`).toContain(c);
      }
    }
  });

  it('inverts the border at the ceiling, where there is no room above', () => {
    const surface = resolveSurface({ role: 'toast' });
    const hairline = resolveBorderHex({ role: 'toast' });
    expect(hairline, 'a ceiling separator must not vanish').not.toBe(surface.backgroundHex);
    expect(oklchLightness(hairline)).toBeLessThan(oklchLightness(surface.backgroundHex));
  });

  it('keeps a hairline visible against its own surface', () => {
    // Below the quantum it is a seam; it must still be distinguishable at all.
    for (const role of ROLES) {
      const surface = resolveSurface({ role: role as SurfaceRole });
      const hairline = resolveBorderHex({ role: role as SurfaceRole });
      expect(hairline, `${role} hairline equals its surface`).not.toBe(surface.backgroundHex);
    }
  });
});

describe('surface decision engine — controls are relative to their host', () => {
  const HOSTS: SurfaceRole[] = ['canvas', 'chrome', 'work', 'panel', 'menu', 'popover', 'modal'];

  it('places a control one step above whatever hosts it', () => {
    for (const host of HOSTS) {
      const control = resolveSurface({ role: 'control', on: host });
      const hostSurface = resolveSurface({ role: host });
      const step = oklchLightness(control.backgroundHex) - oklchLightness(hostSurface.backgroundHex);
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
        oklchLightness(control.backgroundHex),
        `control on ${host} must not be darker than its host`,
      ).toBeGreaterThan(oklchLightness(hostSurface.backgroundHex));
    }
  });

  it('keeps the relationship identical at every depth', () => {
    const quanta = HOSTS.map((host) => {
      const c = resolveSurface({ role: 'control', on: host });
      const h = resolveSurface({ role: host });
      return (oklchLightness(c.backgroundHex) - oklchLightness(h.backgroundHex)) / PERCEPTUAL_QUANTUM;
    });
    const spread = Math.max(...quanta) - Math.min(...quanta);
    expect(spread, `the lift varies by ${spread.toFixed(2)}q across depths`).toBeLessThanOrEqual(0.2);
  });

  it('never runs off the ladder, even anchored on the ceiling', () => {
    const control = resolveSurface({ role: 'control', on: 'toast' });
    expect(control.level).toBeLessThanOrEqual(LADDER.length - 1);
  });
});

/**
 * THE CEILING IS DERIVED, AND THERE IS ONE LADDER.
 *
 * `spec-engine.getLiminalStyle` wrote `Math.min(5, ...)` in four places — a
 * hard-coded ceiling that predates the ladder growing to nine steps. So
 * anything at S6, S7 or S8 was silently flattened onto S5, and the two depth
 * engines gave different answers for the same depth.
 *
 * The old resolver is gone. These assertions moved with the RULE rather than
 * being deleted with the function: a hard-coded ceiling is the same defect class
 * as a hard-coded breakpoint — a number that used to be right, left behind when
 * the thing it described changed underneath it.
 */
describe('the ladder ceiling is derived from the ladder', () => {
  const TOP = LADDER.length - 1;

  it('reaches the ceiling', () => {
    const top = resolveSurface({ role: 'toast' });
    expect(top.level).toBe(TOP);
    expect(top.backgroundHex).toBe(LADDER[TOP]);
  });

  it('distinguishes every ladder step', () => {
    const seen = new Set(ROLES.map((role) => resolveSurface({ role }).backgroundHex));
    expect(seen.size).toBe(LADDER.length);
  });

  it('a hover step below the ceiling still moves', () => {
    // Before the fix this was 5 -> 5: the level had already been flattened, so
    // the hover had nowhere to go.
    const idle = resolveSurface({ role: 'modal' });
    const hover = resolveSurface({ role: 'modal', state: 'hover' });
    expect(idle.level).toBe(TOP - 1);
    expect(hover.level).toBeGreaterThan(idle.level);
  });

  it('INVERTS at the ceiling, because there is no room above', () => {
    // It used to clamp — and clamping plus rounding meant a hover on a toast
    // did nothing at all (8 + 0.5 → 8.5 → round → 8 → the idle fill). The
    // border has inverted at the ceiling since it was written; the surface does
    // now too. A hover at the top of the ladder becomes a press.
    const hover = resolveSurface({ role: 'toast', state: 'hover' });
    expect(hover.level).toBe(TOP - 0.5);
    expect(hover.backgroundHex).not.toBe(resolveSurface({ role: 'toast' }).backgroundHex);
  });
});

describe('the ceiling inversion also applies when the level came from a host', () => {
  // `resolveBorder` clamps to the ceiling before deciding whether there is room
  // above. Without that clamp a control anchored on the toast lands at 8 + 1 = 9,
  // `above` is 9.5, and the inversion computes 9 - 0.5 = 8.5 — still above the
  // ceiling, so the border came back as the surface colour and vanished.
  const ceiling = LADDER[LADDER.length - 1];

  it('a control anchored on the toast still gets a visible hairline', () => {
    const rim = resolveBorderHex({ role: 'control', kind: 'hairline', on: 'toast' });
    expect(rim).not.toBe(ceiling);
    expect(contrastRatioHex(rim, ceiling)).toBeGreaterThan(1);
  });

  it('the inverted rim is DARKER than the surface, not lighter', () => {
    const rim = resolveBorderHex({ role: 'control', kind: 'hairline', on: 'toast' });
    const steps = LADDER as readonly string[];
    expect(steps.indexOf(rim)).toBeLessThan(steps.indexOf(ceiling));
  });

  it('below the ceiling the rim is still a highlight, unchanged', () => {
    expect(resolveBorderHex({ role: 'control', kind: 'hairline', on: 'work' })).toBe(HALF[3]);
    expect(resolveBorderHex({ role: 'control', kind: 'hairline', on: 'menu' })).toBe(HALF[6]);
  });
});

describe('the rim — it inverts at the ceiling, like the border does', () => {
  // A surface at the ceiling had a FLAT rim: measured, a toast's top, side and
  // bottom all resolved to `#15171a`, which is the surface itself. The rim was
  // invisible and nothing said so. The border already solved this by inverting
  // below the ceiling; the rim had no equivalent.
  it('a rim at the ceiling is not flat', () => {
    const r = getDirectionalRim(8, 3, false)!;
    expect(r.top).not.toBe(r.side);
    expect(r.bot).not.toBe(r.side);
  });

  it('and it is darker than its surface, because there is no room above', () => {
    const r = getDirectionalRim(8, 3, false)!;
    const surface = getLadderColor(8);
    for (const c of [r.top, r.side, r.bot]) {
      expect(oklchLightness(c), `${c} vs ${surface}`).toBeLessThan(oklchLightness(surface));
    }
  });

  it('a rim below the ceiling still lights from above', () => {
    const r = getDirectionalRim(3, 2, false)!;
    expect(oklchLightness(r.top)).toBeGreaterThan(oklchLightness(r.bot));
  });

  it('every floating role gets a rim that can be seen', () => {
    for (const role of FLOATING_ROLES) {
      const s = resolveSurface({ role });
      if (s.rim === 0) continue;
      const r = getDirectionalRim(Math.round(s.level), s.rim, false)!;
      expect(r.top !== r.side || r.side !== r.bot, `${role} has a flat rim`).toBe(true);
    }
  });
});

describe('the interaction variables have a producer', () => {
  // They had none. Every component hand-assembled them — twelve-plus sites,
  // often by calling `resolveSurface` two or three times in a row. That is the
  // mechanism behind two real bugs: a component that hand-builds the variables
  // can publish a hover value and forget the idle one, or set `background`
  // inline beside them and cancel the rule that reads them.
  it('produces all six the layer reads', () => {
    const v = resolveInteractionVars({ role: 'control', on: 'work' });
    expect(Object.keys(v).sort()).toEqual([
      '--liminal-border-focus', '--liminal-border-idle',
      '--liminal-surface-active', '--liminal-surface-focus',
      '--liminal-surface-hover', '--liminal-surface-idle',
    ]);
  });

  it('gives every state a value, so none can be forgotten', () => {
    const v = resolveInteractionVars({ role: 'control', on: 'work' });
    for (const [k, val] of Object.entries(v)) expect(val, k).toBeTruthy();
  });

  it('idle and hover differ, which is what makes a hover visible', () => {
    const v = resolveInteractionVars({ role: 'control', on: 'work' });
    expect(v['--liminal-surface-idle']).not.toBe(v['--liminal-surface-hover']);
  });

  it('a frozen control keeps its fill in every state', () => {
    // A checked box, a selected row. The contract already states this rule.
    const v = resolveInteractionVars({ role: 'control', on: 'work', frozen: 'var(--liminal-brand)' });
    expect(v['--liminal-surface-hover']).toBe('var(--liminal-brand)');
    expect(v['--liminal-surface-active']).toBe('var(--liminal-brand)');
    expect(v['--liminal-surface-focus']).toBe('var(--liminal-brand)');
  });

  it('a caller can supply its own idle fill', () => {
    const v = resolveInteractionVars({ role: 'control', on: 'work', idle: '#123456' });
    expect(v['--liminal-surface-idle']).toBe('#123456');
  });

  // The engine derives hover and active from the level ITS OWN fill sits at. A
  // caller that supplies a fill the engine did not choose — a brand, a rim
  // gradient, `transparent` for a control lying flat on its host — has to say
  // what a lift means for it. Fifteen components needed this; the overrides are
  // what let the migration preserve what was there instead of re-deciding it.
  it('a caller can supply its own hover and pressed fills', () => {
    const v = resolveInteractionVars({
      role: 'control',
      on: 'work',
      idle: 'transparent',
      hover: 'var(--liminal-tint)',
      active: 'var(--liminal-tint)',
    });
    expect(v['--liminal-surface-idle']).toBe('transparent');
    expect(v['--liminal-surface-hover']).toBe('var(--liminal-tint)');
    expect(v['--liminal-surface-active']).toBe('var(--liminal-tint)');
  });

  it('an explicit hover wins over frozen, so a caller can override one state', () => {
    const v = resolveInteractionVars({
      role: 'control',
      on: 'work',
      frozen: 'var(--liminal-brand)',
      hover: 'var(--liminal-tint)',
    });
    expect(v['--liminal-surface-hover']).toBe('var(--liminal-tint)');
    expect(v['--liminal-surface-active']).toBe('var(--liminal-brand)');
  });

  it('a caller can supply its own focus border — an invalid field turns red', () => {
    const v = resolveInteractionVars({
      role: 'control',
      on: 'work',
      borderFocus: 'var(--liminal-danger)',
    });
    expect(v['--liminal-border-focus']).toBe('var(--liminal-danger)');
  });

  it('the border pair defaults to the engine’s edge and the focus ring', () => {
    const v = resolveInteractionVars({ role: 'control', on: 'work' });
    expect(v['--liminal-border-idle']).toBe(resolveBorder({ role: 'control', kind: 'edge', on: 'work' }));
    expect(v['--liminal-border-focus']).toBe(FOCUS_RING_COLOR);
  });

  it('the values are variables, so they follow a theme', () => {
    const v = resolveInteractionVars({ role: 'control', on: 'work' });
    expect(v['--liminal-surface-idle']).toContain('var(--liminal-');
  });
});
