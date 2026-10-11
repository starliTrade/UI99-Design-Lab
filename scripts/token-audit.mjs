import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const DEFINERS = new Set([
  'src/engine/spec-engine.ts','src/engine/liminal-color-engine.ts',
  'src/engine/liminal-layout-engine.ts','src/engine/liminal-motion-engine.ts',
  'src/engine/liminal-color-math.ts','src/engine/liminal-ladder.ts',
  'src/engine/liminal-contract.ts','src/index.css',
]);

const files = execSync(
  "find src -name '*.ts' -o -name '*.tsx' | grep -v __tests__ | sort",
  { encoding: 'utf8' }).trim().split('\n');

/**
 * Strip comments so only real code is measured.
 * Handles: full-line // and /* *​/, trailing //, and JSX {/* ... *​/} comments.
 */
function stripComment(line) {
  let out = line.replace(/\{\/\*.*?\*\/\}/g, '');   // JSX comment
  const trimmed = out.trim();
  if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return '';
  const idx = out.indexOf('//');
  if (idx !== -1 && out[idx - 1] !== ':') out = out.slice(0, idx);
  return out;
}

const hex = new Map(), rgba = new Map(), dur = new Map(), bez = new Map();
let commentOnly = 0;

for (const file of files) {
  if (DEFINERS.has(file)) continue;
  const isDemo = /Demo\.tsx$|KitShowcase\.tsx$/.test(file);
  readFileSync(file, 'utf8').split('\n').forEach((raw, i) => {
    const t = raw.trim();
    if (t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')) { commentOnly++; return; }
    const code = stripComment(raw);
    const where = `${isDemo ? 'DEMO ' : ''}${file.replace('src/components/','').replace('src/','')}:${i+1}`;
    const bump = (map, key) => { if (!map.has(key)) map.set(key, []); map.get(key).push(where); };
    (code.match(/#[0-9a-fA-F]{6}\b/g) || []).forEach((m) => bump(hex, m.toUpperCase()));
    (code.match(/rgba?\([^)]*\)/g) || []).forEach((m) => bump(rgba, m.replace(/\s+/g,'')));
    (code.match(/\b\d+ms\b/g) || []).forEach((m) => bump(dur, m));
    (code.match(/cubic-bezier\([^)]*\)/g) || []).forEach((m) => bump(bez, m.replace(/\s+/g,'')));
  });
}

const report = (title, map, limit) => {
  const entries = [...map.entries()].sort((a,b)=>b[1].length-a[1].length);
  const total = entries.reduce((a,[,v])=>a+v.length,0);
  const real = entries.filter(([,v])=>!v.every(w=>w.startsWith('DEMO')));
  const realTotal = real.reduce((a,[,v])=>a+v.length,0);
  console.log('');
  console.log(`── ${title}`);
  console.log(`   distinct: ${map.size}   occurrences: ${total}   (excluding demo files: ${realTotal})`);
  entries.slice(0, limit).forEach(([val, locs]) => {
    const demo = locs.every(w=>w.startsWith('DEMO'));
    const files = [...new Set(locs.map(w=>w.replace('DEMO ','').split(':')[0]))];
    console.log(`   ${String(locs.length).padStart(3)}×  ${val.padEnd(32)}${demo?' [demo]':''}  ${files.slice(0,2).join(', ')}${files.length>2?` +${files.length-2}`:''}`);
  });
};

report('HARDCODED HEX (code only, comments excluded)', hex, 20);
report('HARDCODED rgba() (code only)', rgba, 20);
report('HARDCODED DURATIONS (code only)', dur, 12);
report('HARDCODED EASINGS (code only)', bez, 12);
console.log('');
console.log(`(comment-only lines skipped: ${commentOnly})`);
