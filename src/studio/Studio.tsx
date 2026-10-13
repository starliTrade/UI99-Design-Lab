import React, { useState, useMemo } from 'react';
import { FIXTURES, coverage } from '../components/__matrix__/fixtures';
import type { ComponentFixture } from '../components/__matrix__/fixtures';
import { LADDER, getTextStyle } from '../engine/spec-engine';
import { LiminalLayoutEngine as L } from '../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../engine/liminal-motion-engine';
import { useMediaQuery } from '../engine/liminal-hooks';

/**
 * LIMINAL · STUDIO
 * «صفحه‌ای که ماتریس نمی‌تواند بسازد.»
 *
 * The matrix renders every state to static markup, which is enough to see a
 * component and not enough to TOUCH one. Hover and focus are CSS; a prop change
 * is a re-render; neither exists in a still frame. And this session found five
 * defects in exactly the places a still frame is blind to.
 *
 * So the studio is a live app, not a generated page: pick a component, change
 * its props, see the result, read the JSX that produced it. It is fed by the
 * SAME fixture table the matrix uses, so adding a component is still one row.
 *
 * It lives in the demo rather than in the library, because it is a tool for
 * reviewing the library and not a part of it.
 */

const TEXT = getTextStyle('primary', 2).color as string;
const DIM = getTextStyle('secondary', 2).color as string;
const FAINT = getTextStyle('tertiary', 2).color as string;
const S = L.SPACING;
const R = L.RADIUS;

/** The props a consumer can turn, and what turning them does. */
interface Control {
  name: string;
  values: string[];
}

/**
 * The controls, derived from what the fixture says the component HAS.
 *
 * Not hand-written per component: a component that gains a size gains a
 * control, and one that has none does not grow a dead one.
 */
function controlsFor(f: ComponentFixture): Control[] {
  const out: Control[] = [];
  if (f.sizes.length) out.push({ name: 'size', values: f.sizes });
  if (f.states.length) out.push({ name: 'state', values: f.states });
  if (f.variants?.length) out.push({ name: 'variant', values: f.variants });
  return out;
}

const pct = (n: number) => Math.round(n * 100);

export function Studio() {
  const groups = useMemo(() => [...new Set(FIXTURES.map((f) => f.group))], []);
  const [selected, setSelected] = useState<string>(FIXTURES[0].name);
  const [size, setSize] = useState<string | undefined>(undefined);
  const [state, setState] = useState<string | undefined>(undefined);
  const [variant, setVariant] = useState<string | undefined>(undefined);
  const [showCode, setShowCode] = useState(true);
  // Mobile-first: the sidebar is a column on a wide screen and a horizontal
  // strip on a narrow one. A fixed 220px column is what breaks a phone layout,
  // and this is the tool we audit the components with — so it has to survive
  // the same widths they do.
  const wide = useMediaQuery('(min-width: 860px)');

  const fixture = FIXTURES.find((f) => f.name === selected) ?? FIXTURES[0];
  const controls = controlsFor(fixture);
  const activeSize = size && fixture.sizes.includes(size) ? size : fixture.sizes[0];
  const activeState = state && fixture.states.includes(state) ? state : fixture.states[0];
  const activeVariant = variant && fixture.variants?.includes(variant) ? variant : fixture.variants?.[0];
  const cov = coverage(fixture);
  const missing = fixture.expected.filter((s) => !fixture.states.includes(s));

  const pick = (name: string) => {
    setSelected(name);
    const f = FIXTURES.find((x) => x.name === name)!;
    setSize(f.sizes[0]);
    setState(f.states[0]);
    setVariant(f.variants?.[0]);
  };

  const rendered = fixture.render(activeState, activeSize, activeVariant);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: wide ? 'row' : 'column',
        gap: `${S[4]}px`,
        alignItems: 'stretch',
        width: '100%',
      }}
    >
      {/* ── the sidebar ─────────────────────────────────────────────────── */}
      <nav
        aria-label="کامپوننت‌ها"
        style={{
          width: wide ? 220 : '100%',
          flexShrink: 0,
          border: `1px solid ${LADDER[3]}`,
          borderRadius: `${R.card}px`,
          padding: `${S[3]}px`,
          background: LADDER[1],
          maxHeight: wide ? '70vh' : '34vh',
          overflowY: 'auto',
          boxSizing: 'border-box',
        }}
      >
        {groups.map((g) => (
          <div key={g} style={{ marginBottom: `${S[3]}px` }}>
            <div style={{ fontSize: 11, color: FAINT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: `${S[1]}px` }}>
              {g}
            </div>
            {FIXTURES.filter((f) => f.group === g).map((f) => {
              const on = f.name === selected;
              const c = pct(coverage(f));
              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => pick(f.name)}
                  aria-current={on ? 'true' : undefined}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: `${S[2]}px`,
                    width: '100%', textAlign: 'start', border: '1px solid transparent',
                    borderRadius: `${R.chip}px`, padding: `4px ${S[2]}px`, marginBottom: 2,
                    background: on ? LADDER[3] : 'transparent', color: on ? TEXT : DIM,
                    font: 'inherit', fontSize: 13, cursor: 'pointer',
                  }}
                >
                  <span>{f.name}</span>
                  <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 10.5, color: c === 100 ? '#7fd0a0' : '#e0b070' }}>{c}%</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── the component ───────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{ display: 'flex', alignItems: 'baseline', gap: `${S[3]}px`, flexWrap: 'wrap', marginBottom: `${S[3]}px` }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 650 }}>{fixture.name}</h2>
          <span style={{ fontFamily: 'ui-monospace,monospace', fontSize: 12, color: FAINT }}>{fixture.group}</span>
          {missing.length
            ? <span style={{ fontSize: 11.5, color: '#e0b070', border: '1px solid #8a5a2a', background: '#1a1410', borderRadius: 999, padding: '2px 10px' }}>
                غایب: {missing.join(' · ')}
              </span>
            : <span style={{ fontSize: 11.5, color: '#7fd0a0', border: '1px solid #2a5a3a', background: '#101a13', borderRadius: 999, padding: '2px 10px' }}>کامل</span>}
        </header>

        {/* the controls */}
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap', marginBottom: `${S[4]}px`, alignItems: 'flex-end' }}>
          {controls.map((c) => (
            <div key={c.name}>
              <div style={{ fontSize: 11, color: FAINT, marginBottom: 4 }}>{c.name}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {c.values.map((v) => {
                  const current = c.name === 'size' ? activeSize : c.name === 'state' ? activeState : activeVariant;
                  const on = current === v;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => (c.name === 'size' ? setSize(v) : c.name === 'state' ? setState(v) : setVariant(v))}
                      aria-pressed={on}
                      style={{
                        border: `1px solid ${on ? LADDER[6] : LADDER[3]}`, borderRadius: `${R.chip}px`,
                        padding: `3px ${S[2]}px`, background: on ? LADDER[4] : 'transparent',
                        color: on ? TEXT : DIM, font: 'inherit', fontSize: 12, cursor: 'pointer',
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div style={{ marginInlineStart: 'auto' }}>
            <div style={{ fontSize: 11, color: FAINT, marginBottom: 4 }}>&nbsp;</div>
            <button
              type="button"
              onClick={() => setShowCode((v) => !v)}
              aria-pressed={showCode}
              style={{
                border: `1px solid ${LADDER[3]}`, borderRadius: `${R.chip}px`, padding: `3px ${S[2]}px`,
                background: 'transparent', color: DIM, font: 'inherit', fontSize: 12, cursor: 'pointer',
              }}
            >
              {showCode ? 'پنهان‌کردن کد' : 'نمایش کد'}
            </button>
          </div>
        </div>

        {/* the live preview — hover and focus work here, which is the point */}
        <div
          style={{
            border: `1px solid ${LADDER[3]}`, borderRadius: `${R.card}px`, padding: `${S[5]}px`,
            background: LADDER[2], marginBottom: `${S[4]}px`, minHeight: 140,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {rendered}
        </div>

        {showCode && (
          <pre
            style={{
              margin: 0, border: `1px solid ${LADDER[3]}`, borderRadius: `${R.card}px`,
              padding: `${S[3]}px`, background: LADDER[1], overflowX: 'auto',
              fontFamily: 'ui-monospace,monospace', fontSize: 12, color: DIM,
              direction: 'ltr', textAlign: 'left',
            }}
          >
{`<${fixture.name}${activeVariant ? ` variant="${activeVariant}"` : ''}${activeSize ? ` size="${activeSize}"` : ''}${activeState && activeState !== 'default' ? ` /* ${activeState} */` : ''} />`}
          </pre>
        )}

        <p style={{ color: FAINT, fontSize: 12, marginTop: `${S[3]}px` }}>
          hover و focus روی پیش‌نمایش <b>واقعی</b> کار می‌کنند — همان چیزی که یک فریم ثابت نمی‌تواند نشان دهد.
        </p>
      </div>
    </div>
  );
}

export default Studio;
