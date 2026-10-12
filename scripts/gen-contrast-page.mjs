import { writeFileSync } from 'node:fs';
import { apcaMagnitude, deriveTextToken, APCA_FLOOR, CONTRAST_FLOOR } from '../src/engine/liminal-contrast.ts';
import { LADDER } from '../src/engine/liminal-ladder.ts';
import { getTextAlpha } from '../src/engine/spec-engine.ts';
import { whiteAlphaContrastOn, blendAlpha, hexToRgb, minWhiteAlphaForContrast } from '../src/engine/liminal-color-math.ts';

const ROLES = ['primary','secondary','tertiary','quaternary'];
const WCAG = { primary:4.5, secondary:4.5, tertiary:4.5, quaternary:3.0 };
const APCA_C = { primary:90, secondary:75, tertiary:60, quaternary:45 };
const APCA_D = { primary:90, secondary:75, tertiary:60, quaternary:30 };

function apcaOn(bg, a) {
  const c = hexToRgb(bg);
  const t = blendAlpha({ r:255,g:255,b:255 }, c, a);
  const hex = '#' + [t.r,t.g,t.b].map(v=>v.toString(16).padStart(2,'0')).join('');
  return apcaMagnitude(hex, bg);
}
function minApca(bg, target) {
  for (let a=0;a<=1;a+=0.001) if (apcaOn(bg,a) >= target) return Math.round(a*1000)/1000;
  return 1;
}
const minWcag = (bg, t) => minWhiteAlphaForContrast(bg, t);

const OPTIONS = {
  A: { name:'A · دستی (وضعیت امروز)', note:'آلفا با چشم انتخاب شده. WCAG قبول است، APCA نه.',
       alpha:(role,n)=>getTextAlpha(role,n), bound:'—' },
  B: { name:'B · فقط WCAG', note:'آلفا از آستانه WCAG مشتق شده. سلسله‌مراتب فرو می‌ریزد.',
       alpha:(role,n)=>minWcag(LADDER[n], WCAG[role]), bound:'WCAG' },
  C: { name:'C · WCAG + APCA (سخت‌گیرترین برنده)', note:'هر دو عدسی. آلفاها بالا می‌روند و سلسله‌مراتب صاف می‌شود.',
       alpha:(role,n)=>Math.max(minWcag(LADDER[n],WCAG[role]), minApca(LADDER[n],APCA_C[role])), bound:'APCA' },
  D: { name:'D · لایه‌بندی‌شده بر اساس کاربرد واقعی', note:'primary/secondary بدنه، tertiary متن بزرگ، quaternary غیرمتنی.',
       alpha:(role,n)=>Math.max(minWcag(LADDER[n],WCAG[role]), minApca(LADDER[n],APCA_D[role])), bound:'APCA' },
};

const SAMPLES = [
  ['primary','h','سطح تصمیم‌گیری'],
  ['secondary','b','متن بدنه در این سلسله‌مراتب قرار می‌گیرد و باید راحت خوانده شود.'],
  ['tertiary','c','توضیح فرعی و برچسب‌های کم‌اهمیت‌تر.'],
  ['quaternary','m','METADATA · ۱۲ مورد'],
];

const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

let cards = '';
for (const key of ['A','B','C','D']) {
  const o = OPTIONS[key];
  const alphas = ROLES.map(r => o.alpha(r,0).toFixed(3)).join(' / ');
  let body = '';
  for (const [role, cls, text] of SAMPLES) {
    const a = o.alpha(role,0);
    body += `<div class="sample">
      <div class="role-label">${role} · α=${a.toFixed(3)} · WCAG ${whiteAlphaContrastOn(LADDER[0],a).toFixed(1)} · Lc ${apcaOn(LADDER[0],a).toFixed(0)}</div>
      <div class="${cls}" style="color:rgba(255,255,255,${a})">${esc(text)}</div>
    </div>`;
  }
  cards += `<div class="opt${key==='D'?' recommended':''}">
    <h2><span>${esc(o.name)}</span><small>α ${alphas}</small></h2>
    <div class="body">${body}</div>
    <div class="note">${esc(o.note)}</div>
  </div>`;
}

let handRows = '';
for (const role of ROLES) {
  const a = getTextAlpha(role,0);
  const w = whiteAlphaContrastOn(LADDER[0],a), lc = apcaOn(LADDER[0],a);
  const wOk = w >= WCAG[role], lcOk = lc >= APCA_FLOOR[role];
  handRows += `<tr><td>${role}</td><td>${a.toFixed(3)}</td>
    <td class="${wOk?'pass':'fail'}">${w.toFixed(2)}</td><td>${WCAG[role]}</td>
    <td class="${lcOk?'pass':'fail'}">${lc.toFixed(0)}</td><td>${APCA_FLOOR[role]}</td>
    <td class="${lcOk?'pass':'fail'}">${lcOk?'قبول':'رد'}</td></tr>`;
}

let deltaRows = '';
for (const role of ROLES) {
  const h0 = getTextAlpha(role,0), d0 = OPTIONS.C.alpha(role,0);
  const h5 = getTextAlpha(role,5), d5 = OPTIONS.C.alpha(role,5);
  const f = v => (v>=0?'+':'') + v.toFixed(3);
  deltaRows += `<tr><td>${role}</td><td>${h0.toFixed(3)}</td><td>${d0.toFixed(3)}</td><td class="warn">${f(d0-h0)}</td>
    <td>${h5.toFixed(3)}</td><td>${d5.toFixed(3)}</td><td class="warn">${f(d5-h5)}</td></tr>`;
}

const html = `<!doctype html>
<html lang="fa" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>LIMINAL · کنتراست به‌عنوان ورودی</title>
<style>
:root{--s0:#060709;--line:rgba(255,255,255,.08)}
*{box-sizing:border-box}
body{margin:0;background:var(--s0);color:rgba(255,255,255,.88);
font:14px/1.7 ui-sans-serif,system-ui,"Segoe UI",Tahoma,sans-serif;padding:32px 24px 80px}
h1{font-size:22px;font-weight:600;margin:0 0 6px;letter-spacing:-.01em}
.sub{color:rgba(255,255,255,.5);font-size:13px;margin-bottom:28px;max-width:70ch}
.lead{color:rgba(255,255,255,.62);font-size:13px;margin:0 0 32px;max-width:78ch;
border-inline-start:2px solid var(--line);padding-inline-start:14px}
.grid{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));margin-bottom:40px}
.opt{border:1px solid var(--line);border-radius:10px;overflow:hidden;background:#07090b}
.opt h2{font-size:13px;font-weight:600;margin:0;padding:12px 14px;border-bottom:1px solid var(--line);
display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap}
.opt h2 small{font-weight:400;color:rgba(255,255,255,.4);font-size:11px;font-family:ui-monospace,monospace}
.opt .body{padding:16px 14px 20px}
.opt .note{font-size:11.5px;color:rgba(255,255,255,.42);padding:0 14px 14px;line-height:1.6}
.opt.recommended{border-color:rgba(255,255,255,.22)}
.sample{margin-bottom:14px}.sample:last-child{margin-bottom:0}
.role-label{font-size:10px;font-family:ui-monospace,monospace;color:rgba(255,255,255,.3);
margin-bottom:5px;letter-spacing:.04em}
.h{font-size:19px;font-weight:600;line-height:1.35}
.b{font-size:14px;line-height:1.75}
.c{font-size:12.5px;line-height:1.6}
.m{font-size:11px;font-family:ui-monospace,monospace;letter-spacing:.02em}
table{width:100%;border-collapse:collapse;font-size:12px;margin-top:8px}
th,td{padding:6px 8px;text-align:start;border-bottom:1px solid var(--line);
font-family:ui-monospace,monospace;font-variant-numeric:tabular-nums}
th{color:rgba(255,255,255,.42);font-weight:500;font-size:10.5px;letter-spacing:.04em}
td.pass{color:#7fd88f}td.fail{color:#e8736a}td.warn{color:#e0b25e}
.section-title{font-size:15px;font-weight:600;margin:44px 0 4px}
.section-sub{font-size:12.5px;color:rgba(255,255,255,.45);margin:0 0 18px}
.legend{display:flex;gap:18px;flex-wrap:wrap;font-size:11.5px;color:rgba(255,255,255,.5);margin-bottom:16px}
.legend b{color:rgba(255,255,255,.75);font-weight:500}
</style></head><body>

<h1>کنتراست به‌عنوان ورودی — نه بازرسی پسینی</h1>
<p class="sub">هر توکن متن از روی «حداقل کنتراست هدف» مشتق می‌شود، نه اینکه رنگ انتخاب شود و بعد بازرسی شود.</p>

<p class="lead">مسئله: آلفاهای فعلی (۰.۸۸ / ۰.۶۲ / ۰.۴۶ / ۰.۳۵) با چشم انتخاب شده‌اند و بعد با WCAG سنجیده شده‌اند.
WCAG همه را «قبول» می‌کند — اما WCAG برای متن روشن روی سطح تیره ابزار اشتباهی است.
APCA (پیش‌نویس WCAG 3) قطبیت‌آگاه است و همان متن را ضعیف‌تر می‌بیند.</p>

<div class="legend">
<span><b>WCAG</b> = نسبت ۲.x · آستانه بدنه ۴.۵:۱</span>
<span><b>APCA Lc</b> = کنتراست ادراکی · بدنه ≥ ۷۵ · متن بزرگ ≥ ۶۰ · غیرمتنی ≥ ۴۵</span>
<span><b>α</b> = آلفای سفید روی سطح</span>
</div>

<div class="section-title">۱. چهار گزینه، رندرشده روی سطح واقعی S0</div>
<p class="section-sub">همه با متن واقعی و روی همان سطح. تفاوت سلسله‌مراتب را با چشم بسنجید، بعد عددها را ببینید.</p>
<div class="grid">${cards}</div>

<div class="section-title">۲. عددها — چه چیزی امروز تحویل داده می‌شود</div>
<p class="section-sub">آلفاهای دستی روی S0. ستون آخر: آیا APCA آن را برای بدنه قبول می‌کند؟</p>
<table><tr><th>نقش</th><th>آلفا</th><th>WCAG</th><th>آستانه WCAG</th><th>Lc</th><th>آستانه APCA</th><th>حکم APCA</th></tr>${handRows}</table>

<div class="section-title">۳. آلفای مشتق‌شده در برابر آلفای دستی</div>
<p class="section-sub">وقتی هر دو عدسی اعمال شود، آلفا چقدر باید بالا برود.</p>
<table><tr><th>نقش</th><th>دستی S0</th><th>مشتق S0 (C)</th><th>Δ</th><th>دستی S5</th><th>مشتق S5 (C)</th><th>Δ</th></tr>${deltaRows}</table>

</body></html>`;

writeFileSync('design-lab/contrast-as-input.html', html);
console.log('wrote design-lab/contrast-as-input.html', html.length, 'bytes');
