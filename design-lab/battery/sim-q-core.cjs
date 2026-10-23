// Simulation check of q-core (ui99-battery-v2). Run: node design-lab/battery/sim-q-core.cjs
// Loads the browser files as-is (core.js, q-core.js) so the simulation tests the shipped code.
const fs = require('fs');
const path = require('path');
const dir = __dirname;
function load(file, global) { const m = { exports: {} }; new Function('module', fs.readFileSync(path.join(dir, file), 'utf8'))(m); globalThis[global] = m.exports; }
load('core.js', 'BatteryCore');
load('q-core.js', 'QCore');
const BC = globalThis.BatteryCore, Q = globalThis.QCore;
const cands = []; for (let x = 0.05; x <= 3.0001; x += 0.01) cands.push({ x: +x.toFixed(3), key: x.toFixed(2) });
let seed = 12345; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const C = Math.pow(-Math.log(1 - 0.5 / (1 - BC.LAMBDA)), 1 / BC.BETA);
function run(trueX75, biasLeft) {
  const alpha = trueX75 / C;
  const b = Q.makeBlock(cands, { x: 2.5, key: 'catch' }, rnd);
  while (b.next()) {
    const s = b.next();
    if (s.kind === 'null') { b.answer(rnd() < biasLeft); continue; }
    const correct = rnd() < BC.pCorrect(s.x, alpha);
    b.answer(correct ? s.seamLeft : !s.seamLeft);
  }
  return Q.blockResult(b);
}
const N = Number(process.argv[2] || 100);
for (const t of [0.18, 0.27, 0.45]) {
  const rs = Array.from({ length: N }, () => run(t, 0.5));
  const xs = rs.map((r) => r.x75).sort((a, b) => a - b);
  const valid = rs.filter((r) => r.valid).length;
  console.log(`true x75 ${t}: median ${xs[N >> 1]} p10 ${xs[Math.floor(N * 0.1)]} p90 ${xs[Math.floor(N * 0.9)]} valid ${valid}/${N}`);
}
