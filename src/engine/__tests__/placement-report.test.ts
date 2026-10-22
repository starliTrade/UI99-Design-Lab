import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveSurface, reportOnce, PLACEMENT_EXEMPTIONS } from '../liminal-surface';

// Roadmap 1.1: a placement that breaks LAW 2 is reported in every environment, once per pair.
describe('placement reporting (LAW 2, every environment)', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('warns once for a violating pair, not on every call', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    resolveSurface({ role: 'work', on: 'canvas' } as never);
    resolveSurface({ role: 'work', on: 'canvas' } as never);
    const hits = warn.mock.calls.filter((c) => String(c[0]).includes('work'));
    expect(hits.length).toBe(1);
  });

  it('does not warn for an exempt pair', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const e = PLACEMENT_EXEMPTIONS[0];
    resolveSurface({ role: e.role, on: e.on } as never);
    expect(warn).not.toHaveBeenCalled();
  });

  it('reportOnce never throws and reports a key only once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(() => reportOnce('test-key-unique-1', 'hello')).not.toThrow();
    reportOnce('test-key-unique-1', 'hello again');
    expect(warn.mock.calls.filter((c) => String(c[0]).includes('hello')).length).toBe(1);
  });
});
