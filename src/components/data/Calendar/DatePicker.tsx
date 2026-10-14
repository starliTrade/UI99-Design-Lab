import React, { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Calendar as CalendarIcon } from '@phosphor-icons/react';
import { Input } from '../../inputs/Input';
import { Calendar } from './Calendar';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import { LiminalPortal } from '../../../engine/liminal-portal';
import { useFloating } from '../../../engine/liminal-floating';
import { SHADOWS } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { mistCssVars } from '../../../engine/liminal-mist';

export interface DatePickerProps {
  mode?: 'single' | 'range';
  value?: Date | [Date, Date | null] | null;
  selectedDate?: Date | [Date, Date | null] | null;
  onChange?: (date: Date | [Date, Date | null] | null) => void;
  onSelectDate?: (date: Date | [Date, Date | null] | null) => void;
  placeholder?: string;
  label?: string;
  /**
   * The validation message. A date can be invalid — out of range, in the past,
   * not a working day — and the Input underneath has carried an `error` all
   * along. The wrapper simply never passed it through, which is the same defect
   * as the Button's swallowed handlers: a prop that stops one layer short.
   */
  error?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function DatePicker({
  mode = 'single',
  value,
  selectedDate: propSelectedDate,
  onChange,
  onSelectDate,
  placeholder = 'Select date',
  label,
  error,
  disabled = false,
  className = '',
  style: customStyle = {},
}: DatePickerProps) {
  const effectiveValue = value !== undefined ? value : (propSelectedDate !== undefined ? propSelectedDate : null);
  const [selected, setSelected] = useState<Date | [Date, Date | null] | null>(effectiveValue);

  const { triggerRef, floatingRef, position, isOpen, open, close } = useFloating({
    placement: 'bottom-start',
    offset: { y: 8 },
    flip: true,
    shift: true,
    closeOnClickOutside: true,
    closeOnEscape: true,
  });

  useEffect(() => {
    if (effectiveValue !== undefined) {
      setSelected(effectiveValue);
    }
  }, [effectiveValue]);

  const formatDate = (d: Date | [Date, Date | null] | null) => {
    if (!d) return '';
    if (Array.isArray(d)) {
      const [start, end] = d;
      const sStr = start ? start.toISOString().split('T')[0] : '';
      const eStr = end ? end.toISOString().split('T')[0] : '...';
      return `${sStr} to ${eStr}`;
    }
    return d.toISOString().split('T')[0];
  };

  const handleSelect = (date: Date | [Date, Date | null] | null) => {
    setSelected(date);
    onChange?.(date);
    onSelectDate?.(date);
    if (mode === 'single' || (Array.isArray(date) && date[0] && date[1])) {
      close();
    }
  };

  return (
    <div
      className={className}
      style={{ position: 'relative', width: '100%', boxSizing: 'border-box', ...customStyle }}
    >
      <div ref={triggerRef as React.RefObject<HTMLDivElement>} onClick={() => !disabled && open()}>
        <Input
          value={formatDate(selected)}
          placeholder={placeholder}
          label={label}
          error={error}
          disabled={disabled}
          readOnly
          /**
           * `role="combobox"` — because a textbox may not be expanded.
           *
           * `aria-expanded` and `aria-haspopup` are not allowed on an
           * `<input type="text">`: its role is `textbox`, and a textbox has no
           * popup. axe reports it as `aria-allowed-attr`, critical. The field
           * IS a combobox — a text field with a popup — so it says so, and the
           * two attributes become legal instead of decorative.
           */
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          leftIcon={<LiminalIcon icon={CalendarIcon} size="sm" weight="regular" />}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        />
      </div>

      {isOpen && !disabled && (
        <LiminalPortal>
          <div
            ref={floatingRef as React.RefObject<HTMLDivElement>}
            role="dialog"
            aria-modal="true"
            data-liminal-mist=""
            style={{
              position: 'fixed',
              top: `${position.y}px`,
              left: `${position.x}px`,
              zIndex: 1000,
              ...mistCssVars('popover'),
              borderRadius: `${LiminalLayoutEngine.RADIUS.card}px`,
              boxSizing: 'border-box',
            }}
          >
            <Calendar
              mode={mode}
              selectedDate={selected}
              onSelectDate={handleSelect}
            />
          </div>
        </LiminalPortal>
      )}
    </div>
  );
}

export default DatePicker;
