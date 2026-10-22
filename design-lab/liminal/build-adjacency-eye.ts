/**
 * Eye check — the adjacency law, "each layer sits ONE step above its host".
 *
 * Renders the ladder in two honest ways, with nothing hand-tuned:
 *   1. NESTED: S0 contains S1 contains … S8, each one step above the one it sits in.
 *   2. STRIP:  each layer shown directly on the canvas, so the step to the page is visible.
 * Every block is labelled with its level and its distance from its host in q.
 *
 * Run: npx bun design-lab/liminal/build-adjacency-eye.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE, LADDER, PERCEPTUAL_QUANTUM } from '../../src/engine/liminal-ladder';

const here = dirname(fileURLToPath(import.meta.url));
const q = PERCEPTUAL_QUANTUM;
const Q = (x: number) => (x / q).toFixed(2);

const ladderVars: string[] = [];
for (let n = 0; n < LADDER.length; n++) {
  ladderVars.push(`--liminal-s${n}: oklch(${(CANVAS_L + n * LADDER_STEP).toFixed(7)} ${LADDER_CHROMA} ${LADDER_HUE});`);
}

// Nested: S8 is innermost, so build from the inside out.
let nested = '';
for (let n = LADDER.length - 1; n >= 0; n--) {
  const label = `<span class="lbl">S${n} · ${n === 0 ? 'بوم' : `${Q(LADDER_STEP)}q از S${n - 1}`}</span>`;
  nested = `<div class="lay" style="background: var(--liminal-s${n})">${label}${nested}</div>`;
}

// Strip: each layer on the canvas, with its distance to the canvas.
const strip = Array.from({ length: LADDER.length }, (_, n) => `
  <div class="cell">
    <div class="chip" style="background: var(--liminal-s${n})"></div>
    <span>S${n}</span>
    <small>${Q(n * LADDER_STEP)}q از بوم</small>
  </div>`).join('');

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<title>بررسی چشمی · قانون مجاورت</title>
<style>
:root { ${ladderVars.join(' ')} }
html, body { margin: 0; background: var(--liminal-s0); color: #e9ecf2; font-family: system-ui, sans-serif; }
main { padding: 32px; max-width: 980px; margin: auto; }
h1 { font-size: 20px; margin: 0 0 8px; }
p { color: #9aa3b2; font-size: 14px; line-height: 1.8; max-width: 70ch; }
.lay { padding: 14px 14px 14px 14px; border-radius: 10px; }
.lay .lbl { font-size: 12px; color: #9aa3b2; }
.strip { display: grid; grid-template-columns: repeat(9, 1fr); gap: 10px; margin-top: 32px; }
.cell { display: grid; gap: 6px; justify-items: center; font-size: 12px; color: #9aa3b2; }
.chip { width: 100%; height: 70px; border-radius: 8px; border: 1px solid rgba(255,255,255,.04); }
</style>
</head>
<body>
<main>
  <h1>بررسی چشمی · هر لایه فقط یک پله بالاتر از زیرش</h1>
  <p>
    بالا: همهٔ نه لایه تو در تو، هر کدام یک پله بالاتر از لایهٔ میزبانش.
    پایین: هر لایه روی بوم، با فاصلهٔ کل آن از بوم بر حسب q.
    یک پله = ${Q(LADDER_STEP)}q. بگویید کدام فاصله‌ها را بیش از حد یا کم‌تر از حد ادراک می‌بینید.
  </p>
  ${nested}
  <div class="strip">${strip}</div>
</main>
</body>
</html>
`;

const out = resolve(here, 'adjacency-eye.html');
writeFileSync(out, html, 'utf8');
console.log(`wrote ${out}`);
