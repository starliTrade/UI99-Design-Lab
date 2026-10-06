/**
 * LIMINAL Spec Adapter for UI99 Engine (Thin Delegate Wrapper)
 * All legacy RGB-DELTA, gamma-less luminance, flat borders, and black shadows
 * are completely eliminated in favor of the canonical LIMINAL engine.
 */

import {
  getLadderColor,
  getDirectionalRim,
  SHADOWS,
  DirectionalRimResult,
} from './spec-engine';

export interface DynamicMaterial {
  hex: string;
  surfaceLevel: number;
  rim: DirectionalRimResult | null;
  borderCss: string;
  shadowCss: string;
}

export class DynamicOpticalEngine {
  /**
   * Delegates optical materials strictly to LIMINAL engine:
   * - elevated: ladder step n + 0.5 with directional specular rim
   * - sunken: ladder step n - 0.5 with concave inverted rim
   * - shadow: authentic sub-canvas dual-layer penumbra (SHADOWS), never black rgba(0,0,0,..)
   */
  static deriveRelativeMaterial(
    baseSurfaceLevel: number = 1,
    direction: 'elevated' | 'sunken' = 'elevated'
  ): DynamicMaterial {
    const isSunken = direction === 'sunken';
    const computedLevel = isSunken
      ? Math.max(0, baseSurfaceLevel - 0.5)
      : Math.min(5, baseSurfaceLevel + 0.5);

    const hex = getLadderColor(computedLevel);
    const rim = getDirectionalRim(computedLevel, 2, isSunken);
    const shadowCss = isSunken ? 'none' : SHADOWS[2];

    return {
      hex,
      surfaceLevel: computedLevel,
      rim,
      borderCss: rim ? '1px solid transparent' : 'none',
      shadowCss,
    };
  }
}
