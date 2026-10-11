# Contributing to LIMINAL

Thanks for helping build LIMINAL. This document explains how the project works so
your change lands smoothly.

## The one rule that matters

**Every claim in `DESIGN-CONTRACT.md` must be executable.**

If you change a token, a contrast floor, a ladder step or a radius rule, you must
change the code *and* the test that proves it. A rule that is not asserted in
`src/engine/__tests__/` is a rule nobody enforces, and it will drift.

```
Experiment → Measure → Derive → Validate → Integrate
```

## Setup

```bash
bun install
bun run dev        # design lab on http://localhost:3000
```

## Before you open a pull request

```bash
bun run verify     # typecheck + lint + test + build
```

CI runs the same command. A pull request that does not pass it will not be merged.

| Command | What it does |
| --- | --- |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run lint` | ESLint (0 errors required; warnings are tracked debt) |
| `bun run test` | Vitest — design contract + component accessibility |
| `bun run build` | Production build |
| `bun run format` | Prettier |

## Changing a design token

1. Edit the token in `src/engine/spec-engine.ts` — **it is the single source of truth.**
2. Mirror it in `src/index.css` (`--liminal-*`) and in the `getLadderColor`
   fallbacks in `src/engine/liminal-color-engine.ts`.
3. Update `DESIGN-CONTRACT.md`.
4. Run `bun run test`. If a contrast or ΔL assertion fails, the change is not
   ready — fix the value, not the test.

Never relax a contrast floor to make a change pass. Contrast floors are a
product decision, not a test detail.

## Adding a component

- One component per directory, with an `index.ts` barrel export.
- Styles come from the engine (`getLiminalStyle`, `LiminalColorEngine`,
  `LiminalLayoutEngine`, `LiminalMotionEngine`) — no hardcoded colors, spacing
  or durations.
- Every interactive component must:
  - be reachable and operable by keyboard,
  - expose correct ARIA semantics,
  - render without axe violations (add a case to
    `src/components/__tests__/accessibility.test.tsx`),
  - respect `prefers-reduced-motion` for any animation.
- A visible label must be programmatically associated with its control
  (`htmlFor` / `aria-labelledby`). A `<label>` without an association is a bug.

## Commit messages

Conventional Commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `ci:`, `chore:`.

Explain *why* in the body. If you fixed a contract violation, say which rule was
broken and how the test now catches it.

## Accessibility

Accessibility is a feature, not a phase. WCAG 2.2 AA is the floor:

- normal text ≥ 4.5:1, large text and non-text UI ≥ 3:1,
- keyboard focus must always be visible,
- no information conveyed by color alone.

## Reporting bugs

Open an issue with: what you expected, what happened, and a minimal reproduction.
For accessibility bugs, include the assistive technology and browser you used.
