import { describe, it, expect } from 'vitest';
import { borderKindFor, resolveBorder, resolveBorderLevel, ROLE_LEVEL, FLOATING_ROLES } from '../liminal-surface';
import type { SurfaceRole } from '../liminal-surface';
import { PERCEPTUAL_QUANTUM, LADDER_STEP } from '../liminal-ladder';

/**
 * The reader's decision, 2026-10-22, from border-compare.html: «floating edge, the rest
 * separator». These tests hold the decision itself, not the numbers that happen to
 * implement it.
 */
const ALL: SurfaceRole[] = Object.keys(ROLE_LEVEL) as SurfaceRole[];

describe('border kind by role (the reader’s decision)', () => {
  it('floating roles get the edge — they must separate from the page', () => {
    for (const role of FLOATING_ROLES) expect(borderKindFor(role), role).toBe('edge');
  });

  it('every other role gets the separator — the same frame, softer', () => {
    for (const role of ALL.filter((r) => !FLOATING_ROLES.includes(r))) {
      expect(borderKindFor(role), role).toBe('separator');
    }
  });

  it('the default is the role’s kind; an explicit kind still wins', () => {
    for (const role of ALL) {
      expect(resolveBorder({ role }), role).toBe(resolveBorder({ role, kind: borderKindFor(role) }));
    }
    expect(resolveBorder({ role: 'control' })).not.toBe(resolveBorder({ role: 'control', kind: 'edge' }));
  });

  it('the separator is half a step from its surface, the edge a whole step', () => {
    // Measured in the same units the policy uses: the separator 0.57q, the edge 1.14q.
    for (const role of ['work', 'panel', 'control'] as SurfaceRole[]) {
      const sep = resolveBorderLevel({ role, kind: 'separator' }) - ROLE_LEVEL[role];
      const edge = resolveBorderLevel({ role, kind: 'edge' }) - ROLE_LEVEL[role];
      expect(sep, `${role} separator`).toBeCloseTo(0.5, 9);
      expect(edge, `${role} edge`).toBeCloseTo(1, 9);
      expect((sep * LADDER_STEP) / PERCEPTUAL_QUANTUM).toBeCloseTo(0.57, 1);
    }
  });
});
