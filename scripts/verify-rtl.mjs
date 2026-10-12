#!/usr/bin/env node
/**
 * LIMINAL — RTL, verified in a real browser.
 *
 * jsdom has no layout engine, so the unit tests can prove that the provider
 * sets `dir` and that the components emit logical properties. They cannot prove
 * that `margin-inline-start: auto` ends up on the right. That needs a browser,
 * and it is the half that a Persian reader actually sees.
 *
 * Run the dev server, then:  node scripts/verify-rtl.mjs
 */
// `puppeteer-core` is not a dependency of the library — it is a browser probe,
// not a test. It resolves from wherever it is installed; PUPPETEER_CORE lets a
// caller point at one.
const puppeteer = await import(process.env.PUPPETEER_CORE ?? 'puppeteer-core')
  .then((m) => m.default)
  .catch(async () => (await import('/root/workspace/tools/cdp/node_modules/puppeteer-core/lib/esm/puppeteer/puppeteer-core.js')).default);

const URL = process.env.URL ?? 'http://localhost:3000/';
const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? '  PASS' : '  FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome-stable',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 900 });
await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 2500));

// The app has its own device toggle; the fluid layout is the one under test.
await page.evaluate(() => {
  const t = [...document.querySelectorAll('*')].find((e) => (e.textContent || '').trim() === 'Fluid' && e.children.length === 0);
  if (t) (t.closest('button') || t.parentElement || t).click();
});
await new Promise((r) => setTimeout(r, 800));

// ── 1. a logical property resolves to the correct physical side ─────────────
await page.evaluate(() => {
  document.documentElement.setAttribute('dir', 'rtl');
  const probe = document.createElement('div');
  probe.id = 'rtl-probe';
  probe.style.cssText = 'display:flex;width:400px;height:20px;position:fixed;top:0;left:0';
  const inner = document.createElement('div');
  inner.id = 'rtl-probe-inner';
  inner.style.cssText = 'width:50px;height:20px;background:red;margin-inline-start:auto';
  probe.appendChild(inner);
  document.body.appendChild(probe);
});
const logical = await page.evaluate(() => {
  const probe = document.getElementById('rtl-probe').getBoundingClientRect();
  const inner = document.getElementById('rtl-probe-inner').getBoundingClientRect();
  return { gapLeft: Math.round(inner.left - probe.left), gapRight: Math.round(probe.right - inner.right) };
});
// `margin-inline-start: auto` is `margin-right: auto` in RTL, so it pushes the
// element AWAY from the start — to the left. Under LTR it is `margin-left: auto`
// and pushes to the right. The two must be mirror images, and that is the check.
check(
  'margin-inline-start: auto pushes away from the start under dir=rtl',
  logical.gapLeft === 0 && logical.gapRight > 0,
  `left gap ${logical.gapLeft}px, right gap ${logical.gapRight}px`,
);

// ── 2. the same property under ltr, to prove it is the direction moving it ──
await page.evaluate(() => document.documentElement.setAttribute('dir', 'ltr'));
const logicalLtr = await page.evaluate(() => {
  const probe = document.getElementById('rtl-probe').getBoundingClientRect();
  const inner = document.getElementById('rtl-probe-inner').getBoundingClientRect();
  return { gapLeft: Math.round(inner.left - probe.left), gapRight: Math.round(probe.right - inner.right) };
});
check(
  'and away from the start the other way under dir=ltr — a mirror, not a copy',
  logicalLtr.gapRight === 0 && logicalLtr.gapLeft > 0,
  `left gap ${logicalLtr.gapLeft}px, right gap ${logicalLtr.gapRight}px`,
);

// ── 3. a real component: the Toggle's knob travels the inline axis ──────────
await page.evaluate(() => {
  const t = [...document.querySelectorAll('*')].find((e) => (e.textContent || '').trim() === 'Atoms' && e.children.length === 0);
  if (t) (t.closest('button') || t.parentElement || t).click();
});
await new Promise((r) => setTimeout(r, 1500));
const knob = await page.evaluate(() => {
  const sw = document.querySelector('[role="switch"]');
  if (!sw) return null;
  const track = sw.getBoundingClientRect();
  const k = sw.querySelector('span').getBoundingClientRect();
  return { side: k.left - track.left < track.right - k.right ? 'start' : 'end', checked: sw.getAttribute('aria-checked') };
});
if (knob) {
  // Unchecked, the knob sits at the START of the track — left in LTR, right in RTL.
  const expected = knob.checked === 'true' ? 'end' : 'start';
  await page.evaluate(() => document.documentElement.setAttribute('dir', 'rtl'));
  const knobRtl = await page.evaluate(() => {
    const sw = document.querySelector('[role="switch"]');
    const track = sw.getBoundingClientRect();
    const k = sw.querySelector('span').getBoundingClientRect();
    return { side: k.left - track.left < track.right - k.right ? 'start' : 'end', checked: sw.getAttribute('aria-checked') };
  });
  const expectedRtl = knobRtl.checked === 'true' ? 'end' : 'start';
  check('the Toggle knob follows the inline axis', knobRtl.side === expectedRtl, `rtl knob at ${knobRtl.side}, expected ${expectedRtl}`);
} else {
  check('the Toggle knob follows the inline axis', false, 'no switch found on the page');
}

// ── 4. the Persian language rules apply under :lang(fa) ────────────────────
const persian = await page.evaluate(() => {
  const el = document.createElement('p');
  el.lang = 'fa';
  el.textContent = 'سلام دنیا';
  document.body.appendChild(el);
  const cs = getComputedStyle(el);
  const out = { lineHeight: cs.lineHeight, letterSpacing: cs.letterSpacing, fontFamily: cs.fontFamily.split(',')[0] };
  el.remove();
  return out;
});
check('a Persian element gets zero tracking (the script is connected)', persian.letterSpacing === 'normal' || parseFloat(persian.letterSpacing) === 0, `letter-spacing ${persian.letterSpacing}`);
check('a Persian element gets the font stack', /vazirmatn/i.test(persian.fontFamily), persian.fontFamily);

// ── 5. the document direction is restored ──────────────────────────────────
await page.evaluate(() => document.documentElement.setAttribute('dir', 'ltr'));

await browser.close();
const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
