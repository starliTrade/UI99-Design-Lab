/**
 * LIMINAL · STUDIO — THE LIVE THEME
 *
 * The engine's whole claim is that a theme is three numbers: a hue, a density
 * and a motion. `createLiminalTheme` turns them into a CSS block scoped to
 * `[data-liminal-theme="…"]`, and the studio puts that attribute on itself — so
 * moving a slider re-themes the tool you are auditing with, not a picture of it.
 *
 * The theme is generated, never hand-written, and the studio reads the SAME
 * function a consumer would. If the studio could theme itself by some other
 * path, it would prove nothing about the engine.
 */
import { useMemo } from 'react';
import { createLiminalTheme, type LiminalTheme } from '../engine/liminal-theme';
import { LADDER_CHROMA, LADDER_HUE } from '../engine/liminal-ladder';

export interface StudioThemeState {
  brandHue: number;
  brandChroma: number;
  density: number;
  motion: number;
}

/** The system's own values. A theme that changes nothing is the reference. */
export const SYSTEM_THEME: StudioThemeState = {
  brandHue: LADDER_HUE,
  brandChroma: LADDER_CHROMA,
  density: 1,
  motion: 1,
};

/** The attribute the generated block is scoped to. */
export const STUDIO_THEME_SCOPE = 'studio';

export function useStudioTheme(state: StudioThemeState): LiminalTheme {
  return useMemo(
    () => createLiminalTheme({ ...state, name: STUDIO_THEME_SCOPE }),
    [state.brandHue, state.brandChroma, state.density, state.motion],
  );
}

/** Whether the state is the system's own, so the UI can say so. */
export function isSystemTheme(s: StudioThemeState): boolean {
  return (
    s.brandHue === SYSTEM_THEME.brandHue &&
    s.brandChroma === SYSTEM_THEME.brandChroma &&
    s.density === SYSTEM_THEME.density &&
    s.motion === SYSTEM_THEME.motion
  );
}
