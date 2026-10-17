/**
 * LIMINAL · FOCUS RING
 * «یک رینگ، یک قاعده — برای همه‌ی کنترل‌ها.»
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT THIS FILE USED TO BE
 *
 * It held the component interaction engine: a JavaScript state machine
 * (`useLiminalInteraction`), a wrapper component built on it, and a SECOND
 * surface resolver (`resolveInteractiveSurface`) that called `getLiminalStyle`.
 *
 * The CSS interaction layer replaced the state machine in Step 2.1 — a hover
 * that sets React state rewrites the whole style object, measured 4x slower
 * than letting the browser do it. The wrapper went with it, and the second
 * resolver was the last caller of `getLiminalStyle`, so it went too. Two
 * resolvers that disagree about the same depth is the defect; one is the rule.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT IS LEFT, AND WHY
 *
 * One rule the CSS layer does not own, because it depends on HOW focus arrived
 * rather than on what is focused. `:focus-visible` is the browser's own answer
 * to that, and the layer uses it. This function exists for a caller that has to
 * decide in JavaScript — a wrapper that has already tracked the interaction.
 */

import type { CSSProperties } from 'react';
import { LiminalColorEngine } from './liminal-color-engine';

export function getFocusRing(isKeyboardFocused: boolean, colorHex?: string): CSSProperties {
  return LiminalComponentEngine.getFocusRing(isKeyboardFocused, colorHex);
}

export class LiminalComponentEngine {
  /**
   * Brand primary outline (or a custom colour) on genuine keyboard focus, and
   * none on pointer focus.
   */
  static getFocusRing(isKeyboardFocused: boolean, colorHex?: string): CSSProperties {
    if (!isKeyboardFocused) {
      return { outline: 'none' };
    }
    return {
      outline: `2px solid ${colorHex || LiminalColorEngine.BRAND_PRIMARY.hex}`,
      outlineOffset: '2px',
    };
  }
}

export default LiminalComponentEngine;
