import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Direction } from './liminal-direction';

/**
 * Where a floating element sits relative to its trigger.
 *
 * `top` / `bottom` / `left` / `right` are PHYSICAL sides: `left` is the left of
 * the screen in every direction.
 *
 * `inline-start` / `inline-end` are the same two sides named by the inline
 * axis: `inline-start` is left in LTR and right in RTL. A dropdown that opens
 * beside its trigger on the side the text begins should ask for
 * `inline-start`, not `left`.
 *
 * The `-start` / `-end` suffix means different axes depending on the side, and
 * that is the established convention (Radix, Floating UI):
 *
 *   `bottom-start`  aligns along the INLINE axis — the two start edges meet,
 *                   which is the left edges in LTR and the right edges in RTL.
 *   `left-start`    aligns along the BLOCK axis — the two top edges meet, in
 *                   every direction, because the block axis does not mirror.
 */
export type Placement =
  | 'top' | 'top-start' | 'top-end'
  | 'bottom' | 'bottom-start' | 'bottom-end'
  | 'left' | 'left-start' | 'left-end'
  | 'right' | 'right-start' | 'right-end'
  | 'inline-start' | 'inline-start-start' | 'inline-start-end'
  | 'inline-end' | 'inline-end-start' | 'inline-end-end';

/** The physical sides an inline placement resolves to. */
const INLINE_START: Record<Direction, 'left' | 'right'> = { ltr: 'left', rtl: 'right' };
const INLINE_END: Record<Direction, 'left' | 'right'> = { ltr: 'right', rtl: 'left' };

/** Resolve an inline placement to the physical one for this direction. */
function physicalPlacement(placement: Placement, dir: Direction): Placement {
  if (placement.startsWith('inline-start')) {
    return placement.replace('inline-start', INLINE_START[dir]) as Placement;
  }
  if (placement.startsWith('inline-end')) {
    return placement.replace('inline-end', INLINE_END[dir]) as Placement;
  }
  return placement;
}

export interface PositionOptions {
  placement?: Placement;
  /**
   * The base direction. Defaults to `ltr`.
   *
   * It changes two things and nothing else: `-start`/`-end` on a `top` or
   * `bottom` placement align along the inline axis, and `inline-start` /
   * `inline-end` resolve to a physical side. A physical placement is physical
   * in every direction — that is what makes it physical.
   */
  dir?: Direction;
  offset?: { x?: number; y?: number };
  flip?: boolean;
  shift?: boolean;
  arrow?: boolean;
}

export interface PositionResult {
  x: number;
  y: number;
  placement: Placement;
  arrowX?: number;
  arrowY?: number;
}

export class LiminalPositioningEngine {
  static calculatePosition(
    triggerRect: DOMRect,
    floatingRect: DOMRect,
    options: PositionOptions = {}
  ): PositionResult {
    const {
      placement: requested = 'bottom',
      dir = 'ltr',
      offset = { x: 0, y: 8 },
      flip = true,
      shift = true,
      arrow = true,
    } = options;

    const viewport = {
      width: typeof window !== 'undefined' ? window.innerWidth : 1920,
      height: typeof window !== 'undefined' ? window.innerHeight : 1080,
    };

    // An inline placement becomes a physical one here, once, so every branch
    // below works in physical coordinates and there is only one place that
    // knows about direction.
    const placement = physicalPlacement(requested, dir);

    let x = 0;
    let y = 0;
    let actualPlacement = placement;

    const offsetX = offset.x ?? 0;
    const offsetY = offset.y ?? 8;

    // 1. Base placement calculation
    switch (placement) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2 - floatingRect.width / 2;
        y = triggerRect.top - floatingRect.height - offsetY;
        break;
      case 'top-start':
        // The two START edges meet: left edges in LTR, right edges in RTL.
        x = dir === 'rtl' ? triggerRect.right - floatingRect.width : triggerRect.left;
        y = triggerRect.top - floatingRect.height - offsetY;
        break;
      case 'top-end':
        x = dir === 'rtl' ? triggerRect.left : triggerRect.right - floatingRect.width;
        y = triggerRect.top - floatingRect.height - offsetY;
        break;
      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2 - floatingRect.width / 2;
        y = triggerRect.bottom + offsetY;
        break;
      case 'bottom-start':
        x = dir === 'rtl' ? triggerRect.right - floatingRect.width : triggerRect.left;
        y = triggerRect.bottom + offsetY;
        break;
      case 'bottom-end':
        x = dir === 'rtl' ? triggerRect.left : triggerRect.right - floatingRect.width;
        y = triggerRect.bottom + offsetY;
        break;
      case 'left':
        x = triggerRect.left - floatingRect.width - (offsetX || 8);
        y = triggerRect.top + triggerRect.height / 2 - floatingRect.height / 2;
        break;
      case 'left-start':
        x = triggerRect.left - floatingRect.width - (offsetX || 8);
        y = triggerRect.top;
        break;
      case 'left-end':
        x = triggerRect.left - floatingRect.width - (offsetX || 8);
        y = triggerRect.bottom - floatingRect.height;
        break;
      case 'right':
        x = triggerRect.right + (offsetX || 8);
        y = triggerRect.top + triggerRect.height / 2 - floatingRect.height / 2;
        break;
      case 'right-start':
        x = triggerRect.right + (offsetX || 8);
        y = triggerRect.top;
        break;
      case 'right-end':
        x = triggerRect.right + (offsetX || 8);
        y = triggerRect.bottom - floatingRect.height;
        break;
    }

    // 2. Flip on viewport collision
    if (flip) {
      if (placement.startsWith('top') && y < 0) {
        actualPlacement = placement.replace('top', 'bottom') as Placement;
        y = triggerRect.bottom + offsetY;
      } else if (placement.startsWith('bottom') && y + floatingRect.height > viewport.height) {
        actualPlacement = placement.replace('bottom', 'top') as Placement;
        y = triggerRect.top - floatingRect.height - offsetY;
      } else if (placement.startsWith('left') && x < 0) {
        actualPlacement = placement.replace('left', 'right') as Placement;
        x = triggerRect.right + (offsetX || 8);
      } else if (placement.startsWith('right') && x + floatingRect.width > viewport.width) {
        actualPlacement = placement.replace('right', 'left') as Placement;
        x = triggerRect.left - floatingRect.width - (offsetX || 8);
      }
    }

    // 3. Shift to guarantee bounding box inside viewport
    if (shift) {
      if (x < 4) x = 4;
      if (x + floatingRect.width > viewport.width - 4) {
        x = Math.max(4, viewport.width - floatingRect.width - 4);
      }
      if (y < 4) y = 4;
      if (y + floatingRect.height > viewport.height - 4) {
        y = Math.max(4, viewport.height - floatingRect.height - 4);
      }
    }

    // 4. Calculate relative arrow coordinate
    let arrowX: number | undefined;
    let arrowY: number | undefined;

    if (arrow) {
      arrowX = Math.max(8, Math.min(floatingRect.width - 8, triggerRect.left + triggerRect.width / 2 - x));
      arrowY = Math.max(8, Math.min(floatingRect.height - 8, triggerRect.top + triggerRect.height / 2 - y));
    }

    return {
      x: Math.round(x),
      y: Math.round(y),
      placement: actualPlacement,
      arrowX: arrowX ? Math.round(arrowX) : undefined,
      arrowY: arrowY ? Math.round(arrowY) : undefined,
    };
  }
}

// Hook wrapper
export function usePositioning(
  triggerRef: React.RefObject<HTMLElement | null>,
  floatingRef: React.RefObject<HTMLElement | null>,
  options: PositionOptions = {}
): {
  position: PositionResult;
  update: () => void;
} {
  const [position, setPosition] = useState<PositionResult>({
    x: 0,
    y: 0,
    placement: options.placement || 'bottom',
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const update = useCallback(() => {
    const trigger = triggerRef.current;
    const floating = floatingRef.current;
    if (!trigger || !floating) return;

    const triggerRect = trigger.getBoundingClientRect();
    const floatingRect = floating.getBoundingClientRect();

    const newPos = LiminalPositioningEngine.calculatePosition(
      triggerRect,
      floatingRect,
      optionsRef.current
    );

    setPosition((prev) => {
      if (
        prev.x === newPos.x &&
        prev.y === newPos.y &&
        prev.placement === newPos.placement &&
        prev.arrowX === newPos.arrowX &&
        prev.arrowY === newPos.arrowY
      ) {
        return prev;
      }
      return newPos;
    });
  }, [triggerRef, floatingRef]);

  useEffect(() => {
    update();

    // Update on scroll/resize (throttled at ~60fps)
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const handleUpdate = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(update, 16);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [update]);

  return { position, update };
}

export default LiminalPositioningEngine;
