import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {LADDER, HALF, getDirectionalRim} from '../spec-engine';
import { FLOAT_SHADOWS } from '../liminal-surface';
import { LiminalLayoutEngine as L } from '../liminal-layout-engine';
import { LiminalMotionEngine as M } from '../liminal-motion-engine';
import { LiminalColorEngine as C } from '../liminal-color-engine';
import { WELLS } from '../liminal-ladder';

const md = readFileSync(resolve(process.cwd(), 'DESIGN-CONTRACT.md'), 'utf8');

/**
 * DESIGN-CONTRACT.md is the document a human reads, and it had drifted eleven
 * times: a different 12-hue spectrum, the old hand-picked semantics, a
 * `MIST_SPEC` that had been deleted, `--liminal-s0` to `s5` when nine steps are
 * published, and sub-canvas lightnesses that were off by more than 0.01.
 *
 * Its value blocks are generated now, between markers, the same way `index.css`
 * is. This asserts the committed file matches the engine, so it cannot drift
 * back.
 */
describe('DESIGN-CONTRACT.md — the value blocks match the engine', () => {
  const block = (name: string) => {
    const m = md.match(new RegExp(`<!-- gen:${name} -->([\\s\\S]*?)<!-- /gen:${name} -->`));
    return m ? m[1] : '';
  };

  it('every generated block is present and non-empty', () => {
    for (const name of ['ladder-formula', 'quantum', 'ladder-steps', 'ladder-wells', 'rim', 'shadows', 'spacing', 'semantics', 'spectrum', 'durations', 'easings']) {
      expect(block(name).trim().length, `block ${name}`).toBeGreaterThan(0);
    }
  });

  it('names every ladder step with the engine’s hex', () => {
    const b = block('ladder-steps');
    LADDER.forEach((hex, i) => expect(b, `S${i}`).toContain(`\`${hex}\``));
  });

  it('names both sub-canvas wells with the engine’s hex', () => {
    const b = block('ladder-wells');
    expect(b).toContain(`\`${WELLS.penumbra}\``);
    expect(b).toContain(`\`${WELLS.umbra}\``);
  });

  it('carries the engine’s rim hexes', () => {
    const b = block('rim');
    // ONE rim: the tier table was a choice the eye did not have.
    {
      const r = getDirectionalRim(3, true, false)!;
      expect(b, 'rim top').toContain(r.top);
      expect(b, 'rim side').toContain(r.side);
    }
  });

  it('carries the engine’s shadows', () => {
    const b = block('shadows');
    Object.values(FLOAT_SHADOWS).forEach((v) => expect(b).toContain(v));
  });

  it('carries every spacing value', () => {
    const b = block('spacing');
    Object.entries(L.SPACING).forEach(([k, v]) => expect(b, `SPACING[${k}]`).toContain(`${v}px`));
  });

  it('carries the derived semantic roles, not the old hand-picked ones', () => {
    const b = block('semantics');
    for (const k of ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const) {
      const s = (C.SEMANTICS as any)[k];
      expect(b, k).toContain(s.text);
      expect(b, k).toContain(s.glyph);
    }
  });

  it('carries the engine’s spectrum, not a second palette', () => {
    const b = block('spectrum');
    (C.EXTENDED_SPECTRUM as any[]).forEach((s) => {
      expect(b, s.label).toContain(s.hex);
      expect(b, s.label).toContain(String(s.hue));
    });
  });

  it('carries every duration and easing', () => {
    const d = block('durations');
    Object.entries(M.DURATION).forEach(([k, v]) => expect(d, k).toContain(`\`${v}ms\``));
    const e = block('easings');
    Object.entries(M.EASING).forEach(([k, v]) => expect(e, k).toContain(v));
  });

  it('does not carry the stale values it used to', () => {
    // Each of these was in the file and is not a value the engine produces.
    for (const stale of ['#E86575', '#E09540', '#C8B030', '#90C440', '#3CBF7A', '#509CE8', '#7C88EC', '#B074E4', '#D864B8', '#E46494']) {
      expect(md, `stale spectrum hex ${stale}`).not.toContain(stale);
    }
    // `MIST_SPEC` is named once, in the prose that records its removal — so the
    // guard is against its VALUES, not the word.
    expect(md).not.toContain('0 0 44px');
    expect(md).not.toContain('rgba(13,14,18');
    expect(md).not.toContain('--liminal-s0` تا `--liminal-s5');
  });
});
