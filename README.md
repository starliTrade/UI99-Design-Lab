# LIMINAL

**A dark UI engine, not a component collection.**

Most design systems ship a token file and a set of components that read it. LIMINAL ships the
arithmetic that produces the tokens, the rules that decide how components may use them, and the
guards that fail when they do not.

The difference is not philosophical. It is measurable: **every surface, edge, colour and space in
this library comes from a rule, and the rule is written as a test.** A component declares *what it
is* — a role — and the engine decides the rest.

```
npm install liminal
```

```tsx
import { Button, Card, Input, resolveSurface } from 'liminal';
import 'liminal/styles.css';

export function Panel() {
  return (
    <Card>
      <Input label="Name" />
      <Button>Save</Button>
    </Card>
  );
}
```

Requires React 18 or later. Server-renderable; `"use client"` is on the entry.

---

## What makes it an engine

### The ladder is a luminance ramp, measured

Nine surfaces, each **one perceptual quantum** from the one below — not a percentage someone
picked. The quantum is empirical: `q = 0.0083`, measured across three sessions with a spread of
`0.0010`.

```
S0 #060709   S1 #07090b   S2 #090b0d   S3 #0b0d0f   S4 #0d0f12
S5 #0f1114   S6 #111316   S7 #131518   S8 #15171a
```

The step is `1.07q–1.21q`. That is *on* the boundary — felt, not seen.

### A state change is felt; a target is seen

This is the rule the whole system is built around, and it has a corollary that is easy to get
wrong:

> **"Felt, not seen" governs a STATE CHANGE. A target — a box, a fill, a star — must be SEEN.**

A hover moves half a step (`~0.6q`). A slider's fill, an OTP's boxes, a rating's stars are
*targets*, and they use the brand or a full edge, because a target that is felt but not seen is one
the reader cannot find. Four components shipped invisible before that distinction was written down.

### Text alphas are derived, not chosen

Each text role declares its **use**, and the floor follows from it — then both lenses are computed
and the stricter one wins.

| role | use | WCAG | APCA |
|---|---|---|---|
| `primary` | body, preferred | 4.5 | 90 |
| `secondary` | body, minimum | 4.5 | 75 |
| `tertiary` | body, minimum | 4.5 | 75 |
| `quaternary` | non-text marks | 3 | 30 |

`secondary` and `tertiary` share an alpha (`0.788`). Their hierarchy is size and weight, not
colour — which is what the measurement said, and what the eye agreed with.

### A component declares a role, not a level

```tsx
resolveSurface({ role: 'panel' })          // ✓ what it is
getDirectionalRim(3, 2, false)             // ✗ a level, hand-picked
LADDER[3]                                  // ✗ the ladder, indexed directly
```

Ten roles, from `canvas` to `toast`. A control is defined by its **relationship** to its host:
`resolveSurface({ role: 'control', on: 'work' })`. Two components that declare the same role cannot
disagree about depth — which is a thing a hand-picked number cannot promise.

### The identity is not a setting

The ladder is monochrome — chroma `0.0069` — and locked. A theme is **two scales**, not a colour:

```tsx
createLiminalTheme({ density: 1.2, motion: 0.8 })
```

Density scales spacing, control heights **and radii as one set**, so the concentric law
(`r_inner = max(4, r_outer − padding)`) survives. A density that would take `CONTROL.md` below the
44px touch floor is **refused**, not warned about.

---

## The components

**71 components, all 71 complete** against [`COMPONENT-CONTRACT.md`](./COMPONENT-CONTRACT.md),
which states the ten things a component must have and names the guard that fails when it does not.

The last ten took no component changes at all — they took a check that stopped asking the wrong
question. See below.

| group | components |
|---|---|
| **Atoms** | Badge · Button · Mist · Tag · Toggle |
| **Inputs** | Checkbox · Combobox · FileUpload · Input · MultiSelect · NumberInput · OTP · Radio · Rating · Select · Slider · Textarea |
| **Containers** | Card · Divider · Drawer · HoverCard · Modal · Panel · Popover · Sheet |
| **Feedback** | Alert · AlertDialog · Toast · Tooltip |
| **Data** | Avatar · AvatarGroup · Calendar · DatePicker · FilterBar · Pagination · Progress · Stat · Table · TreeView |
| **Navigation** | Breadcrumb · CommandPalette · ContextMenu · DropdownMenu · NavItem · Sidebar · Stepper · Tabs · Topbar |
| **Layout** | AppShell · AspectRatio · FocusScope · Footer · Grid · PageHeader · PageSection · ScrollArea · Stack · VisuallyHidden |
| **Composites** | EmptyState · ErrorPage · Form · FormLayout · Skeleton |

### The standard, measured

```
node scripts/verify-component-standard.mjs
```

```
71 components · 71 complete · 0 short of the standard
  role       71/71
  size       16/16  (declaration matches code)
  variant    16/16  (declaration matches code)
  disabled   16/16  (controls only)
  error      13/13  (inputs only)
  tokens     71/71
  fixture    71/71
```

**A criterion is asked of the population it applies to.** `size`, `variant`, `disabled` and
`error` are things a CONTROL has. `fixture` asks whether a component is in the table — and ten
files are not components: `TableHead` and `TableCell` are cells, `DropdownMenu` is the provider
that owns the state its content reads, `Tooltip` is a re-export. None can render alone, so a row
for one would be a row that cannot be rendered. And `Divider` and `PageSection`'s separator paint a
hairline, not a surface.

The check names all twelve, with their reasons, rather than loosening the rule until it says
nothing.

CI runs this with `--ratchet`: the number may improve and may not walk backwards. A gate demanding
100% would fail everything and get turned off.

---

## Everything is guarded

A rule with no guard is a habit. Nine guards, each banning one pattern:

| guard | what it prevents |
|---|---|
| `no-raw-numbers` | a hand-picked level, or an indexed ladder |
| `one-resolver` | a second way to resolve a surface |
| `interaction-vars` | publishing state variables without opting in — **and the reverse** |
| `theme-reach` | a baked colour a theme cannot reach |
| `perceptual-boundary` | a state change that is invisible or a full quantum away |
| `contrast` | a text alpha below its declared floor |
| `a11y-sweep` | an axe violation, across 45 components |
| `engine-barrel` | a module a consumer cannot import |
| `event-forwarding` | an event handler a component swallows |

**801 tests across 55 files.** `verify` runs typecheck, lint, tests, the app build, the library
build and a package-coherence check.

---

## The package

```
esm  387.7 kB   (≈87 kB gzipped)
cjs  278.0 kB
css    1.7 kB
```

React is a peer dependency and is **not** bundled — a library that ships its own React breaks the
consumer's hooks. `verify:package` checks that, along with every path the manifest promises, the
reachability of the stylesheet, and whether `"use client"` survived the build.

**The package is `private`.** Making something publishable is not publishing it, and this project
publishes when there is demand.

---

## What is not done

Recorded rather than hidden:

- **No bundle budget.** The measurement exists; the budget is a decision, not a measurement.
- **No Storybook.** The docs app serves the purpose for now.
- **No performance measurement** — render counts, layout thrash.
- **31 of 88 components have a JSDoc comment above any prop.** The API table is generated from
  the types and says so on every component page — in this repo the comment above a prop is where
  the reason lives, and a prop without one has its reason only in someone's head.
- **Not published.** The package is `private`, and publishing is a decision about demand.

---

## The docs app

```
bun install
bun run dev          # http://localhost:3000
```

Six pages: the engine in one screen, every component live, one page per component, the tokens with
their arithmetic, the contract with live invariants, and a studio that reads the engine rather than
describing it. Plus the examples — a whole app built from these components.

An LTR/RTL switch in the topbar flips the document, because the engine's direction work has no
other way to be seen.

---

## Development

```
bun run verify        # typecheck · lint · test · build · build:lib · verify:package
bun run test:watch
bun run gen:css       # regenerate the CSS variables from the engine
bun run gen:api       # regenerate the props table from the types
node scripts/verify-component-standard.mjs
node scripts/verify-hierarchy.mjs
bash scripts/verify-next-smoke.sh   # packs, installs into a Next.js app, builds it
```

`verify-next-smoke.sh` is the one that answers the question a consumer asks. It
packs a tarball — which applies the `files` list, so it is what npm would publish
— installs it into a blank Next.js App Router project, builds, and checks the
server-rendered HTML for the button. The page is a Server Component with no
`"use client"`, so if the directive did not survive the build it fails there.

The contract is [`COMPONENT-CONTRACT.md`](./COMPONENT-CONTRACT.md); the plan is
[`LIMINAL-ROADMAP.md`](./LIMINAL-ROADMAP.md).

MIT.
