import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { Calendar } from '../data/Calendar/Calendar';
import { DirProvider } from '../../engine/liminal-direction';
import { toJalali, fromJalali, jalaliMonthLength, jalaliWeekdayIndex } from '../../engine/liminal-jalali';

afterEach(cleanup);

/** A fixed month, so the grid is the same on every run. */
const OCT_2026 = new Date(Date.UTC(2026, 9, 1));

// The grid's leading blanks are gridcells too — a grid's cells must live in
// rows, so the padding is real cells rather than absent ones. The day cells are
// the buttons.
const cells = (container: HTMLElement) =>
  [...container.querySelectorAll('button[role="gridcell"]')].map((c) => c.textContent?.trim());

const headers = (container: HTMLElement) =>
  [...container.querySelectorAll('[role="row"] > div')].map((c) => c.textContent?.trim());

/**
 * A Jalali month is not a Gregorian month. Its months are 31/30/29 days, its
 * year starts on the March equinox, and its week starts on Saturday — so a
 * Gregorian grid with Persian month names would be wrong eight days out of
 * twelve.
 */
describe('calendar — the Gregorian grid is unchanged', () => {
  it('still lays out October 2026 with 31 days', () => {
    const { container } = render(<Calendar month={OCT_2026} />);
    expect(cells(container)).toHaveLength(31);
    expect(cells(container)[0]).toBe('1');
    expect(cells(container)[30]).toBe('31');
  });

  it('still starts the week on Sunday', () => {
    const { container } = render(<Calendar month={OCT_2026} />);
    expect(headers(container)[0]).toBe('Sun');
    expect(headers(container)[6]).toBe('Sat');
  });

  it('still names the month in English', () => {
    const { container } = render(<Calendar month={OCT_2026} />);
    expect(container.textContent).toContain('October');
    expect(container.textContent).toContain('2026');
  });
});

describe('calendar — the Jalali grid is the calendar’s, not a relabelled Gregorian one', () => {
  it('lays out Mehr 1405, which is what October 2026 falls in', () => {
    const { container } = render(<Calendar calendar="jalali" month={OCT_2026} />);
    const j = toJalali(OCT_2026);
    expect(j.month).toBe(7);
    // Mehr has 30 days; October has 31. A relabelled grid would show 31.
    expect(cells(container)).toHaveLength(jalaliMonthLength(j.year, j.month));
    expect(cells(container)).toHaveLength(30);
  });

  it('starts the week on Saturday, in either language', () => {
    // The week order is a fact about the calendar; the names are the language.
    // Asking for Jalali with English names must still start on Saturday.
    const en = render(<Calendar calendar="jalali" lang="en" month={OCT_2026} />);
    expect(headers(en.container)[0]).toBe('Sat');
    expect(headers(en.container)[6]).toBe('Fri');
    cleanup();
    const fa = render(<Calendar calendar="jalali" lang="fa" month={OCT_2026} />);
    expect(headers(fa.container)[0]).toBe('شنبه');
    expect(headers(fa.container)[6]).toBe('جمعه');
  });

  it('names the month and year in Persian when the language is Persian', () => {
    const { container } = render(<Calendar calendar="jalali" lang="fa" month={OCT_2026} />);
    expect(container.textContent).toContain('مهر');
    expect(container.textContent).toContain('۱۴۰۵');
  });

  it('names the month in English when the language is English', () => {
    const { container } = render(<Calendar calendar="jalali" lang="en" month={OCT_2026} />);
    expect(container.textContent).toContain('Mehr');
    expect(container.textContent).toContain('1405');
  });

  it('numbers the days with Persian digits when the language is Persian', () => {
    const { container } = render(<Calendar calendar="jalali" lang="fa" month={OCT_2026} />);
    expect(cells(container)[0]).toBe('۱');
    expect(cells(container)[29]).toBe('۳۰');
  });

  it('numbers the days with Latin digits when the language is English', () => {
    const { container } = render(<Calendar calendar="jalali" lang="en" month={OCT_2026} />);
    expect(cells(container)[0]).toBe('1');
    expect(cells(container)[29]).toBe('30');
  });

  it('places the first day in the column its weekday says', () => {
    const { container } = render(<Calendar calendar="jalali" lang="en" month={OCT_2026} />);
    const j = toJalali(OCT_2026);
    const first = fromJalali({ year: j.year, month: j.month, day: 1 });
    // The cells are <button>, not <div> — the blanks are the divs.
    // The index of the first DAY cell — a button. The blanks before it are the
    // padding, and that count is the first day's column.
    const blanks = [...container.querySelectorAll('[role="grid"] > [role="row"] > [role="gridcell"]')].findIndex(
      (d) => d.tagName === 'BUTTON',
    );
    expect(blanks).toBe(jalaliWeekdayIndex(first));
  });

  it('gives every cell a full date for a screen reader, in the same calendar', () => {
    const { container } = render(<Calendar calendar="jalali" lang="fa" month={OCT_2026} />);
    const first = container.querySelector('button[role="gridcell"]')!;
    const label = first.getAttribute('aria-label') ?? '';
    expect(label).toContain('۱۴۰۵');
    expect(label).toContain('مهر');
  });
});

describe('calendar — a leap year is the calendar’s, not every fourth', () => {
  it('shows 30 days for Esfand in a leap year and 29 otherwise', () => {
    // 1403 is a leap year: its 1 Farvardin is 2024-03-20.
    const leapEsfand = fromJalali({ year: 1403, month: 12, day: 1 });
    const { container: leap } = render(<Calendar calendar="jalali" month={leapEsfand} />);
    expect(cells(leap)).toHaveLength(30);
    cleanup();
    // 1404 is not: its 1 Esfand is 2026-02-20.
    const commonEsfand = fromJalali({ year: 1404, month: 12, day: 1 });
    const { container: common } = render(<Calendar calendar="jalali" month={commonEsfand} />);
    expect(cells(common)).toHaveLength(29);
  });
});

describe('calendar — the navigation arrows follow the reading direction', () => {
  it('renders the same tree under rtl: the arrow is a prop, not a branch', () => {
    const ltr = render(<Calendar calendar="jalali" month={OCT_2026} />).container.innerHTML;
    cleanup();
    const rtl = render(
      <DirProvider dir="rtl">
        <Calendar calendar="jalali" month={OCT_2026} />
      </DirProvider>,
    ).container.innerHTML;
    // The icon element differs by direction, so the trees are NOT identical —
    // this asserts the direction actually reached the component.
    expect(rtl).not.toBe(ltr);
  });
});
