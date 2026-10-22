/**
 * Static eye-check page for the border decision, for GitHub Pages.
 *
 * Renders the SAME `Live` component the Vite page uses (src/site/border-live.tsx) to
 * plain HTML, and inlines the ladder variables it reads. The output needs no JavaScript
 * and no build step, so it opens straight from the repository.
 *
 * Run: npx bun design-lab/liminal/build-border-live-static.tsx
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import { CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE, LADDER } from '../../src/engine/liminal-ladder';
import { Live } from '../../src/site/border-live';

const here = dirname(fileURLToPath(import.meta.url));

const vars: string[] = [];
for (let n = 0; n < LADDER.length; n++) {
  vars.push(`--liminal-s${n}: oklch(${(CANVAS_L + n * LADDER_STEP).toFixed(7)} ${LADDER_CHROMA} ${LADDER_HUE});`);
  if (n < LADDER.length - 1) {
    vars.push(`--liminal-s${n}-5: oklch(${(CANVAS_L + (n + 0.5) * LADDER_STEP).toFixed(7)} ${LADDER_CHROMA} ${LADDER_HUE});`);
  }
}

const body = renderToStaticMarkup(<Live />);

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>مرز یا جداکننده — بررسی چشمی</title>
<style>
:root { ${vars.join(' ')} }
body { margin: 0; }
</style>
</head>
<body>
<div id="root">${body}</div>
</body>
</html>
`;

const out = resolve(here, 'border-live.html');
writeFileSync(out, html, 'utf8');
console.log(`wrote ${out} (${html.length} bytes)`);
