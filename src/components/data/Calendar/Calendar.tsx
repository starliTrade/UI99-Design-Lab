import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from '../../atoms/Button';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import {getLadderColor,
  getTextStyle} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveSurface, resolveBorder, resolveInteractionVars } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import { useDirection, pick } from '../../../engine/liminal-direction';
import {
  toJalali,
  fromJalali,
  jalaliMonthLength,
  jalaliMonthName,
  jalaliWeekdays,
  jalaliWeekdayIndex,
  formatJalali,
} from '../../../engine/liminal-jalali';
import { toPersianDigits } from '../../../engine/liminal-persian';
import { floatShadow, floatHeight } from '../../../engine/liminal-mist';

/** A layout decision this component owns, not a system token. */
const CALENDAR_WIDTH = 320;
/** A layout decision this component owns, not a system token. */
const DAY_CELL_HEIGHT = 36;

export interface CalendarProps {
  /**
   * Which calendar to lay out. `jalali` is the Solar Hijri calendar, and it is
   * not a formatting option: its months are 31/30/29 days, its year starts on
   * the March equinox, and its week starts on Saturday. A Gregorian grid with
   * Persian month names would be wrong eight days out of twelve.
   */
  calendar?: 'gregorian' | 'jalali';
  /** The language for the month, weekday and day labels. */
  lang?: 'en' | 'fa';
  mode?: 'single' | 'range';
  selectedDate?: Date | [Date, Date | null] | null;
  onSelectDate?: (date: Date | [Date, Date | null] | null) => void;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  className?: string;
  style?: CSSProperties;
}

export function Calendar({
  calendar = 'gregorian',
  lang = 'en',
  mode = 'single',
  selectedDate = null,
  onSelectDate,
  month: controlledMonth,
  onMonthChange,
  className = '',
  style: customStyle = {},
}: CalendarProps) {
  const host = useHostSurface();
  const dir = useDirection();
  // The contract said §14 the calendar had roving tabindex and arrow keys. It
  // did not. A grid a keyboard cannot move through is a grid a keyboard user
  // cannot use.
  const [focusIndex, setFocusIndex] = useState<number | null>(null);

  // One cell carries the tab stop even before the user has moved: today when it
  // is in view, otherwise the first day of the month. A grid with no tab stop is
  // unreachable by keyboard at all.
  const defaultFocusIndex = (dates: (Date | null)[]) => {
    const real = dates.filter(Boolean) as Date[];
    const todayAt = real.findIndex((d) => isSameDay(d, new Date()));
    return todayAt >= 0 ? todayAt : 0;
  };
  const [internalMonth, setInternalMonth] = useState<Date>(controlledMonth || new Date());
  const reducedMotion = useReducedMotion();
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  useEffect(() => {
    if (controlledMonth) {
      setInternalMonth(controlledMonth);
    }
  }, [controlledMonth]);

  const currentMonth = controlledMonth || internalMonth;

  // A Jalali month is not a Gregorian month, so stepping has to go through the
  // calendar rather than through `setMonth`. From 1 Farvardin, `setMonth(+1)`
  // lands 30 or 31 days later — which is a Jalali month only by luck.
  const stepMonth = (delta: number) => {
    let newMonth: Date;
    if (calendar === 'jalali') {
      const cur = toJalali(currentMonth);
      const m = cur.month + delta;
      const year = cur.year + Math.floor((m - 1) / 12);
      const month = ((((m - 1) % 12) + 12) % 12) + 1;
      newMonth = fromJalali({ year, month, day: 1 });
    } else {
      newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1);
    }
    if (!controlledMonth) setInternalMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handlePrevMonth = () => stepMonth(-1);
  const handleNextMonth = () => stepMonth(1);

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ── the calendar's own arithmetic ────────────────────────────────────────
  //
  // Every number below comes from `liminal-jalali`, which reads the platform's
  // Persian calendar rather than a 33-year cycle approximation. Nothing here
  // hand-computes a Jalali date.
  const isJalali = calendar === 'jalali';
  const j = isJalali ? toJalali(currentMonth) : null;

  const monthLabel = isJalali ? jalaliMonthName(j!.month, lang) : monthNames[monthIndex];
  const yearLabel = isJalali
    ? lang === 'fa'
      ? toPersianDigits(j!.year)
      : String(j!.year)
    : String(year);

  const weekDays = isJalali
    ? jalaliWeekdays(lang)
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = isJalali
    ? fromJalali({ year: j!.year, month: j!.month, day: 1 })
    : new Date(year, monthIndex, 1);
  const daysInMonth = isJalali ? jalaliMonthLength(j!.year, j!.month) : new Date(year, monthIndex + 1, 0).getDate();
  // Saturday is index 0 in the Jalali week, Sunday is index 0 in the Gregorian.
  const startingDayOfWeek = isJalali ? jalaliWeekdayIndex(firstDayOfMonth) : firstDayOfMonth.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(isJalali ? fromJalali({ year: j!.year, month: j!.month, day: i }) : new Date(year, monthIndex, i));
  }

  // A grid's cells must live in rows. The grid was flat, so `role="grid"` had
  // `gridcell` children with no `role="row"` between them — which axe calls
  // critical, and which means a screen reader cannot navigate by week.
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const isSameDay = (d1: Date | null, d2: Date | null) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isToday = (d: Date | null) => {
    return isSameDay(d, new Date());
  };

  const isSelected = (d: Date | null) => {
    if (!d) return false;
    if (mode === 'single') {
      return isSameDay(d, selectedDate as Date);
    } else if (mode === 'range' && Array.isArray(selectedDate)) {
      const [start, end] = selectedDate;
      if (start && isSameDay(d, start)) return true;
      if (end && isSameDay(d, end)) return true;
      if (start && end && d > start && d < end) return true;
    }
    return false;
  };

  const handleDayClick = (d: Date | null) => {
    if (!d) return;
    if (mode === 'single') {
      onSelectDate?.(d);
    } else if (mode === 'range') {
      if (!Array.isArray(selectedDate) || !selectedDate[0] || (selectedDate[0] && selectedDate[1])) {
        onSelectDate?.([d, null]);
      } else {
        const [start] = selectedDate;
        if (d < start) {
          onSelectDate?.([d, null]);
        } else {
          onSelectDate?.([start, d]);
        }
      }
    }
  };

  const containerStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: CALENDAR_WIDTH,
    padding: `${SPACING[3]}px`,
    borderRadius: `${RADIUS.card}px`,
    background: resolveSurface({ role: 'control', on: host }).background,
    border: `1px solid ${resolveBorder({ role: 'control', kind: 'hairline', on: host })}`,
    boxShadow: floatShadow(floatHeight('popover')),
    boxSizing: 'border-box',
    userSelect: 'none',
    ...customStyle,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: `${SPACING[3]}px`,
  };

  const titleStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(3),
    fontWeight: 600,
    color: getTextStyle('primary', 1).color,
  };

  const gridHeaderStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    marginBottom: `${SPACING[2]}px`,
    fontSize: LiminalLayoutEngine.getTypeSizeCss(1),
    fontWeight: 500,
    color: getTextStyle('tertiary', 1).color,
  };

  const daysGridStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[0]}px`,
  };

  // Each week is the 7-column grid; the grid itself is a column of weeks, which
  // is what `role="grid" > role="row" > role="gridcell"` means.
  const weekStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: `${SPACING[0]}px`,
  };

  // Arrow keys move the focused cell; Home and End go to the ends of the week.
  // The grid is seven columns wide, so up and down are ±7. The contract claimed
  // §14 this existed; it did not.
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const cells = days.filter(Boolean) as Date[];
    if (!cells.length) return;
    const current = focusIndex ?? cells.findIndex((d) => isSameDay(d, new Date()));
    const at = current < 0 ? 0 : current;
    const delta: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: 7,
      ArrowUp: -7,
    };
    let next: number;
    if (e.key in delta) next = at + delta[e.key];
    else if (e.key === 'Home') next = at - (at % 7);
    else if (e.key === 'End') next = at - (at % 7) + 6;
    else return;
    e.preventDefault();
    next = Math.max(0, Math.min(cells.length - 1, next));
    setFocusIndex(next);
    const el = e.currentTarget.querySelectorAll<HTMLElement>('button[role="gridcell"]')[next];
    el?.focus();
  };


  return (
    <div className={className} style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>
          {monthLabel} {yearLabel}
        </span>
        <div style={{ display: 'flex', gap: `${SPACING[1]}px` }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
            ariaLabel="Previous month"
            // "Previous" is the START of the axis: left-pointing in LTR,
            // right-pointing in RTL. The arrow follows the reading direction.
            icon={<LiminalIcon icon={pick(dir, CaretLeft, CaretRight)} size="sm" weight="bold" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            ariaLabel="Next month"
            icon={<LiminalIcon icon={pick(dir, CaretRight, CaretLeft)} size="sm" weight="bold" />}
          />
        </div>
      </div>

      <div style={daysGridStyle} role="grid" aria-label={calendar === 'jalali' ? 'تقویم' : 'Calendar'} onKeyDown={handleGridKeyDown}>
        <div role="row">
          {weekDays.map((wd) => (
            <div key={wd} role="columnheader">{wd}</div>
          ))}
        </div>
        {weeks.map((week, wi) => (
          <div key={`w-${wi}`} role="row" style={weekStyle}>
            {week.map((dateObj, idx) => {
              if (!dateObj) {
                return <div key={`empty-${wi}-${idx}`} role="gridcell" style={{ height: DAY_CELL_HEIGHT }} />;
              }

              const selected = isSelected(dateObj);
              const today = isToday(dateObj);
              // The position in the month, which IS the day number in both
              // calendars — `dateObj.getDate()` is the Gregorian one and would be
              // wrong by up to a month in the Jalali grid. The grid is padded with
              // `startingDayOfWeek` leading blanks, so the day number is the offset
              // from there.
              const dayIndex = wi * 7 + idx - startingDayOfWeek + 1;

              return (
                <DayCell
                  key={dateObj.toISOString()}
                  date={dateObj}
                  label={isJalali ? (lang === 'fa' ? toPersianDigits(dayIndex) : String(dayIndex)) : String(dateObj.getDate())}
                  ariaLabel={isJalali ? formatJalali(dateObj, lang, { dateStyle: 'full' }) : dateObj.toDateString()}
                  selected={selected}
                  today={today}
                  onClick={() => handleDayClick(dateObj)}
                  reducedMotion={reducedMotion}
                  tabIndex={(focusIndex ?? defaultFocusIndex(days)) === dayIndex - 1 ? 0 : -1}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

interface DayCellProps {
  date: Date;
  /** Roving tab stop: one cell in the grid is reachable by Tab. */
  tabIndex: number;
  /** The day number in the calendar being shown — not `date.getDate()`, which
   *  is the Gregorian one. In the Jalali calendar they differ by up to a month. */
  label: string;
  /** The full date for a screen reader, in the calendar being shown. */
  ariaLabel: string;
  selected: boolean;
  today: boolean;
  onClick: () => void;
  reducedMotion: boolean;
}

function DayCell({ date, label, ariaLabel, selected, today, onClick, reducedMotion, tabIndex }: DayCellProps) {
  const host = useHostSurface();
  // Hover is CSS's job now. A selected cell keeps its raised surface; an
  // unselected one lifts to the control surface on hover.
  const idleBg = selected ? resolveSurface({ role: 'control', state: 'hover', on: host }).background : 'transparent';
  const hoverBg = resolveSurface({ role: 'control', on: host }).background;

  const cellStyle = {
    // A selected cell keeps its raised surface; an unselected one lies flat and
    // lifts to the control surface on hover. Both states are explicit because
    // the resting fill is the caller's own — the engine cannot derive a lift
    // from a colour it did not choose.
    ...resolveInteractionVars({
      role: 'control',
      on: host,
      idle: idleBg,
      hover: hoverBg,
    }),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: DAY_CELL_HEIGHT,
    borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
    color: selected ? getTextStyle('primary', 4).color : today ? resolveBorder({ role: 'control', kind: 'edge', on: host }) : getTextStyle('primary', 1).color,
    fontWeight: selected || today ? 600 : 400,
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
    cursor: 'pointer',
    border: today && !selected ? `1px solid ${resolveBorder({ role: 'control', kind: 'edge', on: host })}` : '1px solid transparent',
  } as CSSProperties;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-selected={selected}
      role="gridcell"
      tabIndex={tabIndex}
      data-liminal-surface=""
      style={cellStyle}
    >
      {label}
    </button>
  );
}

export default Calendar;
