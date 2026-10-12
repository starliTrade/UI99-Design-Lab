import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  detectDirection,
  hasRTL,
  hasLTR,
  isMixed,
  isolate,
  dirAttribute,
  FSI,
  PDI,
  BIDI_ISOLATE,
  BIDI_PLAINTEXT,
} from '../liminal-bidi';

/**
 * `dir="rtl"` gets the base direction right. It does not get the runs inside it
 * right, and those are where bidi actually breaks: a Latin word in a Persian
 * sentence drags the punctuation after it, a number with separators reorders
 * its own groups, and user content of unknown direction reorders the layout
 * around it.
 */
describe('bidi — detecting the direction of a run', () => {
  it('reads Persian as rtl', () => {
    expect(detectDirection('سلام')).toBe('rtl');
    expect(hasRTL('سلام')).toBe(true);
  });

  it('reads Latin as ltr', () => {
    expect(detectDirection('hello')).toBe('ltr');
    expect(hasLTR('hello')).toBe(true);
  });

  it('reads digits alone as neutral — a number cannot decide the direction', () => {
    expect(detectDirection('1234')).toBe('neutral');
    expect(detectDirection('1,234.56')).toBe('neutral');
    expect(detectDirection('  ')).toBe('neutral');
    expect(detectDirection('')).toBe('neutral');
  });

  it('uses the FIRST strong character, like dir="auto"', () => {
    expect(detectDirection('سلام hello')).toBe('rtl');
    expect(detectDirection('hello سلام')).toBe('ltr');
    expect(detectDirection('123 سلام')).toBe('rtl');
    expect(detectDirection('123 hello')).toBe('ltr');
  });

  it('knows when a string mixes both scripts — the case that breaks', () => {
    expect(isMixed('فایل config.json را باز کن')).toBe(true);
    expect(isMixed('سلام')).toBe(false);
    expect(isMixed('hello')).toBe(false);
    expect(isMixed('1234')).toBe(false);
  });

  it('covers the Arabic-Indic and Persian digit blocks as rtl-neutral', () => {
    // Persian digits are in the Arabic block, so they read as rtl characters —
    // which is correct: they sit in an rtl run.
    expect(hasRTL('۱۲۳')).toBe(true);
  });

  it('covers Hebrew, which is also rtl', () => {
    expect(detectDirection('שלום')).toBe('rtl');
  });
});

describe('bidi — isolating a run', () => {
  it('wraps in FSI and PDI', () => {
    expect(isolate('config.json')).toBe(`${FSI}config.json${PDI}`);
  });

  it('the wrapper is the Unicode isolate pair, not a marker character', () => {
    expect(FSI).toBe('\u2068');
    expect(PDI).toBe('\u2069');
  });

  it('keeps the text inside copyable and unchanged', () => {
    const wrapped = isolate('config.json');
    expect(wrapped).toContain('config.json');
    expect(wrapped.replace(/[\u2066-\u2069]/g, '')).toBe('config.json');
  });

  it('the CSS opt-ins name the same two behaviours', () => {
    expect(BIDI_ISOLATE.unicodeBidi).toBe('isolate');
    expect(BIDI_PLAINTEXT.unicodeBidi).toBe('plaintext');
  });
});

describe('bidi — the dir attribute a component should use', () => {
  it('never returns neutral: a dir attribute is rtl or ltr', () => {
    for (const s of ['سلام', 'hello', '1234', '', '  ']) {
      expect(['rtl', 'ltr']).toContain(dirAttribute(s));
    }
  });

  it('falls back to ltr for a neutral string', () => {
    expect(dirAttribute('1234')).toBe('ltr');
  });
});

describe('bidi — the stylesheet is loaded and carries the opt-ins', () => {
  const css = readFileSync(resolve(process.cwd(), 'src/engine/liminal-bidi.css'), 'utf8');
  const index = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');

  it('is imported by the entry stylesheet', () => {
    expect(index).toContain('liminal-bidi.css');
  });

  it('offers isolate, plaintext and the two named cases', () => {
    expect(css).toContain('.liminal-bidi-isolate');
    expect(css).toContain('.liminal-bidi-plaintext');
    expect(css).toContain('.liminal-bidi-code');
    expect(css).toContain('.liminal-bidi-number');
    expect(css).toContain('unicode-bidi: isolate');
    expect(css).toContain('unicode-bidi: plaintext');
  });

  it('pins a code block to ltr in every direction', () => {
    const block = css.slice(css.indexOf('.liminal-bidi-code'));
    expect(block).toContain('direction: ltr');
    expect(block).toContain('text-align: left');
  });
});
