/**
 * ESLint + TypeScript 7 compatibility shim.
 *
 * `typescript-eslint` 8.x refuses to load when TypeScript 7 is installed
 * (see typescript-eslint#10940; typed rules are not supported on TS >= 7.0 yet).
 * Microsoft's TypeScript 7 release notes recommend running TypeScript 6
 * side-by-side for tooling that has not caught up.
 *
 * This shim maps `require('typescript')` to the TypeScript 6 copy for the ESLint
 * process only. The application, `tsc --noEmit` and the editor keep using
 * TypeScript 7. Remove this file once typescript-eslint supports TS >= 7.1.
 */
const Module = require('module');

const ts6Entry = require.resolve('typescript6/lib/typescript.js');
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveFilename(request, ...rest) {
  if (request === 'typescript') {
    return ts6Entry;
  }
  return originalResolveFilename.call(this, request, ...rest);
};
