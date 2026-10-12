import { describe, it, expect } from 'vitest';
import { LiminalPositioningEngine } from '../liminal-positioning-engine';
import type { Placement } from '../liminal-positioning-engine';

const rect = (left: number, top: number, width: number, height: number): DOMRect =>
  ({ left, top, right: left + width, bottom: top + height, width, height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;

/** A trigger in the middle of a 1000x800 viewport, and a 200x100 panel. */
const trigger = rect(400, 300, 120, 40);
const floating = rect(0, 0, 200, 100);

const at = (placement: Placement, dir: 'ltr' | 'rtl' = 'ltr') =>
  LiminalPositioningEngine.calculatePosition(trigger, floating, { placement, dir, flip: false, shift: false });

/**
 * The engine was physical throughout: `left` meant left, and `-start`/`-end`
 * meant the left and right edges, in every direction. In RTL that put a
 * dropdown's start edge on the wrong side of its trigger.
 */
describe('positioning — a physical side is physical in every direction', () => {
  it('left and right do not move when the direction changes', () => {
    expect(at('left', 'ltr').x).toBe(at('left', 'rtl').x);
    expect(at('right', 'ltr').x).toBe(at('right', 'rtl').x);
  });

  it('left puts the panel to the left of the trigger, right to the right', () => {
    expect(at('left').x).toBe(400 - 200 - 8);
    expect(at('right').x).toBe(520 + 8);
  });

  it('the block axis does not mirror: left-start aligns the TOP edges either way', () => {
    expect(at('left-start', 'ltr').y).toBe(300);
    expect(at('left-start', 'rtl').y).toBe(300);
  });
});

describe('positioning — an inline placement follows the axis', () => {
  it('inline-start is the left in LTR and the right in RTL', () => {
    expect(at('inline-start', 'ltr').x).toBe(at('left', 'ltr').x);
    expect(at('inline-start', 'rtl').x).toBe(at('right', 'rtl').x);
  });

  it('inline-end is the right in LTR and the left in RTL', () => {
    expect(at('inline-end', 'ltr').x).toBe(at('right', 'ltr').x);
    expect(at('inline-end', 'rtl').x).toBe(at('left', 'rtl').x);
  });
});

describe('positioning — -start and -end on the block sides align along the inline axis', () => {
  it('bottom-start meets the START edges: left in LTR, right in RTL', () => {
    expect(at('bottom-start', 'ltr').x).toBe(400);            // left edges meet
    expect(at('bottom-start', 'rtl').x).toBe(520 - 200);      // right edges meet
  });

  it('bottom-end meets the END edges: right in LTR, left in RTL', () => {
    expect(at('bottom-end', 'ltr').x).toBe(520 - 200);
    expect(at('bottom-end', 'rtl').x).toBe(400);
  });

  it('top-start and top-end follow the same rule', () => {
    expect(at('top-start', 'ltr').x).toBe(400);
    expect(at('top-start', 'rtl').x).toBe(520 - 200);
    expect(at('top-end', 'ltr').x).toBe(520 - 200);
    expect(at('top-end', 'rtl').x).toBe(400);
  });

  it('the block axis is untouched by direction', () => {
    expect(at('bottom-start', 'ltr').y).toBe(at('bottom-start', 'rtl').y);
    expect(at('top-start', 'ltr').y).toBe(at('top-start', 'rtl').y);
  });
});

describe('positioning — flip and shift still work, on the resolved side', () => {
  it('flips bottom to top when there is no room below', () => {
    const low = rect(400, 760, 120, 40);
    const r = LiminalPositioningEngine.calculatePosition(low, floating, { placement: 'bottom', flip: true, shift: false });
    expect(r.placement).toBe('top');
  });

  it('flips left to right when there is no room to the left', () => {
    const edge = rect(20, 300, 120, 40);
    const r = LiminalPositioningEngine.calculatePosition(edge, floating, { placement: 'left', flip: true, shift: false });
    expect(r.placement).toBe('right');
  });

  it('flips an inline placement on the side it resolved to', () => {
    // `inline-start` is `left` in LTR, so with no room to the left it flips.
    const edge = rect(20, 300, 120, 40);
    const ltr = LiminalPositioningEngine.calculatePosition(edge, floating, { placement: 'inline-start', dir: 'ltr', flip: true, shift: false });
    expect(ltr.placement).toBe('right');
    // In RTL it resolves to `right`, so with no room to the right it flips left.
    const nearRight = rect(900, 300, 120, 40);
    const rtl = LiminalPositioningEngine.calculatePosition(nearRight, floating, { placement: 'inline-start', dir: 'rtl', flip: true, shift: false });
    expect(rtl.placement).toBe('left');
  });

  it('shift keeps the panel inside the viewport', () => {
    const r = LiminalPositioningEngine.calculatePosition(trigger, floating, { placement: 'bottom-start', shift: true, flip: false });
    expect(r.x).toBeGreaterThanOrEqual(4);
    expect(r.x + floating.width).toBeLessThanOrEqual(1000 - 4);
  });
});

describe('positioning — the arrow follows the resolved placement', () => {
  it('reports an arrow coordinate when asked', () => {
    const r = LiminalPositioningEngine.calculatePosition(trigger, floating, { placement: 'bottom', arrow: true });
    expect(r.arrowX).toBeGreaterThanOrEqual(8);
    expect(r.arrowX).toBeLessThanOrEqual(floating.width - 8);
  });
});
