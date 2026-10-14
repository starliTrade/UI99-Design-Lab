/**
 * LIMINAL · SITE — THE DOCS
 *
 * Seven pages, each answering one question a reader arrives with. They are one
 * file because they are one shape: a title, a few sections, and a live example
 * where the claim can be shown instead of asserted.
 *
 * Every number on these pages is read from the engine at render time. A doc that
 * types a value into a paragraph is a doc that goes stale silently — and this
 * project has already paid for that once, when a page carried a copy of the
 * ladder that had drifted from the real one.
 */
import React from 'react';
import { LADDER, LADDER_CHROMA, PERCEPTUAL_QUANTUM, WELLS, BRAND_HEX } from '../../engine/liminal-ladder';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { LiminalMotionEngine as M } from '../../engine/liminal-motion-engine';
import { ROLE_LEVEL, ROLE_RIM, ROLE_SHADOW, resolveSurface } from '../../engine/liminal-surface';
import { TEXT_ROLE_SPEC, deriveTextToken, type TextRole } from '../../engine/liminal-contrast';
import { oklchLightness, contrastRatioHex } from '../../engine/liminal-color-math';
import { getTextStyle, SURFACE_TINT } from '../../engine/spec-engine';
import { Heading, Text } from '../../components/atoms/Typography';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Input } from '../../components/inputs/Input';
import { Toggle } from '../../components/atoms/Toggle';
import { Section, Prose, Value, Code, S, R, MONO, surfaceFor, Segmented } from '../ui';
import { Example } from '../Example';
import { useTheme } from '../theme';
import { FIXTURES } from '../../components/__matrix__/fixtures';
import type { DocSlug, Route } from '../routes';

const ROLES = Object.keys(ROLE_LEVEL) as (keyof typeof ROLE_LEVEL)[];
const TEXT_ROLES = Object.keys(TEXT_ROLE_SPEC) as TextRole[];

/** A copy-paste block, with the copy button a reader expects. */
function Snippet({ children, note }: { children: string; note?: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(children).then(done).catch(done);
    else done();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px`, minWidth: 0 }}>
      <div
        style={{
          ...surfaceFor('well').style,
          display: 'flex',
          alignItems: 'flex-start',
          gap: `${S[3]}px`,
          padding: `${S[3]}px`,
          borderRadius: `${R.card}px`,
          minWidth: 0,
        }}
      >
        <pre
          style={{
            flex: 1,
            margin: 0,
            fontFamily: MONO,
            fontSize: 12,
            direction: 'ltr',
            textAlign: 'left',
            overflowX: 'auto',
            whiteSpace: 'pre',
            color: getTextStyle('secondary', 1).color,
          }}
        >
          {children}
        </pre>
        <button
          type="button"
          onClick={copy}
          style={{
            ...surfaceFor('control').style,
            font: 'inherit',
            fontSize: 11,
            padding: `${S[0]}px ${S[2]}px`,
            borderRadius: `${R.chip}px`,
            flexShrink: 0,
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {note && <span style={{ fontSize: 11, opacity: 0.6 }}>{note}</span>}
    </div>
  );
}

function Introduction() {
  return (
    <>
      <Section title="What this is" note="An engine, and a kit that is not allowed to choose" role="panel">
        <Prose>
          LIMINAL is a design system for dark interfaces where <b>nothing is hand-picked</b>. There is
          no stylesheet of chosen values at the bottom of it: there is a class that computes them. A
          component declares what it <i>is</i> — a panel, a control, a well — and the engine decides
          which of the {LADDER.length} surfaces it sits on, which rim it gets, and how far it is from
          the thing behind it.
        </Prose>
        <Prose>
          The reason is not purity. It is that a chosen number drifts: the same panel written twice
          lands on two different greys, and no test can say which one is right. A derived number
          cannot drift, and a test can say exactly what it should be.
        </Prose>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.CELL_MIN * 2}px, 1fr))`, gap: `${S[2]}px ${S[4]}px` }}>
          <Value label="Components" value={`${FIXTURES.length}, all in one fixture table`} />
          <Value label="Surfaces" value={`${ROLES.length} roles, ${LADDER.length} steps`} />
          <Value label="Quantum" value={String(PERCEPTUAL_QUANTUM)} />
          <Value label="Text roles" value={`${TEXT_ROLES.length}, derived per surface`} />
        </div>
      </Section>

      <Section title="The three rules" note="Everything else follows from them">
        <Prose>
          <b>Values become tokens. Selections become names. Raw numbers are forbidden.</b>
        </Prose>
        <Prose>
          The third is the one that keeps the first two true. A raw number inside a component is a
          decision that no longer has a name, so nothing can check it — and this project found the same
          defect five times in places a lint could not see, which is why the lint is a test now.
        </Prose>
      </Section>

      <Section title="Where to go next">
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          <Badge>Installation</Badge>
          <Badge>Theming</Badge>
          <Badge>Typography</Badge>
          <Badge>Accessibility</Badge>
          <Badge>The contract</Badge>
        </div>
      </Section>
    </>
  );
}

function Installation() {
  return (
    <>
      <Section title="Add it to an app" note="One package, one stylesheet" role="panel">
        <Prose>
          The library ships as a package with its own CSS. The stylesheet carries the ladder, the
          interaction layer, the motion scale and the forced-colors fallbacks — the components
          themselves carry no colours at all.
        </Prose>
        <Snippet note="The package and its stylesheet. Nothing else is required.">{`bun add liminal
# then, once, in your entry:

import 'liminal/styles.css';`}</Snippet>
      </Section>

      <Section title="Use a component">
        <Prose>
          Import it and render it. There is nothing to configure: a component that needs a surface
          declares a role, and the engine resolves it against whatever it is sitting on.
        </Prose>
        <Snippet>{`import { Button, Card, Input } from 'liminal';

<Card>
  <Input label="Email" type="email" />
  <Button variant="primary">Continue</Button>
</Card>`}</Snippet>
        <Example title="That is the whole setup" element={<Button>Continue</Button>}>
          <Button>Continue</Button>
        </Example>
      </Section>

      <Section title="Requirements">
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Value label="React" value="19 or newer" />
          <Value label="TypeScript" value="strict, and the types ship" />
          <Value label="CSS" value="custom properties — no preprocessor" />
          <Value label="Direction" value="LTR and RTL, from the same markup" />
        </div>
      </Section>
    </>
  );
}

function Theming() {
  const { theme, state } = useTheme();
  return (
    <>
      <Section title="A theme is two scales" note="Not a colour" role="panel">
        <Prose>
          The theme has <b>density</b> and <b>motion</b>. There is no hue, and that is the decision
          rather than an omission: the ladder is a monochrome luminance ramp at chroma{' '}
          {LADDER_CHROMA.toFixed(4)}, and a ramp that can turn green is not an identity —
          it is leaving the system. A theme that could destroy the system's identity is not a feature.
        </Prose>
        <Prose>
          Move the sliders in the top bar. They are live on this page, because a theme demonstrated on
          a picture of the site proves nothing about the site.
        </Prose>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.CELL_MIN * 2}px, 1fr))`, gap: `${S[2]}px ${S[4]}px` }}>
          <Value label="Density" value={`${state.density.toFixed(2)}× (clamped at the touch floor)`} />
          <Value label="Motion" value={`${state.motion.toFixed(2)}× (clamped so nothing is instant)`} />
          <Value label="Ladder" value={`${theme.ladder.length} steps — engine-owned, not themed`} />
          <Value label="Warnings" value={theme.warnings.length ? theme.warnings.map((w) => w.scale).join(', ') : 'none'} />
        </div>
      </Section>

      <Section title="What density moves" note="Radius, and the spacing it is derived with">
        <Prose>
          Density scales the radius, and the radius is concentric: an inner radius is the outer one
          minus the padding between them. Scaling the padding without the radius is how a nested card
          ends up with a corner that does not sit inside its parent's.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[4]}px`, flexWrap: 'wrap', alignItems: 'center' }}>
          {[R.chip, R.control, R.card, R.panel].map((r) => (
            <div
              key={r}
              style={{
                ...surfaceFor('panel').style,
                width: L.CELL_MIN * 2,
                height: L.CELL_MIN,
                borderRadius: `${r}px`,
                border: `${L.BORDER.hairline}px solid ${SURFACE_TINT.medium}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                opacity: 0.8,
              }}
            >
              r {r}
            </div>
          ))}
        </div>
      </Section>

      <Section title="The generated CSS" note="What the theme actually emits">
        <Snippet note="Scoped to the attribute the provider puts on the root. Everything else is the engine's.">
          {theme.css}
        </Snippet>
      </Section>
    </>
  );
}

function Typography() {
  const { theme } = useTheme();
  return (
    <>
      <Section title="The scale is fluid, and that is accessibility" note="WCAG 2.2 · 1.4.4" role="panel">
        <Prose>
          Eight levels at a fixed ratio of {L.TYPE_RATIO}. The ratio is the design; the <b>base</b> is
          the reading condition, and it depends on how far the screen is from the eye — 14px on a
          phone held close, 16.5px on a monitor. So the base is a <code style={{ fontFamily: MONO }}>rem</code>{' '}
          clamp, which also means it honours the reader's own browser font-size setting. A px-only
          scale ignores that, and ignoring it is a failure of 1.4.4.
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[3]}px` }}>
          {([8, 7, 6, 5, 4, 3, 2, 1] as const).map((level) => (
            <div key={level} style={{ display: 'flex', alignItems: 'baseline', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
              <code style={{ fontFamily: MONO, fontSize: 11, width: 64, opacity: 0.6 }}>level {level}</code>
              <span style={{ ...L.getTypeStyle(level) }}>The quick brown fox</span>
              <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.5 }}>
                {L.TYPOGRAPHY[level].role} · {L.TYPOGRAPHY[level].weight}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Outline and size are different decisions">
        <Prose>
          A card's title is structurally an <code style={{ fontFamily: MONO }}>h3</code> and visually
          whatever the card needs. Forcing those to agree is how a page ends up with a heading level
          chosen for its size — which is a heading level chosen for the wrong reason. So{' '}
          <code style={{ fontFamily: MONO }}>Heading</code> takes <code style={{ fontFamily: MONO }}>level</code>{' '}
          (the element) and <code style={{ fontFamily: MONO }}>size</code> (the step) separately.
        </Prose>
        <Example
          title="An h3 that looks like a display heading"
          element={<Heading level={3} size={8}>Structurally third, visually first</Heading>}
        >
          <Heading level={3} size={8}>Structurally third, visually first</Heading>
        </Example>
      </Section>

      <Section title="Text roles, and the floor each one has to hold">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ opacity: 0.65 }}>
                {['Role', 'Declared use', 'WCAG floor', 'APCA floor', 'Alpha on S0'].map((h) => (
                  <th key={h} style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEXT_ROLES.map((role) => {
                const t = deriveTextToken(role, LADDER[0]);
                return (
                  <tr key={role} style={{ borderTop: `${L.BORDER.hairline}px solid ${SURFACE_TINT.medium}` }}>
                    <td style={{ padding: `${S[1]}px ${S[2]}px` }}>
                      <code style={{ fontFamily: MONO }}>{role}</code>
                    </td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, opacity: 0.8 }}>{TEXT_ROLE_SPEC[role].use}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{TEXT_ROLE_SPEC[role].wcag}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{TEXT_ROLE_SPEC[role].apca}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{t.alpha.toFixed(3)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Prose>
          The floor comes from the declared use, and the alpha is derived to meet it on the darkest
          surface — which is the only surface where meeting it means anything. Both lenses are
          computed and the stricter one wins.
        </Prose>
        <Value label="Motion multiplier now" value={`${theme.motion.toFixed(2)}×`} />
      </Section>
    </>
  );
}

function Accessibility() {
  return (
    <>
      <Section title="The floors are derived, not chosen" role="panel">
        <Prose>
          Every text role has a WCAG floor and an APCA floor, both from what the role is <i>for</i>.
          The engine computes the alpha that satisfies both on the darkest surface and reports which
          lens bound it — so a failure says which rule it broke, not only that it broke one.
        </Prose>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.CELL_MIN * 2}px, 1fr))`, gap: `${S[2]}px ${S[4]}px` }}>
          {TEXT_ROLES.map((role) => {
            const t = deriveTextToken(role, LADDER[0]);
            return <Value key={role} label={role} value={`${t.wcag.toFixed(2)}:1 · Lc ${Math.abs(t.apca).toFixed(0)} · bound by ${t.boundBy}`} />;
          })}
        </div>
      </Section>

      <Section title="Target size is the control height">
        <Prose>
          The default control height is <b>{L.CONTROL.md}px</b>, which is not a taste: WCAG 2.5.5 asks
          for {L.TARGET.min}×{L.TARGET.min} CSS px. The system's minimum interactive size and the
          accessible minimum are the same number, so they are one name.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap', alignItems: 'center' }}>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px`, alignItems: 'center' }}>
              <Button size={size} variant="secondary">
                {size}
              </Button>
              <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.6 }}>{L.CONTROL[size]}px</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Focus is one colour and one rule">
        <Prose>
          A focus ring is drawn by the interaction layer, not by each component, so it cannot be
          forgotten by one of them. It is visible against every surface in the ladder, and its
          contrast against the darkest step is{' '}
          <b>{contrastRatioHex(BRAND_HEX, LADDER[0]).toFixed(2)}:1</b>.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="secondary">Tab to me</Button>
          <Input label="And me" placeholder="focus is visible" />
          <Toggle checked onChange={() => {}} aria-label="And me" />
        </div>
      </Section>

      <Section title="Reduced motion is handled once">
        <Prose>
          <code style={{ fontFamily: MONO }}>prefers-reduced-motion</code> is honoured in the
          interaction layer, globally, so no component has to remember. The motion scale's floor means
          a theme cannot make a transition instant either — a transition that finishes before the eye
          registers it is not feedback.
        </Prose>
        <Value label="Reduced-motion query" value={M.REDUCED_MOTION_QUERY} />
      </Section>

      <Section title="This site is under the same sweep">
        <Prose>
          Every page here is rendered and scanned with axe in the test suite. It found seven real
          defects the first time it ran — including a {'<label>'} with no {'htmlFor'}, an{' '}
          {'aria-expanded'} on a textbox, and a {'<button>'} inside a {'<button>'} on the components
          index.
        </Prose>
      </Section>
    </>
  );
}

function Contract() {
  const guards: [string, string][] = [
    ['Values become tokens', 'no-raw-numbers.test.ts — a raw number in a component fails'],
    ['Selections become names', 'the surface resolver is the only path to a depth'],
    ['No raw colour in a style', 'the ESLint rule, anchored to the full literal'],
    ['One producer for the interaction variables', 'interaction-vars.test.ts — opting in means publishing'],
    ['The app is fed by the engine', 'engine-fed.test.ts — no raw px, colour or breakpoint in this site'],
    ['The API table is generated', 'api.test.ts — the props table is stale if the types moved'],
    ['No axe violation, on any page', 'a11y.test.tsx — the site is held to the rules it documents'],
  ];
  return (
    <>
      <Section title="A rule with no guard is a habit" role="panel">
        <Prose>
          This project watched one defect appear five times in places a lint could not see: an inline
          background that cancelled the rule meant to own it. The fix took an afternoon; the guard is
          what makes it stay fixed. Every rule below names the test that goes red when it is broken.
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
          {guards.map(([rule, guard]) => (
            <div key={rule} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{rule}</span>
              <code style={{ fontFamily: MONO, fontSize: 11, opacity: 0.65 }}>{guard}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="The hierarchy is declared, not picked">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ opacity: 0.65 }}>
                {['Role', 'Level', 'Rim', 'Shadow', 'Colour'].map((h) => (
                  <th key={h} style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role} style={{ borderTop: `${L.BORDER.hairline}px solid ${SURFACE_TINT.medium}` }}>
                  <td style={{ padding: `${S[1]}px ${S[2]}px` }}>
                    <code style={{ fontFamily: MONO }}>{role}</code>
                  </td>
                  <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>S{ROLE_LEVEL[role]}</td>
                  <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{ROLE_RIM[role]}</td>
                  <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>
                    {ROLE_SHADOW[role] === null ? '—' : `E${ROLE_SHADOW[role]}`}
                  </td>
                  <td style={{ padding: `${S[1]}px ${S[2]}px` }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: S[7],
                        height: S[3],
                        borderRadius: `${R.chip}px`,
                        background: LADDER[ROLE_LEVEL[role]],
                        border: `${L.BORDER.hairline}px solid ${SURFACE_TINT.subtle}`,
                        verticalAlign: 'middle',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Prose>
          A component declares a role, not a step. Two components that declare the same role cannot
          disagree about depth — which is exactly what a hand-picked number cannot promise.
        </Prose>
      </Section>

      <Section title="Wells: below the canvas">
        <Prose>
          A well is the one role that goes <b>down</b> rather than up — for the things a reader looks
          into rather than at: a code block, a track, a drop zone. It is the only place the ladder
          leaves the canvas, and it is named so it cannot be improvised.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          {Object.entries(WELLS).map(([name, hex]) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
              <span
                style={{
                  width: L.CELL_MIN * 2,
                  height: S[6],
                  background: hex,
                  borderRadius: `${R.chip}px`,
                  border: `${L.BORDER.hairline}px solid ${SURFACE_TINT.medium}`,
                }}
              />
              <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.6 }}>
                {name} · {hex} · L {oklchLightness(hex).toFixed(4)}
              </code>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function Agents() {
  return (
    <>
      <Section title="A contract an agent can read" role="panel">
        <Prose>
          The rules in this system are written as checks rather than as prose, which means they can be
          read by something that is not a person. The props table on every component page is generated
          from the TypeScript types — {FIXTURES.length} components, and the generator is guarded by a
          test that fails when it goes stale.
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Value label="Fixture table" value="src/components/__matrix__/fixtures.tsx — one row per component" />
          <Value label="Generated API" value="src/site/api.json — props, types, defaults, reasons" />
          <Value label="Guards" value="seven, each banning one pattern" />
          <Value label="Contract document" value="DESIGN-CONTRACT.md, in Persian" />
        </div>
      </Section>

      <Section title="One table, four outputs">
        <Prose>
          The fixture table is the single source: the components index, the a11y sweep, the studio and
          the coverage report all read it. Adding a component is adding a row — not three places. A
          component that is in the library and not in the table is invisible to every tool, which is
          exactly what happened to three of them before a test was written for it.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[2]}px`, flexWrap: 'wrap' }}>
          {FIXTURES.slice(0, 12).map((f) => (
            <Badge key={f.name}>{f.name}</Badge>
          ))}
          <Badge>{`+ ${FIXTURES.length - 12} more`}</Badge>
        </div>
      </Section>

      <Section title="What an agent should not do">
        <Prose>
          Do not write a colour, a pixel or a breakpoint. Do not call the retired resolver. Do not
          publish the interaction variables by hand — there is one producer and a guard that says so.
          If a component needs a value the engine does not have, the value is the thing to add, not
          the literal.
        </Prose>
      </Section>
    </>
  );
}

const PAGES: Record<DocSlug, { title: string; note: string; body: () => React.ReactElement }> = {
  introduction: { title: 'Introduction', note: 'What this is, and what it claims', body: Introduction },
  installation: { title: 'Installation', note: 'Add it to an app', body: Installation },
  theming: { title: 'Theming', note: 'Two scales, and an identity that is not a setting', body: Theming },
  typography: { title: 'Typography', note: 'The scale, and why it is fluid', body: Typography },
  accessibility: { title: 'Accessibility', note: 'The rules, and the guards that hold them', body: Accessibility },
  contract: { title: 'The contract', note: 'The rules as executable checks', body: Contract },
  agents: { title: 'For agents', note: 'A machine-readable contract', body: Agents },
};

export function DocsPage({ slug, go }: { slug: DocSlug; go: (r: Route) => void }) {
  const page = PAGES[slug] ?? PAGES.introduction;
  const Body = page.body;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[6]}px`, minWidth: 0 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
        <Heading level={1} size={7}>
          {page.title}
        </Heading>
        <Text level={3} tone="tertiary">
          {page.note}
        </Text>
      </header>
      <Body />
      <Section title="Next">
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          <Button variant="secondary" onClick={() => go({ page: 'components' })}>
            Browse the components
          </Button>
          <Button variant="outline" onClick={() => go({ page: 'themes' })}>
            Try a theme
          </Button>
        </div>
      </Section>
    </div>
  );
}

export default DocsPage;
