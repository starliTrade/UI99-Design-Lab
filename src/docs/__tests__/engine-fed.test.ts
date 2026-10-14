import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';

/**
 * THE APP IS HELD TO THE SAME RULE AS THE COMPONENTS.
 *
 * The components have been under `no-raw-numbers` since the beginning and the
 * app was not, and the difference showed: the app had TWENTY-SEVEN raw values,
 * including a hard-coded `900px` breakpoint — while the engine's own comment
 * says the six numbers it replaced were "device categories wearing numeric
 * costumes".
 *
 * A docs site that hand-picks its own spacing is a docs site that can drift from
 * the thing it documents. This is the guard that stops it, and it is the answer
 * to "is everything fed by the engine": not a claim, a test.
 */
const SRC = resolve(process.cwd(), 'src');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    if (e === '__tests__' || e === 'node_modules') continue;
    const full = join(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx?$/.test(e)) out.push(full);
  }
  return out;
}

const APP = [...walk(join(SRC, 'docs')), ...walk(join(SRC, 'studio'))];

/** Comments are not code — the same lesson the other guards learned. */
function code(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/[^\n]*/g, '');
}

const STYLE_KEYS =
  'fontSize|lineHeight|letterSpacing|gap|rowGap|columnGap|padding|paddingInline|paddingBlock|paddingTop|paddingBottom|paddingInlineStart|paddingInlineEnd|margin|marginInline|marginBlock|marginTop|marginBottom|marginInlineStart|marginInlineEnd|width|height|minWidth|maxWidth|minHeight|maxHeight|borderRadius|borderWidth|top|bottom|insetInlineStart|insetInlineEnd';

describe('the app is fed by the engine', () => {
  it('has no raw pixel value in a style property', () => {
    const offenders: string[] = [];
    for (const file of APP) {
      const text = code(file);
      for (const m of text.matchAll(new RegExp(`\\b(?:${STYLE_KEYS})\\s*:\\s*[^,;\\n]*?(\\d+(?:\\.\\d+)?)(?:px|rem|em)\\b`, 'g'))) {
        offenders.push(`${file.replace(SRC + '/', '')}: ${m[0].slice(0, 60)}`);
      }
    }
    expect(offenders, 'a hand-picked size in the app').toEqual([]);
  });

  it('has no raw colour', () => {
    const offenders: string[] = [];
    for (const file of APP) {
      const text = code(file);
      for (const m of text.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g)) {
        offenders.push(`${file.replace(SRC + '/', '')}: ${m[0]}`);
      }
    }
    expect(offenders, 'a hand-picked colour in the app').toEqual([]);
  });

  it('takes its breakpoints from the engine', () => {
    // The hole this guard was written for. `useMediaQuery('(max-width: 900px)')`
    // is a breakpoint, and the breakpoint guard only looked for `@media` — so a
    // device category survived in the app while the engine's own comment said
    // those were the thing it removed.
    const offenders: string[] = [];
    for (const file of APP) {
      const text = code(file);
      for (const m of text.matchAll(/useMediaQuery\(\s*[`'"]([^`'"]+)[`'"]/g)) {
        if (/\d+\s*px/.test(m[1])) offenders.push(`${file.replace(SRC + '/', '')}: ${m[1]}`);
      }
    }
    expect(offenders, 'a breakpoint that is not the engine\'s').toEqual([]);
  });

  it('is looking at real files, so it cannot pass by finding nothing', () => {
    expect(APP.length).toBeGreaterThan(8);
    const usesEngine = APP.filter((f) => /LiminalLayoutEngine|resolveSurface|getTextStyle/.test(readFileSync(f, 'utf8')));
    expect(usesEngine.length, 'files that read the engine').toBeGreaterThan(6);
  });
});
