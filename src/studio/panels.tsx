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
import { resolveSurface, type SurfaceRole } from '../engine/liminal-surface';
import { LiminalMotionEngine as M } from '../engine/liminal-motion-engine';
import type { LiminalTheme } from '../engine/liminal-theme';
import { SYSTEM_THEME, isSystemTheme, type StudioThemeState } from './theme';

const S = L.SPACING;
const R = L.RADIUS;

/** The studio's own chrome, declared as roles like everything else. */
const CHROME = resolveSurface({ role: 'chrome', interactive: false });
const WORK = resolveSurface({ role: 'work', interactive: false });
const PANEL = resolveSurface({ role: 'panel', interactive: false });
const WELL = resolveSurface({ role: 'well', interactive: false });

const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

export function Card({
  title,
  note,
  children,
  role = 'panel',
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  role?: SurfaceRole;
}) {
  const surface = role === 'chrome' ? CHROME : role === 'work' ? WORK : role === 'well' ? WELL : PANEL;
  return (
    <section
      aria-label={title}
      style={{
        ...surface.style,
        borderRadius: `${R.card}px`,
        padding: `${S[4]}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${S[3]}px`,
        minWidth: 0,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: `${S[2]}px`, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{title}</h3>
        {note && <span style={{ fontSize: 11, opacity: 0.7 }}>{note}</span>}
      </header>
      {children}
    </section>
  );
}

/** A read-only value, monospaced, so two runs can be compared character by character. */
export function Value({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: `${S[3]}px`, alignItems: 'baseline', minWidth: 0 }}>
      <span style={{ fontSize: 11, opacity: 0.7, flexShrink: 0 }}>{label}</span>
      <code
        style={{
          fontFamily: MONO,
          fontSize: 11,
          direction: 'ltr',
          textAlign: 'left',
          overflowWrap: 'anywhere',
          color: tone === 'warn' ? 'var(--liminal-danger, #ba4646)' : undefined,
        }}
      >
        {value}
      </code>
    </div>
  );
}

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
  state: StudioThemeState;
  theme: LiminalTheme;
  onChange: (next: StudioThemeState) => void;
}) {
  const system = isSystemTheme(state);
  return (
    <Card
      title="تم"
      note={system ? 'تمِ خودِ سیستم — مرجع' : 'تمِ زنده، روی همین ابزار'}
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
          label="هیو"
          value={state.brandHue}
          min={0}
          max={360}
          step={1}
          format={(v) => `${v}°`}
          onChange={(brandHue) => onChange({ ...state, brandHue })}
        />
        <Slider
          label="کرما"
          value={state.brandChroma}
          min={0}
          max={0.06}
          step={0.001}
          format={(v) => v.toFixed(3)}
          onChange={(brandChroma) => onChange({ ...state, brandChroma })}
        />
        <Slider
          label="چگالی"
          value={state.density}
          min={0.8}
          max={1.4}
          step={0.05}
          format={(v) => `${v.toFixed(2)}×`}
          onChange={(density) => onChange({ ...state, density })}
        />
        <Slider
          label="حرکت"
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
          بازگشت به تمِ سیستم
        </button>
        <span style={{ fontSize: 11, opacity: 0.7 }}>
          {theme.warnings.length === 0
            ? 'هر ۹ پله بالای کوانتوم — نردبان سالم است'
            : `${theme.warnings.length} هشدار روی پله‌ها`}
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
        <ul style={{ margin: 0, paddingInlineStart: `${S[4]}px`, fontSize: 11, opacity: 0.85 }}>
          {theme.warnings.map((w, i) => (
            <li key={i}>
              <code style={{ fontFamily: MONO }}>S{w.level}</code> — {w.q.toFixed(2)}q ·{' '}
              {w.kind === 'below-quantum' ? 'زیرِ کوانتوم: دو سطح که چشم جدا نمی‌کند' : 'بالای باند'}
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
      <Card title="موتور" note="چه چیزی برای همین المان منتشر شد">
        <span style={{ fontSize: 12, opacity: 0.7 }}>
          المانی با <code style={{ fontFamily: MONO }}>data-liminal-surface</code> در پیش‌نمایش نیست.
        </span>
      </Card>
    );
  }
  const missing = INTERACTION_VARS.filter((v) => !snapshot.vars[v]);
  return (
    <Card title="موتور" note="چه چیزی برای همین المان منتشر شد — خوانده‌شده از DOM، نه از حافظه">
      <Value label="سطح" value={snapshot.level === null ? '—' : `S${snapshot.level}`} />
      {INTERACTION_VARS.map((v) => (
        <Value key={v} label={v.replace('--liminal-', '')} value={snapshot.vars[v] || '—'} tone={snapshot.vars[v] ? undefined : 'warn'} />
      ))}
      <Value label="background" value={snapshot.background} />
      <Value label="box-shadow" value={snapshot.shadow.slice(0, 46)} />
      <Value label="cursor" value={snapshot.cursor} />
      {missing.length > 0 && (
        <p style={{ margin: 0, fontSize: 11, color: 'var(--liminal-danger, #ba4646)' }}>
          {missing.length} متغیر منتشر نشده — یعنی حالتی هست که این کنترل ندارد.
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
      <Card title="قرارداد" note={`متن روی ${surfaceHex}`}>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.9 }}>
          این سطح <b>روشن</b> است (L {oklchLightness(surfaceHex).toFixed(3)}). سلسله‌مراتبِ متنِ موتور
          سفید-روی-تیره است و کف‌هایش برای همان گفته شده — پس اینجا چیزی برای سنجیدن نیست.
          کامپوننت رنگِ روی خودش را اعلام می‌کند (<code style={{ fontFamily: MONO }}>onColor</code>).
        </p>
      </Card>
    );
  }
  return (
    <Card title="قرارداد" note={level === null ? `متن روی ${surfaceHex}` : `متن روی S${level} · ${surfaceHex}`}>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr', gap: `${S[2]}px ${S[3]}px`, fontSize: 11 }}>
        <span style={{ opacity: 0.6 }}>نقش</span>
        <span style={{ opacity: 0.6 }}>آلفا</span>
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
                  ? `می‌گذرد — سخت‌گیرتر: ${t.boundBy}`
                  : `زیرِ کف — سخت‌گیرتر: ${t.boundBy}`}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>
        آلفاها <b>مشتق</b> می‌شوند، نه انتخاب: کفِ هر نقش از کاربردِ اعلام‌شده‌اش می‌آید و
        سخت‌گیرترین عدسی برنده است.
      </p>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// THE JSX
// ─────────────────────────────────────────────────────────────────────────────

function isElement(v: unknown): v is React.ReactElement {
  return React.isValidElement(v);
}

function prop(name: string, value: unknown): string {
  if (typeof value === 'string') return `${name}="${value}"`;
  if (typeof value === 'number') return `${name}={${value}}`;
  if (typeof value === 'boolean') return value ? name : `${name}={false}`;
  return `${name}={…}`;
}

/**
 * The element tree as JSX source, one level deep.
 *
 * Not a string the studio invented: it walks the element the fixture returned,
 * so what you read is what rendered. Children deeper than one level are elided
 * with `…` rather than guessed.
 */
export function toJsx(el: React.ReactElement, indent = 0, depth = 0): string {
  const pad = '  '.repeat(indent);
  // `forwardRef` and `memo` wrap the component in an object, so `type.name` is
  // undefined and the panel would print "Component" for every one of them.
  const type = el.type as unknown as { displayName?: string; name?: string; render?: { name?: string } };
  const name =
    typeof el.type === 'string'
      ? el.type
      : type.displayName ?? type.name ?? type.render?.name ?? 'Component';
  const p = (el.props ?? {}) as Record<string, unknown>;
  const attrs = Object.entries(p)
    .filter(([k]) => k !== 'children')
    .map(([k, v]) => prop(k, v));
  const kids = p.children;
  const selfClosing = kids === undefined || kids === null;
  const head = `<${name}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  if (selfClosing) return `${pad}${head} />`;
  if (depth >= 1) return `${pad}${head}>…</${name}>`;
  const childList = Array.isArray(kids) ? kids : [kids];
  const rendered = childList.map((c) =>
    isElement(c) ? toJsx(c, indent + 1, depth + 1) : `${pad}  ${typeof c === 'string' ? c : '{…}'}`,
  );
  return `${pad}${head}>\n${rendered.join('\n')}\n${pad}</${name}>`;
}

export function CodePanel({ element }: { element: React.ReactElement }) {
  return (
    <Card title="کد" note="همان المانی که رندر شد">
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
        {toJsx(element)}
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
    <Card title="پوشش" note={`${name} — ${coveragePercent}%`}>
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
      <Value label="حالت‌ها" value={has.join(' · ') || '—'} />
      <Value label="اندازه‌ها" value={sizes.join(' · ') || '—'} />
      <Value label="واریانت‌ها" value={variants.join(' · ') || '—'} />
      {missing.length > 0 ? (
        <p style={{ margin: 0, fontSize: 11, color: 'var(--liminal-danger, #ba4646)' }}>
          کم است: {missing.join(' · ')}
        </p>
      ) : (
        <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>
          {expected.length ? 'هر چیزی که سیستم انتظار دارد را دارد' : 'سیستم برایش حالتی انتظار ندارد'}
        </p>
      )}
    </Card>
  );
}
