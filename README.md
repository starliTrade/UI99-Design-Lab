# UI99 Design Lab

Research environment for deriving UI99's mathematical/perceptual design rules before integrating them into the production token engine.

## Current sprint

**Sprint 01 — Surface & Separation**

Research loop:

`Experiment → Measure → Derive → Validate → Integrate`

### Rules

- Experimental formulas are not production tokens.
- No master-engine changes happen from visual intuition alone.
- Every proposed relation must have a valid range and known failure cases.
- Visual validation and mathematical validation are both required.

## Open experiments

1. Dark surface hierarchy
2. Border necessity and strength
3. Shadow vs surface separation
4. Nested radius relations

## Status

**Sprint 01 initialized.**

---

## فارسی و RTL

سیستم از ابتدا دوجهته است، نه با وصله. چهار قاعده، و هر چهار از داده مشتق شده‌اند نه از سلیقه:

### ۱. محور، نه سمت

کامپوننت‌ها با ویژگی‌های **منطقی** نوشته می‌شوند: `marginInlineStart`، `insetInlineEnd`، `textAlign: 'start'`.
`DirProvider` مقدار `dir` را روی عنصر سند می‌گذارد — جایی که portalها هم می‌بینند.

```tsx
<DirProvider dir="rtl">
  <App />
</DirProvider>
```

> **تنظیم فقط یکی از این دو، چیدمانی نیمه‌آینه می‌سازد — که از آینه‌نشده بدتر است.**

### ۲. موقعیت‌یابی

`left`/`right` **فیزیکی**‌اند و در هر جهت فیزیکی می‌مانند. برای سمت منطقی از `inline-start`/`inline-end` استفاده کن.

پسوند `-start`/`-end` بسته به سمت، محور متفاوتی دارد — و این قرارداد Radix است:

| | |
|---|---|
| `bottom-start` | محور **inline** — لبه‌های شروع به هم می‌رسند (در RTL لبه‌های راست) |
| `left-start` | محور **block** — لبه‌های بالا به هم می‌رسند، در هر جهت |

### ۳. تایپوگرافی فارسی

دو واقعیت درباره خط، و هیچ‌کدام سلیقه نیست:

**خط پیوسته است.** فاصله‌گذاری مثبت حروف، اتصال‌ها را می‌شکند. tracking فارسی در هر سطح `0` است.

**فارسی بلندتر روی خط می‌نشیند.** متریک‌های واقعی Vazirmatn: `unitsPerEm 2048 · ascender 2100 · descender −1100 · lineGap 0` → فاصله طبیعی خط `1.5625`.

مقیاس لاتین از ۱.۱۰ تا ۱.۶۰ می‌رود، پس **هفت سطح از هشت سطح زیر آنچه فونت لازم دارد می‌نشینند** و متن فارسی بریده می‌شود. قاعده `max(طراحی‌شده، کف)` است.

### ۴. تقویم جلالی

از `Intl` می‌آید — یعنی پیاده‌سازی خود پلتفرم، که با تعریف نجومی واقعی نگه‌داری می‌شود. الگوریتم چرخه ۳۳ ساله در هر قرن چند سال غلط است و اینجا استفاده نمی‌شود.

```ts
toJalali(new Date('2026-03-21'))   // { year: 1405, month: 1, day: 1 } — نوروز
formatJalali(new Date())            // «۲۱ مهر ۱۴۰۵»
toPersianDigits(1234)               // «۱۲۳۴»
```

هفته از **شنبه** شروع می‌شود، و رقم‌ها `U+06F0` هستند نه `U+0660` عربی.

### bidi

`dir="rtl"` جهت پایه را درست می‌کند؛ **runهای داخلش** را نه — و آنجاست که می‌شکند. یک کلمه لاتین در جمله فارسی، نقطه‌گذاری بعدش را می‌کشد.

```html
<span class="liminal-bidi-isolate">config.json</span>
<code class="liminal-bidi-code">npm run dev</code>
```

### بارگذاری فونت

`font-display: swap` — نه `block`. متن فارسی در فونت جانشین خوانده می‌شود؛ قفل‌کردن رندر برای فونت درست، یک تأخیر دیدنی را با یک فریم اول کمی بهتر عوض می‌کند.

**پیش‌فرض از CDN می‌آید تا سیستم بدون تنظیم کار کند.** برای production، فونت را محلی کن:

```bash
node scripts/fetch-font.mjs
```

فونت را در `public/fonts/` می‌گذارد، **متریک‌هایش را با قراردادی که کف line-height از آن مشتق شده تطبیق می‌دهد**، و `liminal-fonts-selfhosted.css` را می‌سازد. تنها تغییر، عوض‌کردن یک import است:

```diff
- @import "./engine/liminal-fonts.css";
+ @import "./engine/liminal-fonts-selfhosted.css";
```

> اگر فونت عوض شود، متریک‌ها عوض می‌شوند و **کف باید دوباره مشتق شود**. اسکریپت این را بررسی می‌کند و اگر تطبیق ندهد با خطا بیرون می‌آید.

### تأیید

```bash
bun run verify          # ۴۳۶ تست، شامل ۱۶ تست فارسی و ۲۰ تست جلالی
node scripts/verify-rtl.mjs   # ۵ بررسی در مرورگر واقعی
```
