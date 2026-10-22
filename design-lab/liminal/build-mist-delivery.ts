/**
 * Eye-check page — the floating surfaces, each on its ONE-STEP host (adjacency law).
 *
 * The chain is nested from the canvas up: S0 canvas → S1 chrome → S2 work → S3 panel →
 * S4 control → S5 menu → S6 popover → S7 modal → S8 toast. Each layer sits one step above
 * the one that contains it. The four floating layers (menu, popover, modal, toast) are
 * mist surfaces, and each one's shadow is solved for the host it actually falls on
 * (FLOAT_HOST), so what is seen here is what the engine publishes.
 *
 * Run: npx bun design-lab/liminal/build-mist-delivery.ts
 */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE, LADDER } from '../../src/engine/liminal-ladder';
import { mistCssVars, floatHeight } from '../../src/engine/liminal-mist';
import { floatingShadow, ROLE_LEVEL, FLOAT_HOST } from '../../src/engine/liminal-surface';
import type { SurfaceRole } from '../../src/engine/liminal-surface';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const mistCss = readFileSync(resolve(root, 'src/engine/liminal-mist.css'), 'utf8');

const ladderVars: string[] = [];
for (let n = 0; n < LADDER.length; n++) {
  ladderVars.push(`--liminal-s${n}: oklch(${(CANVAS_L + n * LADDER_STEP).toFixed(7)} ${LADDER_CHROMA} ${LADDER_HUE});`);
}

// The chain, bottom to top. Floats carry the mist; the rest are flat ladder layers.
const CHAIN: SurfaceRole[] = ['canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast'];
const FLOATS = new Set<SurfaceRole>(['menu', 'popover', 'modal', 'toast']);

function layer(role: SurfaceRole, inner: string): string {
  const level = ROLE_LEVEL[role];
  const isFloat = FLOATS.has(role);
  const host = isFloat ? (FLOAT_HOST as Record<string, SurfaceRole>)[role] : undefined;
  const style = isFloat
    ? Object.entries(mistCssVars(role)).map(([k, v]) => `${k}: ${v};`).join(' ')
    : `background: var(--liminal-s${level});`;
  const dataAttr = isFloat ? ' data-liminal-mist="' + (role === 'toast' ? 'toast' : '') + '"' : '';
  const note = role === 'canvas'
    ? 'بوم'
    : isFloat
      ? `${role} · S${level} · روی ${host} (S${ROLE_LEVEL[host!]}) · ${floatingShadow(role, host!)}`
      : `${role} · S${level}`;
  return `<div class="lay${isFloat ? ' float' : ''}"${dataAttr} style="${style}"><span class="lbl">${note}</span>${inner}</div>`;
}

// Build from the top (toast, innermost) outward to the canvas.
let nested = '';
for (let i = CHAIN.length - 1; i >= 0; i--) {
  nested = layer(CHAIN[i], nested);
}

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<title>شناورها روی میزبان یک‌پله‌ای · مه و سایه</title>
<style>
:root { ${ladderVars.join(' ')} }
html, body { margin: 0; background: var(--liminal-s0); color: #e9ecf2; font-family: system-ui, sans-serif; }
main { padding: 28px; max-width: 980px; margin: auto; }
h1 { font-size: 20px; margin: 0 0 8px; }
p { color: #9aa3b2; font-size: 14px; line-height: 1.8; max-width: 70ch; }
.lay { padding: 14px 14px 10px; border-radius: 12px; margin-top: 10px; }
.lay .lbl { display: block; font-size: 11px; color: #9aa3b2; direction: ltr; text-align: left; word-break: break-all; }
.lay.float { padding-bottom: 14px; }
</style>
<style>
${mistCss}
</style>
</head>
<body>
<main>
  <h1>شناورها روی میزبان یک‌پله‌ای</h1>
  <p>
    زنجیرهٔ کامل از بوم تا توست، هر لایه درون لایهٔ زیرش و فقط یک پله بالاتر از آن.
    منو روی کنترل (S4) می‌نشیند، پاپ‌اور روی منو، مودال روی پاپ‌اور، توست روی مودال.
    زیر هر شناور، رشتهٔ سایه‌ای که از موتور می‌آید و روی همان میزبان حل شده چاپ شده است.
  </p>
  ${nested}
</main>
</body>
</html>
`;

const out = resolve(here, 'mist-unify-delivery.html');
writeFileSync(out, html, 'utf8');
console.log(`wrote ${out}; float heights: ${[...FLOATS].map((r) => `${r}=${floatHeight(r)}`).join(' ')}`);
