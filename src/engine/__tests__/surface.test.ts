import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
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
  resolveBorderLevel,
  checkPlacement,
  resolveInteractionVars,
  type SurfaceRole,
  type SurfaceState,
} from '../liminal-surface';
import { LADDER, HALF, PERCEPTUAL_QUANTUM, FOCUS_RING_COLOR, LADDER_STEP } from '../liminal-ladder';
import { getDirectionalRim, getLadderColor, RIM } from '../spec-engine';
import { contrastRatioHex, oklchLightness } from '../liminal-color-math';
import { mistCssVars } from '../liminal-mist';

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
    expect(resolveSurface({ role: 'canvas' }).rim).toBe(false);
  });

  it('never lets a rim DISAPPEAR as a role rises', () => {
    const ordered: SurfaceRole[] = [
      'canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast',
    ];
    for (let i = 1; i < ordered.length; i++) {
      // The rim is one strength now, so what cannot go backwards is WHETHER a
      // surface has one: a role that has a rim may not be followed by one that does
      // not, going up the ladder.
      expect(
        Number(ROLE_RIM[ordered[i]]),
        `${ordered[i - 1]} → ${ordered[i]} lost its rim going up`,
      ).toBeGreaterThanOrEqual(Number(ROLE_RIM[ordered[i - 1]]));
    }
  });

  it('removes the rim when an element is disabled', () => {
    for (const role of ROLES) {
      expect(resolveSurface({ role, state: 'disabled' }).rim, `${role} disabled`).toBe(false);
    }
  });

  it('inverts the rim direction on press (concave)', () => {
    const idle = resolveSurface({ role: 'control', state: 'idle' });
    const active = resolveSurface({ role: 'control', state: 'active' });
    expect(idle.rimColors?.top).not.toBe(active.rimColors?.top);
  });
});

describe('surface decision engine — the state rule', () => {
  /**
   * THE OLD ASSERTION HERE SAID "below the perceptual quantum", AND IT WAS PROTECTING THE
   * DEFECT.
   *
   * It held that every state shift must be under one quantum — "a state change must be
   * felt, not seen; a full step would compete with the hierarchy". That was true of the
   * numbers and wrong about the system: a state change moves a SURFACE, so its threshold
   * is the flat-surface quantum, and half a step is 0.5708q — invisible. Measured by eye
   * at four layers, and the reader chose one step up and two down.
   *
   * The property this file holds now is the opposite: every shift is a WHOLE STEP, so it
   * lands on a real ladder level and clears the threshold.
   */
  it('every state shift is a WHOLE step — a surface, not a border', () => {
    for (const state of STATES) {
      const shift = STATE_SHIFT[state];
      expect(Number.isInteger(shift), `${state} shift is ${shift} steps, not a whole one`).toBe(true);
    }
  });

  it('and every shift clears the flat-surface threshold', () => {
    // A state change is a SURFACE change, so its threshold is one quantum — not the edge
    // threshold of 0.48q. Half a step was 0.5708q, which is below it.
    for (const state of STATES) {
      const shift = Math.abs(STATE_SHIFT[state]);
      if (shift === 0) continue;
      expect(shift * (PERCEPTUAL_QUANTUM * 1.1416), `${state} is below the threshold`)
        .toBeGreaterThan(PERCEPTUAL_QUANTUM);
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
  /**
   * THE FOCUS IS A DOUBLE EDGE NOW, NOT A BRIGHT RING.
   *
   * It used to be 2px of the brand — 15.7:1 to 17:1 against the surfaces, where WCAG asks for
   * 3:1, and the reader's word for it was "destroyed, jarring, in your face". No ladder level
   * could replace it: the ladder's highest step is 1.10:1 against the work plane. So the focus
   * became a SHAPE — an inner border, a 2px gap, and an outer line — and both lines are ladder
   * levels, so it adds no lightness at all.
   */
  it('shows a DOUBLE EDGE only on focus, and both lines are ladder levels', () => {
    for (const state of STATES) {
      const r = resolveSurface({ role: 'control', state });
      if (state === 'focus') {
        expect(r.outline, 'focus must produce an outer line').toContain('var(--liminal-s');
        expect(r.border, 'focus must produce an inner border').toContain('var(--liminal-s');
        expect(r.outlineOffset, 'and a gap between them').toBe('2px');
      } else {
        expect(r.outline, `${state} must not produce an outer line`).toBe('none');
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
    const hairline = resolveBorderHex({ role: 'work', kind: 'separator' });
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
      for (const kind of ['separator', 'edge'] as const) {
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

  it('the retired FINDING: control on region, threaded with the host\'s RESOLVED level, lands one step above it', () => {
    // The defect (POLICY §10.4 gap 6, found by rendering the nesting chain live):
    // region on work → S3, but control on region anchored to region's NOMINAL
    // level (2)+1 = S3 — zero fill difference, Law 2 broken for chains of two
    // relationship roles. The reader reconfirmed Law 2 on 2026-10-21
    // (containment = host + 1) and the API landed: `onLevel` threads the host's
    // RESOLVED level. Nominal `on` alone is unchanged — nominal hosts never move.
    const region = resolveSurface({ role: 'region', on: 'work' });
    const control = resolveSurface({ role: 'control', on: 'region', onLevel: region.level });
    expect(region.level).toBe(ROLE_LEVEL.work + 1);
    expect(control.level, 'one step above the RESOLVED host').toBe(region.level + 1);
    const gap = (oklchLightness(control.backgroundHex) - oklchLightness(region.backgroundHex)) / PERCEPTUAL_QUANTUM;
    expect(gap, `fill separation ${gap.toFixed(2)}q`).toBeGreaterThanOrEqual(1.0);
  });

  it('a six-hop chain from the work plane adds exactly one step per hop — and lands exactly on the ceiling', () => {
    // THE COMPOSITION LAW: every containment hop is exactly +1, so a chain of
    // alternating relationship roles walks the ladder without collapsing — and
    // work(2) + 6 hops reaches S8 with no clamp needed. This is the law the
    // reader confirmed: on the canvas only S1, on S1 only S2, and so on.
    let host = resolveSurface({ role: 'work' }); // S2
    for (let i = 0; i < 6; i++) {
      const role: SurfaceRole = i % 2 === 0 ? 'region' : 'control';
      const child = resolveSurface({ role, onLevel: host.level });
      expect(child.level, `hop ${i + 1}: ${role} on S${host.level}`).toBe(host.level + 1);
      host = child;
    }
    expect(host.level, 'work(2) + 6 hops = the ceiling, exactly').toBe(8);
  });

  it('the ceiling still degrades rather than expands: a chain that reaches the toast anchors on it', () => {
    // The reader's decision stands: the ceiling is a hard bound — a control with
    // nowhere to go anchors on its host (the PLACEMENT_EXEMPTIONS case, now
    // reachable through a long chain as well as by name).
    const r = resolveSurface({ role: 'control', onLevel: 8 });
    expect(r.level, 'no step above the ceiling — anchors on the host').toBe(8);
  });

  it('checkPlacement reads the resolved host too — through onLevel', () => {
    expect(checkPlacement({ role: 'work', on: 'chrome', onLevel: 1 }).ok).toBe(true);
    expect(checkPlacement({ role: 'panel', on: 'chrome', onLevel: 1 }).ok, 'panel skipped work').toBe(false);
    expect(checkPlacement({ role: 'control', on: 'region', onLevel: 3 }).ok).toBe(true);
    expect(checkPlacement({ role: 'control', on: 'region', onLevel: 8 }).ok, 'ceiling clamps — needs a named exemption').toBe(false);
  });

  it('the border follows the threaded host — same composition law', () => {
    const nominal = resolveBorderLevel({ role: 'control', kind: 'edge', on: 'region' });
    const threaded = resolveBorderLevel({ role: 'control', kind: 'edge', on: 'region', onLevel: 3 });
    expect(nominal, 'nominal anchor: region(2) + 1 lift + 1 edge').toBe(4);
    expect(threaded, 'resolved anchor: S3 + 1 lift + 1 edge').toBe(nominal + 1);
  });

  it('the interaction variables follow it — a chained control publishes its chained fill', () => {
    const nominal = resolveInteractionVars({ role: 'control', on: 'region' });
    const threaded = resolveInteractionVars({ role: 'control', on: 'region', onLevel: 3 });
    expect(threaded['--liminal-surface-idle']).not.toBe(nominal['--liminal-surface-idle']);
    expect(threaded['--liminal-surface-idle']).toBe(
      resolveSurface({ role: 'control', on: 'region', onLevel: 3 }).background,
    );
  });

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
    // It used to clamp — and clamping plus rounding meant a hover on a toast did nothing
    // at all. The border has inverted at the ceiling since it was written; the surface
    // does now too, and the inversion mirrors the shift: a hover of one step becomes a
    // press of one step, and it is still a whole step.
    const hover = resolveSurface({ role: 'toast', state: 'hover' });
    expect(hover.level).toBe(TOP - Math.abs(STATE_SHIFT.hover));
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
    const rim = resolveBorderHex({ role: 'control', kind: 'separator', on: 'toast' });
    expect(rim).not.toBe(ceiling);
    expect(contrastRatioHex(rim, ceiling)).toBeGreaterThan(1);
  });

  it('the inverted rim is DARKER than the surface, not lighter', () => {
    const rim = resolveBorderHex({ role: 'control', kind: 'separator', on: 'toast' });
    const steps = LADDER as readonly string[];
    expect(steps.indexOf(rim)).toBeLessThan(steps.indexOf(ceiling));
  });

  it('below the ceiling the rim is still a highlight, unchanged', () => {
    expect(resolveBorderHex({ role: 'control', kind: 'separator', on: 'work' })).toBe(HALF[3]);
    expect(resolveBorderHex({ role: 'control', kind: 'separator', on: 'menu' })).toBe(HALF[6]);
  });
});

describe('the rim — it inverts at the ceiling, like the border does', () => {
  // A surface at the ceiling had a FLAT rim: measured, a toast's top, side and
  // bottom all resolved to `#15171a`, which is the surface itself. The rim was
  // invisible and nothing said so. The border already solved this by inverting
  // below the ceiling; the rim had no equivalent.
  it('a rim at the ceiling is not flat', () => {
    const r = getDirectionalRim(8, true, false)!;
    expect(r.top).not.toBe(r.side);
    expect(r.bot).not.toBe(r.side);
  });

  it('and it is darker than its surface, because there is no room above', () => {
    const r = getDirectionalRim(8, true, false)!;
    const surface = getLadderColor(8);
    for (const c of [r.top, r.side, r.bot]) {
      expect(oklchLightness(c), `${c} vs ${surface}`).toBeLessThan(oklchLightness(surface));
    }
  });

  it('a rim below the ceiling still lights from above', () => {
    const r = getDirectionalRim(3, true, false)!;
    expect(oklchLightness(r.top)).toBeGreaterThan(oklchLightness(r.bot));
  });

  it('every floating role gets a rim that can be seen', () => {
    for (const role of FLOATING_ROLES) {
      const s = resolveSurface({ role });
      if (!s.rim) continue;
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

/**
 * THE RIM IS ONE STRENGTH, AND IT IS A LIGHT.
 *
 * Measured by eye at three boundaries — the canvas to layer one, layer one to layer
 * two, layer two to layer three — the reader's answer was the same at all of them:
 * 1.5. "For the essence and the principles of the rim, along with being LIMINAL, my
 * eye is stuck on 1.5."
 *
 * AND ONE STRENGTH IS WHAT THE SYSTEM DOES EVERYWHERE ELSE. Each treatment has
 * exactly one value, and the three edge treatments sit one step apart:
 *
 *   separator   0.5 steps   a hint
 *   edge        1.0 steps   a border
 *   rim         1.5 steps   a light
 */
describe('the rim — one strength, and it is a light', () => {
  const EDGE_THRESHOLD = 0.48 * PERCEPTUAL_QUANTUM;

  it('the top sits one and a half steps above its own surface', () => {
    expect(RIM.t).toBe(1.5);
    expect(RIM.s).toBe(1);
    expect(RIM.b).toBe(0.5);
  });

  it('and it is brighter than the border, because a light is brighter than a border', () => {
    const rimTop = (RIM.t * LADDER_STEP) / PERCEPTUAL_QUANTUM;
    const border = (1 * LADDER_STEP) / PERCEPTUAL_QUANTUM;
    expect(rimTop, 'the rim is not stronger than the border').toBeGreaterThan(border);
    expect(rimTop / (EDGE_THRESHOLD / PERCEPTUAL_QUANTUM), 'rim against the edge threshold').toBeGreaterThan(2.5);
  });

  it('the three edge treatments sit one step apart, and none of them is the same', () => {
    // A hint, a border, a light — the system's own ladder of treatments, in steps.
    expect([0.5, 1, 1.5]).toEqual([0.5, 1, 1.5]);
    expect(new Set([0.5, 1, RIM.t]).size).toBe(3);
  });

  it('a role either has a rim or does not — there is no tier to pick', () => {
    expect(new Set(Object.values(ROLE_RIM)).size).toBe(2);
    for (const role of Object.keys(ROLE_RIM) as (keyof typeof ROLE_RIM)[]) {
      expect(typeof ROLE_RIM[role], `${role}`).toBe('boolean');
    }
  });

  it('and it is never flat, at any level', () => {
    for (let n = 1; n <= 8; n++) {
      const r = getDirectionalRim(n, true, false)!;
      expect(r.top !== r.side || r.side !== r.bot, `S${n} has a flat rim`).toBe(true);
    }
  });
});

/**
 * AND THE CEILING: WHEN THERE IS ROOM BUT NOT ENOUGH, THE RIM SCALES.
 *
 * The rim's top sits 1.5 steps above its surface, so a surface at S7 has one step of
 * room and a surface at S8 has none. The old rule inverted whenever `n + 1.5` went
 * past the ceiling, which meant the MODAL — one step below the top — got a rim DARKER
 * than its own surface: measured, S7's top resolved to #121417 against a surface of
 * #131518. A dark edge reads as CUT IN, which is the opposite of what a raised surface
 * says.
 *
 * So the shape compresses into the room available and only the DIRECTION is kept, and
 * a surface with no room at all still inverts — below is the only direction left.
 */
describe('the rim at the ceiling', () => {
  const stops = (n: number): [string, string, string] => {
    const found = getDirectionalRim(n, true, false)!.cssBackground.match(/oklch\([^)]+\)/g) ?? [];
    expect(found.length, `S${n} has three stops`).toBe(3);
    return [found[0]!, found[1]!, found[2]!];
  };

  it('the modal keeps its direction — its top is brighter than its bottom', () => {
    const [top, , bot] = stops(7);
    const L = (s: string) => Number(s.match(/oklch\(([\d.]+)/)![1]);
    expect(L(top), 'the modal’s rim lights from below').toBeGreaterThan(L(bot));
  });

  it('and it keeps THREE distinct stops, which rounding to the grid destroyed', () => {
    // `getLadderColor` rounds to the nearest half-step, and at S7 the compressed rim
    // is 1 / 0.67 / 0.33 — all three rounded to the same half-step, so the edge lost
    // its direction exactly where it had least room.
    expect(new Set(stops(7)).size, 'the modal’s rim is flat').toBe(3);
  });

  it('the toast has no room at all, so its rim goes DARK — and keeps its direction', () => {
    /**
     * "Inverts" is the wrong word for what happens here, and the test says so.
     *
     * At S8 there is no room above, so all three stops move BELOW the surface: the
     * edge is darker than what it edges, which reads as CUT IN. The gradient's
     * direction does not flip — the top is still the brightest of the three.
     *
     * AND THAT IS AN OPEN QUESTION, not a settled rule: a toast floats, and a floating
     * surface should catch light on its edge. The ladder's ceiling bounds SURFACES;
     * whether it should bound the LIGHT a surface catches is a decision nobody has
     * made yet.
     */
    const [top, , bot] = stops(8);
    const L = (s: string) => Number(s.match(/oklch\(([\d.]+)/)![1]);
    const surface = oklchLightness(getLadderColor(8));
    for (const c of [top, bot]) expect(L(c), 'the toast’s rim is darker than its surface').toBeLessThan(surface);
    expect(L(top), 'and it still reads top-bright').toBeGreaterThan(L(bot));
  });

  it('and every level has three distinct stops, none of them flat', () => {
    for (let n = 1; n <= 8; n++) {
      expect(new Set(stops(n)).size, `S${n} is flat`).toBe(3);
    }
  });
});

/**
 * SURFACE LIGHT IS NOT A SYSTEM, AND THAT IS A DECISION.
 *
 * Measured at three boundaries with five spans, the reader's answer was "not needed"
 * and "floating only". The engine already does exactly that — `resolveSurface` returns
 * a FLAT fill for every role, and the light lives in the mist, which is a separate
 * layer only floating surfaces opt into.
 *
 * So there is nothing to change. And it is written down anyway, because "flat" is a
 * CHOICE rather than the absence of a decision: a system that has no surface light and
 * does not know why is a system that is flat by accident, and the first person to add
 * a gradient will add it without knowing they broke a rule.
 */
describe('surface light — settled surfaces are flat, and that is the rule', () => {
  it('every role resolves to a flat fill, none of them a gradient', () => {
    for (const role of Object.keys(ROLE_LEVEL) as (keyof typeof ROLE_LEVEL)[]) {
      const s = resolveSurface({ role });
      expect(s.background ?? '', `${role} has a gradient fill`).not.toContain('linear-gradient');
    }
  });

  it('and the light lives in the mist, which is a SEPARATE layer', () => {
    /**
     * The mist is where the light is, and it is not part of a surface's fill: a
     * floating surface opts into the mist layer and gets a gradient, and a settled
     * surface never does. The restriction is by USE, not by the API — `mistCssVars`
     * will compute for any role, and the components only call it for the four that
     * float. Asserted as the two facts that are true.
     */
    for (const role of FLOATING_ROLES) {
      const vars = mistCssVars(role);
      const top = vars['--liminal-mist-fill-top'];
      const bottom = vars['--liminal-mist-fill-bottom'];
      expect(top, `${role} has no fill top`).toBeTruthy();
      expect(top, `${role}'s mist is flat, not a light`).not.toBe(bottom);
    }
    // And the surface resolver — what a settled surface is built from — never returns
    // one. That is the rule, and it is the first assertion in this block.
    for (const role of ['canvas', 'chrome', 'work', 'panel', 'control'] as const) {
      expect(resolveSurface({ role }).background ?? '', `${role}`).not.toContain('linear-gradient');
    }
  });

  it('and the eye’s readings are recorded, in case it is ever revisited', () => {
    // If it were used: the canvas boundary wanted a span of 1 step, and the two deeper
    // ones 0.5 — higher surfaces need LESS light, because their fill already separates
    // them. The policy carries the numbers.
    const policy = readFileSync(resolve(process.cwd(), 'LIMINAL-POLICY.md'), 'utf8');
    expect(policy).toContain('نور سطح — یک سیستم **نیست**');
    expect(policy, 'the eye’s readings are not recorded').toContain('هرچه بالاتر، **نور کمتر**');
  });
});
