"use client";

/**
 * EVERYTHING HERE IS A CLIENT COMPONENT.
 *
 * The directive is what tells a React Server Component bundler that this
 * module and everything it imports run on the client. Without it, a Next.js
 * App Router consumer importing a Button gets "useState only works in a
 * Client Component" — and the fix is not theirs to make, because the hooks
 * are ours.
 *
 * It sits on the ENTRY rather than on each file, because the directive
 * propagates: marking this module marks every module it imports.
 */

export * from './atoms';
export * from './inputs';
export * from './containers';
export * from './feedback';
export * from './data';
export * from './nav';
export * from './layout';
export * from './composites';
