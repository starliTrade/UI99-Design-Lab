/**
 * LIMINAL · DOCS — ONE COMPONENT
 *
 * The page a consumer opens, built the way shadcn builds one: a summary, how to
 * install it, how to use it, then A SECTION PER THING IT CAN BE — every variant,
 * every size, every state, each with a live preview and its code behind a
 * toggle — and finally the props.
 *
 * EVERY EXAMPLE IS RENDERED BY THE FIXTURE TABLE. That is the whole reason this
 * page can be rich without being written by hand: one row already declares the
 * variants, the sizes and the states, and the page is a rendering of that
 * declaration. A component that gains a variant gains a section.
 */
import React from 'react';
import { Studio } from '../../studio/Studio';
import { FIXTURES, coverage } from '../../components/__matrix__/fixtures';
import { Section, Prose, Value, Stat, MONO, S, R, Code, WORK, WELL } from '../ui';
import { Example } from '../Example';
import API from '../api.json';

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

  const render = (state?: string, size?: string, variant?: string) => {
    const el = f.render(state ?? f.states[0], size ?? f.sizes[0], variant ?? f.variants?.[0]);
    return <Example element={el}>{el}</Example>;
  };

  return (
    <>
      <Section title="Examples" note="Every variant, size and state the fixture declares">
        <Example title="Default">{render()}</Example>
      </Section>

      {f.variants && f.variants.length > 1 && (
        <Section title="Variants" note={`${f.variants.length} — a name for a decision, not a colour`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[5]}px` }}>
            {f.variants.map((v) => (
              <Example key={v} title={v}>{render(undefined, undefined, v)}</Example>
            ))}
          </div>
        </Section>
      )}

      {f.sizes.length > 1 && (
        <Section title="Sizes" note={`${f.sizes.length} — from the engine's control scale, not from a number`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[5]}px` }}>
            {f.sizes.map((sz) => (
              <Example key={sz} title={sz}>{render(undefined, sz)}</Example>
            ))}
          </div>
        </Section>
      )}

      {f.states.length > 1 && (
        <Section title="States" note={`${f.states.length} — each one lands on the perceptual boundary`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[5]}px` }}>
            {f.states.map((st) => (
              <Example key={st} title={st}>{render(st)}</Example>
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
              <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>prop</th>
              <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>type</th>
              <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>default</th>
              <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>why it exists</th>
            </tr>
          </thead>
          <tbody>
            {entry.props.map((p) => (
              <tr key={p.name} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
          {entry.props.length - documented} of {entry.props.length} props have no reason written above them. In this
          repo that is a gap rather than a style: the comment is where the reason lives.
        </Prose>
      )}
    </Section>
  );
}

/** The two snippets, as strings rather than as JSX expressions — a template
 *  literal split across lines inside JSX is parsed as an array. */
function installSnippet(name: string): string {
  return `import { ${name} } from 'liminal';\nimport 'liminal/styles.css';`;
}

function usageSnippet(name: string, size?: string, variant?: string): string {
  const attrs = [size ? ` size="${size}"` : '', variant ? ` variant="${variant}"` : ''].join('');
  return `<${name}${attrs} />`;
}

export function ComponentPage({ name }: { name: string }) {
  const f = FIXTURES.find((x) => x.name === name);
  if (!f) {
    return (
      <Section title="Not found" note={name} role="work">
        <Prose>This component is not in the fixture table — so the studio, the matrix and the a11y sweep do not know it either.</Prose>
      </Section>
    );
  }
  const api = ENTRIES.find((e) => e.component === name);
  const c = Math.round(coverage(f) * 100);
  const missing = f.expected.filter((s) => !f.states.includes(s));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[6]}px`, minWidth: 0 }}>
      {/* The header. A sentence first, because a page that opens with a table of
          numbers makes the reader work out what the thing is. */}
      <header style={{ display: 'flex', flexDirection: 'column', gap: `${S[3]}px`, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em' }}>{f.name}</h1>
          <span style={{ fontSize: 12, opacity: 0.6 }}>{f.group}</span>
        </div>
        {api?.description && (
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.8, opacity: 0.85, maxWidth: '68ch' }}>{api.description}</p>
        )}
        <div style={{ display: 'flex', gap: `${S[5]}px`, flexWrap: 'wrap' }}>
          <Stat value={String(f.states.length)} label="states" />
          <Stat value={String(f.sizes.length)} label="sizes" />
          <Stat value={String(f.variants?.length ?? 0)} label="variants" />
          <Stat value={`${c}%`} label="coverage" tone={missing.length ? 'warn' : undefined} />
        </div>
      </header>

      <Section title="Installation">
        <Prose>The component is part of the library. Nothing to add.</Prose>
        <div style={{ ...WELL.style, borderRadius: `${R.card}px`, padding: `${S[3]}px`, overflowX: 'auto' }}>
          <Code block>{installSnippet(f.name)}</Code>
        </div>
      </Section>

      <Section title="Usage">
        <Prose>
          It declares a <b>role</b> and the engine decides the rest. Nothing here picks a depth, a colour or a
          spacing value.
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Value label="States" value={f.states.join(' · ')} />
          <Value label="Expected" value={f.expected.join(' · ') || '—'} />
          <Value label="Sizes" value={f.sizes.join(' · ') || '—'} />
          <Value label="Variants" value={f.variants?.join(' · ') || '—'} />
          <Value label="Fixture row" value={`src/components/__matrix__/fixtures.tsx`} />
        </div>
      </Section>
    </div>
  );
}
