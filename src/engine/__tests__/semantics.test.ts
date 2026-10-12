import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { getTextStyle } from '../spec-engine';
import { LiminalColorEngine } from '../liminal-color-engine';
import { LADDER } from '../liminal-ladder';
import { hexToRgb, rgbToOklch, contrastRatioHex } from '../liminal-color-math';
import { apcaMagnitude } from '../liminal-contrast';

const SEM: any = LiminalColorEngine.SEMANTICS;
const KEYS = ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const;

const hexOf = (v: string) => v.replace(/var\([^,]+, /, '').replace(/\)$/, '');
const oklch = (hex: string) => rgbToOklch(hexToRgb(hex));
const solid = (k: string) => hexOf(SEM[k].solid);

/**
 * The four semantic roles used to be twenty hand-written strings: lightness
 * swung from 0.637 to 0.800 with no rule, two hues sat between spectrum steps,
 * and the declared `hue` did not match the colour it named. Twelve components
 * read from that table, and not one test looked at it.
 */
describe('semantics — every facet is derived from the hue', () => {
  it('all four fills sit at ONE lightness', () => {
    const Ls = KEYS.map((k) => oklch(solid(k)).L);
    const spread = Math.max(...Ls) - Math.min(...Ls);
    expect(spread, `lightness spread ${spread.toFixed(4)}`).toBeLessThan(0.005);
  });

  it('all four fills are equally loud — one chroma, gamut as the only ceiling', () => {
    const Cs = KEYS.map((k) => oklch(solid(k)).C);
    // At least two hues have the headroom to reach the shared chroma, so the
    // values must agree there; the rest are clamped by the gamut, never above.
    // a hair over 0.15 is the hex round-trip quantising the chroma, not a
    // second value sneaking in
    expect(Math.max(...Cs)).toBeLessThanOrEqual(0.151);
    expect(Cs.filter((c) => c > 0.149).length).toBeGreaterThanOrEqual(2);
  });

  it('the declared hue matches the colour it names', () => {
    // It used to declare 155 / 85 / 15 / 230 while measuring 162.9 / 81.4 /
    // 23.5 / 257.5 — a label that did not describe its own colour.
    for (const k of KEYS) {
      const declared = SEM[k].hue;
      const actual = oklch(solid(k)).h;
      expect(Math.abs(actual - declared), `${k}: declared ${declared}, measured ${actual}`).toBeLessThan(2);
    }
  });

  it('subtle and border are alphas of the fill, not separate colours', () => {
    for (const k of KEYS) {
      const { r, g, b } = hexToRgb(solid(k));
      expect(SEM[k].subtle).toBe(`rgba(${r}, ${g}, ${b}, 0.1)`);
      expect(SEM[k].border).toBe(`rgba(${r}, ${g}, ${b}, 0.22)`);
    }
  });
});

describe('semantics — the standards the derivation is built on', () => {
  it('text meets its APCA floor on EVERY surface it can sit on', () => {
    // The floor is measured against the work surface, so the worst case is the
    // darkest surface in the ladder — the one with the least contrast against a
    // light colour.
    const worst = LADDER[LADDER.length - 1];
    for (const k of KEYS) {
      const lc = apcaMagnitude(SEM[k].text, worst);
      expect(lc, `${k} text on the darkest surface: Lc ${lc.toFixed(1)}`).toBeGreaterThanOrEqual(75);
    }
  });

  it('text meets WCAG AA on every surface too', () => {
    for (const surface of LADDER) {
      for (const k of KEYS) {
        const ratio = contrastRatioHex(SEM[k].text, surface);
        expect(ratio, `${k} on ${surface}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('text ON a fill meets the floor against that fill', () => {
    for (const k of KEYS) {
      const lc = apcaMagnitude(SEM[k].onSolid, solid(k));
      expect(lc, `${k} onSolid: Lc ${lc.toFixed(1)}`).toBeGreaterThanOrEqual(75);
    }
  });

  it('text on a fill meets WCAG AA', () => {
    for (const k of KEYS) {
      const ratio = contrastRatioHex(SEM[k].onSolid, solid(k));
      expect(ratio, `${k}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('semantics — what is a convention and what is derived', () => {
  it('the four hues are distinct, so the roles are told apart by hue alone', () => {
    const hues = KEYS.map((k) => Math.round(SEM[k].hue));
    expect(new Set(hues).size).toBe(KEYS.length);
  });

  it('the fill is dark enough to carry white, and white is what it carries', () => {
    // Black text wants a light fill and white wants a dark one. The system was
    // using black on a medium fill, which reached neither the floor nor a
    // saturated colour.
    for (const k of KEYS) {
      expect(SEM[k].onSolid, k).toBe('#FFFFFF');
      expect(oklch(solid(k)).L, k).toBeLessThan(0.62);
    }
  });
});

describe('quaternary — the floor for ANY text, not for read copy', () => {
  // It was declared `non-text`, which invited nine components to use it for
  // hints, labels and footers. Measured on the darkest surface it gives 4.06:1
  // — under the 4.5 AA asks for normal text.
  const roles = LiminalColorEngine.SEMANTICS;

  it('is below the AA floor for normal text, which is why it is not used as one', () => {
    const c = getTextStyle('quaternary', 8).color as string;
    const solid = composite(c, LADDER[LADDER.length - 1]);
    const ratio = contrastRatioHex(solid, LADDER[LADDER.length - 1]);
    expect(ratio).toBeLessThan(4.5);
  });

  it('every text role that IS read copy clears AA on every surface', () => {
    for (const role of ['primary', 'secondary', 'tertiary'] as const) {
      for (const surface of LADDER) {
        const solid = composite(getTextStyle(role, 0).color as string, surface);
        const ratio = contrastRatioHex(solid, surface);
        expect(ratio, `${role} on ${surface}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it('no component uses quaternary for text it expects to be read', () => {
    // The three that remain are a placeholder, a disabled option and a
    // decorative separator — the places APCA's lowest text band applies.
    const SRC = resolve(process.cwd(), 'src/components');
    const allowed = ['Select.tsx', 'Breadcrumb.tsx'];
    const offenders: string[] = [];
    const walk = (dir: string): string[] => {
      const out: string[] = [];
      for (const e of readdirSync(dir)) {
        if (e === '__tests__' || e === 'node_modules') continue;
        const full = resolve(dir, e);
        if (statSync(full).isDirectory()) out.push(...walk(full));
        else if (/\.tsx$/.test(e) && !/Demo\.tsx$/.test(e)) out.push(full);
      }
      return out;
    };
    for (const file of walk(SRC)) {
      const name = file.split('/').pop()!;
      if (allowed.includes(name)) continue;
      if (/getTextStyle\('quaternary'/.test(readFileSync(file, 'utf8'))) offenders.push(name);
    }
    expect(offenders).toEqual([]);
  });
});

/** rgba over a hex, so a text token can be measured against a surface. */
function composite(rgba: string, bg: string): string {
  const m = rgba.match(/rgba?\(([^)]+)\)/);
  if (!m) return rgba;
  const p = m[1].split(',').map((s) => parseFloat(s));
  const b = hexToRgb(bg);
  const to = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0');
  return `#${to(b.r * (1 - p[3]) + p[0] * p[3])}${to(b.g * (1 - p[3]) + p[1] * p[3])}${to(b.b * (1 - p[3]) + p[2] * p[3])}`;
}
