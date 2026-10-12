import { LiminalLayoutEngine } from './liminal-layout-engine';

/**
 * LIMINAL · PERSIAN
 * «فارسی خطی پیوسته است — و فاصله‌گذاریِ حروف، آن را می‌شکند.»
 *
 * Two facts about the script, and neither is a preference:
 *
 * 1. **Persian is connected.** Letters join within a word, so positive
 *    letter-spacing does not space the letters — it breaks the joins and the
 *    word stops being a word. The Latin scale uses +0.04em at level 1 and
 *    negative tracking at the display levels; none of it transfers.
 *
 * 2. **Persian sits taller on the line.** The measured metrics of Vazirmatn
 *    (the reference face for this system) are:
 *
 *      unitsPerEm 2048 · ascender 2100 · descender -1100 · lineGap 0
 *      natural line-height = (2100 + 1100 + 0) / 2048 = 1.5625
 *
 *    The Latin scale runs 1.10 to 1.60. So at every level except body copy the
 *    designed line-height is BELOW what the font needs, and the ascenders and
 *    descenders of adjacent lines collide. The floor is not a taste: it is
 *    `(ascender - descender + lineGap) / unitsPerEm`, and it is 1.5625.
 */

/** The reference Persian face. */
export const PERSIAN_FONT = 'Vazirmatn';

/**
 * Vazirmatn's natural line-height, from its own metrics.
 *
 * `max(designed, this)` is the rule. A tighter line-height is a design choice
 * that a Latin face can afford; a Persian one pays for it in clipped
 * descenders, which is a defect rather than a look.
 */
export const PERSIAN_LINE_HEIGHT_FLOOR = 1.5625;

/** The font stack, so a consumer can override the face without changing the metrics contract. */
export const PERSIAN_FONT_STACK = `${PERSIAN_FONT}, "Vazirmatn RD", "Noto Naskh Arabic", "Segoe UI", Tahoma, sans-serif`;

export type Lang = 'en' | 'fa';

/**
 * Line-height for a level in a language.
 *
 * `en` returns the designed value. `fa` returns the larger of the designed
 * value and the font's own floor — so body copy keeps its 1.60 and every
 * heading gains the leading its descenders need.
 */
export function lineHeightFor(level: number, lang: Lang): number {
  const designed = LiminalLayoutEngine.TYPOGRAPHY[level]?.lh ?? 1.5;
  return lang === 'fa' ? Math.max(designed, PERSIAN_LINE_HEIGHT_FLOOR) : designed;
}

/**
 * Letter-spacing for a level in a language.
 *
 * `en` returns the designed tracking. `fa` returns `0`: the script is
 * connected, and any positive value breaks the joins. The negative display
 * tracking is also dropped — it tightens a Latin word shape that Persian does
 * not have.
 */
export function letterSpacingFor(level: number, lang: Lang): string {
  if (lang === 'fa') return '0';
  return LiminalLayoutEngine.TYPOGRAPHY[level]?.ls ?? '0';
}

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'] as const;
const ARABIC_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

/**
 * Latin digits to Persian ones.
 *
 * Persian uses U+06F0-U+06F9, not the Arabic-Indic U+0660-U+0669 that many
 * "localisation" helpers reach for. They look similar and are different
 * characters; a Persian reader sees the wrong one immediately.
 */
export function toPersianDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)]);
}

/** Persian or Arabic-Indic digits back to Latin, for parsing. */
export function toLatinDigits(input: string): string {
  let out = input;
  PERSIAN_DIGITS.forEach((d, i) => (out = out.split(d).join(String(i))));
  ARABIC_INDIC.forEach((d, i) => (out = out.split(d).join(String(i))));
  return out;
}

/** Format a number for a language: grouped, and in the right digits. */
export function formatNumber(value: number, lang: Lang, options: Intl.NumberFormatOptions = {}): string {
  const formatted = new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US', options).format(value);
  return lang === 'fa' ? toPersianDigits(formatted) : formatted;
}

/**
 * The full type style for a level in a language.
 *
 * The Latin `getTypeStyle` is the `en` branch of this. Components that render
 * Persian should call this instead, or the two facts above are lost: the joins
 * break and the descenders clip.
 */
export function getLocalizedTypeStyle(
  level: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
  lang: Lang,
  isCaps = false,
): {
  fontSize: string;
  lineHeight: number;
  letterSpacing: string;
  fontWeight: number;
} {
  const t = LiminalLayoutEngine.TYPOGRAPHY[level];
  return {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(level),
    lineHeight: lineHeightFor(level, lang),
    letterSpacing: letterSpacingFor(level, lang),
    fontWeight: isCaps && lang === 'en' ? t.weight : t.weight,
  };
}
