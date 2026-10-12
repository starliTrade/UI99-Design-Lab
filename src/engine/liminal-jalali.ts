import { toPersianDigits } from './liminal-persian';
import type { Lang } from './liminal-persian';

/**
 * LIMINAL · JALALI CALENDAR
 * «تقویم را پلتفرم می‌داند — ما فقط نامش را می‌بریم.»
 *
 * There is a well-known 33-year cycle algorithm for Solar Hijri conversion, and
 * it is wrong for a handful of years in every century. This system does not
 * need it: `Intl` already carries the platform's own Persian calendar, which is
 * maintained against the real astronomical definition rather than a
 * approximation. So every conversion here goes through `Intl`, and the only
 * thing written by hand is the shape of the API.
 *
 * Verified against the anchors that matter: 2026-03-21 is 1405-01-01 (Nowruz),
 * and the year rolls on the March equinox.
 */

/** The Persian calendar, read through the platform. */
const PERSIAN_PARTS = new Intl.DateTimeFormat('en-u-ca-persian', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  timeZone: 'UTC',
});

const FA_MONTH_LONG = new Intl.DateTimeFormat('fa-IR', { month: 'long', timeZone: 'UTC' });
const FA_MONTH_SHORT = new Intl.DateTimeFormat('fa-IR', { month: 'short', timeZone: 'UTC' });
const FA_WEEKDAY_LONG = new Intl.DateTimeFormat('fa-IR', { weekday: 'long', timeZone: 'UTC' });
const FA_WEEKDAY_SHORT = new Intl.DateTimeFormat('fa-IR', { weekday: 'short', timeZone: 'UTC' });

export interface JalaliDate {
  year: number;
  /** 1 = Farvardin … 12 = Esfand */
  month: number;
  day: number;
}

/** The Gregorian date for a UTC day number, so every conversion is timezone-free. */
const utcDate = (year: number, month: number, day: number) => new Date(Date.UTC(year, month - 1, day));

/** Gregorian to Jalali. */
export function toJalali(date: Date): JalaliDate {
  const parts = PERSIAN_PARTS.formatToParts(date);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { year: get('year'), month: get('month'), day: get('day') };
}

/**
 * Jalali to Gregorian.
 *
 * A search rather than a formula, because the platform's calendar is the source
 * of truth and there is no closed form for it here. The range is bounded by the
 * Persian year's own length, so it converges in a dozen steps.
 */
export function fromJalali({ year, month, day }: JalaliDate): Date {
  // A Jalali year starts within a day of 21 March, so the search window is the
  // Gregorian year that contains it.
  let lo = Date.UTC(year + 621, 2, 15);
  let hi = Date.UTC(year + 622, 2, 25);
  const target = year * 10000 + month * 100 + day;
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2 / 86400000) * 86400000;
    if (mid === lo) break;
    const j = toJalali(new Date(mid));
    const key = j.year * 10000 + j.month * 100 + j.day;
    if (key < target) lo = mid;
    else hi = mid;
  }
  // Walk the last day or two rather than trusting the step size.
  for (let t = lo - 2 * 86400000; t <= lo + 2 * 86400000; t += 86400000) {
    const j = toJalali(new Date(t));
    if (j.year === year && j.month === month && j.day === day) return new Date(t);
  }
  return new Date(lo);
}

/** How many days a Jalali month has, from the calendar itself. */
export function jalaliMonthLength(year: number, month: number): number {
  const first = fromJalali({ year, month, day: 1 });
  const nextMonth = month === 12 ? { year: year + 1, month: 1, day: 1 } : { year, month: month + 1, day: 1 };
  const next = fromJalali(nextMonth);
  return Math.round((next.getTime() - first.getTime()) / 86400000);
}

/** How many days a Jalali year has: 365 or 366. */
export function jalaliYearLength(year: number): number {
  const first = fromJalali({ year, month: 1, day: 1 });
  const next = fromJalali({ year: year + 1, month: 1, day: 1 });
  return Math.round((next.getTime() - first.getTime()) / 86400000);
}

/** A leap year in the Solar Hijri calendar has 366 days. */
export function isJalaliLeapYear(year: number): boolean {
  return jalaliYearLength(year) === 366;
}

/** The month's name, from the platform, in either script. */
export function jalaliMonthName(month: number, lang: Lang = 'fa', short = false): string {
  // Any date inside the month will do; the name comes from the calendar.
  const sample = fromJalali({ year: 1400, month, day: 1 });
  const fmt = lang === 'fa' ? (short ? FA_MONTH_SHORT : FA_MONTH_LONG) : null;
  if (!fmt) {
    const en = new Intl.DateTimeFormat('en-u-ca-persian', { month: short ? 'short' : 'long', timeZone: 'UTC' });
    return en.format(sample);
  }
  return fmt.format(sample);
}

/**
 * The week, starting on Saturday.
 *
 * Iran's week begins on Saturday and ends on Friday. `Intl`'s `weekInfo` is not
 * universally available, so this is stated rather than asked — and it is a fact
 * about the calendar, not a preference.
 */
export const JALALI_WEEK_START = 6; // Saturday, where 0 is Sunday

/** The seven weekday names in order, Saturday first. */
export function jalaliWeekdays(lang: Lang = 'fa', short = true): string[] {
  const fmt = lang === 'fa' ? (short ? FA_WEEKDAY_SHORT : FA_WEEKDAY_LONG) : null;
  const out: string[] = [];
  // 2024-01-06 is a Saturday.
  for (let i = 0; i < 7; i++) {
    const d = new Date(Date.UTC(2024, 0, 6 + i));
    out.push(
      fmt
        ? fmt.format(d)
        : new Intl.DateTimeFormat('en-u-ca-persian', { weekday: short ? 'short' : 'long', timeZone: 'UTC' }).format(d),
    );
  }
  return out;
}

/** The weekday index for a date, where 0 is Saturday. */
export function jalaliWeekdayIndex(date: Date): number {
  return (date.getUTCDay() + 1) % 7;
}

/** Format a Gregorian date as a Jalali string, in the given language. */
export function formatJalali(
  date: Date,
  lang: Lang = 'fa',
  options: Intl.DateTimeFormatOptions = { dateStyle: 'long' },
): string {
  const formatted = new Intl.DateTimeFormat(lang === 'fa' ? 'fa-IR' : 'en-u-ca-persian', {
    ...options,
    timeZone: 'UTC',
  }).format(date);
  return lang === 'fa' ? toPersianDigits(formatted) : formatted;
}

/** `1405/07/21` — the numeric form, with Persian digits when asked. */
export function formatJalaliNumeric(date: Date, lang: Lang = 'fa'): string {
  const { year, month, day } = toJalali(date);
  const pad = (n: number) => String(n).padStart(2, '0');
  const s = `${year}/${pad(month)}/${pad(day)}`;
  return lang === 'fa' ? toPersianDigits(s) : s;
}
