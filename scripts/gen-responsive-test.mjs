#!/usr/bin/env node
/**
 * LIMINAL — Step 2.2 live comparison
 *
 * Generates design-lab/responsive-test.html: a self-contained page that shows,
 * side by side and at real viewport widths, what each responsive-type option
 * would actually do to the eight-level LIMINAL type scale.
 *
 * No network, no build step. Open the file directly.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/responsive-test.html');

// ── The locked scale, read from the engine's spec (ratio 1.2, base 16) ──────
const RATIO = 1.2;
const LEVELS = [1, 2, 3, 4, 5, 6, 7, 8];
const LEVEL_META = {
  1: { lh: 1.45, ls: '+0.04em', weight: 400, role: 'meta · quaternary' },
  2: { lh: 1.50, ls: '+0.01em', weight: 500, role: 'label · tertiary' },
  3: { lh: 1.60, ls: '0',       weight: 400, role: 'body · secondary' },
  4: { lh: 1.35, ls: '-0.005em', weight: 600, role: 'lead · h4' },
  5: { lh: 1.25, ls: '-0.01em', weight: 600, role: 'h3' },
  6: { lh: 1.20, ls: '-0.015em', weight: 600, role: 'h2' },
  7: { lh: 1.15, ls: '-0.02em', weight: 600, role: 'h1' },
  8: { lh: 1.10, ls: '-0.025em', weight: 700, role: 'display' },
};

// level 3 is the base; every other level is base × ratio^(n-3)
const sizeAt = (base, n) => base * Math.pow(RATIO, n - 3);

// ── The three options under test ────────────────────────────────────────────
// fluid(vwLo, baseLo, vwHi, baseHi) → a clamp() string in real px/vw units
function fluid(vwLo, baseLo, vwHi, baseHi) {
  const slope = (baseHi - baseLo) / (vwHi - vwLo); // px per px of viewport
  const intercept = baseLo - slope * vwLo;
  return {
    css: `clamp(${baseLo}px, ${(slope * 100).toFixed(4)}vw + ${intercept.toFixed(4)}px, ${baseHi}px)`,
    at: (vw) => Math.min(baseHi, Math.max(baseLo, slope * vw + intercept)),
  };
}

const OPTIONS = [
  {
    id: 'b',
    label: 'ب — مقیاس ثابت',
    tag: 'امروز',
    blurb: 'پایه همیشه ۱۶px. هیچ‌چیز بصری عوض نمی‌شود. موبایل هدینگ ۴۰px را نگه می‌دارد.',
    base: { css: '16px', at: () => 16 },
    accent: '#8A8F98',
  },
  {
    id: 'a',
    label: 'الف — شناور ملایم',
    tag: 'پیشنهاد من',
    blurb: 'پایه از ۱۴px (۳۲۰px) تا ۱۶.۵px (۱۴۴۰px). نسبت ۱.۲ ثابت. نمایشگر بزرگ کمی بزرگ‌تر، موبایل کمی جمع‌تر.',
    base: fluid(320, 14, 1440, 16.5),
    accent: '#7FB4FF',
  },
  {
    id: 'j',
    label: 'ج — شناور باز',
    tag: 'آزمایشی',
    blurb: 'پایه از ۱۳.۵px تا ۱۸px. دامنه‌ی حرکت دو برابر الف — برای دیدن محور، نه برای انتخاب.',
    base: fluid(320, 13.5, 1440, 18),
    accent: '#E0A458',
  },
];

const WIDTHS = [320, 768, 1440];
const WIDTH_LABEL = { 320: '۳۲۰px — موبایل (کف WCAG 1.4.10)', 768: '۷۶۸px — تبلت', 1440: '۱۴۴۰px — دسکتاپ' };

// ── Sample copy ─────────────────────────────────────────────────────────────
const SAMPLE = {
  1: 'آخرین بروزرسانی · ۲ دقیقه پیش',
  2: 'برچسب فیلد',
  3: 'پوسته از نردبان سطوح ساخته می‌شود، نه از رنگ‌های دستی. هر سطح یک پله است.',
  4: 'لایه‌ی تعامل روی CSS',
  5: 'موتور کنتراست',
  6: 'نردبان ادراکی',
  7: 'طراحی با فرمول',
  8: 'لیمینال',
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const px = (n) => (Math.round(n * 100) / 100).toFixed(2);
const fa = (s) => String(s).replace(/[0-9]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);

function typeBlock(base, { showMeta = true } = {}) {
  return LEVELS.map((n) => {
    const m = LEVEL_META[n];
    const size = sizeAt(base, n);
    return `
      <div class="row">
        <div class="meta">
          <span class="lvl">L${n}</span>
          <span class="sz">${px(size)}px</span>
          <span class="role">${m.role}</span>
        </div>
        <div class="sample" style="
          font-size:${px(size)}px;
          line-height:${m.lh};
          letter-spacing:${m.ls};
          font-weight:${m.weight};
        ">${SAMPLE[n]}</div>
      </div>`;
  }).join('');
}

// ── The iframe body: real vw units, so the clamp() behaves for real ─────────
function frameDoc(opt) {
  const vars = LEVELS.map((n) => `--fs-${n}: calc(var(--base) * ${Math.pow(RATIO, n - 3).toFixed(6)});`).join('\n      ');
  return `<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8">
<style>
  :root {
    --base: ${opt.base.css};
    ${vars}
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 16px;
    background: #0B0C0E; color: #E9ECF2;
    font-family: -apple-system, "Segoe UI", Tahoma, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .row { padding: 7px 0; border-bottom: 1px solid rgba(233,236,242,0.055); }
  .row:last-child { border-bottom: 0; }
  .hdr {
    font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
    color: rgba(233,236,242,0.38); margin-bottom: 10px;
    font-family: ui-monospace, monospace;
  }
  .hdr b { color: ${opt.accent}; font-weight: 600; }
  .tag {
    display: inline-block; font-size: 9px; padding: 1px 5px; border-radius: 4px;
    background: rgba(233,236,242,0.07); color: rgba(233,236,242,0.5);
    margin-inline-start: 6px; font-family: ui-monospace, monospace;
  }
${LEVELS.map((n) => `  .s${n} { font-size: var(--fs-${n}); line-height: ${LEVEL_META[n].lh}; letter-spacing: ${LEVEL_META[n].ls}; font-weight: ${LEVEL_META[n].weight}; }`).join('\n')}
  .lbl { font-size: 9px; color: rgba(233,236,242,0.3); font-family: ui-monospace, monospace; margin-top: 2px; }
</style></head><body>
  <div class="hdr">${opt.label}<span class="tag">${opt.tag}</span></div>
${LEVELS.map((n) => `  <div class="row"><div class="s${n}">${SAMPLE[n]}</div><div class="lbl">L${n} · ${LEVEL_META[n].role}</div></div>`).join('\n')}
</body></html>`;
}

// ── Numbers table ───────────────────────────────────────────────────────────
function numbersTable() {
  const head = `<tr><th>سطح</th><th>نقش</th>${OPTIONS.map((o) => `<th style="color:${o.accent}">${o.label.split(' — ')[0]}</th>`).join('')}</tr>`;
  const rows = WIDTHS.map((w) => {
    const cells = LEVELS.map((n) => {
      const vals = OPTIONS.map((o) => sizeAt(o.base.at(w), n));
      const spread = Math.max(...vals) - Math.min(...vals);
      const highlight = spread > 2.5 ? ' class="spread"' : '';
      return `<tr${highlight}><td class="mono">L${n}</td><td class="role">${LEVEL_META[n].role}</td>${vals
        .map((v) => `<td class="mono">${px(v)}</td>`)
        .join('')}</tr>`;
    }).join('');
    return `<tbody><tr class="wrow"><td colspan="5">${WIDTH_LABEL[w]}</td></tr>${cells}</tbody>`;
  }).join('');
  return `<table><thead>${head}</thead>${rows}</table>`;
}

// ── The lh bug, demonstrated ────────────────────────────────────────────────
const lhBug = `
<div class="bug">
  <div class="bug-head">باگ منتشرشده در <code>liminal-css-vars.ts</code> خط ۱۱۷</div>
  <pre><code>v(\`lh-\${level}\`, \`\${t.lh}px\`);   // t.lh یک ضریب است، نه پیکسل</code></pre>
  <div class="bug-grid">
    <div class="bug-cell bad">
      <div class="bug-tag">آنچه امروز منتشر می‌شود</div>
      <div class="bug-css">--liminal-lh-3: <b>1.6px</b></div>
      <div class="bug-demo" style="line-height:1.6px">متن با line-height: 1.6px</div>
      <div class="bug-note">ارتفاع خط ۱.۶ پیکسل ← متن روی خودش می‌افتد</div>
    </div>
    <div class="bug-cell good">
      <div class="bug-tag">آنچه باید منتشر شود</div>
      <div class="bug-css">--liminal-lh-3: <b>1.6</b></div>
      <div class="bug-demo" style="line-height:1.6">متن با line-height: 1.6</div>
      <div class="bug-note">بدون واحد ← ضریب، همان‌طور که در موتور تعریف شده</div>
    </div>
  </div>
</div>`;

// ── Breakpoints ─────────────────────────────────────────────────────────────
const CURRENT_BP = [
  ['FormLayout', 600, 'فرم تک‌ستونه شود'],
  ['AppShell', 640, 'ناوبری موبایل مخفی شود'],
  ['Grid', 699, 'ستون‌ها به sm'],
  ['index.css', 768, '—'],
  ['AppShell', 800, 'سایدبار مخفی شود'],
  ['Grid', 1099, 'ستون‌ها به md'],
];

const bpSection = `
<p class="lead">
  شش بریک‌پوینت، شش عدد متفاوت، هیچ‌کدام مشتق‌شده. این همان کلاس خطای آلفاهای دستی است:
  اعدادی که با عادت انتخاب شده‌اند، نه با یک اصل.
</p>
<div class="bp-wrap">
  ${CURRENT_BP.map(([file, pxv, why]) => `
    <div class="bp">
      <div class="bp-num">${fa(pxv)}</div>
      <div class="bp-file">${file}</div>
      <div class="bp-why">${why}</div>
    </div>`).join('')}
</div>
<div class="bp-axis">
  <div class="bp-axis-line"></div>
  ${CURRENT_BP.map(([, pxv]) => `<span class="bp-tick" style="right:${((pxv - 560) / 580) * 100}%">${fa(pxv)}</span>`).join('')}
  <span class="bp-axis-cap">۵۶۰px</span>
  <span class="bp-axis-cap end">۱۱۴۰px</span>
</div>
<p class="note">
  شش عدد در بازه‌ی ۶۰۰ تا ۱۱۰۰ — یعنی ۵۰۰ پیکسل فضا، شش تصمیم مستقل.
  اصل پیشنهادی: بریک‌پوینت جایی است که <em>محتوا</em> می‌شکند، نه جایی که یک دستگاه عوض می‌شود.
</p>`;

// ── Container queries ───────────────────────────────────────────────────────
const cqSection = `
<p class="lead">
  یک کارت، دو ظرف، یک viewport. Media query هر دو را یکسان می‌بیند چون عرض صفحه یکی است.
  Container query هر کدام را جدا می‌بیند چون به عرض <em>خودش</em> نگاه می‌کند.
</p>
<div class="cq-demo">
  <div class="cq-box narrow">
    <div class="cq-cap">ظرف باریک · ۲۲۰px</div>
    <div class="cq-card">
      <div class="cq-title">موتور کنتراست</div>
      <div class="cq-body">آلفاها از کف خوانایی مشتق می‌شوند.</div>
      <div class="cq-badge">عمودی</div>
    </div>
  </div>
  <div class="cq-box wide">
    <div class="cq-cap">ظرف پهن · ۴۲۰px</div>
    <div class="cq-card">
      <div class="cq-title">موتور کنتراست</div>
      <div class="cq-body">آلفاها از کف خوانایی مشتق می‌شوند.</div>
      <div class="cq-badge">افقی</div>
    </div>
  </div>
</div>
<pre class="cq-code"><code>.liminal-card { container-type: inline-size; }
@container (min-width: 340px) {
  .liminal-card__inner { flex-direction: row; }   /* فقط وقتی خودِ کارت جا دارد */
}</code></pre>
<p class="note">
  در همین صفحه هر دو کارت داخل یک viewport هستند. Media query نمی‌تواند این تفاوت را ببیند.
</p>`;

// ── Assemble ────────────────────────────────────────────────────────────────
const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — تست زنده‌ی طراحی واکنش‌گرا</title>
<style>
  :root {
    --bg: #0B0C0E;
    --s2: #101215;
    --s4: #16181C;
    --s6: #1C1F24;
    --rim: rgba(233,236,242,0.09);
    --rim-soft: rgba(233,236,242,0.055);
    --ink: #E9ECF2;
    --ink-2: rgba(233,236,242,0.72);
    --ink-3: rgba(233,236,242,0.46);
    --ink-4: rgba(233,236,242,0.28);
    --blue: #7FB4FF;
    --amber: #E0A458;
    --red: #FF7B72;
    --green: #7EE787;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 40px 28px 80px;
    background: var(--bg); color: var(--ink);
    font-family: -apple-system, "Segoe UI", Tahoma, sans-serif;
    -webkit-font-smoothing: antialiased;
    line-height: 1.6;
  }
  .wrap { max-width: 1180px; margin: 0 auto; }
  h1 { font-size: 33px; font-weight: 600; letter-spacing: -0.02em; margin: 0 0 8px; }
  h2 {
    font-size: 23px; font-weight: 600; letter-spacing: -0.01em;
    margin: 56px 0 6px; padding-top: 24px; border-top: 1px solid var(--rim);
  }
  h2 .n {
    font-family: ui-monospace, monospace; font-size: 13px; font-weight: 500;
    color: var(--blue); margin-inline-end: 10px;
  }
  h3 { font-size: 16px; font-weight: 600; margin: 32px 0 10px; letter-spacing: 0; }
  p { color: var(--ink-2); margin: 10px 0; }
  .lead { font-size: 16px; color: var(--ink-2); max-width: 78ch; }
  .note { font-size: 13px; color: var(--ink-3); max-width: 78ch; }
  .sub { font-size: 13px; color: var(--ink-3); margin-top: 0; }
  code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 0.92em; }
  pre {
    background: var(--s2); border: 1px solid var(--rim-soft); border-radius: 10px;
    padding: 14px 16px; overflow-x: auto; margin: 12px 0;
    direction: ltr; text-align: left;
  }
  pre code { color: var(--ink-2); font-size: 12.5px; line-height: 1.7; }

  /* ── bug ── */
  .bug { background: var(--s2); border: 1px solid var(--rim-soft); border-radius: 14px; padding: 20px 22px; margin: 18px 0; }
  .bug-head { font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
  .bug-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
  .bug-cell { border-radius: 10px; padding: 14px 16px; border: 1px solid var(--rim-soft); }
  .bug-cell.bad { background: rgba(255,123,114,0.05); border-color: rgba(255,123,114,0.22); }
  .bug-cell.good { background: rgba(126,231,135,0.05); border-color: rgba(126,231,135,0.22); }
  .bug-tag { font-size: 10.5px; letter-spacing: 0.07em; text-transform: uppercase; color: var(--ink-4); margin-bottom: 8px; }
  .bug-css { font-family: ui-monospace, monospace; font-size: 12.5px; color: var(--ink-3); direction: ltr; text-align: left; margin-bottom: 10px; }
  .bug-cell.bad .bug-css b { color: var(--red); }
  .bug-cell.good .bug-css b { color: var(--green); }
  .bug-demo { font-size: 15px; color: var(--ink); background: var(--bg); border-radius: 7px; padding: 8px 10px; overflow: hidden; }
  .bug-note { font-size: 12px; color: var(--ink-3); margin-top: 9px; }

  /* ── option cards ── */
  .opts { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin: 20px 0 8px; }
  .opt { background: var(--s2); border: 1px solid var(--rim-soft); border-radius: 14px; padding: 16px 18px; border-top-width: 2px; }
  .opt-name { font-size: 15px; font-weight: 600; margin-bottom: 6px; display: flex; align-items: center; gap: 8px; }
  .opt-tag { font-size: 10px; padding: 2px 7px; border-radius: 5px; background: rgba(233,236,242,0.08); color: var(--ink-3); font-weight: 500; }
  .opt-blurb { font-size: 12.5px; color: var(--ink-3); line-height: 1.65; }
  .opt-formula { font-family: ui-monospace, monospace; font-size: 11px; color: var(--ink-4); direction: ltr; text-align: left; margin-top: 10px; word-break: break-all; }

  /* ── frames ── */
  .frames { display: grid; grid-template-columns: 320px 1fr 1fr; gap: 16px; margin-top: 18px; align-items: start; }
  .frame-col { background: var(--s2); border: 1px solid var(--rim-soft); border-radius: 12px; overflow: hidden; }
  .frame-cap {
    font-size: 11px; color: var(--ink-3); padding: 9px 12px;
    border-bottom: 1px solid var(--rim-soft); background: var(--s4);
    font-family: ui-monospace, monospace; direction: ltr; text-align: left;
  }
  .frame-cap b { color: var(--ink-2); font-weight: 600; }
  iframe { display: block; width: 100%; border: 0; background: var(--bg); }
  iframe.w320 { height: 620px; }
  iframe.w768 { height: 620px; }
  iframe.w1440 { height: 620px; }

  /* ── table ── */
  table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px; }
  th {
    text-align: right; font-weight: 600; font-size: 11.5px; color: var(--ink-3);
    padding: 8px 10px; border-bottom: 1px solid var(--rim); letter-spacing: 0.02em;
  }
  td { padding: 6px 10px; border-bottom: 1px solid var(--rim-soft); color: var(--ink-2); }
  td.mono { font-family: ui-monospace, monospace; font-size: 12.5px; color: var(--ink); }
  td.role { color: var(--ink-4); font-size: 11.5px; }
  tr.wrow td {
    background: var(--s4); color: var(--ink-3); font-size: 11px;
    letter-spacing: 0.05em; padding: 7px 10px; font-family: ui-monospace, monospace;
  }
  tr.spread td.mono { color: var(--amber); }

  /* ── breakpoints ── */
  .bp-wrap { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin: 18px 0; }
  .bp { background: var(--s2); border: 1px solid var(--rim-soft); border-radius: 10px; padding: 12px; text-align: center; }
  .bp-num { font-size: 19px; font-weight: 600; font-family: ui-monospace, monospace; color: var(--amber); }
  .bp-file { font-size: 10.5px; color: var(--ink-3); margin-top: 4px; }
  .bp-why { font-size: 10.5px; color: var(--ink-4); margin-top: 5px; line-height: 1.5; }
  .bp-axis { position: relative; height: 46px; margin: 26px 0 8px; }
  .bp-axis-line { position: absolute; top: 14px; left: 0; right: 0; height: 1px; background: var(--rim); }
  .bp-tick {
    position: absolute; top: 14px; font-size: 10px; color: var(--amber);
    font-family: ui-monospace, monospace; transform: translateX(50%);
  }
  .bp-tick::before {
    content: ''; position: absolute; top: -5px; left: 50%; width: 1px; height: 11px;
    background: var(--amber); opacity: 0.55;
  }
  .bp-axis-cap { position: absolute; top: 28px; left: 0; font-size: 10px; color: var(--ink-4); font-family: ui-monospace, monospace; }
  .bp-axis-cap.end { left: auto; right: 0; }

  /* ── container query ── */
  .cq-demo { display: grid; grid-template-columns: 220px 1fr; gap: 16px; margin: 18px 0; align-items: start; }
  .cq-box { background: var(--s2); border: 1px solid var(--rim-soft); border-radius: 12px; padding: 14px; }
  .cq-cap { font-size: 10.5px; color: var(--ink-4); font-family: ui-monospace, monospace; margin-bottom: 10px; }
  .cq-card {
    container-type: inline-size;
    background: var(--s4); border: 1px solid var(--rim); border-radius: 10px;
    padding: 14px; display: flex; flex-direction: column; gap: 8px;
  }
  .cq-title { font-size: 15px; font-weight: 600; }
  .cq-body { font-size: 13px; color: var(--ink-3); }
  .cq-badge {
    align-self: flex-start; font-size: 10.5px; padding: 2px 8px; border-radius: 5px;
    background: rgba(127,180,255,0.12); color: var(--blue); font-family: ui-monospace, monospace;
  }
  .cq-box.wide .cq-card { flex-direction: row; align-items: center; flex-wrap: wrap; }
  .cq-box.wide .cq-badge { align-self: center; margin-inline-start: auto; }
  .cq-code { margin-top: 4px; }

  .footer { margin-top: 64px; padding-top: 24px; border-top: 1px solid var(--rim); font-size: 12px; color: var(--ink-4); }
  .kbd { font-family: ui-monospace, monospace; font-size: 11.5px; color: var(--ink-3); background: var(--s4); padding: 1px 6px; border-radius: 4px; }
  @media (max-width: 900px) {
    .opts { grid-template-columns: 1fr; }
    .frames { grid-template-columns: 1fr; }
    .bp-wrap { grid-template-columns: repeat(3, 1fr); }
    .cq-demo { grid-template-columns: 1fr; }
    .bug-grid { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
<div class="wrap">

  <h1>تست زنده‌ی طراحی واکنش‌گرا</h1>
  <p class="sub">LIMINAL · Phase 2 · Step 2.2 — همه‌چیز با واحدهای واقعی، داخل iframe با عرض واقعی. ${fa(new Date().toISOString().slice(0, 10))}</p>

  <p class="lead">
    این صفحه سه چیز را نشان می‌دهد: (۱) یک باگ که همین حالا در کد منتشر می‌شود،
    (۲) مقایسه‌ی سه گزینه برای مقیاس تایپ در سه عرض واقعی،
    (۳) وضعیت فعلی بریک‌پوینت‌ها و اینکه container query چه چیزی را حل می‌کند.
  </p>

  <h2><span class="n">۰۱</span>باگی که همین حالا منتشر می‌شود</h2>
  <p class="lead">
    قبل از هر تصمیمی، یک چیز را باید بگویم. موقع خواندن کد پیدا کردم و مستقل از این تصمیم باید درست شود.
  </p>
  ${lhBug}

  <h2><span class="n">۰۲</span>سه گزینه، سه عرض واقعی</h2>
  <p class="lead">
    هر ستون یک iframe با عرض واقعی است. داخل هر iframe واحد <code>vw</code> واقعی است، پس
    <code>clamp()</code> دقیقاً همان‌طور رفتار می‌کند که در مرورگر واقعی رفتار می‌کند.
  </p>

  <div class="opts">
    ${OPTIONS.map((o) => `
      <div class="opt" style="border-top-color:${o.accent}">
        <div class="opt-name">${o.label}<span class="opt-tag">${o.tag}</span></div>
        <div class="opt-blurb">${o.blurb}</div>
        <div class="opt-formula">--base: ${o.base.css}</div>
      </div>`).join('')}
  </div>

  ${WIDTHS.map((w) => `
    <h3>${WIDTH_LABEL[w]}</h3>
    <div class="frames">
      ${OPTIONS.map((o) => `
        <div class="frame-col">
          <div class="frame-cap"><b>${o.label.split(' — ')[0]}</b> · ${fa(w)}px · base ${px(o.base.at(w))}px</div>
          <iframe class="w${w}" data-opt="${o.id}" data-w="${w}" title="${o.label} @ ${w}"></iframe>
        </div>`).join('')}
    </div>`).join('')}

  <h2><span class="n">۰۳</span>اعداد</h2>
  <p class="lead">
    هر سلول اندازه‌ی واقعی آن سطح است. سلول‌های کهربایی جایی هستند که دو گزینه بیش از ۲.۵px فاصله دارند.
  </p>
  ${numbersTable()}

  <h2><span class="n">۰۴</span>بریک‌پوینت‌ها</h2>
  ${bpSection}

  <h2><span class="n">۰۵</span>Container query — چیزی که media query نمی‌بیند</h2>
  ${cqSection}

  <h2><span class="n">۰۶</span>خلاصه</h2>
  <table>
    <thead><tr><th>لایه</th><th>تصمیم</th><th>استدلال</th></tr></thead>
    <tbody>
      <tr><td class="mono">lh</td><td>اصلاح واحد</td><td class="role">متغیر عمومی منتشر می‌شود؛ مستقل از این تصمیم</td></tr>
      <tr><td class="mono">تایپ</td><td>شناور (نسبت ثابت)</td><td class="role">نسبت طرح است، پایه شرط خواندن</td></tr>
      <tr><td class="mono">بریک‌پوینت</td><td>مشتق از شکست محتوا</td><td class="role">۶ عدد فعلی هیچ اصلی ندارند</td></tr>
      <tr><td class="mono">Container query</td><td>اصلی</td><td class="role">کارت به عرض خودش واکنش بدهد، نه viewport</td></tr>
      <tr><td class="mono">فاصله‌گذاری</td><td>بدون تغییر</td><td class="role">باندهای چسبیده/جدا ادراکی‌اند، وابسته به viewport نیستند</td></tr>
      <tr><td class="mono">نردبان سطوح</td><td>بدون تغییر</td><td class="role">ادراکی است، وابسته به viewport نیست</td></tr>
    </tbody>
  </table>

  <div class="footer">
    تولید‌شده توسط <span class="kbd">scripts/gen-responsive-test.mjs</span> · بدون شبکه · بدون build
  </div>
</div>

<script type="text/html" id="doc-b">${frameDoc(OPTIONS[0])}</script>
<script type="text/html" id="doc-a">${frameDoc(OPTIONS[1])}</script>
<script type="text/html" id="doc-j">${frameDoc(OPTIONS[2])}</script>
<script>
  document.querySelectorAll('iframe[data-opt]').forEach(function (f) {
    var tpl = document.getElementById('doc-' + f.dataset.opt);
    if (tpl) f.srcdoc = tpl.textContent;
  });
</script>
</body>
</html>`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html, 'utf8');

// ── Report ──────────────────────────────────────────────────────────────────
console.log('wrote', OUT);
console.log('');
console.log('base px at each width:');
for (const w of WIDTHS) {
  console.log(
    '  ' + String(w).padStart(5) + 'px  ' +
      OPTIONS.map((o) => `${o.id}=${px(o.base.at(w))}`).join('  '),
  );
}
console.log('');
console.log('L8 (display) at each width:');
for (const w of WIDTHS) {
  console.log(
    '  ' + String(w).padStart(5) + 'px  ' +
      OPTIONS.map((o) => `${o.id}=${px(sizeAt(o.base.at(w), 8))}`).join('  '),
  );
}
console.log('');
console.log('L1 (meta) at each width:');
for (const w of WIDTHS) {
  console.log(
    '  ' + String(w).padStart(5) + 'px  ' +
      OPTIONS.map((o) => `${o.id}=${px(sizeAt(o.base.at(w), 1))}`).join('  '),
  );
}
