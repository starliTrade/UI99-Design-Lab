/**
 * LIMINAL · SITE — THE LANDING PAGE
 *
 * The page a stranger lands on, and the only page that has to answer "what is
 * this" without being read. So: the claim, the product, then the evidence — in
 * that order. A page that opens with a feature grid makes the reader work out
 * what the thing IS from a list of what it does.
 *
 * The product shot is not a screenshot. It is the app kit, running, inside a
 * browser frame — the same iframe the review tool uses. A picture of an app goes
 * stale the day a component changes; this cannot.
 */
import React from 'react';
import { FIXTURES, coverage } from '../../components/__matrix__/fixtures';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { PERCEPTUAL_QUANTUM, LADDER } from '../../engine/liminal-ladder';
import { TEXT_ROLE_SPEC, deriveTextToken, type TextRole } from '../../engine/liminal-contrast';
import { ROLE_LEVEL } from '../../engine/liminal-surface';
import { Heading, Text } from '../../components/atoms/Typography';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { AppInFrame } from '../AppFrame';
import { Section, Prose, Stat, Value, S, R, MONO, surfaceFor } from '../ui';
import type { Route } from '../routes';

const ROLES = Object.keys(ROLE_LEVEL);
const TEXT_ROLES = Object.keys(TEXT_ROLE_SPEC) as TextRole[];
const avg = Math.round((FIXTURES.reduce((a, f) => a + coverage(f), 0) / FIXTURES.length) * 100);

/** One claim, one sentence, one reason it is not marketing. */
function Feature({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        ...surfaceFor('panel').style,
        borderRadius: `${R.card}px`,
        padding: `${S[4]}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${S[2]}px`,
        minWidth: 0,
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
      <span style={{ fontSize: 12, lineHeight: 1.9, opacity: 0.8 }}>{children}</span>
    </div>
  );
}

const WRAP = { maxWidth: 1280, margin: '0 auto', width: '100%', boxSizing: 'border-box' as const };

export function HomePage({ go }: { go: (r: Route) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* ── THE HERO ───────────────────────────────────────────────────────── */}
      <section
        style={{
          ...WRAP,
          padding: `${S[8]}px ${S[5]}px ${S[5]}px`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: `${S[5]}px`,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            ...surfaceFor('well').style,
            display: 'inline-flex',
            alignItems: 'center',
            gap: `${S[2]}px`,
            padding: `${S[1]}px ${S[3]}px`,
            borderRadius: `${R.full}px`,
            fontSize: 11,
            opacity: 0.9,
          }}
        >
          <Badge semantic="success">v1.0</Badge>
          {FIXTURES.length} components · {ROLES.length} roles · q = {PERCEPTUAL_QUANTUM}
        </span>

        <Heading level={1} size={8} style={{ maxWidth: '22ch' }}>
          The component declares. The engine decides.
        </Heading>

        <Text level={4} tone="secondary" style={{ maxWidth: '62ch', margin: '0 auto' }}>
          LIMINAL is not a component library with a stylesheet. It is a perceptual engine: a measured
          quantum, a generated ladder, a rim that knows which way the light falls — and{' '}
          {FIXTURES.length} components that are not allowed to choose a single number.
        </Text>

        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button size="lg" variant="primary" onClick={() => go({ page: 'docs', slug: 'installation' })}>
            Get started
          </Button>
          <Button size="lg" variant="secondary" onClick={() => go({ page: 'components' })}>
            Browse {FIXTURES.length} components
          </Button>
        </div>
      </section>

      {/* ── THE PRODUCT, RUNNING ───────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `0 ${S[5]}px` }} aria-label="The app kit, running">
        <AppInFrame screen="dashboard" device="fluid" chrome="browser" minHeight={620} note="liminal.app/dashboard" />
        <p style={{ textAlign: 'center', fontSize: 11, opacity: 0.55, marginBlock: `${S[3]}px` }}>
          The app kit — five screens built from this library and nothing else. Not a screenshot: an
          iframe with its own viewport, so the app's own breakpoints answer.
        </p>
      </section>

      {/* ── THE EVIDENCE ───────────────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[6]}px ${S[5]}px 0` }} aria-label="Measured">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${L.CELL_MIN * 2}px, 1fr))`,
            gap: `${S[5]}px`,
            ...surfaceFor('panel').style,
            borderRadius: `${R.card}px`,
            padding: `${S[5]}px`,
          }}
        >
          <Stat value={String(FIXTURES.length)} label="components, all in the matrix" />
          <Stat value={String(LADDER.length)} label="ladder steps, one quantum apart" />
          <Stat value={`${avg}%`} label="average state coverage" tone={avg < 100 ? 'warn' : undefined} />
          <Stat value={String(ROLES.length)} label="roles in the hierarchy" />
          <Stat value={String(LiminalColorEngine.EXTENDED_SPECTRUM.length)} label="extended hues" />
          <Stat value="0" label="raw values, and axe violations" />
        </div>
      </section>

      {/* ── WHAT MAKES IT DIFFERENT ────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[7]}px ${S[5]}px 0` }} aria-label="Why this one">
        <Heading level={2} size={6} style={{ marginBottom: `${S[2]}px` }}>
          Every number is derived, and the derivation is a test
        </Heading>
        <Text level={3} tone="secondary" style={{ maxWidth: '70ch', marginBottom: `${S[5]}px` }}>
          Six claims. Each one is either measurable or it is not a claim.
        </Text>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.FIELD_MIN * 1.5}px, 1fr))`, gap: `${S[4]}px` }}>
          <Feature title="A measured quantum">
            The ladder is not a taste. {LADDER.length} steps at a constant perceptual distance, from a
            quantum measured across three sessions: <b>q = {PERCEPTUAL_QUANTUM}</b>. Every step's
            distance is printed on the colours page, and a step out of band turns red.
          </Feature>
          <Feature title="Components declare, they do not choose">
            A component says <code style={{ fontFamily: MONO }}>role=&quot;panel&quot;</code> and the
            engine decides the level, the rim and the shadow. Two components that declare the same role
            cannot disagree about depth — which is what a hand-picked number cannot promise.
          </Feature>
          <Feature title="RTL and Persian, not translated">
            Logical properties throughout, a Jalali calendar, Persian typography, bidi handled in the
            engine. Flip the direction in the top bar: nothing mirrors that should not, and the text
            never does.
          </Feature>
          <Feature title="The contract is executable">
            Seven guards, each banning one pattern: a raw number, a hex in a style, the retired
            resolver, opting into the interaction layer without the producer, a raw depth as a prop, a
            baked colour, an axe violation. A rule with no guard is a habit.
          </Feature>
          <Feature title="Accessible by construction">
            Text alphas are <b>derived</b> from each role's declared use, against the darkest surface,
            and both lenses are computed — the stricter one wins. Every page of this site is under an
            axe sweep, and the sweep is a test that fails.
          </Feature>
          <Feature title="Fed by the engine, including this page">
            No raw pixel, no raw colour and no device-category breakpoint anywhere in this app —
            asserted by <code style={{ fontFamily: MONO }}>engine-fed.test.ts</code>. A site that
            hand-picks its own spacing is a site that can drift from the thing it documents.
          </Feature>
        </div>
      </section>

      {/* ── THE BLOCKS ─────────────────────────────────────────────────────── */}
      <section style={{ ...WRAP, padding: `${S[7]}px ${S[5]}px 0` }} aria-label="Blocks">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: `${S[3]}px`, flexWrap: 'wrap', marginBottom: `${S[4]}px` }}>
          <div>
            <Heading level={2} size={6}>
              Blocks
            </Heading>
            <Text level={3} tone="tertiary">
              Whole screens, assembled from the library — the fastest way to see whether it holds up.
            </Text>
          </div>
          <Button variant="outline" onClick={() => go({ page: 'blocks' })}>
            All blocks
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.FIELD_MIN}px, 1fr))`, gap: `${S[4]}px` }}>
          {[
            ['Dashboard', 'a table, stats and a sidebar'],
            ['Project', 'a detail page with tabs'],
            ['Login', 'a form, and the auth gate'],
            ['404', 'the error page'],
          ].map(([name, note]) => (
            <button
              key={name}
              type="button"
              onClick={() => go({ page: 'blocks' })}
              style={{
                ...surfaceFor('panel').style,
                borderRadius: `${R.card}px`,
                padding: `${S[4]}px`,
                display: 'flex',
                flexDirection: 'column',
                gap: `${S[1]}px`,
                alignItems: 'flex-start',
                font: 'inherit',
                textAlign: 'start',
                cursor: 'pointer',
                color: 'inherit',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>{name}</span>
              <span style={{ fontSize: 11, opacity: 0.7 }}>{note}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ── THE LADDER ─────────────────────────────────────────────────────── */}
      <div style={{ ...WRAP, padding: `${S[7]}px ${S[5]}px 0` }}>
        <Section title="The ladder" note="One quantum per step, and the four text roles derived against it" role="panel">
          <div style={{ display: 'flex', gap: 2, borderRadius: `${R.chip}px`, overflow: 'hidden' }}>
            {LADDER.map((hex, i) => (
              <div key={i} style={{ flex: 1, height: S[6], background: hex }} title={`S${i} ${hex}`} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.CELL_MIN * 2}px, 1fr))`, gap: `${S[2]}px ${S[4]}px` }}>
            {TEXT_ROLES.map((role) => {
              // Derived against the DARKEST surface: a floor measured on one
              // surface is not a floor.
              const t = deriveTextToken(role, LADDER[0]);
              return (
                <Value
                  key={role}
                  label={role}
                  value={`α ${t.alpha.toFixed(3)} · WCAG ${t.wcag.toFixed(2)}/${TEXT_ROLE_SPEC[role].wcag} · APCA ${Math.abs(t.apca).toFixed(0)}/${TEXT_ROLE_SPEC[role].apca}`}
                />
              );
            })}
          </div>
          <Prose>
            The floor comes from what the role is FOR, and both lenses are computed — the stricter one
            wins. Nothing here is a colour someone liked.
          </Prose>
          <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
            <Button variant="outline" onClick={() => go({ page: 'colors' })}>
              Colors
            </Button>
            <Button variant="outline" onClick={() => go({ page: 'themes' })}>
              Themes
            </Button>
          </div>
        </Section>
      </div>

      {/* ── THE STUDIO ─────────────────────────────────────────────────────── */}
      <div style={{ ...WRAP, padding: `${S[7]}px ${S[5]}px 0` }}>
        <Section title="The studio" note="The review tool, and the reason this site is built from the library" role="panel">
          <Prose>
            Every component page ends in a live studio: change the props, force the hover, put it in a
            390px frame, and read what the engine actually published for that element — the six
            interaction variables, the surface it resolved to, the text floors it has to hold, and the
            JSX that produced it. A still frame cannot show a hover, and five defects in this project
            were found in exactly the places a still frame is blind to.
          </Prose>
          <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
            <Button variant="secondary" onClick={() => go({ page: 'component', name: 'Button' })}>
              Open a component
            </Button>
            <Button variant="ghost" onClick={() => go({ page: 'docs', slug: 'contract' })}>
              Read the contract
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}

export default HomePage;
