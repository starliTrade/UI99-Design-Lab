// Builds q-test.html: one self-contained page. Stimulus helpers are copied VERBATIM from
// index.html (the validated colour and dither code), not retyped.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(resolve(here, f), 'utf8');
const lines = read('index.html').split('\n');
const helpers = lines.slice(108, 237).join('\n');          // lines 109–237: colour, pure and dither helpers
if (!helpers.includes('function ditherPanel') || !helpers.includes('function pureCandidates')) throw new Error('helper range moved');
const html = `<!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>باتری ۲ — اندازه‌گیری q</title>
<style>
body{background:#060709;color:#e9ecf2;font-family:system-ui,sans-serif;margin:0;padding:18px;max-width:560px;margin:auto}
h1{font-size:18px}.card{background:#0e1013;border:1px solid #1d2026;border-radius:12px;padding:14px;margin:10px 0;font-size:14px;line-height:1.8}
.muted{color:#9aa3b2;font-size:13px}.hidden{display:none}button{font:inherit;padding:14px 18px;border-radius:10px;border:1px solid #2a2e36;background:#14171c;color:#e9ecf2;min-width:44%}
#panels{display:flex;gap:12px;justify-content:center;margin:14px 0}.panel{width:150px;height:150px;border-radius:8px;overflow:hidden}
.panel>div{width:150px;height:150px}.bar{height:6px;background:#1d2026;border-radius:3px;margin:8px 0}#prog{height:6px;background:#5b7fb8;width:0;border-radius:3px}
.ok{color:#7fd39a}.bad{color:#e88a8a}textarea{width:100%;height:90px;direction:ltr;font-size:11px;background:#0e1013;color:#9aa3b2;border:1px solid #1d2026;border-radius:8px}
.row{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
#field{width:100%;height:56vh;min-height:280px;background:#060709}
.hidden{display:none!important}
</style></head>
<body>
<h1>اندازه‌گیری q — آزمون هوشمند</h1>
<div id="bar" class="bar"><div id="prog"></div></div>

<div id="s-intro" class="card">
  
  <p>هر کوشش دو بازه دارد. در یکی از آن‌ها یک درز افقی کم‌رنگ وسط صفحه هست؛ در دیگری نیست. بگو کدام بازه درز داشت: بازهٔ ۱ یا ۲.</p><p class="muted">جواب درست یا غلط نداره؛ اگر فرقی نمی‌بینی، حدس بزن. بازخورد نمی‌گیری.</p>
  <ul class="muted"><li>روشنایی گوشی را معمولی بگذار؛ حالت شب و کنتراست بالا را خاموش کن.</li>
  <li>گوشی را ۳۰ تا ۶۰ سانتی‌متر از چشم نگه دار و سرت را ثابت کن.</li>
  <li>دو سطح پشت سر هم اجرا می‌شود؛ هر سطح حدود ۳ تا ۴ دقیقه طول می‌کشد.</li><li>در هر کوشش، هر بازه حدود ۰.۷ ثانیه نمایش داده می‌شود. فقط بعد از اتمام دو بازه می‌توانی جواب بدهی.</li></ul>
  <div class="row"><button id="btn-start">شروع</button></div>
</div>

<div id="s-test" class="hidden">
  <div id="counter" class="muted" style="padding:8px 14px"></div>
  <div id="field"></div>
  <div id="prompt" class="muted" style="text-align:center;padding:8px">…</div>
  <div class="row" style="padding:8px 14px 14px"><button id="btn-left" disabled>◀ بازهٔ ۱</button><button id="btn-right" disabled>بازهٔ ۲ ▶</button></div>
  <p class="muted" style="padding:0 14px">با کلیدهای ← (بازهٔ ۱) و → (بازهٔ ۲) هم می‌شود جواب داد.</p>
</div>

<div id="s-res" class="card hidden">
  <div id="res-body"></div>
  <p class="muted">این نتیجه فقط برای همین گوشی و شرایط همین لحظه است. JSON را کپی کن و برای تجمیع بفرست.</p>
  <textarea id="res-json" readonly></textarea>
  <div class="row"><button id="btn-copy">کپی JSON</button><button id="btn-restart">دوباره</button></div>
</div>

<script>
${read('core.js')}
</script>
<script>
${read('q-core.js')}
</script>
<script>
${helpers}
</script>
<script>
${read('q-ui.js')}
</script>
</body></html>
`;
writeFileSync(resolve(here, 'q-test.html'), html, 'utf8');
console.log('wrote q-test.html', html.length, 'bytes');
