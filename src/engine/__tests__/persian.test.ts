import { describe, it, expect } from 'vitest';
import { LiminalLayoutEngine as L } from '../liminal-layout-engine';
import {
  PERSIAN_LINE_HEIGHT_FLOOR,
  lineHeightFor,
  letterSpacingFor,
  getLocalizedTypeStyle,
  toPersianDigits,
  toLatinDigits,
  formatNumber,
} from '../liminal-persian';

/**
 * Persian is connected, and it sits taller on the line. Neither is a
 * preference, and the Latin scale violates both:
 *
 *   letter-spacing   +0.04em at level 1 and negative tracking at the display
 *                    levels — positive tracking breaks the joins, so the word
 *                    stops being a word.
 *   line-height      1.10 to 1.60, while Vazirmatn's own metrics need 1.5625.
 *                    Seven of the eight levels clip.
 */
describe('persian — the line-height floor comes from the font, not from taste', () => {
  it('is the font’s own (ascender - descender + lineGap) / unitsPerEm', () => {
    // Vazirmatn: 2048 upem, ascender 2100, descender -1100, lineGap 0.
    expect(PERSIAN_LINE_HEIGHT_FLOOR).toBeCloseTo((2100 + 1100 + 0) / 2048, 4);
    expect(PERSIAN_LINE_HEIGHT_FLOOR).toBeCloseTo(1.5625, 4);
  });

  /**
   * AND NOW ALL EIGHT SIT BELOW IT, which the line-height formula made true.
   *
   * The old table was hand-picked and level 3 happened to be 1.60 — above the floor — so
   * exactly one level survived. The formula is `1 + 8/fs`: the line box is the font size plus
   * one spacing step, and its loosest value is 1.4167 at the smallest size. So EVERY Latin
   * level is below what Vazirmatn's own metrics need, and the Persian path is the only thing
   * standing between the script and clipped glyphs.
   *
   * That is not a defect in the formula — it is the two scripts having different needs, and
   * the floor is derived from the FONT rather than from taste precisely so this can be seen.
   */
  it('and now ALL eight Latin levels sit below it — the formula is looser than the font needs', () => {
    const clipped = [1, 2, 3, 4, 5, 6, 7, 8].filter((n) => L.TYPOGRAPHY[n].lh < PERSIAN_LINE_HEIGHT_FLOOR);
    expect(clipped).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('never returns a value below the floor for Persian', () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
      expect(lineHeightFor(n, 'fa'), `level ${n}`).toBeGreaterThanOrEqual(PERSIAN_LINE_HEIGHT_FLOOR);
    }
  });

  it('raises Persian body copy to the FLOOR, and leaves English at the formula', () => {
    // Persian takes the floor because the formula is below it; English takes the formula.
    expect(lineHeightFor(3, 'fa')).toBe(PERSIAN_LINE_HEIGHT_FLOOR);
    expect(lineHeightFor(3, 'en')).toBeCloseTo(1.2894, 3);
  });

  it('returns the designed value for English, unchanged', () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
      expect(lineHeightFor(n, 'en')).toBe(L.TYPOGRAPHY[n].lh);
    }
  });
});

describe('persian — the script is connected, so tracking is zero', () => {
  it('drops the positive tracking at level 1', () => {
    expect(L.TYPOGRAPHY[1].ls).toBe('+0.04em');
    expect(letterSpacingFor(1, 'fa')).toBe('0');
  });

  it('drops the negative display tracking too', () => {
    expect(L.TYPOGRAPHY[8].ls).toBe('-0.025em');
    expect(letterSpacingFor(8, 'fa')).toBe('0');
  });

  it('never returns a non-zero tracking for Persian at any level', () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
      expect(letterSpacingFor(n, 'fa'), `level ${n}`).toBe('0');
    }
  });

  it('leaves English tracking alone', () => {
    for (const n of [1, 2, 3, 4, 5, 6, 7, 8]) {
      expect(letterSpacingFor(n, 'en')).toBe(L.TYPOGRAPHY[n].ls);
    }
  });
});

describe('persian — the localized style carries both facts', () => {
  it('uses the fluid base for the size in both languages', () => {
    expect(getLocalizedTypeStyle(2, 'fa').fontSize).toBe(L.getTypeSizeCss(2));
    expect(getLocalizedTypeStyle(2, 'en').fontSize).toBe(L.getTypeSizeCss(2));
  });

  it('differs from the Latin style exactly where it must', () => {
    const fa = getLocalizedTypeStyle(7, 'fa');
    const en = getLocalizedTypeStyle(7, 'en');
    expect(fa.lineHeight).toBeGreaterThan(en.lineHeight);
    expect(fa.letterSpacing).toBe('0');
    expect(en.letterSpacing).toBe(L.TYPOGRAPHY[7].ls);
    expect(fa.fontWeight).toBe(en.fontWeight);
  });
});

describe('persian — digits are U+06F0, not the Arabic-Indic U+0660', () => {
  it('converts Latin digits to Persian ones', () => {
    expect(toPersianDigits(1234567890)).toBe('۱۲۳۴۵۶۷۸۹۰');
    expect(toPersianDigits('2026')).toBe('۲۰۲۶');
  });

  it('converts back', () => {
    expect(toLatinDigits('۱۲۳۴۵۶۷۸۹۰')).toBe('1234567890');
  });

  it('also accepts the Arabic-Indic set, which is a different character', () => {
    expect(toLatinDigits('١٢٣')).toBe('123');
  });

  it('round-trips', () => {
    for (const v of [0, 7, 42, 1000, 987654321]) {
      expect(toLatinDigits(toPersianDigits(v))).toBe(String(v));
    }
  });

  it('formats a number per language', () => {
    expect(formatNumber(1234, 'en')).toBe('1,234');
    expect(formatNumber(1234, 'fa')).toContain('۱');
  });
});
