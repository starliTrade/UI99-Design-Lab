# LIMINAL — رودمپ صفر مطلق تا انتشار جهانی
> **شعار: ریاضیات و فرمولاسیون زیبایی و استاندارد خلق می‌کند**
> **وضعیت فعلی: صفر مطلق — `src/components` حذف شد (۲۰۲۶-۱۰-۲۰)، موتور دست‌نخورده ماند**
> **انتشار: آخرین مرحله — وقتی همه چیز تکمیل، ممیزی، تست و قابل مقایسه است**
>
> این سند تنها مرجع حقیقت است. هر خط یا اندازه‌گیری‌شده است یا یک قدم با معیار پذیرش و تستی که نگهش می‌دارد.
> الگوی هر قدم: **ایده → تست چشمی → تحلیل → سیاست → قانون → موتور → تست → ممیزی → ثبت**

---

## ۰. چرا صفر؟

> موتور کامل است، کامپوننت‌ها نبودند.

| آنچه ماند (مقدس) | آنچه رفت (صفر شد) | چرا |
|---|---|---|
| `src/engine` — ۳۹ فایل، ۹ پله، `q=0.0083`, `L(n)=0.128+n×0.009475` | `src/components` — ۲۱۸ فایل، ۱۲۷ کامپوننت | موتور از چشم و فرمول آمده، کامپوننت‌ها از حدس |
| `LIMINAL-POLICY.md` — ۱۰ فصل قانون | کامپوننت‌های قدیمی که هر کدام عدد خودشان را داشتند | قانون باید از موتور بیاید، نه بر آن تحمیل شود |
| `design-lab/*` — ۲۸ آزمایش ادراکی | `fixtures.tsx` با ۵۶/۸۴ کامل | آزمایش‌ها مدرک‌اند، فیوچرها حدس بودند |
| تمام تست‌های موتور — ۳۰ فایل | تمام تست‌های کامپوننت وابسته به عدد دستی | تست موتور از فرمول می‌آید، تست کامپوننت باید از نقش بیاید |

**آرشیو:** `.archive/components-legacy-*.tar.gz` + `git log --all -- src/components` — هیچ چیز گم نشده، فقط از مسیر کنار رفته.

**اصل صفر:** از امروز، هیچ کامپوننتی بدون عبور از چرخهٔ زیر وجود ندارد:
```
چشم (آزمایش) → عدد (q, گام, آستانه) → فرمول (L, C, H) → قانون (POLICY) → موتور (engine) → کامپوننت (role+state) → تست (گارد) → ممیزی (axe+visual+perf) → ثبت (POLICY+CHANGELOG)
```

---

## ۱. معماری صفر — از موتور تا پیکسل

### لایه‌ها (پایین به بالا — هر لایه فقط به پایینی وابسته است)

```
┌─────────────────────────────────────────────────────────┐
│  لایه ۶: انتشار (npm, CLI, Figma, MCP)                  │  ← آخر
├─────────────────────────────────────────────────────────┤
│  لایه ۵: الگوها (Patterns/Blocks) — ۵ صفحه کامل          │
├─────────────────────────────────────────────────────────┤
│  لایه ۴: کامپوننت‌ها (Styled Primitives)                  │
│          هر کامپوننت = Primitive + Engine Decision       │
│          Button = ButtonPrimitive + resolveSurface({role:'control'}) │
├─────────────────────────────────────────────────────────┤
│  لایه ۳: پریمیتیوها (Headless, Accessible, RTL)          │
│          هیچ رنگ، هیچ سایه، فقط رفتار + a11y            │
│          Radix-like: Slot, asChild, roving focus, form  │
├─────────────────────────────────────────────────────────┤
│  لایه ۲: موتور (موجود — دست نمی‌خورد مگر با اندازه‌گیری) │
│          ladder, surface, contrast, layout, motion,     │
│          shadow, mist, typography, direction, theme      │
├─────────────────────────────────────────────────────────┤
│  لایه ۱: ادراک (Perception) — q, r, آستانه‌ها            │
│          design-lab/*.html — تنها منبع اعداد             │
└─────────────────────────────────────────────────────────┘
```

### قانون طلایی معماری:
> **هیچ کامپوننتی عدد ندارد. همه چیز از موتور می‌آید.**
> `background: #0b0d0f` ✗ → `resolveSurface({role:'control', on:host})` ✓
> `padding: 12px` ✗ → `CONTROL[size]` ✓
> `border-radius: 8px` ✗ → `controlRadius(h)` ✓

---

## ۲. رقبا — چه داریم که آن‌ها ندارند، چه نداریم که آن‌ها دارند

### آنچه ما داریم (برتری مطلق — حفظ و تعمیق)

| برتری | موتور فعلی | چرا رقیب ندارد |
|---|---|---|
| **کوانتوم ادراکی** `q=0.0083` | سه نشست روان‌فیزیک، ۸ سطح × ۶ تکرار + ۴ تله | هیچ‌کس آستانهٔ چشم را اندازه نگرفته — همه حدس می‌زنند |
| **نردبان فرمولی** `L(n)=0.128+n×0.009475` | یک عدد برای همیشه، نه بازه | Material HCT, Radix ۱۲ پله دستی, Carbon دستی |
| **سایه حل‌شده** `α` برای هر میزبان | `peak=1q` با جستجو برای هر سطح | همه یک `rgba(0,0,0,0.2)` ثابت — روی بوم درست, روی سقف ۲.۸× تیره |
| **متن مشتق** WCAG+APCA دو لنزه | `deriveTextToken()` سخت‌گیرتر برنده | Radix کنتراست از پیش حساب‌شده, Material تک‌لنزه |
| **فارسی اول** `logical props`, Vazirmatn کف `1.5625` از متریک فونت, جلالی, bidi | `liminal-persian.ts` | React Aria جلالی دارد ولی تایپ فارسی نه |
| **جدول تولیدشده** POLICY از موتور | `gen-policy-md.ts` — یازده کپی حذف | همه دستی می‌نویسند و کپی از اصل جدا می‌شود |

### آنچه ما نداریم (گپ — باید پر شود تا قابل مقایسه باشیم)

| گپ | رقیب برتر | معیار برابری |
|---|---|---|
| **CLI Registry** `npx liminal add button` | shadcn/ui ۱۳M/هفته | هر کامپوننت `npx` نصب شود |
| **Figma + DTCG** | Fluent, Spectrum, Tokens Studio | `tokens.json` DTCG از موتور → Style Dictionary → Figma |
| **Visual Regression** | Spectrum, Carbon, Polaris | هر کامپوننت × هر state × هر سطح اسکرین‌شات |
| **Bundle Budget** | Mantine, Radix | هر کامپوننت <5KB gzip, PR با +10% رد |
| **MCP Server** | — (فرصت ۲۰۲۶) | عامل هوش مصنوعی `resolveSurface` صدا بزند |
| **Charts + Data Table** | همه | بدون این داشبورد نداریم |
| **Density + Motion Theme** | Carbon, Fluent | `density: 0.8→1.2` + `motion: 0.5→1.5` با UI |
| **Performance** | همه | `React.memo`, `useMemo` دقیق, `transition:all` حذف, Lighthouse >90 |
| **a11y کامل** | Radix, React Aria | axe + صفحه‌خوان واقعی + `forced-colors` + `prefers-reduced-motion` |

**حکم:** در موتور ۱۰/۱۰ هستیم, در اکوسیستم ۱/۱۰. رودمپ موتور را عمیق‌تر می‌کند و اکوسیستم را می‌بندد.

---

## ۳. رودمپ صفر تا انتشار — ۹ فاز، انتشار آخرین مرحله

```
فاز ۰  زیرساخت صفر (Foundation) ........ 1 هفته   ← الان
فاز ۱  پریمیتیوها (Primitives) ......... 2 هفته
فاز ۲  اتم‌ها (Atoms) ................... 2 هفته
فاز ۳  ورودی‌ها + کانتینرها ............ 3 هفته
فاز ۴  داده + ناوبری + فیدبک ........... 3 هفته
فاز ۵  الگوها + چیدمان جهانی ........... 2 هفته
فاز ۶  اکوسیستم (CLI, Figma, MCP) ...... 3 هفته
فاز ۷  ممیزی جهانی (Audit) ............. 2 هفته
فاز ۸  انتشار (Publish) ................ 1 هفته   ← آخر
─────────────────────────────────────────────────
جمع: ~۱۹ هفته ≈ ۴.۵ ماه
هر فاز یک PR, هر PR یک ممیزی, هیچ فاز بدون تست بسته نمی‌شود
```

---

### فاز ۰ — زیرساخت صفر (Foundation)
**هدف:** زمین بازی را بساز تا هر کامپوننت آینده روی آن بنشیند.
**شعار:** «یک بار درست بساز، صد بار درست استفاده کن.»

| # | کار | ایده → تست چشمی | سیاست (POLICY) | قانون (موتور) | تست (گارد) | ممیزی |
|---|---|---|---|---|---|---|
| ۰.۱ | **قرارداد جدید** `COMPONENT-CONTRACT.md v2` | — | فصل ۰ POLICY: ۱۰ شرط هر کامپوننت | `liminal-contract.ts` | `contract.test.ts` | — |
| ۰.۲ | **فیوچر صفر** `fixtures.tsx` از نو — فقط ۳ ستون: `name, group, states` | — | — | — | `engine-barrel.test.ts` | — |
| ۰.۳ | **قالب کامپوننت** `src/components/_template/` — یک کامپوننت کامل به‌عنوان الگو | تست چشمی روی ۳ سطح | POLICY §6.7: «کامپوننت عدد خودش را ندارد» | `liminal-component-engine.tsx` | `no-raw-numbers.test.ts` | — |
| ۰.۴ | **ژنراتور** `scripts/scaffold-component.mjs` — `bun scaffold Button control` | — | — | — | — | — |
| ۰.۵ | **CSS صفر** `src/index.css` فقط متغیرهای موتور — بدون استایل کامپوننت | — | — | `gen-css-vars.ts` | `css-vars.test.ts` | Lighthouse 100/100 روی صفحه خالی |
| ۰.۶ | **حذف `transition:all`** — در کل موتور | — | POLICY §9 | `liminal-motion-engine.ts` | `motion-depth.test.ts` | — |
| ۰.۷ | **اندازه‌گیری مجدد `q`** روی ۳ نمایشگر (OLED, IPS ارزان, موبایل) | `threshold-test-precise.html` روی هر کدام | POLICY §2 جدول | `liminal-ladder.ts` اگر `q` عوض شد | `tokens.test.ts` | گزارش ۳ نمایشگر |
| ۰.۸ | **DTCG پایه** `tokens/tokens.json` از موتور | — | — | `gen-dtcg.ts` | `dtcg.test.ts` | Tokens Studio import |

**خروجی فاز ۰:**
- `src/components/_template/` — یک کامپوننت نمونه که ۱۰ شرط قرارداد را نشان می‌دهد
- `scripts/scaffold-component.mjs` — هر کامپوننت جدید با یک دستور
- `tokens/tokens.json` — اولین DTCG از موتور
- `src/index.css` — فقط `--liminal-*` از موتور

**تعریف تمام فاز ۰:**
- [ ] `bun run verify` سبز (typecheck, lint, test موتور)
- [ ] `bun scripts/gen-policy-md.ts` و `bun scripts/gen-css-vars.ts` بدون diff
- [ ] یک کامپوننت قالب با ۱۰۰٪ قرارداد + axe سبز + visual baseline
- [ ] DTCG در Tokens Studio باز می‌شود

---

### فاز ۱ — پریمیتیوها (Headless Primitives)
**هدف:** رفتار و دسترسی را از ظاهر جدا کن — مثل Radix ولی با RTL و فارسی.
**چرا اول؟** چون هر کامپوننت بعدی روی یک پریمیتیو می‌نشیند. پریمیتیو غلط = همه غلط.

| # | پریمیتیو | نقش موتور | حالات | a11y |
|---|---|---|---|---|
| ۱.۱ | **Slot** + **asChild** | — | — | — |
| ۱.۲ | **FocusScope** + **VisuallyHidden** | — | — | `focus-visible`, `aria-hidden` |
| ۱.۳ | **Portal** + **DismissableLayer** | — | — | `aria-modal`, `inert` |
| ۱.۴ | **Roving Focus** | — | — | `roving tabindex` |
| ۱.۵ | **Form primitives** — `Field`, `Label`, `Description`, `Error` | — | `error, readonly` | `aria-invalid, aria-describedby` |
| ۱.۶ | **Collection** — لیست قابل انتخاب | — | `selected, disabled` | `aria-selected, aria-multiselectable` |

**قانون هر پریمیتیو:**
- هیچ `background`, `border`, `shadow` — فقط `role, aria-*, tabIndex, onKeyDown`
- `logical properties` اجباری — `insetInlineStart` نه `left`
- `useId` برای هر `id` — نه `id="liminal-modal-title"` ثابت
- هم `value` و هم `defaultValue` — controlled/uncontrolled کامل

**تست هر پریمیتیو:**
- `a11y-sweep.test.tsx` — axe روی هر state
- `keyboard.test.tsx` — Tab, Enter, Escape, Arrow
- `rtl.test.tsx` — `dir="rtl"` + `logical` چک
- `form.test.tsx` — `name` + `FormData` + `react-hook-form`

**تعریف تمام فاز ۱:**
- [ ] ۶ پریمیتیو با ۱۰۰٪ axe + کیبورد + RTL
- [ ] هیچ پریمیتیو عدد رنگ ندارد — `grep -r "#[0-9a-f]" src/primitives` خالی

---

### فاز ۲ — اتم‌ها (Atoms) — اولین پیکسل‌ها
**هدف:** اولین کامپوننت‌هایی که چشم می‌بیند — و ثابت کنند موتور کار می‌کند.

| # | کامپوننت | نقش | سایز | واریانت | درمان‌ها | نکته |
|---|---|---|---|---|---|---|
| ۲.۱ | **Button** | `control` روی میزبان | `sm(32) md(44) lg(52)` | `primary secondary ghost danger outline link` | `fill+1, border+1, rim 1.5, shadow 1q` | اولین — قالب همه |
| ۲.۲ | **Badge** | `control` | `sm md lg` | `default success warning danger` | `fill` از `SEMANTICS` | `onSolid` تیره برای کنتراست |
| ۲.۳ | **Tag** | `control` | `sm md` | `default outline` | `fill+1` | قابل حذف |
| ۲.۴ | **Kbd** | `control` | `sm md` | `default` | `fill+0.5` | `kbd` سمانتیک |
| ۲.۵ | **Spinner** | — | `sm md lg` | `default` | — | `aria-busy`, `prefers-reduced-motion` |
| ۲.۶ | **Typography** | — | ۱۰ سطح `TYPOGRAPHY` | `primary secondary tertiary quaternary` | آلفا مشتق | `lh=1+8/fs`, کف فارسی `1.5625` |
| ۲.۷ | **Mist** | `panel` | — | `mist glass` | `mist` کدر ۸۴٪, `glass` بلور | دو جسم، نه یک استایل |
| ۲.۸ | **Marker** | `control` | `sm md` | `dot number` | `fill` | `aria-label` |

**چرخهٔ هر اتم (مثال Button):**
```
1. ایده: «دکمه یک لایه است» — POLICY §6.6
2. تست چشمی: Button روی S0,S1,S2,S3 — ۴ میزبان × ۵ حالت = ۲۰ ترکیب در design-lab
3. تحلیل: fill یک پله بالای میزبان (`1.1416q`), border یک پله بالای fill, rim 1.5
4. سیاست: «کنترل یک لایه است, نه استثنا» — POLICY §6.6 جدول
5. قانون: resolveSurface({role:'control', on:host, state}) در liminal-surface.ts
6. موتور: getDirectionalRim(n, true) + floatShadow(h, hostRgb) — اگر نبود اضافه می‌شود
7. کامپوننت: src/components/atoms/Button/Button.tsx — فقط role+on+state, هیچ عدد
8. تست: no-raw-numbers + perceptual-boundary + contrast + a11y-sweep + placement + visual
9. ممیزی: axe + صفحه‌خوان + forced-colors + Lighthouse
10. ثبت: POLICY §6.7 جدول Button + CHANGELOG سطر
```

**تست هر اتم (۱۰ شرط قرارداد):**
| شرط | گارد | آستانه |
|---|---|---|
| ۱. ROLE نه level | `no-raw-numbers` | هیچ `LADDER[` یا `getLadderColor(` در کامپوننت |
| ۲. SIZE از توکن | `tokens.test.ts` | `CONTROL[size]` نه `32` |
| ۳. STATE روی مرز | `perceptual-boundary` | `0.4q ≤ ΔL ≤ 1.0q` روی هر میزبان |
| ۴. VARIANT نام‌دار | `contract.test.ts` | نه `blue`, بلکه `primary` |
| ۵. فقط توکن | ESLint `no-restricted-syntax` | هیچ `hex, rgba, #` |
| ۶. a11y | `a11y-sweep` | axe ۰ نقض, `role, aria-*, keyboard` |
| ۷. RTL | `direction-rtl` | فقط `logical props` |
| ۸. در فیوچر | `fixtures.tsx` | یک سطر |
| ۹. تست دارد | `coverage` | render + behavior + contrast + axe |
| ۱۰. visual | `visual-regression` | اسکرین‌شات هر state × هر سطح |

**تعریف تمام فاز ۲:**
- [ ] ۸ اتم × ۱۰ شرط = ۸۰ چراغ سبز
- [ ] Button روی ۴ میزبان × ۵ حالت × ۲ جهت = ۴۰ اسکرین‌شات baseline
- [ ] هیچ اتم `transition:all` ندارد
- [ ] `verify-component-standard.mjs` ۸/۸ کامل

---

### فاز ۳ — ورودی‌ها + کانتینرها (Inputs + Containers)
**هدف:** فرم و ساختار — جایی که رقبا می‌برند.

| گروه | کامپوننت | نقش | حالات اضافی | نکته موتور |
|---|---|---|---|---|
| **Inputs** | Input, Textarea, NumberInput, OTP, FileUpload | `control` | `error, readonly, disabled` | `well` برای fill خاموش — `S2` روی هر میزبان |
| | Checkbox, Radio, Toggle, ToggleGroup | `control` | `checked, indeterminate` | `well` + `control` — دو نقش، یک موتور |
| | Select, Combobox, MultiSelect | `control` → `menu` | `open, error` | `menu` روی `work` — `S5` با سایه `E1` |
| | Slider, Rating | `control` | `error` | `track` well, `thumb` control |
| | InputGroup, ButtonGroup | `panel` | — | `r_inner = max(4, r_outer-padding)` |
| **Containers** | Card, Panel | `panel` روی `work` | — | `S3` با `border+1, rim 1.5` |
| | Accordion, Collapsible | `panel` | `open` | `content` S3 با `separator` |
| | Divider | — | `horizontal vertical` | `separator` 0.5 پله |
| | Drawer, Sheet, Modal | `modal` | `open` | `S7` با سایه `E3` + `mist` |
| | Popover, HoverCard | `popover` | `open` | `S6` با سایه `E2` |

**چالش فاز ۳ — `well` و `region`:**
- `well` = پرشدگیِ کنترل خاموش — `S2` روی هر میزبان، با ریم معکوس (فرورفته)
- `region` = ناحیهٔ لنگردار — `S2` اسمی، یک پله بالای میزبان، تخت بدون ریم (برای Stepper, Collapsible, TreeView, MessageScroller)
- **تست:** `placement.test.ts` — `well on work` قانونی، `work on canvas` غیرقانونی

**فرم — قرارداد Form:**
- `Form` + `Field` + `useFormContext` — هر Input `name` دارد و در `FormData` شرکت می‌کند
- `react-hook-form` آداپتور — نه وابستگی اجباری، یک مثال
- `error` از `Field` می‌آید — نه `prop` پراکنده

**تعریف تمام فاز ۳:**
- [ ] ۱۰ Input + ۸ Container = ۱۸ کامپوننت × ۱۰ شرط = ۱۸۰ چراغ
- [ ] فرم کامل با `name, FormData, aria-invalid, aria-describedby`
- [ ] `well, region` در POLICY §1.5 جدول + تست placement سبز

---

### فاز ۴ — داده + ناوبری + فیدبک (Data + Nav + Feedback)
**هدف:** محصول واقعی — جدول، نمودار، ناوبری.

| گروه | کامپوننت | نقش | نکته |
|---|---|---|---|
| **Data** | Table (سورت, فیلتر, صفحه‌بندی) | `panel` | **جدید — قبلی ساده بود** — `Data Table` قدرتمندتر از تمام رقبا |
| | Chart (line, bar, area, pie) | — | **جدید** — ۱۲ فام `EXTENDED_SPECTRUM` هر کدام کسری از گاموت خودش |
| | Calendar, DatePicker (جلالی + میلادی) | `popover` | `react-aria` تقویم + تایپ فارسی ما |
| | Avatar, AvatarGroup | `control` | `fallback` با `initials` فارسی |
| | Progress, Stat, Item, FilterBar, Pagination, TreeView | `control/panel` | — |
| **Nav** | Tabs, Breadcrumb, Stepper, Sidebar, Topbar | `chrome/panel` | `chrome` = `S1` روی `canvas` |
| | CommandPalette, DropdownMenu, ContextMenu | `menu/popover` | `S5/S6` با سایه |
| | Navigation Menu (مگامنو), Menubar | `popover` | **جدید** |
| **Feedback** | Alert, Toast, Tooltip, AlertDialog | `panel/toast` | `accent` دست‌نخورده + `text` پله روشن‌تر |

**Chart — برتری مطلق:**
- هر فام `EXTENDED_SPECTRUM` کسری از گاموت خودش را نگه می‌دارد (۵۴٪ تا ۸۳٪) — نه کروما ثابت که ۱.۹۵× پراکندگی می‌سازد
- هر پله `0.08` روشنایی پایین — ۷ پله، هر کدام یک کاربرد
- **تست:** `chart.test.ts` — هر فام روی هر سطح `WCAG >4.5` برای `text`

**تعریف تمام فاز ۴:**
- [ ] Table + Chart جدید — دو کامپوننتی که قبلاً نداشتیم و همه دارند
- [ ] Calendar جلالی با `roving tabindex` + `aria-selected`
- [ ] مجموع: ۸+۱۰+۴ = ۲۲ کامپوننت × ۱۰ شرط = ۲۲۰ چراغ

---

### فاز ۵ — الگوها + چیدمان جهانی (Patterns + Layout)
**هدف:** بلوک‌های آماده — ۵ صفحه کامل که محصول را نشان دهند.

| الگو | کامپوننت‌های سازنده | نقش |
|---|---|---|
| **AppShell** | `canvas → chrome → work` | `canvas S0 → chrome S1 → work S2` — سه قانون بزرگ در یک کامپوننت |
| **PageHeader, PageSection, Grid, Stack** | `panel` | `gap` از مقیاس `√2`, `padding` از `SPACING` |
| **EmptyState, ErrorPage, Skeleton** | `panel` | `skeleton` پالس — مدت حلقه‌ای، نه سفری |
| **FormLayout, Message, MessageScroller** | `panel + region` | `region` برای ناحیه لنگردار |
| **Blocks** — ۵ صفحه: Dashboard, Settings, Inbox, Auth, Marketing | همه | هر بلوک یک `AppShell` کامل |

**Layout — قانون `z-index`:**
- `Z_INDEX = ROLE_LEVEL` — هیچ عدد دستی ۱۰۰۰/۲۰۰۰/۹۹۹۹
- `isolation: isolate` روی هر سطح — `dropdown` داخل `modal` بدون `z-index` بالای میزبانش است

**تعریف تمام فاز ۵:**
- [ ] `AppShell` با `canvas→chrome→work` — همان باگی که یک بار پنل‌ها مستقیم روی بوم بودند دیگر ممکن نیست
- [ ] ۵ Blocks صفحه — هر کدام یک محصول واقعی
- [ ] `AppFrame, DeviceFrame` با `isolation: isolate`

---

### فاز ۶ — اکوسیستم (Ecosystem) — قدرتمندتر از تمام رقبا
**هدف:** آنچه رقبا دارند و ما نداریم — ولی بهتر.

| # | قابلیت | رقیب برتر | برتری ما |
|---|---|---|---|
| ۶.۱ | **CLI Registry** `npx ui99 add button` | shadcn/ui | CLI ما **موتورآگاه** است — `add button` نه فقط فایل کپی می‌کند، `fixtures.tsx` + `gen-policy-md.ts` + تست را هم می‌سازد |
| ۶.۲ | **DTCG + Figma** `tokens/tokens.json` → Style Dictionary → Figma | Fluent, Spectrum | توکن ما از فرمول می‌آید، نه دستی — Figma همیشه با کد همگام است |
| ۶.۳ | **MCP Server** `liminal-mcp` — قرارداد به‌عنوان API | — (فرصت) | عامل هوش مصنوعی: «یک دکمه primary روی work بساز» → `resolveSurface({role:'control', on:'work'})` |
| ۶.۴ | **Themes UI** — `density` + `motion` + `direction` با پیش‌نمایش زنده | Carbon, Material | تم ما دو مقیاس است (`density` سایز+شعاع با هم، `motion` مدت با کف) — هویت `monochrome` قفل است |
| ۶.۵ | **Carousel, Resizable, Attachment, Questionnaire** | — | ۴ کامپوننت غایب که در فاز ۳-۵ جا نماندند |
| ۶.۶ | **نردبان معکوس** — تم روشن `L_light(n)=0.92-n×0.009475` | — | یک فرمول، دو جهت — نه پالت جدید، آینهٔ ریاضی |

**CLI — جزئیات:**
```bash
npx ui99 add button        # یک کامپوننت
npx ui99 add --all         # همه
npx ui99 theme --density 1.2  # تم
npx ui99 tokens --figma    # Figma sync
```

**تعریف تمام فاز ۶:**
- [ ] `npx ui99 add button` در پروژه خالی کار کند
- [ ] `tokens.json` در Tokens Studio import شود و Figma بسازد
- [ ] MCP Server به Claude/Cursor وصل شود و کامپوننت بسازد

---

### فاز ۷ — ممیزی جهانی (Global Audit) — همه چیز تست‌شده
**هدف:** هر ادعا یک مدرک دارد — و مدرک را غریبه می‌تواند چک کند.

| # | ممیزی | ابزار | آستانه | وضعیت فعلی |
|---|---|---|---|---|
| ۷.۱ | **axe** روی هر صفحه + هر کامپوننت + هر state | `a11y-sweep.test.tsx` | ۰ نقض جدی | ✅ ۱۴ صفحه + ۷۴ کامپوننت — باید به ۵۰+ کامپوننت جدید برسد |
| ۷.۲ | **صفحه‌خوان واقعی** ۱۰ کامپوننت اصلی | NVDA (Win) + VoiceOver (Mac) + ویدیو | کاربر با کیبورد کار را تمام کند | ❌ نشده |
| ۷.۳ | **Visual Regression** هر کامپوننت × هر state × هر سطح × هر جهت | Chromatic / Playwright snapshots / Lost Pixel | ۰ diff ناخواسته | ❌ ندارد — **مهم‌ترین گپ** |
| ۷.۴ | **کنتراست** هر متن روی هر سطح | `contrast.test.ts` دو لنزه | WCAG AA + APCA — سخت‌گیرتر برنده | ✅ موجود — باید برای کامپوننت‌های جدید تکرار |
| ۷.۵ | **forced-colors** | `liminal-forced-colors.css` + `forced-colors.test.tsx` | در `forced-colors: active` خوانا | ⚠️ CSS دارد، تست ندارد |
| ۷.۶ | **Lighthouse** روی سایت مستقر | `lighthouse-ci` در CI | Performance >90, A11y 100, Best Practices 100 | ❌ ندارد |
| ۷.۷ | **Bundle Budget** هر کامپوننت | `size-limit` در CI | `<5KB gzip`, +10% = رد PR | ❌ چاپ می‌شود، قفل نیست |
| ۷.۸ | **Performance** | `design-lab/state-benchmark.html` + React Profiler | ۵۰ دکمه hover = ۰ style recalc | ✅ ادعا شده، باید در CI |
| ۷.۹ | **وابستگی‌ها** | `bun audit` + Dependabot | ۰ آسیب‌پذیری بالا | ❌ نشده |
| ۷.۱۰ | **API Stability** | `gen-api.ts` diff بین نسخه‌ها | شکستن = major | ⚠️ قاعده هست، ابزار نیست |
| ۷.۱۱ | **`q` چند نمایشگر** | `threshold-test-precise.html` روی ۳ نمایشگر | انحراف `q` گزارش شود | ❌ یک نمایشگر |
| ۷.۱۲ | **RTL کامل** | `verify-rtl.mjs` + `direction-rtl.test.tsx` | ۰ `left, right, marginLeft` | ✅ موجود |

**تعریف تمام فاز ۷:**
- [ ] ممیزی بیرونی (یا `axe + Lighthouse + visual + screen reader`) ۰ نقض جدی
- [ ] هر فاز ۰-۶ visual baseline دارد
- [ ] `q` روی ۳ نمایشگر اندازه‌گیری و گزارش شده

---

### فاز ۸ — انتشار (Publish) — آخرین مرحله
**هدف:** محصول جهانی — وقتی همه چیز تکمیل و ممیزی است، منتشر می‌شود.
**اصل:** «انتشار تصمیم تقاضاست، نه تاریخ.» — ولی وقتی منتشر می‌شود، باید کامل باشد.

| # | کار | معیار |
|---|---|---|
| ۸.۱ | نام نهایی + `private:false` | `npm view ui99` یا `npm view @liminal/core` کار کند |
| ۸.۲ | `CHANGELOG.md` خودکار از `conventional commits` | هر کامیت `feat/fix/docs` یک سطر |
| ۸.۳ | `TOKEN_VERSION` منجمد — هر تغییر توکن = major | `liminal-token-version.ts` قطعی |
| ۸.۴ | پنجره deprecation اعلام‌شده (۲ نسخه) | `BREAKING CHANGE` در CHANGELOG |
| ۸.۵ | مهاجرت‌نامه از پیش از ۱.۰ | `MIGRATION.md` |
| ۸.۶ | سایت روی دامنه واقعی (نه tunnel) | `ui99.design` یا `liminal.design` |
| ۸.۷ | مستندات نسخه‌دار | `/docs/1.0/*` + `/docs/next/*` |
| ۸.۸ | اعلام عمومی | Product Hunt, X, Hacker News, Reddit r/reactjs |

**تعریف تمام فاز ۸ = تعریف تمام پروژه:**
- [ ] `bun add ui99` در پروژه خالی Next.js کار کند و یک Button رندر شود — و این جمله در CI تست شود (`verify-next-smoke.sh`)
- [ ] سایت روی دامنه با Lighthouse >90
- [ ] CHANGELOG + MIGRATION + LICENSE + CONTRIBUTING + SECURITY کامل
- [ ] هیچ فاز ۰-۷ باز نماند
- [ ] جدول مقایسه ۱۸ سیستم جهانی دوباره پر شود و هیچ محوری زیر «رقابتی» نباشد

---

## ۴. چرخهٔ هر کامپوننت — از چشم تا npm

```
┌──────────────────────────────────────────────────────────────────┐
│  1. ایده — «چه چیزی کم است؟»                                     │
│     مثال: «دکمه یک لایه است، نه استثنا»                          │
│  2. تست چشمی — روی ۳ میزبان، ۵ حالت، ۲ جهت                       │
│     design-lab/button-host-test.html — ۴ میزبان × ۵ حالت = ۲۰   │
│  3. تحلیل — عدد از چشم                                            │
│     fill = host+1 (1.1416q), border = fill+1, rim = fill+1.5    │
│  4. سیاست — فصل جدید در LIMINAL-POLICY.md                         │
│     «کنترل یک لایه است» + جدول تولیدشده                             │
│  5. قانون — ثابت در src/engine/*.ts                               │
│     ROLE_LEVEL['control']=4, CONTROL_LIFT=1                      │
│  6. موتور — مشتق در scripts/gen-*.ts                              │
│     gen-policy-md.ts + gen-css-vars.ts جدول را تولید می‌کنند    │
│  7. کامپوننت — src/components/atoms/Button/Button.tsx             │
│     فقط role+on+state, هیچ عدد دستی                              │
│  8. تست — ۱۰ شرط قرارداد                                          │
│     no-raw-numbers + perceptual-boundary + contrast + a11y +     │
│     placement + visual + rtl + interaction-vars                   │
│  9. ممیزی — axe + visual + Lighthouse + صفحه‌خوان                 │
│ 10. ثبت — POLICY جدول + CHANGELOG سطر + fixtures سطر              │
└──────────────────────────────────────────────────────────────────┘
```

**هر کامپوننت که این چرخه را نچرخد، وجود ندارد.**

---

## ۵. نظم اجرا — فقط یکی بعد از یکی

```
فاز ۰  زیرساخت ─── 1 هفته ──┐
فاز ۱  پریمیتیو ── 2 هفته ──┤  ← بدون این، همه چیز حدس است
فاز ۲  اتم ─────── 2 هفته ──┤
فاز ۳  ورودی+کانتینر 3 هفته ─┤  ← محصول شکل می‌گیرد
فاز ۴  داده+ناوبری+فیدبک 3 هفته┤
فاز ۵  الگو+چیدمان  2 هفته ──┤  ← بلوک‌ها
فاز ۶  اکوسیستم ── 3 هفته ──┤  ← CLI, Figma, MCP
فاز ۷  ممیزی ───── 2 هفته ──┤  ← همه چیز چک
فاز ۸  انتشار ─── 1 هفته ──┘  ← آخر
─────────────────────────────────
جمع: 19 هفته ≈ 4.5 ماه
```

**وابستگی:**
- فاز ۰ قبل از همه — بدون قالب و ژنراتور، هر کامپوننت دستی و ناسازگار می‌شود
- فاز ۱ قبل از ۲-۵ — بدون پریمیتیو، a11y و RTL وصله‌ای می‌شود
- فاز ۷ بعد از ۶ — ممیزی روی چیز ناقص، ممیزی نیست
- فاز ۸ بعد از ۷ — انتشار بدون ممیزی، قول بدون پشتوانه است

**قانون PR:**
- هر فاز یک PR, هر PR حداکثر ۱۰ کامپوننت
- هر PR باید `verify` + `visual` + `a11y` سبز باشد
- شاخه بلند >2 هفته ممنوع — هر ۲ هفته merge به main

---

## ۶. ریسک‌ها — صادقانه

| ریسک | اثر | چاره |
|---|---|---|
| `q` تک‌ناظر، تک‌نمایشگر | کل نردبان روی فرض اشتباه | فاز ۰.۷ — همین هفته روی ۲ نمایشگر دیگر |
| visual regression نداریم | هر تغییر CSS بی‌صدا می‌شکند — دو بار اتفاق افتاده | فاز ۷.۳ را می‌توان به فاز ۲ آورد — از اولین اتم baseline |
| bundle بدون سقف | «سبک» ادعاست | فاز ۷.۷ — ولی از فاز ۲ هر PR سایز چاپ کند |
| ۸ کامپوننت غایب | shadcn جلوتر است | فاز ۴ — Table+Chart اولویت P0 |
| نام npm | `liminal` گرفته شده | `ui99` آزاد است — همین امروز رزرو کن |
| شاخه بلند | تعارض با main | هر فاز merge فوری |

---

## ۷. امروز چه می‌کنیم — قدم اولِ صفر

> **صفر مطلق انجام شد — `src/components` حذف شد.**
> **حالا زمین را می‌سازیم تا خانه روی آن بایستد.**

- [x] `src/components` حذف → `.archive/components-legacy-*.tar.gz` + گیت
- [x] `src/index.ts` به موتور خالص برگشت
- [x] این رودمپ — ۹ فاز تا انتشار
- [ ] **بعدی (همین الان):** `src/components/_template/` + `scripts/scaffold-component.mjs` + `COMPONENT-CONTRACT.md v2`
- [ ] **بعد از آن:** Button — اولین کامپوننت از چرخهٔ کامل، به‌عنوان اثبات
- [ ] **نام npm:** `ui99` را رزرو کن — `npm publish --dry-run` همین امروز

---

> **آخرین جمله:**
> موتور LIMINAL الان بهترین موتور دارک UI اندازه‌گیری‌شده در جهان است —
> `q=0.0083` با سه نشست روان‌فیزیک هیچ کجای دیگر نیست.
> صفر کردن کامپوننت‌ها شجاعت بود — چون خانه‌ای که روی حدس ساخته شود،
> با اولین زلزله می‌ریزد.
> **از امروز، هر پیکسل از فرمول می‌آید — و آن‌وقت عصر جدید شروع می‌شود.**

*برای شاخه `arena/d2b358bd-ui99-design-lab` — هر فاز یک PR، هر PR یک ممیزی، انتشار آخرین مرحله.*
