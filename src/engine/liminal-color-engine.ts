/**
 * LIMINAL COLOR SYSTEM — LOCKED SPEC v1.0
 * The definitive design-system color contract.
 */

export interface SemanticRole {
  /**
   * The character that carries the meaning when colour cannot.
   *
   * A coloured dot says "there is a state here" but not WHICH one; under
   * protanopia, deuteranopia, tritanopia or total colour blindness the four
   * semantics collapse into two or one. A shape survives all of them, which is
   * why the meaning lives here and the colour only reinforces it
   * (WCAG 2.2 · 1.4.1 Use of Colour).
   */
  glyph: string;
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
      glyph: '✓',
      hue: 155,
      subtle: 'rgba(52, 192, 139, 0.10)',
      border: 'rgba(52, 192, 139, 0.22)',
      text: '#6EE0B4',
      solid: 'var(--liminal-success, #34C08B)',
      onSolid: '#04140D',
    },
    WARNING: {
      glyph: '!',
      hue: 85,
      subtle: 'rgba(233, 180, 76, 0.10)',
      border: 'rgba(233, 180, 76, 0.22)',
      text: '#F2CE77',
      solid: 'var(--liminal-warning, #E9B44C)',
      onSolid: '#1A1204',
    },
    DANGER: {
      glyph: '×',
      hue: 15,
      subtle: 'rgba(226, 85, 85, 0.10)',
      border: 'rgba(226, 85, 85, 0.22)',
      text: '#F091A2',
      solid: 'var(--liminal-danger, #E25555)',
      onSolid: '#1A060A',
    },
    INFO: {
      glyph: 'i',
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
    /** Lifted for hover — the brand is near-white, so hover goes lighter, not darker. */
    hover: '#F5F7FA',
    /** Pressed. */
    active: '#DDE1E8',
    description: 'Monochrome identity. LOCKED. Swap-able to any extended hue if rebranded.',
  };

  // ── REMOVED 2026-10-12: six stale bodies ───────────────────────────────
  //
  // getLadderColor held a SECOND ladder, with five wrong fallbacks out of six
  // (#08090b for a real #07090b, #0a0b10 for a real #090b0d, ...) and a
  // hard-coded 6-step ceiling while LADDER has nine. MIST_SPEC plus
  // getMistStyle were a whole second mist system, still describing
  // backdrop-blur halos and rgba(13,14,18) — a colour that is not a ladder
  // value at all. getStateStyle re-derived the state rule that liminal-surface
  // owns. getRamp/getHueFactor and the class hexToRgb had no callers.
  //
  // None had a consumer. All were exported, so they read as live API while
  // describing a system that no longer exists — the mistCssVars() hazard: a
  // stale body sitting beside the real one, passing every build.
  //
  // The live paths are: liminal-ladder (LADDER), liminal-surface
  // (resolveSurface/resolveBorder/resolveInset), liminal-mist (mistCssVars),
  // liminal-color-math (hexToRgb).

}

