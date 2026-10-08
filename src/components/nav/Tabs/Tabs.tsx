import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import type { CSSProperties, ReactNode, KeyboardEvent } from 'react';
import {
  getLiminalStyle,
  getDirectionalRim,
  getLadderColor,
  getTextStyle,
} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { useRovingTabIndex } from '../../../engine/liminal-hooks';

interface TabsContextType {
  activeValue: string;
  onChange: (val: string) => void;
  registerTabRef: (val: string, ref: HTMLButtonElement | null) => void;
  tabValues: string[];
  keyboardMode: boolean;
  setKeyboardMode: (val: boolean) => void;
  getItemProps: (index: number) => {
    tabIndex: number;
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  };
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
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  if (!context) {
    throw new Error('Tab must be rendered inside a Tabs component');
  }

  const {
    activeValue,
    onChange,
    keyboardMode,
    setKeyboardMode,
    tabValues,
    getItemProps,
    registerTabRef,
  } = context;

  const isActive = activeValue === value;
  const tabIndexInList = tabValues.indexOf(value);
  const rovingProps = getItemProps(tabIndexInList >= 0 ? tabIndexInList : 0);

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

  // When tab becomes active in keyboard navigation mode
  useEffect(() => {
    if (!keyboardMode) return;
    if (isActive) {
      setIsKeyboardFocused(true);
    }
  }, [isActive, keyboardMode]);

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

  const setButtonNode = useCallback(
    (el: HTMLButtonElement | null) => {
      buttonRef.current = el;
      registerTabRef(value, el);
    },
    [registerTabRef, value]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Tab') {
      setIsKeyboardFocused(true);
      setKeyboardMode(true);
    }
    rovingProps.onKeyDown(e);
  };

  return (
    <button
      ref={setButtonNode}
      data-tab-value={value}
      type="button"
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      tabIndex={rovingProps.tabIndex}
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
      onFocus={() => {
        if (keyboardMode) setIsKeyboardFocused(true);
      }}
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

function extractTabValues(children: ReactNode): string[] {
  const values: string[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if ((child.props as any)?.value !== undefined) {
      values.push(String((child.props as any).value));
    } else if ((child.props as any)?.children) {
      values.push(...extractTabValues((child.props as any).children));
    }
  });
  return values;
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
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const RADIUS = LiminalLayoutEngine.RADIUS;

  const tabValues = useMemo(() => {
    if (Array.isArray(items)) {
      return items.map((it) => it.id);
    }
    return extractTabValues(children);
  }, [items, children]);

  const registerTabRef = useCallback((tabVal: string, ref: HTMLButtonElement | null) => {
    if (ref) {
      tabRefs.current.set(tabVal, ref);
    } else {
      tabRefs.current.delete(tabVal);
    }
  }, []);

  const currentActiveIndex = Math.max(0, tabValues.indexOf(value));

  // Primitive Hook: useRovingTabIndex
  const { getItemProps } = useRovingTabIndex(
    tabValues,
    currentActiveIndex,
    {
      loop: true,
      orientation: 'both',
      onSelect: (nextIndex) => {
        const nextVal = tabValues[nextIndex];
        if (nextVal) {
          setKeyboardMode(true);
          onChange(nextVal);
          const el = tabRefs.current.get(nextVal);
          if (el) {
            el.focus();
          } else {
            containerRef.current
              ?.querySelector<HTMLButtonElement>(`button[data-tab-value="${nextVal}"]`)
              ?.focus();
          }
        }
      },
    }
  );

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

  const safeItems = Array.isArray(items) ? items : null;

  return (
    <TabsContext.Provider
      value={{
        activeValue: value,
        onChange,
        registerTabRef,
        tabValues,
        keyboardMode,
        setKeyboardMode,
        getItemProps,
      }}
    >
      <div
        ref={containerRef}
        role="tablist"
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
