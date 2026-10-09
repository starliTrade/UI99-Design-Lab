import React, { useState, useRef, useEffect } from 'react';
import type { CSSProperties, KeyboardEvent } from 'react';
import {
  getLiminalStyle,
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
  SHADOWS,
  LADDER,
  LiminalState,
} from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalComponentEngine } from '../../../engine/liminal-component-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  hint?: string;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  name?: string;
  id?: string;
  className?: string;
  style?: CSSProperties;
}

export function Select({
  label,
  placeholder = 'Select an option...',
  options,
  value,
  defaultValue,
  onChange,
  disabled = false,
  error,
  name,
  id,
  className = '',
  style: customStyle = {},
}: SelectProps) {
  const [internalValue, setInternalValue] = useState<string>(
    value ?? defaultValue ?? ''
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [internalState, setInternalState] = useState<LiminalState>('idle');
  const [isKeyboardFocused, setIsKeyboardFocused] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const currentValue = value !== undefined ? value : internalValue;
  const selectedOption = options.find((opt) => opt.value === currentValue);

  const currentState: LiminalState = disabled ? 'disabled' : internalState;

  // Resolve base interactive style from engine
  const limStyle = getLiminalStyle({
    surfaceLevel: 2,
    interactive: true,
    isInput: true,
    state: currentState,
  });

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus ring via engine
  const ringColor = error ? SEMANTICS.DANGER.solid : LiminalColorEngine.BRAND_PRIMARY.hex;
  const focusRing = LiminalComponentEngine.getFocusRing(
    currentState === 'focus' && isKeyboardFocused,
    ringColor
  );

  // Background and border resolution
  let background = limStyle.style.background;
  let border = limStyle.style.border;

  if (!disabled && error) {
    border = `1px solid ${SEMANTICS.DANGER.border}`;
    const baseRim = getDirectionalRim(2, 2, false);
    if (baseRim) {
      background = `linear-gradient(rgba(229, 99, 122, 0.08), rgba(229, 99, 122, 0.08)), ${baseRim.cssBackground}`;
    }
  }

  const triggerStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    minHeight: '44px',
    padding: '10px 36px 10px 14px', // room for arrow
    borderRadius: `${RADIUS.control}px`,
    boxSizing: 'border-box',
    transition: LiminalMotionEngine.TRANSITION.slow,
    background,
    border,
    ...focusRing,
    opacity: limStyle.style.opacity,
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative',
    textAlign: 'left',
    userSelect: 'none',
  };

  const labelStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[2].fs}px`,
    letterSpacing: TYPOGRAPHY[2].ls,
    fontWeight: TYPOGRAPHY[2].weight,
    color: getTextStyle('tertiary', 2).color,
    userSelect: 'none',
    marginBottom: `${SPACING[2]}px`, // 8px
  };

  const errorStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[1].fs}px`,
    letterSpacing: TYPOGRAPHY[1].ls,
    color: SEMANTICS.DANGER.text,
    marginTop: `${SPACING[1]}px`, // 4px
  };

  // Dropdown menu style: Surface 3 with Rim 2 and Sub-Canvas Shadow E1
  const dropdownRim = getDirectionalRim(3, 2, false);
  const dropdownStyle: CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    zIndex: 50,
    background: dropdownRim ? dropdownRim.cssBackground : LADDER[3],
    border: dropdownRim ? '1px solid transparent' : 'none',
    boxShadow: SHADOWS[1],
    borderRadius: `${RADIUS.control}px`,
    padding: '4px',
    overflow: 'hidden',
    boxSizing: 'border-box',
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    if (e.key === 'Tab') {
      setIsKeyboardFocused(true);
      return;
    }

    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && options[highlightedIndex]) {
        const opt = options[highlightedIndex];
        if (!opt.disabled) {
          selectOption(opt.value);
        }
      } else {
        setIsOpen(!isOpen);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < options.length - 1 ? prev + 1 : 0
        );
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(options.length - 1);
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : options.length - 1
        );
      }
      return;
    }
  };

  const selectOption = (optValue: string) => {
    if (value === undefined) {
      setInternalValue(optValue);
    }
    onChange?.(optValue);
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative',
        boxSizing: 'border-box',
        ...customStyle,
      }}
    >
      {label && <label htmlFor={id} style={labelStyle}>{label}</label>}

      {/* Hidden input for forms */}
      <input type="hidden" name={name} value={currentValue} />

      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={triggerStyle}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        onMouseDown={() => setIsKeyboardFocused(false)}
        onMouseEnter={() => !disabled && internalState !== 'focus' && setInternalState('hover')}
        onMouseLeave={() => !disabled && internalState !== 'focus' && setInternalState('idle')}
        onFocus={() => !disabled && setInternalState('focus')}
        onBlur={() => {
          setInternalState('idle');
          setIsKeyboardFocused(false);
        }}
      >
        <span
          style={{
            fontSize: `${TYPOGRAPHY[3].fs}px`,
            color: selectedOption
              ? getTextStyle('primary', 2).color
              : getTextStyle('quaternary', 2).color,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        {/* Chevron Icon */}
        <span
          style={{
            position: 'absolute',
            right: '14px',
            top: '50%',
            transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
            transition: LiminalMotionEngine.getTransition('transform', 'normal'),
            color: getTextStyle('tertiary', 2).color,
            display: 'inline-flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2.5 4.5L6 8L9.5 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div role="listbox" style={dropdownStyle}>
          {options.map((opt, index) => {
            const isSelected = opt.value === currentValue;
            const isHighlighted = index === highlightedIndex;

            let optBg = 'transparent';
            let optBorder = 'none';

            if (isSelected) {
              const selectedRim = getDirectionalRim(4, 1, false);
              optBg = selectedRim ? selectedRim.cssBackground : getLadderColor(4);
              optBorder = selectedRim ? '1px solid transparent' : 'none';
            } else if (isHighlighted) {
              optBg = getLadderColor(3.5); // half-step S3.5
            }

            return (
              <div
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                aria-disabled={opt.disabled}
                onClick={() => {
                  if (!opt.disabled) {
                    selectOption(opt.value);
                  }
                }}
                onMouseEnter={() => !opt.disabled && setHighlightedIndex(index)}
                style={{
                  padding: '8px 12px',
                  borderRadius: `${RADIUS[8]}px`, // 8px
                  color: isSelected
                    ? getTextStyle('primary', 3).color
                    : getTextStyle('secondary', 3).color,
                  fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
                  fontWeight: isSelected ? 500 : 400,
                  cursor: opt.disabled ? 'not-allowed' : 'pointer',
                  opacity: opt.disabled ? 0.35 : 1,
                  background: optBg,
                  border: optBorder,
                  transition: LiminalMotionEngine.getTransition('background', 'fast'),
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                }}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2.5 6L5 8.5L9.5 3.5"
                      stroke={SEMANTICS.SUCCESS.solid}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}

      {error && <span style={errorStyle}>{error}</span>}
    </div>
  );
}

export default Select;
