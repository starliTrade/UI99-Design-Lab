/**
 * LIMINAL — THE LIBRARY ENTRY
 *
 * Two things a consumer imports, and they are not the same kind of thing:
 *
 *   the engine      the rules. `resolveSurface`, the ladder, the contrast
 *                   derivation, the theme, the direction system. A consumer who
 *                   builds a component on LIMINAL imports this.
 *   the components  the kit. Everything in `src/components`.
 *
 * The engine is the part that makes this a system rather than a component
 * collection, so it is exported first and it is exported whole — see
 * `engine-barrel.test.ts`, which failed when fourteen modules were missing from
 * it, including the resolver every component calls.
 *
 * Styles are a separate entry: `liminal/styles.css`. They are not imported here
 * because a consumer may want the engine's arithmetic without its CSS, and
 * because a side-effectful import in an entry point is a bundler's problem.
 */
export * from './engine';
export * from './components';
