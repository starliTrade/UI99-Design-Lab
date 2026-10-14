import { describe, it, expect } from 'vitest';
import { NEST_MIN, CONTROL_LIFT, resolveInset, resolveSurface, ROLE_LEVEL, ROLE_RIM } from '../liminal-surface';
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
    expect(ROLE_RIM.canvas).toBe(0);
    expect(ROLE_RIM.chrome).toBe(0);
    expect(ROLE_RIM.work).toBe(0);
  });

  it('one step above its host is one tier', () => {
    expect(ROLE_RIM.panel).toBe(1);
    expect(ROLE_RIM.control).toBe(1);
    expect(ROLE_RIM.menu).toBe(1);
    expect(ROLE_RIM.well).toBe(1);
  });

  it('floating is two tiers, and nothing is three', () => {
    expect(ROLE_RIM.popover).toBe(2);
    expect(ROLE_RIM.modal).toBe(2);
    expect(ROLE_RIM.toast).toBe(2);
    // Tier 3 exists in the table and no role uses it: a surface would have to
    // float two steps above the highest floating layer, and the ladder's ceiling
    // is where the toast already sits.
    expect(Math.max(...Object.values(ROLE_RIM))).toBe(2);
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
      expect(ROLE_RIM[role], `${role} rim`).toBeLessThanOrEqual(above);
    }
    expect(ROLE_RIM.well, 'a well is concave, so it catches light at the same level').toBe(1);
    expect(ROLE_LEVEL.well).toBe(ROLE_LEVEL.work);
  });
});
