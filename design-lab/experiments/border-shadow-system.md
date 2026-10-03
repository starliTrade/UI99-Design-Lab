# UI99 Border × Shadow System — Experimental Specification

**Status:** Experimental / Not Locked  
**Sprint:** 02  
**Principle:** Separation First — Decoration Never

---

## 1. هدف

سیستم Border × Shadow باید از رابطهٔ واقعی بین سطح یک component و context/parent آن تصمیم بگیرد:

- آیا component اصلاً به separation اضافی نیاز دارد؟
- اگر نیاز دارد، **Border** کافی است؟
- آیا **Shadow** لازم است؟
- آیا هر دو لازم‌اند؟
- اگر لازم‌اند، شدت آن‌ها چقدر باشد؟

Border و Shadow دو ابزار مستقل‌اند:

- **Border = Edge Separation** — وضوح مرز
- **Shadow = Depth Separation** — انتقال عمق/ارتفاع

نباید هر component به صورت پیش‌فرض Border + Shadow دریافت کند.

---

## 2. ورودی‌های سیستم

### 2.1 Color Context

- Context / Parent surface
- Component surface

از این دو مقدار محاسبه می‌شود:

`ΔL = |L_surface - L_context|`

که `L` در این prototype، relative luminance از sRGB است.

### 2.2 Normalized Separation

`Separation = ΔL / (L_surface + L_context + ε)`

هدف این normalization این است که فاصلهٔ خام luminance در محدوده‌های بسیار تاریک بیش از حد کوچک یا بزرگ تفسیر نشود.

### 2.3 Component Role

نقش component روی نیاز به edge/depth اثر دارد:

- Canvas / Base
- Card / Surface
- Nested Panel
- Control
- Floating Surface
- Modal

Role یک ضریب context است، نه یک دستور ثابت برای Border یا Shadow.

### 2.4 Elevation

Elevation یک ورودی مستقل برای Shadow است.

در prototype:

`elevation ∈ [0, 6]`

این بازه صرفاً فضای آزمایشی است و هنوز token نهایی UI99 نیست.

---

## 3. Border Engine

### 3.1 فلسفه

Border برای ساختن **edge clarity** است، نه برای ساختن elevation.

اگر fill خودش مرز component را به اندازهٔ کافی مشخص کند، Border باید حذف شود.

### 3.2 مدل فعلی

`BorderNeed = clamp(EdgeNeed(role) × RoleFactor(role) × (1 − Separation), 0, 1)`

سپس:

`Border ON ↔ BorderNeed >= 0.28`

**0.28 در این نسخه threshold آزمایشی است، نه مقدار قفل‌شده.**

### 3.3 Border Strength

`BorderWidth = clamp(0.50 + 1.15 × BorderNeed, 0.50, 1.50)`

وقتی Border خاموش است:

`BorderWidth = 0`

### 3.4 Border Polarity

Border باید با polarity سطح سازگار باشد.

اگر:

`L_surface > L_context`

مرز می‌تواند به سمت context تیره‌تر شود.

اگر:

`L_surface < L_context`

مرز باید به صورت آزمایشی به سمت lightness بالاتر حرکت کند.

هدف:

> Border باید boundary را مشخص کند، نه اینکه خودش به یک عنصر بصری غالب تبدیل شود.

---

## 4. Shadow Engine

### 4.1 فلسفه

Shadow برای **depth communication** است.

Shadow نباید صرفاً چون component «کارت» نامیده شده فعال شود.

### 4.2 مدل فعلی

`ShadowNeed = clamp(DepthNeed(role) × (Elevation / 6 + 0.18) × (1 − 0.72 × Separation), 0, 1)`

Shadow زمانی فعال می‌شود که:

- `ShadowNeed >= 0.28`
- و `Elevation > 0`

### 4.3 Shadow Parameters

فعلاً:

`Alpha = 0.06 + 0.20 × ShadowNeed`

`Blur = 8 + 32 × (Elevation / 6) × (0.7 + 0.3 × ShadowNeed)`

`Y = 2 + 16 × (Elevation / 6)`

`Spread = −max(1, Blur × 0.42)`

این‌ها **empirical prototype parameters** هستند و هنوز ادعای فیزیکی بودن ندارند.

---

## 5. Combined Decision

Decision Engine چهار خروجی ممکن دارد:

### NONE

وقتی separation فعلی برای نقش component کافی است.

### BORDER ONLY

وقتی edge clarity مسئلهٔ اصلی است و shadow اطلاعات جدیدی اضافه نمی‌کند.

### SHADOW ONLY

وقتی component باید elevated/floating خوانده شود و fill/geometry مرز کافی دارد.

### BORDER + SHADOW

وقتی:

- edge clarity هنوز نیازمند reinforcement است،
- depth نیز نیازمند reinforcement است،
- و separation فعلی آن‌قدر زیاد نیست که یکی از دو مکانیزم را زائد کند.

هدف این حالت «زیباتر کردن component» نیست؛ هدف انتقال دو نوع اطلاعات متفاوت است.

---

## 6. Minimum Effective Separation

اصل اصلی UI99:

`Minimum Effective Separation = Minimum visual mechanism that communicates maximum structural information.`

بنابراین ترتیب تصمیم:

`Surface Separation → Edge Need → Border`

و به صورت مستقل:

`Surface Separation → Depth Need → Shadow`

نه:

`Component → Border + Shadow`

---

## 7. Role Model

| Role | Border tendency | Shadow tendency |
|---|---:|---:|
| Canvas | بسیار کم | صفر |
| Card | متوسط | متوسط |
| Nested Panel | متوسط/بالا | کم/متوسط |
| Control | بالا | کم |
| Floating | کم/متوسط | بالا |
| Modal | کم/متوسط | بسیار بالا |

این جدول **semantic prior** است، نه token نهایی.

مقادیر عددی باید بعداً از آزمایش‌های چند-context استخراج شوند.

---

## 8. چه چیزهایی فعلاً ادعا نمی‌شوند؟

این prototype فعلاً ادعا نمی‌کند که:

- threshold = 0.28 استاندارد جهانی است.
- shadow با inverse-square physics واقعی مدل شده است.
- یک alpha مشخص برای همهٔ نمایشگرها و شرایط ambient بهینه است.
- یک border width مشخص در تمام componentها درست است.
- luminance به تنهایی تمام ادراک depth را توضیح می‌دهد.

این‌ها hypothesisهای قابل آزمایش‌اند.

---

## 9. Evidence Protocol

هر تغییر در فرمول باید حداقل در این contextها آزمایش شود:

1. Canvas → Card
2. Card → Nested Panel
3. Card → Control
4. Canvas → Floating Surface
5. Canvas → Modal
6. Darker surface on lighter context
7. Lighter surface on darker context
8. Very-low-separation pair
9. High-separation pair

برای هر case ثبت شود:

- Context color
- Surface color
- Relative luminance
- ΔL
- Contrast ratio
- BorderNeed
- ShadowNeed
- Decision
- Border width
- Border polarity
- Shadow alpha
- Blur
- Y
- Spread
- Perceived edge clarity
- Perceived depth clarity
- Visual noise
- Nested coherence

---

## 10. Lock Criteria

هیچ threshold یا formulaای وارد `masterEngine.ts` نمی‌شود مگر اینکه:

### Mathematical Gate
- deterministic
- bounded
- monotonic where expected
- no invalid states

### Perceptual Gate
- edge/depth distinction remains visible
- no unnecessary decoration
- no accidental hierarchy
- acceptable visual noise

### Context Gate
- survives multiple component roles
- survives multiple luminance relationships
- survives nesting

### Implementation Gate
- pure function possible
- unit tests possible
- regression cases documented

---

## 11. Current Status

**Border system:** experimental  
**Shadow system:** experimental  
**Decision threshold:** experimental  
**Role coefficients:** experimental  
**Shadow parameters:** experimental  
**Production tokens:** not locked

Next evidence target:

**Sprint 02A — Threshold Extraction**

هدف این مرحله پیدا کردن آستانه‌های واقعی برای:

`BorderNeed`

`ShadowNeed`

و بررسی اینکه آیا threshold ثابت مناسب است یا باید تابعی از:

`ΔL + role + elevation + component size + ambient contrast`

باشد.

---

## 12. Core Rule

> اگر Surface خودش hierarchy را منتقل می‌کند، decoration اضافه نکن.

> اگر Edge نیاز به وضوح دارد، Border اضافه کن.

> اگر Depth نیاز به وضوح دارد، Shadow اضافه کن.

> اگر هر دو اطلاعات جدید می‌دهند، هر دو را استفاده کن.

> اگر هیچ‌کدام اطلاعات جدید نمی‌دهند، هیچ‌کدام را استفاده نکن.

**SEPARATION FIRST — DECORATION NEVER**
