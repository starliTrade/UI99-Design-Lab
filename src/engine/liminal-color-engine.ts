/**
 * LIMINAL COLOR SYSTEM — LOCKED SPEC v1.0
 * The definitive design-system color contract.
 */

export interface SemanticRole {
  subtle: string;
  border: string;
  text: string;
  solid: string;
  onSolid: string;
}

export class LiminalColorEngine {
  // 2. SEMANTIC SET (4 roles each: subtle / border / text / solid)
  // INVARIANT: subtle and border must share the hue of `solid` for the same role.
  // Enforced by src/engine/__tests__/tokens.test.ts (hue-consistency test).
  static readonly SEMANTICS: Record<'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO', SemanticRole & { hue: number }> = {
    SUCCESS: {
      hue: 155,
      subtle: 'rgba(52, 192, 139, 0.10)',
      border: 'rgba(52, 192, 139, 0.22)',
      text: '#6EE0B4',
      solid: 'var(--liminal-success, #34C08B)',
      onSolid: '#04140D',
    },
    WARNING: {
      hue: 85,
      subtle: 'rgba(233, 180, 76, 0.10)',
      border: 'rgba(233, 180, 76, 0.22)',
      text: '#F2CE77',
      solid: 'var(--liminal-warning, #E9B44C)',
      onSolid: '#1A1204',
    },
    DANGER: {
      hue: 15,
      subtle: 'rgba(226, 85, 85, 0.10)',
      border: 'rgba(226, 85, 85, 0.22)',
      text: '#F091A2',
      solid: 'var(--liminal-danger, #E25555)',
      onSolid: '#1A060A',
    },
    INFO: {
      hue: 230,
      subtle: 'rgba(79, 143, 234, 0.10)',
      border: 'rgba(79, 143, 234, 0.22)',
      text: '#8CC3F2',
      solid: 'var(--liminal-info, #4F8FEA)',
      onSolid: '#04101A',
    },
  };

  // 3. EXTENDED SPECTRUM (12 hues, text role, chroma compensated)
  static readonly EXTENDED_SPECTRUM: Array<{ hue: number; hex: string; label: string }> = [
    { hue: 15, hex: '#E88A93', label: 'Ruby' },
    { hue: 40, hex: '#E8A87C', label: 'Coral' },
    { hue: 75, hex: '#D9BE6E', label: 'Amber' },
    { hue: 110, hex: '#A8CC74', label: 'Lime' },
    { hue: 145, hex: '#74CE8E', label: 'Emerald' },
    { hue: 175, hex: '#5FCDBB', label: 'Teal' },
    { hue: 200, hex: '#56C6E0', label: 'Cyan' },
    { hue: 230, hex: '#6FA8EC', label: 'Sapphire' },
    { hue: 260, hex: '#8B9CF0', label: 'Indigo' },
    { hue: 290, hex: '#A98BEA', label: 'Violet' },
    { hue: 320, hex: '#C983D6', label: 'Fuchsia' },
    { hue: 350, hex: '#E083AE', label: 'Rose' },
  ];

  // 4. BRAND PRIMARY (referencing CSS Variables with fallback)
  static readonly BRAND_PRIMARY = {
    hex: 'var(--liminal-brand, #E9ECF2)',
    name: 'Soft White',
    onColor: 'var(--liminal-brand-on, #060709)',
    description: 'Monochrome identity. LOCKED. Swap-able to any extended hue if rebranded.',
  };

  /**
   * Helper function to retrieve ladder colors referencing CSS Variables
   *
   * The fallbacks mirror LADDER in spec-engine.ts (the single source of truth).
   * If you change the ladder, change it there first, then here and in index.css.
   */
  static getLadderColor(level: number): string {
    const colors = [
      'var(--liminal-s0, #060709)',
      'var(--liminal-s1, #090a0d)',
      'var(--liminal-s2, #0c0d11)',
      'var(--liminal-s3, #0f1014)',
      'var(--liminal-s4, #121317)',
      'var(--liminal-s5, #15161b)',
    ];
    return colors[Math.min(Math.max(Math.round(level), 0), 5)] || 'var(--liminal-s2, #0c0d11)';
  }

  // 5. RAMP FORMULA
  static getHueFactor(H: number): number {
    if (H < 60) return 1.00;
    if (H < 120) return 0.85;
    if (H < 200) return 0.95;
    if (H < 280) return 1.10;
    return 1.00;
  }

  static getRamp(H: number) {
    const factor = this.getHueFactor(H);
    const cText = (0.13 * factor).toFixed(3);
    const cSolid = (0.16 * factor).toFixed(3);
    return {
      hue: H,
      hueFactor: factor,
      baseOklch: `oklch(0.78 ${cText} ${H})`,
      solidOklch: `oklch(0.70 ${cSolid} ${H})`,
      onSolid: '#060709',
    };
  }

  // 6. STATE FORMULA
  static getStateStyle(params: {
    baseL: number;
    baseColor?: string;
    state: 'idle' | 'hover' | 'focus' | 'active' | 'disabled';
    isSolid?: boolean;
    solidColor?: string;
  }) {
    let L = params.baseL;
    let outline = 'none';
    let opacity = 1.0;

    if (params.state === 'hover') {
      L += 0.05;
    } else if (params.state === 'focus') {
      // Focus ring: 2px solid ${baseColorAtAlpha0.45}
      // Note: For neutral elements, ring comes from spec-engine (ladder(n+1)).
      const ringColor = params.baseColor
        ? (params.baseColor.startsWith('#')
            ? `${params.baseColor}73`
            : params.baseColor.startsWith('var(')
            ? 'rgba(233, 236, 242, 0.45)'
            : params.baseColor.replace(/[\d.]+\)$/g, '0.45)'))
        : 'rgba(233, 236, 242, 0.45)';
      outline = `2px solid ${ringColor}`;
    } else if (params.state === 'active') {
      L -= 0.05;
    } else if (params.state === 'disabled') {
      // Opacity 0.35 applies strictly to colored text/icon/semantic buttons.
      // Note: For neutral surfaces/controls, disabled opacity is 0.25 (per spec-engine).
      opacity = 0.35;
    }

    return {
      L: Math.max(0, Math.min(1, L)),
      outline,
      opacity,
    };
  }

  static hexToRgb(hex: string): { r: number; g: number; b: number } {
    let cleanHex = hex;
    if (cleanHex.startsWith('var(')) {
      const match = cleanHex.match(/,\s*(#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3})/);
      cleanHex = match ? match[1] : '#E9ECF2';
    }
    const c = cleanHex.replace('#', '');
    return {
      r: parseInt(c.substring(0, 2), 16) || 233,
      g: parseInt(c.substring(2, 4), 16) || 236,
      b: parseInt(c.substring(4, 6), 16) || 242,
    };
  }

  static readonly MIST_SPEC = {
    hero: {
      ring: 0.18, ringBlur: 9, backdropBlur: 16,
      halo1: '0 0 44px', halo1a: 0.07,
      halo2: '0 0 90px', halo2a: 0.04,
      caustic: 0.06, whisper: 0.048, shade: 0.30,
      fill: 'linear-gradient(180deg, rgba(13,14,18,0.66) 0%, rgba(10,11,15,0.48) 100%)',
    },
    quiet: {
      ring: 0.16, ringBlur: 10, backdropBlur: 16,
      halo1: '0 0 40px', halo1a: 0.06,
      halo2: '0 0 84px', halo2a: 0.035,
      caustic: 0.055, whisper: 0.044, shade: 0.28,
      fill: 'linear-gradient(180deg, rgba(13,14,18,0.60) 0%, rgba(10,11,15,0.44) 100%)',
    },
  } as const;

  /**
   * LIMINAL MIST — light as fog, no crisp geometry.
   * ring layer must be rendered as a separate absolutely-positioned
   * element (border 1px + filter blur), because pseudo-elements
   * cannot be set via inline styles.
   */
  static getMistStyle(hex: string, tier: MistTier = 'quiet') {
    const { r, g, b } = this.hexToRgb(hex);
    const S = this.MIST_SPEC[tier];
    return {
      background: S.fill,
      backdropFilter: `blur(${S.backdropBlur}px)`,
      WebkitBackdropFilter: `blur(${S.backdropBlur}px)`,
      boxShadow: [
        `${S.halo1} rgba(${r}, ${g}, ${b}, ${S.halo1a})`,
        `${S.halo2} rgba(${r}, ${g}, ${b}, ${S.halo2a})`,
        `inset 0 -6px 22px -6px rgba(${r}, ${g}, ${b}, ${S.caustic})`,
        `inset 0 1px 14px rgba(${r}, ${g}, ${b}, ${S.whisper})`,
        `inset 0 4px 14px -4px rgba(1, 2, 3, ${S.shade})`,
      ].join(', '),
      ringLayer: {
        position: 'absolute', inset: 0,
        borderRadius: 'inherit',
        border: `1px solid rgba(${r}, ${g}, ${b}, ${S.ring})`,
        filter: `blur(${S.ringBlur}px)`,
        pointerEvents: 'none',
      } as const,
    };
  }
}

export type MistTier = 'hero' | 'quiet';

export function getMistStyle(tier: MistTier = 'quiet') {
  return LiminalColorEngine.getMistStyle(LiminalColorEngine.BRAND_PRIMARY.hex, tier);
}

