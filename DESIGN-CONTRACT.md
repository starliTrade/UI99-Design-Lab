# LIMINAL v1.0 — MASTER DESIGN CONTRACT
> «هر لایه روی آستانه‌ی ادراک — نه کمتر، نه بیشتر.»
> Pure mathematical Dark UI engine grounded in psychophysical limen $\Delta L = 0.015$.

---

## 1. RIM & SURFACES (سطوح و لبه‌های نورانی)

### 1.1 Tonal Ladder (نردبان رنگی پایه)
مبتنی بر مدل رنگی OKLCH با نقطه مرجع بوم $L_0 = 0.128$ و گام ادراکی $\Delta L = 0.015$:

- **S0 (Canvas):** `#060709` ($L \approx 0.128$) — بستر مادر و مرجع مطلق تاریکی
- **S1 (Container):** `#08090C` ($L \approx 0.143$) — کانتینرها، کارت‌های اصلی، نوارهای بیرونی
- **S2 (Panel / Control Base):** `#0A0B0F` ($L \approx 0.158$) — پنل‌های تو در تو، پیش‌فرض کنترل‌ها
- **S3 (Raised / Active Control):** `#0D0E12` ($L \approx 0.173$) — کنترل‌های برجسته، اینپوت‌های فعال
- **S4 (Elevated / Popover):** `#101115` ($L \approx 0.188$) — منوهای بازشونده، پاپ‌اور، تولتیپ
- **S5 (Overlay / Ceiling):** `#131418` ($L \approx 0.203$) — مدال‌ها، دراورهای شیت، سقف تاریکی مجاز

#### سطوح زیر-بوم (Sub-Canvas Wells)
- **S-1 (Penumbra Ambient):** `#030406` ($L \approx 0.113$)
- **S-2 (Contact Umbra):** `#010203` ($L \approx 0.098$)

### 1.2 Directional Specular Rim (لبه بازتابی زاویه‌دار)
شیب خطی ۱۸۰ درجه با توزیع نور فیزیکی: Top (۱۰۰٪) > Side (۵۵٪) > Bottom (پایین‌ترین سطح نردبان):
- **Rim 0:** بدون لبه (برای عناصر غیرفعال `disabled`)
- **Rim 1 (Container / S1):** Top `#0B0C10` | Side `#0A0B0E` | Bottom `#0A0B0F`
- **Rim 2 (Panel / S2):** Top `#0D0E12` | Side `#0B0C10` | Bottom `#0A0B0F`
- **Rim 3 (Ceiling / S3+):** Top `#0E0F13` | Side `#0D0E12` | Bottom `#0B0C10`
- **Concave Inversion (Active State):** معکوس شدن جهت شیب نور به ۱۸۰ درجه معکوس هنگام فشرده شدن دکمه (نمایش فرورفتگی فیزیکی با جابجایی عمودی `translateY(0.5px)`).

---

## 2. SHADOWS (سایه‌های زیر-بوم)
سایه‌ها در سیستم لیمینال منحصراً از دو رنگ زیر-بوم (`S-1 #030406` و `S-2 #010203`) با زاویه نور مستقیم تشکیل شده و فقط برای عناصر شناور (`floating`) و کارت‌های شاخص (`featured`) مجازند:

- **E1 (Floating Dropdown / Header):**
  `0 2px 6px rgba(3, 4, 6, 0.30), 0 1px 2px rgba(1, 2, 3, 0.22)`
- **E2 (Featured Card / Popover):**
  `0 4px 12px rgba(3, 4, 6, 0.36), 0 2px 4px rgba(1, 2, 3, 0.26)`
- **E3 (Modal / Sheet Drawer):**
  `0 8px 28px rgba(3, 4, 6, 0.44), 0 3px 8px rgba(1, 2, 3, 0.30)`
- **E4 (Toast / Max Floating Anchor):**
  `0 14px 44px rgba(3, 4, 6, 0.50), 0 5px 12px rgba(1, 2, 3, 0.34)`

---

## 3. SPACING, RADIUS & TYPOGRAPHY (هندسه و مقیاس)

### 3.1 Spacing Tokens (مقیاس فاصله‌گذاری — اتم ۴ پیکسل)
- پیوسته (Cohesive): $\le 12px$
  - `SPACING[1]` = `4px`
  - `SPACING[2]` = `8px`
  - `SPACING[3]` = `12px`
- جداکننده (Separating): $\ge 16px$
  - `SPACING[4]` = `16px`
  - `SPACING[5]` = `24px`
  - `SPACING[6]` = `32px`
  - `SPACING[7]` = `48px`
  - `SPACING[8]` = `64px`
  - `SPACING[9]` = `96px`

### 3.2 Radius Tokens & Concentric Law (شعاع و قانون توافق متحدالمرکز)
فرمول شعاع فرزندی: $R_{inner} = \max(4, R_{outer} - P)$
- `RADIUS.chip` = `6px` (برچسب‌ها و تگ‌های کوچک)
- `RADIUS.control` = `10px` (دکمه‌ها و فیلدهای ورودی)
- `RADIUS.card` = `16px` (کارت‌ها و آیتم‌های منو)
- `RADIUS.panel` = `20px` (پنل‌های تو در تو)
- `RADIUS.container` = `24px` (کانتینرهای مادر و صفحه)
- `RADIUS.full` = `9999px` (پیل — انحصاراً برای Badge، Toggle و تک‌دکمه‌ی Hero Mist CTA)

### 3.3 Typography Scale (مقیاس ماژولار ۱.۲)
فونت پایه: `Inter` برای متن، `JetBrains Mono` برای مقادیر فنی و کدهای داده:
- `TYPOGRAPHY[1]`: `fs: 11px`, `lh: 14px`, `ls: +0.04em`, `weight: 500`
- `TYPOGRAPHY[2]`: `fs: 13px`, `lh: 18px`, `ls: +0.02em`, `weight: 400`
- `TYPOGRAPHY[3]`: `fs: 16px`, `lh: 22px`, `ls: 0em`, `weight: 400`
- `TYPOGRAPHY[4]`: `fs: 19px`, `lh: 26px`, `ls: -0.01em`, `weight: 500`
- `TYPOGRAPHY[5]`: `fs: 23px`, `lh: 30px`, `ls: -0.015em`, `weight: 600`
- `TYPOGRAPHY[6]`: `fs: 28px`, `lh: 36px`, `ls: -0.02em`, `weight: 600`
- `TYPOGRAPHY[7]`: `fs: 33px`, `lh: 42px`, `ls: -0.025em`, `weight: 700`
- `TYPOGRAPHY[8]`: `fs: 40px`, `lh: 50px`, `ls: -0.03em`, `weight: 700`

---

## 4. TEXT (سلسله‌مراتب نور متن)
متن سفید خالص `#ffffff` مطلقاً ممنوع است. آلفای متون بر اساس عمق بستر جبران می‌شود:
- **Primary:** `rgba(255, 255, 255, 0.88)`
- **Secondary:** `rgba(255, 255, 255, 0.62)`
- **Tertiary (Surface-compensated):**
  - S0: `0.40` | S1: `0.40` | S2: `0.43` | S3: `0.45` | S4: `0.48` | S5: `0.50`
- **Quaternary (Non-critical only):**
  - S0: `0.25` | S1: `0.25` | S2: `0.27` | S3: `0.29` | S4: `0.31` | S5: `0.33`

---

## 5. SEMANTICS & EXTENDED SPECTRUM (رنگ‌های معنایی و طیف)

### 5.1 Semantics (چهار نقش معنایی با کرومای کنترل‌شده ضد نئون)
- **SUCCESS:** Solid `#34C08B` | Text `#6EE0B4` | Subtle `rgba(52, 192, 139, 0.08)` | Border `rgba(52, 192, 139, 0.22)`
- **WARNING:** Solid `#E9B44C` | Text `#F5CE7A` | Subtle `rgba(233, 180, 76, 0.08)` | Border `rgba(233, 180, 76, 0.22)`
- **DANGER:** Solid `#E25555` | Text `#F08C8C` | Subtle `rgba(226, 85, 85, 0.08)` | Border `rgba(226, 85, 85, 0.22)`
- **INFO:** Solid `#4F8FEA` | Text `#8CC3F2` | Subtle `rgba(79, 143, 234, 0.08)` | Border `rgba(79, 143, 234, 0.22)`

### 5.2 Brand Primary
- **Brand Primary:** `#E9ECF2` (Soft White)
- **Brand On-Color:** `#060709` (Canvas)

### 5.3 Extended Spectrum (۱۲ فام کالیبره‌شده در فاصله ۳۰ درجه)
Hue 15 (Ruby `#E86575`), 45 (Amber `#E09540`), 75 (Gold `#C8B030`), 105 (Lime `#90C440`), 145 (Emerald `#3CBF7A`), 175 (Teal `#30BCA0`), 205 (Cyan `#38B8D4`), 230 (Sapphire `#509CE8`), 260 (Iris `#7C88EC`), 290 (Amethyst `#B074E4`), 320 (Magenta `#D864B8`), 350 (Rose `#E46494`).

---

## 6. GLASS = DEPRECATED / PURGED (سیستم گلس منسوخ و حذف‌شده)
شیشه‌گری سنتی (مرزهای تخت شیشه‌ای، بردرهای مات رنگی تیز، بلورهای حجیم، و فیلترهای گلس بدون قاعده) رسماً از طراحی لیمینال پاکسازی و حذف شده‌اند.
هیچ اثری از `getGlassStyle`، `GLASS_BUDGET`، یا تایپ `GlassTier` در سیستم باقی نمانده است.

---

## 7. LIMINAL MIST (سیستم مه نوری — جایگزین گلس با بودجه دقیق)
نور مانند مه در فضا منتشر می‌شود: بدون مرز تیز هندسی. حلقه بازتابی (`ringLayer`) منحصراً روی یک عنصر جداگانه مطلق با بلور ۹ الی ۱۰ پیکسل رندر می‌شود تا هیچ زاویه‌ی تیزی چشم کاربر را نیازارد.

### 7.1 فرمول‌های قفل‌شده‌ی مشخصات مه (`MIST_SPEC`)
- **Hero Mist:**
  - `ring`: `0.18`, `ringBlur`: `9px`
  - `halo1`: `0 0 44px` با آلفا `0.07`
  - `halo2`: `0 0 90px` با آلفا `0.04`
  - `caustic`: `0.06`, `whisper`: `0.048`, `shade`: `0.30`
  - `fill`: `linear-gradient(180deg, rgba(13,14,18,0.66) 0%, rgba(10,11,15,0.48) 100%)`
- **Quiet Mist:**
  - `ring`: `0.16`, `ringBlur`: `10px`
  - `halo1`: `0 0 40px` با آلفا `0.06`
  - `halo2`: `0 0 84px` با آلفا `0.035`
  - `caustic`: `0.055`, `whisper`: `0.044`, `shade`: `0.28`
  - `fill`: `linear-gradient(180deg, rgba(13,14,18,0.60) 0%, rgba(10,11,15,0.44) 100%)`

### 7.2 بودجه‌ی مصرف (Mist Budget per App)
- **Hero Mist:** دقیقاً ۱ مورد در کل برنامه (دکمه‌ی «پروژه جدید» در `DashboardPage`).
- **Quiet Mist:** منحصراً در `Alert`، `Toast` و المان‌های اعلان کلیدی.
- استفاده از مه فراتر از این بودجه نقض صریح هویت آرام لیمینال است.

---

## 8. MOTION ENGINE (موتور انیمیشن و حرکت فیزیکی)

### 8.1 زمان‌بندی‌ها (6 Durations)
- `instant`: `100ms` — فیدبک میکرو (تیک چک‌باکس، رادیو)
- `fast`: `150ms` — تعاملات سریع (هاور، فوکوس)
- `normal`: `200ms` — تغییرات حالت و فشرده شدن دکمه
- `slow`: `250ms` — ورود و خروج کوچک (تولتیپ، سوییچ توگل)
- `slower`: `350ms` — ظروف بزرگ و شناور (مدال، دراور شیت، تست لودینگ)
- `dramatic`: `500ms` — جلوه‌های نمایشی هیرو و هاله مه

### 8.2 منحنی‌های شتاب (5 Easings)
- `out`: `cubic-bezier(0.16, 1, 0.3, 1)` — ورود (شروع سریع، توقف نرم)
- `in`: `cubic-bezier(0.7, 0, 0.84, 0)` — خروج (شروع نرم، خروج پرشتاب)
- `inOut`: `cubic-bezier(0.65, 0, 0.35, 1)` — حرکت‌های رفت و برگشتی متقارن
- `spring`: `cubic-bezier(0.2, 0.8, 0.2, 1)` — فیزیک ارتجاعی امضای لیمینال
- `linear`: `linear`

### 8.3 ترانزیشن‌های آماده و پالس اسکلت
- `micro`, `fast`, `hover`, `normal`, `slow`, `enter`, `spring`, `exit`, `containerEnter`, `containerExit`, `dramatic`
- **Skeleton Pulse قفل‌شده:** `liminal-skeleton-pulse 1.6s ease-in-out infinite` بین رنگ‌های `#0A0B0F` و `#0B0C10`.

---

## 9. HOOKS (هشت هوک استاندارد رفتاری)
تمام رفتارهای رابط کاربری از طریق `LiminalHooks` پیاده‌سازی شده‌اند:
1. `useClickOutside`: ردگیری کلیک بیرون از المان برای بستن پاپ‌اور و دراور
2. `useEscapeKey`: بستن مدال‌ها با فشردن کلید Escape
3. `useFocusTrap`: به دام انداختن چرخه Tab در دیالوگ‌ها و مدال‌ها جهت دسترسی‌پذیری کامل
4. `useScrollLock`: قفل کردن اسکرول بدنه هنگام باز بودن مدال با حفظ جبران عرض پدینگ
5. `useMediaQuery`: شنونده سازگار با رندر سمت سرور برای کوئری‌های مدیا
6. `useReducedMotion`: تشخیص تنظیمات دسترسی‌پذیری کاهش حرکت کاربر (`prefers-reduced-motion`)
7. `useRovingTabIndex`: ناوبری استاندارد کیبورد در تب‌ها و لیست‌های منو با کلیدهای جهتی
8. `usePrevious`: نگهداری مقدار مرحله‌ی قبلی برای انیمیشن‌های تطبیقی

---

## 10. PORTAL & POSITIONING (موتور موقعیت‌یابی پورتال)

### 10.1 دوازده موقعیت استاندارد (12 Placements)
- بالایی: `top`, `top-start`, `top-end`
- پایینی: `bottom`, `bottom-start`, `bottom-end`
- چپی: `left`, `left-start`, `left-end`
- راستی: `right`, `right-start`, `right-end`

### 10.2 هوش برخورد (Collision Handling)
- `flip`: چرخش خودکار ۱۸۰ درجه هنگام برخورد به لبه‌های دیدگاه (Viewport)
- `shift`: لغزش نرم برای جلوگیری از برش خوردن المان از کادر صفحه
- `LiminalPortal`: رندر مستقیم در انتهای تگ `<body>` جهت پرهیز از تداخل `z-index` و `overflow: hidden`.

---

## 11. ICONS (آیکون‌های استاندارد)
انحصاراً از آیکون‌های Phosphor با وزن `light` (ضخامت خط ۱.۵ پیکسل) و کامپوننت `LiminalIcon`:
- `xs`: `12px` (تگ‌ها، بیدج‌ها، چک‌باکس‌ها)
- `sm`: `16px` (دکمه‌های فشرده، نوبار، سایدبار)
- `md`: `20px` (پیش‌فرض کنترل‌ها، هدر پنل‌ها)
- `lg`: `24px` (سربرگ کارت‌ها، اکشن‌های اصلی)
- `xl`: `32px` (حالت‌های خالی EmptyState، صفحات خطا)

---

## 12. HARD RULES (چک‌لیست قوانین سخت)
- [x] گرادیان‌های لبه (Rim) فقط بر اساس نردبان رنگی، بدون بردرهای سفید یا بیرونی تخت.
- [x] سایه‌ها منحصراً زیر-بوم (`S-1` و `S-2`) برای عناصر شناور و کارت‌های شاخص.
- [x] تغییر ترانزیشن‌ها بدون استثنا از طریق `LiminalMotionEngine`.
- [x] یکدستی فوکوس رینگ با `getFocusRing` (۲ پیکسل خط ممتد با آفست ۲ پیکسل).
- [x] رعایت سقف بودجه مه (دقیقاً ۱ مورد هیرو در کل برنامه).
- [x] حمایت کامل از `prefers-reduced-motion` در تمامی انیمیشن‌های ورود و خروج.
- [x] عدم استفاده از رنگ سفید خالص برای تایپوگرافی.
