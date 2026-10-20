/**
 * LIMINAL — FIXTURE MATRIX (صفر مطلق — ۲۰۲۶-۱۰-۲۰)
 *
 * این تنها منبع حقیقت است.
 * سایت، استودیو، تست‌های a11y، تست‌های visual، همه از اینجا می‌خوانند.
 * کامپوننتی که اینجا نیست، وجود ندارد.
 *
 * هر سطر = یک کامپوننت + نقشش + سایزها + حالت‌ها + واریانت‌ها
 * هر فاز، سطرهای خودش را اضافه می‌کند.
 */

export interface FixtureDef {
  name: string;
  group: 'Atoms' | 'Inputs' | 'Containers' | 'Data' | 'Nav' | 'Feedback' | 'Layout' | 'Composites' | 'Patterns';
  role: string; // SurfaceRole — از موتور
  sizes: string[];
  states: string[];
  variants: string[];
  /** آیا این کامپوننت باید روی هر میزبان تست شود؟ (control, well, region) */
  hostAware?: boolean;
}

// ──────────────────────────────────────────────────────────────
// صفر مطلق — هیچ کامپوننتی وجود ندارد
// هر فاز، سطرهای خودش را اینجا اضافه می‌کند
// ──────────────────────────────────────────────────────────────

export const FIXTURES: FixtureDef[] = [
  // فاز ۲ — اتم‌ها (۸)
  // { name: 'Button', group: 'Atoms', role: 'control', sizes: ['sm','md','lg'], states: ['idle','hover','focus','active','disabled'], variants: ['primary','secondary','ghost','danger','outline','link'], hostAware: true },
  // { name: 'Badge', group: 'Atoms', role: 'control', sizes: ['sm','md','lg'], states: ['idle'], variants: ['default','success','warning','danger'] },
  // { name: 'Tag', group: 'Atoms', role: 'control', sizes: ['sm','md'], states: ['idle'], variants: ['default','outline'] },
  // { name: 'Kbd', group: 'Atoms', role: 'control', sizes: ['sm','md'], states: ['idle'], variants: ['default'] },
  // { name: 'Spinner', group: 'Atoms', role: 'control', sizes: ['sm','md','lg'], states: ['idle'], variants: ['default'] },
  // { name: 'Typography', group: 'Atoms', role: 'control', sizes: [], states: [], variants: [] },
  // { name: 'Mist', group: 'Atoms', role: 'panel', sizes: [], states: [], variants: ['mist','glass'] },
  // { name: 'Marker', group: 'Atoms', role: 'control', sizes: ['sm','md'], states: ['idle'], variants: ['dot','number'] },

  // فاز ۳ — ورودی‌ها + کانتینرها (۱۸)
  // فاز ۴ — داده + ناوبری + فیدبک (۲۲)
  // فاز ۵ — الگوها + چیدمان (۱۰)
  // فاز ۶ — اکوسیستم (۴)
];

// ──────────────────────────────────────────────────────────────
// آمار — از روی همین جدول حساب می‌شود، نه دستی
// ──────────────────────────────────────────────────────────────
export function fixtureStats() {
  return {
    total: FIXTURES.length,
    byGroup: Object.fromEntries(
      [...new Set(FIXTURES.map((f) => f.group))].map((g) => [g, FIXTURES.filter((f) => f.group === g).length])
    ),
    // هر فاز چند تا اضافه می‌کند
    phase2: FIXTURES.filter((f) => f.group === 'Atoms').length, // هدف: ۸
    phase3: FIXTURES.filter((f) => ['Inputs', 'Containers'].includes(f.group)).length, // هدف: ۱۸
    phase4: FIXTURES.filter((f) => ['Data', 'Nav', 'Feedback'].includes(f.group)).length, // هدف: ۲۲
    phase5: FIXTURES.filter((f) => ['Layout', 'Composites', 'Patterns'].includes(f.group)).length, // هدف: ۱۰+
  };
}
