import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vitest configuration for the LIMINAL engine and component kit.
 *
 * The suite is split by intent:
 *  - `tokens.test.ts`  → proves the design contract (contrast floors, ladder, radius)
 *  - `color-math.test.ts` → proves the math the contract is built on
 *  - `components/*.test.tsx` → render + accessibility smoke tests
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      include: ['src/engine/**/*.{ts,tsx}', 'src/components/**/*.tsx'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/**/*Demo.tsx', 'src/test/**'],
    },
  },
});
