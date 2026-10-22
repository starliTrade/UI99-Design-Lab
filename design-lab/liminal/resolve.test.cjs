// Run: node design-lab/liminal/resolve.test.cjs
'use strict';
const assert = require('assert');
const { resolve } = require('./resolve.cjs');

const cases = [
  ['S2 idle',            () => resolve('S2', ['idle']).level,        'S2'],
  ['S2 hover',           () => resolve('S2', ['hover']).level,       'S3'],
  ['S2 active',          () => resolve('S2', ['active']).level,      'S0'],
  ['S2 disabled',        () => resolve('S2', ['disabled']).level,    'S1'],
  ['S8 hover ceiling',   () => resolve('S8', ['hover']).level,       'S7'],
  ['S1 active floor',    () => resolve('S1', ['active']).level,      'S0'],
  ['S0 active clamp',    () => resolve('S0', ['active']).level,      'S0'],
  ['S2 focus keeps fill',() => resolve('S2', ['focus']).level,       'S2'],
  ['hover+focus fill',   () => resolve('S2', ['hover','focus']).level,'S3'],
];
let fail = 0;
for (const [name, fn, want] of cases) {
  try { assert.strictEqual(fn(), want); console.log('ok  ', name, '->', want); }
  catch (e) { fail++; console.log('FAIL', name, 'got', fn(), 'want', want); }
}
// focus ring: 1px lines, 1px gap, inner fill+1, outer fill+2 (F2)
const r = resolve('S2', ['focus']).ring;
try {
  assert.strictEqual(r.inner.hex, '#0b0d0f'); assert.strictEqual(r.outer.hex, '#0d0f12');
  assert.strictEqual(r.inner.widthPx, 1); assert.strictEqual(r.gapPx, 1); assert.strictEqual(r.outer.widthPx, 1);
  console.log('ok   focus ring F2');
} catch (e) { fail++; console.log('FAIL focus ring', JSON.stringify(r)); }
// no half rungs: every output is a whole S level
for (const rest of ['S0','S1','S2','S5','S7','S8']) for (const st of ['idle','hover','active','disabled']) {
  const lv = resolve(rest, [st]).level; assert.match(lv, /^S[0-8]$/);
}
console.log(fail ? `FAILED ${fail}` : 'ALL PASS');
process.exit(fail ? 1 : 0);
