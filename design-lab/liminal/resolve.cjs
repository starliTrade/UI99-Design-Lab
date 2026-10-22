// Liminal states engine (policy A + focus F2). Reads states-policy-A.json.
// resolve(rest, state) -> { level: 'S0'..'S8', hex, ring? }
'use strict';
const POLICY = require('./states-policy-A.json');

const MIN = 0, MAX = 8;
const clamp = n => Math.max(MIN, Math.min(MAX, n));
const lvl = n => 'S' + n;
const parse = s => { const m = /^S(\d)$/.exec(s); if (!m) throw new Error('bad level ' + s); return +m[1]; };

function hexOf(n) { return POLICY.ladder[lvl(clamp(n))].hex; }

// Whole-rung offset of a state. Hover flips to -1 at the ceiling (§6.8.1 rule 3).
function offsetFor(state, restN) {
  const s = POLICY.states[state];
  if (!s) throw new Error('unknown state ' + state);
  if (state === 'hover' && restN === MAX) return s.offsetAtCeiling;
  if (state === 'focus') return 0;
  return s.offset;
}

// Focus ring: inner fill+1, gap, outer fill+2; every line is 1px (F2).
function ring(fillN) {
  const r = POLICY.states.focus.ring;
  return {
    inner: { hex: hexOf(fillN + r.inner.offset), widthPx: r.inner.widthPx },
    gapPx: r.gapPx,
    outer: { hex: hexOf(fillN + r.outer.offset), widthPx: r.outer.widthPx },
  };
}

// states: array, e.g. ['hover','focus']. Fill from the non-focus state; ring from focus.
function resolve(rest, states = ['idle']) {
  const restN = typeof rest === 'string' ? parse(rest) : rest;
  let fillN = restN;
  let hasFocus = false;
  for (const st of states) {
    if (st === 'focus') { hasFocus = true; continue; }
    fillN = clamp(restN + offsetFor(st, restN));
  }
  const out = { level: lvl(fillN), hex: hexOf(fillN) };
  if (hasFocus) out.ring = ring(fillN);
  return out;
}

module.exports = { resolve, POLICY };
