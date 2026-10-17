/**
 * LIMINAL · DOCS — THE LIVE THEME
 *
 * The engine's claim is that a theme is two SCALES: a density and a motion.
 * `createLiminalTheme` turns them into a CSS block scoped to
 * `[data-liminal-theme="…"]`, and the docs put that attribute on their own root
 * — so moving a slider re-themes the site you are reading, not a picture of it.
 *
 * It used to be three numbers, the third a hue. The hue turned the ladder green
 * or purple, which is not a theme — it is leaving the system. The ladder is the
 * identity and an identity is not a setting.
 *
 * The theme is generated, never hand-written, and the docs read the SAME
 * function a consumer would. If the docs could theme themselves by another
 * path, they would prove nothing about the engine.
 */
import React, { createContext, useContext, useMemo, useState } from 'react';
import { createLiminalTheme, type LiminalTheme } from '../engine/liminal-theme';

export interface ThemeState {
  density: number;
  motion: number;
}

/**
 * The system's own values. A theme that changes nothing is the reference.
 *
 * There is no hue here, and that is the point: LIMINAL's identity is monochrome
 * — the ladder is a luminance ramp at chroma 0.0069 and the code calls the brand
 * "Monochrome identity. LOCKED." A ramp that can turn green is not an identity.
 */
export const SYSTEM_THEME: ThemeState = {
  density: 1,
  motion: 1,
};

const SCOPE = 'liminal';

export function isSystemTheme(s: ThemeState): boolean {
  return s.density === SYSTEM_THEME.density && s.motion === SYSTEM_THEME.motion;
}

interface ThemeContextValue {
  state: ThemeState;
  theme: LiminalTheme;
  set: (next: ThemeState) => void;
  reset: () => void;
  isSystem: boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [state, set] = useState<ThemeState>({ ...SYSTEM_THEME });
  const theme = useMemo(() => createLiminalTheme({ ...state, name: SCOPE }), [state.density, state.motion]);
  const value = useMemo<ThemeContextValue>(
    () => ({ state, theme, set, reset: () => set({ ...SYSTEM_THEME }), isSystem: isSystemTheme(state) }),
    [state, theme],
  );
  return (
    <ThemeContext.Provider value={value}>
      {/* The attribute is the switch; the generated block is the theme. */}
      <div data-liminal-theme={SCOPE} style={{ display: 'contents' }}>
        <style>{theme.css}</style>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
