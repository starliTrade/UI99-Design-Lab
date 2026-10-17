#!/usr/bin/env bun
/**
 * LIMINAL — the API table, read from the types.
 *
 * Every component library eventually documents its props, and the ones that do
 * it by hand have a documentation bug on the day a prop changes. This reads the
 * `…Props` interface the component is already written in — its members, their
 * types, whether they are optional, and the JSDoc above each one, which in this
 * repo is where the REASON lives rather than the description.
 *
 * NOT the TypeScript compiler API. This repo is on TypeScript 7, which is the
 * native port: `ts.createProgram` does not exist and neither does
 * `isInterfaceDeclaration`. The JS package exports a version number and little
 * else. So this is a small reader over a shape this project controls — and
 * `api.test.ts` guards it, because a light parser without a guard is a parser
 * that lies.
 *
 *   bun scripts/gen-api.ts
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'src');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    if (e === '__tests__' || e === '__matrix__' || e === 'node_modules') continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx$/.test(e) && !/Demo|Showcase/.test(e)) out.push(full);
  }
  return out;
}

interface Prop {
  name: string;
  type: string;
  required: boolean;
  doc?: string;
  /**
   * The default, read from the DESTRUCTURING rather than from the type.
   *
   * A default is not part of a TypeScript interface — `size?: 'sm' | 'md'` says
   * nothing about which one you get. It lives in the function signature, and a
   * props table without it is a table that makes the reader open the source to
   * answer the first question they had.
   */
  default?: string;
}
interface Entry {
  component: string;
  path: string;
  /**
   * The one-line summary, read from the file's own header comment.
   *
   * A component page opens with a sentence — shadcn's does, and a page that
   * opens with a table of numbers makes the reader work out what the thing is.
   * It is read rather than written here for the same reason the props are: a
   * hand-written summary is wrong on the day the component changes.
   */
  description?: string;
  extends?: string;
  props: Prop[];
}

/**
 * The defaults, read from the component's own destructuring.
 *
 * `function Button({ size = 'md', variant = 'primary', ...rest })` — the pattern
 * is regular enough to read, and the guard asserts it found some.
 */
function defaultsIn(source: string): Map<string, string> {
  const out = new Map<string, string>();
  // LINE BY LINE, because a destructuring entry is a line: `  size = 'md',`.
  //
  // Two earlier attempts looked for a block or a function signature and found
  // nothing in this repo — most components are built through a factory, so there
  // is no `function Name({…})` to match. The entry itself is the reliable shape,
  // and the guard asserts that some were found.
  for (const line of source.split('\n')) {
    const m = line.match(/^\s{4,}([\w$]+)\s*=\s*(.+?),?\s*$/);
    if (!m) continue;
    const name = m[1];
    const value = m[2].trim().replace(/,$/, '');
    // A destructuring default is a literal or a simple expression. A statement
    // like `const x = foo()` is not a prop default, and the indentation plus the
    // trailing comma is what tells them apart.
    if (!/,\s*$/.test(line)) continue;
    if (/^(const|let|var|return|if|else|for|while|import|export)\b/.test(value)) continue;
    if (!out.has(name)) out.set(name, value);
  }
  return out;
}

/**
 * The file's opening sentence.
 *
 * The header comment is `LIMINAL · NAME` followed by a blank line and then the
 * summary — so the summary is the first paragraph that is prose rather than a
 * label. Anything before it is the title line, and the rule lists below it are
 * not a description.
 */
function summaryOf(source: string, component: string): string | undefined {
  const head = source.slice(0, source.indexOf('*/'));
  const lines = head
    .split('\n')
    .map((l) => l.replace(/^\s*\/?\*+\/?/, '').trim());
  // `LIMINAL · NAME` in most files, `NAME · something` in the older ones. Both
  // are the title line; the summary is what follows it.
  const start = lines.findIndex((l) => /^(LIMINAL|[A-Z][A-Za-z0-9]*)\s*·/.test(l));
  if (start < 0) return undefined;
  const prose: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (!l) {
      if (prose.length) break;
      continue;
    }
    // A rule line, a bullet, or a label is not prose.
    if (/^[─—=-]{2,}/.test(l) || /^[-*•]/.test(l) || /^[A-Z][A-Z\s·]+$/.test(l)) {
      if (prose.length) break;
      continue;
    }
    prose.push(l);
  }
  const text = prose.join(' ').replace(/\s+/g, ' ').trim();
  return text || undefined;
}

/** The JSDoc block immediately above a line, as plain text. */
function docAbove(lines: string[], index: number): string | undefined {
  let i = index - 1;
  while (i >= 0 && lines[i].trim() === '') i--;
  if (i < 0 || !lines[i].trim().endsWith('*/')) return undefined;
  const end = i;
  while (i >= 0 && !lines[i].trim().startsWith('/**')) i--;
  if (i < 0) return undefined;
  const body = lines
    .slice(i, end + 1)
    .map((l) => l.replace(/^\s*\/?\*+\/?/, '').trim())
    .filter(Boolean)
    // `@deprecated` KEEPS its text: the note after it is the reason, and it is
    // the one tag a consumer needs to read. The others are stripped.
    .map((l) => (l.startsWith('@deprecated') ? l.replace(/^@deprecated\s*/, 'Deprecated: ') : l))
    .filter((l) => !/^@/.test(l))
    .join(' ')
    .replace(/\s+/g, ' ')
    // A one-line JSDoc is both its own start and its own end, so the closing
    // `*/` survives the per-line strip and lands in the text.
    .replace(/\s*\*\/\s*$/, '')
    .trim();
  return body || undefined;
}

const entries: Entry[] = [];

for (const file of walk(join(SRC, 'components'))) {
  const source = readFileSync(file, 'utf8');
  const lines = source.split('\n');
  const defaults = defaultsIn(source);

  for (let i = 0; i < lines.length; i++) {
    // The declaration may WRAP. `ButtonProps` is
    //   `export interface ButtonProps\n  extends Omit<…>,\n    VariantProps<…> {`
    // and a pattern that wants the brace on the same line silently skipped it —
    // which the guard caught, and which is the whole reason the guard exists.
    const head = lines[i].match(/^export interface (\w+)Props\b/);
    if (!head) continue;
    let braceLine = i;
    while (braceLine < lines.length && !/\{/.test(lines[braceLine])) braceLine++;
    if (braceLine >= lines.length) continue;
    const component = head[1];
    const heritage = lines
      .slice(i, braceLine + 1)
      .join(' ')
      .replace(/^export interface \w+Props\b/, '')
      .replace(/extends/, '')
      .replace(/\{[\s\S]*$/, '')
      .replace(/\s+/g, ' ')
      .trim() || undefined;
    i = braceLine;

    const props: Prop[] = [];
    // Members until the interface closes at column 0.
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j];
      if (/^\}/.test(line)) break;
      // A member: `name?: Type;` — the type may wrap onto following lines.
      const m = line.match(/^\s{2}(?:readonly\s+)?(['"]?[\w-]+['"]?)(\?)?:\s*(.*)$/);
      if (!m) continue;
      let type = m[3].trim();
      // A wrapped type ends at the first line that closes it.
      let k = j;
      while (!/[;,]$/.test(type) && k + 1 < lines.length) {
        k++;
        type += ' ' + lines[k].trim();
      }
      const propName = m[1].replace(/['"]/g, '');
      props.push({
        name: propName,
        type: type.replace(/[;,]\s*$/, '').replace(/\s+/g, ' ').trim(),
        required: !m[2],
        doc: docAbove(lines, j),
        default: defaults.get(propName),
      });
    }

    entries.push({
      component,
      path: relative(SRC, file).replace(/\\/g, '/'),
      description: summaryOf(source, component),
      extends: heritage,
      props,
    });
  }
}

entries.sort((a, b) => a.component.localeCompare(b.component));
const dest = resolve(SRC, 'site/api.json');
writeFileSync(dest, JSON.stringify(entries, null, 2) + '\n');
const total = entries.reduce((n, e) => n + e.props.length, 0);
const documented = entries.filter((e) => e.props.some((p) => p.doc)).length;
const withDefault = entries.reduce((n, e) => n + e.props.filter((p) => p.default).length, 0);
console.log(`wrote ${dest}`);
console.log(`${entries.length} components · ${total} props · ${documented} with a reason · ${withDefault} with a default`);
