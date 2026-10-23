import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import * as csstree from 'css-tree';
import {
  FLOATING_MIST_ROLES,
  floatHeight,
  mistBlur,
  mistCssVars,
  mistEdgeAlpha,
  mistFillStops,
  mistInnerLight,
  mistShadowFarAlpha,
  mistShadowFarRadius,
  mistShadowNearAlpha,
  mistShadowNearRadius,
  mistFloatShadow,
} from '../liminal-mist';
import { LADDER } from '../liminal-ladder';
import { shadowModel } from '../liminal-shadow';
import { oklchToRgb } from '../liminal-color-math';
import { CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE } from '../liminal-ladder';

const WORK_PLANE = (() => {
  const { r, g, b } = oklchToRgb({ L: CANVAS_L + 2 * LADDER_STEP, C: LADDER_CHROMA, h: LADDER_HUE });
  return [r, g, b];
})();
import { resolveBorder, type SurfaceRole } from '../liminal-surface';

const here = dirname(fileURLToPath(import.meta.url));
const mistCss = readFileSync(resolve(here, '../liminal-mist.css'), 'utf8');

const ROLES = [...FLOATING_MIST_ROLES].sort((a, b) => floatHeight(a) - floatHeight(b));
const vars = (role: SurfaceRole) => mistCssVars(role);
// Values arrive as CSS lengths (`6.5px`) and as bare numbers (`0.325`).
const num = (s: string) => parseFloat(s);

/**
 * The mist engine has been rewritten five times and every one of its three
 * stale-value bugs was caught by a human eye, not by a test — because it had no
 * test. These assert the RULES the rewrites produced, not the formulas they
 * ended up with: a test that restates `0.055 + h * 0.006` would pass just as
 * happily if the rule behind it were wrong.
 */
describe('mist — the surface diffuses light, it does not emit it', () => {
  it('never draws a symmetric halo in the stylesheet', () => {
    // `0 0 Npx` is a glow: the surface appears to radiate. v4 shipped exactly
    // that and read as neon. Every mist shadow must have a downward offset.
    const blocks = [...mistCss.matchAll(/box-shadow:\s*([\s\S]*?);/g)].map((m) => m[1]);
    expect(blocks.length).toBeGreaterThan(0);
    for (const block of blocks) {
      expect(block, `symmetric halo in: ${block.trim().slice(0, 60)}`).not.toMatch(
        /(^|,)\s*0\s+0\s+(?:\d|var\()/m,
      );
    }
  });

  it('casts a dark shadow below, never a light one around', () => {
    for (const role of ROLES) {
      const v = vars(role);
      expect(num(v['--liminal-mist-shadow-near'])).toBeGreaterThan(0);
      expect(num(v['--liminal-mist-shadow-far'])).toBeGreaterThan(0);
      expect(num(v['--liminal-mist-shadow-far-alpha'])).toBeGreaterThan(0);
    }
    // The shadow is near-black, not the brand: light is neutral and the shadow
    // is the absence of it.
    // The colour moved with the shadow itself (roadmap 2.4): the stylesheet now uses the
    // engine's single floating-shadow string, so the rule is checked there.
    for (const role of ROLES) expect(mistFloatShadow(role)).toMatch(/rgba\(1, 2, 3,/);
  });

  it('builds the fog as a vertical gradient, top lighter than bottom', () => {
    // The stops are ladder VARIABLES, not hexes. They used to be hexes, and a
    // hex cannot follow a theme: the mist was the last surface in the engine
    // that ignored `data-liminal-theme`.
    const levelOf = (v: string) => {
      const m = v.match(/--liminal-s(\d+)/);
      expect(m, `${v} is not a ladder variable`).not.toBeNull();
      return Number(m![1]);
    };
    for (const role of ROLES) {
      const { top, bottom } = mistFillStops(role);
      expect(levelOf(top), `${role} top`).toBeGreaterThan(levelOf(bottom));
    }
    expect(mistCss).toMatch(/linear-gradient\(\s*180deg/);
  });

  /**
   * THE SEAM IS A LADDER LEVEL NOW, AND THE OLD ASSERTION IS WHY IT WAS NOT.
   *
   * This test asked for `alpha < 0.12` and passed — while the seam composited to
   * #1a1c1e over the canvas, and the ladder's ceiling is #15171a. A threshold on
   * an ALPHA cannot see the thing that matters: what the line composites to. The
   * seam was above the system's own ceiling on every mist surface, at every
   * height, and the test that was written to catch a loud ring said it was fine.
   *
   * So it asserts the ceiling now, in the ladder's own terms: the seam is a
   * `resolveBorder` level, which is half a step above the surface it belongs to
   * and inverts at the ceiling rather than exceeding it.
   */
  it('keeps the seam at the engine\'s own edge — never above the ceiling', () => {
    for (const role of ROLES) {
      const seam = vars(role)['--liminal-mist-seam'];
      expect(seam, `${role} seam is not the engine's edge`).toContain('color-mix');
      expect(seam, `${role} seam does not come from resolveBorder`).toContain(resolveBorder({ role, kind: 'separator' }));
    }
  });
});

describe('mist — every value follows from the height', () => {
  const published = (role: SurfaceRole) => vars(role);

  it('rises monotonically with the role’s height', () => {
    const rising = (xs: number[]) => xs.every((x, i) => i === 0 || x > xs[i - 1]);
    const series = (f: (r: SurfaceRole) => number) => ROLES.map(f);

    expect(rising(series(mistInnerLight))).toBe(true);
    expect(rising(series(mistShadowFarRadius))).toBe(true);
    expect(rising(series(mistEdgeAlpha))).toBe(true);
    expect(rising(series(mistBlur))).toBe(true);
    // AND THE SHADOW'S ALPHA IS NOT IN THIS LIST, because it does not rise.
    // The darkness is one quantum by construction now — SOLVED per host rather than
    // written down — so what rises with height is the radius. A shadow that got
    // darker with height would be saying "higher is darker", which is not what
    // height means; height means further, and further means wider.
    expect(rising(series(mistShadowFarAlpha)), 'the alphas are constant, not rising').toBe(false);
  });

  it('is linear in the height — a formula, not a per-role table', () => {
    // The defect this replaces was a table of hand-tuned constants, where a
    // toast at S8 and a menu at S5 got the same treatment. If any value were
    // hand-tuned per role, it would leave the line.
    // `tol` covers the values the engine rounds before publishing — the far
    // shadow radius is emitted as whole pixels, so it can sit up to half a
    // pixel off the line without having left the formula.
    const linear = (f: (r: SurfaceRole) => number, tol = 1e-9) => {
      const pts = ROLES.map((r) => [floatHeight(r), f(r)] as const);
      const [h0, v0] = pts[0];
      const [h1, v1] = pts[1];
      const slope = (v1 - v0) / (h1 - h0);
      return pts.every(([h, v]) => Math.abs(v - (v0 + slope * (h - h0))) <= tol);
    };

    expect(linear(mistInnerLight)).toBe(true);
    expect(linear(mistShadowFarRadius)).toBe(true);
    // The ALPHAS no longer rise with height: the darkness is one quantum by
    // construction, solved per host. What rises is the radius.
    expect(linear(mistShadowFarRadius)).toBe(true);
    expect(linear(mistEdgeAlpha)).toBe(true);
    expect(linear(mistBlur)).toBe(true);
    // The far radius is published as whole pixels, so allow a pixel of rounding:
    // a line fitted to rounded points cannot land within half a pixel of all of
    // them.
    expect(linear((r) => num(published(r)['--liminal-mist-shadow-far']), 1)).toBe(true);
  });

  it('the published shadow IS the exported function — one formula, not two', () => {
    // Writing these tests surfaced a pair of copies. `mistCssVars` published
    // `40 + h * 3.2` while the exported `mistShadowBlur` said `40 + h * 9`, and
    // nothing called the helper, so the two never met. The published value is
    // the one that was eye-tested, so the helper was corrected to it and
    // `mistCssVars` now reads the helper.
    const h = floatHeight('menu');
    expect(num(vars('menu')['--liminal-mist-shadow-far'])).toBe(Math.round(mistShadowFarRadius('menu')));
    // The formula is the MODEL's, not a copy of it. This assertion used to spell
    // out `40 + h * 3.2` — the old model, whose 40px constant dominated the radius
    // so the height barely moved it. The shadow now scales from the height, and
    // this line reads the model rather than restating it: a test that spells out
    // the formula it is checking cannot notice the formula changing.
    expect(num(vars('menu')['--liminal-mist-shadow-near'])).toBeCloseTo(mistShadowNearRadius('menu'), 1);
  });

  it('gives a higher surface a larger shadow and more light', () => {
    const low = ROLES[0];
    const high = ROLES[ROLES.length - 1];
    expect(mistShadowFarRadius(high)).toBeGreaterThan(mistShadowFarRadius(low));
    expect(mistInnerLight(high)).toBeGreaterThan(mistInnerLight(low));
    expect(floatHeight(high)).toBeGreaterThan(floatHeight(low));
  });
});

describe('mist — a toast is not a menu', () => {
  it('gives a toast a near-solid fill and no inner light', () => {
    const toast = vars('toast');
    expect(num(toast['--liminal-mist-fill-top-alpha'])).toBe(0.94);
    expect(num(toast['--liminal-mist-fill-bottom-alpha'])).toBe(0.94);
    // No light on the edge: a notification must not demand attention.
    expect(toast['--liminal-mist-inner-light']).toBe('inset 0 0 0 rgba(0, 0, 0, 0)');
  });

  it('gives an interactive surface a gradient fill and a real hairline', () => {
    const menu = vars('menu');
    expect(num(menu['--liminal-mist-fill-top-alpha'])).toBeLessThan(0.94);
    expect(num(menu['--liminal-mist-fill-top-alpha'])).toBeGreaterThan(
      num(menu['--liminal-mist-fill-bottom-alpha']),
    );
    expect(menu['--liminal-mist-inner-light']).toMatch(/^inset 0 1px 0 rgba\(/);
  });

  it('gives a glass a fainter frame than a fog, and a fog the engine\'s edge', () => {
    // A window's frame is fainter than a mass's edge — the `fill` option scales
    // the seam, because a glass keeps a fifth of its own fill and its boundary
    // has to be read against the PAGE rather than against the surface.
    const pct = (r: SurfaceRole, fill?: number) =>
      num(mistCssVars(r, fill === undefined ? {} : { fill })['--liminal-mist-seam'].match(/\s(\d+)%/)![1]);
    expect(pct('menu')).toBe(100);
    expect(pct('menu', 0.2)).toBe(20);
    expect(pct('menu', 0.2)).toBeLessThan(pct('menu'));
  });
});

describe('mist — it applies only to what floats', () => {
  it('names exactly the four floating roles', () => {
    expect([...FLOATING_MIST_ROLES].sort()).toEqual(['menu', 'modal', 'popover', 'toast']);
  });

  it('leaves backdrop blur off unless it is asked for', () => {
    // The measured lesson: a uniform backdrop blur cost 35.7x and was invisible
    // on these backgrounds. It must never be on by default.
    const defaultBlock = mistCss.match(/\[data-liminal-mist\]\s*\{([\s\S]*?)\n\}/)![1];
    expect(defaultBlock).not.toMatch(/backdrop-filter/);
    expect(mistCss).toMatch(/\[data-liminal-mist='diffuse'\]/);
  });
});

describe('mist — every published value is a real CSS value', () => {
  // The same guard the token layer needed: a generator that interpolates a
  // value of the wrong shape emits something that looks like CSS and is not.
  const all = ROLES.flatMap((role) =>
    Object.entries(mistCssVars(role)).map(([name, value]) => ({ role, name, value })),
  );

  it('publishes a complete set for every floating role', () => {
    // 13 per role: the 11 readouts, the shadow the stylesheet uses (2.4), and the halo (no frame).
    expect(all.length).toBe(ROLES.length * 13);
  });

  it('parses as a CSS value', () => {
    const bad = all
      .filter(({ value }) => {
        try {
          csstree.parse(value, { context: 'value' });
          return false;
        } catch {
          return true;
        }
      })
      .map(({ role, name, value }) => `${role} ${name}: ${value}`);
    expect(bad).toEqual([]);
  });

  it('publishes a real colour wherever it claims one', () => {
    const looksLikeColour = /^(#|rgba?\(|hsla?\(|oklch\(|oklab\()/i;
    const bad = all
      .filter(({ value }) => looksLikeColour.test(value))
      .filter(({ value }) => csstree.lexer.matchProperty('color', value).error !== null)
      .map(({ role, name, value }) => `${role} ${name}: ${value}`);
    expect(bad).toEqual([]);
  });
});
