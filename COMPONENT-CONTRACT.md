# LIMINAL · COMPONENT CONTRACT

> A rule with no guard is a habit. Every rule here names the thing that fails
> when it is broken.

This is the standard a component meets before it is called done. It exists
because the components were written **before** the engine settled: measured
today, **56 components, 18 complete** — and the 18 are the containers, which
have no sizes to have.

The engine is not the problem. The engine is finished. The components are the
distance between what the engine can express and what they currently declare.

---

## 1. It declares a ROLE, not a level

```tsx
resolveSurface({ role: 'panel' })          // ✓
getDirectionalRim(3, 2, false)             // ✗ a level, hand-picked
LADDER[3]                                  // ✗ the ladder, indexed directly
```

**Why.** A component that names a level can disagree with another component that
names the same level. Seven components hand-picked `(2, 2)` for "the fill an
unselected control rests in" and four of them meant something different by it —
which is why `well` exists now.

**Guard.** `no-raw-numbers.test.ts` · `one-resolver.test.ts`

---

## 2. It has SIZES, from the token, not from a number

```tsx
size?: 'sm' | 'md' | 'lg'
padding: calc((CONTROL[size] - 1lh - 2px) / 2)   // the control IS its token
```

**Why.** A control whose height is a number is a control that drifts from the
scale. `CONTROL.md` is 44px because that is the touch floor; a component that
writes `minHeight: 40` has left the system.

**Guard.** `tokens.test.ts` · the standard check's `size` column

---

## 3. It has STATES, and they land on the perceptual boundary

`idle · hover · focus · active · disabled` — and, where the component validates,
`error · readonly`.

**Why.** LIMINAL's first rule: a change is **felt, not seen**. Measured before
this rule was a test, hover landed 1.07–1.21q away (a full quantum — visible)
and active landed 0.00q (the idle fill — invisible). Every role, every host.

**Guard.** `perceptual-boundary.test.ts` — every state, on every role and every
host, must land between 0.4q and 1q, and none may be a no-op.

---

## 4. It has VARIANTS, named

A variant is a **name for a decision**, not a colour. `primary · secondary ·
ghost · danger` — not `blue · grey`.

**Why.** "Values become tokens, selections become names." A variant called
`blue` is a value pretending to be a choice, and it breaks the moment the theme
moves.

**Guard.** the standard check's `variant` column

---

## 5. Tokens only. No raw number, no hex, no rgba

```tsx
background: getLadderVar(level)                    // ✓
background: `rgba(229, 99, 122, 0.08)`             // ✗ — and this one shipped
```

**Why.** Four components carried a danger tint and a success tint —
`rgba(229, 99, 122, 0.08)` and `rgba(52, 192, 139, 0.08)` — copied by hand. Two
colours that exist **nowhere in the engine**, invented four times. The ESLint
rule missed them for months because it read `Literal` nodes and a template
literal is not one.

**Guard.** `eslint.config.js` (`no-restricted-syntax`) · `no-raw-numbers.test.ts`
· `theme-reach.test.ts`

---

## 6. It is ACCESSIBLE, and the sweep says so

- a role where the element is not a native one
- an accessible name
- keyboard reachable, with a visible `focus-visible` ring
- `aria-invalid` / `aria-describedby` when it validates

**Why.** The fixture-based axe sweep covers 45 components. It found the Select
with no accessible name and the Progress bar with none — both serious, both
invisible to a screenshot.

**Guard.** `a11y-sweep.test.tsx` · `accessibility.test.tsx`

---

## 7. It is RTL-correct: logical properties only

```tsx
paddingInlineStart: …      // ✓
paddingLeft: …             // ✗ does not flip
marginInlineStart: …       // ✓
```

**Why.** The engine carries a direction system — logical properties, an
RTL-aware positioning engine, a Jalali calendar, bidi isolation. A component
with a physical property silently breaks half of it. 39 physical properties were
removed once; the guard exists so a 40th does not arrive.

**Guard.** `positioning.test.ts` · the logical-property rule in `eslint.config.js`

---

## 8. It is in the FIXTURE TABLE — one row

```tsx
{ name: 'Popover', group: 'Containers', sizes: [], states: ['closed', 'open'], expected: [] }
```

**Why.** The studio, the matrix and the a11y sweep all read that one table. A
component that is not in it passes through none of them. Adding a component is
adding a row — not three places.

**Guard.** `a11y-sweep.test.tsx` · the standard check's `fixture` column

---

## 9. It has TESTS, and they can fail

- it renders, in every state the fixture declares
- it behaves — the interaction, not the markup
- its contrast holds, both lenses
- axe finds nothing

**Why.** A test that cannot fail is worse than no test: this project found four
tautologies in its own suite. A test that asserts what the code does, rather
than what the contract says, is a mirror.

**Guard.** the suite itself, plus review

---

## 10. It passes the EYE TEST

A live page, before and after, with the real component. Not a screenshot, and
not a description.

**Why.** Five defects in this project were found only by looking: the first
surface layer 43% too far from the background, the invisible NavItem hover, the
Calendar whose hover equalled its active, the Mist that took 108ms, and the
`Card.Well` that sat at a level someone chose rather than the inset of its host.
Every one of them passed the automated tests.

**Guard.** the reviewer. This is the one rule no script can hold, and it is the
one that has caught the most.

---

## The standard, measured

```
node scripts/verify-component-standard.mjs
```

```
59 components · 47 complete · 12 short of the standard
  role       57/59
  size       11/11  (declaration matches code)
  variant    11/11  (declaration matches code)
  disabled   11/11  (controls only)
  error       8/8   (inputs only)
  tokens     59/59
  fixture    49/59
```

**`fixture` has the same limit.** Ten files remain outside the table and every
one is a PART, a provider or an alias — `TableHead`, `TableCell`,
`DropdownMenuContent`, `DropdownMenuItem`, `ContextMenu` (the provider),
`Tooltip` (a re-export of `SimpleTooltip`). None can render alone, so a row for
one would be a row that cannot be rendered. The check names them rather than
loosening the rule until it says nothing.

Three real gaps it found and closed: `DatePicker`, `Tabs` and `AvatarGroup` were
whole components missing from the table, which meant the studio, the matrix and
the axe sweep could not see them. And `DatePicker` was wrapping an `Input` that
has carried an `error` prop all along — the wrapper simply never passed it
through, the same defect as the Button's swallowed handlers: **a prop that stops
one layer short.**

**`role` is CONDITIONAL too.** It used to be "declares a role", asked of all
59 — twenty-two failed, and most were right to: `TableHead`, `TableCell`,
`DropdownMenu` (the provider), `Grid`, `Form` do not own a surface, they are
parts of one. The honest question is conditional: **if it paints a background,
it must come from the engine and name a role.** A component with no background
has nothing to declare.

Two remain flagged and both are LINES, not surfaces — `Divider` and
`PageSection`'s separator, each a hairline with `role="separator"`. A static
check cannot tell a 1px rule from a plane, and it should not pretend to. The
honest report is 57/59 with the two named, not 59/59 with the rule loosened
until it says nothing.

**`size` and `variant` are AGREEMENT, not presence.** A Checkbox does not need
a `variant`, and a check that demands one pushes components to invent props —
which is the failure this contract exists to prevent. What a component must not
do is CLAIM a size in the fixture and not have it, or have one and not say so.
So the criterion is the declaration against the source, and it reads the real
fixture table rather than parsing it: the first version used a pattern that
wanted `sizes` on the same line as `name` and a literal array for `states`, and
Button's `variants` is on the next line while Input's `states` is a constant. It
reported eight mismatches that did not exist. **A check that misreads the
declaration reports the wrong thing about the right component.**

And the one it found that IS real: `Checkbox` and `Radio` have no `error` prop,
while the other five inputs do.

**A criterion is asked of the population it applies to.** The fixture declares
which kind of thing a component is, and the check reads that declaration rather
than guessing:

| kind | criteria |
|---|---|
| `input` | size · variant · disabled · error |
| `action` | size · variant · disabled |
| `surface` | role · tokens · fixture |

An `error` prop on a Button is a prop with no meaning, and demanding one pushes
components to invent it. The first version of this check read the SOURCE for
`resolveSurface({ role: 'control' })` — which called a Drawer a control, because
a Drawer renders a control for its handle. **A component that contains a control
is not one.**

`Popover`, `HoverCard`, `AlertDialog` and `Drawer` are at 7/7. The controls are
the work: `size` is 2/9 and `variant` is 1/9.

---

## How a component gets built

In this order, and no step is skipped:

1. **role** — what it is, declared to the engine
2. **sizes** — from `CONTROL`, if it is a control
3. **states** — on the boundary, measured
4. **variants** — named
5. **tokens** — zero raw values, and the guards agree
6. **a11y** — role, name, keyboard, focus
7. **RTL** — logical properties only
8. **fixture** — one row
9. **tests** — render, behave, contrast, axe
10. **eye test** — a live page, and the reviewer's verdict

Then the standard check runs, and the number goes up.

---

## What this contract does NOT cover

- **Bundle budget.** Not measured. A component can meet all ten rules and be
  enormous.
- **Storybook.** Not present. The docs app serves the purpose for now.
- **A per-component API table.** The props exist; the table does not.
- **Performance.** No render-count or layout-thrash measurement.

These are recorded in the roadmap, not hidden here.
