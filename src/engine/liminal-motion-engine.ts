/**
 * LIMINAL · MOTION ENGINE (CANONICAL MOTION SPEC)
 * "حرکت بر آستانه‌ی ادراک — فیزیک پیوسته، وقار بدون مکث"
 * 
 * Locked specification for all durations, easings, transitions, and keyframe animations.
 * No ad-hoc ms or raw bezier strings allowed outside this engine.
 */

import { getLadderColor } from './liminal-ladder';
export type MotionDurationKey = 'instant' | 'fast' | 'normal' | 'slow' | 'slower' | 'dramatic';
export type MotionEasingKey = 'out' | 'in' | 'inOut' | 'spring' | 'linear';

export class LiminalMotionEngine {
  // ===== DURATIONS (6 levels) =====
  static readonly DURATION = {
    instant: 100,   // micro-feedback (checkbox tick, radio select)
    fast: 150,      // hover/focus states
    normal: 200,    // state changes (button press)
    slow: 250,      // small enter/exit (tooltip, popover)
    slower: 350,    // container enter/exit (modal, sheet, dropdown)
    dramatic: 500,  // featured/hero animations (MIST hero button)
  } as const;

  // ===== EASINGS (5 curves) =====
  static readonly EASING = {
    out: 'cubic-bezier(0.16, 1, 0.3, 1)',      // enter (fast start, soft end)
    in: 'cubic-bezier(0.7, 0, 0.84, 0)',       // exit (soft start, fast end)
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',   // symmetric
    spring: 'cubic-bezier(0.2, 0.8, 0.2, 1)',  // interactive (LIMINAL signature)
    linear: 'linear',
  } as const;

  /**
   * The properties a transition may animate.
   *
   * `transition: all` is a compositing footgun: it animates layout properties
   * too, so a change to `width` or `top` is interpolated frame by frame instead
   * of being applied. These are the ones that are safe to animate — the
   * compositor handles all of them — and naming them makes an accidental layout
   * animation impossible rather than merely unlikely.
   */
  static readonly ANIMATABLE = 'color, background-color, border-color, box-shadow, opacity, transform';

  // ===== COMBINED PRESETS (ready-to-use transitions) =====
  static readonly TRANSITION = {
    micro: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.instant}ms ${LiminalMotionEngine.EASING.out}`,
    fast: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.fast}ms ${LiminalMotionEngine.EASING.out}`,
    hover: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.fast}ms ${LiminalMotionEngine.EASING.out}`,
    normal: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.normal}ms ${LiminalMotionEngine.EASING.out}`,
    slow: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.slow}ms ${LiminalMotionEngine.EASING.out}`,
    enter: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.slower}ms ${LiminalMotionEngine.EASING.out}`,
    spring: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.slower}ms ${LiminalMotionEngine.EASING.spring}`,
    // Compatibility aliases:
    state: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.normal}ms ${LiminalMotionEngine.EASING.spring}`,
    interactive: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.normal}ms ${LiminalMotionEngine.EASING.spring}`,
    exit: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.slow}ms ${LiminalMotionEngine.EASING.in}`,
    containerEnter: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.slower}ms ${LiminalMotionEngine.EASING.out}`,
    containerExit: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.slower}ms ${LiminalMotionEngine.EASING.in}`,
    dramatic: `${LiminalMotionEngine.ANIMATABLE} ${LiminalMotionEngine.DURATION.dramatic}ms ${LiminalMotionEngine.EASING.spring}`,
  } as const;

  // ===== KEYFRAME GENERATORS =====
  
  /**
   * Generate enter animation from a direction
   * @param direction - 'top' | 'bottom' | 'left' | 'right'
   * @param distance - translate distance (default 8px)
   * @returns CSS animation string
   */
  static enterFrom(direction: 'top' | 'bottom' | 'left' | 'right', distance = 8): string {
    const transforms = {
      top: `translateY(-${distance}px)`,
      bottom: `translateY(${distance}px)`,
      left: `translateX(-${distance}px)`,
      right: `translateX(${distance}px)`,
    };
    return `enterFrom${direction.charAt(0).toUpperCase() + direction.slice(1)} ${this.DURATION.slower}ms ${this.EASING.out}`;
  }

  /**
   * Generate exit animation to a direction
   */
  static exitTo(direction: 'top' | 'bottom' | 'left' | 'right', distance = 8): string {
    return `exitTo${direction.charAt(0).toUpperCase() + direction.slice(1)} ${this.DURATION.slow}ms ${this.EASING.in}`;
  }

  /**
   * Fade in animation
   */
  static fadeIn(): string {
    return `fadeIn ${this.DURATION.slower}ms ${this.EASING.out}`;
  }

  /**
   * Fade out animation
   */
  static fadeOut(): string {
    return `fadeOut ${this.DURATION.slow}ms ${this.EASING.in}`;
  }

  /**
   * Scale in animation (from 0.96 to 1)
   */
  static scaleIn(from = 0.96): string {
    return `scaleIn ${this.DURATION.slower}ms ${this.EASING.out}`;
  }

  // ===== MOTION TOKENS BY PROPERTY =====
  static getTransition(
    property: string = 'all',
    duration: MotionDurationKey = 'normal',
    easing: MotionEasingKey = 'out'
  ): string {
    const durMs = this.DURATION[duration];
    const easeFn = this.EASING[easing];
    return `${property} ${durMs}ms ${easeFn}`;
  }

  // ===== REDUCED MOTION SAFEGUARD =====
  static readonly REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

  /**
   * REMOVED: a `REDUCED_MOTION_STYLE` object with `!important` in it.
   *
   * It was dead code — nothing referenced it — and it could not have worked:
   * React ignores `!important` in an inline style object, so it would have set
   * `transition: none` without the precedence it was asking for. Reduced motion
   * is handled globally in `liminal-interaction.css`, where it applies to every
   * component without any of them having to remember.
   */

  // ===== KEYFRAMES MAP =====
  static readonly KEYFRAMES = {
    skeletonPulse: `
      @keyframes liminal-skeleton-pulse {
        0%, 100% { background-color: ${getLadderColor(2)}; }
        50% { background-color: ${getLadderColor(2.5)}; }
      }
    `,
    spin: `
      @keyframes liminal-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `,
    mistHalo: `
      @keyframes liminal-mist-halo {
        0%, 100% { opacity: 0.9; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.02); }
      }
    `,
    fadeIn: `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `,
  } as const;
}

// Keyframe definitions (to be injected via <style> or CSS module)
/**
 * The keyframes used to live here as a string that the module injected into
 * `document.head` at IMPORT TIME. That is a module-level side effect: it makes
 * the module non-tree-shakeable (a bundler cannot drop code that has an effect
 * on import) and it makes the module RSC-hostile (a server component importing
 * the engine would try to touch a document that does not exist).
 *
 * They are in `liminal-motion.css` now, alongside every other layer, and the
 * stylesheet is imported once by the entry point. Nothing is injected at
 * runtime and nothing has to be.
 */



export default LiminalMotionEngine;
