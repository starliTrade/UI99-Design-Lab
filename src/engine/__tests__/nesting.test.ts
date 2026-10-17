import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { getDirectionalRim, getLadderColor, RIM } from '../spec-engine';
import { shadowPeakAlpha } from '../liminal-shadow';
import { oklchLightness } from '../liminal-color-math';
import { NEST_MIN, CONTROL_LIFT, resolveInset, resolveSurface, ROLE_LEVEL, ROLE_RIM, resolveBorderLevel, allowedHost, checkPlacement, resolvedLevel, PLACEMENT_EXEMPTIONS } from '../liminal-surface';
import { LADDER, PERCEPTUAL_QUANTUM, LADDER_STEP, CANVAS_L, CEILING_IS_HARD } from '../liminal-ladder';
import type { SurfaceRole } from '../liminal-surface';

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


/**
 * LAW 2, ENFORCEABLE — and it was not enforced before.
 *
 *   on the canvas, only layer 1. On layer 1, only layer 2. And so on.
 *
 * `resolveSurface` accepted any combination, so S2 could be put straight on the canvas
 * and nothing objected. That exact defect was found in this project's own site once —
 * panels directly on the canvas, the work plane never built — and it was found by
 * looking, not by a test.
 */
describe('Law 2 — a layer sits on the one below it, and the gap is exactly one', () => {
  it('every role has exactly one host, and it is the level below', () => {
    for (const role of Object.keys(ROLE_LEVEL) as SurfaceRole[]) {
      const host = allowedHost(role);
      if (ROLE_LEVEL[role] === 0) {
        expect(host, 'the canvas sits on nothing').toBeNull();
        continue;
      }
      expect(host, `${role} has no host`).not.toBeNull();
      expect(ROLE_LEVEL[role] - ROLE_LEVEL[host!], `${role} → ${host}`).toBe(1);
    }
  });

  it('and a placement that skips a layer is refused, with the gap named', () => {
    // The exact defect: the work plane on the canvas, skipping chrome.
    const bad = checkPlacement({ role: 'work', on: 'canvas' });
    expect(bad.ok).toBe(false);
    expect(bad.reason, 'the reason names how many layers were skipped').toContain('skipped 1 layer');
    // And a layer that is not above its host at all.
    expect(checkPlacement({ role: 'canvas', on: 'work' }).ok).toBe(false);
  });

  it('a CONTROL is a relationship, not a level — it is one step above its host', () => {
    // `control on work` is legal and lands at the panel's level. The first version of
    // this guard compared the role's NOMINAL level and called it a violation.
    expect(resolvedLevel('control', 'work')).toBe(ROLE_LEVEL.work + 1);
    expect(checkPlacement({ role: 'control', on: 'work' }).ok).toBe(true);
    expect(checkPlacement({ role: 'control', on: 'panel' }).ok).toBe(true);
  });

  it('and the ONE real case is named, with its reason', () => {
    // A control inside a floating surface has no step above it: 8 + 1 is past the
    // ceiling and clamps back to 8, so the control's surface IS its host. That is the
    // same open question as the rim at the ceiling, and it is exempted deliberately
    // rather than the rule quietly not applying.
    expect(resolvedLevel('control', 'toast')).toBe(ROLE_LEVEL.toast);
    for (const e of PLACEMENT_EXEMPTIONS) {
      expect(e.reason.length, `${e.role} on ${e.on} has no reason`).toBeGreaterThan(20);
      expect(checkPlacement({ role: e.role, on: e.on }).ok).toBe(true);
    }
    expect(PLACEMENT_EXEMPTIONS.length, 'there is more than one kind of exemption').toBe(2);
  });

  it('and every legal placement is accepted', () => {
    for (const role of Object.keys(ROLE_LEVEL) as SurfaceRole[]) {
      const host = allowedHost(role);
      if (!host) continue;
      expect(checkPlacement({ role, on: host }).ok, `${role} on ${host}`).toBe(true);
    }
  });

  it('the well and the work plane are the same level, so both are a valid host', () => {
    // A well is cut into the work plane rather than sitting above it, so a panel's
    // host is ambiguous between them — and both are correct, because they are the
    // same plane. The guard accepts either.
    expect(ROLE_LEVEL.well).toBe(ROLE_LEVEL.work);
    expect(checkPlacement({ role: 'panel', on: 'work' }).ok).toBe(true);
    expect(checkPlacement({ role: 'panel', on: 'well' }).ok).toBe(true);
  });
});

/**
 * AND THE GUARD HAS TO LOOK AT THE REAL APP, not only at itself.
 *
 * A rule that is asserted against its own definitions is a rule that passes by finding
 * nothing. So this walks every component that declares a host — `on: 'work'` and the
 * like — and checks the placement against Law 2. It is a small list because most
 * components do not declare one, which is itself the finding: the composition is not
 * declared anywhere, so the rule can only check what is written down.
 */
describe('Law 2 — against the components that declare a host', () => {
  it('every declared placement is legal', async () => {
    const { readFileSync, readdirSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const walk = (dir: string): string[] => {
      const out: string[] = [];
      for (const e of readdirSync(dir)) {
        if (e === 'node_modules') continue;
        const full = join(dir, e);
        if (statSync(full).isDirectory()) out.push(...walk(full));
        else if (/\.tsx?$/.test(e)) out.push(full);
      }
      return out;
    };
    const declared: { file: string; role: string; on: string }[] = [];
    for (const file of walk(join(process.cwd(), 'src/components'))) {
      const text = readFileSync(file, 'utf8');
      // `resolveSurface({ role: 'x', on: 'y' })` and the same for resolveBorder.
      for (const m of text.matchAll(/role:\s*'(\w+)'[^}]*?on:\s*'(\w+)'/g)) {
        declared.push({ file: file.replace(process.cwd() + '/src/', ''), role: m[1], on: m[2] });
      }
    }
    // The guard has to prove it is looking at something, or it passes by finding none.
    expect(declared.length, 'no declared placements were found to check').toBeGreaterThan(0);
    const violations = declared
      .map((d) => ({ ...d, check: checkPlacement({ role: d.role as SurfaceRole, on: d.on as SurfaceRole }) }))
      .filter((d) => !d.check.ok)
      .map((d) => `${d.file}: ${d.role} on ${d.on} — ${d.check.reason}`);
    expect(violations, 'a placement Law 2 does not allow').toEqual([]);
  });
});

/**
 * AND THE CEILING IS A HARD BOUND — IT BOUNDS EVERYTHING, NOT ONLY THE SURFACES.
 *
 * The reader's decision, for stability: "I consider A more stable and more LIMINAL." So
 * the design DEGRADES rather than EXPANDS — a rim with nowhere to go turns dark, and a
 * control with nowhere to go anchors on its host. The alternative was to let values
 * above S8 exist, which would extend the palette every time something needed to go up —
 * and the palette is the identity.
 */
describe('the ceiling is a hard bound', () => {
  const MAX = LADDER.length - 1;

  it('no role resolves above it, whatever it sits on', () => {
    for (const role of Object.keys(ROLE_LEVEL) as SurfaceRole[]) {
      for (const on of Object.keys(ROLE_LEVEL) as SurfaceRole[]) {
        expect(resolvedLevel(role, on), `${role} on ${on}`).toBeLessThanOrEqual(MAX);
      }
    }
  });

  it('no border lands above it, at any role', () => {
    for (const role of Object.keys(ROLE_LEVEL) as SurfaceRole[]) {
      for (const kind of ['separator', 'edge'] as const) {
        expect(resolveBorderLevel({ role, kind }), `${role} ${kind}`).toBeLessThanOrEqual(MAX);
      }
    }
  });

  it('and no rim stop lands above it, at any level', () => {
    // Read from the PAINTED gradient: `top`/`side`/`bot` are hexes, and a hex is the
    // quantised rendering rather than the value the browser paints.
    const ceilingL = CANVAS_L + MAX * LADDER_STEP;
    for (let n = 0; n <= MAX; n++) {
      const stops = getDirectionalRim(n, true, false)!.cssBackground.match(/oklch\([^)]+\)/g) ?? [];
      expect(stops.length, `S${n} has three stops`).toBe(3);
      for (const stop of stops) {
        const L = Number(stop.match(/oklch\(([\d.]+)/)![1]);
        expect(L, `S${n}'s rim went above the ceiling`).toBeLessThanOrEqual(ceilingL + 1e-6);
      }
    }
  });

  it('and the decision is written down, in the policy and in the code', () => {
    const policy = readFileSync(resolve(process.cwd(), 'LIMINAL-POLICY.md'), 'utf8');
    expect(policy, 'the policy does not carry the decision').toContain('سقف همه‌چیز را محدود می‌کند');
    expect(CEILING_IS_HARD, 'the code does not carry the decision').toBe(true);
  });
});

/**
 * AND EVERY TREATMENT'S STRENGTH IS A CONSTANT — LAW 1, ONE LEVEL DOWN.
 *
 * The reader's decision: "constant numbers and perceptual distances are our winning
 * combination." So a treatment's strength does not move with where it is used.
 *
 *   separator   0.5 steps   always
 *   edge        1.0 steps   always
 *   rim         1.5 steps   always
 *   shadow      1 quantum   always
 *
 * WHICH IS WHY THE TWO REFERENCE FRAMES ARE NOT A DEFECT. A border and a rim are
 * properties OF A SURFACE — its own edge — so they are measured against the surface and
 * they are the same everywhere. A shadow is a property of the RELATIONSHIP between a
 * surface and what it falls on, so it is measured against the host. Each has one ruler,
 * and the ruler never changes.
 *
 * AND THE CONSEQUENCE IS ACCEPTED RATHER THAN FIXED: a border on a panel over the canvas
 * is 4.56q from the canvas while the same border on a panel over a work plane is 2.28q.
 * That is the hierarchy showing through, not an error — a panel on the canvas IS a
 * bigger statement than a panel on a work plane.
 */
describe('every treatment has one constant strength', () => {
  it('the border does not move with the host', () => {
    for (const role of ['work', 'panel', 'control'] as const) {
      for (const kind of ['separator', 'edge'] as const) {
        const level = resolveBorderLevel({ role, kind });
        const offset = level - ROLE_LEVEL[role];
        expect(offset, `${role} ${kind}`).toBe(kind === 'separator' ? 0.5 : 1);
      }
    }
  });

  it('the rim does not move with the host', () => {
    expect(RIM.t).toBe(1.5);
    expect(RIM.s).toBe(1);
    expect(RIM.b).toBe(0.5);
  });

  it('the shadow does not move with the height — only its radius does', () => {
    // Measured in CONTINUOUS space: rounding the composite to a hex first measures the
    // display rather than the system, and reports 0.78q where the system says 1.
    const linear = (c: number) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const Lf = (c: number[]) => {
      const [R, G, B] = c.map(linear);
      const l = Math.cbrt(0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B);
      const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
      const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
      return 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
    };
    const rgbAt = (level: number) => [1, 3, 5].map((i) => parseInt(getLadderColor(level).slice(i, i + 2), 16));
    for (const host of [0, 2, 3]) {
      const bg = rgbAt(host);
      const peak = shadowPeakAlpha(bg);
      const composite = bg.map((b, i) => b + peak * ([1, 2, 3][i] - b));
      const quanta = Math.abs((Lf(composite) - Lf(bg)) / PERCEPTUAL_QUANTUM);
      expect(quanta, `on S${host}`).toBeCloseTo(1, 2);
    }
  });

  it('and the four constants are four different numbers, one step apart', () => {
    // A hint, a border, a light — and a shadow, which is not a step but a quantum.
    expect([0.5, 1, RIM.t]).toEqual([0.5, 1, 1.5]);
    expect(new Set([0.5, 1, RIM.t]).size).toBe(3);
  });
});
