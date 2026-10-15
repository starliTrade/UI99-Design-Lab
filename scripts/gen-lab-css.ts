/**
 * THE LAB'S OWN STYLESHEET — GENERATED FROM THE ENGINE.
 *
 * The design-lab pages hard-coded the ladder in their own `:root`. That is the
 * defect this project keeps naming: a page that carries a copy of the system
 * drifts from it, and the reader ends up judging the copy. A test page for the
 * border must draw the ENGINE'S border, or it is asking about something else —
 * which is exactly what happened, twice, in one evening.
 *
 * So the tokens are written out from the engine, and the pages read
 * `var(--liminal-s3)` the way a component does. If the ladder moves, the lab
 * moves with it, and a page cannot disagree with the thing it is testing.
 *
 *   bun scripts/gen-lab-css.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LADDER, WELLS, PERCEPTUAL_QUANTUM, LADDER_EXACT, HALF_EXACT, CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE } from '../src/engine/liminal-ladder';
import { ROLE_LEVEL, ROLE_RIM, ROLE_SHADOW, FLOAT_SHADOWS, FLOATING_ROLES, resolveBorderHex } from '../src/engine/liminal-surface';
import { floatShadow } from '../src/engine/liminal-shadow';
import { LiminalMotionEngine as M } from '../src/engine/liminal-motion-engine';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';
import { oklchLightness } from '../src/engine/liminal-color-math';

const lines: string[] = [];
const w = (s = '') => lines.push(s);

w('/**');
w(' * LIMINAL · THE LAB TOKENS — GENERATED, DO NOT EDIT.');
w(' *');
w(' * Written by `scripts/gen-lab-css.ts` from the engine itself, so a test page');
w(' * cannot draw a copy of the system while claiming to test it.');
w(' */');
w(':root {');

w('  /* ── the ladder, and its half-steps ─────────────────────────────── */');
// THE SAME PAIR THE APP PUBLISHES: the quantised hex, then the design. A lab
// page that read only the hex would be testing the display's rounding rather
// than the system — which is the mistake this whole file exists to prevent.
LADDER.forEach((hex, n) => {
  // `-hex` is the quantised rendering, kept SEPARATE so a comparison page can put
  // the two side by side. `--liminal-sN` is the design, which is what a component
  // should read.
  w(`  --liminal-s${n}-hex: ${hex}; /* L ${oklchLightness(hex).toFixed(4)} — the quantised rendering */`);
  w(`  --liminal-s${n}: ${LADDER_EXACT[n]}; /* the design */`);
});
LADDER.slice(0, -1).forEach((hex, n) => {
  const a = oklchLightness(hex), b = oklchLightness(LADDER[n + 1]);
  const mid = a + (b - a) / 2;
  // The half-step is the value the engine's own border resolver lands on, so it
  // is read from there rather than recomputed here.
  void mid;
  w(`  --liminal-s${n}-5: ${resolveBorderHex({ role: (['canvas','chrome','work','panel','control','menu','popover','modal'][n] as never), kind: 'separator' })}; /* the hairline above S${n} */`);
  w(`  --liminal-s${n}-5: ${HALF_EXACT[n]}; /* exact */`);
});

w('');
w('  /* ── below the canvas ───────────────────────────────────────────── */');
Object.entries(WELLS).forEach(([name, hex]) => w(`  --liminal-well-${name}: ${hex};`));

w('');
w('  /* ── the roles: level, rim tier, shadow ─────────────────────────── */');
(Object.keys(ROLE_LEVEL) as (keyof typeof ROLE_LEVEL)[]).forEach((role) => {
  w(`  --liminal-role-${role}-level: ${ROLE_LEVEL[role]};`);
  w(`  --liminal-role-${role}-rim: ${ROLE_RIM[role]};`);
  w(`  --liminal-role-${role}-shadow: ${ROLE_SHADOW[role] === null ? 'none' : ROLE_SHADOW[role]};`);
  w(`  --liminal-role-${role}-border: ${resolveBorderHex({ role, kind: 'separator' })};`);
});

w('');
w('  /* ── the floating shadows, named by role ────────────────────────── */');
FLOATING_ROLES.forEach((role) => w(`  --liminal-shadow-${role}: ${FLOAT_SHADOWS[role]};`));
// And the model at every height a settled surface can sit at, so a test page can
// ask for the shadow of a surface one step above the canvas.
for (let h = 1; h <= 4; h++) w(`  --liminal-shadow-surface-${['one','two','three','four'][h - 1]}: ${floatShadow(h)};`);

w('');
w('  /* ── motion, and the duration a floating surface derives ─────────── */');
Object.entries(M.DURATION).forEach(([k, v]) => w(`  --liminal-duration-${k}: ${v}ms;`));
Object.entries(M.EASING).forEach(([k, v]) => w(`  --liminal-ease-${k}: ${v};`));
FLOATING_ROLES.forEach((role) => w(`  --liminal-float-enter-${role}: ${M.floatEnter(role)};`));

w('');
w('  /* ── the measured constants ─────────────────────────────────────── */');
w(`  --liminal-q: ${PERCEPTUAL_QUANTUM};`);
// The two numbers a page needs to compute an offset that is NOT on the ladder
// grid — a border at a quarter step, say. The ladder is exact now, so any offset
// is writable, and a test page has to be able to reach it.
w(`  --liminal-canvas-l: ${CANVAS_L};`);
w(`  --liminal-step: ${LADDER_STEP};`);
w(`  --liminal-chroma: ${LADDER_CHROMA};`);
w(`  --liminal-hue: ${LADDER_HUE};`);
w(`  --liminal-edge: 0.0040; /* the edge threshold, measured on the display */`);
w(`  --liminal-nest-min: ${L.SPACING[1] / 8}; /* 0.5 ladder steps */`);
w('}');

const dest = resolve(process.cwd(), 'design-lab/liminal.css');
writeFileSync(dest, lines.join('\n') + '\n');
console.log(`wrote ${dest} — ${lines.length} lines, ${LADDER.length} steps and ${LADDER.length - 1} half-steps`);
