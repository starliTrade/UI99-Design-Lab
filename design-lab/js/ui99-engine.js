/**
 * UI99 Intelligent Mathematical Design Engine — Core v1.0
 * Principle: "Separation First — Decoration Never"
 *
 * Deterministic pure functions for:
 * - Color space conversions (sRGB, Relative Luminance, OKLCH, APCA-approximation)
 * - Surface ladder generation (Weber-Fechner scale)
 * - Local context decision engine (Node <-> Parent relationship)
 * - Border polarity & optical subpixel stroke derivation
 * - Depth shadow physics with negative spread & micro-alpha
 * - Concentric radius geometry: R_child = max(0, R_parent - P)
 */

export const UI99 = (function () {
  'use strict';

  // --- 1. COLOR SPACE & PHOTOMETRICS ---

  function parseHex(hex) {
    if (!hex) return [0, 0, 0];
    const clean = hex.trim().replace('#', '');
    if (clean.length === 3) {
      return [
        parseInt(clean[0] + clean[0], 16) / 255,
        parseInt(clean[1] + clean[1], 16) / 255,
        parseInt(clean[2] + clean[2], 16) / 255
      ];
    }
    if (clean.length === 6) {
      return [
        parseInt(clean.slice(0, 2), 16) / 255,
        parseInt(clean.slice(2, 4), 16) / 255,
        parseInt(clean.slice(4, 6), 16) / 255
      ];
    }
    return [0, 0, 0];
  }

  function rgbToHex(r, g, b) {
    const toHex = (c) => Math.round(Math.max(0, Math.min(1, c)) * 255).toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  function srgbToLinear(c) {
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function linearToSrgb(c) {
    return c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  }

  function relativeLuminance(hex) {
    const [r, g, b] = parseHex(hex);
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
  }

  function contrastRatio(hex1, hex2) {
    const l1 = relativeLuminance(hex1);
    const l2 = relativeLuminance(hex2);
    const hi = Math.max(l1, l2);
    const lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  // Linear color interpolation (Optical bridge)
  function mixColors(hexA, hexB, t = 0.5) {
    const a = parseHex(hexA);
    const b = parseHex(hexB);
    const r = a[0] + (b[0] - a[0]) * t;
    const g = a[1] + (b[1] - a[1]) * t;
    const bl = a[2] + (b[2] - a[2]) * t;
    return rgbToHex(r, g, bl);
  }

  // OKLCH Lightness approximation for dark scales
  function getOklchLightness(hex) {
    const [r, g, b] = parseHex(hex);
    const lr = srgbToLinear(r);
    const lg = srgbToLinear(g);
    const lb = srgbToLinear(b);
    const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
    const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
    const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);
    return 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  }

  // --- 2. WEBER-FECHNER SURFACE LADDER GENERATOR ---

  function generateSurfaceLadder(baseHex = '#030406', steps = 6, direction = 'elevate') {
    const ladder = [];
    const baseRgb = parseHex(baseHex);
    
    for (let i = 0; i <= steps; i++) {
      if (i === 0) {
        ladder.push({ level: 0, hex: baseHex, role: 'Base Canvas', luminance: relativeLuminance(baseHex) });
        continue;
      }
      // Weber scale: Delta I / I is perceived proportionally
      // For very dark bases, we scale subtly with gentle curve
      const factor = direction === 'elevate'
        ? Math.pow(i / steps, 1.15) * 0.045
        : -Math.pow(i / steps, 1.15) * 0.015;

      const r = Math.max(0, Math.min(1, baseRgb[0] + factor * 1.0));
      const g = Math.max(0, Math.min(1, baseRgb[1] + factor * 1.1));
      const b = Math.max(0, Math.min(1, baseRgb[2] + factor * 1.4)); // subtly cooler tinted darks
      const hex = rgbToHex(r, g, b);

      ladder.push({
        level: i,
        hex,
        role: i === 1 ? 'Card Base' : i === 2 ? 'Nested Panel' : i === 3 ? 'Control / Input' : `Elevated Layer ${i}`,
        luminance: relativeLuminance(hex),
        contrastVsBase: contrastRatio(hex, baseHex).toFixed(3)
      });
    }
    return ladder;
  }

  // --- 3. ROLES & WEIGHTS ---

  const ROLES = {
    canvas:   { edge: 0.10, depth: 0.00, size: 1.50, name: 'Canvas / Root' },
    card:     { edge: 0.38, depth: 0.52, size: 1.10, name: 'Card / Container' },
    panel:    { edge: 0.32, depth: 0.22, size: 0.90, name: 'Nested Panel' },
    control:  { edge: 0.65, depth: 0.10, size: 0.60, name: 'Control / Input / Button' },
    floating: { edge: 0.22, depth: 1.00, size: 1.15, name: 'Floating / Popover' },
    modal:    { edge: 0.28, depth: 1.25, size: 1.20, name: 'Modal / Dialog' },
    badge:    { edge: 0.45, depth: 0.05, size: 0.40, name: 'Badge / Indicator' }
  };

  // --- 4. DECISION ENGINE & FORMULA EVALUATION ---

  function clamp(val, min = 0, max = 1) {
    return Math.max(min, Math.min(max, val));
  }

  function evaluateNode(node) {
    const parentSurface = node.parentSurface || '#030406';
    const surface = node.surface || '#060709';
    const depth = node.depth ?? 1;
    const roleKey = node.role in ROLES ? node.role : 'card';
    const rConfig = ROLES[roleKey];
    const elevation = typeof node.elevation === 'number' ? node.elevation : 0;
    const interactive = Boolean(node.interactive);
    const edgeExposure = typeof node.edgeExposure === 'number' ? node.edgeExposure : 1.0;

    // Photometric separation
    const lumParent = relativeLuminance(parentSurface);
    const lumNode = relativeLuminance(surface);
    const deltaL = Math.abs(lumNode - lumParent);
    const separation = deltaL / (lumNode + lumParent + 0.000001);
    const fillClarity = clamp(separation / 0.62);

    // Interaction Boost: active/focusable elements require instant boundary clarity
    const interactionBoost = interactive ? 1.25 : 1.0;
    
    // Depth Damping: nested items shouldn't accumulate concentric outlines blindly
    const depthDamping = 1 / (1 + depth * 0.18);

    // Edge Need calculation
    const edgeNeed = clamp(
      rConfig.edge * rConfig.size * edgeExposure * (1 - fillClarity) * interactionBoost * depthDamping
    );

    // Depth Need calculation
    const depthNeed = clamp(
      rConfig.depth * (elevation / 6) * (1 - fillClarity * 0.70)
    );

    // Decision Thresholds
    const borderThreshold = 0.30;
    const shadowThreshold = 0.16;

    const hasBorder = edgeNeed >= borderThreshold;
    const hasShadow = depthNeed >= shadowThreshold && elevation > 0;
    const hasBoth = hasBorder && hasShadow;

    let mode = 'NONE';
    if (hasBoth) {
      mode = 'BORDER + SHADOW';
    } else if (hasBorder) {
      mode = 'BORDER ONLY';
    } else if (hasShadow) {
      mode = 'SHADOW ONLY';
    } else {
      mode = 'SURFACE ONLY';
    }

    // Border Parameters
    let borderWidth = 0;
    let borderColor = 'transparent';
    if (hasBorder) {
      // Subpixel precision: thin optical hairline in dark mode
      borderWidth = Math.min(1.10, Math.max(0.60, 0.45 + 0.70 * edgeNeed));
      // Polarity:
      if (lumNode >= lumParent) {
        // Elevated surface: border softly leans toward parent to anchor boundaries
        borderColor = mixColors(surface, parentSurface, 0.58);
      } else {
        // Inset/Sunken surface: slight highlight rim
        borderColor = mixColors(surface, '#ffffff', 0.12);
      }
    }

    // Shadow Parameters (Negative spread prevents mudiness, creates airy optical depth)
    let shadowCss = 'none';
    if (hasShadow) {
      const alpha = 0.05 + 0.22 * depthNeed;
      const blur = 6 + 28 * (elevation / 6) * (0.75 + 0.25 * depthNeed);
      const y = 1.5 + 15 * (elevation / 6);
      const spread = -Math.max(1, blur * 0.38);
      shadowCss = `0 ${y.toFixed(1)}px ${blur.toFixed(1)}px ${spread.toFixed(1)}px rgba(0, 0, 0, ${alpha.toFixed(3)})`;
    }

    // Concentric Geometry
    const parentRadius = typeof node.parentRadius === 'number' ? node.parentRadius : 24;
    const padding = typeof node.padding === 'number' ? node.padding : 16;
    const radius = Math.max(0, parentRadius - padding);

    return {
      id: node.id || 'node',
      label: node.label || rConfig.name,
      role: roleKey,
      surface,
      parentSurface,
      depth,
      elevation,
      interactive,
      lumNode,
      lumParent,
      deltaL,
      separation,
      fillClarity,
      edgeNeed,
      depthNeed,
      mode,
      hasBorder,
      hasShadow,
      borderWidth: borderWidth ? `${borderWidth.toFixed(2)}px` : '0px',
      borderColor,
      shadowCss,
      radius: `${radius}px`,
      rawRadius: radius,
      computedStyle: {
        backgroundColor: surface,
        border: hasBorder ? `${borderWidth.toFixed(2)}px solid ${borderColor}` : 'none',
        boxShadow: shadowCss,
        borderRadius: `${radius}px`
      }
    };
  }

  // --- 5. COMPONENT CONCENTRIC GEOMETRY HELPER ---

  function computeConcentricRadius(parentRadius, padding) {
    return Math.max(0, parentRadius - padding);
  }

  return {
    parseHex,
    rgbToHex,
    relativeLuminance,
    contrastRatio,
    mixColors,
    getOklchLightness,
    generateSurfaceLadder,
    ROLES,
    evaluateNode,
    computeConcentricRadius
  };
})();

if (typeof window !== 'undefined') {
  window.UI99 = UI99;
}
