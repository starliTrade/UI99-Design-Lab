/**
 * LIMINAL · TOKEN VERSION
 * «توکن می‌تواند بشکند بدون اینکه کد بشکند.»
 *
 * The library's version and the token contract's version are not the same
 * number, and the difference is not bookkeeping.
 *
 * A component can be refactored without a single token changing — a rename, a
 * new prop, a bug fix. And a token can change without a line of component code
 * moving: a ladder hex shifts by one 8-bit step, and every surface in every
 * consumer's app is a slightly different colour. The second is invisible in a
 * diff and visible on a screen.
 *
 * So the token contract carries its own version, and a change to it is recorded
 * with what a consumer has to do.
 */

/** The token contract's version. Independent of the package version. */
export const TOKEN_VERSION = '0.1.0';

export type TokenChangeKind =
  /** A token was added. Nothing to do. */
  | 'added'
  /** A token's value changed. The consumer should look. */
  | 'changed'
  /** A token is going away. It still works until the version below. */
  | 'deprecated'
  /** A token is gone. This is the breaking one. */
  | 'removed';

export interface TokenChange {
  kind: TokenChangeKind;
  /** The token path, as it appears in `tokens/liminal.tokens.json`. */
  token: string;
  /** What changed, in one line. */
  what: string;
  /** What a consumer has to do. Empty for `added`. */
  migration: string;
  /** For `deprecated`: the version it will be removed in. */
  removeIn?: string;
}

/**
 * THE DEPRECATION POLICY
 *
 * A token is deprecated for at least two minor versions before it is removed.
 * That is the same rule the roadmap sets for the package, and it exists for the
 * same reason: a consumer needs a release to notice and a release to act.
 */
export const DEPRECATION_WINDOW_MINORS = 2;

/**
 * The record.
 *
 * Empty is the honest state right now: the contract is at 0.1.0 and has not
 * shipped, so nothing has been deprecated and nothing has been removed. The
 * list exists so that the first change has somewhere to go, and so that a
 * consumer reading the DTCG file can see the contract's history rather than
 * inferring it from a diff.
 */
export const TOKEN_CHANGES: TokenChange[] = [];

/** The changes a consumer at `from` would have to act on. */
export function breakingChangesSince(from: string): TokenChange[] {
  const [a, b, c] = from.split('.').map(Number);
  const [x, y, z] = TOKEN_VERSION.split('.').map(Number);
  const older = a !== x ? a < x : b !== y ? b < y : c < z;
  if (!older) return [];
  return TOKEN_CHANGES.filter((ch) => ch.kind === 'removed' || ch.kind === 'changed');
}

/** A one-line summary of the contract's state, for the DTCG file and the docs. */
export function tokenVersionSummary(): string {
  const counts = TOKEN_CHANGES.reduce<Record<string, number>>((acc, ch) => {
    acc[ch.kind] = (acc[ch.kind] ?? 0) + 1;
    return acc;
  }, {});
  const parts = Object.entries(counts).map(([k, n]) => `${n} ${k}`);
  return `token contract ${TOKEN_VERSION}${parts.length ? ` — ${parts.join(', ')}` : ' — no changes recorded'}`;
}
