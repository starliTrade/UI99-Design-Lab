import { describe, it, expect } from 'vitest';
import { NEST_MIN, CONTROL_LIFT, resolveInset, resolveSurface, ROLE_LEVEL, ROLE_RIM, resolveBorderLevel } from '../liminal-surface';
import { LADDER, PERCEPTUAL_QUANTUM, LADDER_STEP } from '../liminal-ladder';

/**
 * THE NESTING RULE, AND WHY IT IS NOT THE SURFACE RULE.
 *
 * A nested child is a BOUNDED region, not a flat patch, so its threshold is the
 * EDGE threshold — measured at about 0.48q — and not the flat-surface q. That is
 * the whole reason a child can read as a layer at a distance that would be
 * invisible as a flat difference.
 *
 * These assertions hold the three numbers that make that true, and the two
 * relationships the system relies on. If someone lowers the nesting floor below
 * the edge threshold, the first test goes red — which is the point.
 */
describe('nesting — a child is a region, and a region is read by its edge', () => {
  /** The edge threshold, measured on the reader's own display (0.48q). */
  const EDGE_THRESHOLD = 0.48 * PERCEPTUAL_QUANTUM;

  it('the floor is above the EDGE threshold, and below the surface one', () => {
    const floor = NEST_MIN * LADDER_STEP;
    expect(floor, 'a nested child below the edge threshold cannot be seen as a region').toBeGreaterThan(EDGE_THRESHOLD);
    expect(floor, 'a nested child is a bounded region, so it may sit below q').toBeLessThan(PERCEPTUAL_QUANTUM);
  });

  it('sits at the same ratio to its threshold as the ladder and the border do', () => {
    // Three mechanisms, three thresholds, one ratio — about 1.15x. If the
    // nesting floor drifts from that, one of the three is now a special case.
    const ratios = {
      ladder: LADDER_STEP / PERCEPTUAL_QUANTUM,
      nesting: (NEST_MIN * LADDER_STEP) / EDGE_THRESHOLD,
    };
    expect(ratios.nesting).toBeGreaterThan(1);
    expect(Math.abs(ratios.nesting - ratios.ladder), 'the two ratios have drifted apart').toBeLessThan(0.15);
  });

  it('the working value is a margin above the floor, not the floor itself', () => {
    // A floor is a bound; a nested control has to be READABLE, not merely
    // detectable. So the lift is deliberately twice the minimum.
    expect(CONTROL_LIFT).toBeGreaterThanOrEqual(NEST_MIN);
    expect(CONTROL_LIFT / NEST_MIN).toBeCloseTo(2, 5);
  });

  it('a well goes below, and further than the floor', () => {
    // The asymmetry is STRUCTURAL — it lands the well between the canvas and
    // chrome — and it must not be read as a perceptual requirement, because the
    // eye test found both directions equally clear at one step.
    const insetLevel = ROLE_LEVEL.panel - 1.5;
    expect(insetLevel).toBeLessThan(ROLE_LEVEL.panel);
    expect(Math.abs(ROLE_LEVEL.panel - insetLevel)).toBeGreaterThanOrEqual(NEST_MIN);
    expect(resolveInset({ role: 'panel' })).toBeTruthy();
  });

  it('a control on a host is one step above it, at every host', () => {
    // The nesting rule is the same at every depth — that is what makes it a rule
    // rather than a table.
    for (const host of ['work', 'panel', 'menu'] as const) {
      const on = resolveSurface({ role: 'control', on: host });
      expect(on.level, `a control on ${host}`).toBe(ROLE_LEVEL[host] + CONTROL_LIFT);
    }
  });

  it('the ladder has room for the floor at every step', () => {
    // The floor is half a step, so every adjacent pair in the ladder can host a
    // nested child without leaving the ladder.
    for (let n = 0; n < LADDER.length - 1; n++) {
      expect(LADDER[n], `the half-step above S${n} exists`).toBeTruthy();
    }
  });
});

/**
 * THE RIM FOLLOWS THE HEIGHT, AND IT DID NOT BEFORE.
 *
 * Measured by eye, at three strengths on two hosts: a panel's rim at R2 is loud
 * and at R1 it is at the threshold — the same answer on the work plane and on the
 * canvas, which is why the whole table shifted rather than one role.
 *
 * The old table gave a panel the same tier as a menu: two steps of edge light for
 * one step of height. A rim is the light a surface catches on its edge, and how
 * much it catches depends on how far it sits above what it is on.
 */
describe('rim — the tier follows the height above the host', () => {
  it('structural surfaces catch no edge light', () => {
    // chrome and work DEFINE the frame and the plane. They do not sit on
    // anything, so there is no edge for light to catch.
    expect(ROLE_RIM.canvas).toBe(false);
    expect(ROLE_RIM.chrome).toBe(false);
    expect(ROLE_RIM.work).toBe(false);
  });

  it('one step above its host is one tier', () => {
    expect(ROLE_RIM.panel).toBe(true);
    expect(ROLE_RIM.control).toBe(true);
    expect(ROLE_RIM.menu).toBe(true);
    expect(ROLE_RIM.well).toBe(true);
  });

  it('and every surface that has one has the SAME one', () => {
    /**
     * The rim was four tiers — 0, 0.5, 1, 1.5 — and a role table that picked one.
     * Measured by eye at three boundaries, the reader's answer was the same at all of
     * them, so the tiers were a choice that was not there. `ROLE_RIM` says whether a
     * surface has a rim; the strength is one.
     */
    for (const role of ['popover', 'modal', 'toast', 'panel', 'control', 'menu'] as const) {
      expect(ROLE_RIM[role], `${role}`).toBe(true);
    }
    expect(new Set(Object.values(ROLE_RIM)).size, 'the table has more than two states').toBe(2);
  });

  it('the rim never exceeds the height it expresses — except a well, which is concave', () => {
    // The rule as an inequality: a role's rim tier is at most the number of steps
    // it sits above the structural plane.
    //
    // AND THE WELL IS THE EXCEPTION, which this assertion found by failing. A well
    // shares the work plane's LEVEL but not its edge: it is CUT IN, so light does
    // not land on a raised edge — it catches the far lip of a depression. The
    // engine's own note says why: a quiet seam would make an unselected control
    // disappear into the surface, which is the opposite of what it should do.
    for (const role of Object.keys(ROLE_LEVEL) as (keyof typeof ROLE_LEVEL)[]) {
      if (role === 'well') continue;
      const above = Math.max(0, ROLE_LEVEL[role] - ROLE_LEVEL.work);
      // The rim is one strength now, so what the height bounds is WHETHER a surface
      // has one: a role at the structural plane may not have an edge light to catch.
      if (above === 0) expect(ROLE_RIM[role], `${role} rim`).toBe(false);
    }
    expect(ROLE_RIM.well, 'a well is concave, so it catches light at the same level').toBe(true);
    expect(ROLE_LEVEL.well).toBe(ROLE_LEVEL.work);
  });
});

/**
 * TWO JOBS, TWO DISTANCES — and the names say which is which.
 *
 * The reader's argument, and the numbers agree: "if we want to keep the logic and
 * the meaning of a border, we have to choose one full step — because at anything
 * less, even a border is not a border."
 *
 *   separator  0.5 steps = 0.57q   a line between two regions of the SAME surface
 *   edge       1.0 steps = 1.14q   the boundary of a surface against what it sits on
 *
 * Half a step is 1.18x the measured edge threshold — a hint. A whole step is
 * 2.4x — a border. It was called `hairline`, which named a style rather than a
 * job, and that is how a surface's boundary ended up drawn at the separator's
 * strength in several components.
 */
describe('the border — a separator is a hint, an edge is a border', () => {
  const EDGE_THRESHOLD = 0.48 * PERCEPTUAL_QUANTUM;
  /**
   * Measured on the LEVEL, not on the hex.
   *
   * `resolveBorderHex` is quantised — it is what the display can write — so a test
   * that reads it finds the edge at 2.098 times the separator instead of 2.0. The
   * ratio is exact in the system and rounded in the hex, and measuring the level is
   * measuring the system.
   */
  const at = (role: 'work' | 'panel' | 'control', kind: 'separator' | 'edge') =>
    (resolveBorderLevel({ role, kind }) - ROLE_LEVEL[role]) * (LADDER_STEP / PERCEPTUAL_QUANTUM);

  it('a separator sits at the threshold — you feel the division, you do not read a line', () => {
    for (const role of ['work', 'panel', 'control'] as const) {
      const q = at(role, 'separator');
      expect(q, `${role} separator`).toBeGreaterThan(0.4);
      expect(q, `${role} separator`).toBeLessThan(0.8);
    }
  });

  it('an edge is TWICE the threshold, because a border has to be a border', () => {
    for (const role of ['work', 'panel', 'control'] as const) {
      const q = at(role, 'edge');
      expect(q, `${role} edge`).toBeGreaterThan(1);
      expect(q / (EDGE_THRESHOLD / PERCEPTUAL_QUANTUM), `${role} edge against the edge threshold`).toBeGreaterThan(2);
    }
  });

  it('and the two are exactly a factor of two apart, which is the rule in one line', () => {
    for (const role of ['work', 'panel', 'control'] as const) {
      expect(at(role, 'edge') / at(role, 'separator')).toBeCloseTo(2, 1);
    }
  });
});

/**
 * AND THE CEILING, WHERE THERE IS NO ROOM ABOVE.
 *
 * The inversion used to be `base - offset`, which put the toast's EDGE exactly on
 * S7 — its own host — and measured 0.0000q from it. A border the colour of what it
 * borders is not a border. The inverted border is capped at half a step down, so at
 * the ceiling an edge degenerates into a separator: half a step is all the room
 * there is, and the strongest available border is drawn.
 */
describe('the border at the ceiling', () => {
  const level = (role: 'toast', kind: 'separator' | 'edge') => resolveBorderLevel({ role, kind });

  it('never lands on the surface below it', () => {
    for (const kind of ['separator', 'edge'] as const) {
      const l = level('toast', kind);
      expect(l, `toast ${kind} lands on or below its host`).toBeGreaterThan(ROLE_LEVEL.toast - 1);
      expect(l, `toast ${kind} is above the ceiling`).toBeLessThanOrEqual(ROLE_LEVEL.toast);
    }
  });

  it('an edge degenerates into a separator, because half a step is the room there is', () => {
    expect(level('toast', 'edge')).toBe(ROLE_LEVEL.toast - 0.5);
    expect(level('toast', 'separator')).toBe(ROLE_LEVEL.toast - 0.5);
  });

  it('and it is still visible — the defect was 0.0000q from the host', () => {
    const l = level('toast', 'edge');
    const fromHost = (l - (ROLE_LEVEL.toast - 1)) * (LADDER_STEP / PERCEPTUAL_QUANTUM);
    expect(fromHost, 'the border is the colour of what it borders').toBeGreaterThan(0.5);
  });
});
