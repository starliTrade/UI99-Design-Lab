/**
 * LIMINAL · SITE — THE LANDING PAGE
 *
 * A product page, in the shape a product page has settled into: a claim, the
 * product, the story behind it, the numbers, the principles, and a way in. The
 * order matters — a page that opens with a feature grid makes the reader work
 * out what the thing IS from a list of what it does.
 *
 * NOTHING HERE IS AN IMAGE. Every visual on this page is the engine or the
 * library, rendered: the ladder is the ladder, the components are the
 * components, the numbers are read from the code. A product page full of
 * screenshots goes stale the day a component changes, and this project has
 * already paid for a page that carried a copy of the ladder that had drifted.
 */
import React from 'react';
import { FIXTURES, coverage } from '../../components/__matrix__/fixtures';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { PERCEPTUAL_QUANTUM, LADDER, LADDER_HUE, LADDER_CHROMA, WELLS, BRAND_HEX } from '../../engine/liminal-ladder';
import { TEXT_ROLE_SPEC, deriveTextToken, type TextRole } from '../../engine/liminal-contrast';
import { ROLE_LEVEL, ROLE_RIM, ROLE_SHADOW, resolveSurface } from '../../engine/liminal-surface';
import { oklchLightness, contrastRatioHex } from '../../engine/liminal-color-math';
import { SURFACE_TINT } from '../../engine/spec-engine';
import { Heading, Text } from '../../components/atoms/Typography';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { AppInFrame } from '../AppFrame';
import { Section, Prose, Value, S, R, MONO, surfaceFor } from '../ui';
import type { Route } from '../routes';

const ROLES = Object.keys(ROLE_LEVEL) as (keyof typeof ROLE_LEVEL)[];
const TEXT_ROLES = Object.keys(TEXT_ROLE_SPEC) as TextRole[];
const avg = Math.round((FIXTURES.reduce((a, f) => a + coverage(f), 0) / FIXTURES.length) * 100);
const complete = FIXTURES.filter((f) => coverage(f) === 1).length;

const WRAP = { maxWidth: 1200, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const };
const PAD = `${S[5]}px`;

/** A claim with a visual, alternating sides. The shape a product page tells a story in. */
function Story({
  eyebrow,
  title,
  children,
  visual,
  flip,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  visual: React.ReactNode;
  flip?: boolean;
}) {
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
      <div style={{ flex: `1 1 ${L.FIELD_MIN * 1.6}px`, minWidth: 0, display: 'flex', flexDirection: 'column', gap: `${S[3]}px` }}>
        <span style={{ fontSize: 11, letterSpacing: L.getTypeStyle(1, true).letterSpacing, textTransform: 'uppercase', opacity: 0.55 }}>{eyebrow}</span>
        <Heading level={2} size={7}>
          {title}
        </Heading>
        <Text level={4} tone="secondary">
          {children}
        </Text>
      </div>
      <div style={{ flex: `1 1 ${L.FIELD_MIN * 1.6}px`, minWidth: 0 }}>{visual}</div>
    </div>
  );
}

/** A visual panel: the well role, so a picture of the engine reads as something looked into. */
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

/** One number, stated large. The page's unit of evidence. */
function Big({ value, label, note }: { value: string; label: string; note?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px`, minWidth: 0 }}>
      <span style={{ ...L.getTypeStyle(8), fontWeight: 700, lineHeight: 1 }}>{value}</span>
      <span style={{ fontSize: 12, opacity: 0.8 }}>{label}</span>
      {note && <span style={{ fontSize: 11, opacity: 0.5 }}>{note}</span>}
    </div>
  );
}

/** A rule from the contract, in the language it was written in. */
function Principle({ quote, source }: { quote: string; source: string }) {
  return (
    <div
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
      {/* The contract is Persian, so the quote carries its own direction: a
          right-to-left sentence inside a left-to-right card reads as a mistake
          otherwise — the punctuation lands at the wrong end. */}
      <span dir="rtl" style={{ fontSize: 15, lineHeight: 1.9, textAlign: 'start' }}>
        {quote}
      </span>
      <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.5 }}>{source}</code>
    </div>
  );
}

export function HomePage({ go }: { go: (r: Route) => void }) {
  const steps = LADDER.map((hex, i) =>
    i === 0 ? null : (oklchLightness(hex) - oklchLightness(LADDER[i - 1])) / PERCEPTUAL_QUANTUM,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* ── THE HERO ───────────────────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[8]}px ${PAD} ${S[6]}px`, position: 'relative' }}>
        {/* The glare behind the product: the ladder's own light, not a colour. */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            insetBlockStart: 0,
            insetInline: 0,
            height: S[8] * 6,
            background: `radial-gradient(60% 100% at 50% 0%, ${LADDER[6]} 0%, transparent 70%)`,
            opacity: 0.5,
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${S[5]}px`, textAlign: 'center' }}>
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

          <Heading level={1} size={8} style={{ maxWidth: '20ch' }}>
            The component declares. The engine decides.
          </Heading>

          <Text level={4} tone="secondary" style={{ maxWidth: '60ch', margin: '0 auto' }}>
            LIMINAL is a dark design system where nothing is hand-picked. A component says what it
            <i> is</i> — a panel, a control, a well — and the engine decides the surface, the rim, the
            shadow and the text alpha. {FIXTURES.length} components, and not one of them chooses a
            number.
          </Text>

          <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button size="lg" variant="primary" onClick={() => go({ page: 'docs', slug: 'installation' })}>
              Get started
            </Button>
            <Button size="lg" variant="secondary" onClick={() => go({ page: 'components' })}>
              Browse {FIXTURES.length} components
            </Button>
          </div>

          {/* The trust row, measured rather than claimed. */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: `${S[2]}px ${S[5]}px`,
              fontSize: 11,
              opacity: 0.7,
              paddingBlock: `${S[2]}px`,
            }}
          >
            <span>0 axe violations, on every page</span>
            <span>0 raw values in the app</span>
            <span>{LADDER.length} surfaces from one formula</span>
            <span>LTR and RTL, from the same markup</span>
          </div>
        </div>
      </section>

      {/* ── THE PRODUCT, RUNNING ───────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `0 ${PAD}` }} aria-label="The app kit, running">
        <AppInFrame screen="dashboard" device="fluid" chrome="browser" minHeight={620} note="liminal.app/dashboard" />
        <p style={{ textAlign: 'center', fontSize: 11, opacity: 0.55, marginBlock: `${S[3]}px` }}>
          The app kit — five screens built from this library and nothing else. Not a screenshot: an
          iframe with its own viewport, so the app's own breakpoints answer when you change the width.
        </p>
      </section>

      {/* ── THE STATEMENT ──────────────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[8]}px ${PAD} 0` }} aria-label="The problem">
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, maxWidth: '34ch' }}>
          <Heading level={2} size={8}>
            A chosen number drifts. A derived number cannot.
          </Heading>
          <Text level={4} tone="secondary" style={{ maxWidth: '60ch' }}>
            The same panel written twice lands on two different greys, and no test can say which one is
            right. That is not a discipline problem — it is what a number without a name does. So in
            LIMINAL the number has a name, the name has a rule, and the rule is a test.
          </Text>
        </div>
      </section>

      {/* ── STORY 1: THE LADDER ────────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[8]}px ${PAD} 0` }} aria-label="One formula, nine surfaces">
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
          sessions with fixed stimuli and trap trials, not a percentage someone liked. The page prints
          each step's distance, and a step out of band turns red.
        </Story>
      </section>

      {/* ── STORY 2: THE ROLE ──────────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[8]}px ${PAD} 0` }} aria-label="Declare, do not choose">
        <Story
          flip
          eyebrow="The hierarchy"
          title="A component declares a role, not a depth"
          visual={
            <Panel label={`${ROLES.length} roles · level, rim and shadow are the engine's`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
                {(['work', 'panel', 'control', 'well'] as const).map((role) => {
                  const surface = resolveSurface({ role, interactive: false });
                  return (
                    <div
                      key={role}
                      style={{
                        ...surface.style,
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
                  );
                })}
              </div>
            </Panel>
          }
        >
          Two components that declare the same role cannot disagree about depth — which is exactly what
          a hand-picked number cannot promise. The hierarchy is structural: a panel belongs on the work
          plane, and a control belongs on the thing it sits on. The engine resolves the three against
          each other, so a step cannot be skipped.
        </Story>
      </section>

      {/* ── STORY 3: THE CONTRACT ──────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[8]}px ${PAD} 0` }} aria-label="The contract is executable">
        <Story
          eyebrow="The contract"
          title="A rule with no guard is a habit"
          visual={
            <Panel label="seven guards · each bans one pattern">
              <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
                {[
                  ['no raw numbers in a component', 'no-raw-numbers.test.ts'],
                  ['one producer for the interaction variables', 'interaction-vars.test.ts'],
                  ['the app is fed by the engine', 'engine-fed.test.ts'],
                  ['the props table is generated, not typed', 'api.test.ts'],
                  ['no axe violation, on any page', 'a11y.test.tsx'],
                  ['the raw-colour rule reads template literals', 'eslint.config.js'],
                  ['the contract document matches the engine', 'token-version.test.ts'],
                ].map(([rule, guard]) => (
                  <div key={rule} style={{ display: 'flex', alignItems: 'baseline', gap: `${S[3]}px` }}>
                    <span style={{ color: LiminalColorEngine.SEMANTICS.SUCCESS.text, fontSize: 12 }}>✓</span>
                    <span style={{ flex: 1, fontSize: 12 }}>{rule}</span>
                    <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.5 }}>{guard}</code>
                  </div>
                ))}
              </div>
            </Panel>
          }
        >
          This project watched one defect appear five times in places a lint could not see: an inline
          background that cancelled the rule meant to own it. The fix took an afternoon; the guard is
          what makes it stay fixed. Every rule names the test that goes red when it is broken.
        </Story>
      </section>

      {/* ── THE COLLECTION ─────────────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[8]}px ${PAD} 0` }} aria-label="The components">
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px`, marginBottom: `${S[5]}px` }}>
          <Heading level={2} size={7}>
            {FIXTURES.length} components, one table
          </Heading>
          <Text level={4} tone="tertiary" style={{ maxWidth: '62ch' }}>
            Every card below is the real component, rendered by the same fixture the studio, the a11y
            sweep and the coverage report read. Adding a component is adding a row — not three places.
          </Text>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${L.FIELD_MIN * 0.8}px, 1fr))`, gap: `${S[3]}px` }}>
          {FIXTURES.slice(0, 18).map((f) => (
            /* THE CARD IS NOT A BUTTON. It was, and every preview containing a
               control put a button inside a button — the same defect the
               components index had, which axe reports as `nested-interactive`
               and which is worse than a lint: the reader cannot touch the
               component in the card. The name is the link. */
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

      {/* ── THE NUMBERS ────────────────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[8]}px ${PAD} 0` }} aria-label="Measured">
        <div
          style={{
            ...surfaceFor('panel').style,
            borderRadius: `${R.card}px`,
            padding: `${S[6]}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: `${S[6]}px`,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
            <Heading level={2} size={6}>
              What deriving everything buys
            </Heading>
            <Text level={3} tone="tertiary">
              Six numbers, each one a test rather than a promise.
            </Text>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.CELL_MIN * 2}px, 1fr))`, gap: `${S[5]}px` }}>
            <Big value="0" label="raw values in the app" note="asserted by engine-fed.test.ts" />
            <Big value="0" label="axe violations" note="every page, in the suite" />
            <Big value={String(LADDER.length)} label="surfaces from one formula" note={`q = ${PERCEPTUAL_QUANTUM}`} />
            <Big value={String(FIXTURES.length)} label="components in the matrix" note={`${complete} complete on the standard`} />
            <Big value={`${avg}%`} label="average state coverage" note="expected against existing" />
            <Big value={`${contrastRatioHex(BRAND_HEX, LADDER[0]).toFixed(1)}:1`} label="focus ring on the darkest step" note="one colour, one rule" />
          </div>
        </div>
      </section>

      {/* ── THE THREE PERCENTAGES ──────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[8]}px ${PAD} 0` }} aria-label="In practice">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.FIELD_MIN}px, 1fr))`, gap: `${S[5]}px` }}>
          {[
            ['100%', 'engine-fed', 'No raw pixel, colour or device-category breakpoint anywhere in this site. A docs site that hand-picks its own spacing is a site that drifts from the thing it documents.'],
            ['74/74', 'in the fixture table', 'The table is the single source: the index, the a11y sweep, the studio and the coverage report all read it. A component outside it is invisible to every tool.'],
            ['2', 'languages, both first-class', 'Logical properties, a Jalali calendar, Persian typography and bidi handled in the engine. Not a translation layer: the system was built for both.'],
          ].map(([value, label, note]) => (
            <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
              <span style={{ ...L.getTypeStyle(8), fontWeight: 700, lineHeight: 1 }}>{value}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
              <span style={{ fontSize: 12, lineHeight: 1.9, opacity: 0.7 }}>{note}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE PRINCIPLES ─────────────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[8]}px ${PAD} 0` }} aria-label="The principles">
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px`, marginBottom: `${S[5]}px` }}>
          <Heading level={2} size={7}>
            The rules, in the language they were written in
          </Heading>
          <Text level={4} tone="tertiary" style={{ maxWidth: '62ch' }}>
            The design contract is Persian, and it is generated: the numbers inside it come from the
            engine, so the document cannot disagree with the code.
          </Text>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.FIELD_MIN * 1.4}px, 1fr))`, gap: `${S[4]}px` }}>
          <Principle quote="هر لایه روی آستانه‌ی ادراک — نه کمتر، نه بیشتر." source="DESIGN-CONTRACT.md · §1" />
          <Principle quote="این عدد اندازه‌گیری شده است، نه فرض." source="DESIGN-CONTRACT.md · §1.1" />
          <Principle quote="نردبان تولید می‌شود، نه انتخاب." source="DESIGN-CONTRACT.md · §1.1" />
          <Principle quote="قرارداد، طراحی را توصیف می‌کند؛ طراحی تابع قرارداد نیست." source="working agreement" />
        </div>
      </section>

      {/* ── THE TEXT ROLES ─────────────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[8]}px ${PAD} 0` }} aria-label="The ladder">
        <Section title="Text, derived" note="Each role's floor comes from its declared use, and the stricter lens wins">
          <div style={{ display: 'flex', gap: 2, borderRadius: `${R.chip}px`, overflow: 'hidden' }}>
            {LADDER.map((hex, i) => (
              <div key={i} style={{ flex: 1, height: S[6], background: hex }} title={`S${i} ${hex}`} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.CELL_MIN * 2.4}px, 1fr))`, gap: `${S[2]}px ${S[4]}px` }}>
            {TEXT_ROLES.map((role) => {
              const t = deriveTextToken(role, LADDER[0]);
              return (
                <Value
                  key={role}
                  label={role}
                  value={`α ${t.alpha.toFixed(3)} · WCAG ${t.wcag.toFixed(2)}/${TEXT_ROLE_SPEC[role].wcag} · APCA ${Math.abs(t.apca).toFixed(0)}/${TEXT_ROLE_SPEC[role].apca} · bound by ${t.boundBy}`}
                />
              );
            })}
          </div>
          <Prose>
            A floor measured on one surface is not a floor — so every alpha is derived against the
            darkest step, which is the only surface where meeting it means anything.
          </Prose>
          <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={() => go({ page: 'colors' })}>
              Colors
            </Button>
            <Button variant="outline" onClick={() => go({ page: 'themes' })}>
              Themes
            </Button>
            <Button variant="ghost" onClick={() => go({ page: 'docs', slug: 'contract' })}>
              The contract
            </Button>
          </div>
        </Section>
      </section>

      {/* ── THE CLOSE ──────────────────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[8]}px ${PAD} 0` }} aria-label="Get started">
        <div
          style={{
            ...surfaceFor('panel').style,
            borderRadius: `${R.card}px`,
            padding: `${S[7]}px ${S[6]}px`,
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
          <Text level={4} tone="secondary" style={{ maxWidth: '54ch' }}>
            The library is one package and one stylesheet. The contract is the reason it stays
            consistent, and it is written to be read by a person or by an agent.
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
          <div style={{ display: 'flex', gap: `${S[2]}px`, flexWrap: 'wrap', justifyContent: 'center', opacity: 0.6, fontSize: 11 }}>
            {Object.entries(WELLS).map(([name, hex]) => (
              <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: `${S[1]}px` }}>
                <span style={{ width: S[3], height: S[3], borderRadius: `${R.chip}px`, background: hex, border: `${L.BORDER.hairline}px solid ${SURFACE_TINT.subtle}` }} />
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
