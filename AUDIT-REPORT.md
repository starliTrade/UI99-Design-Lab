# LIMINAL — ممیزی بیرحمانه در برابر بهترین سیستم‌های طراحی جهان

> **تاریخ:** ۲۰۲۶-۱۰-۱۳ · **کامیت:** `bb26cf8` · **دامنه:** مقایسه با ۱۸ سیستم جهانی در ۱۰ محور
>
> این سند جایگزین ممیزی قبلی است. آن گزارش وضعیتی را توصیف می‌کرد که دیگر وجود ندارد
> (ΔL = 0.015، بدون تست، بدون RTL) و به‌عنوان تاریخ نگه داشته نمی‌شود.
>
> **همه‌ی ادعاهای بحرانی این گزارش را خودم در ریپو راستی‌آزمایی کردم** و هر کدام تأیید شد:
> `Select` (try/catch که هرگز catch نمی‌شود) · `Modal` (id ثابت) · barrel (بدون `layout`/`composites`) ·
> `liminal-motion-engine` (تزریق `<style>` در زمان import) · صفر `React.memo` · صفر `forced-colors` ·
> `Tabs` بدون tabpanel · `Calendar` بدون roving tabindex · `transition: all` · `REDUCED_MOTION_STYLE` کد مرده.
>
> **خلاصه‌ی حکم:** «ایده‌های واقعی دارد؛ هنوز محصول ندارد.»

---

# LIMINAL (UI99 Design Lab) — Ruthless, Evidence-Based Audit vs. the World's Best Design Systems

**Repo state examined:** `/root/workspace/UI99-Design-Lab` @ commit `bb26cf8`, 101 commits over **8 calendar days** (2026‑10‑03 → 2026‑10‑12). I ran the toolchain myself: `456/456` tests pass in 24 files (~32s), `tsc --noEmit` clean, ESLint **0 errors / 389 warnings**, `vite build` → a single 710 KB JS / 40 KB CSS **SPA demo bundle**. I did not edit any file.

A prior `AUDIT-REPORT.md` sits in the repo describing an *earlier* state (ΔL = 0.015, no tests, no RTL). Much of what it flagged has since been fixed. This report audits the **current** state; where the old doc is now wrong, I say so.

---

## 0. What is actually in the repo (the ground truth)

| | Reality |
|---|---|
| Source | `src/engine/` 35 files, ~4,950 lines · `src/components/` ~5,200 lines · `design-lab/` 28 single‑page HTML experiments |
| Components | ~**45 distinct public components** (61 non-demo/non-test `.tsx` files incl. subparts); barrels export `*Demo` too |
| Tests | 24 files / 456 tests. **~78–90% are engine/token tests**; component tests = `a11y-sweep` (33), `accessibility` (~13), `tag` (14), `badge` (13), `calendar-jalali` (13), `focus-state` (5) |
| Packaging | `"private": true`. **No `main`/`module`/`exports`/`files`/`sideEffects`.** No lib build config (`vite.config.ts` is app-only) |
| CI | `.github/workflows/ci.yml`: on every `push` + PR → typecheck · lint · test · build. Nothing else |
| Docs | `DESIGN-CONTRACT.md` (441 lines, machine-generated blocks), bilingual Persian-first `README.md`, `LIMINAL-ROADMAP.md`, stale `AUDIT-REPORT.md` |
| Absent | no CHANGELOG, no changesets, no Storybook, no docs site, no size-limit, no visual regression, no Playwright, no SSR test, no codemods, no npm publish |

The single most important structural fact: **this is a first-class colour/perception engine with a promising but thin component kit bolted on, and no way for anyone outside the repo to install it.**

---

## 1. Token architecture

**What LIMINAL has (and where it's genuinely good):**
- One source of truth for the ladder (`liminal-ladder.ts`), the surface/rim/shadow rules (`spec-engine.ts`, `liminal-surface.ts`), layout/type (`liminal-layout-engine.ts`), motion (`liminal-motion-engine.ts`).
- A **generated** `:root` block (`liminal-css-vars.ts:41 generateCssVars()`) — ~90 `--liminal-*` vars — with a test asserting `src/index.css` matches the generator byte-for-byte (`css-vars.test.ts`). The contract Markdown is *also* generated from the engine (`liminal-contract.ts`) with a parity test (`contract.test.ts`). **This is real anti-drift engineering and it is better than most systems' docs.**
- A `.dark` scope is emitted for future theming (`liminal-css-vars.ts:157`).

**What is missing vs. the leaders:**
- **No DTCG/W3C design-tokens format.** Radix, Spectrum, Carbon, Primer, Fluent 2, Atlassian all publish DTCG tokens consumable by Style Dictionary → CSS/JS/Swift/Android/Figma. LIMINAL's tokens are TypeScript constants + a hand-rolled CSS emitter. The roadmap admits this (`LIMINAL-ROADMAP.md` Phase 2, unchecked).
- **No multi-brand / no theme API.** `BRAND_PRIMARY` is a locked Soft-White constant (`liminal-color-engine.ts:235`). There is no "swap the hue" entry point. M3 (seed→scheme), Ant (`theme.token`), Chakra (semantic tokens), Fluent (theme objects) all ship this.
- **No density scale.** Carbon (short/medium/tall), Spectrum (desktop/mobile), Fluent, Ant (`componentSize`) ship density. LIMINAL has one density.
- **No token versioning / deprecation policy** despite claiming it in the roadmap.
- **Semantic vs primitive layering is partial.** There is a primitive layer (LADDER, SPACING) and role-based resolvers (`resolveSurface({role})`), which is good — but the CSS var names are primitive-ish (`--liminal-s3`), and there is **no semantic variable tier** (`--surface-panel`, `--text-body`) that consumers theme against. Every consumer either calls the engine or reads a primitive var.
- **The barrel is broken in a small but telling way:** `src/components/index.ts` re-exports atoms/inputs/containers/feedback/data/nav but **omits `layout` and `composites`**. And every category barrel `export * from './*Demo'`, shipping demo code in the public surface.

**Verdict vs leaders:** below every serious system on the *distribution* of tokens; above them on *drift-proofing* of a single-theme palette.

**Score: 6/10.**

---

## 2. Colour science — is the measured quantum real, or a novelty?

Let me separate the two claims.

**(a) The "measured quantum" ladder.** `PERCEPTUAL_QUANTUM = 0.0083`, `RELIABLE_BOUNDARY = 0.0112` (`liminal-ladder.ts:39-42`), derived from `.threshold-sessions.json` (a constant-stimuli psychophysics run: 8 levels × 6 reps + 4 catch trials, 3 sessions, `catchN: 4, falseAlarms: 0`). The ladder is then **generated** by `L(n) = 0.128 + n × 0.009475`, with hue 258.4° and chroma 0.0069 held constant, and a test proves the formula reproduces all 9 hexes exactly (`tokens.test.ts:77`). Contrast tests assert every realised step ∈ [1q, 1.5q].

Honest read: **the methodology is more rigorous than almost any design system's**, and the "generate the scale, don't pick it" discipline is genuinely the right idea (it's Leonardo's and Radix Colors' idea too). But the measurement is **n=1, self-administered, on the author's own display**, and it's used to justify an 8-bit-hex-quantised ladder where the actual steps land at 1.07q–1.27q (i.e. the display can't even hit the target). Calling a single-observer threshold a system-wide "quantum" is a **soft claim dressed as a hard one**. M3 does not pretend to a measured psychophysical threshold, but it does something harder and more useful: **HCT** (CAM16 + L*) tonal palettes 0–100, and **dynamic colour from a single seed** — the entire scheme derived, plus automatic light/dark and high-contrast variants. Radix Colors ships a **12-step scale with a documented job per step** (`1 app bg … 9 solid … 11 low-contrast text … 12 high-contrast text`) across ~30 hues × L/D. Radix's use-per-step table is a stronger *product* than a 9-step dark-only ladder.

**(b) Contrast-as-input, dual-lens.** This is LIMINAL's strongest colour-science claim. `deriveTextToken()` (`liminal-contrast.ts:213`) derives each text alpha from **both** an APCA 0.1.9 floor (Lc 90/75/75/30) *and* a WCAG floor (4.5/4.5/4.5/3), taking the **stricter**, and there is no code path that returns a failing colour. Semantic roles are derived the same way, including the fill's lightness chosen so white text clears both lenses (`liminal-color-engine.ts:77-101`). This is exactly the Leonardo lesson and **almost nobody in production does it** — Radix Colors ships pre-computed per-step contrast, M3 has HCT contrast utilities, but a dual-lens *derivation* at token-emit time is ahead of the pack. The `boundBy: 'wcag' | 'apca'` field on the returned token is a genuinely good piece of design (it makes the *reason* auditable).

**Where leaders are clearly ahead:** no light mode at all; no dynamic generation from a seed (M3); no per-hue 12-step semantic scale with documented jobs (Radix Colors); no contrast *curve* tooling (Leonardo). Dark-only is defensible as identity, but it caps the addressable surface.

**Score: 7/10** — the derivation engine is world-class for its niche; the palette breadth and theming are not.

---

## 3. Component API design

**What's genuinely Radix-shaped and good:**
- `createLiminalComponent` factory (`liminal-component.ts:80`) → `forwardRef` + `asChild` + `data-liminal-component`.
- `Slot` with proper prop merging: style spread, className join, **event handler composition with `defaultPrevented` gating**, and `composeRefs` (`liminal-slot.tsx:92`). This is a faithful Radix Slot, and the event-chaining semantics are right.
- `createVariants` — a **cva clone that returns `CSSProperties` instead of class strings** (`liminal-variants.ts`), with `base/variants/compoundVariants/defaultVariants` and `VariantProps` extraction. This is a real, coherent idea.
- `resolveSurface({ role, state, on })` — components declare *what they are*, not which ladder level (`liminal-surface.ts:197`), enforced by an **ESLint rule banning `getLadderColor()` in components** (`eslint.config.js`). That is a stronger API constraint than Radix imposes.

**Where it's weaker than the primitives layer:**
- **Breadth:** ~45 components vs Radix Primitives ~35 *primitives* (but each with a full compound API), Base UI ~35, Mantine 100+, Ant 70+, Fluent 2 ~50, Spectrum ~100. LIMINAL's 45 include 8 "demo only" stubs and subparts.
- **No polymorphic `as`** on most components (only `Button` has `asChild`; `LiminalWrapper` has `as` but is barely used). Radix/Chakra/Mantine expose `as`/`asChild` system-wide.
- **Controlled/uncontrolled is inconsistent.** `Select`/`Input`/`Combobox` implement `value`/`defaultValue`; **`Tabs`, `Modal`, `DropdownMenu`, `Accordion-less` are controlled-only** (no `defaultValue`). React Aria/Radix give every stateful component both.
- **No form integration:** no `name`/`form` wiring into a `Form`/`Field` with validation context, no `react-hook-form` integration (roadmap Phase 3, unchecked). `Input` has `name` only. Radix/RAC/Ant/Mantine all ship `Form` + `Field` + error announcement.
- **Ref forwarding is ad-hoc.** `Button`/`Input`/`Select` hand-roll a `setXRef` closure that duplicates `composeRefs` (`Select.tsx:96`, `Input.tsx:108`) — the engine has `composeRefs`, and the components re-implement it worse.
- **A latent bug in `Select`:** to support two `onChange` signatures it does `try { onChange(newVal) } catch { onChange(e) }` (`Select.tsx:241-248`). An event-style handler called with a string does **not throw**, so the catch never fires and the caller receives a string instead of an event. This is the kind of API ambiguity the leaders eliminate with one signature.
- **`Modal` uses a fixed DOM id** `id="liminal-modal-title"` (`Modal.tsx:159`); two modals on a page produce duplicate IDs. Radix/React Aria use `useId`.

**Score: 4/10** — the *shape* is right (Slot, cva, role-based resolvers), but breadth, polymorphism, form integration, and controlled/uncontrolled consistency are all behind Base UI/Radix/React Aria/Mantine.

---

## 4. Accessibility

**Real strengths:** CSS-native `:focus-visible` (`liminal-interaction.css:124`), a hand-rolled `useFocusTrap` with focus restore (`liminal-hooks.ts:102`), `useScrollLock` with ref-count + scrollbar-width compensation (`liminal-hooks.ts:187`), `useRovingTabIndex`, global `prefers-reduced-motion` in the CSS layer, a 15:1 focus ring token asserted ≥3:1 across all nine surfaces (`liminal-ladder.ts:139`).

**The critical gap: the axe sweep covers exactly the components where axe has nothing to find.** `a11y-sweep.test.tsx` renders 33 components — Button, Badge, Input, Card, Divider, Grid, Breadcrumb… The **14 components excluded are the hard ones**: `Modal`, `Sheet`, `Toast`, `Tooltip`, `Combobox`, `MultiSelect`, `CommandPalette`, `ContextMenu`, `DropdownMenu`, `Calendar`, `DatePicker`, `Table`, `FilterBar`, `AppShell`. The conformance claim therefore rests on the easy half.

**Genuinely missing, component by component:**
- **No `forced-colors` / `prefers-contrast` handling anywhere** — `grep` returns zero hits in `src/`. Inline styles make it hard to add. Windows High Contrast will collapse the whole aesthetic. Carbon/Polaris/Fluent/Spectrum all ship forced-colors support.
- **`Tabs` has no tabpanel wiring** (`Tabs.tsx:295-315`): `role="tablist"`/`role="tab"` exist but there is no `aria-controls`, no `role="tabpanel"`, no `aria-labelledby`, no `id` pairing. That's an incomplete ARIA Tabs pattern.
- **`Calendar`'s ARIA grid is malformed and keyboard-inert** (`Calendar.tsx:250-284`): `role="grid"` whose children are `role="gridcell"` **without `role="row"` wrappers**, and **no roving tabindex / arrow keys**. `DESIGN-CONTRACT.md §14` explicitly claims "roving tabindex", "ArrowUp/Down/Left/Right and Home/End". **The contract describes a feature the code does not have.**
- **`Modal`** does not `inert`/`aria-hidden` the background (relies on `aria-modal` alone), sets no `aria-describedby`, and does not guard focus restore against the trigger being unmounted.
- **No typeahead** in `DropdownMenu`/`Combobox` menus (type-to-jump by first letter), no `aria-activedescendant` on the dropdown menu, only on Combobox.
- **`Checkbox`/`Radio` focus the `<label>`** (`tabIndex={0}`) while the real `<input>` is `tabIndex={-1}` `opacity:0` (`Checkbox.tsx:87-118`). Focus lands on a non-interactive element; screen readers may not announce "checkbox, checked". Radix/React Aria focus the *control* and use a visually-hidden input, not a focusable label.
- **`Table` has no `aria-sort` and no sorting** despite `§13` describing sortable header columns.
- **`Toast` uses `role="status" aria-live="polite"` for every semantic**, including `danger` — WCAG-wise an error toast usually wants `assertive`; there's also no pause-on-focus (only pause-on-hover) for the auto-dismiss timer.
- **No screen-reader announcement tests** (no `aria-live` assertion suite), no NVDA/VoiceOver pass (roadmap Phase 3, unchecked).

**Compare:** React Aria offers *guarantees* — it normalizes focus, keyboard, and announcements across 40+ components and is validated against real AT. Radix/Base UI are battle-tested with hundreds of interaction tests each. LIMINAL's hooks are excellent for 8 days of work but **unproven at the level that matters**.

**Score: 5/10.**

---

## 5. Internationalisation

This is where LIMINAL has a **real, defensible lead — and simultaneously its biggest liability.**

**The work is legitimately good:**
- **Typography from font metrics.** `PERSIAN_LINE_HEIGHT_FLOOR = 1.5625` is *derived* from Vazirmatn's own metrics `(2100 + 1100 + 0)/2048` (`liminal-persian.ts:36`), and `lineHeightFor()` applies `max(designed, floor)` per level — with the correct observation that 7 of the 8 Latin levels are *below* what the script needs. Letter-spacing is forced to `0` for Persian because positive tracking breaks cursive joins (`liminal-persian.ts:63`). **I have not seen a mainstream system derive a line-height floor from a specific face's metrics.**
- **Digits done right:** U+06F0–U+06F9 (Persian), not U+0660 Arabic-Indic (`liminal-persian.ts:68`), plus a parser back to Latin.
- **Jalali via `Intl`, not a 33-year cycle** (`liminal-jalali.ts`) — with Nowruz anchor tests (2026‑03‑21 → 1405‑01‑01), Saturday week start, and leap-year detection from the platform calendar. Correct choice.
- **Bidi module** (`liminal-bidi.ts`): FSI/PDI isolate helpers, first-strong detection, mixed-run detection, `unicodeBidi: 'isolate'|'plaintext'` constants — naming the pieces of UAX #9 that teams normally get wrong.
- **Inline-axis positioning** (`liminal-positioning-engine.ts`): `inline-start`/`inline-end` placements resolved from `dir`, and documented `-start`/`-end` semantics (Radix/Floating UI convention).

**Where it falls down:**
- **The app never turns it on.** `grep` for `DirProvider` in `src/main.tsx`, `src/app/`, `src/App.tsx` → **zero hits.** `lang="fa"` → zero hits. The RTL capability is engine-level and test-level only; the shipped demo does not exercise it.
- **Only two components consume the i18n engine at all:** `Select.tsx` (caret side) and `Calendar.tsx`. `Sidebar`, `Tabs`, `Breadcrumb`, `Toast`, `Modal`, `Table` etc. don't reference direction.
- **Positioning output is physical.** The engine resolves `inline-*` → `left/right` and everything downstream emits `left: ${x}px` (`DropdownMenuContent.tsx:117`, `Tooltip`, `Combobox`, `DatePicker`). That's fine for computed coordinates, but `DESIGN-CONTRACT.md §18`'s "logical properties everywhere" is aspirational: I count **15 logical-property usages vs. 23 physical `left/right`** in components.
- **The RTL browser verification is not in CI and is not reproducible.** `scripts/verify-rtl.mjs` imports `puppeteer-core`, which is **not a dependency**, and falls back to a hardcoded machine path `/root/workspace/tools/cdp/node_modules/puppeteer-core/...` (`verify-rtl.mjs:14-16`). The README's "5 checks in a real browser" cannot run on a clean checkout or in CI. `ci.yml` runs only typecheck/lint/test/build.
- **Breadth beyond Persian is absent:** no plural rules, no relative-time, no number/date formatting beyond Jalali (there is `formatNumber` but components don't call it), no other calendars (Hebrew, Islamic, Indian…), no RTL icon-mirroring policy (only the calendar caret via `pick()`), no `Intl`-based date formatting in the general components.

**How the leaders compare, honestly:** MUI/Ant/Fluent RTL is one config flag (`direction="rtl"`, `ConfigProvider direction`, `FluentProvider dir`) that mirrors the *whole* library — LIMINAL's is deeper in the *engine* but wired into ~2 components. **React Aria/`@internationalized/date` already ships Persian calendar support**, plus plural rules, number/date formatting, and a dozen calendar systems — i.e. React Aria is *ahead on i18n breadth*, and LIMINAL is *ahead on Persian typography specifically*. That is a narrow but real niche.

**Score: 7/10** — best-in-class Persian typographic *theory*; not yet a working, CI-verified, app-wide RTL system.

---

## 6. Performance

**Good:** interaction hover/press/focus are genuinely CSS now (`liminal-interaction.css`), with a measured claim (100 style rewrites → 0 on 50 buttons, `design-lab/state-benchmark.html`). This is the single best architectural decision in the repo.

**Bad, and it's structural:**
- **Zero `React.memo` in the entire component tree** (grep confirms). Some components still keep `useState` interaction machines (the pattern the CSS layer was meant to kill), 14 `useMemo` / 30 `useCallback` to compensate.
- **No library build, so "bundle size" is undefined.** The only artifact is a **710 KB** single-chunk SPA demo (40 KB CSS) — no code splitting.
- **No bundle budget / size-limit in CI** (`LIMINAL-ROADMAP.md` Phase 0 item, unchecked).
- **Tree-shaking is not guaranteed:** no `sideEffects: false`, and `liminal-motion-engine.ts:206-214` **injects a `<style>` tag into `document.head` at module import time** — a module-level side effect that is both non-tree-shakeable and an **SSR/RSC hazard** (it's guarded by `typeof document`, but it still means importing the engine has an effect on the client).
- **`TRANSITION` uses `transition: all …`** (`liminal-motion-engine.ts:35-48`) — animates every property, a known compositing footgun.
- **Inline styles kill responsive.** Because styling is inline, `@media` and container queries cannot be expressed per component; `useMediaQuery` exists but is used in ~0 components. This is the same limitation the old audit identified and it is only *partially* remedied by the CSS layer (which handles state, not layout). Modern leaders (Mantine/Panda/vanilla-extract/StyleX) generate static CSS precisely to get media queries + zero-runtime + tree-shaking.
- **`REDUCED_MOTION_STYLE` with `!important`** (`liminal-motion-engine.ts:111`) won't work as a React inline style — React ignores `!important` in style objects. Minor, but it's dead code.
- No memoization profiling, no hydration test, no RSC story.

**Score: 3/10.**

---

## 7. Distribution and DX

There is **nothing here yet**, and it is the single largest blocker:
- `"private": true`; no `main`, `module`, `exports`, `files`, `sideEffects`, no `peerDependencies` (React is a hard `dependency`).
- No library build (`vite.config.ts` is app-only; there's no `build.lib`/tsup/rollup-dts config). No ESM/CJS/.d.ts output.
- No npm publish, no provenance, no versioning policy, no CHANGELOG, no changesets.
- No docs site, no Storybook, no per-component examples, no migration guides, no codemods, no CLI/registry (shadcn-style), no Figma/Tokens Studio sync, no MCP server.

**What "world-class DX" concretely means** and where LIMINAL sits:

| Capability | LIMINAL | shadcn/ui | Mantine | Radix Themes | Carbon |
|---|---|---|---|---|---|
| `npm i` works | ❌ | ✅ | ✅ | ✅ | ✅ |
| exports map + types | ❌ | ✅ | ✅ | ✅ | ✅ |
| tree-shaken lib build | ❌ | ✅ | ✅ | ✅ | ✅ |
| size-limit in CI | ❌ | ✅ | ✅ | ✅ | ✅ |
| Storybook/docs site w/ live examples | ❌ | ✅ | ✅ | ✅ | ✅ |
| CLI / registry | ❌ | ✅ (13M/wk) | — | — | — |
| migration guide + codemods | ❌ | ✅ | ✅ | ✅ | ✅ |
| per-release changelog | ❌ | ✅ | ✅ | ✅ | ✅ |

**Score: 1/10.**

---

## 8. Testing

**Strong for a token engine:** 456 tests, and the contract-parity tests (`contract.test.ts`), css-vars parity (`css-vars.test.ts`), ladder-generation identity (`tokens.test.ts:77`), contrast floors for every text token × every surface (`contrast.test.ts`, 56 tests), surface/rim/border rules (`surface.test.ts`, 36), mist derivation (`mist.test.ts`), RTL (`direction-rtl.test.tsx`, 20), Jalali (`jalali.test.ts`, 20). **For token correctness this is better than many production libraries.**

**Missing vs. leaders:**
- **No visual regression** (Chromatic / Playwright snapshots). Spectrum, Carbon, Polaris, Radix all gate on visual diffs. For a system whose entire value proposition *is* sub-perceptual differences (q ≈ 0.0083), shipping **no pixel regression test** is the sharpest irony in the repo — a token change that flips ΔL by half a quantum would pass CI silently.
- **No interaction/E2E tests** (Playwright), no keyboard-navigation test harness.
- **No `color-contrast` axe rule** (disabled — correctly, jsdom has no layout) *and* no alternative real-browser contrast check in CI.
- **A11y coverage concentrated on easy components** (see §4).
- **No SSR/RSC tests**, no cross-browser matrix, no bundle-size CI, no `--coverage` gate in CI (script exists, not wired).
- Tests are **~78–90% engine**; the 456 number mostly proves *math*, not *behaviour*.

**Score: 6/10.**

---

## 9. Documentation

- `DESIGN-CONTRACT.md` (441 lines) is genuinely impressive in structure and honesty (it documents deviations, e.g. the quaternary floor's legitimate uses), and its numeric blocks are **generated from code** with a parity test — I wish more systems did this.
- `README.md` is Persian-first and honest about font strategy (`font-display: swap`, self-host script).
- **But:** no per-component documentation, no API tables, no live examples, no do/don't guidance, no a11y notes per component, no migration guides, no searchable site. That's the roadmap's Phase 3/5 "definition of done", all unchecked.
- Two documentation-drift smells remain: `AUDIT-REPORT.md` describes a system that no longer exists (ΔL 0.015, no RTL) and is not marked historical; `README.md:114` claims "436 tests" while the suite is 456.

**Score: 4/10** (contract 9, everything else 1).

---

## 10. What is genuinely novel — and what is reinvention

**Would make a Radix or Material engineer say "that's a real idea":**
1. **Contrast-as-input with a dual lens at emit time.** `deriveTextToken` deriving from both APCA Lc and WCAG and reporting `boundBy` is a genuinely better articulation than Radix's pre-computed steps or M3's contrast utilities.
2. **The ESLint raw-value ban** (`eslint.config.js`): banning hex/rgba/`cubic-bezier` literals *and* `getLadderColor()` calls in consumers, with the engine glob-scoped out. Most systems *document* "use tokens"; almost none make it a lint error that covers the whole consumer surface including the app shell.
3. **Contract + CSS vars generated from the engine with parity tests.** Anti-drift by construction.
4. **Persian line-height floor from the face's metrics.** A real, correct, and rare insight.
5. **Mist derived from float height** (`liminal-mist.ts:37-107`), with `backdrop-filter` **off by default** because it measured **35.7×** the compositing cost for no visible gain on near-uniform dark backgrounds. A measured, opinionated anti-glass stance is refreshing — but it is also subjective.

**Reinvention that already exists, better:**
- **The 9-step OKLCH ladder** ≈ Radix Colors' 12-step scales (which also document a job per step) and M3's tonal palettes. LIMINAL's is prettier in theory (constant hue/chroma) but narrower (dark-only, 9 steps, no per-step semantics table).
- **`Slot`/`asChild`, `composeRefs`, `composeEventHandlers`** = a faithful re-implementation of Radix's, minus the years of edge-case tests.
- **`createVariants`** = cva, ported to `CSSProperties`. Neat, but it means everything is inline — which is precisely what costs you media queries and runtime cost.
- **`useRovingTabIndex`, `useFocusTrap`, `useScrollLock`** = React Aria/Radix territory, hand-rolled and less tested.
- **Hand-rolled `usePositioning`** = Floating UI re-implemented without its scroll-parent, clipping, virtual-element, or RTL edge-case coverage.
- **`liminal-jalali`** overlaps `@internationalized/date`'s Persian calendar (which also brings plural rules and 12 other calendars).

---

# A. Scored comparison table

Scale 1–10, harsh but fair. LIMINAL vs 8 leaders across the 10 axes.

| Axis | **LIMINAL** | Radix Themes | Radix Primitives / Base UI | Material 3 | Adobe Spectrum | IBM Carbon | Ant Design | Fluent 2 | Mantine |
|---|---|---|---|---|---|---|---|---|---|
| **1 Token architecture** | **6** — one source + generated CSS + drift test; but no DTCG, no multi-brand, no density, no semantic tier | 8 | 5 | **9** | **9** | **9** | **9** | **9** | 8 |
| **2 Colour science** | **7** — dual-lens derivation is best-in-class for its niche; dark-only, no seed/dynamic, no 12-step semantics | 9 | 4 | **10** | 8 | 8 | 8 | 8 | 7 |
| **3 Component API** | **4** — Slot/cva/role-resolvers are right-shaped, but ~45 comps, partial controlled/uncontrolled, no form integration | 8 | **10** | 8 | 8 | 8 | **9** | 8 | **9** |
| **4 Accessibility** | **5** — good hooks + CSS focus-visible; axe sweep skips the 14 hard components; no forced-colors | 9 | **10** | 8 | **10** | 9 | 7 | 9 | 8 |
| **5 Internationalisation** | **7** — unique Persian typography theory; app doesn't wire it, not CI-verified, narrow breadth | 7 | 6 | 8 | 8 | 7 | **9** | 8 | 8 |
| **6 Performance** | **3** — CSS state is excellent; no memo, no lib build, no budget, import-time DOM side effect, `transition: all` | 8 | 8 | 8 | 8 | 8 | 7 | **9** | 8 |
| **7 Distribution & DX** | **1** — private, no exports, no build, no docs site, no Storybook, no changelog | 9 | 9 | 9 | **10** | **10** | 9 | 9 | 9 |
| **8 Testing** | **6** — 456 tests, contract parity (excellent); no visual/E2E/SSR/bundle CI | 9 | **10** | 8 | 9 | 9 | 8 | 8 | 8 |
| **9 Documentation** | **4** — 441-line generated contract is superb; no per-component docs/site | 8 | 7 | **10** | **10** | **10** | 9 | 9 | **10** |
| **10 Novelty / identity** | **9** — perceptually-derived ladder, mist-from-height, Persian typography, token-lint | 7 | 6 | 8 | 7 | 6 | 6 | 7 | 6 |
| **Unweighted avg** | **5.2** | **8.2** | **7.5** | **8.7** | **8.8** | **8.4** | **8.2** | **8.5** | **8.3** |

The honest reading of that row: LIMINAL is **above the leaders on exactly one axis (novelty)** and **within reach on three (tokens, colour science, i18n)**, and **far behind on the shipping axes (perf, DX, docs, a11y, API breadth)** — which are the axes that decide whether anything reaches production.

---

# B. Top 10 gaps, ranked by how much they block "world class"

1. **No installable package.** `private: true`, no `exports`, no lib build, React as a hard dependency. *Why it matters:* nothing else can ship until a consumer can `npm i`. *Leaders:* every one ships an exports map + ESM/CJS/d.ts + tree-shaking + provenance. *Size:* **2–4 days.**

2. **No documentation site / Storybook, no per-component docs.** *Why:* a design system's product *is* its docs; live examples + API tables + a11y notes are the roadmap's own "definition of done". *Leaders:* Radix/Mantine/Spectrum/Carbon all run full docs sites with embedded examples. *Size:* **3–6 weeks.**

3. **A11y of the 14 complex components is unverified and partly deficient.** Tabs lack tabpanel wiring; Calendar's grid is malformed and keyboard-inert; Modal lacks background inerting; no typeahead; Checkbox/Radio focus the label; no forced-colors anywhere; zero coverage for Modal/Menu/Combobox/Calendar/Table/Toast in the axe sweep. *Why:* these are exactly the components users touch most and where WCAG 2.2/ARIA APG bite. *Leaders:* React Aria gives verified guarantees; Radix ships hundreds of interaction tests per primitive. *Size:* **3–5 weeks.**

4. **RTL/Persian is engine-complete but product-absent and CI-unverified.** `DirProvider` is never mounted; only 2 components consume the i18n engine; positioning returns physical coords; `verify-rtl.mjs` needs an undeclared `puppeteer-core` and a hardcoded path and isn't in CI. *Why:* this is the claimed wedge, and right now it is a *demo-able* wedge, not a *usable* one. *Leaders:* MUI/Ant/Fluent mirror the whole library from one config flag. *Size:* **1–2 weeks** to wire + CI-verify.

5. **No theme/brand API and no DTCG pipeline; dark-only with a locked Soft-White brand.** *Why:* every enterprise buyer needs multi-brand, often light mode, and cross-platform token export. *Leaders:* M3 seed→scheme, Carbon's 4 themes + 3 densities, Spectrum/Fluent/Ant/Atlassian DTCG→Style Dictionary. *Size:* **3–5 weeks.**

6. **No visual regression, no interaction/E2E, no SSR/RSC, no cross-browser tests.** *Why:* a system whose value is invisible-to-0.01 ΔL differences with *no pixel test* is flying blind; SSR/RSC is table stakes in 2026. *Leaders:* Chromatic/Playwright snapshots + real-AT passes. *Size:* **2–4 weeks.**

7. **Responsive/layout architecture is capped by inline styles; no memoization.** No `React.memo`, `useMediaQuery` unused, media queries can't be expressed per component, `transition: all`. *Why:* limits both design (no real responsive system) and performance under load. *Leaders:* zero-runtime static CSS (vanilla-extract/Panda/StyleX/Griffel) or CSS Modules. *Size:* **4–8 weeks** (architectural).

8. **No bundle budget / size-limit / tree-shaking guarantee; import-time DOM side effect.** Module-level `<style>` injection in `liminal-motion-engine.ts` blocks tree-shaking and is RSC-hostile; 710 KB single-chunk demo. *Why:* perf regressions accumulate invisibly. *Leaders:* size-limit or bundlesize gates on every PR. *Size:* **2–3 days** for budget + **1 day** to refactor the side effect.

9. **Component breadth and depth gaps.** No real DataGrid (sorting/filtering/virtualization/`aria-sort`), no `Popover`/`HoverCard`/`AlertDialog`/`Drawer`, no `Slider`/`Switch`/`NumberInput`/`OTP`/`FileUpload`, no `Stepper`/`Menubar`/`Toolbar`, no range/time date picker, no Form/Field/validation. *Why:* you can't build a real app on what's there. *Leaders:* Mantine 100+, Ant 70+, Carbon/M3/Spectrum 50–100+. *Size:* **6–12 weeks.**

10. **No release infrastructure: versioning, CHANGELOG, changesets, migration guides, codemods, CLI/registry, Figma sync.** *Why:* without it, adoption stalls at "read the source". *Leaders:* shadcn's registry model, Mantine/Radix changelogs, Ant's codemods, Tokens Studio sync. *Size:* **3–5 weeks.**

---

# C. Top 5 genuine advantages

1. **Contrast-as-input with a WCAG ∧ APCA dual lens at token-emit time** (`liminal-contrast.ts:213`, `deriveTextToken`, `boundBy` field). Radix pre-computes; M3 offers utilities; Leonardo pioneered the idea as a *tool*. Making it a token-emit invariant with an auditable reason is a real advance. **Defensible** — but limited to a dark-only palette today.

2. **The ESLint raw-value ban + engine-generated contract with parity tests** (`eslint.config.js` `no-restricted-syntax`; `liminal-css-vars.ts` + `css-vars.test.ts`; `liminal-contract.ts` + `contract.test.ts`). This *enforces* the token layer instead of documenting it, and covers the app shell. **Defensible and under-appreciated** — it is the most transferable idea in the repo.

3. **Persian typography derived from the face's metrics** (`liminal-persian.ts:36`, floor 1.5625 from Vazirmatn `ascender/descender/upm`; tracking → 0; U+06F0 digits) **+ `Intl`-based Jalali** + **UAX #9 isolate helpers**. No mainstream system derives a line-height floor from a specific font, and MUI/Ant RTL are LTR systems plus a flag. **Defensible niche lead** — *contingent on it actually being wired and tested*, which it currently is not (liability).

4. **Mist derived from float height with backdrop-blur off by default** (`liminal-mist.ts:37-107`; measured 35.7× compositing cost, indistinguishable on uniform dark). A measured, opinionated anti-glass stance. **Defensible but partially subjective** — the "35.7×" is a local measurement, and the effect is aesthetic.

5. **Zero-dependency engine (React + Phosphor only) with CSS-native interaction state** (`liminal-interaction.css`, measured 100 → 0 style rewrites). Compare 48 deps for antd. **Defensible** — the CSS-state layer is the right architecture; the remaining JS state machines in a few components are residue, not design.

---

# D. Verdict

**LIMINAL today is a promising, unusually thoughtful perceptual colour/token engine with a thin, unshipped component kit around it.**

Concretely: the **engine (~5k lines) is genuinely good** — dual-lens contrast derivation, a generated-and-drift-tested ladder and contract, real Persian typography math, and a CSS interaction layer that removes the classic React hover-re-render. That layer alone beats what most internal design systems achieve. The **tests are real** (456 passing, with contract parity that most systems lack) but they are **mostly maths tests**, and the system ships **no pixel regression test for the one thing it uniquely cares about: sub-quantum perceptual differences.**

The **library layer (~45 components) is not world-class and is not close**: the a11y sweep deliberately excludes every hard component; Tabs lacks tabpanel wiring; Calendar's grid is invalid and keyboard-inert *despite the contract claiming otherwise*; Modal risks duplicate IDs; Checkbox focuses a label; Table claims sortable columns it doesn't have; the public barrel omits two categories and ships demo code. `React.memo` appears zero times. A module-level DOM side effect blocks tree-shaking. There is **no package** — `private: true`, no exports, no lib build — and **no docs site, Storybook, changelog, or bundle budget**.

Its claimed wedge — **Persian-first RTL** — is the most interesting thing here, and it is **currently a paper and test-suite wedge**: `DirProvider` is never mounted, only two components consume the i18n engine, positioning still emits physical coordinates, and the "5 real-browser RTL checks" depend on an undeclared `puppeteer-core` and a hardcoded path and never run in CI.

**Where it stands:** a **very strong prototype / internal design-system seed**, roughly at the level of a well-funded team's month-three internal library — outstanding *ideas and discipline*, missing *engineering and distribution*. The honest score is **5.2/10 average, dragged down by 1s and 3s on shipping axes, held up by 7–9s on colour science, tokens, i18n and novelty.** Against the leaders it is **not competitive as a library**; against them it is **genuinely interesting as a colour/perception engine and as a Persian-typography reference**.

The roadmap's own assessment (`LIMINAL-ROADMAP.md` §1: "we cannot fight on all fronts; pick a wedge") is correct — and the wedge it should pick is **the token/perception engine + Persian/RTL**, not the component kit. To become world-class it must do the unglamorous 80% it has so far skipped: **ship a package, ship docs, verify a11y of the hard components in CI, wire and browser-verify RTL, add pixel + perf gates.** Until then, the strongest sentence that can honestly be written about LIMINAL is: *"It has real ideas; it does not yet have a product."*