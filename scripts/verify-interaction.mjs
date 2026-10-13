#!/usr/bin/env node
/**
 * LIMINAL — do the interactive states actually respond?
 *
 * The matrix page shows the static states; hover and focus are CSS and need a
 * browser. This drives one and reports, per component, whether the state
 * changes anything — and names the ones that do not.
 *
 * It is a probe, not a test suite: it answers "does the layer reach this
 * component", which is the question this session has already found four
 * components failing.
 *
 *   node scripts/verify-interaction.mjs
 */
const puppeteer = await import(process.env.PUPPETEER_CORE ?? 'puppeteer-core')
  .then((m) => m.default)
  .catch(async () => (await import('/root/workspace/tools/cdp/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')).default);

const URL = process.env.URL ?? 'file:///root/workspace/UI99-Design-Lab/design-lab/matrix.html';

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1320, height: 1200 });
await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
await new Promise((r) => setTimeout(r, 800));

const client = await page.target().createCDPSession();
await client.send('DOM.enable');
await client.send('CSS.enable');

/** Every interactive thing on the page, with the component it belongs to. */
const targets = await page.evaluate(() => {
  const out = [];
  for (const comp of document.querySelectorAll('.comp')) {
    const name = comp.querySelector('header b')?.textContent?.trim() ?? '?';
    // the default cell is the first one; that is the state to perturb
    const cell = comp.querySelector('.cell');
    if (!cell) continue;
    // The element that CARRIES the surface, not the control inside it. An
    // Input's surface is its wrapper, and probing the <input> measures the
    // wrong element — which is a mistake this session has already made once.
    const el =
      cell.querySelector('[data-liminal-surface]') ??
      cell.querySelector('[data-liminal-focus-within]') ??
      cell.querySelector('[data-liminal-focusable]') ??
      cell.querySelector('button, input, select, textarea, [role="switch"], [role="checkbox"], [role="radio"], [tabindex]');
    if (!el) continue;
    el.setAttribute('data-probe', `${name}`);
    out.push(name);
  }
  return out;
});

const results = [];
for (const name of targets) {
  const { root } = await client.send('DOM.getDocument');
  const { nodeId } = await client.send('DOM.querySelector', { nodeId: root.nodeId, selector: `[data-probe="${name}"]` });
  if (!nodeId) continue;

  const read = () =>
    page.evaluate((n) => {
      const el = document.querySelector(`[data-probe="${n}"]`);
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { bg: cs.backgroundColor, color: cs.color, border: cs.borderTopColor, outline: cs.outlineStyle, shadow: cs.boxShadow };
    }, name);

  const idle = await read();
  await client.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['hover'] });
  await new Promise((r) => setTimeout(r, 80));
  const hover = await read();
  await client.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: ['focus-visible'] });
  await new Promise((r) => setTimeout(r, 80));
  const focus = await read();
  await client.send('CSS.forcePseudoState', { nodeId, forcedPseudoClasses: [] });

  const changed = (a, b) => a && b && Object.keys(a).some((k) => a[k] !== b[k]);
  results.push({ name, hover: changed(idle, hover), focus: changed(idle, focus), idle });
}

console.log('\ncomponent              hover   focus');
console.log('─'.repeat(42));
for (const r of results) {
  console.log(`${r.name.padEnd(22)} ${r.hover ? '  ✓  ' : '  ✗  '}  ${r.focus ? '  ✓  ' : '  ✗  '}`);
}
const noHover = results.filter((r) => !r.hover);
const noFocus = results.filter((r) => !r.focus);
console.log('─'.repeat(42));
console.log(`${results.length} probed · ${results.length - noHover.length} respond to hover · ${results.length - noFocus.length} to focus`);
if (noHover.length) console.log(`\nno hover: ${noHover.map((r) => r.name).join(', ')}`);
if (noFocus.length) console.log(`no focus: ${noFocus.map((r) => r.name).join(', ')}`);

await browser.close();
process.exit(noHover.length || noFocus.length ? 1 : 0);
