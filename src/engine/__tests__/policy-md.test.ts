import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LADDER, CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE } from '../liminal-ladder';
import { ROLE_LEVEL, ROLE_RIM, ROLE_SHADOW, resolveBorderLevel, FLOATING_ROLES } from '../liminal-surface';
import { shadowModel, shadowPeakAlpha } from '../liminal-shadow';
import { oklchToHex } from '../liminal-color-math';

/**
 * THE POLICY IS THE RULES, AND THE RULES CARRY NUMBERS.
 *
 * The numbers are generated from the engine — the same shape as the contract, and for
 * the same reason: a number written down twice is a copy, and copies drift. This
 * project measured eleven mismatches in one file before the contract's blocks were
 * generated.
 *
 * So this asserts the generated blocks are in sync, block by block, and that every
 * block it is looking for actually exists — a guard that passes by finding nothing is
 * the failure mode every guard in this repo has learned to avoid.
 */
const policy = readFileSync(resolve(process.cwd(), 'LIMINAL-POLICY.md'), 'utf8');
const block = (name: string) => {
  const m = policy.match(new RegExp(`<!-- gen:${name} -->([\\s\\S]*?)<!-- /gen:${name} -->`));
  expect(m, `the ${name} block exists`).not.toBeNull();
  return m![1];
};

const oklch = (level: number) => `oklch(${(CANVAS_L + level * LADDER_STEP).toFixed(7)} ${LADDER_CHROMA} ${LADDER_HUE})`;
const hexAt = (level: number) => oklchToHex({ L: CANVAS_L + level * LADDER_STEP, C: LADDER_CHROMA, h: LADDER_HUE });
const ROLE = ['canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast'] as const;

describe('LIMINAL-POLICY.md — the rules carry the engine’s numbers', () => {
  it('every block it looks for exists', () => {
    for (const name of ['constants', 'layers', 'borders', 'shadows', 'allowed']) block(name);
  });

  it('carries every layer, exact', () => {
    const b = block('layers');
    for (let n = 0; n < 9; n++) {
      expect(b, `S${n}`).toContain(`\`${LADDER[n]}\``);
      expect(b, `S${n} exact`).toContain(`\`${oklch(n)}\``);
    }
  });

  it('carries every border, at the level the resolver computes', () => {
    const b = block('borders');
    for (let n = 0; n < 9; n++) {
      for (const kind of ['separator', 'edge'] as const) {
        const lvl = resolveBorderLevel({ role: ROLE[n], kind });
        expect(b, `S${n} ${kind}`).toContain(`\`S${lvl}\` · ${hexAt(lvl)}`);
      }
    }
  });

  it('carries every floating shadow with the alpha the model solves', () => {
    const b = block('shadows');
    const rgbAt = (level: number) => [1, 3, 5].map((i) => parseInt(hexAt(level).slice(i, i + 2), 16));
    for (const role of FLOATING_ROLES) {
      const h = ROLE_LEVEL[role];
      const m = shadowModel(h, rgbAt(2));
      expect(b, `${role}`).toContain(`\`α ${m.nearAlpha.toFixed(4)}\``);
      expect(b, `${role} radius`).toContain(`\`${m.far.toFixed(0)}px\``);
    }
  });

  it('carries the permission table, and it says what the engine says', () => {
    const b = block('allowed');
    for (let n = 0; n < 9; n++) {
      const role = ROLE[n];
      const rim = ROLE_RIM[role];
      const shadow = ROLE_SHADOW[role];
      expect(b, `S${n} rim`).toContain(rim ? `درجه ${rim}` : '**ممنوع**');
      expect(b, `S${n} shadow`).toContain(shadow === null ? '**ممنوع**' : `E${shadow}`);
    }
  });

  it('and the two laws are stated as laws, not as description', () => {
    expect(policy).toContain('قانون ۱ — بازهٔ عددی وجود ندارد');
    expect(policy).toContain('قانون ۲ — چه چیزی روی چه چیزی');
    // The honesty table: the one number that is neither measured nor derived.
    expect(policy, 'the policy says which number is a choice').toContain('تنها عددی در سیستم که هیچ‌کدام نیست');
  });
});
