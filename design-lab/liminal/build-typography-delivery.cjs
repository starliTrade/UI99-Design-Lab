// Typography delivery: computes the scale, line-height and Persian floor from the policy formulas
// (LIMINAL-POLICY.md §6.9.5) and checks them against the table values, then writes typography-delivery.html.
// Run: node design-lab/liminal/build-typography-delivery.cjs
'use strict';
const fs = require('fs');
const path = require('path');

// §6.9.5-1: scale ratio 1.2, base 16, level n = 16 * 1.2^n
const RATIO = 1.2, BASE = 16;
const size = n => BASE * Math.pow(RATIO, n);
// §6.9.5-3: line-height = 1 + 8 / fs  (8px = SPACING[2])
const lineHeight = fs => 1 + 8 / fs;
// §6.9.5-3 floor for Persian: (ascender + descender) / UPM for Vazirmatn = (2100 + 1100) / 2048
const PERSIAN_FLOOR = (2100 + 1100) / 2048;

// Table values as written in the policy (for the check)
const TABLE = [
  { n: 1, size: 19.2, lh: 1.4167 },
  { n: 3, size: 27.6, lh: 1.2894 },
  { n: 5, size: 39.8, lh: 1.2009 },
  { n: 8, size: 68.8, lh: 1.1163 },
  { n: 10, size: 99.1, lh: 1.0808 },
];

const checks = [];
for (const r of TABLE) {
  const s = size(r.n), lh = lineHeight(s);
  checks.push({ name: `level ${r.n} size`, got: s.toFixed(2), want: r.size.toFixed(2), ok: Math.abs(s - r.size) < 0.06 });
  checks.push({ name: `level ${r.n} line-height`, got: lh.toFixed(4), want: r.lh.toFixed(4), ok: Math.abs(lh - r.lh) < 0.0006 });
}
checks.push({ name: 'Persian floor', got: PERSIAN_FLOOR.toFixed(4), want: '1.5625', ok: Math.abs(PERSIAN_FLOOR - 1.5625) < 1e-9 });
const latinMaxBelow = lineHeight(size(1)); // tightest Latin line-height (level 1)
checks.push({ name: 'Persian floor > tightest Latin line-height', got: `${PERSIAN_FLOOR.toFixed(4)} > ${latinMaxBelow.toFixed(4)}`, want: 'true', ok: PERSIAN_FLOOR > latinMaxBelow });

const failed = checks.filter(c => !c.ok);
for (const c of checks) console.log((c.ok ? 'ok  ' : 'FAIL'), c.name.padEnd(44), c.got.padEnd(24), 'want', c.want);
console.log(failed.length ? `FAILED ${failed.length}` : 'ALL PASS');

// Delivery page
const levels = [1,2,3,4,5,6,7,8,9,10].map(n => {
  const s = size(n), lh = lineHeight(s);
  const fa = Math.max(PERSIAN_FLOOR, lh); // proposed Persian rule: never below the floor
  return `<tr><td>${n}</td><td class="ltr">${s.toFixed(2)}px</td><td class="ltr">${lh.toFixed(4)}</td><td class="ltr">${fa.toFixed(4)}</td>
  <td class="sample" style="font-size:${s.toFixed(2)}px;line-height:${lh.toFixed(4)}">Aa Latin</td>
  <td class="sample" style="font-size:${s.toFixed(2)}px;line-height:${fa.toFixed(4)}">ابپ</td></tr>`;
}).join('');
const rowsChecks = checks.map(c => `<tr><td>${c.name}</td><td class="ltr">${c.got}</td><td class="ltr">${c.want}</td><td>${c.ok ? '✅' : '❌'}</td></tr>`).join('');

const html = `<!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>تحویل تایپوگرافی</title>
<style>
  body { margin:0; background:#060709; color:#cfd6e4; font-family: system-ui, Vazirmatn, sans-serif; padding:16px; font-size:14px; }
  h1 { font-size:19px; margin:6px 0 8px; } h2 { font-size:16px; margin:22px 0 8px; }
  table { width:100%; border-collapse:collapse; } th,td { border-bottom:1px solid #1a1f29; padding:6px 8px; text-align:right; vertical-align:middle; }
  th { opacity:.75; font-weight:600; font-size:12px; }
  .ltr { direction:ltr; font-family: ui-monospace, monospace; font-size:12px; }
  .sample { color:#e6ebf5; white-space:nowrap; }
  .muted { opacity:.72; font-size:13px; line-height:1.8; }
</style></head>
<body>
<h1>تحویل تایپوگرافی — مقیاس، ارتفاع خط، کف فارسی</h1>
<p class="muted">این صفحه با <span class="ltr">build-typography-delivery.cjs</span> از فرمول‌های §۶.۹.۵ ساخته شده است. مقادیر جدول سیاست با محاسبه مقایسه شده‌اند.</p>
<h2>سنجش‌ها</h2>
<table><thead><tr><th>مورد</th><th>محاسبه</th><th>جدول سیاست</th><th>وضعیت</th></tr></thead><tbody>${rowsChecks}</tbody></table>
<h2>مقیاس و ارتفاع خط</h2>
<table><thead><tr><th>سطح</th><th>اندازه</th><th>ارتفاع لاتین</th><th>ارتفاع فارسی (پیشنهادی)</th><th>نمونهٔ لاتین</th><th>نمونهٔ فارسی</th></tr></thead><tbody>${levels}</tbody></table>
<p class="muted">قاعدهٔ کف فارسی: ارتفاع خط فارسی نباید از <span class="ltr">${PERSIAN_FLOOR.toFixed(4)}</span> کمتر شود، وگرنه حروف بریده می‌شوند.</p>
<p class="muted">وضعیت: محاسبه ✅ · تأیید چشمی ⏳</p>
</body></html>`;
fs.writeFileSync(path.join(__dirname, 'typography-delivery.html'), html, 'utf8');
console.log('wrote typography-delivery.html');
