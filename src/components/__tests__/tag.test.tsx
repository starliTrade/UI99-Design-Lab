import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { Tag } from '../atoms/Tag/Tag';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { resolveSurface, resolveBorder, resolveBorderHex } from '../../engine/liminal-surface';
import type { SurfaceRole } from '../../engine/liminal-surface';
import { LADDER } from '../../engine/liminal-ladder';
import { SURFACE_TINT } from '../../engine/spec-engine';
import { hexToRgb, rgbToOklch, contrastRatioHex } from '../../engine/liminal-color-math';

const SP: any = LiminalColorEngine.EXTENDED_SPECTRUM;
const HOSTS: SurfaceRole[] = ['canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast'];
const render = (props: any) => renderToStaticMarkup(React.createElement(Tag, props));

/**
 * Tag used to sit on `SURFACE_TINT.subtle` — a white overlay at 0.03 — with a
 * border of `rgba(255,255,255,0.06)`. The overlay is a magic alpha, the border
 * is a raw literal the lint rule misses, and the overlay keeps climbing: on the
 * toast level its surface measured L 0.2342, above the ladder's ceiling of
 * L(8) = 0.2038.
 */
describe('tag — the surface is derived and bounded by the ladder', () => {
  it('sits one ladder step above whatever hosts it', () => {
    for (const host of HOSTS) {
      const expected = resolveSurface({ role: 'control', on: host }).background;
      expect(render({ host, children: 'x' }), `host ${host}`).toContain(`background:${expected}`);
    }
  });

  it('gets a hairline rim from the same host', () => {
    for (const host of HOSTS) {
      // The component renders a CSS variable, so the assertion reads the
      // variable — which is the whole point of the change.
      const expected = resolveBorder({ role: 'control', kind: 'separator', on: host });
      expect(render({ host, children: 'x' }), `host ${host}`).toContain(`1px solid ${expected}`);
    }
  });

  it('never leaves the ladder — the old overlay did', () => {
    // The overlay reached L 0.2342 on the toast level. The ceiling is L(8).
    const ceiling = rgbToOklch(hexToRgb(LADDER[LADDER.length - 1])).L;
    for (const host of HOSTS) {
      // The computed value, not the rendered one: what a component renders is
      // a variable now, and a variable has no lightness to measure.
      const surface = resolveSurface({ role: 'control', on: host }).backgroundHex;
      const L = rgbToOklch(hexToRgb(surface)).L;
      expect(L, `host ${host}: surface L ${L.toFixed(4)}`).toBeLessThanOrEqual(ceiling + 1e-6);
    }
  });

  it('never reuses the old white overlay', () => {
    // Named from the engine rather than typed out, so this cannot drift from it.
    // (The old border was a raw `1px solid rgba(255,255,255,0.06)` literal — the
    // one the lint rule's /^rgba?\(/ anchor misses. It is gone with the rest.)
    for (const host of HOSTS) {
      expect(render({ host, children: 'x' }), `host ${host}`).not.toContain(SURFACE_TINT.subtle);
    }
  });
});

describe('tag — the geometry is on the spacing scale and the type is fluid', () => {
  const S = LiminalLayoutEngine.SPACING;

  it('pads and gaps with SPACING values', () => {
    const html = render({ children: 'x' });
    expect(html).toContain(`padding:${S[1]}px ${S[3]}px`);
    expect(html).toContain(`gap:${S[1]}px`);
  });

  it('no longer uses the off-scale 10px', () => {
    expect(render({ children: 'x' })).not.toContain('padding:4px 10px');
  });

  it('takes its font-size from the fluid base, not a literal px', () => {
    // A static px ignored the reader's browser font-size setting.
    expect(render({ children: 'x' })).toContain(LiminalLayoutEngine.getTypeSizeCss(1));
    expect(render({ children: 'x' })).not.toContain(`font-size:${LiminalLayoutEngine.TYPOGRAPHY[1].fs}px`);
  });

  it('stays a chip where the badge is a pill — the two differ by meaning', () => {
    expect(render({ children: 'x' })).toContain(`border-radius:${LiminalLayoutEngine.RADIUS.chip}px`);
    expect(render({ children: 'x' })).not.toContain(`border-radius:${LiminalLayoutEngine.RADIUS.full}px`);
  });
});

describe('tag — the hue is decoration, and the label carries the meaning', () => {
  it('uses the spectrum hue for the text', () => {
    for (const s of SP.slice(0, 4)) {
      expect(render({ hue: s.hue, children: 'x' }), `hue ${s.hue}`).toContain(s.hex);
    }
  });

  it('falls back to Sapphire for an unknown hue rather than throwing', () => {
    expect(render({ hue: 999, children: 'x' })).toContain(SP[7].hex);
  });

  it('has no glyph — unlike Badge, its label already says which category it is', () => {
    expect(render({ hue: 145, children: 'Design' })).not.toContain('aria-hidden');
  });
});

describe('tag — the standards', () => {
  it('text meets WCAG AA on every surface it can sit on', () => {
    for (const host of HOSTS) {
      // The computed value, not the rendered one: what a component renders is
      // a variable now, and a variable has no lightness to measure.
      const surface = resolveSurface({ role: 'control', on: host }).backgroundHex;
      for (const s of SP) {
        const ratio = contrastRatioHex(s.hex, surface);
        expect(ratio, `${s.label} on ${host}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('the rim is a hairline, not a second surface', () => {
    // A rim that competed with the surface would be a border, and the system
    // says a hairline is a half-step — felt, not seen.
    for (const host of HOSTS) {
      // The computed value, not the rendered one: what a component renders is
      // a variable now, and a variable has no lightness to measure.
      const surface = resolveSurface({ role: 'control', on: host }).backgroundHex;
      const rim = resolveBorderHex({ role: 'control', kind: 'separator', on: host });
      const dL = Math.abs(rgbToOklch(hexToRgb(rim)).L - rgbToOklch(hexToRgb(surface)).L);
      expect(dL, `${host}: rim dL ${dL.toFixed(4)}`).toBeLessThan(0.012);
    }
  });

  it('the tag surface is never the same as the host below the ceiling', () => {
    for (const host of HOSTS.slice(0, -1)) {
      const tagSurface = resolveSurface({ role: 'control', on: host }).background;
      const hostSurface = resolveSurface({ role: host }).background;
      expect(tagSurface, `host ${host}`).not.toBe(hostSurface);
    }
  });
});
