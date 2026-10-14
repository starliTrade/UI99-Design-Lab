/**
 * LIMINAL · THE ENGINE, IN ONE PLACE
 *
 * Every module a consumer can reach. It was incomplete: fourteen of them were
 * absent, including `liminal-surface` — the resolver every component calls —
 * and `liminal-ladder`, `liminal-theme`, `liminal-direction` and
 * `liminal-contrast`. Inside the repo that did not matter, because a component
 * imports by path. For a LIBRARY it is the whole question: a consumer who
 * cannot import `resolveSurface` cannot build a component on the engine.
 *
 * `engine-barrel.test.ts` keeps this list honest.
 */
export * from './spec-engine';
export * from './liminal-color-engine';
export * from './liminal-layout-engine';
export * from './liminal-motion-engine';
export * from './liminal-component';
export * from './liminal-component-engine';
export * from './liminal-hooks';
export * from './liminal-portal';
export * from './liminal-positioning-engine';
export * from './liminal-floating';
export * from './liminal-icon-engine';
export * from './liminal-variants';
export * from './liminal-slot';
export * from './liminal-bidi';
export * from './liminal-color-math';
export * from './liminal-contract';
export * from './liminal-contrast';
export * from './liminal-css-vars';
export * from './liminal-direction';
export * from './liminal-jalali';
export * from './liminal-ladder';
export * from './liminal-mist';
export * from './liminal-persian';
export * from './liminal-surface-context';
export * from './liminal-surface';
export * from './liminal-theme';
export * from './liminal-token-version';
