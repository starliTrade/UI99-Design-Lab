import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { FIXTURES } from '../../components/__matrix__/fixtures';
import { LADDER, getLadderVar } from '../liminal-ladder';
import { createLiminalTheme } from '../liminal-theme';

/**
 * A SURFACE HAS TO FOLLOW A THEME, AND THIS IS THE GUARD.
 *
 * The engine's rule is that a rendered surface is a VARIABLE, never a hex:
 * `getLadderVar(n)` for a style, `getLadderColor(n)` for arithmetic and tests.
 * One place broke it — the mist built its fog from `LADDER[level]`, so a themed
 * page had a mist that ignored `data-liminal-theme`. Nothing caught it, because
 * nothing was looking.
 *
 * The check renders every component and looks for a ladder hex in a style
 * attribute. A hex inside a `var()` fallback is allowed and is not a violation:
 * `var(--liminal-brand-on, #060709)` is a default for a token that may not be
 * defined, not a surface that refuses to move.
 */
const LADDER_HEXES = new Set(LADDER.map((h) => h.toLowerCase()));

/** Components the server renderer cannot draw. Reported, not hidden. */
const skipped: string[] = [];

/** Style text with every `var(--liminal-x, fallback)` reduced to the var name. */
function withoutFallbacks(style: string): string {
  return style.replace(/var\(\s*--liminal-[a-z0-9-]+\s*,\s*[^()]*\)/gi, 'var()');
}

function bakedLadderColours(): string[] {
  const found: string[] = [];
  for (const f of FIXTURES) {
    for (const state of f.states) {
      // A component that renders through a portal cannot be server-rendered.
      // Those are counted separately below rather than silently skipped.
      let html: string;
      try { html = renderToStaticMarkup(f.render(state)); } catch { skipped.push(`${f.name} (${state})`); continue; }
      for (const m of html.matchAll(/style="([^"]*)"/g)) {
        const style = withoutFallbacks(m[1]);
        for (const hex of style.match(/#[0-9a-fA-F]{6}\b/g) ?? []) {
          if (LADDER_HEXES.has(hex.toLowerCase())) found.push(`${f.name} (${state}): ${hex}`);
        }
      }
    }
  }
  return found;
}

describe('a surface follows a theme', () => {
  it('no component bakes a ladder colour into a rendered style', () => {
    expect(bakedLadderColours(), 'a hex where a variable belongs').toEqual([]);
  });

  it('the components were actually rendered, so the guard is not vacuous', () => {
    expect(FIXTURES.length).toBeGreaterThan(30);
    const rendered = FIXTURES.filter((f) => {
      try { return renderToStaticMarkup(f.render(f.states[0])).includes('style="'); } catch { return false; }
    });
    expect(rendered.length).toBeGreaterThan(30);
    // Portals cannot be server-rendered; the list is asserted so it cannot grow
    // quietly into "the guard stopped looking at half the kit".
    expect([...new Set(skipped.map((s) => s.split(' (')[0]))].sort()).toEqual([
      'AlertDialog',
      'CommandPalette',
      'Drawer',
      'HoverCard',
      'Modal',
      'Popover',
      'Sheet',
      'Toast',
    ]);
  });

  it('the theme carries the ladder, so the guard is looking at the right thing', () => {
    // The theme used to REGENERATE the ladder at a hue, which is what made a
    // themed page's surfaces move. It carries the engine's ladder now — the
    // identity is not a setting — so the guard's subject is the ladder itself.
    const themed = createLiminalTheme({ density: 1.2 });
    expect(themed.ladder).toEqual([...LADDER]);
    expect(themed.css).toContain('--liminal-s0');
    expect(getLadderVar(4)).toContain('var(--liminal-');
  });
});
