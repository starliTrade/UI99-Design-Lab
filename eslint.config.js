import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'design-lab/**', 'coverage/**'],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // The engine deliberately uses `any` in a few generic boundaries and the
      // codebase still carries unused imports. These are warnings so CI stays
      // green while the debt is paid down; they must not become permanent.
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],

      // React Compiler-era rules that flag the current JS state-machine styling
      // architecture. Phase 3 replaces per-hover setState with CSS `data-state`,
      // which removes these violations at the source. Kept as warnings so they
      // stay visible and countable until then.
      'react-hooks/static-components': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/immutability': 'warn',

      // Real correctness rules stay as errors.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
      'prefer-const': 'error',
    },
  },
  {
    // ── The raw-value ban ──────────────────────────────────────────────────
    // Components must consume tokens, never literals. The engine is the only
    // place a colour, easing or duration may be written by hand.
    //
    // This is the rule every mature design system has (stylelint's
    // declaration-property-value-disallowed-list, MUI's theme lint). Without it
    // a token layer is advisory: the audit found 92 hardcoded hexes and a
    // hand-written copy of the contract that had drifted three changes behind.
    files: ['src/components/**/*.{ts,tsx}', 'src/app/**/*.{ts,tsx}'],
    ignores: ['src/components/**/*Demo.tsx', 'src/components/KitShowcase.tsx'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^#[0-9a-fA-F]{3,8}$/]',
          message:
            'Raw hex colour. Use the engine: getLadderColor(), LiminalColorEngine, or getTextStyle().',
        },
        {
          selector: 'Literal[value=/^rgba?\\(/]',
          message: 'Raw rgb()/rgba() colour. Use the engine (LiminalColorEngine / getTextStyle).',
        },
        {
          selector: 'Literal[value=/^cubic-bezier\\(/]',
          message: 'Raw easing curve. Use LiminalMotionEngine.EASING.',
        },
      ],
    },
  },
  prettier,
);
