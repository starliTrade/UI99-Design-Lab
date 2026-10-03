# UI99 Design Lab — Experimental Roadmap

## Locked workflow

Every design decision follows:

**Experiment → Measure → Derive → Validate → Integrate**

Each stage is a **single-page HTML experiment** containing:
1. Mathematical test
2. Visual rendering test
3. Real component examples
4. Parameter controls where useful
5. Explicit decision gate
6. Result log before any production token is changed

## Phase 01 — Color & Surface Foundation

### 01.1 Mother Canvas × Mother Surface
- Fixed reference canvas: `#060709`
- Test mother surface: `#030406`
- Candidate alternatives remain visible for comparison.
- Measure relative luminance, contrast ratio, channel deltas.
- Test surface-only separation.
- Decision: determine whether the two-color foundation is coherent enough to become a base relation.

### 01.2 Surface Ladder
- Generate a controlled sequence around the mother canvas.
- Compare equal RGB deltas vs luminance-based deltas vs OKLCH lightness deltas.
- Test monotonicity and perceptual ordering.
- Decision: choose the mathematical coordinate system for surface generation.

### 01.3 Surface Role Mapping
- Canvas
- Sunken / inset
- Quiet surface
- Control
- Card
- Elevated surface
- Test whether every role actually needs a unique surface value.
- Decision: minimum sufficient surface hierarchy.

## Phase 02 — Border System

### 02.1 Border Necessity

Use a real hierarchical component tree, not isolated cards:
- Canvas → Card → Nested Panel → Control
- Canvas → Floating Surface
- sibling components at the same depth

Every node must be evaluated against its actual parent. A semantic role must not imply a fixed border.

Compare:
- no border
- border only
- surface + border
- shadow only
- surface + border + shadow

Across multiple surface deltas.

### 02.2 Border Strength
Measure border luminance delta and opacity.
Test visibility, edge noise and hierarchy.

### 02.3 Border Role Rules
Determine which component roles require:
- mandatory border
- optional border
- no border

No global border token is locked until role tests pass.

## Phase 03 — Shadow / Elevation

### 03.1 Shadow Necessity
Surface vs border vs shadow combinations.

### 03.2 Shadow Parameter Derivation
Test:
- Y offset
- blur
- spread
- alpha

Compare simple empirical formulas with physically-inspired decay models.

### 03.3 Elevation Ladder
Derive semantic levels from visual depth, not arbitrary numbers.

## Phase 04 — Nested Components / Geometry

### 04.1 Radius Relation
Test:
`R_child = max(0, R_parent - P)`
against multiple parent radii, padding values and component types.

### 04.2 Nested Surface Relation
Determine when nested children should:
- inherit
- darken
- lighten
- remain equal

### 04.3 Nested Border / Shadow Rules
Determine whether depth cues should accumulate, alternate or disappear at deeper levels.

## Phase 05 — Spacing / Density

- derive spacing relationships
- test component density
- test padding-to-radius interaction
- test minimum touch/control dimensions

## Phase 06 — Typography

- type scale
- line height
- weight hierarchy
- text contrast
- density interaction

## Phase 07 — Motion / Feedback

- duration
- easing
- distance
- hierarchy
- reduced-motion behavior

## Phase 08 — Combined System

Build representative screens using only derived relations:
- card
- form
- dashboard
- modal
- nested panel
- command/control surface

## Phase 09 — Production Integration

Only after experiments pass:
1. encode formulas in the token engine
2. add unit/property tests
3. remove hardcoded audit claims
4. run regression comparisons
5. lock the resulting system
