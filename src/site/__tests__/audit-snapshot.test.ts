import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildAuditSnapshotHtml } from '../generate-audit-snapshot';

/**
 * THE SNAPSHOT IS A BUILD ARTIFACT WITH A GUARD.
 *
 * Writing a file from a test is deliberate: the snapshot has to stay in sync
 * with the engine, and the only moment anyone can guarantee that is when the
 * suite runs. Every `vitest run` regenerates `.lab/audit-lab-snapshot.html`
 * from the live engine — so the file a reader opens on their phone can never
 * describe an engine that no longer exists.
 *
 * The assertions are the guard: if the generator starts emitting an empty
 * section, a dead var() or a missing verdict, this fails instead of silently
 * shipping a blank page.
 */
describe('audit snapshot — self-contained HTML from the real engine', () => {
  const html = buildAuditSnapshotHtml();

  it('is a complete RTL document with the engine tokens embedded', () => {
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('dir="rtl"');
    // The CSS variables are inlined so every var(--liminal-…) the engine emits
    // resolves WITHOUT index.css or a server.
    expect(html).toContain(':root {');
    expect(html).toContain('--liminal-s0:');
    expect(html).toContain('--liminal-palette-ruby-7:');
    expect(html).toContain('.dark {');
  });

  it('carries all nine sections and the verdict counters', () => {
    for (const title of ['بوم و چاه‌ها', 'نردبان', 'تو در تویی', 'بوردر', 'سایه', 'ریم', 'پالت', 'تایپوگرافی', 'جمع‌بندی']) {
      expect(html, `section missing: ${title}`).toContain(title);
    }
    expect(html).toContain('✓');
    expect(html).toContain('قدرت');
    expect(html).toContain('سؤال باز');
  });

  it('embeds the live placement matrix and the palette grid', () => {
    // 11 roles on the diagonal of the matrix
    expect(html).toContain('role↓ on→');
    expect(html).toContain('region');
    // 12 palette rows × 7 steps of swatches
    expect(html).toContain('Fuchsia');
    expect((html.match(/width:44px;height:24px;background:#/g) || []).length).toBe(84);
  });

  it('every test badge rendered is a real pass — no silent ✗ in the snapshot', () => {
    // The snapshot is a record; a ✗ in it means the engine broke and nobody looked.
    expect(html).not.toContain('>✗</span>');
  });

  it('writes the artifact', () => {
    const dir = resolve(process.cwd(), '.lab');
    mkdirSync(dir, { recursive: true });
    const out = resolve(dir, 'audit-lab-snapshot.html');
    writeFileSync(out, html);
    expect(html.length).toBeGreaterThan(60_000);
  });
});
