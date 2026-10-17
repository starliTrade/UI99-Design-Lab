/**
 * LIMINAL · SITE — COLORS
 *
 * The engine's colour outputs, with the arithmetic that produced them. A page
 * that lists colour names teaches nothing; this one shows the step between each
 * surface, the alpha each text role derives to, and the floor that bound it.
 */
import React from 'react';
import { LADDER, LADDER_HUE, LADDER_CHROMA, PERCEPTUAL_QUANTUM, WELLS, BRAND_HEX } from '../../engine/liminal-ladder';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { oklchLightness, oklchToHex, contrastRatioHex } from '../../engine/liminal-color-math';
import { TEXT_ROLE_SPEC, deriveTextToken, type TextRole } from '../../engine/liminal-contrast';
import { ROLE_LEVEL, ROLE_RIM, ROLE_SHADOW } from '../../engine/liminal-surface';
import { SURFACE_TINT, getTextStyle } from '../../engine/spec-engine';
import { Heading, Text } from '../../components/atoms/Typography';
import { Section, Prose, Value, MONO, S, R, surfaceFor } from '../ui';
import { useTheme } from '../theme';

const SEMANTICS = LiminalColorEngine.SEMANTICS;
const ROLES = Object.keys(ROLE_LEVEL) as (keyof typeof ROLE_LEVEL)[];
const TEXT_ROLES = Object.keys(TEXT_ROLE_SPEC) as TextRole[];

export function ColorsPage() {
  const { theme } = useTheme();
  const steps = theme.ladder.map((hex, i) =>
    i === 0 ? null : (oklchLightness(hex) - oklchLightness(theme.ladder[i - 1])) / PERCEPTUAL_QUANTUM,
  );

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S[5]}px`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: `${S[6]}px`, minWidth: 0 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
        <Heading level={1} size={7}>
          Colors
        </Heading>
        <Text level={3} tone="tertiary" style={{ maxWidth: '70ch' }}>
          The ladder is generated, not chosen: {theme.ladder.length} steps at a constant perceptual
          distance from a quantum measured across three sessions. A step out of band turns red — the
          page reports the measurement rather than asserting the claim.
        </Text>
      </header>

      <Section title="The ladder" note={`quantum ${PERCEPTUAL_QUANTUM} · hue ${LADDER_HUE} · chroma ${LADDER_CHROMA}`} role="panel">
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          {theme.ladder.map((hex, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
              <code style={{ fontFamily: MONO, fontSize: 11, width: S[7] }}>S{i}</code>
              <span
                style={{
                  width: L.CELL_MIN * 1.5,
                  height: S[5],
                  background: hex,
                  borderRadius: `${R.chip}px`,
                  border: `${L.BORDER.hairline}px solid ${SURFACE_TINT.subtle}`,
                }}
              />
              <code style={{ fontFamily: MONO, fontSize: 11 }}>{hex}</code>
              <code style={{ fontFamily: MONO, fontSize: 11, opacity: 0.7 }}>L {oklchLightness(hex).toFixed(4)}</code>
              {steps[i] !== null && (
                <code
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: (steps[i] as number) < 1 ? SEMANTICS.DANGER.text : undefined,
                    opacity: (steps[i] as number) < 1 ? 1 : 0.7,
                  }}
                >
                  +{(steps[i] as number).toFixed(2)}q
                </code>
              )}
            </div>
          ))}
        </div>
        <Prose>
          Each step is one quantum from the one below — not an arbitrary percentage. The work surface
          is quantised to two steps, because a work plane that sits at one and a half steps is a plane
          nobody can name.
        </Prose>
      </Section>

      <Section title="Text" note="The alpha is derived, not chosen">
        <Prose>
          Each role's floor comes from its <b>declared use</b>: primary for headings, secondary and
          tertiary for any text meant to be read, quaternary for non-text marks only. Both lenses are
          computed and the stricter one wins — so a failure says which rule it broke.
        </Prose>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ opacity: 0.65 }}>
                {['Role', 'Declared use', 'WCAG floor', 'APCA floor', 'Alpha on S0', 'Sample on S3'].map((h) => (
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
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, opacity: 0.75 }}>{TEXT_ROLE_SPEC[role].use}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{TEXT_ROLE_SPEC[role].wcag}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{TEXT_ROLE_SPEC[role].apca}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{t.alpha.toFixed(3)}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, background: LADDER[3] }}>
                      <span style={{ color: getTextStyle(role, 3).color }}>The quick brown fox</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Wells" note="Below the canvas — depth, not colour">
        <Prose>
          A well is the one role that goes <b>down</b>: the things a reader looks into rather than at —
          a code block, a track, a drop zone. It is the only place the ladder leaves the canvas.
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
              <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.65 }}>
                {name} · {hex} · L {oklchLightness(hex).toFixed(4)}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Semantic and extended" note="Only the hue is convention, not the colour">
        <Prose>
          The four semantic roles are derived from the same lightness band, so they are equally loud —
          a warning that shouts louder than a danger is a warning that has been misused. The{' '}
          {LiminalColorEngine.EXTENDED_SPECTRUM.length} extended hues are for charts and labels, never
          for a surface.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          {(['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const).map((key) => {
            const s = SEMANTICS[key];
            return (
              <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
                <span style={{ width: L.CELL_MIN * 2, height: S[6], background: s.solid ?? s.text, borderRadius: `${R.chip}px` }} />
                <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.65 }}>{key.toLowerCase()}</code>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: S[1], flexWrap: 'wrap' }}>
          {LiminalColorEngine.EXTENDED_SPECTRUM.map((c) => (
            <span
              key={c.label}
              title={`${c.label} ${c.hex}`}
              style={{ width: S[6], height: S[6], background: c.hex, borderRadius: `${R.chip}px` }}
            />
          ))}
        </div>
      </Section>

      <Section title="The hierarchy, as colour">
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
      </Section>

      <Section title="The focus ring">
        <div style={{ display: 'flex', alignItems: 'center', gap: `${S[4]}px`, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: `${S[2]}px ${S[4]}px`,
              borderRadius: `${R.control}px`,
              outline: `${L.BORDER.emphasis}px solid ${BRAND_HEX}`,
              outlineOffset: S[0],
              fontSize: 12,
            }}
          >
            Keyboard focus
          </span>
          <Value label="Colour" value={BRAND_HEX} />
          <Value label="Contrast on S0" value={`${contrastRatioHex(BRAND_HEX, LADDER[0]).toFixed(2)}:1`} />
          <Value label="Contrast on S8" value={`${contrastRatioHex(BRAND_HEX, LADDER[8]).toFixed(2)}:1`} />
        </div>
        <Prose>
          One colour, one rule, drawn by the interaction layer rather than by each component — so it
          cannot be forgotten by one of them. It is visible against every step in the ladder, which is
          why it is measured against the darkest and the lightest rather than against one.
        </Prose>
      </Section>

      <Section title="The derivation, visible">
        <Prose>
          A hue can hold only so much chroma at a given lightness before sRGB clips, so the engine
          computes the maximum and takes the smaller of that and the constant. That is why a semantic
          colour at the same lightness is as loud as its neighbour rather than as loud as it wanted to
          be.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          {[0.2, 0.35, 0.5, 0.65, 0.8].map((l) => (
            <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
              <span
                style={{
                  width: L.CELL_MIN,
                  height: S[6],
                  background: oklchToHex({ L: l, C: LADDER_CHROMA, h: LADDER_HUE }),
                  borderRadius: `${R.chip}px`,
                }}
              />
              <code style={{ fontFamily: MONO, fontSize: 10, opacity: 0.65 }}>L {l}</code>
            </div>
          ))}
        </div>
        <div style={{ ...surfaceFor('well').style, borderRadius: `${R.card}px`, padding: `${S[3]}px`, fontSize: 11, lineHeight: 2, opacity: 0.85 }}>
          The ladder is one hue at increasing lightness — {LADDER_HUE}° at chroma {LADDER_CHROMA}. Every
          step is the same colour; only the light changes.
        </div>
      </Section>
    </div>
  );
}

export default ColorsPage;
