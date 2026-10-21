// POLICY §4 — the border is one ladder step; the separator is half a step;
// the ceiling (S8) collapses the edge to the S7.5 separator.
import { describe, it, expect } from 'vitest';
import { resolveBorderHex, ROLE_LEVEL } from '../liminal-surface';
import { LADDER, HALF } from '../liminal-ladder';

describe('POLICY §4 — border = one ladder step', () => {
  it('an edge on level n is exactly the hex of level n+1 (n < 8)', () => {
    for (const [role, n] of Object.entries(ROLE_LEVEL)) {
      if (n >= 8) continue;
      const edge = resolveBorderHex({ role: role as never, kind: 'edge' });
      expect(edge, `${role} (S${n}) edge`).toBe(LADDER[n + 1]);
    }
  });

  it('a separator on level n is the half-step hex S(n+0.5), for n < 8', () => {
    for (const [role, n] of Object.entries(ROLE_LEVEL)) {
      if (n >= 8) continue;
      const sep = resolveBorderHex({ role: role as never, kind: 'separator' });
      expect(sep, `${role} (S${n}) separator`).toBe(HALF[n]);
    }
  });

  it('the S8 ceiling collapses the edge to the S7.5 separator (not invisible)', () => {
    const edge = resolveBorderHex({ role: 'toast' as never, kind: 'edge' });
    expect(edge).toBe(HALF[7]);
    expect(edge).not.toBe(LADDER[8]);
  });
});
