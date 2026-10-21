import { describe, it, expect } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildNestedTestHtml } from '../generate-nested-test';
import { LADDER } from '../../engine/liminal-ladder';

/**
 * THE NESTED VISUAL TEST IS THE STAGE-ZERO SIGN-OFF GATE.
 *
 * خواننده با چشم تأیید می‌کند که درزهایِ نردبان یکنواخت‌اند؛ بعد از آن تأیید،
 * فرمولِ دقیق در POLICY نوشته می‌شود. پس این صفحه باید درستِ همان چیزی باشد
 * که موتور می‌سازد — با کلیدِ آزمونِ کوری که دروغ نگوید.
 */
describe('nested visual test — the sign-off gate renders honestly', () => {
  const html = buildNestedTestHtml();

  it('is a complete RTL document with zero external requests and zero scripts', () => {
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('dir="rtl"');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('<link');
    expect(html).not.toContain('@import');
    // flat fills only — the stage-zero discipline: no border, no shadow on the stacks
    expect(html).toContain('background:#060709');
    expect(html).toContain('background:#15171a');
    expect(html).not.toContain('box-shadow');
  });

  it('carries all five test sections', () => {
    for (const title of ['آزمونِ اصلی', 'خط‌کشِ درزها', 'رقیب‌ها', 'آزمونِ کور', 'جدولِ عددی']) {
      expect(html, `section missing: ${title}`).toContain(title);
    }
  });

  it('renders nine nested stacks — 1 main + 4 labelled rivals + 4 blind', () => {
    expect((html.match(/class="nstack"/g) || []).length).toBe(9);
    // the real ladder appears in main, in the labelled grid, and once in the blind test
    for (const hex of LADDER) expect(html).toContain(hex);
    expect((html.match(/data-law="uniform"/g) || []).length).toBe(2);
    for (const law of ['inc', 'dec', 'geo']) {
      expect((html.match(new RegExp(`data-law="${law}"`, 'g')) || []).length).toBe(2);
    }
  });

  it('shows the exact law and the realised hex band, live', () => {
    expect(html).toContain('1.1416'); // exact step in q, f4
    expect(html).toContain('1.07'); // weakest realised seam, f2
    expect(html).toContain('1.21'); // strongest realised seam, f2
    // the calibration ruler: below-q and above-r references
    expect(html).toContain('0.60q');
    expect(html).toContain('1.70q');
  });

  it('the blind-test key tells the truth — the letter matches the uniform stack', () => {
    const keyLetter = html.match(/پاسخِ ستونِ واقعی: <b>([^<]+)<\/b>/)?.[1];
    expect(keyLetter, 'key block missing').toBeTruthy();
    const blindUniform = html.match(/class="bstack" data-law="uniform" data-letter="([^"]+)"/)?.[1];
    expect(blindUniform, 'blind uniform stack missing').toBeTruthy();
    expect(keyLetter).toBe(blindUniform);
    // determinism: regenerating yields the identical document (seeded order)
    expect(buildNestedTestHtml()).toBe(html);
  });

  it('promises the policy formula only AFTER the reader signs off', () => {
    expect(html).toContain('L(n) = CANVAS_L + n × LADDER_STEP');
    expect(html).toContain('تا تأییدِ شما چیزی در سیاست نوشته نمی‌شود');
  });

  it('writes the artifact', () => {
    const dir = resolve(process.cwd(), '.lab');
    mkdirSync(dir, { recursive: true });
    const out = resolve(dir, 'nested-test.html');
    writeFileSync(out, html, 'utf8');
    // ~22.6KB on disk — html.length counts UTF-16 chars, Persian is multibyte
    expect(html.length).toBeGreaterThan(18_000);
  });
});
