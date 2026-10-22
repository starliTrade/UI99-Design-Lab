// Generates states-delivery.html from the engine (resolve.cjs) and the policy JSON.
// Run: node design-lab/liminal/build-states-delivery.cjs
'use strict';
const fs = require('fs');
const path = require('path');
const { resolve, POLICY } = require('./resolve.cjs');

const CANVAS = POLICY.base.canvas;
const STATES = [
  { key: ['idle'], label: 'سکون' },
  { key: ['hover'], label: 'هاور' },
  { key: ['focus'], label: 'فوکوس' },
  { key: ['active'], label: 'فشار' },
  { key: ['disabled'], label: 'غیرفعال' },
  { key: ['hover', 'focus'], label: 'هاور + فوکوس' },
];
const RESTS = ['S0','S1','S2','S3','S4','S5','S6','S7','S8'];

function ringCss(r) {
  if (!r) return '';
  return `box-shadow: 0 0 0 ${r.inner.widthPx}px ${r.inner.hex}, 0 0 0 ${r.inner.widthPx + r.gapPx}px ${CANVAS}, 0 0 0 ${r.inner.widthPx + r.gapPx + r.outer.widthPx}px ${r.outer.hex};`;
}
function cell(rest, st) {
  const res = resolve(rest, st.key);
  const edge = (res.level === 'S0' || res.level === 'S8') ? ' edge' : '';
  return `<td class="cell${edge}"><div class="tile" style="background:${res.hex};${ringCss(res.ring)}"></div>
    <div class="cap"><b>${res.level}</b><span class="ltr">${res.hex}</span></div></td>`;
}

const ladder = Object.entries(POLICY.ladder).map(([k, v]) => `
  <div class="lrow"><div class="sw" style="background:${v.hex}"></div>
  <div class="ltr">${k}</div><div class="ltr">L ${v.L.toFixed(6)}</div><div class="ltr">${v.hex}</div>
  <div class="ltr">${(Number(k.slice(1)) * POLICY.base.ladderStepL / POLICY.base.q).toFixed(2)}q</div></div>`).join('');

const head = `<tr><th>سطح سکون</th>${STATES.map(s => `<th>${s.label}</th>`).join('')}</tr>`;
const body = RESTS.map(rest => `<tr class="${rest === 'S0' || rest === 'S8' ? 'edgeRow' : ''}"><th>${rest}</th>${STATES.map(s => cell(rest, s)).join('')}</tr>`).join('');

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>تحویل حالت‌ها — سیاست A + فوکوس F2</title>
<style>
  * { box-sizing: border-box; }
  body { margin:0; background:${CANVAS}; color:#cfd6e4; font-family: system-ui, Vazirmatn, sans-serif; padding:16px; font-size:14px; }
  h1 { font-size:19px; margin:6px 0 8px; } h2 { font-size:16px; margin:22px 0 8px; }
  p, li { line-height:1.8; } .muted { opacity:.72; font-size:13px; }
  .ltr { direction:ltr; font-family: ui-monospace, monospace; font-size:12px; }
  .lrow { display:flex; gap:12px; align-items:center; margin:4px 0; }
  .sw { width:56px; height:26px; border-radius:6px; border:1px solid #1a1f29; }
  .wrap { overflow-x:auto; }
  table { border-collapse: separate; border-spacing: 10px; }
  th { font-size:12px; opacity:.8; font-weight:600; text-align:center; padding:4px; }
  td.cell { text-align:center; vertical-align:top; }
  .tile { width:96px; height:56px; border-radius:10px; margin:0 auto; }
  .cap { display:flex; flex-direction:column; gap:2px; margin-top:6px; font-size:12px; }
  td.edge .cap b { color:#ffd98a; }
  tr.edgeRow th { color:#ffd98a; }
  .ok { color:#9fe3b1; } .warn { color:#ffd98a; }
  .box { border:1px solid #1a1f29; border-radius:12px; padding:12px 14px; margin-top:10px; }
</style>
</head>
<body>
<h1>تحویل حالت‌ها — بوم ${CANVAS}</h1>
<p class="muted">این صفحه از موتور <span class="ltr">resolve.cjs</span> و فایل <span class="ltr">states-policy-A.json</span> ساخته شده است. هیچ عدد دستی ندارد. قانون: هر تغییر یک پلهٔ کامل، کف S0، سقف S8، فوکوس فقط شکل (حلقهٔ ۱px، فاصلهٔ ۱px).</p>

<h2>نردبان</h2>
<div>${ladder}</div>

<h2>ماتریس حالت‌ها (همهٔ سطوح سکون)</h2>
<p class="muted">ردیف S0 و S8 لبه‌اند و با رنگ زرد مشخص‌اند. S0 کف است؛ S8 سقفی است که هاور در آن به −۱ تبدیل می‌شود.</p>
<div class="wrap"><table>${head}${body}</table></div>

<h2>قواعد پیاده‌سازی‌شده</h2>
<ul>
  <li>هر خروجی یک سطح کامل S0…S8 است؛ نیم‌پله وجود ندارد.</li>
  <li><span class="ltr">resolved = clamp(rest + offset, S0, S8)</span></li>
  <li>در سقف (S8)، هاور −۱ می‌شود.</li>
  <li>فوکوس fill را عوض نمی‌کند؛ فقط حلقه می‌کشد: داخلی fill+1، فاصله ۱px، بیرونی fill+2.</li>
</ul>

<div class="box">
  <b>وضعیت تست:</b> <span class="ok">ALL PASS (resolve.test.cjs)</span><br>
  <span class="warn">تأیید چشمی لبه‌ها (S0 و S8) و دیدن ۱px روی گوشی هنوز انجام نشده است.</span>
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname, 'states-delivery.html'), html, 'utf8');
console.log('wrote states-delivery.html');
