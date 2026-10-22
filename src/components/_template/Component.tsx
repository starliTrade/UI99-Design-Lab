/**
 * LIMINAL — Component Template (صفر مطلق)
 *
 * این قالبِ هر کامپوننت جدید است.
 * ۱. نقش (role) را از موتور بگیر — نه عدد
 * ۲. میزبان (host) را از context بخوان
 * ۳. سطح را از موتور حل کن — نه دستی
 * ۴. هیچ hex, rgba, عدد دستی — فقط توکن
 *
 * چرخه: ایده → تست چشمی → سیاست → قانون → موتور → کامپوننت → تست → ممیزی → ثبت
 */

import React from 'react';
import {
  resolveSurface,
  resolveBorder,
  // getDirectionalRim,
  // floatShadow,
} from '../../engine/liminal-surface';
import { useHostSurface } from '../../engine/liminal-surface-context';
// import { getTextStyle } from '../../engine/spec-engine';
// import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';

// ۱. نقش — از موتور، نه حدس
// ROLE_LEVEL: canvas(0) chrome(1) work(2) panel(3) control(4) menu(5) popover(6) modal(7) toast(8) well(2)
type TemplateRole = 'control'; // ← هر کامپوننت نقش خودش را اینجا می‌گوید
type TemplateSize = 'sm' | 'md' | 'lg';
type TemplateVariant = 'primary' | 'secondary' | 'ghost';

// ۲. پراپ‌ها — فقط نام، نه رنگ
interface TemplateProps extends React.HTMLAttributes<HTMLDivElement> {
  role?: TemplateRole;
  size?: TemplateSize;
  variant?: TemplateVariant;
  disabled?: boolean;
}

/**
 * TEMPLATE — کامپوننت نمونه
 *
 * این کامپوننت هیچ چیز را نشان نمی‌دهد — فقط نشان می‌دهد
 * «یک کامپوننت درست چطور از موتور می‌خواند».
 */
export function Template({
  role = 'control',
  size = 'md',
  variant = 'primary',
  disabled = false,
  children,
  style,
  ...props
}: TemplateProps) {
  // ۳. میزبان را بخوان — از context، نه حدس
  const host = useHostSurface(); // پیش‌فرض: canvas اگر provider نباشد

  // ۴. سطح را حل کن — از موتور
  const surface = resolveSurface({
    role,
    // on: host, // وقتی host context کامل شد
    state: disabled ? 'disabled' : 'idle',
  });

  // ۵. مرز را حل کن — از موتور
  const border = resolveBorder({ role }); // the role's default border (borderKindFor)

  // ۶. استایل — فقط از موتور
  const cssVars = {
    // ...surface.cssVars — وقتی موتور کامل شد
    // borderColor: border,
  } as React.CSSProperties;

  return (
    <div
      data-liminal-component="template"
      data-role={role}
      data-size={size}
      data-variant={variant}
      data-state={disabled ? 'disabled' : 'idle'}
      // data-level={surface.level} — وقتی موتور کامل شد
      style={{ ...cssVars, ...style }}
      aria-disabled={disabled || undefined}
      {...props}
    >
      {/* children — محتوای واقعی */}
      {children ?? (
        <span>
          role={role} size={size} variant={variant}
          {/* level={surface.level} */}
          border={border}
        </span>
      )}
    </div>
  );
}

// ۷. ثبت در فیوچر — هر کامپوننت یک سطر
// src/components/__matrix__/fixtures.tsx:
// { name: 'Template', group: 'Atoms', role: 'control', sizes: ['sm','md','lg'], states: ['idle','hover','focus','active','disabled'], variants: ['primary','secondary','ghost'] }
