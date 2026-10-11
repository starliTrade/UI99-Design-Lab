import { describe, it, expect } from 'vitest';
import { getContractSections, getContractText, getContractChecklist, CONTRACT } from '../liminal-contract';
import { LADDER, TEXT_HIERARCHY, FOCUS_RING_COLOR } from '../spec-engine';
import { oklchLightness } from '../liminal-color-math';
import { LiminalLayoutEngine } from '../liminal-layout-engine';
import { LiminalMotionEngine } from '../liminal-motion-engine';
import { LiminalColorEngine } from '../liminal-color-engine';

/**
 * The contract is generated from the engine. These tests prove the generated
 * text actually contains the live values — so it cannot silently drift the way
 * the hand-written version did.
 */
describe('generated contract — cannot drift from the tokens', () => {
  const text = getContractText();

  it('names every live ladder step', () => {
    LADDER.forEach((hex, i) => {
      expect(text, `S${i} (${hex}) is missing from the contract`).toContain(hex);
    });
  });

  it('states the measured perceptual quantum, not an assumption', () => {
    expect(text).toContain(`q = ${CONTRACT.quantum}`);
    expect(text).toContain(`r = ${CONTRACT.reliableBoundary}`);
    // The old, unmeasured values must never come back as the basis.
    expect(text).not.toContain('Target ΔL 0.015');
    expect(text).not.toContain('target 0.0127');
  });

  it('states the live text alphas', () => {
    expect(text).toContain(`Primary α${TEXT_HIERARCHY.primary}`);
    expect(text).toContain(`Secondary α${TEXT_HIERARCHY.secondary}`);
    expect(text).toContain(`α${TEXT_HIERARCHY.tertiary[0]}`);
    expect(text).toContain(`α${TEXT_HIERARCHY.quaternary[0]}`);
  });

  it('describes the focus ring that actually renders', () => {
    // Rendered as a plain value in prose; resolve the token to its fallback.
    const ring = FOCUS_RING_COLOR.replace(/var\([^,]+,\s*/, '').replace(/\)$/, '');
    expect(text).toContain(ring);
    // The contract must never again recommend a ladder step as a focus ring:
    // that is dark-on-dark (~1.01:1) and invisible.
    expect(text).toContain('never a ladder step');
  });

  it('states the live radii and spacing', () => {
    const R = LiminalLayoutEngine.RADIUS;
    expect(text).toContain(`chip ${R.chip}`);
    expect(text).toContain(`control ${R.control}`);
    expect(text).toContain(`card ${R.card}`);
    expect(text).toContain(`panel ${R.panel}`);
    expect(text).toContain(`container ${R.container}`);
    expect(text).toContain(`atom 4px`);
  });

  it('states the live motion durations', () => {
    expect(text).toContain(`${LiminalMotionEngine.DURATION.normal}ms`);
    expect(text).toContain(`${LiminalMotionEngine.DURATION.dramatic}ms`);
  });

  it('names every semantic role with its live solid colour', () => {
    for (const role of ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const) {
      const solid = LiminalColorEngine.SEMANTICS[role].solid
        .replace(/var\([^,]+,\s*/, '')
        .replace(/\)$/, '');
      expect(text, `${role} solid ${solid} missing`).toContain(solid);
    }
  });

  it('renders as structured sections for the UI', () => {
    const sections = getContractSections();
    expect(sections.length).toBeGreaterThanOrEqual(8);
    for (const section of sections) {
      expect(section.id, 'every section needs an id').toBeTruthy();
      expect(section.title, 'every section needs a title').toBeTruthy();
      expect(section.body.length, `${section.id} has an empty body`).toBeGreaterThan(20);
    }
  });

  it('does not contain the stale values the hand-written contract carried', () => {
    // These were the drifted values. If any reappears, something is hardcoded again.
    const stale = ['#08090C', '#0A0B0F', '#0D0E12', '#101115', 'ΔL: 0.015'];
    for (const value of stale) {
      expect(text, `stale value "${value}" is back in the contract`).not.toContain(value);
    }
  });
});

describe('generated checklist — numeric rules come from the tokens', () => {
  const checklist = getContractChecklist();
  const joined = checklist.join('\n');

  it('states the live step band in quanta, not the old numbers', () => {
    expect(joined).toContain(`[${CONTRACT.stepBand[0]}q, ${CONTRACT.stepBand[1]}q]`);
    expect(joined).toContain(`q = ${CONTRACT.quantum}`);
    expect(joined).not.toContain('<0.012 or >0.020');
  });

  it('states the live ceiling lightness, not L0.203', () => {
    const ceiling = oklchLightness(LADDER[LADDER.length - 1]).toFixed(3);
    expect(joined).toContain(`L${ceiling}`);
    expect(joined).not.toContain('L0.203');
  });

  it('states the live brand hex', () => {
    const brand = LiminalColorEngine.BRAND_PRIMARY.hex.replace(/var\([^,]+,\s*/, '').replace(')', '');
    expect(joined).toContain(brand);
  });

  it('covers every rule the system actually enforces', () => {
    expect(checklist.length).toBeGreaterThanOrEqual(10);
    for (const rule of checklist) {
      expect(rule.trim().length, 'no empty rules').toBeGreaterThan(5);
    }
  });
});
