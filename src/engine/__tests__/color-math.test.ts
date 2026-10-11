import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  contrastRatioHex,
  blendAlpha,
  whiteAlphaContrastOn,
  minWhiteAlphaForContrast,
  rgbToOklch,
  oklchLightness,
  lightnessStep,
} from '../liminal-color-math';

/**
 * These tests prove the math that every other LIMINAL claim rests on.
 * If this file is green, the contrast and ΔL assertions elsewhere are meaningful.
 */
describe('liminal-color-math', () => {
  describe('hexToRgb', () => {
    it('parses 6-digit hex', () => {
      expect(hexToRgb('#060709')).toEqual({ r: 6, g: 7, b: 9 });
    });

    it('parses 3-digit shorthand', () => {
      expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('throws on malformed input instead of silently returning garbage', () => {
      expect(() => hexToRgb('#12')).toThrow(/invalid hex/);
      expect(() => hexToRgb('not-a-color')).toThrow(/invalid hex/);
    });
  });

  describe('relativeLuminance', () => {
    it('is 0 for black and 1 for white', () => {
      expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 6);
      expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 6);
    });
  });

  describe('contrastRatio', () => {
    it('is 21:1 for black on white (WCAG maximum)', () => {
      expect(contrastRatioHex('#000000', '#ffffff')).toBeCloseTo(21, 1);
    });

    it('is 1:1 for a color against itself', () => {
      expect(contrastRatioHex('#0A0B0F', '#0A0B0F')).toBeCloseTo(1, 6);
    });

    it('is symmetric', () => {
      const a = contrastRatioHex('#060709', '#E9ECF2');
      const b = contrastRatioHex('#E9ECF2', '#060709');
      expect(a).toBeCloseTo(b, 10);
    });
  });

  describe('alpha compositing', () => {
    it('returns the background at alpha 0 and the foreground at alpha 1', () => {
      const fg = { r: 255, g: 255, b: 255 };
      const bg = { r: 0, g: 0, b: 0 };
      expect(blendAlpha(fg, bg, 0)).toEqual(bg);
      expect(blendAlpha(fg, bg, 1)).toEqual(fg);
    });

    it('matches the browser result for white 50% over black', () => {
      expect(blendAlpha({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 }, 0.5)).toEqual({
        r: 128,
        g: 128,
        b: 128,
      });
    });

    it('reports the alpha needed to reach a target contrast', () => {
      const alpha = minWhiteAlphaForContrast('#060709', 4.5);
      expect(whiteAlphaContrastOn('#060709', alpha)).toBeGreaterThanOrEqual(4.5);
      // and one step below must fall short, proving the number is minimal
      expect(whiteAlphaContrastOn('#060709', alpha - 0.01)).toBeLessThan(4.5);
    });
  });

  describe('OKLCH conversion', () => {
    it('maps black to L=0 and white to L=1', () => {
      expect(oklchLightness('#000000')).toBeCloseTo(0, 4);
      expect(oklchLightness('#ffffff')).toBeCloseTo(1, 4);
    });

    it('keeps neutral greys near zero chroma', () => {
      expect(rgbToOklch(hexToRgb('#808080')).C).toBeLessThan(0.001);
    });

    it('orders the ladder perceptually, not by raw channel value', () => {
      // #0D0E12 is numerically "brighter" than #08090C in every channel;
      // the perceptual ordering must agree.
      expect(lightnessStep('#08090C', '#0D0E12')).toBeGreaterThan(0);
    });
  });
});
