import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { Button } from '../../atoms/Button';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import {
  getLadderColor,
  getTextStyle,
  SHADOWS,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveSurface, resolveBorder } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

export interface CalendarProps {
  mode?: 'single' | 'range';
  selectedDate?: Date | [Date, Date | null] | null;
  onSelectDate?: (date: Date | [Date, Date | null] | null) => void;
  month?: Date;
  onMonthChange?: (date: Date) => void;
  className?: string;
  style?: CSSProperties;
}

export function Calendar({
  mode = 'single',
  selectedDate = null,
  onSelectDate,
  month: controlledMonth,
  onMonthChange,
  className = '',
  style: customStyle = {},
}: CalendarProps) {
  const host = useHostSurface();
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

  const handlePrevMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    if (!controlledMonth) setInternalMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    if (!controlledMonth) setInternalMonth(newMonth);
    onMonthChange?.(newMonth);
  };

  const year = currentMonth.getFullYear();
  const monthIndex = currentMonth.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, monthIndex, i));
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
    width: '320px',
    padding: `${SPACING[3]}px`,
    borderRadius: `${RADIUS.card}px`,
    background: resolveSurface({ role: 'control', on: host }).background,
    border: `1px solid ${resolveBorder({ role: 'control', kind: 'hairline', on: host })}`,
    boxShadow: SHADOWS[3],
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
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    gap: '2px',
  };

  return (
    <div className={className} style={containerStyle}>
      <div style={headerStyle}>
        <span style={titleStyle}>
          {monthNames[monthIndex]} {year}
        </span>
        <div style={{ display: 'flex', gap: `${SPACING[1]}px` }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
            ariaLabel="Previous month"
            icon={<LiminalIcon icon={CaretLeft} size="sm" weight="bold" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            ariaLabel="Next month"
            icon={<LiminalIcon icon={CaretRight} size="sm" weight="bold" />}
          />
        </div>
      </div>

      <div style={gridHeaderStyle} role="row">
        {weekDays.map((wd) => (
          <div key={wd}>{wd}</div>
        ))}
      </div>

      <div style={daysGridStyle} role="grid">
        {days.map((dateObj, idx) => {
          if (!dateObj) {
            return <div key={`empty-${idx}`} style={{ height: '36px' }} />;
          }

          const selected = isSelected(dateObj);
          const today = isToday(dateObj);

          return (
            <DayCell
              key={dateObj.toISOString()}
              date={dateObj}
              selected={selected}
              today={today}
              onClick={() => handleDayClick(dateObj)}
              reducedMotion={reducedMotion}
            />
          );
        })}
      </div>
    </div>
  );
}

interface DayCellProps {
  date: Date;
  selected: boolean;
  today: boolean;
  onClick: () => void;
  reducedMotion: boolean;
}

function DayCell({ date, selected, today, onClick, reducedMotion }: DayCellProps) {
  const host = useHostSurface();
  // Hover is CSS's job now. A selected cell keeps its raised surface; an
  // unselected one lifts to the control surface on hover.
  const idleBg = selected ? resolveSurface({ role: 'control', state: 'hover', on: host }).background : 'transparent';
  const hoverBg = resolveSurface({ role: 'control', on: host }).background;

  const cellStyle = {
    '--liminal-surface-idle': idleBg,
    '--liminal-surface-hover': hoverBg,
    '--liminal-surface-active': hoverBg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '36px',
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
      aria-label={date.toDateString()}
      aria-selected={selected}
      role="gridcell"
      data-liminal-surface=""
      style={cellStyle}
    >
      {date.getDate()}
    </button>
  );
}

export default Calendar;
