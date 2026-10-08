import { useRef, useState, useCallback, useEffect } from 'react';
import {
  usePositioning,
  type PositionOptions,
  type PositionResult,
  type Placement,
} from './liminal-positioning-engine';
import { useClickOutside, useEscapeKey } from './liminal-hooks';

export type { PositionOptions, PositionResult, Placement };

export interface UseFloatingOptions extends PositionOptions {
  initialOpen?: boolean;
  closeOnClickOutside?: boolean;
  closeOnEscape?: boolean;
}

/**
 * useFloating · Combined Hook for floating UI elements (Tooltips, Popovers, Dropdowns)
 * Integrates:
 * - Dynamic viewport collision & flip
 * - Boundary shifting to keep elements on-screen
 * - Click-outside dismissal
 * - Escape key dismissal
 * - Window resize & scroll positioning sync
 */
export function useFloating(options: UseFloatingOptions = {}) {
  const {
    initialOpen = false,
    closeOnClickOutside = true,
    closeOnEscape = true,
    ...positionOptions
  } = options;

  const triggerRef = useRef<HTMLElement | null>(null);
  const floatingRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(initialOpen);

  const { position, update } = usePositioning(triggerRef, floatingRef, positionOptions);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Close on outside click
  useClickOutside(
    floatingRef,
    () => {
      if (closeOnClickOutside) close();
    },
    isOpen && closeOnClickOutside
  );

  // Close on Escape
  useEscapeKey(() => {
    if (closeOnEscape) close();
  }, isOpen && closeOnEscape);

  // Recalculate position when opened
  useEffect(() => {
    if (isOpen) {
      update();
    }
  }, [isOpen, update]);

  return {
    triggerRef,
    floatingRef,
    position,
    isOpen,
    open,
    close,
    toggle,
    update,
  };
}

export default useFloating;
