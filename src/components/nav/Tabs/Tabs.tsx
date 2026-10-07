import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { CSSProperties, ReactNode, KeyboardEvent, MouseEvent } from 'react';
import {
  getLiminalStyle,
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

interface TabsContextType {
  activeValue: string;
  onChange: (val: string) => void;
  registerTab: (val: string, ref: HTMLButtonElement | null) => void;
  tabValues: string[];
  keyboardMode: boolean;
  setKeyboardMode: (val: boolean) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}

export interface TabProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function Tab({
  value,
  children,
  disabled = false,
  className = '',
  style: customStyle = {},
}: TabProps) {
  const context = useContext(TabsContext);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isKeyboardFocused, setIsKeyboardFocused] = useState<boolean>(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  if (!context) {
    throw new Error('Tab must be rendered inside a Tabs component');
  }

  const { activeValue, onChange, keyboardMode, setKeyboardMode } = context;
  const isActive = activeValue === value;

  // Active state: Surface 3 with Rim 2 and micro E1 shadow
  const activeRim = getDirectionalRim(3, 2, false);

  let bg = 'transparent';
  let color = getTextStyle('tertiary', 1).color;
  let shadow = 'none';

  if (isActive) {
    bg = activeRim ? activeRim.cssBackground : getLadderColor(3);
    color = getTextStyle('primary', 1).color;
    shadow = '0 1px 3px rgba(1, 2, 3, 0.22)'; // Micro E1 elevation per LIMINAL spec
  } else if (isHovered && !disabled) {
    color = getTextStyle('secondary', 1).color;
  }

  // Effect 1: When this tab becomes active in keyboard mode, activate outline
  useEffect(() => {
    const el = buttonRef.current;
    if (!el || !keyboardMode) return;
    if (isActive) {
      setIsKeyboardFocused(true);
    }
  }, [isActive, keyboardMode]);

  // Effect 2: When tab receives native focus during keyboard mode, set isKeyboardFocused
  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const onFocus = () => {
      if (keyboardMode) setIsKeyboardFocused(true);
    };
    el.addEventListener('focus', onFocus);
    return () => el.removeEventListener('focus', onFocus);
  }, [keyboardMode]);

  const tabStyle: CSSProperties = {
    padding: '8px 16px',
    borderRadius: `${RADIUS[8]}px`, // 8px
    fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    fontFamily: 'inherit',
    fontWeight: 500,
    border: '1px solid transparent',
    background: bg,
    color,
    boxShadow: shadow,
    opacity: disabled ? 0.35 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    outline: isKeyboardFocused ? `2px solid ${getLadderColor(4)}` : 'none',
    outlineOffset: '2px',
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    boxSizing: 'border-box',
    ...customStyle,
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Tab') {
      setIsKeyboardFocused(true);
      setKeyboardMode(true);
    }
  };

  return (
    <button
      ref={(el) => {
        buttonRef.current = el;
        context.registerTab(value, el);
      }}
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      tabIndex={isActive ? 0 : -1}
      className={className}
      style={tabStyle}
      onClick={() => !disabled && onChange(value)}
      onKeyDown={handleKeyDown}
      onMouseDown={() => {
        setIsKeyboardFocused(false);
        setKeyboardMode(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onBlur={() => setIsKeyboardFocused(false)}
    >
      {children}
    </button>
  );
}

export interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children?: ReactNode;
  items?: TabItem[];
  fullWidth?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  style?: CSSProperties;
}

export function Tabs({
  value,
  onChange,
  children,
  items,
  fullWidth = false,
  size = 'md',
  className = '',
  style: customStyle = {},
}: TabsProps) {
  const [keyboardMode, setKeyboardMode] = useState<boolean>(false);

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const tabValuesOrder = useRef<string[]>([]);

  const registerTab = (tabVal: string, ref: HTMLButtonElement | null) => {
    if (ref) {
      tabRefs.current.set(tabVal, ref);
      if (!tabValuesOrder.current.includes(tabVal)) {
        tabValuesOrder.current.push(tabVal);
      }
    } else {
      tabRefs.current.delete(tabVal);
      tabValuesOrder.current = tabValuesOrder.current.filter((v) => v !== tabVal);
    }
  };

  // Container: Surface 1 with Rim 1, flat zero shadow
  const limStyle = getLiminalStyle({
    surfaceLevel: 1,
    isContainer: true,
    interactive: false,
    state: 'idle',
  });

  const containerStyle: CSSProperties = {
    ...limStyle.style,
    boxShadow: 'none', // Strictly no shadow for tabs container
    borderRadius: `${RADIUS.control}px`, // 10px
    display: fullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    gap: '2px',
    padding: '4px',
    boxSizing: 'border-box',
    width: fullWidth ? '100%' : 'auto',
    maxWidth: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    ...customStyle,
  };

  // Arrow navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const values = tabValuesOrder.current;
    if (values.length === 0) return;

    const currentIndex = values.indexOf(value);
    let nextIndex = -1;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      nextIndex = currentIndex < values.length - 1 ? currentIndex + 1 : 0;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      nextIndex = currentIndex > 0 ? currentIndex - 1 : values.length - 1;
    } else if (e.key === 'Home') {
      e.preventDefault();
      nextIndex = 0;
    } else if (e.key === 'End') {
      e.preventDefault();
      nextIndex = values.length - 1;
    }

    if (nextIndex >= 0) {
      const nextVal = values[nextIndex];
      setKeyboardMode(true);
      onChange(nextVal);
      tabRefs.current.get(nextVal)?.focus();
    }
  };

  const safeItems = Array.isArray(items) ? items : null;

  return (
    <TabsContext.Provider
      value={{
        activeValue: value,
        onChange,
        registerTab,
        tabValues: tabValuesOrder.current,
        keyboardMode,
        setKeyboardMode,
      }}
    >
      <div
        role="tablist"
        onKeyDown={handleKeyDown}
        className={className}
        style={containerStyle}
      >
        {safeItems
          ? safeItems.map((item) => (
              <Tab
                key={item.id}
                value={item.id}
                disabled={item.disabled}
                style={fullWidth ? { flex: 1 } : undefined}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
                {item.badge && <span>{item.badge}</span>}
              </Tab>
            ))
          : children}
      </div>
    </TabsContext.Provider>
  );
}

Tabs.Tab = Tab;

export default Tabs;
