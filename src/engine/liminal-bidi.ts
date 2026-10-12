/**
 * LIMINAL · BIDI
 * «متن دوجهته یک باگ چیدمانی است که فقط با چشمِ فارسی‌خوان دیده می‌شود.»
 *
 * Setting `dir="rtl"` gets the base direction right. It does not get the runs
 * inside it right, and those are where bidi actually breaks:
 *
 *   - A Latin word inside a Persian sentence drags the punctuation after it.
 *     «فایل config.json را باز کن.» renders with the full stop at the wrong end
 *     unless the Latin run is isolated.
 *   - A number with separators — `1,234` — can reorder its own groups.
 *   - A trailing `:` or `.` after a Latin run jumps to the other side.
 *   - User content of unknown direction (a name, a search query) reorders the
 *     layout around it.
 *
 * The browser's answer is the Unicode isolate: a run is wrapped so its
 * direction is decided inside and it cannot affect its neighbours. This module
 * names the pieces so a component does not have to remember U+2068.
 */

/** U+2068 FIRST STRONG ISOLATE — opens a run whose direction is detected. */
export const FSI = '\u2068';
/** U+2069 POP DIRECTIONAL ISOLATE — closes it. */
export const PDI = '\u2069';

/**
 * The ranges that carry right-to-left text.
 *
 * Arabic, Arabic Supplement and Extended, Syriac, Thaana, NKo, Samaritan,
 * Mandaic, Hebrew, Arabic Presentation Forms A and B, and the RTL
 * supplementary plane. Persian lives in the first two.
 */
const RTL_RANGES: Array<[number, number]> = [
  [0x0590, 0x05ff], // Hebrew
  [0x0600, 0x06ff], // Arabic — Persian is here
  [0x0700, 0x074f], // Syriac
  [0x0750, 0x077f], // Arabic Supplement
  [0x0780, 0x07bf], // Thaana
  [0x07c0, 0x07ff], // NKo
  [0x0800, 0x083f], // Samaritan
  [0x0840, 0x085f], // Mandaic
  [0x08a0, 0x08ff], // Arabic Extended-A
  [0xfb1d, 0xfb4f], // Hebrew Presentation Forms
  [0xfb50, 0xfdff], // Arabic Presentation Forms-A
  [0xfe70, 0xfeff], // Arabic Presentation Forms-B
  [0x1ee00, 0x1eeff], // Arabic Mathematical Alphabetic Symbols
];

/** The strong left-to-right letters that decide a run's direction. */
const LTR_LETTER = /[A-Za-z\u00c0-\u024f\u0370-\u058f]/;

export type TextDirection = 'rtl' | 'ltr' | 'neutral';

const isRTLChar = (cp: number) => RTL_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);

/**
 * The direction a string should be displayed in, by its first strong character
 * — the same rule the Unicode algorithm uses for `dir="auto"`.
 *
 * Digits are neutral here on purpose: a number reads the same either way, so it
 * cannot decide the direction of the text around it.
 */
export function detectDirection(text: string): TextDirection {
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    if (isRTLChar(cp)) return 'rtl';
    if (LTR_LETTER.test(ch)) return 'ltr';
  }
  return 'neutral';
}

/** True when the string contains any right-to-left character. */
export function hasRTL(text: string): boolean {
  for (const ch of text) if (isRTLChar(ch.codePointAt(0) ?? 0)) return true;
  return false;
}

/** True when the string contains any left-to-right letter. */
export function hasLTR(text: string): boolean {
  for (const ch of text) if (LTR_LETTER.test(ch)) return true;
  return false;
}

/**
 * True when a string mixes both scripts — the case that actually breaks.
 *
 * A purely Persian string and a purely Latin one are both fine under a correct
 * base direction. It is the mixture that reorders.
 */
export function isMixed(text: string): boolean {
  return hasRTL(text) && hasLTR(text);
}

/**
 * Wrap a run in a Unicode isolate, so its direction is decided inside and it
 * cannot reorder what surrounds it.
 *
 * Use it for anything embedded in text whose direction is not the base
 * direction: a filename, a code identifier, a URL, a user's name.
 */
export function isolate(text: string): string {
  return `${FSI}${text}${PDI}`;
}

/**
 * The CSS that isolates an element's content without a wrapper character.
 *
 * `isolate` decides the element's own direction from its content and stops it
 * affecting its neighbours. `plaintext` additionally ignores the inherited
 * direction — right for a field the user types into, where the direction should
 * follow what they type rather than the page.
 */
export const BIDI_ISOLATE = { unicodeBidi: 'isolate' } as const;
export const BIDI_PLAINTEXT = { unicodeBidi: 'plaintext' } as const;

/**
 * The `dir` attribute a component should put on a value of unknown direction.
 *
 * `'auto'` is the browser's own first-strong detection, and it is better than
 * anything computed here because it also handles the neutral cases. This
 * function exists so a component that needs the value in JavaScript — to pick a
 * placement, say — gets the same answer.
 */
export function dirAttribute(text: string): 'rtl' | 'ltr' {
  const d = detectDirection(text);
  return d === 'rtl' ? 'rtl' : 'ltr';
}
