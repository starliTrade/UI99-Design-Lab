/**
 * Writes the generated token block into src/index.css.
 *
 * The engine is the source of truth; index.css is a build artifact for the
 * `:root` and `.dark` scopes. Everything outside the generated markers is
 * preserved, so hand-written rules (keyframes, base styles, scrollbars) survive.
 *
 * Run: bun run gen:css
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  generateCssVars,
  generateDarkScope,
  CSS_VARS_START,
  CSS_VARS_END,
} from '../src/engine/liminal-css-vars';

const CSS_PATH = resolve(import.meta.dir, '../src/index.css');

const generated = [
  CSS_VARS_START,
  '/* Generated from src/engine/liminal-css-vars.ts — do not edit by hand.',
  '   Regenerate with `bun run gen:css`. A test asserts this block matches. */',
  '',
  generateCssVars().trimEnd(),
  '',
  '/* The system is dark-only today; this scope exists so a theme can be swapped. */',
  generateDarkScope().trimEnd(),
  CSS_VARS_END,
].join('\n');

const css = readFileSync(CSS_PATH, 'utf8');
const startIdx = css.indexOf(CSS_VARS_START);
const endIdx = css.indexOf(CSS_VARS_END);

let next: string;
if (startIdx !== -1 && endIdx !== -1) {
  next = css.slice(0, startIdx) + generated + css.slice(endIdx + CSS_VARS_END.length);
} else {
  // First run: replace the existing hand-written :root/.dark blocks.
  const stripped = css
    .replace(/:root\s*\{[\s\S]*?\n\}\n/, '')
    .replace(/\.dark\s*\{[\s\S]*?\n\}\n/, '');
  next = `${generated}\n${stripped.replace(/^\s*\n/, '')}`;
}

writeFileSync(CSS_PATH, next, 'utf8');

const varCount = (generated.match(/--liminal-/g) || []).length;
console.log(`index.css written — ${varCount} variable declarations (root + dark scope)`);
