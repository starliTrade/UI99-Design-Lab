/**
 * LIMINAL · DOCS — ONE COMPONENT
 *
 * The page a reviewer opens. It is the studio, focused on one component, with
 * the component's own facts above it: what the system expects, what it has, and
 * what the reviewer should look at with their eyes rather than with the panel.
 *
 * There is no second implementation of the preview. The studio IS the
 * workbench; a docs page with its own copy would drift from the tool, and the
 * tool is the thing that gets used.
 */
import React from 'react';
import { Studio } from '../../studio/Studio';
import { FIXTURES, coverage } from '../../components/__matrix__/fixtures';
import { Section, Prose, Value, Stat, MONO, S, R } from '../ui';
import { resolveSurface } from '../../engine/liminal-surface';

const pct = (n: number) => Math.round(n * 100);

/** What a reviewer should check by eye. Not a checklist for the machine. */
function EyeNotes({ name }: { name: string }) {
  const f = FIXTURES.find((x) => x.name === name);
  if (!f) return null;
  const notes: string[] = [];
  if (!f.sizes.length) notes.push('اندازه ندارد — اگر کنترلی است، باید داشته باشد');
  if (!f.variants?.length) notes.push('واریانت ندارد');
  const missing = f.expected.filter((s) => !f.states.includes(s));
  if (missing.length) notes.push(`حالتِ گمشده: ${missing.join(' · ')}`);
  if (!notes.length) notes.push('ساختارش کامل است — با چشم بسنج');
  return (
    <ul style={{ margin: 0, paddingInlineStart: `${S[4]}px`, fontSize: 12, lineHeight: 2, opacity: 0.85 }}>
      {notes.map((n, i) => (
        <li key={i}>{n}</li>
      ))}
    </ul>
  );
}

export function ComponentPage({ name }: { name: string }) {
  const f = FIXTURES.find((x) => x.name === name);
  if (!f) {
    return (
      <Section title="پیدا نشد" note={name} role="work">
        <Prose>این کامپوننت در جدولِ fixture نیست — پس استودیو و ماتریس و a11y sweep هم نمی‌شناسندش.</Prose>
      </Section>
    );
  }
  const c = pct(coverage(f));
  const missing = f.expected.filter((s) => !f.states.includes(s));
  const declared = resolveSurface({ role: 'work', interactive: false });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <Section title={f.name} note={`${f.group} — ${c}% پوشش`} role="work">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: `${S[4]}px` }}>
          <Stat value={String(f.states.length)} label="حالت" />
          <Stat value={String(f.sizes.length)} label="اندازه" />
          <Stat value={String(f.variants?.length ?? 0)} label="واریانت" />
          <Stat value={String(missing.length)} label="حالتِ گمشده" tone={missing.length ? 'warn' : undefined} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Value label="حالت‌ها" value={f.states.join(' · ')} />
          <Value label="سیستم انتظار دارد" value={f.expected.join(' · ') || '—'} />
          <Value label="اندازه‌ها" value={f.sizes.join(' · ') || '—'} />
          <Value label="واریانت‌ها" value={f.variants?.join(' · ') || '—'} />
        </div>
        <Prose>
          <b>چشم:</b>
        </Prose>
        <EyeNotes name={f.name} />
      </Section>

      {/* The workbench. Same component the studio renders. */}
      <Studio initial={f.name} />

      <Section title="جدولِ fixture" note="یک ردیف — و استودیو، ماتریس و a11y sweep خودکار می‌گیرندش">
        <Prose>
          افزودن یک کامپوننت یعنی افزودن یک ردیف به{' '}
          <code style={{ fontFamily: MONO }}>src/components/__matrix__/fixtures.tsx</code>. نه سه جا.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[2]}px`, flexWrap: 'wrap' }}>
          <span style={{ ...declared.style, padding: `${S[1]}px ${S[2]}px`, borderRadius: `${R.chip}px`, fontSize: 11 }}>
            {f.name}
          </span>
        </div>
      </Section>
    </div>
  );
}
