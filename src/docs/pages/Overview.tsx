/**
 * LIMINAL · DOCS — OVERVIEW
 *
 * The first page answers one question: what is this, and what does it claim?
 * Every number here is read from the engine at render time — not typed into a
 * paragraph where it can quietly go stale.
 */
import React from 'react';
import { FIXTURES, coverage } from '../../components/__matrix__/fixtures';
import { LADDER, getTextStyle } from '../../engine/spec-engine';
import { ROLE_LEVEL, ROLE_RIM, ROLE_SHADOW } from '../../engine/liminal-surface';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { Section, Stat, Value, Prose, Code, MONO, S, R } from '../ui';

const ROLES = Object.keys(ROLE_LEVEL) as (keyof typeof ROLE_LEVEL)[];

export function OverviewPage({ go }: { go: (name: string) => void }) {
  const avg = Math.round((FIXTURES.reduce((a, f) => a + coverage(f), 0) / FIXTURES.length) * 100);
  const complete = FIXTURES.filter((f) => coverage(f) === 1).length;
  const incomplete = FIXTURES.length - complete;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <Section title="LIMINAL" note="سیستم طراحیِ ریاضی‌محورِ تاریک — با موتور، نه با فایلِ توکن" role="work">
        <Prose>
          این یک کتابخانهٔ کامپوننت نیست که یک فایل CSS داشته باشد. یک <b>موتور</b> است: هر سطح، هر
          لبه، هر رنگ و هر فاصله از یک قاعده می‌آید — و قاعده در تست نوشته شده. کامپوننت‌ها چیزی
          انتخاب نمی‌کنند؛ اعلام می‌کنند که <b>چه هستند</b> و موتور تصمیم می‌گیرد.
        </Prose>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: `${S[4]}px` }}>
          <Stat value={String(ROLES.length)} label="نقش در سلسله‌مراتب" />
          <Stat value={String(LADDER.length)} label="پلهٔ نردبان" />
          <Stat value={String(FIXTURES.length)} label="کامپوننت در ماتریس" />
          <Stat value={`${avg}%`} label="میانگین پوشش" tone={avg < 100 ? 'warn' : undefined} />
          <Stat value={String(incomplete)} label="کامپوننتِ ناقص" tone={incomplete ? 'warn' : undefined} />
          <Stat value={String(LiminalColorEngine.EXTENDED_SPECTRUM.length)} label="هیوی گسترده" />
        </div>
      </Section>

      <Section title="سلسله‌مراتب" note="یک عدد، یک معنا — عمق نسبت به بوم">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: 'start', opacity: 0.65 }}>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>نقش</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>سطح</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>ریم</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>سایه</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>رنگ</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={{ padding: `${S[1]}px ${S[2]}px` }}>
                    <code style={{ fontFamily: MONO }}>{role}</code>
                  </td>
                  <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>S{ROLE_LEVEL[role]}</td>
                  <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{ROLE_RIM[role]}</td>
                  <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>
                    {ROLE_SHADOW[role] === null ? '—' : `E${ROLE_SHADOW[role]}`}
                  </td>
                  <td style={{ padding: `${S[1]}px ${S[2]}px` }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 34,
                        height: 16,
                        borderRadius: `${R.chip}px`,
                        background: LADDER[ROLE_LEVEL[role]],
                        border: '1px solid rgba(255,255,255,0.08)',
                        verticalAlign: 'middle',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Prose>
          یک کامپوننت <b>نقش</b> اعلام می‌کند، نه پله. دو کامپوننت که یک نقش را اعلام کنند نمی‌توانند
          سرِ عمق اختلاف داشته باشند — و این همان چیزی است که یک عددِ دستی نمی‌تواند تضمین کند.
        </Prose>
      </Section>

      <Section title="قاعده‌ای که همه‌چیز از آن می‌آید" note="یک جمله، و هفت نگهبان که اجرایش می‌کنند">
        <Prose>
          <b>مقدار → توکن. انتخاب → نام. عدد خام → ممنوع.</b>
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Value label="نردبان" value={`${LADDER.length} پله، ΔL ثابت`} />
          <Value label="متن" value="آلفاها از کفِ کاربردِ اعلام‌شده مشتق می‌شوند" />
          <Value label="سطح" value="resolveSurface({ role }) — تنها راه" />
          <Value label="تعامل" value="resolveInteractionVars — شش متغیر، یک تولیدکننده" />
          <Value label="تم" value="createLiminalTheme — سه عدد" />
        </div>
        <Prose>
          و هفت نگهبان که هرکدام یک الگو را ممنوع می‌کنند: عدد خام · hex در style · resolver بازنشسته ·
          opt-in بدون تولیدکننده · سطحِ خام به‌عنوان prop · رنگِ پخته در style · نقض axe.
        </Prose>
      </Section>

      <Section title="وضعیت کامپوننت‌ها" note="اندازه‌گیری، نه ادعا">
        <Prose>
          موتور کامل است. کامپوننت‌ها نه — و دلیلش روشن است: آن‌ها را <b>قبل از</b> تمام‌شدن موتور
          نوشتیم. این جدول همان فاصله را نشان می‌دهد.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[2]}px`, flexWrap: 'wrap' }}>
          {FIXTURES.map((f) => {
            const c = Math.round(coverage(f) * 100);
            const missing = f.expected.filter((s) => !f.states.includes(s));
            return (
              <button
                key={f.name}
                type="button"
                onClick={() => go(f.name)}
                style={{
                  font: 'inherit',
                  fontSize: 11,
                  padding: `${S[1]}px ${S[2]}px`,
                  borderRadius: `${R.chip}px`,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent',
                  color: missing.length ? 'var(--liminal-danger, #ba4646)' : 'inherit',
                  opacity: c === 100 ? 0.75 : 1,
                  cursor: 'pointer',
                }}
              >
                {f.name} <code style={{ fontFamily: MONO, opacity: 0.7 }}>{c}%</code>
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
