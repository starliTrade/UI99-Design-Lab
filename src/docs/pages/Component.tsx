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
import API from '../api.json';
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

/**
 * The props, read from the `…Props` interface the component is already written
 * in — generated, not typed here, because a hand-written table has a
 * documentation bug on the day a prop changes.
 *
 * The JSDoc column is the interesting one: in this repo the comment above a prop
 * is where the REASON lives, not a description of the name.
 */
function ApiTable({ name }: { name: string }) {
  const entry = (API as { component: string; path: string; extends?: string; props: { name: string; type: string; required: boolean; doc?: string }[] }[]).find(
    (e) => e.component === name,
  );
  if (!entry) {
    return (
      <Section title="API" note={`${name} has no exported props interface`}>
        <Prose>
          Either it takes no props, or its interface is not named <code style={{ fontFamily: MONO }}>{name}Props</code>.
        </Prose>
      </Section>
    );
  }
  const documented = entry.props.filter((p) => p.doc).length;
  return (
    <Section
      title="API"
      note={`${entry.props.length} props · ${documented} with a reason · read from ${entry.path}`}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ opacity: 0.65 }}>
              <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>prop</th>
              <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>type</th>
              <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>why it exists</th>
            </tr>
          </thead>
          <tbody>
            {entry.props.map((p) => (
              <tr key={p.name} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: `${S[1]}px ${S[2]}px`, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                  <code style={{ fontFamily: MONO }}>{p.name}</code>
                  {!p.required && <span style={{ opacity: 0.5 }}>?</span>}
                </td>
                <td style={{ padding: `${S[1]}px ${S[2]}px`, verticalAlign: 'top' }}>
                  <code style={{ fontFamily: MONO, fontSize: 11, direction: 'ltr', display: 'inline-block' }}>{p.type}</code>
                </td>
                <td style={{ padding: `${S[1]}px ${S[2]}px`, verticalAlign: 'top', opacity: p.doc ? 0.85 : 0.45, lineHeight: 1.8 }}>
                  {p.doc ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entry.extends && (
        <Prose>
          <b>extends</b> <code style={{ fontFamily: MONO, fontSize: 11 }}>{entry.extends}</code>
        </Prose>
      )}
      {documented < entry.props.length && (
        <Prose>
          {entry.props.length - documented} of {entry.props.length} props have no reason written above them. In this
          repo that is a gap rather than a style: the comment is where the reason lives.
        </Prose>
      )}
    </Section>
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

      {/* The API, read from the types rather than written by hand. */}
      <ApiTable name={f.name} />

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
