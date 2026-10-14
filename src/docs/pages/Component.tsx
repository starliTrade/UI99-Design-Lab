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

/**
 * What a reviewer should check by eye. Not a checklist for the machine.
 *
 * `size` and `variant` are CONTROL criteria. Telling a reviewer that a Popover
 * "needs sizes" is telling them to ask for a prop with no meaning — the same
 * bluntness the standard check had, and the same fix: ask what the thing IS.
 */
function EyeNotes({ name }: { name: string }) {
  const f = FIXTURES.find((x) => x.name === name);
  if (!f) return null;
  const control = f.kind === 'input' || f.kind === 'action';
  const notes: string[] = [];
  if (control && !f.sizes.length) notes.push('No sizes — a control needs them');
  if (control && !f.variants?.length) notes.push('No variants');
  if (f.kind === 'input' && !f.states.includes('error')) notes.push('No error state — an input that validates needs one');
  const missing = f.expected.filter((s) => !f.states.includes(s));
  if (missing.length) notes.push(`Missing states: ${missing.join(' · ')}`);
  if (!notes.length) notes.push('Structurally complete — judge it by eye');
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
      <Section title="Not found" note={name} role="panel">
        <Prose>This component is not in the fixture table — so the studio, the matrix and the a11y sweep do not know it either.</Prose>
      </Section>
    );
  }
  const c = pct(coverage(f));
  const missing = f.expected.filter((s) => !f.states.includes(s));
  const declared = resolveSurface({ role: 'work', interactive: false });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <Section title={f.name} note={`${f.group} — ${c}% coverage`} role="panel">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: `${S[4]}px` }}>
          <Stat value={String(f.states.length)} label="States" />
          <Stat value={String(f.sizes.length)} label="Sizes" />
          <Stat value={String(f.variants?.length ?? 0)} label="Variants" />
          <Stat value={String(missing.length)} label="Missing states" tone={missing.length ? 'warn' : undefined} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Value label="States" value={f.states.join(' · ')} />
          <Value label="Expected" value={f.expected.join(' · ') || '—'} />
          <Value label="Sizes" value={f.sizes.join(' · ') || '—'} />
          <Value label="Variants" value={f.variants?.join(' · ') || '—'} />
        </div>
        <Prose>
          <b>By eye:</b>
        </Prose>
        <EyeNotes name={f.name} />
      </Section>

      {/* The workbench. Same component the studio renders. */}
      <Studio initial={f.name} showList={false} />

      <Section title="The fixture table" note="One row — and the studio, the matrix and the a11y sweep pick it up">
        <Prose>
          Adding a component is adding one row to{' '}
          <code style={{ fontFamily: MONO }}>src/components/__matrix__/fixtures.tsx</code>. Not three places.
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
