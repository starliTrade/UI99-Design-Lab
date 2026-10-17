/**
 * LIMINAL · SITE — THE LANDING PAGE
 *
 * A product page: the claim, the product, the story, the evidence, the way in.
 *
 * IT IS BUILT ON ONE RHYTHM AND ONE HEADER SHAPE, and that is the whole of its
 * organisation. It had ten sections of similar weight, two different heading
 * sizes (the panel component renders a 13px `h2` while the page used 33px ones),
 * three container widths and four vertical gaps — which reads as crowded even
 * when nothing is wrong, because the eye cannot tell what belongs together.
 *
 *   BAND       one container (1200) and one gap between sections (96)
 *   BAND HEAD  eyebrow · title · note — the same three, in the same order,
 *              at the same size, on every section that has a header
 *
 * Nothing below is an image. Every visual is the engine or the library,
 * rendered: the ladder is the ladder, the components are the components, the
 * numbers are read from the code.
 */
import React from 'react';
import { FIXTURES, coverage } from '../../components/__matrix__/fixtures';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { PERCEPTUAL_QUANTUM, LADDER, LADDER_HUE, LADDER_CHROMA } from '../../engine/liminal-ladder';
import { ROLE_LEVEL, ROLE_RIM, ROLE_SHADOW, resolveSurface } from '../../engine/liminal-surface';
import { oklchLightness, contrastRatioHex } from '../../engine/liminal-color-math';
import { BRAND_HEX } from '../../engine/liminal-ladder';
import { SURFACE_TINT } from '../../engine/spec-engine';
import { Heading, Text } from '../../components/atoms/Typography';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { AppInFrame } from '../AppFrame';
import { S, R, MONO, surfaceFor } from '../ui';
import type { Route } from '../routes';

const ROLES = Object.keys(ROLE_LEVEL) as (keyof typeof ROLE_LEVEL)[];
const avg = Math.round((FIXTURES.reduce((a, f) => a + coverage(f), 0) / FIXTURES.length) * 100);
const complete = FIXTURES.filter((f) => coverage(f) === 1).length;

/** One container, one gap. Every section below uses this and nothing else. */
const CONTAINER = { maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const };
const BAND = { ...CONTAINER, paddingBlockStart: S[8] * 1.5, paddingInline: `${S[5]}px` };

/** The one header shape. Eyebrow, title, note — in that order, every time. */
function BandHead({ eyebrow, title, note }: { eyebrow?: string; title: string; note?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px`, maxWidth: '62ch', marginBottom: `${S[6]}px` }}>
      {eyebrow && (
        <span
          style={{
            fontSize: 11,
            letterSpacing: L.getTypeStyle(1, true).letterSpacing,
            textTransform: 'uppercase',
            opacity: 0.5,
          }}
        >
          {eyebrow}
        </span>
      )}
      <Heading level={2} size={7}>
        {title}
      </Heading>
      {note && (
        <Text level={4} tone="tertiary">
          {note}
        </Text>
      )}
    </div>
  );
}

/** A visual panel: the well role, so a picture of the engine reads as looked into. */
function Panel({ children, label }: { children: React.ReactNode; label?: string }) {
  return (
    <div
      style={{
        ...surfaceFor('well').style,
        borderRadius: `${R.card}px`,
        padding: `${S[4]}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${S[3]}px`,
        minWidth: 0,
      }}
    >
      {label && (
        <span style={{ fontSize: 10, letterSpacing: L.getTypeStyle(1, true).letterSpacing, textTransform: 'uppercase', opacity: 0.5 }}>
          {label}
        </span>
      )}
      {children}
    </div>
  );
}

/** A claim with a visual. Text first on a phone, side by side from a tablet up. */
function Story({ eyebrow, title, children, visual, flip }: { eyebrow: string; title: string; children: React.ReactNode; visual: React.ReactNode; flip?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: `${S[6]}px`,
        alignItems: 'center',
        flexDirection: flip ? 'row-reverse' : 'row',
      }}
    >
      <div style={{ flex: `1 1 ${L.FIELD_MIN * 1.6}px`, minWidth: 0 }}>
        <BandHead eyebrow={eyebrow} title={title} note={undefined} />
        <Text level={4} tone="secondary" style={{ marginTop: `-${S[4]}px` }}>
          {children}
        </Text>
      </div>
      <div style={{ flex: `1 1 ${L.FIELD_MIN * 1.6}px`, minWidth: 0 }}>{visual}</div>
    </div>
  );
}

export function HomePage({ go }: { go: (r: Route) => void }) {
  const steps = LADDER.map((hex, i) =>
    i === 0 ? null : (oklchLightness(hex) - oklchLightness(LADDER[i - 1])) / PERCEPTUAL_QUANTUM,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* ── 1 · THE CLAIM ──────────────────────────────────────────────────── */}
      <section style={{ ...CONTAINER, paddingBlockStart: S[7], paddingInline: `${S[5]}px` }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${S[4]}px`, textAlign: 'center' }}>
          <span
            style={{
              ...surfaceFor('well').style,
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${S[2]}px`,
              padding: `${S[1]}px ${S[3]}px`,
              borderRadius: `${R.full}px`,
              fontSize: 11,
            }}
          >
            <Badge semantic="success">v1.0</Badge>
            {FIXTURES.length} components · {ROLES.length} roles · MIT
          </span>

          <Heading level={1} size={10} style={{ maxWidth: '18ch' }}>
            The component declares. The engine decides.
          </Heading>

          <Text level={4} tone="secondary" style={{ maxWidth: '58ch', margin: '0 auto' }}>
            A dark design system where nothing is hand-picked. A component says what it <i>is</i> — a
            panel, a control, a well — and the engine decides the surface, the rim, the shadow and the
            text alpha.
          </Text>

          <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button size="lg" variant="primary" onClick={() => go({ page: 'docs', slug: 'installation' })}>
              Get started
            </Button>
            <Button size="lg" variant="secondary" onClick={() => go({ page: 'components' })}>
              Browse {FIXTURES.length} components
            </Button>
          </div>
        </div>
      </section>

      {/* ── 2 · THE PRODUCT, RUNNING ───────────────────────────────────────── */}
      <section style={{ ...BAND, paddingBlockStart: S[7] }} aria-label="The app kit, running">
        <AppInFrame screen="dashboard" device="fluid" chrome="browser" minHeight={620} note="liminal.app/dashboard" />
        <p style={{ textAlign: 'center', fontSize: 11, opacity: 0.5, marginBlock: `${S[3]}px` }}>
          Five screens built from this library and nothing else — an iframe with its own viewport, so
          the app's own breakpoints answer.
        </p>
      </section>

      {/* ── 3 · THE STATEMENT ──────────────────────────────────────────────── */}
      <section style={BAND} aria-label="The problem">
        <BandHead
          eyebrow="Why"
          title="A chosen number drifts. A derived number cannot."
          note="The same panel written twice lands on two different greys, and no test can say which one is right. That is not a discipline problem — it is what a number without a name does. Here the number has a name, the name has a rule, and the rule is a test."
        />
      </section>

      {/* ── 4 · THE STORY ──────────────────────────────────────────────────── */}
      <section style={BAND} aria-label="How it works">
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[8]}px` }}>
          <Story
            eyebrow="The ladder"
            title="One formula, nine surfaces"
            visual={
              <Panel label={`q = ${PERCEPTUAL_QUANTUM} · hue ${LADDER_HUE}° · chroma ${LADDER_CHROMA}`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
                  {LADDER.map((hex, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: `${S[3]}px` }}>
                      <code style={{ fontFamily: MONO, fontSize: 10, width: S[6], opacity: 0.6 }}>S{i}</code>
                      <span
                        style={{
                          flex: 1,
                          height: S[4],
                          background: hex,
                          borderRadius: `${R.chip}px`,
                          border: `${L.BORDER.hairline}px solid ${SURFACE_TINT.subtle}`,
                        }}
                      />
                      <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.7 }}>{hex}</code>
                      {steps[i] !== null && (
                        <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.55, width: S[7] }}>
                          +{(steps[i] as number).toFixed(2)}q
                        </code>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
            }
          >
            Every step sits one perceptual quantum from the one below — a distance measured across three
            sessions, not a percentage someone liked. A step out of band turns red.
          </Story>

          <Story
            flip
            eyebrow="The hierarchy"
            title="A component declares a role, not a depth"
            visual={
              <Panel label={`${ROLES.length} roles · level, rim and shadow are the engine's`}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
                  {(['work', 'panel', 'control', 'well'] as const).map((role) => (
                    <div
                      key={role}
                      style={{
                        ...resolveSurface({ role, interactive: false }).style,
                        borderRadius: `${R.card}px`,
                        padding: `${S[3]}px`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: `${S[3]}px`,
                        border: `${L.BORDER.hairline}px solid ${SURFACE_TINT.subtle}`,
                      }}
                    >
                      <code style={{ fontFamily: MONO, fontSize: 11 }}>{role}</code>
                      <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.6 }}>
                        S{ROLE_LEVEL[role]} · rim {ROLE_RIM[role]} · {ROLE_SHADOW[role] === null ? 'no shadow' : `E${ROLE_SHADOW[role]}`}
                      </code>
                    </div>
                  ))}
                </div>
              </Panel>
            }
          >
            Two components that declare the same role cannot disagree about depth. The hierarchy is
            structural: a panel belongs on the work plane, and a control belongs on the thing it sits
            on — so a step cannot be skipped.
          </Story>

          <Story
            eyebrow="The contract"
            title="A rule with no guard is a habit"
            visual={
              <Panel label="seven guards · each bans one pattern">
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
                  {[
                    ['no raw numbers in a component', 'no-raw-numbers'],
                    ['one producer for the interaction variables', 'interaction-vars'],
                    ['the app is fed by the engine', 'engine-fed'],
                    ['the props table is generated, not typed', 'api'],
                    ['no axe violation, on any page', 'a11y'],
                    ['the raw-colour rule reads template literals', 'eslint'],
                    ['the contract matches the engine', 'token-version'],
                  ].map(([rule, guard]) => (
                    <div key={rule} style={{ display: 'flex', alignItems: 'baseline', gap: `${S[3]}px` }}>
                      <span style={{ color: LiminalColorEngine.SEMANTICS.SUCCESS.text, fontSize: 12 }}>✓</span>
                      <span style={{ flex: 1, fontSize: 12 }}>{rule}</span>
                      <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.45 }}>{guard}</code>
                    </div>
                  ))}
                </div>
              </Panel>
            }
          >
            One defect appeared five times in places a lint could not see. The fix took an afternoon;
            the guard is what makes it stay fixed. Every rule names the test that goes red.
          </Story>
        </div>
      </section>

      {/* ── 5 · THE COMPONENTS ─────────────────────────────────────────────── */}
      <section style={BAND} aria-label="The components">
        <BandHead
          eyebrow="The library"
          title={`${FIXTURES.length} components, one table`}
          note="Every card is the real component, rendered by the same fixture the studio, the a11y sweep and the coverage report read. Adding a component is adding a row — not three places."
        />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${L.FIELD_MIN * 0.8}px, 1fr))`, gap: `${S[3]}px` }}>
          {FIXTURES.slice(0, 12).map((f) => (
            /* THE CARD IS NOT A BUTTON. It was, and every preview containing a
               control put a button inside a button — axe reports it as
               `nested-interactive`, and it is worse than a lint: the reader
               cannot touch the component in the card. The name is the link. */
            <div
              key={f.name}
              style={{
                ...surfaceFor('panel').style,
                border: `${L.BORDER.hairline}px solid ${SURFACE_TINT.subtle}`,
                borderRadius: `${R.card}px`,
                padding: `${S[3]}px`,
                display: 'flex',
                flexDirection: 'column',
                gap: `${S[2]}px`,
                alignItems: 'stretch',
                minWidth: 0,
              }}
            >
              <button
                type="button"
                onClick={() => go({ page: 'component', name: f.name })}
                style={{
                  font: 'inherit',
                  fontSize: 11,
                  opacity: 0.7,
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
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: L.CELL_MIN, overflow: 'hidden' }}>
                {f.render(f.states[0], f.sizes[0], f.variants?.[0])}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap', marginTop: `${S[5]}px` }}>
          <Button variant="secondary" onClick={() => go({ page: 'components' })}>
            All {FIXTURES.length} components
          </Button>
          <Button variant="outline" onClick={() => go({ page: 'blocks' })}>
            See them in a whole app
          </Button>
        </div>
      </section>

      {/* ── 6 · THE EVIDENCE ───────────────────────────────────────────────── */}
      <section style={BAND} aria-label="Measured">
        <BandHead eyebrow="Measured" title="What deriving everything buys" note="Six numbers, each one a test rather than a promise." />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${L.CELL_MIN * 2.2}px, 1fr))`,
            gap: `${S[5]}px ${S[6]}px`,
          }}
        >
          {[
            ['0', 'raw values in the app', 'asserted by engine-fed.test.ts'],
            ['0', 'axe violations', 'every page, in the suite'],
            [String(LADDER.length), 'surfaces from one formula', `q = ${PERCEPTUAL_QUANTUM}`],
            [String(FIXTURES.length), 'components in the matrix', `${complete} complete on the standard`],
            [`${avg}%`, 'average state coverage', 'expected against existing'],
            [`${contrastRatioHex(BRAND_HEX, LADDER[0]).toFixed(1)}:1`, 'focus ring on the darkest step', 'one colour, one rule'],
          ].map(([value, label, note]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px`, minWidth: 0 }}>
              <span style={{ ...L.getTypeStyle(8), fontWeight: 700, lineHeight: 1 }}>{value}</span>
              <span style={{ fontSize: 12 }}>{label}</span>
              <span style={{ fontSize: 11, opacity: 0.5 }}>{note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 7 · THE PRINCIPLES ─────────────────────────────────────────────── */}
      <section style={BAND} aria-label="The principles">
        <BandHead
          eyebrow="The contract"
          title="The rules, in the language they were written in"
          note="The design contract is Persian, and it is generated: the numbers inside it come from the engine, so the document cannot disagree with the code."
        />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.FIELD_MIN * 1.4}px, 1fr))`, gap: `${S[4]}px` }}>
          {[
            ['هر لایه روی آستانه‌ی ادراک — نه کمتر، نه بیشتر.', 'DESIGN-CONTRACT.md · §1'],
            ['این عدد اندازه‌گیری شده است، نه فرض.', 'DESIGN-CONTRACT.md · §1.1'],
            ['نردبان تولید می‌شود، نه انتخاب.', 'DESIGN-CONTRACT.md · §1.1'],
            ['قرارداد، طراحی را توصیف می‌کند؛ طراحی تابع قرارداد نیست.', 'working agreement'],
          ].map(([quote, source]) => (
            <div
              key={quote}
              style={{
                ...surfaceFor('panel').style,
                borderRadius: `${R.card}px`,
                padding: `${S[4]}px`,
                display: 'flex',
                flexDirection: 'column',
                gap: `${S[3]}px`,
                minWidth: 0,
              }}
            >
              {/* The contract is Persian, so the quote carries its own direction:
                  a right-to-left sentence in a left-to-right card reads as a
                  mistake otherwise — the punctuation lands at the wrong end. */}
              <span dir="rtl" style={{ fontSize: 15, lineHeight: 1.9 }}>
                {quote}
              </span>
              <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.45 }}>{source}</code>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8 · THE WAY IN ─────────────────────────────────────────────────── */}
      <section style={BAND} aria-label="Get started">
        <div
          style={{
            ...surfaceFor('panel').style,
            borderRadius: `${R.card}px`,
            padding: `${S[7]}px ${S[5]}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: `${S[4]}px`,
            textAlign: 'center',
          }}
        >
          <Heading level={2} size={7} style={{ maxWidth: '24ch' }}>
            Start with a component, or start with the rule
          </Heading>
          <Text level={4} tone="secondary" style={{ maxWidth: '52ch' }}>
            One package and one stylesheet. The contract is the reason it stays consistent, and it is
            written to be read by a person or by an agent.
          </Text>
          <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button size="lg" variant="primary" onClick={() => go({ page: 'docs', slug: 'installation' })}>
              Install
            </Button>
            <Button size="lg" variant="secondary" onClick={() => go({ page: 'docs', slug: 'introduction' })}>
              Read the introduction
            </Button>
          </div>
          <div
            style={{
              ...surfaceFor('well').style,
              borderRadius: `${R.control}px`,
              padding: `${S[2]}px ${S[4]}px`,
              fontFamily: MONO,
              fontSize: 12,
              direction: 'ltr',
            }}
          >
            bun add liminal
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
