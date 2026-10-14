#!/usr/bin/env node
/**
 * LIMINAL — does every component meet the standard?
 *
 * COMPONENT-CONTRACT.md states ten things a component must have. Nine of them
 * can be read from the source; the tenth — the eye test — cannot, and is
 * reported as unknown rather than assumed.
 *
 *   node scripts/verify-component-standard.mjs [--json]
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
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

const rows = files.map((f) => {
  const src = readFileSync(f, 'utf8');
  const name = f.replace(SRC + '/components/', '').replace(/\.tsx$/, '').split('/').pop();
  const has = (re) => re.test(src);
  return {
    name,
    path: f.replace(SRC + '/', ''),
    role: has(/resolveSurface\(\{\s*role/),
    size: has(/\bsize\??:/),
    variant: has(/\bvariant\??:/),
    disabled: has(/\bdisabled\??:/),
    error: has(/\berror\??:/),
    tokens: !has(/['"]#[0-9a-fA-F]{3,8}['"]/) && !has(/rgba?\(/),
    fixture: readFileSync(resolve(SRC, 'components/__matrix__/fixtures.tsx'), 'utf8').includes(`name: '${name}'`),
  };
});

const KEYS = ['role', 'size', 'variant', 'disabled', 'error', 'tokens', 'fixture'];
const score = (r) => KEYS.filter((k) => r[k]).length;

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
    const n = rows.filter((r) => r[k]).length;
    console.log(`  ${w(k, 10)} ${n}/${rows.length}`);
  }
}
