/**
 * Eye check — border (edge, one step) vs separator (half step), same layout.
 *
 * Every colour is read from the engine: the surface from ROLE_LEVEL, the border from
 * resolveBorderLevel(kind). Nothing is typed by hand, so the page cannot disagree with
 * the policy it is meant to test.
 *
 * Run: npx bun design-lab/liminal/build-border-compare.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE, LADDER, PERCEPTUAL_QUANTUM } from '../../src/engine/liminal-ladder';
import { ROLE_LEVEL, resolveBorderLevel } from '../../src/engine/liminal-surface';
import type { SurfaceRole } from '../../src/engine/liminal-surface';

const here = dirname(fileURLToPath(import.meta.url));
const q = PERCEPTUAL_QUANTUM;

const ladderVars: string[] = [];
for (let n = 0; n < LADDER.length; n++) {
  ladderVars.push(`--liminal-s${n}: oklch(${(CANVAS_L + n * LADDER_STEP).toFixed(7)} ${LADDER_CHROMA} ${LADDER_HUE});`);
  if (n < LADDER.length - 1) {
    ladderVars.push(`--liminal-s${n}-5: oklch(${(CANVAS_L + (n + 0.5) * LADDER_STEP).toFixed(7)} ${LADDER_CHROMA} ${LADDER_HUE});`);
  }
}

/** A level as the variable the stylesheet publishes (whole or half step). */
const lvar = (level: number) => {
  const whole = Math.floor(level);
  return level - whole === 0.5 ? `var(--liminal-s${whole}-5)` : `var(--liminal-s${whole})`;
};

const ROLES: SurfaceRole[] = ['work', 'panel', 'control', 'menu', 'popover', 'modal'];

function sample(role: SurfaceRole, kind: 'edge' | 'separator'): string {
  const surface = ROLE_LEVEL[role];
  const border = resolveBorderLevel({ role, kind });
  const gap = Math.abs(border - surface) * LADDER_STEP / q;
  return `
  <div class="card" style="background: ${lvar(surface)}; border: 1px solid ${lvar(border)};">
    <strong>${role}</strong>
    <span>${kind === 'edge' ? 'مرز' : 'جداکننده'} · S${surface} → S${border} · ${gap.toFixed(2)}q</span>
  </div>`;
}

const rows = ROLES.map((role) => `
  <div class="pair">
    ${sample(role, 'edge')}
    ${sample(role, 'separator')}
  </div>`).join('');

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<title>مقایسه · مرز در برابر جداکننده</title>
<style>
:root { ${ladderVars.join(' ')} }
html, body { margin: 0; background: var(--liminal-s0); color: #e9ecf2; font-family: system-ui, sans-serif; }
main { padding: 32px; max-width: 920px; margin: auto; }
h1 { font-size: 20px; margin: 0 0 8px; }
p { color: #9aa3b2; font-size: 14px; line-height: 1.8; max-width: 70ch; }
.head { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; font-size: 13px; color: #9aa3b2; margin: 24px 0 8px; }
.pair { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; direction: ltr; }
.head { direction: ltr; }
.card { border-radius: 12px; padding: 22px; display: grid; gap: 8px; min-height: 92px; box-sizing: border-box; }
.card strong { font-size: 16px; }
.card span { font-size: 12px; color: #9aa3b2; }
</style>
</head>
<body>
<main>
  <h1>مقایسه · مرز (یک پله) در برابر جداکننده (نیم پله)</h1>
  <p>
    ستون راست یک نیم‌پله نرم‌تر است. هر دو از نردبان موتور می‌آیند؛ هیچ رنگ دستی نیست.
    کف ادراکی جداکننده نزدیک آستانهٔ لبه است. نرم‌تر از آن خط دیده نمی‌شود.
  </p>
  <div class="head"><div>مرز — ستون چپ</div><div>جداکننده — ستون راست</div></div>
  ${rows}
</main>
</body>
</html>
`;

const out = resolve(here, 'border-compare.html');
writeFileSync(out, html, 'utf8');
console.log(`wrote ${out}`);
