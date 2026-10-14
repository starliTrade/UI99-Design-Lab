import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {LADDER, HALF, getDirectionalRim, getTextStyle} from '../spec-engine';
import { FLOAT_SHADOWS } from '../liminal-surface';
import { WELLS, LADDER_STEP, PERCEPTUAL_QUANTUM } from '../liminal-ladder';
import { LiminalLayoutEngine as L } from '../liminal-layout-engine';
import { LiminalMotionEngine as M } from '../liminal-motion-engine';
import { LiminalColorEngine as C } from '../liminal-color-engine';
import { PERSIAN_LINE_HEIGHT_FLOOR } from '../liminal-persian';

const doc = JSON.parse(readFileSync(resolve(process.cwd(), 'tokens/liminal.tokens.json'), 'utf8'));

/**
 * The tokens live in TypeScript and reach CSS through a generator this repo
 * owns. That is enough for this repo and not enough for anyone else: a design
 * tool, a native app, a Figma plugin and a Tailwind preset all read tokens, and
 * none of them read a TypeScript file.
 *
 * DTCG is the format they agree on. This asserts the file matches the engine,
 * so the two cannot disagree — the same guarantee `index.css` has.
 */
describe('DTCG — the file is the engine, in the format other tools read', () => {
  it('declares the format it is', () => {
    expect(doc.$schema).toContain('design-tokens');
  });

  it('carries every ladder step with the engine’s hex', () => {
    LADDER.forEach((hex, i) => {
      expect(doc.color.ladder[`s${i}`].$value, `s${i}`).toBe(hex);
      expect(doc.color.ladder[`s${i}`].$type).toBe('color');
    });
  });

  it('carries the half-steps, which the CSS layer publishes too', () => {
    HALF.forEach((hex, i) => expect(doc.color.ladder[`s${i}-5`].$value, `s${i}-5`).toBe(hex));
  });

  it('carries both wells', () => {
    expect(doc.color.ladder.penumbra.$value).toBe(WELLS.penumbra);
    expect(doc.color.ladder.umbra.$value).toBe(WELLS.umbra);
  });

  it('carries the rim tiers as their own group', () => {
    for (const t of [1, 2, 3]) {
      const r = getDirectionalRim(t as 1, t as 1, false)!;
      expect(doc.color.rim[`rim${t}`].top.$value).toBe(r.top);
      expect(doc.color.rim[`rim${t}`].side.$value).toBe(r.side);
      expect(doc.color.rim[`rim${t}`].bottom.$value).toBe(r.bot);
    }
  });

  it('carries the shadows as boxShadow strings', () => {
    Object.entries(FLOAT_SHADOWS).forEach(([e, v]) => {
      expect(doc.color.shadow[e].$value).toBe(v);
      expect(doc.color.shadow[e].$type).toBe('boxShadow');
    });
  });

  it('carries the four text roles with their declared floors', () => {
    for (const role of ['primary', 'secondary', 'tertiary', 'quaternary']) {
      expect(doc.color.text[role].$value).toBe(getTextStyle(role as 'primary', 2).color);
      expect(doc.color.text[role].$description).toMatch(/APCA Lc \d+/);
    }
  });

  it('carries the semantic roles including the glyph', () => {
    for (const k of ['success', 'warning', 'danger', 'info']) {
      const s = (C.SEMANTICS as any)[k.toUpperCase()];
      expect(doc.color.semantic[k].solid.$value).toBe(s.solid);
      expect(doc.color.semantic[k].glyph.$value).toBe(s.glyph);
    }
  });

  it('carries every spacing step as a dimension with a unit', () => {
    Object.entries(L.SPACING).forEach(([k, v]) => {
      expect(doc.dimension.spacing[k].$value).toEqual({ value: v, unit: 'px' });
      expect(doc.dimension.spacing[k].$type).toBe('dimension');
    });
  });

  it('carries the control, target and border scales', () => {
    Object.entries(L.CONTROL).forEach(([k, v]) => expect(doc.dimension.control[k].$value).toEqual({ value: v, unit: 'px' }));
    Object.entries(L.TARGET).forEach(([k, v]) => expect(doc.dimension.target[k].$value).toEqual({ value: v, unit: 'px' }));
    Object.entries(L.BORDER).forEach(([k, v]) => expect(doc.dimension.border[k].$value).toEqual({ value: v, unit: 'px' }));
  });

  it('carries the type scale with a unitless line-height', () => {
    Object.entries(L.TYPOGRAPHY).forEach(([lvl, t]) => {
      expect(doc.typography[lvl].lineHeight.$value, `level ${lvl}`).toBe(t.lh);
      expect(doc.typography[lvl].lineHeight.$type, `level ${lvl}`).toBe('number');
      expect(doc.typography[lvl].fontSize.$value).toContain('--liminal-type-base');
    });
  });

  it('carries the durations and the easings as cubicBezier', () => {
    Object.entries(M.DURATION).forEach(([k, v]) => expect(doc.motion.duration[k].$value).toEqual({ value: v, unit: 'ms' }));
    expect(doc.motion.easing.out.$type).toBe('cubicBezier');
    expect(doc.motion.easing.out.$value).toEqual([0.16, 1, 0.3, 1]);
    expect(doc.motion.easing.linear.$value).toBe('linear');
  });

  it('records what a consumer cannot infer: the quantum and the Persian floor', () => {
    // A tool reading this file needs to know the step is measured, not chosen —
    // and that the Persian line-height floor belongs to a specific face.
    expect(doc.$extensions['com.liminal.ladder'].perceptualQuantum).toBe(PERCEPTUAL_QUANTUM);
    expect(doc.$extensions['com.liminal.ladder'].step).toBe(LADDER_STEP);
    expect(doc.$extensions['com.liminal.persian'].lineHeightFloor).toBe(PERSIAN_LINE_HEIGHT_FLOOR);
  });

  it('every token has a $value and a $type', () => {
    const walk = (g: unknown, path: string) => {
      if (typeof g !== 'object' || g === null) return;
      if ('$value' in (g as object)) {
        expect((g as any).$type, `${path} has no $type`).toBeTruthy();
        return;
      }
      for (const [k, v] of Object.entries(g as Record<string, unknown>)) {
        if (k.startsWith('$')) continue;
        walk(v, `${path}.${k}`);
      }
    };
    walk(doc, '');
  });
});
