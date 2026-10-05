/**
 * UI99 Dynamic Optical Relativity Engine
 * Every child layer (surface, input, button, chip, border, shadow)
 * maintains the exact proportional scale of luminance, contrast, and sheen
 * that exists between Canvas (#060709) and Surface (#090A0E).
 */

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export interface DynamicMaterial {
  hex: string;
  rgb: ColorRGB;
  borderCss: string;
  shadowCss: string;
  contrastRatio: number;
  borderAlphaPercent: string;
}

export class DynamicOpticalEngine {
  // Origin Canvas C0 and Master Surface C1
  static readonly C0: ColorRGB = { r: 6, g: 7, b: 9 };   // #060709
  static readonly C1: ColorRGB = { r: 9, g: 10, b: 14 }; // #090A0E

  // Master Step Vector: Δ = [+3, +3, +5]
  static readonly DELTA = { dr: 3, dg: 3, db: 5 };

  static rgbToHex(rgb: ColorRGB): string {
    const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
    return `#${clamp(rgb.r).toString(16).padStart(2, '0')}${clamp(rgb.g).toString(16).padStart(2, '0')}${clamp(rgb.b).toString(16).padStart(2, '0')}`.toUpperCase();
  }

  static getLuminance(rgb: ColorRGB): number {
    return 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
  }

  /**
   * The Fundamental Law of Relative Scale:
   * Given any parent surface, calculate the child material (color, border, shadow)
   * maintaining the exact optical proportion of Canvas -> Surface.
   *
   * @param parentRgb The parent's RGB color
   * @param direction 'elevated' (+Δ) or 'sunken' (-Δ)
   * @param accent Optional chromatic tint ('none' | 'emerald' | 'sapphire' | 'amber')
   */
  static deriveRelativeMaterial(
    parentRgb: ColorRGB,
    direction: 'elevated' | 'sunken' = 'elevated',
    accent: 'none' | 'emerald' | 'sapphire' | 'amber' = 'none'
  ): DynamicMaterial {
    const lParent = this.getLuminance(parentRgb);

    // Calculate Child RGB using the fundamental vector Δ
    let childRgb: ColorRGB;
    if (direction === 'sunken') {
      childRgb = {
        r: Math.max(0, parentRgb.r - this.DELTA.dr),
        g: Math.max(0, parentRgb.g - this.DELTA.dg),
        b: Math.max(0, parentRgb.b - this.DELTA.db),
      };
    } else {
      childRgb = {
        r: parentRgb.r + this.DELTA.dr,
        g: parentRgb.g + this.DELTA.dg,
        b: parentRgb.b + this.DELTA.db,
      };
    }

    const lChild = this.getLuminance(childRgb);
    const contrastRatio = lChild / Math.max(0.1, lParent);

    // The Relative Border Law:
    // Base scale between Canvas and Surface is 4.5% (0.045)
    // The child's border relative to its parent scales proportionally to (L_child / L_parent)
    const baseAlpha = 0.045;
    let computedAlpha = direction === 'sunken'
      ? baseAlpha * (lChild / lParent) // Sunken wells get softer rim (~3.1% to 3.4%)
      : baseAlpha * Math.min(1.2, lChild / lParent); // Elevated gets relative specular (~4.8% to 5.2%)

    let borderCss = '';
    if (accent === 'emerald') {
      // Gentle 14% emerald whisper (never harsh 45%)
      borderCss = '1px solid rgba(52, 211, 153, 0.16)';
    } else if (accent === 'sapphire') {
      borderCss = '1px solid rgba(96, 165, 250, 0.22)';
    } else if (accent === 'amber') {
      borderCss = '1px solid rgba(251, 191, 36, 0.18)';
    } else {
      // Natural cold sapphire specular tint
      const tintR = Math.min(255, 220 + childRgb.r);
      const tintG = Math.min(255, 230 + childRgb.g);
      const tintB = Math.min(255, 250 + childRgb.b);
      borderCss = `1px solid rgba(${tintR}, ${tintG}, ${tintB}, ${computedAlpha.toFixed(3)})`;
    }

    // Relative Shadow:
    let shadowCss = '';
    if (direction === 'sunken') {
      shadowCss = 'inset 0 1px 3px 0 rgba(0, 0, 0, 0.50)';
    } else {
      shadowCss = '0 1px 3px 0 rgba(0, 0, 0, 0.40), 0 6px 16px -4px rgba(0, 0, 0, 0.35)';
    }

    return {
      hex: this.rgbToHex(childRgb),
      rgb: childRgb,
      borderCss,
      shadowCss,
      contrastRatio: parseFloat(contrastRatio.toFixed(3)),
      borderAlphaPercent: `${(computedAlpha * 100).toFixed(1)}%`,
    };
  }
}
