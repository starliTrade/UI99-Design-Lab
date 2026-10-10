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
import {
  useClickOutside,
  useEscapeKey,
} from '../../../engine/liminal-hooks';
import {
  LiminalPositioningEngine,
  type Placement,
  type PositionResult,
} from '../../../engine/liminal-positioning-engine';
import { Slot } from '../../../engine/liminal-slot';

// ============================================================================
// CONTEXT & TYPES
// ============================================================================

export interface ContextMenuContextValue {
  isOpen: boolean;
  openAt: (x: number, y: number) => void;
  close: () => void;
  floatingRef: React.RefObject<HTMLDivElement | null>;
  position: PositionResult;
}

export const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

export function useContextMenuContext(): ContextMenuContextValue {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error('ContextMenu components must be used within a <ContextMenu>');
  }
  return context;
}

// ============================================================================
// ContextMenu (Root Container)
// ============================================================================

export interface ContextMenuProps {
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: Placement;
}

export function ContextMenu({
  children,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  placement = 'bottom-start',
}: ContextMenuProps) {
  const isControlled = controlledOpen !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>(defaultOpen);
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const [mouseCoords, setMouseCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const floatingRef = useRef<HTMLDivElement | null>(null);

  const setOpenState = useCallback(
    (nextOpen: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(nextOpen);
      }
      onOpenChange?.(nextOpen);
    },
    [isControlled, onOpenChange]
  );

  const openAt = useCallback(
    (x: number, y: number) => {
      setMouseCoords({ x, y });
      setOpenState(true);
    },
    [setOpenState]
  );

  const close = useCallback(() => setOpenState(false), [setOpenState]);

  // Calculate virtual element position using LiminalPositioningEngine
  const position = useMemo<PositionResult>(() => {
    const floating = floatingRef.current;
    const floatingRect = floating
      ? floating.getBoundingClientRect()
      : ({ width: 210, height: 250 } as DOMRect);

    // Virtual rect at mouse cursor
    const virtualTriggerRect = {
      left: mouseCoords.x,
      right: mouseCoords.x,
      top: mouseCoords.y,
      bottom: mouseCoords.y,
      width: 0,
      height: 0,
      x: mouseCoords.x,
      y: mouseCoords.y,
      toJSON: () => {},
    } as DOMRect;

    return LiminalPositioningEngine.calculatePosition(virtualTriggerRect, floatingRect, {
      placement,
      offset: { x: 2, y: 2 },
      flip: true,
      shift: true,
      arrow: false,
    });
  }, [mouseCoords, isOpen, floatingRef.current]);

  // Click outside to dismiss
  useClickOutside(
    floatingRef,
    () => {
      close();
    },
    isOpen
  );

  // Escape key to dismiss
  useEscapeKey(() => {
    close();
  }, isOpen);

  const contextValue = useMemo<ContextMenuContextValue>(
    () => ({
      isOpen,
      openAt,
      close,
      floatingRef,
      position,
    }),
    [isOpen, openAt, close, position]
  );

  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
    </ContextMenuContext.Provider>
  );
}

// ============================================================================
// ContextMenuTrigger
// ============================================================================

export interface ContextMenuTriggerProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children?: ReactNode;
  disabled?: boolean;
}

export const ContextMenuTrigger = forwardRef<HTMLElement, ContextMenuTriggerProps>(
  ({ asChild = false, children, disabled = false, onContextMenu, ...props }, ref) => {
    const { openAt } = useContextMenuContext();

    const handleContextMenu = (e: MouseEvent<HTMLElement>) => {
      if (disabled) return;
      e.preventDefault();
      onContextMenu?.(e);
      if (!e.defaultPrevented) {
        openAt(e.clientX, e.clientY);
      }
    };

    const triggerProps = {
      onContextMenu: handleContextMenu,
      'aria-haspopup': 'menu' as const,
      'aria-disabled': disabled ? true : undefined,
      ...props,
    };

    if (asChild) {
      return (
        <Slot ref={ref} {...triggerProps}>
          {children}
        </Slot>
      );
    }

    return (
      <div ref={ref as any} style={{ display: 'inline-block', width: '100%' }} {...triggerProps}>
        {children}
      </div>
    );
  }
);
ContextMenuTrigger.displayName = 'ContextMenuTrigger';
