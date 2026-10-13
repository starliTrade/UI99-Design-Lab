/**
 * LIMINAL · DOCS — OVERVIEW
 *
 * The first page answers one question: what is this, and what does it claim?
 * Every number here is read from the engine at render time — not typed into a
 * paragraph where it can quietly go stale.
 */
import React from 'react';
import { FIXTURES, coverage } from '../../components/__matrix__/fixtures';
import { LADDER, getTextStyle } from '../../engine/spec-engine';
import { ROLE_LEVEL, ROLE_RIM, ROLE_SHADOW } from '../../engine/liminal-surface';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { Section, Stat, Value, Prose, Code, MONO, S, R } from '../ui';

const ROLES = Object.keys(ROLE_LEVEL) as (keyof typeof ROLE_LEVEL)[];

export function OverviewPage({ go }: { go: (name: string) => void }) {
  const avg = Math.round((FIXTURES.reduce((a, f) => a + coverage(f), 0) / FIXTURES.length) * 100);
  const complete = FIXTURES.filter((f) => coverage(f) === 1).length;
  const incomplete = FIXTURES.length - complete;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <Section title="LIMINAL" note="A mathematically derived dark system — an engine, not a token file" role="work">
        <Prose>
          This is not a component library with a CSS file. It is an <b>engine</b>: every surface,
          every edge, every colour and every space comes from a rule — and the rule is written as a
          test. Components do not choose anything. They declare <b>what they are</b>, and the engine
          decides.
        </Prose>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: `${S[4]}px` }}>
          <Stat value={String(ROLES.length)} label="Roles in the hierarchy" />
          <Stat value={String(LADDER.length)} label="Ladder steps" />
          <Stat value={String(FIXTURES.length)} label="Components in the matrix" />
          <Stat value={`${avg}%`} label="Average coverage" tone={avg < 100 ? 'warn' : undefined} />
          <Stat value={String(incomplete)} label="Incomplete" tone={incomplete ? 'warn' : undefined} />
          <Stat value={String(LiminalColorEngine.EXTENDED_SPECTRUM.length)} label="Extended hues" />
        </div>
      </Section>

      <Section title="The hierarchy" note="One number, one meaning — depth from the canvas">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: 'start', opacity: 0.65 }}>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>Role</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>Level</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>Rim</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>Shadow</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>Colour</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => (
                <tr key={role} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
                        width: 34,
                        height: 16,
                        borderRadius: `${R.chip}px`,
                        background: LADDER[ROLE_LEVEL[role]],
                        border: '1px solid rgba(255,255,255,0.08)',
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
          A component declares a <b>role</b>, not a step. Two components that declare the same role
          cannot disagree about depth — which is exactly what a hand-picked number cannot promise.
        </Prose>
      </Section>

      <Section title="The rule everything comes from" note="One sentence, and seven guards that enforce it">
        <Prose>
          <b>Values become tokens. Selections become names. Raw numbers are forbidden.</b>
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Value label="Ladder" value={`${LADDER.length} steps, constant ΔL`} />
          <Value label="Text" value="alphas derived from each role's declared use" />
          <Value label="Level" value="resolveSurface({ role }) — the only way" />
          <Value label="Interaction" value="resolveInteractionVars — six variables, one producer" />
          <Value label="Theme" value="createLiminalTheme — three numbers" />
        </div>
        <Prose>
          And seven guards, each banning one pattern: a raw number · a hex in a style · the
          retired resolver · opting in without the producer · a raw depth as a prop · a baked colour
          in a style · an axe violation.
        </Prose>
      </Section>

      <Section title="The state of the components" note="Measured, not asserted">
        <Prose>
          The engine is complete. The components are not — and the reason is plain: they were
          written <b>before</b> the engine settled. This is that distance, measured.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[2]}px`, flexWrap: 'wrap' }}>
          {FIXTURES.map((f) => {
            const c = Math.round(coverage(f) * 100);
            const missing = f.expected.filter((s) => !f.states.includes(s));
            return (
              <button
                key={f.name}
                type="button"
                onClick={() => go(f.name)}
                style={{
                  font: 'inherit',
                  fontSize: 11,
                  padding: `${S[1]}px ${S[2]}px`,
                  borderRadius: `${R.chip}px`,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'transparent',
                  color: missing.length ? 'var(--liminal-danger, #ba4646)' : 'inherit',
                  opacity: c === 100 ? 0.75 : 1,
                  cursor: 'pointer',
                }}
              >
                {f.name} <code style={{ fontFamily: MONO, opacity: 0.7 }}>{c}%</code>
              </button>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
