import '@testing-library/jest-dom/vitest';

/**
 * Global test setup.
 *
 * `matchMedia` is not implemented by jsdom but is required by the LIMINAL hooks
 * (`useMediaQuery`, `useReducedMotion`). We provide a deterministic default:
 * no media query matches, which mirrors the "no preference" desktop state.
 */
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
