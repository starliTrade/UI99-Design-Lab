/**
 * LIMINAL · STUDIO
 * «صفحه‌ای که ماتریس نمی‌تواند بسازد.»
 *
 * The matrix renders every state to static markup. That is enough to see a
 * component and not enough to TOUCH one: hover and focus are CSS, a prop change
 * is a re-render, and neither exists in a still frame. Five defects in this
 * project were found in exactly the places a still frame is blind to.
 *
 * So the studio is a live app, not a generated page. It answers four questions
 * the eye cannot:
 *
 *   what does the engine publish for THIS element?   read from the DOM
 *   does that surface hold the contract's floors?    derived, both lenses
 *   what does a theme actually change?               the tool re-themes itself
 *   what is missing?                                 measured against expected
 *
 * It is fed by the SAME fixture table the matrix uses, so adding a component is
 * still one row. And it is built from the engine's own roles — a tool that
 * hand-picked its surfaces could not audit a system that forbids hand-picking.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FIXTURES, coverage } from '../components/__matrix__/fixtures';
import type { ComponentFixture } from '../components/__matrix__/fixtures';
import { LiminalLayoutEngine as L } from '../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../engine/liminal-motion-engine';
import { resolveSurface } from '../engine/liminal-surface';
import { SYSTEM_THEME, STUDIO_THEME_SCOPE, useStudioTheme, type StudioThemeState } from './theme';
import {
  Card,
  CodePanel,
  ContractChecks,
  CoveragePanel,
  EngineReadout,
  ThemeBar,
  readEngineSnapshot,
  type EngineSnapshot,
} from './panels';

const S = L.SPACING;
const R = L.RADIUS;

const CHROME = resolveSurface({ role: 'chrome', interactive: false });
const WORK = resolveSurface({ role: 'work', interactive: false });
const WELL = resolveSurface({ role: 'well', interactive: false });

/** The states the harness can force, and the label a reviewer reads. */
const FORCED = [
  { id: 'none', label: 'آزاد' },
  { id: 'hover', label: 'hover' },
  { id: 'focus', label: 'focus' },
  { id: 'active', label: 'فشرده' },
  { id: 'disabled', label: 'غیرفعال' },
] as const;
type ForcedId = (typeof FORCED)[number]['id'];

/**
 * THE FORCING HARNESS.
 *
 * `:hover`, `:focus-visible` and `:active` cannot be set from JavaScript, and a
 * reviewer cannot hold a mouse over one component while reading another. So the
 * harness applies the LAYER'S OWN DECLARATIONS through a class. Identical
 * declarations — only the trigger differs. It is a harness, not behaviour: the
 * component still does the real thing when you use it.
 */
const FORCE_CSS = `
.force-hover [data-liminal-surface] { background: var(--liminal-surface-hover); }
.force-hover [data-liminal-hover-color] { color: var(--liminal-hover-color); }
.force-active [data-liminal-surface] { background: var(--liminal-surface-active); transform: translateY(0.5px); }
.force-focus [data-liminal-surface]:not([data-liminal-focus-within]) { outline: 2px solid var(--liminal-brand, #E9ECF2); outline-offset: 2px; }
.force-focus [data-liminal-focus-within] { background: var(--liminal-surface-focus, var(--liminal-surface-idle)); border-color: var(--liminal-border-focus, var(--liminal-brand, #E9ECF2)); }
.force-disabled { opacity: 0.25; pointer-events: none; }
`;

function controlsFor(f: ComponentFixture): { name: string; values: string[] }[] {
  const out: { name: string; values: string[] }[] = [];
  if (f.sizes.length) out.push({ name: 'size', values: f.sizes });
  if (f.states.length) out.push({ name: 'state', values: f.states });
  if (f.variants?.length) out.push({ name: 'variant', values: f.variants });
  return out;
}

const pct = (n: number) => Math.round(n * 100);

export function Studio() {
  const [theme, setTheme] = useState<StudioThemeState>({ ...SYSTEM_THEME });
  const live = useStudioTheme(theme);

  const groups = useMemo(() => [...new Set(FIXTURES.map((f) => f.group))], []);
  const [selected, setSelected] = useState<string>(FIXTURES[0].name);
  const [size, setSize] = useState<string | undefined>();
  const [state, setState] = useState<string | undefined>();
  const [variant, setVariant] = useState<string | undefined>();
  const [forced, setForced] = useState<ForcedId>('none');

  const fixture = FIXTURES.find((f) => f.name === selected) ?? FIXTURES[0];
  const controls = controlsFor(fixture);
  const activeSize = size && fixture.sizes.includes(size) ? size : fixture.sizes[0];
  const activeState = state && fixture.states.includes(state) ? state : fixture.states[0];
  const activeVariant = variant && fixture.variants?.includes(variant) ? variant : fixture.variants?.[0];

  const rendered = fixture.render(activeState, activeSize, activeVariant);

  // ── what the engine published, read off the element ──────────────────────
  const previewRef = useRef<HTMLDivElement>(null);
  const [snapshot, setSnapshot] = useState<EngineSnapshot | null>(null);
  useEffect(() => {
    const host = previewRef.current;
    if (!host) return;
    const el =
      host.querySelector<HTMLElement>('[data-liminal-surface]') ??
      host.querySelector<HTMLElement>('[data-liminal-focus-within]') ??
      host.querySelector<HTMLElement>('[data-liminal-focusable]');
    setSnapshot(readEngineSnapshot(el, live.ladder));
    // NOT `rendered`: `fixture.render(...)` returns a fresh element every render,
    // so depending on it re-runs the effect on every render, which sets state,
    // which renders again — an infinite loop. The inputs that actually change
    // what is on screen are the props and the theme.
  }, [selected, activeState, activeSize, activeVariant, forced, live.ladder]);

  /**
   * The surface the text actually sits on.
   *
   * Not always a ladder step: a primary Button's fill is the brand, and a
   * semantic Alert's is its own hue. So the resolved level is used when the
   * engine named one, and the element's own computed fill when it did not —
   * otherwise the contract panel would quietly check the wrong surface, which
   * is worse than not checking.
   */
  const surfaceHex = useMemo(() => {
    if (snapshot?.level != null) return live.ladder[Math.round(snapshot.level)];
    const solid = snapshot?.background.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (solid && !snapshot?.background.includes('0, 0, 0, 0')) {
      const hex = (n: string) => Number(n).toString(16).padStart(2, '0');
      return `#${hex(solid[1])}${hex(solid[2])}${hex(solid[3])}`;
    }
    return live.ladder[0];
  }, [snapshot, live.ladder]);

  const pick = (name: string) => {
    setSelected(name);
    const f = FIXTURES.find((x) => x.name === name)!;
    setSize(f.sizes[0]);
    setState(f.states[0]);
    setVariant(f.variants?.[0]);
    setForced('none');
  };

  return (
    <div
      data-liminal-theme={STUDIO_THEME_SCOPE}
      style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, width: '100%', minWidth: 0 }}
    >
      {/* The generated block, scoped by the attribute above. */}
      <style>{live.css}</style>
      <style>{FORCE_CSS}</style>

      <ThemeBar state={theme} theme={live} onChange={setTheme} />

      {/* A flex row that WRAPS, not a media query.
       *
       * The studio lives inside the demo's own frame, so the viewport width says
       * nothing about the room it has: at a 1440px window the frame is about
       * 600px wide, and a `min-width: 900px` query laid the panels out for a
       * width they never had. `flex-wrap` asks the container, which is the only
       * thing that knows. */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: `${S[4]}px`,
          alignItems: 'flex-start',
          minWidth: 0,
        }}
      >
        {/* ── the component list ──────────────────────────────────────────── */}
        <nav
          aria-label="کامپوننت‌ها"
          style={{
            ...CHROME.style,
            flex: '1 1 220px',
            maxWidth: 260,
            borderRadius: `${R.card}px`,
            padding: `${S[3]}px`,
            maxHeight: '70vh',
            overflowY: 'auto',
            minWidth: 0,
          }}
        >
          {groups.map((g) => (
            <div key={g} style={{ marginBottom: `${S[3]}px` }}>
              <div style={{ fontSize: 11, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: `${S[1]}px` }}>
                {g}
              </div>
              {FIXTURES.filter((f) => f.group === g).map((f) => {
                const on = f.name === selected;
                const c = pct(coverage(f));
                const missing = f.expected.filter((s) => !f.states.includes(s));
                return (
                  <button
                    key={f.name}
                    type="button"
                    onClick={() => pick(f.name)}
                    aria-current={on ? 'true' : undefined}
                    style={{
                      ...(on ? WORK.style : WELL.style),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: `${S[2]}px`,
                      width: '100%',
                      font: 'inherit',
                      fontSize: 12,
                      textAlign: 'start',
                      padding: `${S[1]}px ${S[2]}px`,
                      borderRadius: `${R.chip}px`,
                      border: '1px solid transparent',
                      marginBottom: 2,
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <code
                      style={{
                        fontFamily: 'ui-monospace, monospace',
                        fontSize: 10,
                        opacity: c === 100 ? 0.55 : 0.95,
                        color: missing.length ? 'var(--liminal-danger, #ba4646)' : undefined,
                        flexShrink: 0,
                      }}
                    >
                      {c}%
                    </code>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* ── the work ────────────────────────────────────────────────────── */}
        <main style={{ flex: '2 1 380px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: `${S[4]}px` }}>
          <Card title="پیش‌نمایش" note={`${fixture.name} — زنده، با همان لایهٔ تعامل`} role="work">
            {/* the prop controls, derived from what the fixture says it HAS */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${S[3]}px` }}>
              {controls.map((c) => (
                <div key={c.name} style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
                  <span style={{ fontSize: 10, opacity: 0.6, fontFamily: 'ui-monospace, monospace' }}>{c.name}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {c.values.map((v) => {
                      const on =
                        (c.name === 'size' && v === activeSize) ||
                        (c.name === 'state' && v === activeState) ||
                        (c.name === 'variant' && v === activeVariant);
                      return (
                        <button
                          key={v}
                          type="button"
                          aria-pressed={on}
                          onClick={() => {
                            if (c.name === 'size') setSize(v);
                            if (c.name === 'state') setState(v);
                            if (c.name === 'variant') setVariant(v);
                          }}
                          style={{
                            ...(on ? WORK.style : WELL.style),
                            font: 'inherit',
                            fontSize: 11,
                            padding: `2px ${S[2]}px`,
                            borderRadius: `${R.chip}px`,
                            border: '1px solid transparent',
                          }}
                        >
                          {v}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* the forcing harness */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
              <span style={{ fontSize: 10, opacity: 0.6 }}>حالت اجباری</span>
              {FORCED.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={forced === f.id}
                  onClick={() => setForced(f.id)}
                  style={{
                    ...(forced === f.id ? WORK.style : WELL.style),
                    font: 'inherit',
                    fontSize: 11,
                    padding: `2px ${S[2]}px`,
                    borderRadius: `${R.chip}px`,
                    border: '1px solid transparent',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div
              ref={previewRef}
              className={forced === 'none' ? undefined : `force-${forced}`}
              style={{
                ...WELL.style,
                borderRadius: `${R.card}px`,
                padding: `${S[5]}px`,
                minHeight: 132,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflowX: 'auto',
                transition: M.getTransition('background', 'normal'),
              }}
            >
              {rendered}
            </div>
            <p style={{ margin: 0, fontSize: 11, opacity: 0.7 }}>
              hover و focus روی پیش‌نمایش <b>واقعی</b> کار می‌کنند. «حالت اجباری» همان تعریف‌های
              لایه است با کلاس به‌جای شبه‌کلاس — یک هارنس برای دیدن، نه رفتارِ کامپوننت.
            </p>
          </Card>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: `${S[4]}px`,
            }}
          >
            <EngineReadout snapshot={snapshot} />
            <ContractChecks surfaceHex={surfaceHex} level={snapshot?.level ?? null} />
            <CoveragePanel
              name={fixture.name}
              has={fixture.states}
              expected={fixture.expected}
              sizes={fixture.sizes}
              variants={fixture.variants ?? []}
              coveragePercent={pct(coverage(fixture))}
            />
            <CodePanel element={rendered} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Studio;
