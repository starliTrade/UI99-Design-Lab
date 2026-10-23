/**
 * ۲.۳ — جدول سایه برای هر میزبان (one-step adjacency).
 * Every row: a host level n and the float that sits ONE step above it (n+1).
 * Values come from the engine (shadowModel + ladderRgb), not from hand-typed numbers.
 * Run: npx bun design-lab/liminal/build-shadow-table.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shadowModel, shadowPeakAlpha, SHADOW_REACH_STEPS } from '../../src/engine/liminal-shadow';
import { ladderRgb, ROLE_LEVEL } from '../../src/engine/liminal-surface';

const here = dirname(fileURLToPath(import.meta.url));
const NAMES = ['canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast'];
const rows: string[] = [];
const data: Array<Record<string, string | number>> = [];
for (let n = 0; n <= 7; n++) {
  const h = n + 1; // the float one step above the host
  const m = shadowModel(h, ladderRgb(n));
  const row = {
    host: `S${n}`,
    float: `S${h}`,
    reach: h - SHADOW_REACH_STEPS,
    near: m.near.toFixed(1),
    far: m.far.toFixed(0),
    alpha: m.nearAlpha.toFixed(4),
    peak: shadowPeakAlpha(ladderRgb(n)).toFixed(4),
  };
  data.push(row);
  rows.push(`<tr><td>${row.host} · ${NAMES[n]}</td><td>${row.float} · ${NAMES[n + 1]}</td><td>${row.near}px</td><td>${row.far}px</td><td>${row.alpha}</td><td>${row.peak}</td></tr>`);
}
const html = `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>جدول سایه — هر میزبان یک‌پله</title>
<style>body{background:#0b0c0e;color:#e9ecf2;font-family:system-ui,sans-serif;margin:0;padding:28px}
table{border-collapse:collapse;font-size:14px;direction:ltr}td,th{border-bottom:1px solid #1f2227;padding:8px 12px;text-align:left}
h1{font-size:20px}p{color:#9aa3b2;font-size:14px;max-width:70ch;line-height:1.8}</style></head>
<body><h1>جدول سایه — هر شناور روی میزبان یک‌پله‌ای</h1>
<p>هر ردیف: یک میزبان و شناوری که دقیقاً یک پله بالاتر از آن است. شعاع با ارتفاع (منهای ${SHADOW_REACH_STEPS} پله) رشد می‌کند؛ اوج سایه همیشه یک کوانتوم زیر میزبان است.</p>
<table><thead><tr><th>میزبان</th><th>شناور</th><th>near</th><th>far</th><th>آلفای هر لایه</th><th>اوج ترکیبی</th></tr></thead><tbody>
${rows.join('\n')}
</tbody></table></body></html>`;
writeFileSync(resolve(here, 'shadow-table.html'), html, 'utf8');
console.log(JSON.stringify(data));
