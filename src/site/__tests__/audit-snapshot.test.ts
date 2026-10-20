import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildAuditSnapshotHtml } from '../generate-audit-snapshot';

/**
 * THE PHASE PAGE IS A BUILD ARTIFACT WITH A GUARD.
 *
 * The reader is on a phone: no Preview tab, and sandbox links die between
 * turns. The phase page (canvas ↔ surface, flat — the CURRENT stage only) is
 * regenerated from the live engine on every suite run and shipped via GitHub
 * Pages, so what the reader sees can never describe an engine that no longer
 * exists.
 *
 * The guard: if the generator emits an empty section, a stale number or a
 * failing test badge, this fails instead of silently shipping a bad page.
 */
describe('phase snapshot — canvas ↔ surface, flat, from the real engine', () => {
  const html = buildAuditSnapshotHtml();

  it('is a complete RTL document with zero external requests', () => {
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('dir="rtl"');
    // Self-contained: no scripts, no stylesheets, no webfonts. The one <a> to the
    // threshold tool is a link, not a request the page makes.
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<link');
    expect(html).not.toContain('@import');
    // Fills are raw hex from the engine — no var() left dangling without :root.
    expect(html).toContain('background:#060709');
    expect(html).toContain('background:#15171a');
  });

  it('carries all nine phase sections', () => {
    for (const title of ['این مرحله', 'بوم — لنگر', 'قانونِ نردبان', 'روان‌فیزیک', 'جدولِ عددی', 'برایِ چشم', 'چرا این گام', 'تک‌محور', 'حکم‌ها']) {
      expect(html, `section missing: ${title}`).toContain(title);
    }
    expect(html).toContain('✓');
  });

  it('renders the nine levels with their measured numbers', () => {
    // nine rows in the numeric table, from S0 to S8
    expect((html.match(/<td><b>S\d<\/b><\/td>/g) || []).length).toBe(9);
    expect(html).toContain('#0b0d0f'); // S3 — work/panel boundary
    // the nested flat chain runs through the real resolveSurface
    expect(html).toContain('canvas → S0');
    expect(html).toContain('control on region → S3'); // the composition gap, rendered flat
  });

  it('embeds the reader\'s own threshold sessions, live from the JSON', () => {
    expect(html).toContain('0.00830'); // session q, toFixed(5)
    expect(html).toContain('۱۵۶'); // 156 trials, Persian digits
    expect(html).toContain('threshold-test-precise.html'); // the re-measure link
  });

  it('the alternatives were rejected by numbers, on the page', () => {
    for (const mark of ['۰.۵q', '۱.۰q', '۱.۳۵q', '۱.۵q']) {
      expect(html, `rival ladder missing: ${mark}`).toContain(mark);
    }
  });

  it('every test badge rendered is a real pass — no silent ✗ in the snapshot', () => {
    // (the ✗ marks inside the rival-ladder rule lines are arguments, not badges —
    // they live in <span class="bad">✗ …text…</span>, never a bare badge)
    expect(html).not.toContain('>✗</span>');
  });

  it('writes the artifact', () => {
    const dir = resolve(process.cwd(), '.lab');
    mkdirSync(dir, { recursive: true });
    const out = resolve(dir, 'audit-lab-snapshot.html');
    writeFileSync(out, html);
    expect(html.length).toBeGreaterThan(30_000);
  });
});
