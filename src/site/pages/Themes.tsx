/**
 * LIMINAL · SITE — THEMES
 *
 * The theme builder. Two scales, live on the page you are reading — because a
 * theme demonstrated on a picture of the site proves nothing about the site.
 *
 * There is no hue picker, and that is the decision rather than an omission. The
 * ladder is a monochrome luminance ramp; a ramp that can turn green is not an
 * identity, it is leaving the system. When a hue was proposed as a feature, the
 * measurement said the same thing the eye did: the first surface layer ended up
 * 43% further from the background than the design intent.
 */
import React from 'react';
import { LADDER, LADDER_CHROMA, PERCEPTUAL_QUANTUM } from '../../engine/liminal-ladder';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../engine/liminal-motion-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { oklchLightness } from '../../engine/liminal-color-math';
import { SURFACE_TINT, getTextStyle } from '../../engine/spec-engine';
import { Heading, Text } from '../../components/atoms/Typography';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Input } from '../../components/inputs/Input';
import { Toggle } from '../../components/atoms/Toggle';
import { Card } from '../../components/containers/Card';
import { Section, Prose, Value, MONO, S, R, surfaceFor } from '../ui';
import { useTheme, SYSTEM_THEME } from '../theme';

const SEMANTICS = LiminalColorEngine.SEMANTICS;

/** A copy-paste block. The theme is generated, so what you copy is what runs. */
function Copyable({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  const copy = () => {
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    };
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(done);
    else done();
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px`, minWidth: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: `${S[2]}px` }}>
        <span style={{ fontSize: 11, opacity: 0.65 }}>{label}</span>
        <button
          type="button"
          onClick={copy}
          style={{
            ...surfaceFor('control').style,
            font: 'inherit',
            fontSize: 11,
            padding: `${S[0]}px ${S[2]}px`,
            borderRadius: `${R.chip}px`,
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        style={{
          ...surfaceFor('well').style,
          margin: 0,
          padding: `${S[3]}px`,
          borderRadius: `${R.card}px`,
          fontFamily: MONO,
          fontSize: 11,
          direction: 'ltr',
          textAlign: 'left',
          overflowX: 'auto',
          whiteSpace: 'pre',
          maxHeight: 320,
          color: getTextStyle('secondary', 1).color,
        }}
      >
        {text}
      </pre>
    </div>
  );
}

export function ThemesPage() {
  const { state, set, reset, theme, isSystem } = useTheme();

  const scales = [
    { key: 'density' as const, label: 'Density', min: 0.8, max: 1.4, step: 0.05, note: 'scales the radius, and the spacing it is derived with' },
    { key: 'motion' as const, label: 'Motion', min: 0, max: 2, step: 0.1, note: 'scales the durations, with a floor so nothing becomes instant' },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S[5]}px`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: `${S[6]}px`, minWidth: 0 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
        <Heading level={1} size={7}>
          Themes
        </Heading>
        <Text level={3} tone="tertiary" style={{ maxWidth: '70ch' }}>
          A theme is two scales — density and motion — and the ladder is not one of them. Move them and
          this page changes under you, because the theme is applied to the site you are reading rather
          than to a preview of it.
        </Text>
      </header>

      <Section title="The two scales" note="Live, on this page" role="panel">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.FIELD_MIN}px, 1fr))`, gap: `${S[4]}px` }}>
          {scales.map((s) => (
            <label key={s.key} style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px`, minWidth: 0 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {s.label} <code style={{ fontFamily: MONO, fontWeight: 400, opacity: 0.7 }}>{state[s.key].toFixed(2)}×</code>
              </span>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={state[s.key]}
                aria-label={s.label}
                onChange={(e) => set({ ...state, [s.key]: Number(e.target.value) })}
                style={{ width: '100%', accentColor: LADDER[8] }}
              />
              <span style={{ fontSize: 11, opacity: 0.65 }}>{s.note}</span>
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="secondary" onClick={reset} disabled={isSystem}>
            Reset to the system theme
          </Button>
          <Value label="System" value={`density ${SYSTEM_THEME.density} · motion ${SYSTEM_THEME.motion}`} />
        </div>
        {theme.warnings.length > 0 && (
          <ul style={{ margin: 0, paddingInlineStart: `${S[4]}px`, fontSize: 11, color: SEMANTICS.DANGER.text }}>
            {theme.warnings.map((w, i) => (
              <li key={i}>
                <code style={{ fontFamily: MONO }}>{w.scale}</code> asked for {w.asked} · used {w.used} — {w.why}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="A preview, in the theme you set" note="The real components, not a mock-up">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fit, minmax(${L.FIELD_MIN}px, 1fr))`,
            gap: `${S[4]}px`,
            alignItems: 'start',
          }}
        >
          <Card title="A card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[3]}px` }}>
              <Input label="Email" placeholder="you@example.com" />
              <div style={{ display: 'flex', gap: `${S[2]}px`, alignItems: 'center', flexWrap: 'wrap' }}>
                <Button variant="primary">Save</Button>
                <Button variant="ghost">Cancel</Button>
                <Toggle checked onChange={() => {}} aria-label="Notifications" />
              </div>
              <div style={{ display: 'flex', gap: `${S[2]}px`, flexWrap: 'wrap' }}>
                <Badge semantic="success">Success</Badge>
                <Badge semantic="warning">Warning</Badge>
                <Badge semantic="danger">Danger</Badge>
                <Badge>Neutral</Badge>
              </div>
            </div>
          </Card>
          <Card title="The ladder">
            <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
              <div style={{ display: 'flex', gap: 2, borderRadius: `${R.chip}px`, overflow: 'hidden' }}>
                {theme.ladder.map((hex, i) => (
                  <div key={i} style={{ flex: 1, height: S[6], background: hex }} title={`S${i} ${hex}`} />
                ))}
              </div>
              <Value label="Steps" value={String(theme.ladder.length)} />
              <Value label="Quantum" value={String(PERCEPTUAL_QUANTUM)} />
              <Value label="Identical to the engine's" value={theme.ladder.every((h, i) => h === LADDER[i]) ? 'yes' : 'no'} />
            </div>
          </Card>
        </div>
      </Section>

      <Section title="What the theme emits" note="Generated by createLiminalTheme — the same function a consumer calls">
        <Copyable text={theme.css} label="the generated block" />
        <Prose>
          The block is scoped to the attribute the provider puts on the root, so two themes can coexist
          on one page. Everything it does not mention is the engine's: the ladder, the text alphas, the
          rims and the shadows are not themed, because they are the identity.
        </Prose>
      </Section>

      <Section title="Why there is no hue picker">
        <Prose>
          A hue applied to the neutral ramp does not add a colour — it removes the system. The ladder is
          built at chroma {LADDER_CHROMA.toFixed(4)}, which is the most a monochrome ramp
          can hold before it reads as a colour, and the perceptual spacing between steps is measured
          against that. Turning it green changes every contrast relationship in the system at once, and
          the measurement that follows is not a tweak: it is a different system with the same name.
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px`, maxWidth: '78ch' }}>
          <Value label="Chroma" value={LADDER_CHROMA.toFixed(4)} />
          <Value label="First step from the canvas" value={`${((oklchLightness(LADDER[1]) - oklchLightness(LADDER[0])) / PERCEPTUAL_QUANTUM).toFixed(2)}q`} />
          <Value label="Work surface" value={`${((oklchLightness(LADDER[2]) - oklchLightness(LADDER[0])) / PERCEPTUAL_QUANTUM).toFixed(2)}q from the canvas`} />
        </div>
      </Section>

      <Section title="Motion, as durations">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.CELL_MIN * 2}px, 1fr))`, gap: `${S[2]}px ${S[4]}px` }}>
          {Object.entries(M.DURATION).map(([name, ms]) => (
            <Value key={name} label={name} value={`${Math.round(ms * theme.motion)}ms`} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: `${S[2]}px`, flexWrap: 'wrap' }}>
          {Object.entries(M.EASING).map(([name, curve]) => (
            <span
              key={name}
              style={{
                ...surfaceFor('well').style,
                fontSize: 11,
                padding: `${S[1]}px ${S[3]}px`,
                borderRadius: `${R.full}px`,
                fontFamily: MONO,
                opacity: 0.8,
              }}
              title={curve}
            >
              {name}
            </span>
          ))}
        </div>
        <Prose>
          The durations are the engine's and the theme multiplies them. The floor exists because a
          transition that finishes before the eye registers it is not feedback — it is a flash.
        </Prose>
      </Section>
    </div>
  );
}

export default ThemesPage;
