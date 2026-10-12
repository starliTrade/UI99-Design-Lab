import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { LiminalLayoutEngine } from '../liminal-layout-engine';

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
