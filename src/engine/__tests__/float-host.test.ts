import { describe, it, expect } from 'vitest';
import { FLOAT_HOST, ROLE_LEVEL, checkPlacement, FLOATING_ROLES, floatingShadow } from '../liminal-surface';
import type { SurfaceRole } from '../liminal-surface';
import { mistFloatShadow } from '../liminal-mist';

/**
 * The adjacency law, applied to floating surfaces (2026-10-22, reader-approved):
 * a float sits exactly ONE step above its host, and its shadow falls on that host.
 */
describe('floating surfaces sit one step above their host', () => {
  it('every floating role has a host, and the host is one step below', () => {
    for (const role of FLOATING_ROLES) {
      const host = FLOAT_HOST[role as keyof typeof FLOAT_HOST];
      expect(host, `${role} has a host`).toBeDefined();
      expect(ROLE_LEVEL[role] - ROLE_LEVEL[host], `${role} on ${host}`).toBe(1);
    }
  });

  it('the law itself accepts every pair (checkPlacement is the source of truth)', () => {
    for (const role of FLOATING_ROLES) {
      const host = FLOAT_HOST[role as keyof typeof FLOAT_HOST];
      expect(checkPlacement({ role, on: host }).ok, `${role} on ${host}`).toBe(true);
    }
  });

  it('the mist’s shadow is solved for that host, not for the work plane', () => {
    for (const role of FLOATING_ROLES) {
      const host = FLOAT_HOST[role as keyof typeof FLOAT_HOST] as SurfaceRole;
      expect(mistFloatShadow(role), role).toBe(floatingShadow(role, host));
    }
  });
});
