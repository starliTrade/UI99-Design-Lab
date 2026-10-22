import { describe, it, expect } from 'vitest';
import {
  apcaContrast,
  apcaMagnitude,
  apcaLuminance,
  whiteAlphaApcaOn,
  minWhiteAlphaForApca,
  deriveTextToken,
  deriveTextHierarchy,
  CONTRAST_FLOOR,
  APCA_FLOOR,
  type TextRole,
} from '../liminal-contrast';
import { LADDER } from '../liminal-ladder';
import { contrastRatioHex, whiteAlphaContrastOn } from '../liminal-color-math';

const ROLES: TextRole[] = ['primary', 'secondary', 'tertiary', 'quaternary'];

/**
 * The APCA implementation is verified against the published reference values
 * from the APCA 0.1.9 spec. If these drift, every derived token is suspect, so
 * they are pinned first.
 */
describe('APCA · verified against reference values', () => {
  it('white on black is ~ -108', () => {
    expect(apcaContrast('#ffffff', '#000000')).toBeCloseTo(-107.9, 0);
  });

  it('black on white is ~ +106', () => {
    expect(apcaContrast('#000000', '#ffffff')).toBeCloseTo(106.0, 0);
  });

  it('identical colours give 0', () => {
    expect(apcaContrast('#808080', '#808080')).toBe(0);
  });

  it('light-on-dark is negative, dark-on-light is positive', () => {
    expect(apcaContrast('#ffffff', '#000000')).toBeLessThan(0);
    expect(apcaContrast('#000000', '#ffffff')).toBeGreaterThan(0);
  });

  it('uses APCA luminance, not WCAG relative luminance', () => {
    // APCA linearises with a simple 2.4 exponent, so mid grey lands at ~0.1913.
    // WCAG's piecewise curve gives ~0.2159 for the same colour — a real
    // difference, which is why these are separate functions.
    expect(apcaLuminance('#808080')).toBeCloseTo(0.1913, 3);
  });

  it('is asymmetric by design — the two polarities are not mirror images', () => {
    // APCA uses different exponents for each polarity (0.56/0.57 vs 0.65/0.62),
    // so white-on-black and black-on-white are close but deliberately unequal.
    // Treating them as interchangeable would be a modelling error.
    const lightOnDark = apcaMagnitude('#ffffff', '#000000');
    const darkOnLight = apcaMagnitude('#000000', '#ffffff');
    expect(lightOnDark).not.toBe(darkOnLight);
    expect(Math.abs(lightOnDark - darkOnLight)).toBeLessThan(3);
  });
});

describe('WCAG ratio · sanity', () => {
  it('black on white is 21:1', () => {
    expect(contrastRatioHex('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('identical colours are 1:1', () => {
    expect(contrastRatioHex('#123456', '#123456')).toBeCloseTo(1, 5);
  });
});

/**
 * The core promise of "contrast as input": there is no input for which the
 * engine returns a token that fails its floor.
 */
describe('deriveTextToken · the floors are always met', () => {
  for (const role of ROLES) {
    for (let n = 0; n < LADDER.length; n++) {
      it(`${role} on S${n} meets both floors`, () => {
        const token = deriveTextToken(role, LADDER[n]);
        expect(token.wcag).toBeGreaterThanOrEqual(CONTRAST_FLOOR[role]);
        expect(token.apca).toBeGreaterThanOrEqual(APCA_FLOOR[role]);
      });
    }
  }

  it('reports which lens bound the result', () => {
    const token = deriveTextToken('secondary', LADDER[0]);
    expect(['wcag', 'apca']).toContain(token.boundBy);
    // The binding alpha is by definition the larger of the two.
    expect(token.alpha).toBe(Math.max(token.wcagAlpha, token.apcaAlpha));
  });

  it('emits a valid rgba string at the derived alpha', () => {
    const token = deriveTextToken('tertiary', LADDER[0]);
    expect(token.value).toBe(`rgba(255, 255, 255, ${token.alpha})`);
  });
});

/**
 * Minimality: the derived alpha is the LIGHTEST colour that clears the floor.
 * If a slightly lower alpha also passed, the engine would be over-brightening
 * the text and flattening the hierarchy for no reason.
 */
describe('deriveTextToken · the result is minimal', () => {
  for (const role of ROLES) {
    it(`${role} on S0 cannot go any dimmer`, () => {
      const token = deriveTextToken(role, LADDER[0]);
      const dimmer = Math.max(0, token.alpha - 0.002);
      const failsWcag = whiteAlphaContrastOn(LADDER[0], dimmer) < CONTRAST_FLOOR[role];
      const failsApca = whiteAlphaApcaOn(LADDER[0], dimmer) < APCA_FLOOR[role];
      expect(failsWcag || failsApca).toBe(true);
    });
  }
});

describe('deriveTextToken · monotonicity', () => {
  it('a higher floor never yields a lower alpha', () => {
    const a = minWhiteAlphaForApca(LADDER[0], 45);
    const b = minWhiteAlphaForApca(LADDER[0], 60);
    const c = minWhiteAlphaForApca(LADDER[0], 75);
    expect(b).toBeGreaterThanOrEqual(a);
    expect(c).toBeGreaterThanOrEqual(b);
  });

  it('APCA magnitude rises with alpha', () => {
    expect(whiteAlphaApcaOn(LADDER[0], 0.8)).toBeGreaterThan(
      whiteAlphaApcaOn(LADDER[0], 0.4),
    );
  });
});

describe('deriveTextHierarchy · shape', () => {
  const table = deriveTextHierarchy(LADDER);

  it('covers every role', () => {
    for (const role of ROLES) expect(table[role]).toHaveLength(LADDER.length);
  });

  it('every cell meets its floors', () => {
    for (const role of ROLES) {
      for (const token of table[role]) {
        expect(token.wcag).toBeGreaterThanOrEqual(CONTRAST_FLOOR[role]);
        expect(token.apca).toBeGreaterThanOrEqual(APCA_FLOOR[role]);
      }
    }
  });

  it('the hierarchy is monotonic: primary is never dimmer than quaternary', () => {
    for (let n = 0; n < LADDER.length; n++) {
      expect(table.primary[n].alpha).toBeGreaterThanOrEqual(table.quaternary[n].alpha);
      expect(table.secondary[n].alpha).toBeGreaterThanOrEqual(table.tertiary[n].alpha);
    }
  });
});

