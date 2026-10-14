import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import type { CSSProperties, ReactNode, ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { CaretDown, Check, X } from '@phosphor-icons/react';
import {
  getTextStyle,
  SHADOWS,
  Z_INDEX,
  LiminalState,
} from '../../../engine/spec-engine';
import { resolveSurface, resolveBorder, resolveInteractionVars, ROLE_LEVEL } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalComponentEngine } from '../../../engine/liminal-component-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import { LiminalPortal } from '../../../engine/liminal-portal';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { mistCssVars } from '../../../engine/liminal-mist';
import { Badge } from '../../atoms/Badge';

/** A layout decision this component owns, not a system token. */
const MENU_MAX_HEIGHT = 260;
/** A layout decision this component owns, not a system token. */
const TAG_MIN_WIDTH = 60;

export interface MultiSelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  value?: string[];
  defaultValue?: string[];
  onChange?: (vals: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  prefix?: ReactNode;
  clearable?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  name?: string;
  required?: boolean;
  emptyText?: string;
}

/**
 * MultiSelect (Chip-based) · LIMINAL v1.0
 * WS-3 Multi-Select Architecture
 * - Container matching Input with rim and focus ring around the whole component
 * - Chips rendered as Liminal Badges with variant="info"
 * - Removable chips with Phosphor X icon (size="xs")
 * - Backspace on empty input removes the trailing chip
 * - Small inline input for typing and filtering
 * - Dropdown panel via LiminalPortal + MIST quiet + SHADOWS[3]
 * - Selected items show Check icon + highlighted style; clicking toggles selection
 * - Full W3C ARIA accessibility: role="combobox", , aria-expanded
 */
export function MultiSelect({
  options = [],
  value,
  defaultValue = [],
  onChange,
  placeholder = 'Select items...',
  disabled = false,
  label,
  error,
  success,
  helperText,
  prefix,
  clearable = true,
  className = '',
  style: customStyle = {},
  id,
  name,
  required = false,
  emptyText = 'موردی یافت نشد',
}: MultiSelectProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-listbox`;

  const [internalValues, setInternalValues] = useState<string[]>(value ?? defaultValue);
  const [query, setQuery] = useState<string>('');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
    showAbove: boolean;
  }>({
    top: 0,
    left: 0,
    width: 0,
    showAbove: false,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const fieldWrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  const SPACING = LiminalLayoutEngine.SPACING;

  const CONTROL = LiminalLayoutEngine.CONTROL;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  // The text sits on the surface that HOSTS the field, not on the field.
  // `surfaceLevel` below is a hand-picked pair for the validation tint's
  // rim and is recorded for gap 8 (21 hand-picked numbers).
  const surfaceLevel = 2;

  const currentValues = value !== undefined ? value : internalValues;

  useEffect(() => {
    if (value !== undefined) {
      setInternalValues(value);
    }
  }, [value]);

  // Update positioning relative to trigger wrapper
  const updatePosition = useCallback(() => {
    if (!fieldWrapperRef.current) return;
    const rect = fieldWrapperRef.current.getBoundingClientRect();
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const spaceBelow = viewportHeight - rect.bottom;
    const showAbove = spaceBelow < 280 && rect.top > 280;

    setCoords({
      top: showAbove ? rect.top - SPACING[2] : rect.bottom + SPACING[2],
      left: rect.left,
      width: rect.width,
      showAbove,
    });
  }, [SPACING]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => {
        updatePosition();
      };
      window.addEventListener('scroll', handleScrollOrResize, true);
      window.addEventListener('resize', handleScrollOrResize);
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true);
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isOpen, updatePosition]);

  // Dismiss on click outside
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent | globalThis.MouseEvent) => {
      const targetNode = event.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(targetNode) &&
        panelRef.current &&
        !panelRef.current.contains(targetNode)
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

  // Filter options based on typed query
  const filteredOptions = query.trim() === ''
    ? options
    : options.filter((opt) =>
        opt.label.toLowerCase().includes(query.toLowerCase()) ||
        opt.value.toLowerCase().includes(query.toLowerCase())
      );

  // Auto scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && optionRefs.current[highlightedIndex]) {
      optionRefs.current[highlightedIndex]?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [isOpen, highlightedIndex]);

  const handleRemove = (valToRemove: string) => {
    if (disabled) return;
    const updated = currentValues.filter((v) => v !== valToRemove);
    if (value === undefined) {
      setInternalValues(updated);
    }
    onChange?.(updated);
    inputRef.current?.focus();
  };

  const handleClearAll = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (disabled) return;
    if (value === undefined) {
      setInternalValues([]);
    }
    onChange?.([]);
    setQuery('');
    inputRef.current?.focus();
  };

  const toggleOption = (opt: MultiSelectOption) => {
    if (opt.disabled || disabled) return;
    const isSelected = currentValues.includes(opt.value);
    const updated = isSelected
      ? currentValues.filter((v) => v !== opt.value)
      : [...currentValues, opt.value];

    if (value === undefined) {
      setInternalValues(updated);
    }
    onChange?.(updated);
    setQuery('');
    inputRef.current?.focus();
    updatePosition();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
      updatePosition();
    }
    setHighlightedIndex(0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'Backspace' && query === '' && currentValues.length > 0) {
      // Remove trailing badge
      const lastVal = currentValues[currentValues.length - 1];
      handleRemove(lastVal);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        updatePosition();
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        updatePosition();
        setHighlightedIndex(Math.max(0, filteredOptions.length - 1));
      } else {
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      }
      return;
    }

    if (e.key === 'Enter') {
      if (isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        e.preventDefault();
        toggleOption(filteredOptions[highlightedIndex]);
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      return;
    }

    if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  // State & Style resolution

  // The interaction states are CSS's job now (:hover, :focus-within).
  const host = useHostSurface();
  const idleSurface = resolveSurface({ role: 'control', on: host }).background;

  const ringColor = error
    ? SEMANTICS.DANGER.solid
    : success
    ? SEMANTICS.SUCCESS.solid
    : LiminalColorEngine.BRAND_PRIMARY.hex;


  let background = idleSurface;
  let borderColor = resolveBorder({ role: 'control', kind: 'edge', on: host });

  if (!disabled) {
    if (error) {
      borderColor = SEMANTICS.DANGER.border;
      const baseRim = resolveSurface({ role: 'control', on: host }).rimColors;
      if (baseRim) {
        // The engine's own subtle tint, not a colour invented here. Two of these
        // were hand-picked (#e5637a and #34c08b) and copied into four
        // components — colours that exist nowhere in the engine.
        background = `linear-gradient(${LiminalColorEngine.SEMANTICS.DANGER.subtle}, ${LiminalColorEngine.SEMANTICS.DANGER.subtle}), ${baseRim.cssBackground}`;
      }
    } else if (success) {
      borderColor = SEMANTICS.SUCCESS.border;
      const baseRim = resolveSurface({ role: 'control', on: host }).rimColors;
      if (baseRim) {
        background = `linear-gradient(${LiminalColorEngine.SEMANTICS.SUCCESS.subtle}, ${LiminalColorEngine.SEMANTICS.SUCCESS.subtle}), ${baseRim.cssBackground}`;
      }
    }
  }

  // Field Wrapper Container style (matches Input.tsx with flex wrap for chips)
  const fieldWrapperStyle: CSSProperties = {
    // The layer owns the surface AND the border colour. This wrapper opted into
    // `data-liminal-focus-within` and published NONE of the six variables, so
    // the rule it opted into resolved to `transparent` — and the inline
    // `background` and `border` below beat it anyway. The focus state was inert.
    ...resolveInteractionVars({
      role: 'control',
      on: host,
      idle: background,
      frozen: disabled || error || success ? background : undefined,
      border: borderColor,
      borderFocus: ringColor,
    }),
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: `${SPACING[2]}px`, // 8px
    padding: `${SPACING[2]}px ${SPACING[3]}px`, // 8px 12px
    minHeight: CONTROL.md,
    borderRadius: `${RADIUS.control}px`, // 10px
    boxSizing: 'border-box',
    width: '100%',
    transition: reducedMotion ? 'none' : LiminalMotionEngine.TRANSITION.slow,
    // Only the width and style. `borderColor` belongs to the layer, which
    // changes it on focus — an inline shorthand would cancel that too.
    borderWidth: 1,
    borderStyle: 'solid',
    opacity: disabled ? 0.5 : 1,
    cursor: disabled ? 'not-allowed' : 'text',
    position: 'relative',
  };

  const labelStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
    lineHeight: TYPOGRAPHY[2].lh,
    letterSpacing: TYPOGRAPHY[2].ls,
    fontWeight: 500,
    color: getTextStyle('secondary', ROLE_LEVEL[host]).color,
    marginBottom: `${SPACING[1]}px`,
    userSelect: 'none',
  };

  const helperStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(1),
    lineHeight: TYPOGRAPHY[1].lh,
    letterSpacing: TYPOGRAPHY[1].ls,
    color: error
      ? SEMANTICS.DANGER.text
      : success
      ? SEMANTICS.SUCCESS.text
      : getTextStyle('tertiary', ROLE_LEVEL[host]).color,
    marginTop: `${SPACING[1]}px`,
  };

  // MIST Quiet floating dropdown styling
  const mistVars = mistCssVars('menu');

  const panelStyle: CSSProperties = {
    position: 'fixed',
    top: `${coords.top}px`,
    left: `${coords.left}px`,
    width: `${coords.width}px`,
    transform: coords.showAbove ? 'translateY(-100%)' : 'none',
    ...mistVars,
    zIndex: Z_INDEX.floating,
    borderRadius: `${RADIUS.control}px`,
    padding: `${SPACING[1]}px`,
    boxSizing: 'border-box',
    maxHeight: MENU_MAX_HEIGHT,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[1]}px`,
    pointerEvents: 'auto',
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        ...customStyle,
      }}
    >
      {label && (
        <label htmlFor={inputId} style={labelStyle}>
          {label}
        </label>
      )}

      <div
        ref={fieldWrapperRef}
        role="combobox"
        aria-expanded={isOpen}
        
        aria-haspopup="listbox"
        aria-controls={listboxId}
        style={fieldWrapperStyle}
        onClick={() => {
          if (!disabled) {
            inputRef.current?.focus();
            if (!isOpen) {
              setIsOpen(true);
              updatePosition();
            }
          }
        }}
        // The wrapper publishes all six variables through the producer.
        // `data-liminal-surface` gives hover and the idle fill;
        // `data-liminal-focus-within` gives focus.
        data-liminal-surface=""
        data-liminal-focus-within=""
        data-liminal-disabled={disabled ? "" : undefined}
      >
        {prefix && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              color: getTextStyle('tertiary', ROLE_LEVEL[host]).color,
              flexShrink: 0,
            }}
          >
            {prefix}
          </span>
        )}

        {/* Selected Chips rendered via Liminal Badge */}
        {currentValues.map((val) => {
          const match = options.find((opt) => opt.value === val);
          const chipLabel = match ? match.label : val;

          return (
            <Badge
              key={val}
              variant="info"
              role="option"
              aria-selected="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: `${SPACING[1]}px`,
                padding: `${SPACING[0]}px ${SPACING[2]}px`,
                fontSize: LiminalLayoutEngine.getTypeSizeCss(1),
                cursor: disabled ? 'not-allowed' : 'default',
              }}
            >
              <span>{chipLabel}</span>
              {!disabled && (
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label={`Remove ${chipLabel}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(val);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    color: 'inherit',
                    opacity: 0.75,
                    transition: reducedMotion
                      ? 'none'
                      : LiminalMotionEngine.getTransition('opacity', 'fast'),
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.75')}
                >
                  <LiminalIcon icon={X} size="xs" weight="bold" />
                </button>
              )}
            </Badge>
          );
        })}

        {/* Inline input for filtering and typing */}
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          value={query}
          placeholder={currentValues.length === 0 ? placeholder : ''}
          disabled={disabled}
          required={required && currentValues.length === 0}
          autoComplete="off"
          aria-autocomplete="list"
          aria-activedescendant={
            isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]
              ? `${inputId}-opt-${highlightedIndex}`
              : undefined
          }
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (!disabled) {
              setIsOpen(true);
              updatePosition();
            }
          }}
          style={{
            flex: 1,
            minWidth: TAG_MIN_WIDTH,
            border: 'none',
            background: 'transparent',
            outline: 'none',
            color: getTextStyle('primary', ROLE_LEVEL[host]).color,
            fontSize: LiminalLayoutEngine.getTypeSizeCss(3), // 16px
            lineHeight: TYPOGRAPHY[3].lh,
            fontFamily: 'inherit',
            padding: 0,
            margin: 0,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />

        {/* Clear all icon button */}
        {clearable && currentValues.length > 0 && !disabled && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClearAll}
            aria-label="Clear all selections"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              color: getTextStyle('tertiary', ROLE_LEVEL[host]).color,
              transition: reducedMotion
                ? 'none'
                : LiminalMotionEngine.getTransition('color', 'fast'),
            }}
          >
            <LiminalIcon icon={X} size="sm" weight="light" />
          </button>
        )}

        {/* CaretDown icon */}
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            if (!disabled) {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
              updatePosition();
              inputRef.current?.focus();
            }
          }}
          aria-label="Toggle options list"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: 0,
            margin: 0,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: reducedMotion
              ? 'none'
              : LiminalMotionEngine.getTransition('transform', 'normal'),
            color: isOpen
              ? getTextStyle('secondary', ROLE_LEVEL[host]).color
              : getTextStyle('tertiary', ROLE_LEVEL[host]).color,
          }}
        >
          <LiminalIcon icon={CaretDown} size="sm" weight="light" />
        </button>
      </div>

      {(error || success || helperText) && (
        <div style={helperStyle}>{error || success || helperText}</div>
      )}

      {isOpen && (
        <LiminalPortal>
          <div
            id={listboxId}
            ref={panelRef}
            role="listbox"
            aria-label={label ?? placeholder}
            data-liminal-mist=""
            style={panelStyle}
            onMouseDown={(e) => {
              // Prevent input from immediately blurring
              e.preventDefault();
            }}
          >

            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, index) => {
                const isSelected = currentValues.includes(opt.value);
                const isHighlighted = index === highlightedIndex;

                let optBg = 'transparent';
                let optColor = getTextStyle('secondary', 3).color;

                if (isSelected) {
                  optBg = resolveSurface({ role: 'menu', state: 'hover' }).background;
                  optColor = getTextStyle('primary', 3).color;
                } else if (isHighlighted) {
                  optBg = resolveSurface({ role: 'menu' }).background;
                  optColor = getTextStyle('primary', 3).color;
                }

                return (
                  <div
                    key={opt.value}
                    id={`${inputId}-opt-${index}`}
                    ref={(el) => {
                      optionRefs.current[index] = el;
                    }}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={opt.disabled}
                    onClick={() => toggleOption(opt)}
                    onMouseEnter={() => !opt.disabled && setHighlightedIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${SPACING[2]}px`,
                      padding: `${SPACING[2]}px ${SPACING[3]}px`,
                      borderRadius: `${RADIUS.chip}px`, // 6px concentric harmony
                      cursor: opt.disabled ? 'not-allowed' : 'pointer',
                      opacity: opt.disabled ? 0.35 : 1,
                      background: optBg,
                      color: optColor,
                      fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
                      fontWeight: isSelected ? TYPOGRAPHY[2].weight : 400,
                      userSelect: 'none',
                      transition: reducedMotion
                        ? 'none'
                        : LiminalMotionEngine.getTransition('background', 'fast'),
                      position: 'relative',
                      zIndex: 1,
                      boxSizing: 'border-box',
                    }}
                  >
                    {opt.icon && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          color: isSelected || isHighlighted
                            ? getTextStyle('primary', 3).color
                            : getTextStyle('tertiary', 3).color,
                        }}
                      >
                        {opt.icon}
                      </span>
                    )}

                    <span
                      style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {opt.label}
                    </span>

                    {isSelected && (
                      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <LiminalIcon
                          icon={Check}
                          size="xs"
                          weight="bold"
                          color={SEMANTICS.SUCCESS.solid}
                        />
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                style={{
                  padding: `${SPACING[3]}px ${SPACING[4]}px`,
                  textAlign: 'center',
                  fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
                  color: getTextStyle('tertiary', 3).color,
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {emptyText}
              </div>
            )}
          </div>
        </LiminalPortal>
      )}
    </div>
  );
}

export default MultiSelect;
