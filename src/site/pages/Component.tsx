/**
 * LIMINAL · SITE — ONE COMPONENT
 *
 * The page a consumer opens, in the order they need it: what it is, what it
 * looks like, how to install it, how to use it, every variant and size and
 * state, the props, and then the studio — which is the part a component
 * library's docs usually do not have.
 *
 * EVERY EXAMPLE IS RENDERED BY THE FIXTURE TABLE. That is the whole reason this
 * page can be rich without being written by hand: one row already declares the
 * variants, the sizes and the states, and the page is a rendering of that
 * declaration. A component that gains a variant gains a section.
 */
import React from 'react';
import { Studio } from '../../studio/Studio';
import { FIXTURES, coverage } from '../../components/__matrix__/fixtures';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { SURFACE_TINT } from '../../engine/spec-engine';
import { Heading, Text } from '../../components/atoms/Typography';
import { Section, Prose, Value, Stat, MONO, S, R, Code, WELL, surfaceFor } from '../ui';
import { Example } from '../Example';
import API from '../api.json';
import type { Route } from '../routes';

interface ApiEntry {
  component: string;
  path: string;
  description?: string;
  extends?: string;
  props: { name: string; type: string; required: boolean; doc?: string; default?: string }[];
}
const ENTRIES = API as ApiEntry[];

/** What a reviewer should check by eye. Not a checklist for the machine. */
function EyeNotes({ name }: { name: string }) {
  const f = FIXTURES.find((x) => x.name === name);
  if (!f) return null;
  const control = f.kind === 'input' || f.kind === 'action';
  const notes: string[] = [];
  if (control && !f.sizes.length) notes.push('No sizes — a control needs them');
  if (control && !f.variants?.length) notes.push('No variants');
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
 * A section per variant, per size, per state — each one the REAL component,
 * rendered by the same fixture the studio reads.
 *
 * The code behind each is the element the fixture returned, walked. An example
 * whose code does not match its preview is worse than no code.
 */
function Examples({ name }: { name: string }) {
  const f = FIXTURES.find((x) => x.name === name);
  if (!f) return null;

  return (
    <>
      {f.variants && f.variants.length > 1 && (
        <Section title="Variants" note={`${f.variants.length} — a name for a decision, not a colour`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[5]}px` }}>
            {f.variants.map((v) => (
              <Example key={v} title={v} element={f.render(f.states[0], f.sizes[0], v)}>
                {f.render(f.states[0], f.sizes[0], v)}
              </Example>
            ))}
          </div>
        </Section>
      )}

      {f.sizes.length > 1 && (
        <Section title="Sizes" note={`${f.sizes.length} — from the engine's control scale, not from a number`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[5]}px` }}>
            {f.sizes.map((sz) => (
              <Example key={sz} title={sz} element={f.render(f.states[0], sz, f.variants?.[0])}>
                {f.render(f.states[0], sz, f.variants?.[0])}
              </Example>
            ))}
          </div>
        </Section>
      )}

      {f.states.length > 1 && (
        <Section title="States" note={`${f.states.length} — each one lands on the perceptual boundary`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[5]}px` }}>
            {f.states.map((st) => (
              <Example key={st} title={st} element={f.render(st, f.sizes[0], f.variants?.[0])}>
                {f.render(st, f.sizes[0], f.variants?.[0])}
              </Example>
            ))}
          </div>
        </Section>
      )}

    </>
  );
}

function ApiTable({ name }: { name: string }) {
  const entry = ENTRIES.find((e) => e.component === name);
  if (!entry) {
    return (
      <Section title="API" note={`${name} has no exported props interface`}>
        <Prose>
          Either it takes no props, or its interface is not named <Code>{`${name}Props`}</Code>.
        </Prose>
      </Section>
    );
  }
  const documented = entry.props.filter((p) => p.doc).length;
  return (
    <Section title="API" note={`${entry.props.length} props · read from ${entry.path}`}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ opacity: 0.65 }}>
              {['prop', 'type', 'default', 'why it exists'].map((h) => (
                <th key={h} style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entry.props.map((p) => (
              <tr key={p.name} style={{ borderTop: `${L.BORDER.hairline}px solid ${SURFACE_TINT.medium}` }}>
                <td style={{ padding: `${S[2]}px`, verticalAlign: 'top', whiteSpace: 'nowrap' }}>
                  <code style={{ fontFamily: MONO }}>{p.name}</code>
                  {!p.required && <span style={{ opacity: 0.5 }}>?</span>}
                </td>
                <td style={{ padding: `${S[2]}px`, verticalAlign: 'top' }}>
                  <code style={{ fontFamily: MONO, fontSize: 11, direction: 'ltr', display: 'inline-block' }}>{p.type}</code>
                </td>
                <td style={{ padding: `${S[2]}px`, verticalAlign: 'top' }}>
                  {p.default ? (
                    <code style={{ fontFamily: MONO, fontSize: 11, direction: 'ltr' }}>{p.default}</code>
                  ) : (
                    <span style={{ opacity: 0.4 }}>—</span>
                  )}
                </td>
                <td style={{ padding: `${S[2]}px`, verticalAlign: 'top', opacity: p.doc ? 0.85 : 0.45, lineHeight: 1.8 }}>
                  {p.doc ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {entry.extends && (
        <Prose>
          <b>extends</b> <Code>{entry.extends}</Code>
        </Prose>
      )}
      {documented < entry.props.length && (
        <Prose>
          {entry.props.length - documented} of {entry.props.length} props have no reason written above
          them. In this repo that is a gap rather than a style: the comment is where the reason lives.
        </Prose>
      )}
    </Section>
  );
}

/** The two snippets, as strings rather than as JSX expressions — a template
 *  literal split across lines inside JSX is parsed as an array. */
function installSnippet(name: string): string {
  return `bun add liminal
# then, once:

import 'liminal/styles.css';
import { ${name} } from 'liminal';`;
}

function usageSnippet(name: string, size?: string, variant?: string): string {
  const attrs = [size ? ` size="${size}"` : '', variant ? ` variant="${variant}"` : ''].join('');
  return `<${name}${attrs} />`;
}

export function ComponentPage({ name, go }: { name: string; go: (r: Route) => void }) {
  const f = FIXTURES.find((x) => x.name === name);
  if (!f) {
    return (
      <Section title="Not found" note={name} role="work">
        <Prose>
          This component is not in the fixture table — so the studio, the matrix and the a11y sweep do
          not know it either.
        </Prose>
      </Section>
    );
  }
  const api = ENTRIES.find((e) => e.component === name);
  const c = Math.round(coverage(f) * 100);
  const missing = f.expected.filter((s) => !f.states.includes(s));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[6]}px`, minWidth: 0 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: `${S[3]}px`, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          <Heading level={1} size={7}>
            {f.name}
          </Heading>
          <span style={{ fontSize: 12, opacity: 0.6 }}>{f.group}</span>
        </div>
        {api?.description && (
          <Text level={4} tone="secondary" style={{ maxWidth: '68ch' }}>
            {api.description}
          </Text>
        )}
        <div style={{ display: 'flex', gap: `${S[5]}px`, flexWrap: 'wrap' }}>
          <Stat value={String(f.states.length)} label="states" />
          <Stat value={String(f.sizes.length)} label="sizes" />
          <Stat value={String(f.variants?.length ?? 0)} label="variants" />
          <Stat value={`${c}%`} label="coverage" tone={missing.length ? 'warn' : undefined} />
        </div>
      </header>

      <Section title="Preview" note="The real component — hover it, focus it, type in it">
        <Example element={f.render(f.states[0], f.sizes[0], f.variants?.[0])}>
          {f.render(f.states[0], f.sizes[0], f.variants?.[0])}
        </Example>
      </Section>

      <Section title="Installation">
        <Prose>The component is part of the library. Nothing to add.</Prose>
        <div style={{ ...WELL.style, borderRadius: `${R.card}px`, padding: `${S[3]}px`, overflowX: 'auto' }}>
          <Code block>{installSnippet(f.name)}</Code>
        </div>
      </Section>

      <Section title="Usage">
        <Prose>
          It declares a <b>role</b> and the engine decides the rest. Nothing here picks a depth, a
          colour or a spacing value.
        </Prose>
        <div style={{ ...WELL.style, borderRadius: `${R.card}px`, padding: `${S[3]}px`, overflowX: 'auto' }}>
          <Code block>{usageSnippet(f.name, f.sizes[0], f.variants?.[0])}</Code>
        </div>
      </Section>

      <Examples name={f.name} />

      <ApiTable name={f.name} />

      {/* What the engine published, and what the contract requires — the two
          panels a component library's docs usually do not have. */}
      <Studio initial={f.name} showList={false} />

      <Section title="By eye" note="The one check no script can hold">
        <EyeNotes name={f.name} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px`, maxWidth: '78ch' }}>
          <Value label="States" value={f.states.join(' · ')} />
          <Value label="Expected" value={f.expected.join(' · ') || '—'} />
          <Value label="Sizes" value={f.sizes.join(' · ') || '—'} />
          <Value label="Variants" value={f.variants?.join(' · ') || '—'} />
          <Value label="Fixture row" value="src/components/__matrix__/fixtures.tsx" />
        </div>
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => go({ page: 'components' })}
            style={{
              ...surfaceFor('control').style,
              font: 'inherit',
              fontSize: 12,
              padding: `${S[1]}px ${S[3]}px`,
              borderRadius: `${R.chip}px`,
            }}
          >
            All components
          </button>
        </div>
      </Section>
    </div>
  );
}

export default ComponentPage;
