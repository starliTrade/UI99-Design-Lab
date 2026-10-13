/**
 * LIMINAL · DOCS — THE CONTRACT
 *
 * The rules, and the guard that holds each one. A rule without a guard is a
 * habit: this project has already watched a defect appear seven times, so every
 * rule here names the test that fails when it is broken.
 *
 * The checks below are computed live, from the same engine the components use.
 */
import React from 'react';
import { LADDER } from '../../engine/spec-engine';
import { PERCEPTUAL_QUANTUM, FOCUS_RING_COLOR } from '../../engine/liminal-ladder';
import { oklchLightness, contrastRatioHex } from '../../engine/liminal-color-math';
import { deriveTextToken, TEXT_ROLE_SPEC, type TextRole } from '../../engine/liminal-contrast';
import { ROLE_LEVEL } from '../../engine/liminal-surface';
import { Section, Prose, Value, Stat, MONO, S } from '../ui';
import { useTheme } from '../theme';

const ROLES: TextRole[] = ['primary', 'secondary', 'tertiary', 'quaternary'];

interface Rule {
  rule: string;
  why: string;
  guard: string;
}

const RULES: Rule[] = [
  {
    rule: 'مقدار → توکن. انتخاب → نام. عدد خام → ممنوع.',
    why: 'عددی که در کامپوننت نوشته شود، از قرارداد جدا می‌افتد و هیچ تستی نمی‌تواند بگوید درست است یا نه.',
    guard: 'no-raw-numbers.test.ts',
  },
  {
    rule: 'یک resolver برای سطح.',
    why: 'دو resolver سرِ یک عمق اختلاف داشتند: یکی ریمِ ۱ می‌کشید و دیگری ریمِ ۲. کامپوننت می‌توانست هرکدام را انتخاب کند.',
    guard: 'one-resolver.test.ts',
  },
  {
    rule: 'شش متغیر تعامل، یک تولیدکننده.',
    why: 'کامپوننتی که خودش می‌سازد می‌تواند مقدار hover را منتشر کند و idle را فراموش کند — یا background را inline بگذارد و قاعده را لغو کند.',
    guard: 'interaction-vars.test.ts',
  },
  {
    rule: 'سطح، متغیر است؛ hex پخته ممنوع.',
    why: 'مه از LADDER[level] ساخته می‌شد، پس صفحهٔ تم‌شده مهی داشت که تم را نادیده می‌گرفت.',
    guard: 'theme-reach.test.ts',
  },
  {
    rule: 'آلفای متن مشتق می‌شود، نه انتخاب.',
    why: 'tertiary با دست ۳٫۷:۱ بود در حالی که متنِ ۱۲٫۵px است. حالا کف از کاربردِ اعلام‌شده می‌آید و سخت‌گیرترین عدسی برنده است.',
    guard: 'contrast.test.ts',
  },
  {
    rule: 'هر کامپوننت باید در جدولِ fixture باشد.',
    why: 'استودیو، ماتریس و a11y sweep از همان جدول می‌خوانند. کامپوننتی که در آن نباشد، از هیچ‌کدام عبور نمی‌کند.',
    guard: 'a11y-sweep.test.tsx',
  },
  {
    rule: 'قرارداد از کد تولید می‌شود.',
    why: 'DESIGN-CONTRACT.md یازده بار از موتور عقب افتاد. حالا بلوک‌های عددی‌اش تولید می‌شوند.',
    guard: 'contract-md.test.ts',
  },
  {
    rule: 'هیچ کامپوننتی رنگ نردبان را در style پخته نمی‌کند.',
    why: 'یک hex جایی که یک متغیر لازم است، یعنی سطحی که تم را دنبال نمی‌کند.',
    guard: 'theme-reach.test.ts',
  },
];

function Check({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: `${S[2]}px`, minWidth: 0 }}>
      <span style={{ color: ok ? undefined : 'var(--liminal-danger, #ba4646)', fontSize: 12, flexShrink: 0 }}>
        {ok ? '✓' : '✗'}
      </span>
      <span style={{ fontSize: 12, flexShrink: 0 }}>{label}</span>
      <code style={{ fontFamily: MONO, fontSize: 11, opacity: 0.7, overflowWrap: 'anywhere' }}>{detail}</code>
    </div>
  );
}

export function ContractPage() {
  const { theme } = useTheme();

  // ── the engine's invariants, computed live ───────────────────────────────
  const steps = theme.ladder.slice(1).map((hex, i) => (oklchLightness(hex) - oklchLightness(theme.ladder[i])) / PERCEPTUAL_QUANTUM);
  const minStep = Math.min(...steps);
  const monotonic = theme.ladder.every((hex, i) => i === 0 || oklchLightness(hex) > oklchLightness(theme.ladder[i - 1]));
  const levels = Object.values(ROLE_LEVEL);
  const levelsOrdered = levels.every((l, i) => i === 0 || l >= levels[i - 1]);
  const floors = ROLES.flatMap((role) =>
    theme.ladder.map((surface) => {
      const t = deriveTextToken(role, surface);
      const spec = TEXT_ROLE_SPEC[role];
      return { role, ok: t.wcag >= spec.wcag && Math.abs(t.apca) >= spec.apca };
    }),
  );
  const floorsOk = floors.every((f) => f.ok);
  const ringOk = contrastRatioHex(FOCUS_RING_COLOR, LADDER[0]) >= 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <Section title="قرارداد" note="هر قاعده، و نگهبانی که اجرایش می‌کند" role="work">
        <Prose>
          قاعده‌ای که نگهبان ندارد، عادت است. این پروژه یک نقص را <b>هفت بار</b> دیده — پس هر قاعده
          اینجا نامِ تستی را می‌آورد که با شکستنش سرخ می‌شود.
        </Prose>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ opacity: 0.65 }}>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>قاعده</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>چرا</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>نگهبان</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map((r) => (
                <tr key={r.guard + r.rule} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: `${S[2]}px`, fontWeight: 600 }}>{r.rule}</td>
                  <td style={{ padding: `${S[2]}px`, opacity: 0.8, lineHeight: 1.9 }}>{r.why}</td>
                  <td style={{ padding: `${S[2]}px` }}>
                    <code style={{ fontFamily: MONO, fontSize: 10 }}>{r.guard}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="ناوردها — زنده" note="همین حالا، روی تمِ فعلی حساب می‌شود">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: `${S[4]}px` }}>
          <Stat value={`${minStep.toFixed(2)}q`} label="کوچک‌ترین گام" tone={minStep < 1 ? 'warn' : undefined} />
          <Stat value={floors.length ? `${floors.length}` : '0'} label="سلولِ کنتراست" />
          <Stat value={ringOk ? '✓' : '✗'} label="حلقهٔ فوکوس" tone={ringOk ? undefined : 'warn'} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Check ok={minStep >= 1} label="هر گام ≥ ۱ کوانتوم" detail={`کوچک‌ترین ${minStep.toFixed(3)}q از ${PERCEPTUAL_QUANTUM}`} />
          <Check ok={monotonic} label="نردبان صعودی است" detail={`${theme.ladder.length} پله`} />
          <Check ok={levelsOrdered} label="ترتیب نقش‌ها صعودی است" detail={`${levels.length} نقش`} />
          <Check ok={floorsOk} label="هر نقش روی هر سطح، هر دو کف را رعایت می‌کند" detail={`${floors.length} سلول`} />
          <Check ok={ringOk} label="حلقهٔ فوکوس روی بوم دیده می‌شود" detail={`${contrastRatioHex(FOCUS_RING_COLOR, LADDER[0]).toFixed(2)}:1`} />
        </div>
        {!floorsOk && (
          <Prose>
            <b style={{ color: 'var(--liminal-danger, #ba4646)' }}>سلول‌های سرخ‌شده:</b>{' '}
            {floors.filter((f) => !f.ok).map((f) => f.role).join(' · ')}
          </Prose>
        )}
      </Section>

      <Section title="و آنچه هنوز نگهبان ندارد" note="صادقانه">
        <Prose>
          بودجهٔ باندل اندازه‌گیری نشده. Storybook نیست. مستنداتِ هر کامپوننت به‌صورت جدولِ API نیست.
          و ۴۶ کامپوننت از ۴۸ هنوز اندازه و واریانتِ کامل ندارند — چون قبل از تمام‌شدن موتور نوشته
          شدند. این‌ها در رودمپ ثبت‌اند.
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Value label="بودجهٔ باندل در CI" value="ندارد" tone="warn" />
          <Value label="Storybook" value="ندارد" tone="warn" />
          <Value label="جدول API هر کامپوننت" value="ندارد" tone="warn" />
          <Value label="کامپوننت‌های کامل (اندازه + واریانت + حالت)" value="۲ از ۴۸" tone="warn" />
        </div>
      </Section>
    </div>
  );
}
