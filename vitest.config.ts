import { defineConfig } from 'vitest/config';

/**
 * Vitest for the ladder engine. The suite is the policy's proof:
 * src/engine/__tests__/ladder-b.test.ts checks every approved value and rule.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
