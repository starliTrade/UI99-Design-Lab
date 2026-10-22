import { describe, it, expect } from 'vitest';
import { PLACEMENT_EXEMPTIONS, placementAttrs, checkPlacement } from '../liminal-surface';

// Roadmap 1.3: every exemption is visible in the DOM as data-exempt, and nothing else is.
describe('placement exemptions are visible in the DOM', () => {
  it('every PLACEMENT_EXEMPTIONS pair emits data-exempt', () => {
    for (const e of PLACEMENT_EXEMPTIONS) {
      expect(placementAttrs(e.role, e.on)).toEqual({ 'data-exempt': `${e.role}>${e.on}` });
    }
  });

  it('a non-exempt pair emits nothing, and no `on` emits nothing', () => {
    expect(placementAttrs('control', 'work')).toEqual({});
    expect(placementAttrs('control', undefined)).toEqual({});
  });

  it('the attribute appears exactly where checkPlacement waives the law', () => {
    for (const e of PLACEMENT_EXEMPTIONS) {
      expect(checkPlacement({ role: e.role, on: e.on }).ok).toBe(true);
      expect(placementAttrs(e.role, e.on)['data-exempt']).toBeDefined();
    }
  });
});
