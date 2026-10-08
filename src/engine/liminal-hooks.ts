/**
 * LIMINAL · PRIMITIVE HOOKS ENGINE
 * "تعامل بی‌صدا و استوار — رفتارهای بنیادین اینترفیس"
 * 
 * 8 Canonical Hooks:
 * 1) useClickOutside: Pointer interactions outside ref boundary
 * 2) useEscapeKey: Keyboard Escape handler
 * 3) useFocusTrap: Accessible dialog / sheet tab-looping focus ring trap
 * 4) useScrollLock: Body scroll lock with padding compensation & ref-count
 * 5) useMediaQuery: SSR-safe media query subscriber
 * 6) useReducedMotion: Accessible reduced motion preference detector
 * 7) useRovingTabIndex: ARIA-compliant roving tab navigation (Tabs, Menus, Toolbars)
 * 8) usePrevious: Value history tracker
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import type { RefObject, KeyboardEvent as ReactKeyboardEvent } from 'react';

// ============================================================================
// 1) useClickOutside
// ============================================================================

export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  callback: (event: MouseEvent | TouchEvent) => void,
  enabled: boolean = true
): void {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      // Ignore right-click
      if ('button' in event && event.button !== 0) {
        return;
      }

      const el = ref.current;
      if (!el) return;

      const target = event.target as Node | null;
      if (target && !el.contains(target)) {
        savedCallback.current(event);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [ref, enabled]);
}

// ============================================================================
// 2) useEscapeKey
// ============================================================================

export function useEscapeKey(
  callback: (event: KeyboardEvent) => void,
  enabled: boolean = true
): void {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        savedCallback.current(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);
}

// ============================================================================
// 3) useFocusTrap
// ============================================================================

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export interface FocusTrapOptions {
  autoFocus?: boolean;
  restoreFocus?: boolean;
}

export function useFocusTrap<T extends HTMLElement = HTMLElement>(
  containerRef: RefObject<T | null>,
  enabled: boolean = true,
  options: FocusTrapOptions = { autoFocus: true, restoreFocus: true }
): {
  handleKeyDown: (e: ReactKeyboardEvent | KeyboardEvent) => void;
} {
  const { autoFocus = true, restoreFocus = true } = options;
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    previousActiveElement.current = document.activeElement as HTMLElement | null;

    if (autoFocus) {
      const timer = setTimeout(() => {
        const container = containerRef.current;
        if (!container) return;

        const focusables = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusables.length > 0) {
          focusables[0].focus();
        } else {
          container.focus();
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [enabled, autoFocus, containerRef]);

  // Restore focus on unmount / disable
  useEffect(() => {
    return () => {
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [restoreFocus]);

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent | KeyboardEvent) => {
      if (!enabled || e.key !== 'Tab') return;
      const container = containerRef.current;
      if (!container) return;

      const focusables = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);

      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    [enabled, containerRef]
  );

  return { handleKeyDown };
}

// ============================================================================
// 4) useScrollLock
// ============================================================================

let scrollLockRefCount = 0;
let originalBodyOverflow = '';
let originalBodyPaddingRight = '';

export function useScrollLock(enabled: boolean = true): void {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;

    if (scrollLockRefCount === 0) {
      originalBodyOverflow = document.body.style.overflow;
      originalBodyPaddingRight = document.body.style.paddingRight;

      // Compensate scrollbar width to prevent layout shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    scrollLockRefCount += 1;

    return () => {
      scrollLockRefCount -= 1;
      if (scrollLockRefCount <= 0) {
        scrollLockRefCount = 0;
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.paddingRight = originalBodyPaddingRight;
      }
    };
  }, [enabled]);
}

// ============================================================================
// 5) useMediaQuery
// ============================================================================

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
      return;
    }

    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', handler);
      return () => mql.removeEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mql.addListener(handler);
      return () => mql.removeListener(handler);
    }
  }, [query]);

  return matches;
}

// ============================================================================
// 6) useReducedMotion
// ============================================================================

export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

// ============================================================================
// 7) useRovingTabIndex
// ============================================================================

export interface RovingTabIndexOptions {
  loop?: boolean;
  orientation?: 'horizontal' | 'vertical' | 'both';
  onSelect?: (index: number) => void;
}

export function useRovingTabIndex<T = any>(
  items: T[],
  activeIndex: number,
  options: RovingTabIndexOptions = {}
): {
  getItemProps: (index: number) => {
    tabIndex: number;
    onKeyDown: (e: ReactKeyboardEvent) => void;
  };
  handleKeyDown: (e: ReactKeyboardEvent) => void;
} {
  const { loop = true, orientation = 'both', onSelect } = options;

  const navigateTo = useCallback(
    (nextIndex: number) => {
      if (items.length === 0) return;
      let target = nextIndex;
      if (loop) {
        if (target < 0) target = items.length - 1;
        if (target >= items.length) target = 0;
      } else {
        if (target < 0) target = 0;
        if (target >= items.length) target = items.length - 1;
      }
      onSelect?.(target);
    },
    [items.length, loop, onSelect]
  );

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent) => {
      const isHorizontal = orientation === 'horizontal' || orientation === 'both';
      const isVertical = orientation === 'vertical' || orientation === 'both';

      let handled = false;

      if ((isHorizontal && e.key === 'ArrowRight') || (isVertical && e.key === 'ArrowDown')) {
        handled = true;
        e.preventDefault();
        navigateTo(activeIndex + 1);
      } else if ((isHorizontal && e.key === 'ArrowLeft') || (isVertical && e.key === 'ArrowUp')) {
        handled = true;
        e.preventDefault();
        navigateTo(activeIndex - 1);
      } else if (e.key === 'Home') {
        handled = true;
        e.preventDefault();
        navigateTo(0);
      } else if (e.key === 'End') {
        handled = true;
        e.preventDefault();
        navigateTo(items.length - 1);
      }

      return handled;
    },
    [orientation, activeIndex, items.length, navigateTo]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      tabIndex: index === activeIndex ? 0 : -1,
      onKeyDown: handleKeyDown,
    }),
    [activeIndex, handleKeyDown]
  );

  return { getItemProps, handleKeyDown };
}

// ============================================================================
// 8) usePrevious
// ============================================================================

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
