import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildColorAuditHtml } from '../generate-color-audit';

/**
 * THE COLOUR-AUDIT PAGE IS A BUILD ARTIFACT WITH A GUARD.
 *
 * خواستِ خواننده: لیستِ لایه‌ها با کدِ رنگ و فاصله + ممیزیِ بی‌رحمِ رنگ/پالت/
 * روانشناسی/روابط. خواننده روی گوشی است و تصمیم‌های رنگی را با چشم می‌گیرد —
 * پس صفحه هر اجرای سوئیت از موتورِ زنده بازتولید و از Pages سرو می‌شود.
 *
 * گاردها: بخش‌های خالی، عددِ کهنه، Δِ نومینالِ دروغ (باگِ دورِ ۷) و نشانِ ✗
 * بی‌صدا — هر کدام اینجا می‌شکنند، نه روی گوشیِ خواننده.
 */
describe('colour-audit page — merciless round, from the real engine', () => {
  const html = buildColorAuditHtml();

  it('is a complete RTL document with zero external requests', () => {
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('dir="rtl"');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('@import');
    // raw engine hexes, no dangling var()
    expect(html).toContain('background:#060709');
    expect(html).toContain('background:#15171a');
  });

  it('carries all nine audit sections', () => {
    for (const title of ['لیستِ لایه‌ها', 'چرخِ رنگ', 'نام در برابرِ واقعیت', 'پوششِ چرخ', 'رمپ‌ها', 'تمایزپذیری', 'معناها', 'رابطه‌ها', 'حکم‌ها']) {
      expect(html, `section missing: ${title}`).toContain(title);
    }
  });

  it('lists the nine layers with hex codes — the reader\'s explicit request', () => {
    expect((html.match(/<td><b>S\d<\/b><\/td>/g) || []).length).toBeGreaterThanOrEqual(9);
    for (const hex of ['#060709', '#07090b', '#090b0d', '#0b0d0f', '#0d0f12', '#0f1114', '#111316', '#131518', '#15171a']) {
      expect(html, `layer hex missing: ${hex}`).toContain(hex);
    }
    // the wells ride along, marked as non-layers
    expect(html).toContain('#030406');
    expect(html).toContain('#010203');
  });

  it('renders the measured wheel — 12 dots, nominal ticks, both gap arcs, the stage mark', () => {
    expect(html).toContain('<svg');
    expect((html.match(/r="7" fill="#/g) || []).length).toBe(12);
    expect((html.match(/<polyline/g) || []).length).toBe(2);
    expect(html).toContain('صحنه');
    for (const label of ['Ruby', 'Coral', 'Amber', 'Lime', 'Emerald', 'Teal', 'Cyan', 'Sapphire', 'Indigo', 'Violet', 'Fuchsia', 'Rose']) {
      expect(html, `wheel label missing: ${label}`).toContain(label);
    }
  });

  it('reports the MEASURED semantic deltas — the nominal-lie bug cannot return', () => {
    // measured: INFO 3.9° · DANGER 9.4° · WARNING 9.9° · SUCCESS 11.1°
    for (const d of ['۳.۹°', '۹.۴°', '۹.۹°', '۱۱.۱°']) {
      expect(html, `corrected delta missing: ${d}`).toContain(d);
    }
    // the old nominal math claimed INFO Δ27.5° — the page may quote it as
    // HISTORY (the fix verdict does), but it must never render as a current
    // delta. Current deltas are the green cells of the proposal table:
    expect(html).not.toContain('color:#74CE8E">۲۷.۵');
    expect(html).not.toContain('color:#74CE8E">27.5');
  });

  it('shows current-vs-proposed semantics side by side, with the inversion named', () => {
    expect(html).toContain('فعلی');
    expect(html).toContain('پیشنهادی');
    for (const hex of ['#00875d', '#946a00', '#ba4646', '#3271c8']) expect(html).toContain(hex); // current solids
    for (const hex of ['#274b31', '#544926', '#5d1d28', '#0c335e']) expect(html).toContain(hex); // proposed fills
    expect(html).toContain('واژگون');
  });

  it('every test badge rendered is a real pass — no silent ✗ in the artifact', () => {
    expect(html).not.toContain('>✗</span>');
    expect(html).toContain('>✓</span>');
  });

  it('counts the verdicts on the page', () => {
    // ۶ قدرت · ۵ ضعف · ۱ حل‌شده · ۴ باز — pinned so a dropped verdict is visible
    expect(html).toContain('<b class="good">۶</b>');
    expect(html).toContain('<b style="color:#D9BE6E">۵</b>');
    expect(html).toContain('<b style="color:#6FA8EC">۱</b>');
    expect(html).toContain('<b style="color:#A98BEA">۴</b>');
  });

  it('writes the artifact', () => {
    const dir = resolve(process.cwd(), '.lab');
    mkdirSync(dir, { recursive: true });
    const out = resolve(dir, 'color-audit.html');
    writeFileSync(out, html, 'utf8');
    expect(html.length).toBeGreaterThan(30_000);
  });
});
