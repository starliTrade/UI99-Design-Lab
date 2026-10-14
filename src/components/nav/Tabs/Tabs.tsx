import React, { useId,
  createContext,
  useContext,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import type { CSSProperties, ReactNode, KeyboardEvent } from 'react';
import {getTextStyle,
  getFocusRing} from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { useRovingTabIndex } from '../../../engine/liminal-hooks';
import { resolveSurface, resolveInteractionVars } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import { REST_SHADOW } from '../../../engine/liminal-mist';

/** The gap between tabs: off the spacing scale, so it is named. */
const TAB_GAP = 6;

interface TabsContextType {
  activeValue: string;
  onChange: (val: string) => void;
  registerTabRef: (val: string, ref: HTMLButtonElement | null) => void;
  tabValues: string[];
  idPrefix: string;
  getItemProps: (index: number) => {
    tabIndex: number;
    onKeyDown: (e: KeyboardEvent<HTMLButtonElement>) => void;
  };
}

const TabsContext = createContext<TabsContextType | null>(null);
  const SPACING = LiminalLayoutEngine.SPACING;

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
  const host = useHostSurface();
  const context = useContext(TabsContext);
  const idPrefix = context?.idPrefix ?? '';
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  if (!context) {
    throw new Error('Tab must be rendered inside a Tabs component');
  }

  const {
    activeValue,
    onChange,
    tabValues,
    getItemProps,
    registerTabRef,
  } = context;

  const isActive = activeValue === value;
  const tabIndexInList = tabValues.indexOf(value);
  const rovingProps = getItemProps(tabIndexInList >= 0 ? tabIndexInList : 0);

  // Active state: Surface 3 with Rim 2 and micro E1 shadow
  const activeRim = resolveSurface({ role: 'panel' }).rimColors;

  let bg = 'transparent';
  let color = getTextStyle('tertiary', 1).color;
  let shadow = 'none';

  if (isActive) {
    bg = activeRim ? activeRim.cssBackground : resolveSurface({ role: 'control', state: 'active', on: host }).background;
    color = getTextStyle('primary', 1).color;
    shadow = REST_SHADOW; // an active tab is an object ON its surface, not a floating one
  }

  const SPACING = LiminalLayoutEngine.SPACING;

  const tabStyle = {
    // Hover brightens the label; the browser applies it, React does not re-render.
    // The layer owns `color`; see the base rule. Secondary equals tertiary
    // (both alpha 0.790), so the hover target is primary.
    '--liminal-hover-color': getTextStyle('primary', 1).color,
    // The surface half of the opt-in. Without these the layer's base rule
    // resolved to nothing and the inline `background` below was the only
    // background — which also cancelled the hover.
    //
    // An active tab keeps its raised surface in EVERY state; an inactive one
    // lies flat on the bar, lifts on hover, and sinks below the bar on press.
    ...resolveInteractionVars({
      role: 'control',
      on: host,
      idle: bg,
      frozen: isActive ? bg : undefined,
    }),
    padding: `${SPACING[2]}px ${SPACING[4]}px`,
    borderRadius: `${RADIUS[8]}px`, // 8px
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2), // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    fontFamily: 'inherit',
    fontWeight: 500,
    border: '1px solid transparent',
    '--liminal-color-idle': color,
    boxShadow: shadow,
    opacity: disabled ? 0.35 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: LiminalMotionEngine.TRANSITION.normal,
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: `${TAB_GAP}px`,
    whiteSpace: 'nowrap',
    flexShrink: 0,
    boxSizing: 'border-box',
    ...customStyle,
  } as CSSProperties;

  const setButtonNode = useCallback(
    (el: HTMLButtonElement | null) => {
      buttonRef.current = el;
      registerTabRef(value, el);
    },
    [registerTabRef, value]
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    rovingProps.onKeyDown(e);
  };

  return (
    <button
      ref={setButtonNode}
      data-tab-value={value}
      type="button"
      role="tab"
      id={`${idPrefix}-tab-${value}`}
      // The panel is not rendered by Tabs — the consumer renders it — so the
      // tab points at an id the consumer can produce with the same helper.
      aria-controls={`${idPrefix}-panel-${value}`}
      aria-selected={isActive}
      disabled={disabled}
      tabIndex={rovingProps.tabIndex}
      className={className}
      style={tabStyle}
      onClick={() => !disabled && onChange(value)}
      onKeyDown={handleKeyDown}
      data-liminal-hover-color=""
      data-liminal-surface=""
      data-liminal-disabled={disabled ? "" : undefined}
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
  // A tab and its panel have to name each other. `useId` gives the pair a
  // prefix that is stable per instance and unique per page.
  const idPrefix = useId();
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
  // A structural surface: the level of the frame around the work, with a quiet
  // edge, and it does not answer the pointer.
  const limStyle = resolveSurface({ role: 'chrome', interactive: false });

  const containerStyle: CSSProperties = {
    ...limStyle.style,
    boxShadow: 'none', // Strictly no shadow for tabs container
    borderRadius: `${RADIUS.control}px`, // 10px
    display: fullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    gap: `${SPACING[0]}px`,
    padding: `${SPACING[1]}px`,
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
        idPrefix: idPrefix,
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
      {/* The panels are ALWAYS children — the tabs may come from `items`, but
          the panels never do. Rendering children only when `items` was absent
          meant `aria-controls` pointed at an element that was never rendered,
          which is worse than not having the attribute at all. */}
      {safeItems ? children : null}
    </TabsContext.Provider>
  );
}

Tabs.Tab = Tab;

export default Tabs;


/**
 * The other half of the tab pattern.
 *
 * `Tabs` renders the tablist; the consumer renders the panel. Without this, the
 * tab pointed at nothing: no `aria-controls`, no `role="tabpanel"`, no
 * `aria-labelledby`. A screen reader could read the tabs and had no way to
 * reach what they control.
 */
export interface TabPanelProps {
  /** Must match the `value` of the tab it belongs to. */
  value: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function TabPanel({ value, children, className = '', style }: TabPanelProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('TabPanel must be used inside Tabs');
  const idPrefix = ctx.idPrefix;
  return (
    <div
      role="tabpanel"
      id={`${idPrefix}-panel-${value}`}
      aria-labelledby={`${idPrefix}-tab-${value}`}
      // A panel is focusable so the reader can move into it with the keyboard.
      tabIndex={0}
      hidden={ctx.activeValue !== value}
      className={className}
      style={style}
    >
      {children}
    </div>
  );
}

Tabs.Panel = TabPanel;
