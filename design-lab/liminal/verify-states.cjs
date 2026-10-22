// Computed (not visual) checks for the states policy. Run: node design-lab/liminal/verify-states.cjs
'use strict';
const { resolve, POLICY } = require('./resolve.cjs');
const lin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const lum = h => { const [r, g, b] = rgb(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const Lok = h => POLICY.ladder[Object.keys(POLICY.ladder).find(k => POLICY.ladder[k].hex === h)].L;
const CANVAS = POLICY.base.canvas;
const rests = ['S0','S1','S2','S3','S4','S5','S6','S7','S8'];
const out = [];
let minAdj = Infinity;
// 1) adjacent rung contrast (ladder steps)
const ladder = Object.keys(POLICY.ladder).map(k => POLICY.ladder[k].hex);
for (let i = 0; i < 8; i++) { const r = ratio(ladder[i], ladder[i + 1]); minAdj = Math.min(minAdj, r); out.push(['rung', `S${i}→S${i+1}`, r.toFixed(4)]); }
// 2) state fills vs canvas (min contrast of each state across rests)
for (const st of ['hover','active','disabled']) {
  let lo = Infinity, hi = 0;
  for (const rest of rests) { const f = resolve(rest, [st]).hex; const r = ratio(f, CANVAS); lo = Math.min(lo, r); hi = Math.max(hi, r); }
  out.push(['state-vs-canvas', st, `${lo.toFixed(3)}..${hi.toFixed(3)}`]);
}
// 3) focus ring: inner line vs gap (canvas), outer line vs gap, per rest
let ringMin = Infinity;
for (const rest of rests) {
  const r = resolve(rest, ['focus']).ring;
  const a = ratio(r.inner.hex, CANVAS), b = ratio(r.outer.hex, CANVAS);
  ringMin = Math.min(ringMin, a, b);
}
out.push(['ring line vs canvas (min over rests)', '', ringMin.toFixed(4)]);
// 4) edge rows: S0 active clamp and S8 hover ceiling
out.push(['edge S0 active', resolve('S0',['active']).level, 'clamped (no state change visible vs rest)']);
out.push(['edge S8 hover', resolve('S8',['hover']).level, 'flips to -1 (visible, one rung)']);
for (const [a, b, c] of out) console.log(a.padEnd(38), String(b).padEnd(14), c);
console.log('min adjacent rung contrast (WCAG ratio):', minAdj.toFixed(4));
