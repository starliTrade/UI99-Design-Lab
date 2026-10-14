import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LiminalLayoutEngine } from '../liminal-layout-engine';
import { Grid, GridCol } from '../../components/layout/Grid/Grid';
import { AppShell } from '../../components/layout/AppShell/AppShell';
import { Sidebar } from '../../components/nav/Sidebar/Sidebar';
import FormLayout from '../../components/composites/FormLayout/FormLayout';

const S = LiminalLayoutEngine.SPACING;
const BP = LiminalLayoutEngine.BREAKPOINTS;

// vitest runs from the project root, so this is stable.
const SRC = resolve(process.cwd(), 'src');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__' || entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx|css)$/.test(entry)) out.push(full);
  }
  return out;
}

/** Every width literal written into a media/container query anywhere in src/. */
function literalWidthQueries(): string[] {
  const offenders: string[] = [];
  for (const file of walk(SRC)) {
    // COMMENTS ARE NOT CODE.
    //
    // The guard matched its own documentation: a comment explaining that
    // `@media (max-width: 900px)` asks about the viewport contains exactly the
    // pattern this rule looks for, and the file was reported as a violation for
    // describing the thing it avoids. A guard that reads prose lies — and it
    // lies toward "everything is broken", which is how a guard gets ignored.
    const text = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '');
    for (const m of text.matchAll(/@(?:media|container)[^{]*?(?:(?:max|min)-width\s*:|width\s*[<>]=?)\s*(\d+)px/g)) {
      offenders.push(`${file.replace(SRC + '/', '')}: ${m[0].trim()}`);
    }
  }
  return offenders;
}

describe('LIMINAL contract — breakpoints are derived, not chosen', () => {
  it('gridWide is twelve cells at their floor, plus the eleven gaps', () => {
    expect(BP.gridWide).toBe(12 * LiminalLayoutEngine.CELL_MIN + 11 * S[4]);
  });

  it('gridMid is six cells at their floor, plus the five gaps', () => {
    expect(BP.gridMid).toBe(6 * LiminalLayoutEngine.CELL_MIN + 5 * S[4]);
  });

  it('formRow is two fields plus the gap between them', () => {
    expect(BP.formRow).toBe(2 * LiminalLayoutEngine.FIELD_MIN + S[5]);
  });

  it('shellSidebar is exactly sidebar + gap + one readable column + padding', () => {
    expect(BP.shellSidebar).toBe(
      LiminalLayoutEngine.SIDEBAR_W + S[5] + LiminalLayoutEngine.MEASURE_MIN + 2 * S[5],
    );
  });

  it('at shellSidebar the main column is exactly MEASURE_MIN — not a pixel less', () => {
    // This is the whole point of deriving it: the breakpoint *is* the width at
    // which the main column lands on its floor. If this drifts, the number is
    // no longer a derivation, it is a guess again.
    const usable = BP.shellSidebar - 2 * S[5]; // body padding
    const main = usable - LiminalLayoutEngine.SIDEBAR_W - S[5]; // sidebar + gap
    expect(main).toBe(LiminalLayoutEngine.MEASURE_MIN);
  });

  it('one pixel below shellSidebar the main column falls under its floor', () => {
    const usable = BP.shellSidebar - 1 - 2 * S[5];
    const main = usable - LiminalLayoutEngine.SIDEBAR_W - S[5];
    expect(main).toBeLessThan(LiminalLayoutEngine.MEASURE_MIN);
  });

  it('the breakpoints are strictly ordered, widest to narrowest', () => {
    expect(BP.gridWide).toBeGreaterThan(BP.shellSidebar);
    expect(BP.shellSidebar).toBeGreaterThan(BP.gridMid);
    expect(BP.gridMid).toBeGreaterThan(BP.formRow);
  });

  it('every breakpoint is a whole number of pixels', () => {
    for (const value of Object.values(BP)) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it('the measure floor is a real typographic floor, not a round number', () => {
    // 45 characters at the 16px body size, an Inter character advancing ~0.5em.
    expect(LiminalLayoutEngine.MEASURE_MIN).toBe(45 * 0.5 * LiminalLayoutEngine.TYPE_BASE_REF);
  });
});

describe('LIMINAL contract — no hard-coded breakpoint widths', () => {
  it('every width literal in a media or container query comes from the engine', () => {
    // A literal here is a device category wearing a numeric costume. The six
    // this replaced (600/640/699/768/800/1099) were exactly that.
    expect(literalWidthQueries()).toEqual([]);
  });
});

describe('LIMINAL contract — a breakpoint is a floor, so the rule is strict', () => {
  // The eye test (design-lab/breakpoints-test.html) is what found this.
  //
  // `max-width: 464px` collapses AT 464 — but 464 is the width at which six
  // cells exactly fit, so six columns must survive AT 464 and collapse one
  // pixel below it. Every derived breakpoint was off by one, and nothing
  // failed: the arithmetic was right and only the predicate was wrong. So the
  // arithmetic tests above could never have caught it. These do.

  const emitted = (el: ReactElement) => renderToStaticMarkup(el);

  it('Grid collapses strictly below gridWide and gridMid', () => {
    const html = emitted(createElement(Grid, { children: createElement(GridCol, { col: 3, children: 'x' }) }));
    expect(html).toContain(`@container liminal-grid (width < ${BP.gridWide}px)`);
    expect(html).toContain(`@container liminal-grid (width < ${BP.gridMid}px)`);
  });

  it('FormLayout collapses strictly below formRow', () => {
    const html = emitted(
      createElement(FormLayout, { children: createElement(FormLayout.Row, { cols: 2, children: 'x' }) }),
    );
    expect(html).toContain(`@container liminal-form (width < ${BP.formRow}px)`);
  });

  it('AppShell hides the sidebar strictly below shellSidebar, and the mobile nav at it', () => {
    const html = emitted(createElement(AppShell, { sidebar: 's', mobileNav: 'n', children: 'c' }));
    expect(html).toContain(`@media (width < ${BP.shellSidebar}px)`);
    expect(html).toContain(`@media (width >= ${BP.shellSidebar}px)`);
  });

  it('Sidebar goes full-width strictly below shellSidebar', () => {
    const html = emitted(createElement(Sidebar, { children: 'x' }));
    expect(html).toContain(`@media (width < ${BP.shellSidebar}px)`);
  });

  it('no rule anywhere in src/ is written as max-width or min-width', () => {
    // `max-width: Npx` collapses AT N. Every N in this system is a floor, so
    // that form is always one pixel early. Banning the form bans the class.
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      // COMMENTS ARE NOT CODE.
    //
    // The guard matched its own documentation: a comment explaining that
    // `@media (max-width: 900px)` asks about the viewport contains exactly the
    // pattern this rule looks for, and the file was reported as a violation for
    // describing the thing it avoids. A guard that reads prose lies — and it
    // lies toward "everything is broken", which is how a guard gets ignored.
    const text = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '');
      for (const m of text.matchAll(/@(?:media|container)[^{]*?\b(?:max|min)-width\s*:/g)) {
        offenders.push(`${file.replace(SRC + '/', '')}: ${m[0].trim()}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
