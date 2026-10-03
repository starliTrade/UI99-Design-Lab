# Sprint 01 — Surface & Separation

## Objective

Establish a controlled environment for studying how dark UI layers communicate hierarchy.

## Reference

Mother canvas: `#060709`

Candidate surfaces:

- `#030406`
- `#08090B`
- `#0A0B0D`

These are **test candidates**, not locked UI99 tokens.

## Current experiment page

Single-page HTML: `design-lab/01-surface-lab.html`

This is the primary evidence surface for Sprint 01: numerical color calculations, rendered swatches, separation examples, nested geometry, and decision gates live on the same page.

## Experiment matrix

### Surface separation

Compare:

1. surface only
2. surface + border
3. surface + shadow
4. surface + border + shadow

### Nested geometry

Candidate relation:

`R_child = max(0, R_parent - P)`

This relation remains provisional until tested across multiple parent radii, paddings, component types, and visual contexts.

## Acceptance criteria

A rule may move toward production only after:

- mathematical consistency
- perceptual consistency
- component-context consistency
- responsive stability
- documented failure cases
- implementation test coverage

## Decision log

No formulas locked yet.

## Current evidence status

- Mother canvas candidate: `#060709`
- Mother surface candidate: `#030406`
- The two values are tested as a pair, not as isolated hex values.
- Mathematical evidence currently includes relative luminance and contrast ratio.
- Visual evidence currently includes direct swatch comparison and surface/border/shadow separation cases.
- The pair is **not locked** until the surface-ladder experiment tests whether the relationship generalizes beyond these two points.
