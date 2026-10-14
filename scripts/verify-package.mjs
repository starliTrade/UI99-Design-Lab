#!/usr/bin/env node
/**
 * LIMINAL — is the package a package?
 *
 * A library build can succeed and still ship something nobody can use: a missing
 * entry, a `types` path that points at nothing, a CSS file no export names, a
 * bundle that quietly bundled React. Every one of those is invisible until a
 * consumer tries, and the consumer is not here.
 *
 *   node scripts/verify-package.mjs
 */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));
const problems = [];
const notes = [];

const at = (p) => resolve(ROOT, p.replace(/^\.\//, ''));
const size = (p) => (existsSync(at(p)) ? statSync(at(p)).size : 0);
const kb = (n) => `${(n / 1024).toFixed(1)} kB`;

// ── every path the manifest promises must exist ───────────────────────────
for (const [key, value] of Object.entries(pkg.exports ?? {})) {
  const paths = typeof value === 'string' ? [value] : Object.values(value);
  for (const p of paths) {
    if (p === './package.json') continue;
    if (!existsSync(at(p))) problems.push(`exports["${key}"] points at ${p}, which does not exist`);
  }
}
if (!pkg.types || !existsSync(at(pkg.types))) problems.push(`types points at ${pkg.types}, which does not exist`);

// ── React must NOT be bundled ─────────────────────────────────────────────
const esm = existsSync(at('./dist-lib/liminal.js')) ? readFileSync(at('./dist-lib/liminal.js'), 'utf8') : '';
if (/function createElement|react\.createElement|__SECRET_INTERNALS/.test(esm)) {
  problems.push('React appears to be bundled — a library that ships its own React breaks the consumer’s hooks');
}
if (!pkg.peerDependencies?.react) problems.push('react is not a peer dependency');
if (!pkg.peerDependencies?.['react-dom']) problems.push('react-dom is not a peer dependency');

// ── the stylesheet must be reachable ──────────────────────────────────────
if (!pkg.exports?.['./styles.css']) problems.push('the stylesheet has no export, so a consumer cannot import it');
if (!pkg.sideEffects?.some((s) => s.includes('css'))) {
  problems.push('sideEffects does not list CSS — a bundler will tree-shake the styles away');
}

// ── and the numbers, which the project has never had ──────────────────────
const esmSize = size('./dist-lib/liminal.js');
const cjsSize = size('./dist-lib/liminal.cjs');
const cssSize = size('./dist-lib/liminal.css');
if (!esmSize) problems.push('no ESM bundle');
if (!cjsSize) problems.push('no CJS bundle');
notes.push(`esm  ${kb(esmSize)}`);
notes.push(`cjs  ${kb(cjsSize)}`);
notes.push(`css  ${kb(cssSize)}`);

const declarations = existsSync(at('./dist-lib')) ? readdirSync(at('./dist-lib')).filter((f) => f.endsWith('.d.ts')).length : 0;
if (!declarations) problems.push('no .d.ts emitted — a consumer gets no types');
notes.push(`declarations  ${declarations} files`);

// ── it stays private until someone asks for it ────────────────────────────
if (pkg.private !== true) notes.push('private is NOT true — this package would publish');

console.log(notes.join('\n'));
if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log('\nthe package is coherent');
