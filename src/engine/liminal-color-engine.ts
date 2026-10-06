/**
 * LIMINAL COLOR SYSTEM — LOCKED SPEC v1.0
 * The definitive design-system color contract.
 */

export interface NeutralStep {
  level: string;
  name: string;
  hex: string;
  oklch: string;
}

export interface SemanticRole {
  subtle: string;
  border: string;
  text: string;
  solid: string;
  onSolid: string;
}

export class LiminalColorEngine {
  /**
   * @deprecated
   * Canonical surface source = LADDER in spec-engine.ts (#060709..#131418).
   * Text = TEXT_HIERARCHY (white with alpha).
   * Border = directional rim (not flat grey).
   * Retained for backward-compatibility only.
   */
  static readonly NEUTRALS: Record<string, NeutralStep> = {
    L0: { level: 'L0', name: 'base', hex: '#060709', oklch: 'oklch(0.16 0.01 260)' },
    L1: { level: 'L1', name: 'surface', hex: '#0B0C0F', oklch: 'oklch(0.19 0.01 260)' },
    L2: { level: 'L2', name: 'raised', hex: '#121317', oklch: 'oklch(0.22 0.01 260)' },
    L3: { level: 'L3', name: 'overlay', hex: '#1A1B20', oklch: 'oklch(0.26 0.01 260)' },
    L4: { level: 'L4', name: 'border-subtle', hex: '#24252B', oklch: 'oklch(0.30 0.01 260)' },
    L5: { level: 'L5', name: 'border', hex: '#33343B', oklch: 'oklch(0.36 0.01 260)' },
    L6: { level: 'L6', name: 'text-muted', hex: '#8A8F98', oklch: 'oklch(0.55 0.01 260)' },
    L7: { level: 'L7', name: 'text', hex: '#DDE1E8', oklch: 'oklch(0.75 0.01 260)' },
    L8: { level: 'L8', name: 'text-strong', hex: '#F5F7FA', oklch: 'oklch(0.90 0.01 260)' },
  };

  // 2. SEMANTIC SET (4 roles each: subtle / border / text / solid)
  static readonly SEMANTICS: Record<'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO', SemanticRole & { hue: number }> = {
    SUCCESS: {
      hue: 155,
      subtle: 'rgba(52, 192, 139, 0.10)',
      border: 'rgba(52, 192, 139, 0.22)',
      text: '#6EE0B4',
      solid: '#34C08B',
      onSolid: '#04140D',
    },
    WARNING: {
      hue: 85,
      subtle: 'rgba(233, 180, 76, 0.10)',
      border: 'rgba(233, 180, 76, 0.22)',
      text: '#F2CE77',
      solid: '#E9B44C',
      onSolid: '#1A1204',
    },
    DANGER: {
      hue: 15,
      subtle: 'rgba(229, 99, 122, 0.10)',
      border: 'rgba(229, 99, 122, 0.22)',
      text: '#F091A2',
      solid: '#E5637A',
      onSolid: '#1A060A',
    },
    INFO: {
      hue: 230,
      subtle: 'rgba(90, 167, 232, 0.10)',
      border: 'rgba(90, 167, 232, 0.22)',
      text: '#8CC3F2',
      solid: '#5AA7E8',
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

  // 4. BRAND PRIMARY
  static readonly BRAND_PRIMARY = {
    hex: '#E9ECF2',
    name: 'Soft White',
    onColor: '#060709',
    description: 'Monochrome identity. LOCKED. Swap-able to any extended hue if rebranded.',
  };

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
}
