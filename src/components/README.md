# LIMINAL — قانون کامپوننت (صفر مطلق)

> **هیچ کامپوننتی عدد ندارد. همه چیز از موتور می‌آید.**

## چرخهٔ هر کامپوننت

```
ایده → تست چشمی → تحلیل → سیاست → قانون → موتور → کامپوننت → تست → ممیزی → ثبت
```

## ساختار

```
src/components/
  _template/          ← الگوی هر کامپوننت جدید — از اینجا کپی کن
    Component.tsx     ← فقط role+on+state, هیچ عدد دستی
    Component.test.tsx← ۱۰ شرط قرارداد
    index.ts
  __matrix__/
    fixtures.tsx      ← تنها منبع حقیقت — سایت، استودیو، تست‌ها همه از اینجا
  atoms/              ← فاز ۲: Button, Badge, Tag, Kbd, Spinner, Typography, Mist, Marker
  inputs/             ← فاز ۳: Input, Select, Checkbox, ...
  containers/         ← فاز ۳: Card, Panel, Modal, Popover, ...
  data/               ← فاز ۴: Table, Chart, Calendar, ...
  nav/                ← فاز ۴: Tabs, Sidebar, CommandPalette, ...
  feedback/           ← فاز ۴: Alert, Toast, Tooltip, ...
  layout/             ← فاز ۵: AppShell, Grid, Stack, ...
  composites/         ← فاز ۵: Form, EmptyState, ...
  patterns/           ← فاز ۵: Blocks — ۵ صفحه کامل
```

## قانون طلایی

```tsx
// ✗ ممنوع — عدد دستی
<div style={{ background: '#0b0d0f', padding: 12, borderRadius: 8 }} />

// ✓ درست — از موتور
const host = useHostSurface(); // S2
const s = resolveSurface({ role: 'control', on: host, state });
const border = resolveBorder({ role: 'control', kind: 'edge' });
const rim = getDirectionalRim(s.level, true);
```

## ۱۰ شرط قرارداد (هر کامپوننت باید ۱۰/۱۰)

| # | شرط | گارد | آستانه |
|---|---|---|---|
| ۱ | ROLE نه level | `no-raw-numbers` | هیچ `LADDER[` در کامپوننت |
| ۲ | SIZE از توکن | `tokens.test.ts` | `CONTROL[size]` |
| ۳ | STATE روی مرز | `perceptual-boundary` | `0.4q ≤ ΔL ≤ 1.0q` |
| ۴ | VARIANT نام‌دار | `contract` | `primary` نه `blue` |
| ۵ | فقط توکن | ESLint | هیچ `hex, rgba, #` |
| ۶ | a11y | `a11y-sweep` | axe ۰ نقض |
| ۷ | RTL | `direction-rtl` | فقط logical props |
| ۸ | در فیوچر | `fixtures.tsx` | یک سطر |
| ۹ | تست دارد | `coverage` | render+behavior+contrast+axe |
| ۱۰ | visual | `visual-regression` | اسکرین‌شات هر state |

## ساخت کامپوننت جدید

```bash
bun scaffold Button control    # نقش control
bun scaffold Card panel        # نقش panel
bun scaffold Table panel       # نقش panel
```

این دستور:
- `src/components/<group>/<Name>/` را می‌سازد
- `fixtures.tsx` را اضافه می‌کند
- `COMPONENT-CONTRACT.md` چک‌لیست را پر می‌کند
- تست‌های ۱۰ شرط را می‌سازد

## فعلاً — صفر مطلق

```
src/components/ — خالی (فاز ۰)
src/primitives/ — خالی (فاز ۱)
```

اولین کامپوننت: **Button** — فاز ۲.۱ — به‌عنوان اثبات چرخه.
