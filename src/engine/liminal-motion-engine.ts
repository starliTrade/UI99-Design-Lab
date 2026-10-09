/**
 * LIMINAL · MOTION ENGINE (CANONICAL MOTION SPEC)
 * "حرکت بر آستانه‌ی ادراک — فیزیک پیوسته، وقار بدون مکث"
 * 
 * Locked specification for all durations, easings, transitions, and keyframe animations.
 * No ad-hoc ms or raw bezier strings allowed outside this engine.
 */

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

  // ===== COMBINED PRESETS (ready-to-use transitions) =====
  static readonly TRANSITION = {
    micro: `all ${LiminalMotionEngine.DURATION.instant}ms ${LiminalMotionEngine.EASING.out}`,
    fast: `all ${LiminalMotionEngine.DURATION.fast}ms ${LiminalMotionEngine.EASING.out}`,
    hover: `all ${LiminalMotionEngine.DURATION.fast}ms ${LiminalMotionEngine.EASING.out}`,
    normal: `all ${LiminalMotionEngine.DURATION.normal}ms ${LiminalMotionEngine.EASING.out}`,
    slow: `all ${LiminalMotionEngine.DURATION.slow}ms ${LiminalMotionEngine.EASING.out}`,
    enter: `all ${LiminalMotionEngine.DURATION.slower}ms ${LiminalMotionEngine.EASING.out}`,
    spring: `all ${LiminalMotionEngine.DURATION.slower}ms ${LiminalMotionEngine.EASING.spring}`,
    // Compatibility aliases:
    state: `all ${LiminalMotionEngine.DURATION.normal}ms ${LiminalMotionEngine.EASING.spring}`,
    interactive: `all ${LiminalMotionEngine.DURATION.normal}ms ${LiminalMotionEngine.EASING.spring}`,
    exit: `all ${LiminalMotionEngine.DURATION.slow}ms ${LiminalMotionEngine.EASING.in}`,
    containerEnter: `all ${LiminalMotionEngine.DURATION.slower}ms ${LiminalMotionEngine.EASING.out}`,
    containerExit: `all ${LiminalMotionEngine.DURATION.slower}ms ${LiminalMotionEngine.EASING.in}`,
    dramatic: `all ${LiminalMotionEngine.DURATION.dramatic}ms ${LiminalMotionEngine.EASING.spring}`,
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

  static readonly REDUCED_MOTION_STYLE = {
    transition: 'none !important',
    animation: 'none !important',
  } as const;

  // ===== KEYFRAMES MAP =====
  static readonly KEYFRAMES = {
    skeletonPulse: `
      @keyframes liminal-skeleton-pulse {
        0%, 100% { background-color: #0A0B0F; }
        50% { background-color: #0B0C10; }
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
export const MOTION_KEYFRAMES = `
  @keyframes enterFromTop {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes enterFromBottom {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes enterFromLeft {
    from { opacity: 0; transform: translateX(-8px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes enterFromRight {
    from { opacity: 0; transform: translateX(8px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes exitToTop {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-8px); }
  }
  @keyframes exitToBottom {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(8px); }
  }
  @keyframes exitToLeft {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(-8px); }
  }
  @keyframes exitToRight {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(8px); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  @keyframes liminal-skeleton-pulse {
    0%, 100% { background-color: #0A0B0F; }
    50% { background-color: #0B0C10; }
  }
  @keyframes liminal-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes liminal-mist-halo {
    0%, 100% { opacity: 0.9; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.02); }
  }
`;

// Auto-inject keyframes into document head if running in client environment
if (typeof document !== 'undefined') {
  const styleId = 'liminal-motion-keyframes';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = MOTION_KEYFRAMES;
    document.head.appendChild(style);
  }
}

export default LiminalMotionEngine;
