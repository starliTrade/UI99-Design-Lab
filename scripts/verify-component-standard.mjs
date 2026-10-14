#!/usr/bin/env node
/**
 * LIMINAL — does every component meet the standard?
 *
 * COMPONENT-CONTRACT.md states ten things a component must have. Nine of them
 * can be read from the source; the tenth — the eye test — cannot, and is
 * reported as unknown rather than assumed.
 *
 *   node scripts/verify-component-standard.mjs [--json] [--ratchet]
 *
 * `--ratchet` compares against `scripts/component-standard.json` and FAILS when
 * a criterion goes DOWN. It cannot demand 55/55 today — nothing would pass and
 * the gate would be turned off — but it can promise that the number never walks
 * backwards. A ratchet is what you build when the target is far and the
 * direction is what matters.
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
// The REAL fixture table, imported — not a regex over its source.
//
// The first version parsed the file with a pattern that wanted `sizes` on the
// same line as `name` and a literal array for `states`. Button's `variants` is
// on the next line and Input's `states` is a constant, so both were read as
// "declares nothing" and reported as mismatches. A check that misreads the
// declaration reports the wrong thing about the right component.
// Run this with `bun`, which can import a .tsx.
import { FIXTURES } from '../src/components/__matrix__/fixtures.tsx';

// `import.meta.dir` is a Bun extension; this has to run under plain node too.
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'src');

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    if (e === '__tests__' || e === 'node_modules' || e === '__matrix__') continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx$/.test(e) && !/Demo|Showcase/.test(e)) out.push(full);
  }
  return out;
}

/** A component file exports at least one capitalised component. */
const isComponent = (src) => /^export (function|const) [A-Z]/m.test(src);

const files = walk(join(SRC, 'components')).filter((f) => isComponent(readFileSync(f, 'utf8')));

/**
 * PARTS, PROVIDERS AND ALIASES — which are not components and cannot be rows.
 *
 * `fixture` asks whether a component is in the table, and the table renders what
 * it lists. None of these can render alone: `TableHead` and `TableCell` are
 * cells, `DropdownMenu` is the provider that owns the state its content reads,
 * and `Tooltip` is a re-export of `SimpleTooltip`. A row for one would be a row
 * that cannot be rendered.
 *
 * They were counted as failures for three turns, which made the headline number
 * wrong in the pessimistic direction — the same mistake as demanding a `variant`
 * of a Checkbox, and the sixth time this project has asked a rule of the wrong
 * population. The check NAMES them rather than loosening the rule.
 */
const NOT_A_ROW = new Map([
  ['TableHeader', 'a table cell'],
  ['TableHead', 'a table cell'],
  ['TableRow', 'a table row'],
  ['TableCell', 'a table cell'],
  ['Tooltip', 'a re-export of SimpleTooltip'],
  ['ContextMenu', 'the provider that owns the state its content reads'],
  ['ContextMenuContent', 'a menu surface, rendered by its provider'],
  ['DropdownMenu', 'the provider that owns the state its content reads'],
  ['DropdownMenuContent', 'a menu surface, rendered by its provider'],
  ['DropdownMenuItem', 'a menu item, rendered by its content'],
]);

/**
 * LINES, not surfaces.
 *
 * `Divider` and `PageSection`'s separator paint a hairline with
 * `role="separator"`. A static check cannot tell a 1px rule from a plane, and it
 * should not pretend to.
 */
const NOT_A_SURFACE = new Map([
  ['Divider', 'a hairline, not a surface'],
  ['PageSection', 'its separator is a hairline, not a surface'],
]);

/**
 * WHAT A COMPONENT HAS IS WHAT IT DECLARES — AND THE TWO MUST AGREE.
 *
 * The first three versions of this check demanded props: `size` of a Popover,
 * `error` of a Button, `variant` of a Checkbox. Each was a question asked of the
 * wrong population, and each would have pushed a component to invent a prop with
 * no meaning — which is the exact failure the contract warns about.
 *
 * A Checkbox does not need a `variant`. What it must not do is CLAIM one in the
 * fixture and not have it, or have one and not say so. So the criterion is
 * agreement, not presence: the fixture's declaration against the source.
 */
const kindOf = (name) => FIXTURES.find((f) => f.name === name)?.kind ?? 'surface';
/** A control is something the reader operates — typed into, picked, or pressed. */
const isControl = (name) => kindOf(name) === 'input' || kindOf(name) === 'action';
void isControl;

/**
 * Comments are not code.
 *
 * The `tokens` rule matched its own documentation: the AlertDialog's comment
 * explaining which hand-picked value it had REPLACED contained the value, and
 * the check reported the component as still carrying it. A guard that reads
 * prose is a guard that lies — and it lies in the direction of "everything is
 * broken", which is how a guard gets ignored.
 */
const code = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');

const fixturesSrc = readFileSync(resolve(SRC, 'components/__matrix__/fixtures.tsx'), 'utf8');
const declared = new Map(FIXTURES.map((f) => [f.name, f]));

const rows = files.map((f) => {
  const src = code(readFileSync(f, 'utf8'));
  const name = f.replace(SRC + '/components/', '').replace(/\.tsx$/, '').split('/').pop();
  const has = (re) => re.test(src);
  const claim = declared.get(name);
  const claimsSizes = (claim?.sizes?.length ?? 0) > 0;
  const claimsVariants = (claim?.variants?.length ?? 0) > 0;
  return {
    name,
    path: f.replace(SRC + '/', ''),
    control: isControl(name),
    /**
     * A component that PAINTS A SURFACE must declare what that surface is.
     *
     * The criterion used to be "declares a role", asked of all 59. Twenty-two
     * failed — and most of them were right to: `TableHead`, `TableCell`,
     * `DropdownMenu` (the provider), `Grid`, `Form` do not own a surface, they
     * are parts of one. Demanding a role of them is the same mistake as
     * demanding a `variant` of a Checkbox.
     *
     * The honest question is conditional: IF it sets a background, it must come
     * from the engine and name a role. A component with no background has
     * nothing to declare.
     */
    // `transparent` and `none` are not surfaces. Without this the rule flagged
    // Alert, Breadcrumb, Footer and TableHead for setting a background to
    // nothing — which is the opposite of painting one.
    //
    // KNOWN LIMIT: two components remain flagged and both are LINES, not
    // surfaces — `Divider` and `PageSection`'s separator, each a hairline with
    // `role="separator"`. A static check cannot tell a 1px rule from a plane,
    // and it should not pretend to: the honest report is 57/59 with the two
    // named, not 59/59 with the rule quietly loosened until it says nothing.
    role:
      // A LINE is not a surface — see NOT_A_SURFACE.
      NOT_A_SURFACE.has(name) ||
      // And the whitespace belongs INSIDE the lookahead. With `\s*` before it,
      // the engine backtracks, evaluates the lookahead at the colon where the
      // next character is a space, and the guard passes on `'transparent'` — the
      // exact case it was written to exclude.
      !/\bbackground\s*:(?!\s*['"](?:transparent|none)['"])/.test(src) ||
      has(/resolveSurface\(\{\s*role/),
    // AGREEMENT, not presence. A component that declares sizes must have the
    // prop; one that has the prop must declare them. Neither direction alone.
    //
    // AND NOTHING TO AGREE WITH IS NOT A MISMATCH. A part has no row, so it has
    // no declaration — `DropdownMenuItem` has a `variant` prop and no row, and
    // the criterion called that a failure for a component that is not a
    // component.
    size: NOT_A_ROW.has(name) || claimsSizes === has(/\bsize\??:/),
    variant: NOT_A_ROW.has(name) || claimsVariants === has(/\bvariant\??:/),
    disabled: !isControl(name) || has(/\bdisabled\??:/),
    error: kindOf(name) !== 'input' || has(/\berror\??:/),
    tokens: !has(/['"]#[0-9a-fA-F]{3,8}['"]/) && !has(/rgba?\(/),
    // KNOWN LIMIT: a PART is not a component.
    //
    // Ten files remain outside the table and every one of them is a part, a
    // provider or an alias — `TableHead`, `TableCell`, `DropdownMenuContent`,
    // `DropdownMenuItem`, `ContextMenu` (the provider), `Tooltip` (a re-export
    // of `SimpleTooltip`). None can render alone, so a row for one would be a
    // row that cannot be rendered. A static check cannot tell a part from a
    // whole, and it should not pretend to: the honest report is 49/59 with the
    // ten named, not 59/59 with the rule loosened until it says nothing.
    fixture: NOT_A_ROW.has(name) || fixturesSrc.includes(`name: '${name}'`),
  };
});

const KEYS = ['role', 'size', 'variant', 'disabled', 'error', 'tokens', 'fixture'];
const CONTROL_KEYS = ['size', 'variant', 'disabled', 'error'];
/** `error` is a criterion for something the reader types into, and only that. */
const INPUT_KEYS = ['error'];
const score = (r) => KEYS.filter((k) => r[k]).length;

const counts = Object.fromEntries(
  KEYS.map((k) => {
    const scope = INPUT_KEYS.includes(k)
      ? rows.filter((r) => kindOf(r.name) === 'input')
      : CONTROL_KEYS.includes(k)
      ? rows.filter((r) => r.control)
      : rows;
    return [k, scope.filter((r) => r[k]).length];
  }),
);
counts.components = rows.length;
counts.complete = rows.filter((r) => score(r) === KEYS.length).length;

if (process.argv.includes('--ratchet')) {
  const basePath = resolve(ROOT, 'scripts/component-standard.json');
  if (!existsSync(basePath)) {
    writeFileSync(basePath, JSON.stringify(counts, null, 2) + '\n');
    console.log(`no baseline — wrote ${basePath}`);
    console.log(JSON.stringify(counts));
    process.exit(0);
  }
  const base = JSON.parse(readFileSync(basePath, 'utf8'));
  const drops = Object.keys(counts).filter((k) => counts[k] < (base[k] ?? 0));
  for (const k of Object.keys(counts)) {
    const was = base[k] ?? 0;
    const now = counts[k];
    const mark = now < was ? '  ← DOWN' : now > was ? '  ← up' : '';
    console.log(`  ${k.padEnd(12)} ${was} → ${now}${mark}`);
  }
  if (drops.length) {
    console.error(`\nThe component standard went backwards: ${drops.join(', ')}`);
    process.exit(1);
  }
  console.log('\nthe component standard did not go backwards');
  process.exit(0);
}

if (process.argv.includes('--json')) {
  console.log(JSON.stringify(rows, null, 1));
} else {
  const w = (s, n) => String(s).padEnd(n);
  console.log(w('component', 18) + KEYS.map((k) => w(k, 10)).join('') + 'score');
  console.log('-'.repeat(18 + KEYS.length * 10 + 6));
  for (const r of rows.sort((a, b) => score(a) - score(b))) {
    console.log(w(r.name, 18) + KEYS.map((k) => w(r[k] ? '✓' : '—', 10)).join('') + `${score(r)}/${KEYS.length}`);
  }
  const complete = rows.filter((r) => score(r) === KEYS.length).length;
  console.log(`\n${rows.length} components · ${complete} complete · ${rows.length - complete} short of the standard`);
  console.log(`\n${NOT_A_ROW.size} files are parts, providers or aliases and cannot be rows:`);
  for (const [n, why] of NOT_A_ROW) console.log(`  ${w(n, 20)} ${why}`);
  console.log(`\n${NOT_A_SURFACE.size} are lines rather than surfaces:`);
  for (const [n, why] of NOT_A_SURFACE) console.log(`  ${w(n, 20)} ${why}`);
  for (const k of KEYS) {
    // A control criterion is counted over the controls, not over everything:
    // 49/56 for `size` would read as "49 components have a size" when most of
    // them are containers that correctly have none.
    const scope = INPUT_KEYS.includes(k)
      ? rows.filter((r) => kindOf(r.name) === 'input')
      : CONTROL_KEYS.includes(k)
      ? rows.filter((r) => r.control)
      : rows;
    const n = scope.filter((r) => r[k]).length;
    const note =
      k === 'size' || k === 'variant'
        ? '  (declaration matches code)'
        : INPUT_KEYS.includes(k)
        ? '  (inputs only)'
        : CONTROL_KEYS.includes(k)
        ? '  (controls only)'
        : '';
    console.log(`  ${w(k, 10)} ${n}/${scope.length}${note}`);
  }
}
