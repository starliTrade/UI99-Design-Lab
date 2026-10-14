/**
 * LIMINAL · STUDIO — THE PANELS
 *
 * Every panel answers a question the eye cannot:
 *
 *   ThemeBar        what does a theme actually change?
 *   EngineReadout   what did the engine publish for THIS element?
 *   ContractChecks  does that surface hold the contract's floors?
 *   CodePanel       what JSX produced it?
 *   CoveragePanel   what does the component have, and what is missing?
 *
 * Each one reads the engine — never a copy of its values. A panel that carried
 * its own numbers would agree with itself and disagree with the components.
 */
import React from 'react';
import { deriveTextToken, TEXT_ROLE_SPEC, type TextRole } from '../engine/liminal-contrast';
import { oklchLightness } from '../engine/liminal-color-math';
import { LiminalLayoutEngine as L } from '../engine/liminal-layout-engine';
import { Card, Value, MONO, S, R, toJsx } from './ui';
import { resolveSurface, type SurfaceRole } from '../engine/liminal-surface';
import { LiminalMotionEngine as M } from '../engine/liminal-motion-engine';
import type { LiminalTheme } from '../engine/liminal-theme';
import { SYSTEM_THEME, isSystemTheme, type ThemeState } from './theme';

/**
 * THE FORCING HARNESS.
 *
 * `:hover`, `:focus-visible` and `:active` cannot be set from JavaScript, and a
 * reviewer cannot hold a mouse over one component while reading another. So the
 * harness applies the LAYER'S OWN DECLARATIONS through a class. Identical
 * declarations — only the trigger differs. It is a harness, not behaviour: the
 * component still does the real thing when you use it.
 */
export const FORCE_CSS = `
.force-hover [data-liminal-surface] { background: var(--liminal-surface-hover); }
.force-hover [data-liminal-hover-color] { color: var(--liminal-hover-color); }
.force-active [data-liminal-surface] { background: var(--liminal-surface-active); transform: translateY(0.5px); }
.force-focus [data-liminal-surface]:not([data-liminal-focus-within]) { outline: 2px solid var(--liminal-brand, #E9ECF2); outline-offset: 2px; }
.force-focus [data-liminal-focus-within] { background: var(--liminal-surface-focus, var(--liminal-surface-idle)); border-color: var(--liminal-border-focus, var(--liminal-brand, #E9ECF2)); }
.force-disabled { opacity: 0.25; pointer-events: none; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// THE THEME BAR
// ─────────────────────────────────────────────────────────────────────────────

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px`, minWidth: 0 }}>
      <span style={{ fontSize: 11, opacity: 0.7 }}>
        {label} <code style={{ fontFamily: MONO, direction: 'ltr' }}>{format(value)}</code>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--liminal-brand, #E9ECF2)' }}
      />
    </label>
  );
}

export function ThemeBar({
  state,
  theme,
  onChange,
}: {
  state: ThemeState;
  theme: LiminalTheme;
  onChange: (next: ThemeState) => void;
}) {
  const system = isSystemTheme(state);
  return (
    <Card
      title="Theme"
      note={system ? 'The system theme — the reference' : 'Live, on this tool'}
      role="chrome"
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: `${S[4]}px`,
        }}
      >
        <Slider
          label="Density"
          value={state.density}
          min={0.8}
          max={1.4}
          step={0.05}
          format={(v) => `${v.toFixed(2)}×`}
          onChange={(density) => onChange({ ...state, density })}
        />
        <Slider
          label="Motion"
          value={state.motion}
          min={0}
          max={2}
          step={0.1}
          format={(v) => `${v.toFixed(1)}×`}
          onChange={(motion) => onChange({ ...state, motion })}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => onChange({ ...SYSTEM_THEME })}
          style={{
            ...resolveSurface({ role: 'control', on: 'chrome' }).style,
            font: 'inherit',
            fontSize: 12,
            padding: `${S[1]}px ${S[3]}px`,
            borderRadius: `${R.chip}px`,
          }}
        >
          Reset to the system theme
        </button>
        <span style={{ fontSize: 11, opacity: 0.7 }}>
          {theme.warnings.length === 0
            ? 'All nine steps above the quantum — the ladder holds'
            : `${theme.warnings.length} steps out of band`}
        </span>
      </div>

      {/* The ladder itself, so a hue change is visible as a value and not only as a mood. */}
      <div style={{ display: 'flex', gap: 2, borderRadius: `${R.chip}px`, overflow: 'hidden' }}>
        {theme.ladder.map((hex, i) => (
          <div
            key={i}
            title={`S${i} ${hex}`}
            style={{ flex: 1, height: 22, background: hex, border: '1px solid rgba(255,255,255,0.06)' }}
          />
        ))}
      </div>

      {theme.warnings.length > 0 && (
        <ul style={{ margin: 0, paddingInlineStart: `${S[4]}px`, fontSize: 11, opacity: 0.9 }}>
          {theme.warnings.map((w, i) => (
            <li key={i}>
              <code style={{ fontFamily: MONO }}>{w.scale}</code> asked for {w.asked} · used{' '}
              <code style={{ fontFamily: MONO }}>{w.used}</code> — {w.why}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT THE ENGINE PUBLISHED
// ─────────────────────────────────────────────────────────────────────────────

const INTERACTION_VARS = [
  '--liminal-surface-idle',
  '--liminal-surface-hover',
  '--liminal-surface-active',
  '--liminal-surface-focus',
  '--liminal-border-idle',
  '--liminal-border-focus',
] as const;

export interface EngineSnapshot {
  level: number | null;
  vars: Record<string, string>;
  background: string;
  shadow: string;
  cursor: string;
  outline: string;
}

/**
 * Read the engine's output off the rendered element.
 *
 * Not from `resolveSurface` a second time: the question is what the ENGINE
 * PUBLISHED for this element, and the only honest source is the element. The
 * level is derived from the variable it points at, which is how the engine
 * names it.
 */
export function readEngineSnapshot(el: HTMLElement | null, ladder: string[]): EngineSnapshot | null {
  if (!el) return null;
  const cs = getComputedStyle(el);
  const vars: Record<string, string> = {};
  for (const name of INTERACTION_VARS) vars[name] = cs.getPropertyValue(name).trim();
  // The LEVEL comes from the colour, not from the variable's name.
  //
  // `getComputedStyle().getPropertyValue()` RESOLVES a custom property, so
  // `var(--liminal-s3)` arrives as `#0b0d0f` and the name is gone. Matching the
  // name worked in the probe (which read the inline style) and silently
  // returned null here. The ladder is the engine's own, so an index into it is
  // a level.
  const idle = vars['--liminal-surface-idle'];
  const level = ladder.indexOf(idle) >= 0 ? ladder.indexOf(idle) : null;
  return {
    level,
    vars,
    background: cs.backgroundColor,
    shadow: cs.boxShadow,
    cursor: cs.cursor,
    outline: cs.outlineColor,
  };
}

export function EngineReadout({ snapshot }: { snapshot: EngineSnapshot | null }) {
  if (!snapshot) {
    return (
      <Card title="Engine" note="What the engine published for this element">
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          No element with <code style={{ fontFamily: MONO }}>data-liminal-surface</code> in the preview.
        </span>
      </Card>
    );
  }
  const missing = INTERACTION_VARS.filter((v) => !snapshot.vars[v]);
  return (
    <Card title="Engine" note="What the engine published — read from the DOM, not from memory">
      <Value label="Level" value={snapshot.level === null ? '—' : `S${snapshot.level}`} />
      {INTERACTION_VARS.map((v) => (
        <Value key={v} label={v.replace('--liminal-', '')} value={snapshot.vars[v] || '—'} tone={snapshot.vars[v] ? undefined : 'warn'} />
      ))}
      <Value label="background" value={snapshot.background} />
      <Value label="box-shadow" value={snapshot.shadow.slice(0, 46)} />
      <Value label="cursor" value={snapshot.cursor} />
      {missing.length > 0 && (
        <p style={{ margin: 0, fontSize: 11, color: 'var(--liminal-danger, #ba4646)' }}>
          {missing.length} variables not published — a state this control does not have.
        </p>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THE CONTRACT'S FLOORS
// ─────────────────────────────────────────────────────────────────────────────

const ROLES: TextRole[] = ['primary', 'secondary', 'tertiary', 'quaternary'];

/**
 * Every text role, derived against the surface the preview actually resolved to.
 *
 * The floors are the engine's declared uses, and the binding lens is reported —
 * so a failure says WHICH rule it broke, not only that it broke one.
 */
export function ContractChecks({ surfaceHex, level }: { surfaceHex: string; level: number | null }) {
  // Gated on the SURFACE, not on the level. A primary Button's fill is the
  // brand and an Alert's is its own hue — neither is a ladder step, and both
  // still carry text that has to hold the floors. Gating on the level meant the
  // panel said "nothing to check" for the two components with the most to check.
  /**
   * The text hierarchy is WHITE ON DARK, and the floors are stated against that.
   *
   * A primary Button's fill is the near-white brand, and its label is dark — so
   * running the white hierarchy against it reports a failure for text the
   * component never draws. A false alarm is worse than no check: it teaches a
   * reviewer to ignore the panel. On a light surface the engine has no derived
   * token at all, and the component declares its own on-colour; the panel says
   * so instead of inventing a verdict.
   */
  const light = oklchLightness(surfaceHex) > 0.5;
  if (light) {
    return (
      <Card title="Contract" note={`Text on ${surfaceHex}`}>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.9 }}>
          This surface is <b>light</b> (L {oklchLightness(surfaceHex).toFixed(3)}). The engine's
          text hierarchy is white-on-dark and its floors are stated for that — so there is nothing
          to measure here. The component declares its own on-colour
          (<code style={{ fontFamily: MONO }}>onColor</code>).
        </p>
      </Card>
    );
  }
  return (
    <Card title="Contract" note={level === null ? `Text on ${surfaceHex}` : `Text on S${level} · ${surfaceHex}`}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: `${S[2]}px ${S[3]}px`, fontSize: 11 }}>
        <span style={{ opacity: 0.6 }}>Role</span>
        <span style={{ opacity: 0.6 }}>Alpha</span>
        <span style={{ opacity: 0.6 }}>WCAG</span>
        <span style={{ opacity: 0.6 }}>APCA</span>
        {ROLES.map((role) => {
          const t = deriveTextToken(role, surfaceHex);
          const spec = TEXT_ROLE_SPEC[role];
          const wcagOk = t.wcag >= spec.wcag;
          const apcaOk = Math.abs(t.apca) >= spec.apca;
          const ok = wcagOk && apcaOk;
          return (
            <React.Fragment key={role}>
              <span>{role}</span>
              <code style={{ fontFamily: MONO }}>{t.alpha.toFixed(3)}</code>
              <code style={{ fontFamily: MONO, color: wcagOk ? undefined : 'var(--liminal-danger, #ba4646)' }}>
                {t.wcag.toFixed(2)} / {spec.wcag}
              </code>
              <code style={{ fontFamily: MONO, color: apcaOk ? undefined : 'var(--liminal-danger, #ba4646)' }}>
                {Math.abs(t.apca).toFixed(0)} / {spec.apca}
              </code>
              <span
                style={{
                  gridColumn: '1 / -1',
                  fontSize: 10,
                  opacity: ok ? 0.5 : 0.95,
                  color: ok ? undefined : 'var(--liminal-danger, #ba4646)',
                }}
              >
                {ok
                  ? `passes — bound by ${t.boundBy}`
                  : `below the floor — bound by ${t.boundBy}`}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>
        Alphas are <b>derived</b>, not chosen: each role's floor comes from its declared use and
        the stricter lens wins.
      </p>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THE JSX
// ─────────────────────────────────────────────────────────────────────────────

export function CodePanel({ element }: { element: React.ReactElement }) {
  const [copied, setCopied] = React.useState(false);
  const source = toJsx(element);
  const copy = () => {
    // `navigator.clipboard` is not available over a plain-HTTP origin, which is
    // exactly how the docs run locally. Falling back to the old path keeps the
    // button honest instead of silently doing nothing.
    const done = () => { setCopied(true); window.setTimeout(() => setCopied(false), 1400); };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(source).then(done).catch(done);
    } else {
      const ta = document.createElement('textarea');
      ta.value = source;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      done();
    }
  };
  return (
    <Card title="Code" note="The element that rendered">
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={copy}
          style={{
            ...resolveSurface({ role: 'control', on: 'panel' }).style,
            font: 'inherit',
            fontSize: 11,
            padding: `2px ${S[2]}px`,
            borderRadius: `${R.chip}px`,
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          fontFamily: MONO,
          fontSize: 11,
          direction: 'ltr',
          textAlign: 'left',
          overflowX: 'auto',
          whiteSpace: 'pre',
          opacity: 0.9,
        }}
      >
        {source}
      </pre>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COVERAGE
// ─────────────────────────────────────────────────────────────────────────────

export function CoveragePanel({
  name,
  has,
  expected,
  sizes,
  variants,
  coveragePercent,
}: {
  name: string;
  has: string[];
  expected: string[];
  sizes: string[];
  variants: string[];
  coveragePercent: number;
}) {
  const missing = expected.filter((s) => !has.includes(s));
  return (
    <Card title="Coverage" note={`${name} — ${coveragePercent}%`}>
      <div style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <div
          style={{
            width: `${coveragePercent}%`,
            height: '100%',
            background: 'var(--liminal-brand, #E9ECF2)',
            transition: M.getTransition('width', 'normal'),
          }}
        />
      </div>
      <Value label="States" value={has.join(' · ') || '—'} />
      <Value label="Sizes" value={sizes.join(' · ') || '—'} />
      <Value label="Variants" value={variants.join(' · ') || '—'} />
      {missing.length > 0 ? (
        <p style={{ margin: 0, fontSize: 11, color: 'var(--liminal-danger, #ba4646)' }}>
          Missing: {missing.join(' · ')}
        </p>
      ) : (
        <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>
          {expected.length ? 'Has everything the system expects' : 'The system expects no states for it'}
        </p>
      )}
    </Card>
  );
}
