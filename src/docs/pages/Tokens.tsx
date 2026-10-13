/**
 * LIMINAL · DOCS — TOKENS
 *
 * The engine's outputs, with the arithmetic that produced them. A token page
 * that only lists names teaches nothing; this one shows the step between each
 * surface, the alpha each text role derives to, and the floor that bound it.
 */
import React from 'react';
import { LADDER, getTextStyle } from '../../engine/spec-engine';
import { WELLS } from '../../engine/liminal-ladder';
import { PERCEPTUAL_QUANTUM, FOCUS_RING_COLOR } from '../../engine/liminal-ladder';
import { oklchLightness, contrastRatioHex } from '../../engine/liminal-color-math';
import { deriveTextToken, TEXT_ROLE_SPEC, type TextRole } from '../../engine/liminal-contrast';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { Section, Prose, Value, Stat, MONO, S, R } from '../ui';
import { useTheme } from '../theme';

const ROLES: TextRole[] = ['primary', 'secondary', 'tertiary', 'quaternary'];

export function TokensPage() {
  const { theme } = useTheme();
  const steps = theme.ladder.map((hex, i) =>
    i === 0 ? null : (oklchLightness(hex) - oklchLightness(theme.ladder[i - 1])) / PERCEPTUAL_QUANTUM,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <Section title="The ladder" note={`${theme.ladder.length} steps · quantum ${PERCEPTUAL_QUANTUM}`} role="work">
        <Prose>
          Each step sits one <b>perceptual quantum</b> from the one below — not an arbitrary
          percentage. A green number means the step is in band; red means this hue cannot hold it.
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          {theme.ladder.map((hex, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: `${S[3]}px` }}>
              <code style={{ fontFamily: MONO, fontSize: 11, width: 24 }}>S{i}</code>
              <span
                style={{ width: 84, height: 20, background: hex, borderRadius: `${R.chip}px`, border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <code style={{ fontFamily: MONO, fontSize: 11 }}>{hex}</code>
              <code style={{ fontFamily: MONO, fontSize: 11, opacity: 0.7 }}>
                L {oklchLightness(hex).toFixed(4)}
              </code>
              {steps[i] !== null && (
                <code
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: (steps[i] as number) < 1 ? 'var(--liminal-danger, #ba4646)' : undefined,
                    opacity: (steps[i] as number) < 1 ? 1 : 0.7,
                  }}
                >
                  +{(steps[i] as number).toFixed(2)}q
                </code>
              )}
            </div>
          ))}
        </div>
        {theme.warnings.length > 0 && (
          <Prose>
            <b style={{ color: 'var(--liminal-danger, #ba4646)' }}>{theme.warnings.length} warnings:</b>{' '}
            {theme.warnings.map((w) => `S${w.level} (${w.q.toFixed(2)}q)`).join(' · ')}
          </Prose>
        )}
      </Section>

      <Section title="Text" note="The alpha is derived, not chosen">
        <Prose>
          Each role's floor comes from its <b>declared use</b>: primary for headings, secondary
          and tertiary for any text meant to be read, quaternary for non-text marks only. Both
          lenses are computed and <b>the stricter one wins</b>.
        </Prose>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ opacity: 0.65 }}>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>Role</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>Use</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>WCAG floor</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>APCA floor</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>Sample on S3</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => {
                const spec = TEXT_ROLE_SPEC[role];
                const t = deriveTextToken(role, theme.ladder[3]);
                return (
                  <tr key={role} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: `${S[1]}px ${S[2]}px` }}>
                      <code style={{ fontFamily: MONO }}>{role}</code>
                    </td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, opacity: 0.75 }}>{spec.use}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{spec.wcag}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{spec.apca}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px` }}>
                      <span style={{ color: t.value, fontSize: 13 }}>The quick brown fox</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: `${S[3]}px` }}>
          {ROLES.map((role) => {
            const t = deriveTextToken(role, theme.ladder[3]);
            return (
              <Value
                key={role}
                label={`${role} on S3`}
                value={`α ${t.alpha.toFixed(3)} · ${t.boundBy}`}
              />
            );
          })}
        </div>
      </Section>

      <Section title="Wells" note="Below the canvas — depth, not colour">
        <Prose>
          A well is where something is <b>recessed</b>: an empty state, a code block, a pressed
          control. It sits one and a half steps below the canvas — between the canvas and chrome,
          not at an invented value.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          {Object.entries(WELLS).map(([name, hex]) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
              <span style={{ width: 96, height: 28, background: hex, borderRadius: `${R.chip}px`, border: '1px solid rgba(255,255,255,0.08)' }} />
              <code style={{ fontFamily: MONO, fontSize: 11 }}>
                {name} {hex}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Semantic and extended" note="Only the hue is convention, not the colour">
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          {(Object.keys(LiminalColorEngine.SEMANTICS) as (keyof typeof LiminalColorEngine.SEMANTICS)[]).map((k) => (
            <div key={String(k)} style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
              <span
                style={{
                  width: 64,
                  height: 26,
                  background: LiminalColorEngine.SEMANTICS[k].solid,
                  borderRadius: `${R.chip}px`,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
              <code style={{ fontFamily: MONO, fontSize: 10 }}>{String(k)}</code>
            </div>
          ))}
        </div>
        <Prose>
          There are also {LiminalColorEngine.EXTENDED_SPECTRUM.length} extended hues — for charts
          and labels, never for a surface. A surface always comes from the ladder.
        </Prose>
      </Section>

      <Section title="The focus ring" note="One colour, one rule">
        <div style={{ display: 'flex', alignItems: 'center', gap: `${S[4]}px`, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: `${S[2]}px ${S[4]}px`,
              borderRadius: `${R.control}px`,
              outline: `2px solid ${FOCUS_RING_COLOR}`,
              outlineOffset: 2,
              fontSize: 12,
            }}
          >
            Keyboard focus
          </span>
          <Value label="Colour" value={FOCUS_RING_COLOR} />
          <Value
            label="Contrast on S0"
            value={`${contrastRatioHex(FOCUS_RING_COLOR, LADDER[0]).toFixed(2)}:1`}
          />
        </div>
      </Section>
    </div>
  );
}
