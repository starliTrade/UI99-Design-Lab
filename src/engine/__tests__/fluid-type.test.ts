import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { LiminalLayoutEngine } from '../liminal-layout-engine';

/** The layout engine, short — this file's own name for it. */
const L = LiminalLayoutEngine;

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
 * Step 2.2 built the fluid type scale: a ratio fixed at 1.2, a base that is a
 * reading condition (14px at 320, 16.5px at 1440), and every level derived from
 * it. The engine was right.
 *
 * The components were not connected to it. 87 call sites still read
 * `TYPOGRAPHY[n].fs` — the STATIC reference value — so the scale was published,
 * documented and never used. Measured before the fix: a Button label was 11px
 * at every viewport. After: 9.72px at 320, 11.46px at 1440.
 */
describe('fluid type — components read the scale, not a static reference', () => {
  it('no component takes its font-size from TYPOGRAPHY[n].fs', () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      const text = readFileSync(file, 'utf8');
      if (/fontSize:\s*`?\$\{?[A-Za-z.]*TYPOGRAPHY\[\d+\]\.fs/.test(text)) {
        offenders.push(file.replace(SRC + '/', ''));
      }
    }
    expect(offenders).toEqual([]);
  });

  it('every level resolves through the fluid base, not a literal', () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const css = LiminalLayoutEngine.getTypeSizeCss(n);
      expect(css, `level ${n}`).toContain('--liminal-type-base');
    }
  });

  it('the base is in rem, so it honours the reader’s font-size setting', () => {
    expect(LiminalLayoutEngine.TYPE_BASE_CSS).toContain('rem');
    expect(LiminalLayoutEngine.TYPE_BASE_CSS).not.toMatch(/\dpx/);
  });

  it('the scale is monotonic at the reference base', () => {
    const sizes = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => LiminalLayoutEngine.TYPOGRAPHY[n].fs);
    for (let i = 1; i < sizes.length; i++) expect(sizes[i]).toBeGreaterThan(sizes[i - 1]);
  });
});

/**
 * THE LINE-HEIGHT IS DERIVED — one spacing step of leading, not a ratio anyone chose.
 *
 * It was a hand-picked table — 1.45, 1.5, 1.6, 1.35, 1.25, 1.2, 1.15, 1.1 — and it ran BACKWARDS
 * for the first three levels: the third smallest size was the loosest of all. The standard is an
 * inverse relationship, so the leading ratio shrinks as the text grows.
 *
 * `1 + 8/fs` is `(fs + 8) / fs`: the line box is the font size plus ONE SPACING STEP, and 8px is
 * `SPACING[2]`. So the leading is a step of the scale the rest of the system is built on.
 */
describe('line-height — one spacing step of leading', () => {
  const RATIO = 1.2, BASE = 16;

  it('is the font size plus one spacing step, over the font size', () => {
    for (let n = 1; n <= 10; n++) {
      const size = BASE * Math.pow(RATIO, n);
      expect(L.TYPOGRAPHY[n].lh, `level ${n}`).toBeCloseTo(1 + L.SPACING[2] / size, 4);
    }
  });

  it('DECREASES as the text grows — the standard is an inverse relationship', () => {
    for (let n = 2; n <= 10; n++) {
      expect(L.TYPOGRAPHY[n].lh, `level ${n} is not tighter than ${n - 1}`)
        .toBeLessThan(L.TYPOGRAPHY[n - 1].lh);
    }
  });

  it('and the old table ran backwards, which is what this replaced', () => {
    // 1.45 -> 1.5 -> 1.6: the third smallest size was the loosest of all.
    const old = { 1: 1.45, 2: 1.5, 3: 1.6 };
    expect(old[3], 'the old table rose').toBeGreaterThan(old[1]);
    expect(L.TYPOGRAPHY[3].lh, 'the formula falls').toBeLessThan(L.TYPOGRAPHY[1].lh);
  });

  it('and it is rounded to four decimals, because sixteen is not a line-height', () => {
    for (const t of Object.values(L.TYPOGRAPHY)) {
      expect(String(t.lh).split('.')[1]?.length ?? 0, `${t.lh} has too many decimals`).toBeLessThanOrEqual(4);
    }
  });
});
