import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

const SRC = resolve(process.cwd(), 'src');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '__tests__') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

/** Comments explain the rule; they are not the rule. */
function code(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

const FILES = walk(SRC);

/**
 * A COMPONENT DECLARES WHAT IT IS, NOT WHICH STEP IT WANTS.
 *
 * The governing principle: values become tokens, **selections become names**,
 * raw numbers are forbidden. Nineteen sites broke it — `getDirectionalRim(2, 2,
 * false)` written out by hand, `LADDER[3]` as a border colour — and the worst of
 * them was a pair repeated SEVEN times: `(2, 2)`, the fill an unselected control
 * rests in. The engine had no name for it, so seven components each invented it.
 *
 * It has a name now: the `well` role. And a concave well is `inset: true`, which
 * is the rule `resolveInset` already stated — one and a half steps below the
 * role it is cut into.
 *
 * The `LADDER[n]` ban is scoped to components: the engine itself legitimately
 * indexes the ladder (`LADDER[0]` is the canvas, `LADDER.length - 1` the
 * ceiling), and a rule that forbade that would forbid arithmetic.
 */
describe('a component declares a role, not a number', () => {
  it('no component calls getDirectionalRim with literal arguments', () => {
    const offenders: string[] = [];
    for (const f of walk(join(SRC, 'components'))) {
      for (const m of code(f).matchAll(/getDirectionalRim\(\s*[-\d.]/g)) {
        offenders.push(`${f.replace(SRC + '/', '')}: ${m[0]}`);
      }
    }
    expect(offenders, 'a hand-picked (level, rim) pair').toEqual([]);
  });

  it('no component indexes the ladder directly', () => {
    const offenders: string[] = [];
    for (const f of walk(join(SRC, 'components'))) {
      for (const m of code(f).matchAll(/LADDER\[\s*\d/g)) {
        offenders.push(`${f.replace(SRC + '/', '')}: ${m[0]}`);
      }
    }
    expect(offenders, 'a raw ladder index').toEqual([]);
  });

  it('the guard is looking at real files, so it cannot pass by finding nothing', () => {
    const components = walk(join(SRC, 'components'));
    expect(components.length).toBeGreaterThan(40);
    // The engine still indexes the ladder, and that is allowed. If this ever
    // stops being true the ban above has quietly become a ban on arithmetic.
    const engineUses = walk(join(SRC, 'engine')).filter((f) => /LADDER\[\s*\d/.test(code(f)));
    expect(engineUses.length).toBeGreaterThan(0);
  });
});
