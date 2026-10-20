import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pick, inlineStart, inlineEnd } from '../liminal-direction';

const SRC = resolve(process.cwd(), 'src/components');

const walk = (dir: string): string[] => {
  const out: string[] = [];
  for (const e of readdirSync(dir)) {
    if (e === '__tests__' || e === 'node_modules') continue;
    const full = resolve(dir, e);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.tsx$/.test(e) && !/Demo\.tsx$/.test(e)) out.push(full);
  }
  return out;
};

/**
 * The system was written left-to-right by accident, not by decision: 39
 * physical properties and ZERO logical ones. Every one of them is a place where
 * the layout silently mirrors wrong.
 *
 * `dir` on the document tells the browser the base direction; logical
 * properties are what make `start` and `end` mean what they say. Setting only
 * one of the two produces a layout that is half-mirrored, which is worse than
 * one that is not mirrored at all.
 */
describe('direction — the components are written along an axis, not a side', () => {
  const PHYSICAL = [
    'marginLeft', 'marginRight', 'paddingLeft', 'paddingRight',
    'borderLeft', 'borderRight',
  ];

  it('no component sets a physical margin, padding or border', () => {
    // SimpleTooltip is the one exception and it is named below, not skipped
    // silently here.
    const EXCEPT = 'feedback/Tooltip/SimpleTooltip.tsx';
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      const rel = file.replace(SRC + '/', '');
      if (rel === EXCEPT) continue;
      const text = readFileSync(file, 'utf8');
      for (const prop of PHYSICAL) {
        if (new RegExp(`(^|[^-\\w])${prop}\\s*:`).test(text)) offenders.push(`${rel}: ${prop}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('no component aligns text to a side', () => {
    // `textAlign: 'left'` means "the side the text starts on" in every case it
    // appeared here. `'start'` says that; `'left'` does not.
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      const text = readFileSync(file, 'utf8');
      if (/textAlign:\s*'(left|right)'/.test(text)) offenders.push(file.replace(SRC + '/', ''));
    }
    expect(offenders).toEqual([]);
  });

  it('the four remaining physical borders are the rotated tooltip arrow', () => {
    // A rotated square's two visible edges are physical by necessity: the arrow
    // points up, down, left or right relative to the tooltip, and those are
    // physical placements. Named here so the exception is deliberate.
    //
    // ZERO ABSOLUTE: the Tooltip itself was archived with the other components
    // (2026-10-20). The exception is checked only while the file exists — when
    // the Tooltip is reborn, this re-arms without anyone remembering it.
    const path = resolve(SRC, 'feedback/Tooltip/SimpleTooltip.tsx');
    if (!existsSync(path)) return;
    const tooltip = readFileSync(path, 'utf8');
    expect((tooltip.match(/border(Left|Right):/g) ?? []).length).toBe(4);
  });
});

describe('direction — the helpers', () => {
  it('pick resolves by direction', () => {
    expect(pick('ltr', 'a', 'b')).toBe('a');
    expect(pick('rtl', 'a', 'b')).toBe('b');
  });

  it('inlineStart is the side a line begins on', () => {
    expect(inlineStart('ltr')).toBe('left');
    expect(inlineStart('rtl')).toBe('right');
    expect(inlineEnd('ltr')).toBe('right');
    expect(inlineEnd('rtl')).toBe('left');
  });
});
