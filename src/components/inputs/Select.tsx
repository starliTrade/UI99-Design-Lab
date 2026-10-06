import React, { useState, useRef, useEffect } from 'react';
import { getLiminalStyle, SpecEngine, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  hint?: string;
}

export interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  className?: string;
}

export function Select({
  label,
  options,
  value,
  onChange,
  disabled = false,
  fullWidth = true,
  placeholder = 'Select option...',
  className = '',
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerStyle = getLiminalStyle({
    surfaceLevel: 2,
    containerLevel: 1,
    interactive: true,
    state: disabled ? 'disabled' : isOpen ? 'focus' : 'idle',
  });

  const menuStyle = getLiminalStyle({
    surfaceLevel: 4,
    isFloating: true,
    elevation: 1,
    isContainer: true,
  });

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col gap-1.5 ${fullWidth ? 'w-full' : 'inline-flex'} ${className}`}
    >
      {label && (
        <label
          className="font-mono text-[11px] uppercase tracking-wider select-none"
          style={getTextStyle('tertiary', 1)}
        >
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between h-[42px] px-3.5 font-mono text-xs select-none transition-all cursor-pointer"
        style={{
          ...triggerStyle.style,
          borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
        }}
      >
        <span
          className="truncate"
          style={{
            color: selectedOption
              ? SpecEngine.getTextStyle('primary', 2).color
              : SpecEngine.getTextStyle('quaternary', 2).color,
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          style={{ color: SpecEngine.getTextStyle('tertiary', 2).color }}
        />
      </button>

      {isOpen && (
        <div
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 p-1.5 space-y-0.5 font-mono text-xs max-h-60 overflow-y-auto animate-in fade-in-50 duration-150"
          style={{
            ...menuStyle.style,
            borderRadius: `${LiminalLayoutEngine.RADIUS.card}px`,
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-all cursor-pointer"
                style={{
                  background: isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  color: isSelected
                    ? LiminalColorEngine.BRAND_PRIMARY.hex
                    : SpecEngine.getTextStyle('secondary', 4).color,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = SpecEngine.HALF_STEPS[4.5];
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div className="flex flex-col">
                  <span>{opt.label}</span>
                  {opt.hint && (
                    <span
                      className="text-[10px]"
                      style={{ color: SpecEngine.getTextStyle('quaternary', 4).color }}
                    >
                      {opt.hint}
                    </span>
                  )}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#34C08B]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
