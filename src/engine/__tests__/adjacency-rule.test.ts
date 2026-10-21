// THE ADJACENCY RULE (reader, 2026-10-21):
// every layer sits ONLY on the layer directly below it — S1 only on S0-level hosts,
// S2 only on S1, and so on. The engine has to refuse the rest.
import { describe, it, expect } from 'vitest';
import { checkPlacement, resolvedLevel, ROLE_LEVEL, RELATIONSHIP_ROLES, PLACEMENT_EXEMPTIONS } from '../liminal-surface';
import type { SurfaceRole } from '../liminal-surface';

const ROLES = Object.keys(ROLE_LEVEL) as SurfaceRole[];
const RELATIONS = new Set<string>(RELATIONSHIP_ROLES as readonly string[]);
const exempt = (role: SurfaceRole, on: SurfaceRole) =>
  PLACEMENT_EXEMPTIONS.some((e) => e.role === role && e.on === on);

describe('the adjacency rule — a layer sits only on the one below it', () => {
  it('a plain surface is accepted on a host exactly one level below, and on no other', () => {
    for (const role of ROLES.filter((r) => !RELATIONS.has(r))) {
      for (const on of ROLES) {
        const gap = ROLE_LEVEL[role] - ROLE_LEVEL[on];
        const ok = checkPlacement({ role, on }).ok;
        expect(ok, `${role}(S${ROLE_LEVEL[role]}) on ${on}(S${ROLE_LEVEL[on]})`).toBe(gap === 1);
      }
    }
  });

  it('a relationship role (control, well, region) is accepted exactly when it resolves one above its host', () => {
    for (const role of ROLES.filter((r) => RELATIONS.has(r))) {
      for (const on of ROLES) {
        const gap = resolvedLevel(role, on) - ROLE_LEVEL[on];
        const ok = checkPlacement({ role, on }).ok;
        expect(ok, `${role} on ${on}`).toBe(gap === 1 || exempt(role, on));
      }
    }
  });

  it('the ONLY exemptions are the six ceiling placements — control, well, region on toast or modal', () => {
    const pairs = PLACEMENT_EXEMPTIONS.map((e) => `${e.role}>${e.on}`).sort();
    expect(pairs).toEqual([
      'control>modal', 'control>toast',
      'region>modal', 'region>toast',
      'well>modal', 'well>toast',
    ]);
  });

  it('a skipped layer is refused and the reason names the gap', () => {
    const r = checkPlacement({ role: 'modal', on: 'canvas' });
    expect(r.ok).toBe(false);
    expect(r.reason).toMatch(/skipped/);
  });

  it('every level from S1 to S8 has a role that sits on the level below it', () => {
    for (let n = 1; n <= 8; n++) {
      const child = ROLES.find((r) => !RELATIONS.has(r) && ROLE_LEVEL[r] === n) ?? ROLES.find((r) => ROLE_LEVEL[r] === n);
      const host = ROLES.find((r) => ROLE_LEVEL[r] === n - 1);
      expect(child, `a role at S${n}`).toBeDefined();
      expect(host, `a host at S${n - 1}`).toBeDefined();
      expect(checkPlacement({ role: child!, on: host! }).ok, `${child} on ${host}`).toBe(true);
    }
  });
});
