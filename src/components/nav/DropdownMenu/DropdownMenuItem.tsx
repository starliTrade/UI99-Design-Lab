import React, {
  useState,
  useContext,
  forwardRef,
} from 'react';
import type {
  CSSProperties,
  ReactNode,
  MouseEvent,
  KeyboardEvent,
  FocusEvent,
  HTMLAttributes,
} from 'react';
import { Check, Circle } from '@phosphor-icons/react';
import {
  getTextStyle,
  getLadderColor,
} from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { LiminalIcon, ICON_SIZES } from '../../../engine/liminal-icon-engine';
import { LiminalComponentEngine } from '../../../engine/liminal-component-engine';
import { Slot } from '../../../engine/liminal-slot';
import { resolveSurface, resolveBorder } from '../../../engine/liminal-surface';
import {
  useDropdownMenuContext,
  RadioGroupContext,
} from './DropdownMenu';

// ============================================================================
// 1. DropdownMenuItem
// ============================================================================

export interface DropdownMenuItemProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  asChild?: boolean;
  children?: ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'danger';
  icon?: ReactNode;
  shortcut?: string;
  onSelect?: (e: Event) => void;
}

export const DropdownMenuItem = forwardRef<HTMLElement, DropdownMenuItemProps>(
  (
    {
      asChild = false,
      children,
      disabled = false,
      variant = 'default',
      icon,
      shortcut,
      className = '',
      style: customStyle = {},
      onClick,
      onMouseEnter,
      onMouseLeave,
      onFocus,
      onBlur,
      onKeyDown,
      onSelect,
      ...props
    },
    ref
  ) => {
    const { close } = useDropdownMenuContext();

    const SPACING = LiminalLayoutEngine.SPACING;

        const RADIUS = LiminalLayoutEngine.RADIUS;
    const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

    const isDanger = variant === 'danger';
    const isInteractive = !disabled;

    // Hover and focus are CSS's job now. The item sits ON the menu surface:
    // idle is transparent, and the browser lifts it by a half-step on hover or
    // keyboard focus — never an absolute ladder level.
    const idleBg = 'transparent';
    const hoverBg = isDanger
      ? LiminalColorEngine.SEMANTICS.DANGER.subtle
      : resolveSurface({ role: 'menu', state: 'hover' }).background;
    const textColor = isDanger
      ? LiminalColorEngine.SEMANTICS.DANGER.text
      : getTextStyle('primary', 2).color;

    const itemStyle = {
      '--liminal-surface-idle': idleBg,
      '--liminal-surface-hover': hoverBg,
      '--liminal-surface-active': hoverBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: `${SPACING[2]}px`,
      padding: `${SPACING[2]}px ${SPACING[3]}px`,
      borderRadius: `${RADIUS.chip}px`,
      fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
      fontWeight: 500,
      lineHeight: TYPOGRAPHY[2].lh,
      color: textColor,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      transition: LiminalMotionEngine.getTransition('background', 'fast'),
      outline: 'none',
      border: 'none',
      userSelect: 'none',
      width: '100%',
      boxSizing: 'border-box',
      textAlign: 'start',
      textDecoration: 'none',
        ...customStyle,
    };

    const handleClick = (e: MouseEvent<HTMLElement>) => {
      if (disabled) return;
      onSelect?.(e.nativeEvent);
      onClick?.(e);
      if (!e.defaultPrevented) {
        close();
      }
    };

    const handleMouseEnter = onMouseEnter;
    const handleMouseLeave = onMouseLeave;
    const handleFocus = onFocus;
    const handleBlur = onBlur;

    const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e as any);
      }
      onKeyDown?.(e);
    };

    const itemProps: Record<string, unknown> = {
      role: 'menuitem' as const,
      tabIndex: disabled ? -1 : 0,
      'aria-disabled': disabled ? true : undefined,
      className,
      'data-liminal-surface': '',
      'data-liminal-disabled': disabled ? '' : undefined,
      style: itemStyle,
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      ...props,
    };

    const innerContent = (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: `${SPACING[2]}px`, flex: 1, minWidth: 0 }}>
          {icon && <span style={{ display: 'inline-flex', alignItems: 'center', flexShrink: 0 }}>{icon}</span>}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
        </div>
        {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
      </>
    );

    if (asChild) {
      return (
        <Slot ref={ref} {...(itemProps as any)}>
          {innerContent}
        </Slot>
      );
    }

    return (
      <div ref={ref as any} {...(itemProps as any)}>
        {innerContent}
      </div>
    );
  }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

// ============================================================================
// 2. DropdownMenuCheckboxItem
// ============================================================================

export interface DropdownMenuCheckboxItemProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  children?: ReactNode;
  shortcut?: string;
}

export const DropdownMenuCheckboxItem = forwardRef<HTMLElement, DropdownMenuCheckboxItemProps>(
  (
    {
      asChild = false,
      checked,
      onCheckedChange,
      disabled = false,
      children,
      shortcut,
      className = '',
      style: customStyle = {},
      onClick,
      ...props
    },
    ref
  ) => {
    const { close } = useDropdownMenuContext();

    const SPACING = LiminalLayoutEngine.SPACING;
    const RADIUS = LiminalLayoutEngine.RADIUS;
    const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

    // Hover and focus are CSS's job now — see the interaction layer.
    const idleBg = 'transparent';
    const hoverBg = resolveSurface({ role: 'menu', state: 'hover' }).background;
    const textColor = getTextStyle('primary', 2).color;


    const itemStyle = {
      '--liminal-surface-idle': idleBg,
      '--liminal-surface-hover': hoverBg,
      '--liminal-surface-active': hoverBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: `${SPACING[2]}px`,
      padding: `${SPACING[2]}px ${SPACING[3]}px`,
      borderRadius: `${RADIUS.chip}px`,
      fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
      fontWeight: 500,
      lineHeight: TYPOGRAPHY[2].lh,
      color: textColor,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      transition: LiminalMotionEngine.getTransition('background', 'fast'),
      outline: 'none',
      border: 'none',
      userSelect: 'none',
      width: '100%',
      boxSizing: 'border-box',
      textAlign: 'start',
        ...customStyle,
    };

    const handleClick = (e: MouseEvent<HTMLElement>) => {
      if (disabled) return;
      onClick?.(e);
      if (!e.defaultPrevented) {
        onCheckedChange?.(!checked);
        close();
      }
    };

    const itemProps: Record<string, unknown> = {
      role: 'menuitemcheckbox' as const,
      'aria-checked': checked,
      tabIndex: disabled ? -1 : 0,
      'aria-disabled': disabled ? true : undefined,
      className,
      style: itemStyle,
      onClick: handleClick,
      'data-liminal-surface': '',
      'data-liminal-disabled': disabled ? '' : undefined,
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
        if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      },
      ...props,
    };

    const innerContent = (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: `${SPACING[2]}px`, flex: 1, minWidth: 0 }}>
          <span
            style={{
              width: `${ICON_SIZES.xs}px`,
              height: `${ICON_SIZES.xs}px`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: checked ? LiminalColorEngine.BRAND_PRIMARY.hex : 'transparent',
            }}
          >
            <LiminalIcon icon={Check} size="xs" weight="bold" />
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
        </div>
        {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
      </>
    );

    if (asChild) {
      return (
        <Slot ref={ref} {...(itemProps as any)}>
          {innerContent}
        </Slot>
      );
    }

    return (
      <div ref={ref as any} {...(itemProps as any)}>
        {innerContent}
      </div>
    );
  }
);
DropdownMenuCheckboxItem.displayName = 'DropdownMenuCheckboxItem';

// ============================================================================
// 3. DropdownMenuRadioItem
// ============================================================================

export interface DropdownMenuRadioItemProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  value: string;
  disabled?: boolean;
  children?: ReactNode;
  shortcut?: string;
}

export const DropdownMenuRadioItem = forwardRef<HTMLElement, DropdownMenuRadioItemProps>(
  (
    {
      asChild = false,
      value,
      disabled = false,
      children,
      shortcut,
      className = '',
      style: customStyle = {},
      onClick,
      ...props
    },
    ref
  ) => {
    const { close } = useDropdownMenuContext();
    const group = useContext(RadioGroupContext);
    const isSelected = group?.value === value;


    const SPACING = LiminalLayoutEngine.SPACING;
    const RADIUS = LiminalLayoutEngine.RADIUS;
    const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

    // Hover and focus are CSS's job now — see the interaction layer.
    const idleBg = 'transparent';
    const hoverBg = resolveSurface({ role: 'menu', state: 'hover' }).background;
    const textColor = getTextStyle('primary', 2).color;


    const itemStyle = {
      '--liminal-surface-idle': idleBg,
      '--liminal-surface-hover': hoverBg,
      '--liminal-surface-active': hoverBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: `${SPACING[2]}px`,
      padding: `${SPACING[2]}px ${SPACING[3]}px`,
      borderRadius: `${RADIUS.chip}px`,
      fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
      fontWeight: 500,
      lineHeight: TYPOGRAPHY[2].lh,
      color: textColor,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1,
      pointerEvents: disabled ? 'none' : 'auto',
      transition: LiminalMotionEngine.getTransition('background', 'fast'),
      outline: 'none',
      border: 'none',
      userSelect: 'none',
      width: '100%',
      boxSizing: 'border-box',
      textAlign: 'start',
        ...customStyle,
    };

    const handleClick = (e: MouseEvent<HTMLElement>) => {
      if (disabled) return;
      onClick?.(e);
      if (!e.defaultPrevented) {
        group?.onValueChange?.(value);
        close();
      }
    };

    const itemProps: Record<string, unknown> = {
      role: 'menuitemradio' as const,
      'aria-checked': isSelected,
      tabIndex: disabled ? -1 : 0,
      'aria-disabled': disabled ? true : undefined,
      className,
      style: itemStyle,
      onClick: handleClick,
      'data-liminal-surface': '',
      'data-liminal-disabled': disabled ? '' : undefined,
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => {
        if (disabled) return;
      if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e as any);
        }
      },
      ...props,
    };

    const innerContent = (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: `${SPACING[2]}px`, flex: 1, minWidth: 0 }}>
          <span
            style={{
              width: `${ICON_SIZES.xs}px`,
              height: `${ICON_SIZES.xs}px`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: isSelected ? LiminalColorEngine.BRAND_PRIMARY.hex : 'transparent',
            }}
          >
            <LiminalIcon icon={Circle} size="xs" weight="fill" />
          </span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{children}</span>
        </div>
        {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
      </>
    );

    if (asChild) {
      return (
        <Slot ref={ref} {...(itemProps as any)}>
          {innerContent}
        </Slot>
      );
    }

    return (
      <div ref={ref as any} {...(itemProps as any)}>
        {innerContent}
      </div>
    );
  }
);
DropdownMenuRadioItem.displayName = 'DropdownMenuRadioItem';

// ============================================================================
// 4. DropdownMenuSeparator
// ============================================================================

export interface DropdownMenuSeparatorProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export const DropdownMenuSeparator = forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
  ({ asChild = false, className = '', style: customStyle = {}, ...props }, ref) => {
    const SPACING = LiminalLayoutEngine.SPACING;
    const BORDER = LiminalLayoutEngine.BORDER;

    const separatorStyle: CSSProperties = {
      height: `${BORDER.hairline}px`,
      margin: `${SPACING[1]}px 0`,
      background: resolveSurface({ role: 'menu', state: 'hover' }).background,
      border: 'none',
      width: '100%',
      boxSizing: 'border-box',
      ...customStyle,
    };

    const separatorProps = {
      role: 'separator' as const,
      className,
      style: separatorStyle,
      ...props,
    };

    if (asChild) {
      return (
        <Slot ref={ref as any} {...separatorProps}>
          {props.children}
        </Slot>
      );
    }

    return <div ref={ref} {...separatorProps} />;
  }
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

// ============================================================================
// 5. DropdownMenuLabel
// ============================================================================

export interface DropdownMenuLabelProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children?: ReactNode;
}

export const DropdownMenuLabel = forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ asChild = false, children, className = '', style: customStyle = {}, ...props }, ref) => {
    const SPACING = LiminalLayoutEngine.SPACING;
    const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

    const labelStyle: CSSProperties = {
      padding: `${SPACING[1]}px ${SPACING[3]}px`,
      fontSize: LiminalLayoutEngine.getTypeSizeCss(1),
      fontWeight: 600,
      textTransform: 'uppercase',
      color: getTextStyle('tertiary', 1).color,
      letterSpacing: '+0.04em',
      userSelect: 'none',
      ...customStyle,
    };

    const labelProps = {
      role: 'none' as const,
      className,
      style: labelStyle,
      ...props,
    };

    if (asChild) {
      return (
        <Slot ref={ref as any} {...labelProps}>
          {children}
        </Slot>
      );
    }

    return (
      <div ref={ref} {...labelProps}>
        {children}
      </div>
    );
  }
);
DropdownMenuLabel.displayName = 'DropdownMenuLabel';

// ============================================================================
// 6. DropdownMenuShortcut
// ============================================================================

export interface DropdownMenuShortcutProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
}

export function DropdownMenuShortcut({
  children,
  className = '',
  style: customStyle = {},
  ...props
}: DropdownMenuShortcutProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  const shortcutStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(1),
    fontFamily: 'monospace',
    color: getTextStyle('tertiary', 1).color,
    background: resolveSurface({ role: 'menu' }).background,
    padding: `${SPACING[1]}px ${SPACING[2]}px`,
    borderRadius: `${RADIUS.chip}px`,
    border: `1px solid ${resolveBorder({ role: 'menu', kind: 'edge' })}`,
    marginInlineStart: 'auto',
    letterSpacing: '0.05em',
    lineHeight: 1,
    flexShrink: 0,
    ...customStyle,
  };

  return (
    <span className={className} style={shortcutStyle} {...props}>
      {children}
    </span>
  );
}
