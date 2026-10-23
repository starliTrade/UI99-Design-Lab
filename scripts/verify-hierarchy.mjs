#!/usr/bin/env node
/**
 * LIMINAL — does the rendered page SKIP a level?
 *
 * The engine's rule: a structural role defines the hierarchy rather than sitting
 * inside it, and a `panel` is a surface NESTED inside the work surface. So a
 * panel belongs on work, not on the canvas.
 *
 * The engine cannot enforce that — it does not know what hosts an element. But
 * the RENDERED PAGE does: every element with a surface has an ancestor with a
 * surface, and the difference between their levels is the relationship.
 *
 * Measured on the docs before this probe existed: a panel sat 3.56q above the
 * canvas and the work plane was never built. The panel was at the right level
 * and in the wrong place — nothing hosted it.
 *
 *   node scripts/verify-hierarchy.mjs [url]
 */
import { readFileSync } from 'node:fs';
const puppeteer = await import(process.env.PUPPETEER_CORE ?? 'puppeteer-core')
  .then((m) => m.default)
  .catch(async () => (await import('/root/workspace/tools/cdp/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js')).default);

// RATCHET (like verify-component-standard): the number of skipped levels may fall, never rise.
// A gate at zero would fail on day one — the docs app skips levels today — and a red gate gets turned off.
const RATCHET = process.argv.includes('--ratchet');
const positional = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const TARGET = positional[0] ?? 'http://localhost:3000/';
const BASELINE = JSON.parse(readFileSync(new URL('./verify-hierarchy.baseline.json', import.meta.url), 'utf8'));

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome-stable',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100 });
await page.goto(TARGET, { waitUntil: 'load', timeout: 60000 });
await new Promise((r) => setTimeout(r, 2000));

const report = await page.evaluate(() => {
  const LADDER = ['#060709', '#07090b', '#090b0d', '#0b0d0f', '#0d0f12', '#0f1114', '#111316', '#131518', '#15171a'];
  const HALF = ['#07080a', '#080a0c', '#0a0c0e', '#0c0e10', '#0e1013', '#101215', '#121417', '#141619'];
  const hex = (v) => {
    const m = String(v).match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return m ? '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('') : null;
  };
  /**
   * The ladder level of an element's own fill, or null if it has none.
   *
   * The engine draws most surfaces as a rim GRADIENT, so `backgroundColor` is
   * transparent and the fill lives in the first layer of `background-image`.
   * Reading only `backgroundColor` reported zero surfaces on a page full of
   * them — a probe that finds nothing is not a passing probe.
   */
  const levelOf = (el) => {
    const cs = getComputedStyle(el);
    const bg = cs.backgroundImage !== 'none' ? cs.backgroundImage : cs.backgroundColor;
    const h = hex(bg);
    if (!h) return null;
    const i = LADDER.indexOf(h);
    if (i >= 0) return i;
    const j = HALF.indexOf(h);
    return j >= 0 ? j + 0.5 : null;
  };
  const rows = [];
  // A SURFACE is a region, not a colour chip. The theme bar draws nine ladder
  // swatches, and counting them reported four surfaces "below their host" that
  // were 9x22px rectangles — a probe's false positives are how a probe gets
  // ignored. Size is the honest discriminator: a surface is something you can
  // put a component on.
  const all = [...document.querySelectorAll('*')].filter((el) => {
    const r = el.getBoundingClientRect();
    return r.width >= 40 && r.height >= 40;
  });
  for (const el of all) {
    const own = levelOf(el);
    if (own === null) continue;
    let host = null;
    for (let p = el.parentElement; p; p = p.parentElement) {
      const r = p.getBoundingClientRect();
      if (r.width < 40 || r.height < 40) continue;
      const l = levelOf(p);
      if (l !== null) { host = { el: p, level: l }; break; }
    }
    if (!host) continue;
    const gap = own - host.level;
    rows.push({
      own,
      host: host.level,
      gap,
      tag: el.tagName,
      cls: String(el.className).slice(0, 22),
      hostCls: String(host.el.className).slice(0, 22),
    });
  }
  return rows;
});

// Roadmap 1.3: an exempt placement (PLACEMENT_EXEMPTIONS, e.g. control on toast) is
// counted and named, never hidden. It is reported, not failed: the exemption is a decision.
const exempt = await page.evaluate(() =>
  [...document.querySelectorAll('[data-exempt]')].map((el) => el.getAttribute('data-exempt')),
);
console.log(`exempt placements (data-exempt): ${exempt.length}${exempt.length ? ' — ' + [...new Set(exempt)].join(', ') : ''}`);

const skipped = report.filter((r) => r.gap > 1.5);
const below = report.filter((r) => r.gap < -0.5);
console.log(`surfaces with a host: ${report.length}`);
console.log(`skipped a level (gap > 1.5): ${skipped.length}`);
for (const s of skipped.slice(0, 8)) console.log(`   S${s.host} → S${s.own}  (${s.gap.toFixed(2)})  <${s.tag} class="${s.cls}"> on <${s.hostCls}>`);
console.log(`sits BELOW its host (gap < -0.5): ${below.length}`);
for (const s of below.slice(0, 5)) console.log(`   S${s.host} → S${s.own}  (${s.gap.toFixed(2)})  <${s.tag} class="${s.cls}">`);

await browser.close();
if (RATCHET) {
  const ok = skipped.length <= BASELINE.skipped;
  console.log(`ratchet: skipped ${skipped.length} · baseline ${BASELINE.skipped} · ${ok ? 'ok' : 'REGRESSED'}`);
  process.exit(ok ? 0 : 1);
}
process.exit(skipped.length === 0 ? 0 : 1);
