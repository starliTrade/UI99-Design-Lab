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
 * IS IT A CONTROL?
 *
 * `size`, `variant`, `disabled` and `error` are CONTROL criteria. A Popover
 * sized by its content, or a Grid with a `variant`, would be a prop with no
 * meaning — and demanding one would push components to invent it. The role the
 * component declares is the honest discriminator: it says what the thing IS.
 */
const isControl = (src) => /resolveSurface\(\{\s*role:\s*'control'/.test(src);

const rows = files.map((f) => {
  const src = readFileSync(f, 'utf8');
  const name = f.replace(SRC + '/components/', '').replace(/\.tsx$/, '').split('/').pop();
  const has = (re) => re.test(src);
  const control = isControl(src);
  return {
    name,
    path: f.replace(SRC + '/', ''),
    control,
    role: has(/resolveSurface\(\{\s*role/),
    // Not applicable is not the same as missing: a non-control is neither.
    size: !control || has(/\bsize\??:/),
    variant: !control || has(/\bvariant\??:/),
    disabled: !control || has(/\bdisabled\??:/),
    error: !control || has(/\berror\??:/),
    tokens: !has(/['"]#[0-9a-fA-F]{3,8}['"]/) && !has(/rgba?\(/),
    fixture: readFileSync(resolve(SRC, 'components/__matrix__/fixtures.tsx'), 'utf8').includes(`name: '${name}'`),
  };
});

const KEYS = ['role', 'size', 'variant', 'disabled', 'error', 'tokens', 'fixture'];
const CONTROL_KEYS = ['size', 'variant', 'disabled', 'error'];
const score = (r) => KEYS.filter((k) => r[k]).length;

const counts = Object.fromEntries(
  KEYS.map((k) => {
    const scope = CONTROL_KEYS.includes(k) ? rows.filter((r) => r.control) : rows;
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
  for (const k of KEYS) {
    // A control criterion is counted over the controls, not over everything:
    // 49/56 for `size` would read as "49 components have a size" when most of
    // them are containers that correctly have none.
    const scope = CONTROL_KEYS.includes(k) ? rows.filter((r) => r.control) : rows;
    const n = scope.filter((r) => r[k]).length;
    console.log(`  ${w(k, 10)} ${n}/${scope.length}${CONTROL_KEYS.includes(k) ? '  (controls only)' : ''}`);
  }
}
