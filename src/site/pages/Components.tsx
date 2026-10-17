/**
 * LIMINAL · SITE — THE COMPONENTS INDEX
 *
 * Every component, live. Not a screenshot and not a still frame: the real
 * component, rendered by the same fixture the matrix, the a11y sweep and the
 * studio read. A component that breaks takes this page down with it, which is
 * when someone notices.
 *
 * The card is NOT a button. It was, and every preview containing a control put a
 * button inside a button — so a reader could not hover the Button in the Button
 * card. The name is the link; the preview is touchable, which is the point of an
 * index built from the real components.
 */
import React from 'react';
import { FIXTURES, coverage } from '../../components/__matrix__/fixtures';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { SURFACE_TINT } from '../../engine/spec-engine';
import { Heading, Text } from '../../components/atoms/Typography';
import { Section, Prose, MONO, S, R, WORK, surfaceFor } from '../ui';

/**
 * What a reader arriving from another library will look for.
 *
 * Not a roadmap and not a promise — a list of absences, so the absence is
 * visible. Several of these exist under a different name, and the note above the
 * list says which.
 */
const MISSING = [
  'Carousel',
  'Chart',
  'Menubar',
  'Navigation Menu',
  'Resizable',
  'Attachment',
  'Questionnaire',
  'Data Table',
  'Native Select',
  'Switch',
  'Separator',
  'Dialog',
  'Command',
  'Empty',
  'Field',
  'Direction',
];

const SEMANTICS = LiminalColorEngine.SEMANTICS;
const pct = (n: number) => Math.round(n * 100);

function Preview({ name }: { name: string }) {
  const f = FIXTURES.find((x) => x.name === name);
  if (!f) return null;
  // No try/catch: JSX is not rendered when it is constructed, so a try/catch
  // here catches nothing and hides the failure. A component that cannot render
  // should take this page down — that is the moment someone notices.
  return <>{f.render(f.states[0], f.sizes[0], f.variants?.[0])}</>;
}

export function ComponentsPage({ go }: { go: (name: string) => void }) {
  const groups = [...new Set(FIXTURES.map((f) => f.group))];
  const complete = FIXTURES.filter((f) => coverage(f) === 1).length;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S[5]}px`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: `${S[6]}px`, minWidth: 0 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
        <Heading level={1} size={7}>
          Components
        </Heading>
        <Text level={3} tone="tertiary" style={{ maxWidth: '70ch' }}>
          {FIXTURES.length} components, {complete} of them complete on the system's own standard. Every
          card IS the component, not a picture of it — hover them, focus them, type in them. The
          percentage is state coverage: what the system expects against what exists, and a red number
          means something is missing.
        </Text>
      </header>

      {groups.map((g) => (
        <Section key={g} title={g} note={`${FIXTURES.filter((f) => f.group === g).length} components`}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${L.FIELD_MIN}px, 1fr))`, gap: `${S[3]}px` }}>
            {FIXTURES.filter((f) => f.group === g).map((f) => {
              const c = pct(coverage(f));
              const missing = f.expected.filter((s) => !f.states.includes(s));
              return (
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
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: L.CELL_MIN, overflow: 'hidden' }}>
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

      <Section title="Not here yet" note="Named rather than hidden">
        <Prose>
          A component the library does not have is listed rather than left out, because a gap nobody
          wrote down is a gap nobody closes. Some of these exist here under another name — a Switch is
          a Toggle, a Separator is a Divider, a Dialog is a Modal, a Command is a CommandPalette — and
          the names are listed as a reader would search for them.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[2]}px`, flexWrap: 'wrap' }}>
          {MISSING.map((name) => (
            <span
              key={name}
              style={{
                ...surfaceFor('well').style,
                fontSize: 11,
                padding: `${S[1]}px ${S[3]}px`,
                borderRadius: `${R.full}px`,
                opacity: 0.75,
              }}
            >
              {name}
            </span>
          ))}
        </div>
      </Section>
    </div>
  );
}

export default ComponentsPage;
