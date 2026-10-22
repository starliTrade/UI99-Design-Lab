import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ROLE_LEVEL, RELATIONSHIP_ROLES, PLACEMENT_EXEMPTIONS } from '../liminal-surface';

/**
 * Roadmap 1.4 — the final role table in LIMINAL-POLICY.md is the code's table.
 * Each row is read back and compared with the engine: the type, the nominal level,
 * and the exemption list. A guard that finds no rows passes nothing, so the row
 * count is asserted first.
 */
const policy = readFileSync(resolve(process.cwd(), 'LIMINAL-POLICY.md'), 'utf8');
const m = policy.match(/<!-- roles:start -->([\s\S]*?)<!-- roles:end -->/);

type Row = { role: string; type: string; level: string; exempt: string[] };
const rows: Row[] = (m?.[1] ?? '')
  .split('\n')
  .filter((l) => l.startsWith('| `'))
  .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
  .map(([role, type, level, , exempt]) => ({
    role: role.replace(/`/g, ''),
    type: type.replace(/\*/g, ''),
    level,
    exempt: exempt === '—' ? [] : exempt.split('،').map((s) => s.trim().replace(/`/g, '')),
  }));

describe('LIMINAL-POLICY.md — the role table is the engine’s table (1.4)', () => {
  it('the table exists and lists every role exactly once', () => {
    expect(m, 'roles block exists').not.toBeNull();
    expect(rows.length).toBe(Object.keys(ROLE_LEVEL).length);
    expect(new Set(rows.map((r) => r.role)).size).toBe(rows.length);
  });

  it('each row agrees with ROLE_LEVEL', () => {
    for (const r of rows) {
      expect(r.level, r.role).toBe(`S${ROLE_LEVEL[r.role as keyof typeof ROLE_LEVEL]}`);
    }
  });

  it('a relationship role is marked as one, and only those', () => {
    for (const r of rows) {
      const isRel = (RELATIONSHIP_ROLES as readonly string[]).includes(r.role);
      expect(r.type === 'رابطه', r.role).toBe(isRel);
    }
  });

  it('the exemptions listed for each role are exactly PLACEMENT_EXEMPTIONS for that role', () => {
    for (const r of rows) {
      const expected = PLACEMENT_EXEMPTIONS.filter((e) => e.role === r.role).map((e) => e.on);
      expect([...r.exempt].sort(), r.role).toEqual([...expected].sort());
    }
  });
});
