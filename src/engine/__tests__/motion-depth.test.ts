import { describe, it, expect } from 'vitest';
import { LiminalMotionEngine as M } from '../liminal-motion-engine';
import { FLOATING_ROLES } from '../liminal-surface';

/** The four roles that float, as the motion rule's own parameter type. */
type FloatingRole = 'menu' | 'popover' | 'modal' | 'toast';
const FLOATING = FLOATING_ROLES as readonly FloatingRole[];

/**
 * THE DURATION OF A FLOATING SURFACE COMES FROM ITS HEIGHT.
 *
 * The engine already said this and did not do it: `slower` is commented
 * "container enter/exit (modal, sheet, dropdown)" — and the Modal entered in a
 * hand-written `0.25s`, which is `slow`. Worse, the raw seconds meant the theme's
 * motion slider could not reach the modal, the sheet or the tooltip at all: a
 * theme that multiplies `--liminal-duration-*` cannot move a component that wrote
 * its own duration by hand.
 *
 * These assertions hold the rule and the reason it exists.
 */
describe('motion — a floating surface takes its duration from its height', () => {
  it('rises with the height, and never falls back down', () => {
    const order = FLOATING.map((r) => M.DURATION[M.floatDuration(r)]);
    for (let i = 1; i < order.length; i++) {
      expect(order[i], `${FLOATING[i]} is not slower than ${FLOATING[i - 1]}`)
        .toBeGreaterThanOrEqual(order[i - 1]);
    }
    expect(order[0], 'a menu is not instant').toBeGreaterThan(M.DURATION.instant);
  });

  it('says what the scale said before anything used it', () => {
    // The comment on `slower` names the modal and the sheet. It is true now.
    expect(M.floatDuration('modal')).toBe('slower');
    expect(M.floatDuration('toast')).toBe('slower');
  });

  it('the two highest share a duration, on purpose', () => {
    // Past a certain distance the eye stops reading the journey as longer and
    // starts reading it as slow. A toast does not need to out-last a modal.
    expect(M.floatDuration('toast')).toBe(M.floatDuration('modal'));
  });

  it('the enter string is the scale, not a number written here', () => {
    for (const role of FLOATING) {
      const enter = M.floatEnter(role);
      expect(enter, `${role} enter`).toContain(`${M.DURATION[M.floatDuration(role)]}ms`);
      expect(enter).toContain(M.EASING.out);
    }
  });

  it('no component writes a raw duration any more', async () => {
    // The defect this rule was written to fix. A component that writes `0.25s`
    // is a component the theme cannot reach.
    const { readFileSync, readdirSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const walk = (dir: string): string[] => {
      const out: string[] = [];
      for (const e of readdirSync(dir)) {
        if (e === '__tests__' || e === 'node_modules') continue;
        const full = join(dir, e);
        if (statSync(full).isDirectory()) out.push(...walk(full));
        else if (/\.tsx$/.test(e) && !/Demo\.tsx$/.test(e)) out.push(full);
      }
      return out;
    };
    const offenders: string[] = [];
    for (const file of walk(join(process.cwd(), 'src/components'))) {
      const text = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/[^\n]*/g, '');
      // A TRANSITION with a bare second value — and an enter/exit ANIMATION with
      // one. A LOOP is excluded on purpose: a spinner's 1.6s and a skeleton's
      // pulse are a RHYTHM, not a journey, and the motion scale is about how long
      // a surface takes to arrive. A theme that slowed a spinner would be
      // changing a heartbeat to change a step.
      for (const m of text.matchAll(/(transition|animation):[^;\n]*?(\d*\.?\d+)s\b[^;\n]*/g)) {
        const decl = m[0];
        if (m[1] === 'animation' && /infinite/.test(decl)) continue;
        offenders.push(`${file.replace(process.cwd() + '/src/', '')}: ${decl.slice(0, 52)}`);
      }
    }
    expect(offenders, 'a duration the theme cannot reach').toEqual([]);
  });
});
