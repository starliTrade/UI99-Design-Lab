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
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { SURFACE_TINT } from '../../engine/spec-engine';

/** The semantic roles, from the engine — a colour a reader can name. */
const SEMANTICS = LiminalColorEngine.SEMANTICS;

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
      <Section title="Components" note={`${FIXTURES.length} components, live`} role="panel">
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
              gridTemplateColumns: `repeat(auto-fill, minmax(${L.FIELD_MIN}px, 1fr))`,
              gap: `${S[3]}px`,
            }}
          >
            {FIXTURES.filter((f) => f.group === g).map((f) => {
              const c = pct(coverage(f));
              const missing = f.expected.filter((s) => !f.states.includes(s));
              return (
                /**
                 * THE CARD IS NOT A BUTTON, AND THE PREVIEW IS WHY.
                 *
                 * It was: the whole card was a `<button>`, so every preview
                 * that contains a control — which is most of them — put a
                 * button inside a button. axe reports `nested-interactive`,
                 * serious, and it is worse than a lint: a reader could not
                 * hover the Button in the Button card, because the card was
                 * swallowing the interaction. The studio's own index could not
                 * do the one thing the studio is for.
                 *
                 * The NAME is the link now. The preview is a preview — you can
                 * touch it here, which is the point of an index built from the
                 * real components.
                 */
                <div
                  key={f.name}
                  style={{
                    ...WORK.style,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: `${S[2]}px`,
                    padding: `${S[3]}px`,
                    borderRadius: `${R.card}px`,
                    border: `${L.BORDER.hairline}px solid ${SURFACE_TINT.medium}`,
                    minWidth: 0,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: `${S[2]}px` }}>
                    <button
                      type="button"
                      onClick={() => go(f.name)}
                      style={{
                        font: 'inherit',
                        fontSize: 12,
                        fontWeight: 600,
                        padding: 0,
                        border: 'none',
                        background: 'transparent',
                        color: 'inherit',
                        cursor: 'pointer',
                        textAlign: 'start',
                      }}
                    >
                      {f.name}
                    </button>
                    <code
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        color: missing.length ? SEMANTICS.DANGER.text : undefined,
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
                </div>
              );
            })}
          </div>
        </Section>
      ))}
    </div>
  );
}
