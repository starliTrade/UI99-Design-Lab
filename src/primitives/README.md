# LIMINAL Primitives — رفتار بدون ظاهر

> **پریمیتیو رنگ ندارد، سایه ندارد، فقط رفتار و دسترسی دارد.**

## چرا پریمیتیو جدا؟

کامپوننت = پریمیتیو + موتور

```
Button = ButtonPrimitive (رفتار) + resolveSurface({role:'control'}) (ظاهر)
Dialog = DialogPrimitive (رفتار) + resolveSurface({role:'modal'}) (ظاهر)
```

اگر رفتار و ظاهر قاطی شوند:
- a11y وصله‌ای می‌شود
- RTL فراموش می‌شود
- هر کامپوننت `onKeyDown` خودش را می‌نویسد و یکی جا می‌ماند

## ۶ پریمیتیو فاز ۱

| پریمیتیو | کار | a11y |
|---|---|---|
| Slot + asChild | ترکیب `className, style, onClick` با `defaultPrevented` | — |
| FocusScope + VisuallyHidden | فوکوس محبوس + متن فقط برای صفحه‌خوان | `focus-visible`, `aria-hidden` |
| Portal + DismissableLayer | پورتال + بستن با Escape/کلیک بیرون | `aria-modal`, `inert` |
| Roving Focus | فوکوس چرخشی با Arrow | `roving tabindex` |
| Field primitives | `Field, Label, Description, Error` | `aria-invalid, aria-describedby` |
| Collection | لیست قابل انتخاب | `aria-selected` |

## قانون پریمیتیو

- هیچ `background, border, shadow, color` — فقط `role, aria-*, tabIndex`
- فقط `logical properties` — `insetInlineStart` نه `left`
- هر `id` با `useId` — نه ثابت
- `value` + `defaultValue` — controlled/uncontrolled کامل
- `asChild` همه‌جا — `Button asChild` → `a`, `Link`

## فعلاً — خالی

فاز ۱ — بعد از فاز ۰ (زیرساخت).
