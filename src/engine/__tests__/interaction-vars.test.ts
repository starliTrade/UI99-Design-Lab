import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

// vitest runs from the project root, so this is stable.
const SRC = resolve(process.cwd(), 'src');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === '__tests__' || entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

/**
 * Every component file — and NOT the page that renders them.
 *
 * The list used to end with `join(SRC, 'App.tsx')`, "the demo page that renders
 * them". That page is gone: the studio replaced it, and the studio is a
 * consumer of the components rather than one of them. The rule below is about
 * the population that PUBLISHES the six variables, and that population is
 * `src/components` — a page that renders a component inherits its variables and
 * never assembles one.
 */
const COMPONENT_FILES = walk(join(SRC, 'components'));

/**
 * THE SIX VARIABLES HAVE ONE PRODUCER, AND THIS KEEPS IT THAT WAY.
 *
 * Until `resolveInteractionVars` existed, every component assembled the six
 * variables by hand — 15 components, 17 sites, often by calling
 * `resolveSurface` two or three times in a row. That was not only repetition:
 *
 *   a component can publish a HOVER value and forget the IDLE one
 *   a component can set `background` inline beside them and cancel the rule
 *   a component can opt into the layer and publish nothing at all
 *
 * All three happened in this codebase. The producer removes the class; these
 * two assertions are the guard, so the class cannot come back one component at
 * a time. A guard is worth more than the fix: a fix is done once, a guard holds.
 */
describe('the interaction variables have ONE producer', () => {
  // A quoted property key, so a comment that NAMES a variable is not a match.
  const KEY = /['"]--liminal-(?:surface|border)-(?:idle|hover|active|focus)['"]/;

  it('no component names the six variables itself', () => {
    const offenders: string[] = [];
    for (const file of COMPONENT_FILES) {
      if (KEY.test(readFileSync(file, 'utf8'))) offenders.push(file.replace(SRC + '/', ''));
    }
    expect(offenders, 'hand-assembled interaction variables').toEqual([]);
  });

  // Both opt-ins read the six: `surface` reads idle/hover/active, `focus-within`
  // reads focus and the focus border. A component that opts into either and
  // publishes nothing gets `transparent` — the state it asked for, silently dead.
  for (const attr of ['data-liminal-surface', 'data-liminal-focus-within']) {
    it(`no component opts into ${attr} without publishing them`, () => {
      const optIn: string[] = [];
      const offenders: string[] = [];
      for (const file of COMPONENT_FILES) {
        const text = readFileSync(file, 'utf8');
        if (!text.includes(attr)) continue;
        optIn.push(file.replace(SRC + '/', ''));
        if (!text.includes('resolveInteractionVars')) offenders.push(file.replace(SRC + '/', ''));
      }
      // A guard that passes because it found nothing is not a guard.
      expect(optIn.length, `components opting into ${attr}`).toBeGreaterThan(0);
      expect(offenders, `opted into ${attr} with no producer`).toEqual([]);
    });
  }

  /**
   * AND THE OTHER DIRECTION, which was unguarded and cost two components.
   *
   * The guard above catches a component that opts in without publishing. The
   * reverse is just as broken and harder to see: a component that PUBLISHES and
   * never opts in leaves a variable nothing reads. The element renders with no
   * background at all — not a wrong colour, no colour — and it looks like the
   * component failed to load.
   *
   * The Slider's track and the FileUpload's drop zone both shipped that way.
   * Every unit test passed; the eye test caught both.
   *
   * The check is coarse on purpose: it asks whether the file contains the
   * opt-in ANYWHERE, because a component may publish for a child it renders.
   * Coarse and true beats precise and silent.
   */
  it('no component publishes the variables without opting in somewhere', () => {
    const offenders: string[] = [];
    let publishers = 0;
    for (const file of COMPONENT_FILES) {
      const text = readFileSync(file, 'utf8');
      if (!text.includes('resolveInteractionVars')) continue;
      publishers++;
      if (!text.includes('data-liminal-surface')) offenders.push(file.replace(SRC + '/', ''));
    }
    expect(publishers, 'components publishing the variables').toBeGreaterThan(0);
    expect(offenders, 'published the variables and never opted in — a variable nothing reads').toEqual([]);
  });
});
