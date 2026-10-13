/**
 * LIMINAL · DOCS — THE INDEX
 *
 * Every component, live. Not a screenshot and not a still frame: the real
 * component, rendered by the same fixture the matrix and the studio read. A
 * component that breaks takes this page down with it, which is when someone
 * notices.
 */
import React from 'react';
import { FIXTURES, coverage } from '../../components/__matrix__/fixtures';
import { Section, Prose, MONO, S, R, WORK } from '../ui';

const pct = (n: number) => Math.round(n * 100);

function Preview({ name }: { name: string }) {
  const f = FIXTURES.find((x) => x.name === name);
  if (!f) return null;
  // No try/catch: JSX is not rendered when it is constructed, so a try/catch
  // here catches nothing and hides the failure. A component that cannot render
  // should take this page down — that is the moment someone notices.
  return <>{f.render(f.states[0])}</>;
}

export function ComponentsPage({ go }: { go: (name: string) => void }) {
  const groups = [...new Set(FIXTURES.map((f) => f.group))];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <Section title="Components" note={`${FIXTURES.length} components, live`} role="work">
        <Prose>
          Every card IS the component, not a picture of it. The percentage is state coverage:
          what the system expects against what exists. A red number means something is missing.
        </Prose>
      </Section>

      {groups.map((g) => (
        <Section key={g} title={g} note={`${FIXTURES.filter((f) => f.group === g).length} components`}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: `${S[3]}px`,
            }}
          >
            {FIXTURES.filter((f) => f.group === g).map((f) => {
              const c = pct(coverage(f));
              const missing = f.expected.filter((s) => !f.states.includes(s));
              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => go(f.name)}
                  style={{
                    ...WORK.style,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${S[2]}px`,
                    padding: `${S[3]}px`,
                    borderRadius: `${R.card}px`,
                    border: '1px solid rgba(255,255,255,0.07)',
                    font: 'inherit',
                    textAlign: 'start',
                    minWidth: 0,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: `${S[2]}px` }}>
                    <b style={{ fontSize: 12 }}>{f.name}</b>
                    <code
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        color: missing.length ? 'var(--liminal-danger, #ba4646)' : undefined,
                        opacity: missing.length ? 1 : 0.55,
                      }}
                    >
                      {c}%
                    </code>
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 64,
                      overflow: 'hidden',
                    }}
                  >
                    <Preview name={f.name} />
                  </span>
                  <span style={{ fontSize: 10, opacity: 0.6 }}>
                    {f.sizes.length ? `${f.sizes.length} sizes` : 'no sizes'}
                    {f.variants?.length ? ` · ${f.variants.length} variants` : ''}
                    {missing.length ? ` · missing: ${missing.join(', ')}` : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>
      ))}
    </div>
  );
}
