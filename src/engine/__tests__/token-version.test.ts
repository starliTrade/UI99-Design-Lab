import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { TOKEN_VERSION, TOKEN_CHANGES, DEPRECATION_WINDOW_MINORS, breakingChangesSince, tokenVersionSummary } from '../liminal-token-version';

const dtcg = JSON.parse(readFileSync(resolve(process.cwd(), 'tokens/liminal.tokens.json'), 'utf8'));
const changelog = readFileSync(resolve(process.cwd(), 'tokens/CHANGELOG.md'), 'utf8');

/**
 * The library's version and the token contract's version are not the same
 * number. A component can be refactored without a token changing, and a token
 * can change without a line of component code moving — a ladder hex shifting by
 * one 8-bit step is invisible in a diff and visible on every screen.
 */
describe('token version — the contract carries its own', () => {
  it('is a semver string', () => {
    expect(TOKEN_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('is written into the DTCG file, so a consumer can read it', () => {
    expect(dtcg.$extensions['com.liminal.contract'].version).toBe(TOKEN_VERSION);
    expect(dtcg.$extensions['com.liminal.contract'].deprecationWindowMinors).toBe(DEPRECATION_WINDOW_MINORS);
  });

  it('carries the change record into the DTCG file too', () => {
    expect(dtcg.$extensions['com.liminal.contract'].changes).toEqual(TOKEN_CHANGES);
  });

  it('names the version in the changelog', () => {
    expect(changelog).toContain(TOKEN_VERSION);
  });

  it('states the deprecation window, so it is a policy and not a habit', () => {
    expect(DEPRECATION_WINDOW_MINORS).toBeGreaterThanOrEqual(2);
    expect(changelog).toContain(String(DEPRECATION_WINDOW_MINORS));
  });
});

describe('token version — the change record', () => {
  it('is empty at 0.1.0, because the contract has not shipped', () => {
    // The honest state. The list exists so the first change has somewhere to go.
    expect(TOKEN_CHANGES).toEqual([]);
  });

  it('every recorded change names the token, what changed and what to do', () => {
    for (const c of TOKEN_CHANGES) {
      expect(c.token, 'a change with no token').toBeTruthy();
      expect(c.what, `${c.token} has no description`).toBeTruthy();
      if (c.kind !== 'added') expect(c.migration, `${c.token} has no migration`).toBeTruthy();
      if (c.kind === 'deprecated') expect(c.removeIn, `${c.token} has no removal version`).toBeTruthy();
    }
  });

  it('reports nothing breaking for a consumer already at this version', () => {
    expect(breakingChangesSince(TOKEN_VERSION)).toEqual([]);
  });

  it('summarises its own state', () => {
    expect(tokenVersionSummary()).toContain(TOKEN_VERSION);
  });
});
