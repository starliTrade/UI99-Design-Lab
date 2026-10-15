import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { Badge } from '../atoms/Badge/Badge';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { resolveSurface, resolveBorder, ROLE_LEVEL } from '../../engine/liminal-surface';
import type { SurfaceRole } from '../../engine/liminal-surface';
import { getTextStyle } from '../../engine/spec-engine';
import { LADDER } from '../../engine/liminal-ladder';
import { SURFACE_TINT } from '../../engine/spec-engine';

const SEM: any = LiminalColorEngine.SEMANTICS;
const KEYS = ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const;
const HOSTS: SurfaceRole[] = ['canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast'];

const render = (props: any) => renderToStaticMarkup(React.createElement(Badge, props));

/**
 * The badge was the least-derived component in the system: its surface was a
 * white overlay on no scale, its geometry was three off-scale numbers, and its
 * meaning was carried by colour alone — which collapses under every form of
 * colour blindness.
 */
describe('badge — the surface is derived from its host', () => {
  it('sits one ladder step above whatever hosts it', () => {
    for (const host of HOSTS) {
      const expected = resolveSurface({ role: 'control', on: host }).background;
      const html = render({ host, children: 'x' });
      expect(html, `host ${host}`).toContain(`background:${expected}`);
    }
  });

  it('gets a hairline rim from the same host', () => {
    for (const host of HOSTS) {
      const expected = resolveBorder({ role: 'control', kind: 'separator', on: host });
      expect(render({ host, children: 'x' }), `host ${host}`).toContain(`1px solid ${expected}`);
    }
  });

  it('defaults to the work surface when nothing says otherwise', () => {
    expect(render({ children: 'x' })).toContain(
      `background:${resolveSurface({ role: 'control', on: 'work' }).background}`,
    );
  });

  it('never reuses the old white overlay', () => {
    // SURFACE_TINT.medium is a white alpha on no scale at all. Named from the
    // engine rather than typed out, so this test cannot drift from it.
    for (const host of HOSTS) {
      expect(render({ host, children: 'x' }), `host ${host}`).not.toContain(SURFACE_TINT.medium);
    }
  });
});

describe('badge — meaning is carried by shape, not by colour', () => {
  it('every semantic role has a glyph', () => {
    for (const k of KEYS) {
      expect(SEM[k].glyph, `${k} has no glyph`).toBeTruthy();
    }
  });

  it('the four glyphs are distinct — otherwise shape carries nothing', () => {
    const glyphs = KEYS.map((k) => SEM[k].glyph);
    expect(new Set(glyphs).size).toBe(KEYS.length);
  });

  it('renders the glyph for each semantic role', () => {
    for (const k of KEYS) {
      const html = render({ semantic: k.toLowerCase(), children: 'x' });
      expect(html, k).toContain(SEM[k].glyph);
      expect(html, k).toContain(SEM[k].text);
    }
  });

  it('hides the glyph from assistive tech — the label already says it', () => {
    const html = render({ semantic: 'danger', children: 'خطا' });
    expect(html).toContain('aria-hidden="true"');
  });

  it('keeps the label neutral, so colour is never the only carrier', () => {
    const html = render({ host: 'work', semantic: 'success', children: 'x' });
    expect(html).toContain(getTextStyle('primary', ROLE_LEVEL.work + 1).color);
  });
});

describe('badge — the geometry is on the spacing scale', () => {
  const S = LiminalLayoutEngine.SPACING;

  it('pads and gaps with SPACING values, not off-scale numbers', () => {
    const html = render({ children: 'x' });
    expect(html).toContain(`padding:${S[1]}px ${S[3]}px`);
    expect(html).toContain(`gap:${S[1]}px`);
  });

  it('no longer uses the old 3px / 10px / 6px', () => {
    const html = render({ children: 'x' });
    expect(html).not.toContain('padding:3px 10px');
    expect(html).not.toContain('gap:6px');
  });

  it('is a pill — the one place this system allows a loud radius', () => {
    expect(render({ children: 'x' })).toContain(`border-radius:${LiminalLayoutEngine.RADIUS.full}px`);
  });
});

describe('badge — at the ladder ceiling', () => {
  it('still separates from a toast, through the rim', () => {
    const html = render({ host: 'toast', children: 'x' });
    const rim = resolveBorder({ role: 'control', kind: 'separator', on: 'toast' });
    const ceiling = LADDER[LADDER.length - 1];
    expect(rim).not.toBe(ceiling);
    expect(html).toContain(`1px solid ${rim}`);
  });
});
