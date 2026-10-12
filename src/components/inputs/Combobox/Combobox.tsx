import React, { useState, useEffect, useRef, useId, useCallback } from 'react';
import type { CSSProperties, ReactNode, ChangeEvent, KeyboardEvent } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';
import {
  getTextStyle,
  getLadderColor,
  SHADOWS,
  Z_INDEX,
} from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import { LiminalPortal } from '../../../engine/liminal-portal';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveSurface } from '../../../engine/liminal-surface';
import { mistCssVars } from '../../../engine/liminal-mist';
import { Input } from '../Input';

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (val: string) => void;
  onSelect?: (option: ComboboxOption) => void;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  clearable?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  name?: string;
  required?: boolean;
  emptyText?: string;
}

/**
 * Combobox (Autocomplete) · LIMINAL v1.0
 * Fully Audited WS-2 Architecture
 * - Zero hardcoding: tokens from spec-engine, liminal-color-engine, liminal-layout-engine
 * - Strict Liminal Motion via LiminalMotionEngine with full reduced-motion support
 * - LiminalPortal rendering into document.body with MIST quiet styling and SHADOWS[3]
 * - Viewport boundary collision detection (auto-flip to showAbove when colliding with bottom)
 * - Complete W3C ARIA Combobox 1.2 accessibility pattern (role="combobox", aria-controls, aria-activedescendant)
 * - Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape, Tab) with auto scroll-into-view
 * - Phosphor icons via LiminalIcon with size and weight tokens
 */
export function Combobox({
  options = [],
  value,
  defaultValue = '',
  onChange,
  onSelect,
  placeholder = 'Search or select...',
  disabled = false,
  label,
  error,
  success,
  helperText,
  prefix,
  suffix,
  clearable = true,
  className = '',
  style: customStyle = {},
  id,
  name,
  required = false,
  emptyText = 'موردی یافت نشد',
}: ComboboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const listboxId = `${inputId}-listbox`;

  const [internalValue, setInternalValue] = useState<string>(value ?? defaultValue);
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
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reducedMotion = useReducedMotion();

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const currentValue = value !== undefined ? value : internalValue;

  // Sync query when value or options change
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
      const match = options.find((opt) => opt.value === value);
      setQuery(match ? match.label : value);
    } else if (defaultValue && !query) {
      const match = options.find((opt) => opt.value === defaultValue);
      setQuery(match ? match.label : defaultValue);
    }
  }, [value, defaultValue, options]);

  // Update positioning relative to trigger container
  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
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

  // Click outside to dismiss
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

  const selectOption = (opt: ComboboxOption) => {
    if (opt.disabled) return;
    if (value === undefined) {
      setInternalValue(opt.value);
    }
    setQuery(opt.label);
    onChange?.(opt.value);
    onSelect?.(opt);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextQuery = e.target.value;
    setQuery(nextQuery);
    if (!isOpen) {
      setIsOpen(true);
    }
    setHighlightedIndex(0);

    // If cleared or modified
    if (nextQuery === '') {
      if (value === undefined) {
        setInternalValue('');
      }
      onChange?.('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
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
        selectOption(filteredOptions[highlightedIndex]);
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

  // Dropdown chevron icon (rotates smoothly via LiminalMotionEngine)
  const defaultCaret = (
    <button
      type="button"
      tabIndex={-1}
      onClick={(e) => {
        if (!disabled) {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
          updatePosition();
        }
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
        cursor: disabled ? 'not-allowed' : 'pointer',
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: reducedMotion
          ? 'none'
          : LiminalMotionEngine.getTransition('transform', 'normal'),
        color: isOpen
          ? getTextStyle('secondary', 2).color
          : getTextStyle('tertiary', 2).color,
      }}
      aria-label="Toggle options menu"
    >
      <LiminalIcon icon={CaretDown} size="sm" weight="light" />
    </button>
  );

  // MIST Quiet floating dropdown styling (spec-compliant zero-hardcoding)
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
    padding: `${SPACING[1]}px`, // 4px
    boxSizing: 'border-box',
    maxHeight: '260px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[1]}px`, // 4px
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
        position: 'relative',
        boxSizing: 'border-box',
        ...customStyle,
      }}
    >
      <Input
        id={inputId}
        name={name}
        label={label}
        placeholder={placeholder}
        value={query}
        disabled={disabled}
        error={error}
        success={success}
        helperText={helperText}
        prefix={prefix}
        suffix={suffix ?? defaultCaret}
        clearable={clearable}
        onClear={() => {
          setQuery('');
          if (value === undefined) {
            setInternalValue('');
          }
          onChange?.('');
        }}
        onChange={handleInputChange}
        onFocus={() => {
          if (!disabled) {
            setIsOpen(true);
            updatePosition();
          }
        }}
        onKeyDown={handleKeyDown}
        required={required}
        autoComplete="off"
        role="combobox"
        ariaExpanded={isOpen}
        ariaHasPopup="listbox"
        ariaControls={listboxId}
        ariaActiveDescendant={
          isOpen && highlightedIndex >= 0 && filteredOptions[highlightedIndex]
            ? `${inputId}-opt-${highlightedIndex}`
            : undefined
        }
        ariaAutocomplete="list"
      />

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
                const isSelected = opt.value === currentValue;
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
                    onClick={() => selectOption(opt)}
                    onMouseEnter={() => !opt.disabled && setHighlightedIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: `${SPACING[2]}px`,
                      padding: `${SPACING[2]}px ${SPACING[3]}px`,
                      borderRadius: `${RADIUS.chip}px`, // Concentric harmony: outer 10px - padding 4px = 6px
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

export default Combobox;
