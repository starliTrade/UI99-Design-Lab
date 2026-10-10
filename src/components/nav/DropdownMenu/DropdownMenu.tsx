import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useMemo,
  forwardRef,
} from 'react';
import type {
  ReactNode,
  MouseEvent,
  KeyboardEvent,
  HTMLAttributes,
} from 'react';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import {
  useClickOutside,
  useEscapeKey,
} from '../../../engine/liminal-hooks';
import {
  usePositioning,
  type Placement,
  type PositionResult,
} from '../../../engine/liminal-positioning-engine';
import { Slot } from '../../../engine/liminal-slot';

// ============================================================================
// CONTEXT & TYPES
// ============================================================================

export interface DropdownMenuContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  floatingRef: React.RefObject<HTMLDivElement | null>;
  position: PositionResult;
  updatePosition: () => void;
}

export const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

export function useDropdownMenuContext(): DropdownMenuContextValue {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error('DropdownMenu components must be used within a <DropdownMenu>');
  }
  return context;
}

// Radio group context
export interface RadioGroupContextValue {
  value: string;
  onValueChange?: (value: string) => void;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export interface DropdownMenuRadioGroupProps {
  value: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
}

export function DropdownMenuRadioGroup({
  value,
  onValueChange,
  children,
}: DropdownMenuRadioGroupProps) {
  const contextValue = useMemo<RadioGroupContextValue>(
    () => ({ value, onValueChange }),
    [value, onValueChange]
  );

  return (
    <RadioGroupContext.Provider value={contextValue}>
      <div role="group">{children}</div>
    </RadioGroupContext.Provider>
  );
}

// ============================================================================
// DropdownMenu (Root Container)
// ============================================================================

export interface DropdownMenuProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
  offset?: { x?: number; y?: number };
}

export function DropdownMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
  offset = { x: 0, y: LiminalLayoutEngine.SPACING[1] },
}: DropdownMenuProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const triggerRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLDivElement | null>(null);

  const { position, update: updatePosition } = usePositioning(triggerRef, floatingRef, {
    placement,
    offset,
    flip: true,
    shift: true,
    arrow: false,
  });

  const setOpenState = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const open = useCallback(() => setOpenState(true), [setOpenState]);
  const close = useCallback(() => setOpenState(false), [setOpenState]);
  const toggle = useCallback(() => setOpenState(!isOpen), [setOpenState, isOpen]);

  // Click outside to dismiss (exempting the trigger)
  useClickOutside(
    floatingRef,
    (event) => {
      const target = event.target as Node | null;
      if (triggerRef.current && target && triggerRef.current.contains(target)) {
        return;
      }
      close();
    },
    isOpen
  );

  // Escape key to dismiss and return focus to trigger
  useEscapeKey(() => {
    close();
    triggerRef.current?.focus();
  }, isOpen);

  const contextValue = useMemo<DropdownMenuContextValue>(
    () => ({
      isOpen,
      open,
      close,
      toggle,
      triggerRef,
      floatingRef,
      position,
      updatePosition,
    }),
    [isOpen, open, close, toggle, position, updatePosition]
  );

  return (
    <DropdownMenuContext.Provider value={contextValue}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

// ============================================================================
// DropdownMenuTrigger
// ============================================================================

export interface DropdownMenuTriggerProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children?: ReactNode;
  disabled?: boolean;
}

export const DropdownMenuTrigger = forwardRef<HTMLElement, DropdownMenuTriggerProps>(
  ({ asChild = false, children, disabled = false, onClick, onKeyDown, ...props }, ref) => {
    const { isOpen, toggle, open, triggerRef } = useDropdownMenuContext();

    const handleClick = (e: MouseEvent<HTMLElement>) => {
      if (disabled) return;
      onClick?.(e);
      if (!e.defaultPrevented) {
        toggle();
      }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
      if (disabled) return;
      onKeyDown?.(e);
      if (e.defaultPrevented) return;

      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    };

    const triggerProps = {
      'aria-haspopup': 'menu' as const,
      'aria-expanded': isOpen,
      'aria-disabled': disabled ? true : undefined,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      ...props,
    };

    const combinedRef = (node: HTMLElement | null) => {
      (triggerRef as React.MutableRefObject<HTMLElement | null>).current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && 'current' in ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    };

    if (asChild) {
      return (
        <Slot ref={combinedRef} {...triggerProps}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={combinedRef as any}
        type="button"
        disabled={disabled}
        {...triggerProps}
      >
        {children}
      </button>
    );
  }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';
