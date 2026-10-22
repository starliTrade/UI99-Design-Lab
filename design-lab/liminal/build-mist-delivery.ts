/**
 * Roadmap 2.4 — the eye check page for the mist/shadow unification.
 *
 * Renders the four floating roles (menu, popover, modal, toast) on the work plane
 * using ONLY what the engine publishes: `mistCssVars` for the surface and the
 * `[data-liminal-mist]` stylesheet, which now reads the single floating-shadow
 * variable. The page prints that shadow string next to each sample, so the eye check
 * and the numbers are on the same page.
 *
 * Run: npx bun design-lab/liminal/build-mist-delivery.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE, LADDER } from '../../src/engine/liminal-ladder';
import { mistCssVars, FLOATING_MIST_ROLES, floatHeight } from '../../src/engine/liminal-mist';
import { floatingShadow, ROLE_LEVEL } from '../../src/engine/liminal-surface';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const mistCss = readFileSync(resolve(root, 'src/engine/liminal-mist.css'), 'utf8');

// The ladder as variables, exactly as the stylesheet publishes them: whole steps and
// half steps, the half step named `-5` (getLadderVar).
const ladderVars: string[] = [];
for (let n = 0; n < LADDER.length; n++) {
  ladderVars.push(`--liminal-s${n}: oklch(${(CANVAS_L + n * LADDER_STEP).toFixed(7)} ${LADDER_CHROMA} ${LADDER_HUE});`);
  if (n < LADDER.length - 1) {
    ladderVars.push(`--liminal-s${n}-5: oklch(${(CANVAS_L + (n + 0.5) * LADDER_STEP).toFixed(7)} ${LADDER_CHROMA} ${LADDER_HUE});`);
  }
}

const samples = FLOATING_MIST_ROLES.map((role) => {
  const vars = mistCssVars(role);
  const style = Object.entries(vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(' ');
  return `
  <div class="sample">
    <div class="surface" data-liminal-mist="${role === 'toast' ? 'toast' : ''}" style="${style}">
      <strong>${role}</strong><span>S${ROLE_LEVEL[role]} · ارتفاع ${floatHeight(role)}</span>
    </div>
    <code>${floatingShadow(role)}</code>
  </div>`;
}).join('\n');

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<title>مه — سایهٔ واحد · ۲.۴</title>
<style>
:root { ${ladderVars.join(' ')} }
html, body { margin: 0; background: var(--liminal-s0); color: #e9ecf2; font-family: system-ui, sans-serif; }
.stage { background: var(--liminal-s2); margin: 32px; padding: 48px; border-radius: 12px; }
.grid { display: grid; grid-template-columns: repeat(2, minmax(260px, 1fr)); gap: 48px; }
.sample { display: grid; gap: 14px; }
.surface { width: 100%; min-height: 150px; border-radius: 12px; padding: 20px; box-sizing: border-box;
  display: grid; align-content: space-between; }
.surface strong { font-size: 18px; }
.surface span { font-size: 13px; opacity: .7; }
code { font-size: 11px; color: #9aa3b2; word-break: break-all; direction: ltr; text-align: left; }
p { max-width: 70ch; color: #9aa3b2; font-size: 14px; line-height: 1.8; }
</style>
<style>
${mistCss}
</style>
</head>
<body>
<div class="stage">
  <h1 style="font-size:20px;margin:0 0 8px">مه و سایه — یک فرمول (۲.۴)</h1>
  <p>
    هر چهار سطح شناور از <code>floatingShadow</code> همان موتور سایه می‌گیرند، نه از چهار متغیر جدا.
    زیر هر نمونه، رشتهٔ سایهٔ دقیقی که مرورگر دریافت می‌کند چاپ شده است. مقدارها پیش از تغییر و بعد از آن
    در تست <code>mist.test.ts</code> و <code>mist-shadow-single.test.ts</code> با هم برابرند.
  </p>
  <div class="grid">
${samples}
  </div>
</div>
</body>
</html>
`;

const out = resolve(here, 'mist-unify-delivery.html');
writeFileSync(out, html, 'utf8');
console.log(`wrote ${out}`);
