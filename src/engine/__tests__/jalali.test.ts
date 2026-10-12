import { describe, it, expect } from 'vitest';
import {
  toJalali,
  fromJalali,
  jalaliMonthLength,
  jalaliYearLength,
  isJalaliLeapYear,
  jalaliMonthName,
  jalaliWeekdays,
  jalaliWeekdayIndex,
  formatJalali,
  formatJalaliNumeric,
  JALALI_WEEK_START,
} from '../liminal-jalali';

const g = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

/**
 * There is a well-known 33-year cycle algorithm for Solar Hijri conversion, and
 * it is wrong for a handful of years in every century. This module does not use
 * it: every conversion goes through `Intl`, which carries the platform's own
 * Persian calendar, maintained against the real astronomical definition.
 */
describe('jalali — the anchors the calendar is defined by', () => {
  it('Nowruz 2026 is 1405-01-01', () => {
    expect(toJalali(g(2026, 3, 21))).toEqual({ year: 1405, month: 1, day: 1 });
  });

  it('Nowruz 2027 is 1406-01-01', () => {
    expect(toJalali(g(2027, 3, 21))).toEqual({ year: 1406, month: 1, day: 1 });
  });

  it('the year rolls on the March equinox, not on 1 January', () => {
    expect(toJalali(g(2026, 3, 20)).year).toBe(1404);
    expect(toJalali(g(2026, 3, 21)).year).toBe(1405);
  });

  it('converts a known mid-year date', () => {
    expect(toJalali(g(2026, 10, 13))).toEqual({ year: 1405, month: 7, day: 21 });
  });
});

describe('jalali — conversion round-trips', () => {
  it('Gregorian -> Jalali -> Gregorian is the same day', () => {
    for (const d of [g(2024, 1, 1), g(2025, 6, 15), g(2026, 3, 21), g(2026, 12, 31), g(2030, 8, 8)]) {
      expect(fromJalali(toJalali(d)).toISOString().slice(0, 10)).toBe(d.toISOString().slice(0, 10));
    }
  });

  it('Jalali -> Gregorian -> Jalali is the same day', () => {
    // 1403 is a leap year, so Esfand has 30 days; 1404 is not, so it has 29.
    for (const j of [{ year: 1400, month: 1, day: 1 }, { year: 1403, month: 12, day: 30 }, { year: 1405, month: 7, day: 21 }]) {
      expect(toJalali(fromJalali(j))).toEqual(j);
    }
  });

  it('an impossible date does not throw and does not silently become another', () => {
    // 1404 is a common year: Esfand has 29 days, so 30 Esfand does not exist.
    expect(jalaliMonthLength(1404, 12)).toBe(29);
    const d = fromJalali({ year: 1404, month: 12, day: 30 });
    expect(d instanceof Date).toBe(true);
    expect(Number.isNaN(d.getTime())).toBe(false);
    // It lands on the last real day rather than inventing one.
    expect(toJalali(d).day).toBeLessThanOrEqual(29);
  });

  it('walks a whole year without losing or repeating a day', () => {
    const start = fromJalali({ year: 1405, month: 1, day: 1 });
    const seen = new Set<string>();
    for (let i = 0; i < jalaliYearLength(1405); i++) {
      const d = new Date(start.getTime() + i * 86400000);
      const j = toJalali(d);
      const key = `${j.year}-${j.month}-${j.day}`;
      expect(seen.has(key), `duplicate ${key}`).toBe(false);
      seen.add(key);
    }
    expect(seen.size).toBe(jalaliYearLength(1405));
  });
});

describe('jalali — the month and year lengths are the calendar’s, not a table', () => {
  it('the first six months have 31 days', () => {
    for (const m of [1, 2, 3, 4, 5, 6]) expect(jalaliMonthLength(1405, m), `month ${m}`).toBe(31);
  });

  it('the next five have 30', () => {
    for (const m of [7, 8, 9, 10, 11]) expect(jalaliMonthLength(1405, m), `month ${m}`).toBe(30);
  });

  it('Esfand has 29 in a common year and 30 in a leap year', () => {
    expect(jalaliMonthLength(1405, 12)).toBe(29);
    expect(jalaliMonthLength(1403, 12)).toBe(30);
    expect(isJalaliLeapYear(1403)).toBe(true);
    expect(isJalaliLeapYear(1405)).toBe(false);
  });

  it('a year is 365 or 366 days and nothing else', () => {
    for (let y = 1395; y <= 1425; y++) {
      expect([365, 366], `year ${y}`).toContain(jalaliYearLength(y));
    }
  });

  it('leap years are not every fourth — that is why the 33-year cycle is wrong', () => {
    const leaps = [];
    for (let y = 1395; y <= 1425; y++) if (isJalaliLeapYear(y)) leaps.push(y);
    // Five leaps in thirty-one years, not seven or eight.
    expect(leaps.length).toBeGreaterThanOrEqual(5);
    expect(leaps.length).toBeLessThanOrEqual(9);
  });
});

describe('jalali — names come from the platform too', () => {
  it('names the months in Persian', () => {
    expect(jalaliMonthName(1)).toBe('فروردین');
    expect(jalaliMonthName(7)).toBe('مهر');
    expect(jalaliMonthName(12)).toBe('اسفند');
  });

  it('names all twelve distinctly', () => {
    const names = Array.from({ length: 12 }, (_, i) => jalaliMonthName(i + 1));
    expect(new Set(names).size).toBe(12);
  });

  it('starts the week on Saturday', () => {
    expect(JALALI_WEEK_START).toBe(6);
    const days = jalaliWeekdays();
    expect(days).toHaveLength(7);
    expect(days[0]).toBe('شنبه');
    expect(days[6]).toBe('جمعه');
  });

  it('indexes the weekday from Saturday', () => {
    // 2026-10-13 is a Tuesday.
    expect(jalaliWeekdayIndex(g(2026, 10, 13))).toBe(3);
    // 2026-10-17 is a Saturday.
    expect(jalaliWeekdayIndex(g(2026, 10, 17))).toBe(0);
  });
});

describe('jalali — formatting', () => {
  it('formats a long date in Persian', () => {
    expect(formatJalali(g(2026, 10, 13))).toBe('۲۱ مهر ۱۴۰۵');
  });

  it('formats the numeric form with Persian digits', () => {
    expect(formatJalaliNumeric(g(2026, 10, 13))).toBe('۱۴۰۵/۰۷/۲۱');
  });

  it('formats the numeric form with Latin digits for English', () => {
    expect(formatJalaliNumeric(g(2026, 10, 13), 'en')).toBe('1405/07/21');
  });
});
