import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';

/**
 * Roadmap 2.1 — a border is resolved in ONE place.
 *
 * A half-step written by hand (`getLadderColor(n + 0.5)`, `CANVAS_L + (n + 0.5) * STEP`)
 * is a border or a rim that nothing else can see or change. This is a RATCHET, not a
 * ban: the file list below is the exact set of places that may still write a half-step
 * by hand, each with its reason, and the count must match. A new one fails here; so does
 * a removed one, so the list cannot go stale.
 *
 * The resolver itself (`liminal-surface.ts`) must write none.
 */
const SRC = resolve(process.cwd(), 'src');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '__tests__') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

/** Comments explain the rule; they are not the rule. */
function code(file: string): string {
  return readFileSync(file, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/[^\n]*/g, '$1');
}

// A half-step offset (±0.5) applied to a ladder level, in the same expression.
const HALF_STEP = /[-+] ?0\.5\b/;
const LADDER_TERM = /getLadderColor|getLadderVar|LADDER_STEP|CANVAS_L|level|Level|\bn\b/;

function hits(file: string): number {
  return code(file)
    .split('\n')
    .filter((line) => HALF_STEP.test(line) && LADDER_TERM.test(line)).length;
}

/** The only files allowed to write a half-step by hand, with the count and the reason. */
const ALLOWED: Record<string, { count: number; reason: string }> = {
  'engine/liminal-ladder.ts': {
    count: 1,
    reason: 'the definition of the exact half-step oklch (the source every other reads)',
  },
  'engine/liminal-theme.ts': {
    count: 1,
    reason: 'per-hue half-step palette; a different hue, so it cannot call the resolver for the canvas ladder',
  },
  'engine/spec-engine.ts': {
    count: 4,
    reason: 'the CONCAVE RIM (a rim treatment, not a border); it moves to roadmap 2.2 with the rim work',
  },
};

describe('roadmap 2.1 — a border is resolved in one place', () => {
  const found: Record<string, number> = {};
  for (const file of walk(SRC)) {
    const n = hits(file);
    if (n > 0) found[relative(SRC, file)] = n;
  }

  it('the border resolver writes no half-step by hand', () => {
    expect(found['engine/liminal-surface.ts'] ?? 0).toBe(0);
  });

  it('every hand-written half-step is in the allowed list, with the same count', () => {
    for (const [file, n] of Object.entries(found)) {
      expect(ALLOWED[file], `${file} writes ${n} half-step(s) by hand and is not allowed`).toBeDefined();
      expect(n, `${file} count`).toBe(ALLOWED[file].count);
    }
  });

  it('no allowed file has gone stale (each one still writes what it claims)', () => {
    for (const file of Object.keys(ALLOWED)) {
      expect(found[file] ?? 0, `${file} no longer writes any half-step — remove it from the list`).toBeGreaterThan(0);
    }
  });
});
