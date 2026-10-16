/**
 * LIMINAL · STUDIO
 *
 * Pick a component. Pick the layer it sits on. Read everything the engine resolves.
 *
 * THE THREE THINGS IT ANSWERS, and they are the three questions a component review asks:
 *
 *   1. WHAT IS THE LAYER?      its level, its colour, its lightness, its distance from the
 *                              canvas — and what the law allows to sit on it.
 *   2. WHAT IS THE COMPONENT?  its level, its colour, and the distance from the layer it
 *                              sits on — which is always one step, and the page says so.
 *   3. WHAT DOES IT WEAR?      the border, the rim and the shadow it resolves to, each
 *                              with the number that produced it.
 *
 * AND THE LAW IS BUILT IN. Law 2 says a layer sits on the one below it, so the layer
 * picker offers every surface and the page reports whether a component is allowed there —
 * read from the engine's own `checkPlacement` rather than restated here.
 */
import React, { useMemo, useState } from 'react';
import { FIXTURES } from '../components/__matrix__/fixtures';
import {
  ROLE_LEVEL,
  ROLE_RIM,
  ROLE_SHADOW,
  checkPlacement,
  resolveBorder,
  resolveBorderLevel,
  resolveSurface,
  type SurfaceRole,
} from '../engine/liminal-surface';
import { CANVAS_L, LADDER_STEP, PERCEPTUAL_QUANTUM, BRAND_HEX } from '../engine/liminal-ladder';
import { SURFACE_TINT, getTextStyle } from '../engine/spec-engine';
import { oklchLightness } from '../engine/liminal-color-math';

const LAYERS: SurfaceRole[] = ['canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast'];
const FORCEABLE: Record<string, string> = { hover: 'hover', focus: 'focus', active: 'active', disabled: 'disabled' };
const Q = PERCEPTUAL_QUANTUM;
const STEP_Q = (LADDER_STEP / Q).toFixed(4);
const LINE = SURFACE_TINT.subtle;

const T = {
  primary: getTextStyle('primary', 2).color,
  secondary: getTextStyle('secondary', 2).color,
  tertiary: getTextStyle('tertiary', 2).color,
  quaternary: getTextStyle('quaternary', 2).color,
};
const CANVAS_HEX = resolveSurface({ role: 'canvas' }).backgroundHex ?? '';

export function Studio() {
  const [name, setName] = useState('Button');
  const [layer, setLayer] = useState<SurfaceRole>('work');
  const [states, setStates] = useState<string[] | null>(null);

  const fixture = FIXTURES.find((f) => f.name === name) ?? FIXTURES[0];
  const allStates = fixture?.states.length ? fixture.states : ['default'];
  const shown = states ?? allStates;

  const layerSurface = resolveSurface({ role: layer });
  const control = resolveSurface({ role: 'control', on: layer });
  const borderLevel = resolveBorderLevel({ role: 'control', kind: 'edge', on: layer });
  const sepLevel = resolveBorderLevel({ role: 'control', kind: 'separator', on: layer });
  const rim = control.rimColors;
  const placement = useMemo(() => checkPlacement({ role: 'control', on: layer }), [layer]);

  if (!fixture) return null;

  return (
    <div style={{ minHeight: '100vh', background: CANVAS_HEX, color: T.primary, padding: '20px 14px 64px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.02em' }}>استودیو</span>
          <span style={{ fontSize: 11, fontFamily: 'ui-monospace,Menlo,monospace', color: T.quaternary }}>
            از موتور، نه از خودش
          </span>
        </div>
        <p style={{ margin: '0 0 18px', fontSize: 12.5, color: T.tertiary, lineHeight: 2 }}>
          یک کامپوننت، یک لایه، و هر عددی که سیستم حل می‌کند.
        </p>

        {/* ── the two picks ──────────────────────────────────────────── */}
        <Row>
          <Select label="کامپوننت" value={name} options={FIXTURES.map((f) => f.name)} onChange={(v) => { setName(v); setStates(null); }} />
          <Select
            label="لایه"
            value={layer}
            options={LAYERS as unknown as string[]}
            onChange={(v) => setLayer(v as SurfaceRole)}
            render={(v) => `${v} · S${ROLE_LEVEL[v as SurfaceRole]}`}
          />
        </Row>

        {/* ── which states ───────────────────────────────────────────── */}
        {allStates.length > 1 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11.5, color: T.tertiary, marginBottom: 8 }}>حالت‌ها</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {allStates.map((s) => {
                const on = shown.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      const next = on ? shown.filter((x) => x !== s) : [...shown, s];
                      setStates(next.length ? next : allStates);
                    }}
                    style={chip(on)}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── the preview, on the layer ──────────────────────────────── */}
        <div style={{ marginTop: 18, borderRadius: 14, overflow: 'hidden', border: `1px solid ${resolveBorder({ role: 'panel', kind: 'separator' })}` }}>
          <div style={{ padding: '8px 13px', background: resolveSurface({ role: 'panel' }).background, fontSize: 11, fontFamily: 'ui-monospace,Menlo,monospace', color: T.tertiary, display: 'flex', justifyContent: 'space-between' }}>
            <span>{fixture.name}</span>
            <span>{layer} · S{ROLE_LEVEL[layer]}</span>
          </div>
          <div style={{ background: layerSurface.background, padding: 22 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center' }}>
              {shown.map((s) => (
                <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div {...(FORCEABLE[s] ? { 'data-liminal-force': FORCEABLE[s] } : {})}>
                    {fixture.render(s, fixture.sizes[0], fixture.variants?.[0])}
                  </div>
                  <span style={{ fontSize: 10.5, fontFamily: 'ui-monospace,Menlo,monospace', color: T.quaternary }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── the layer ─────────────────────────────────────────────── */}
        <Panel title="لایه" note={placement.ok ? 'قانون ۲: مجاز' : `قانون ۲: ${placement.reason}`}>
          <Line k="نقش" v={layer} />
          <Line k="سطح" v={`S${ROLE_LEVEL[layer]}`} />
          <Line k="رنگ" v={layerSurface.backgroundHex ?? ''} />
          <Line k="روشنایی" v={oklchLightness(layerSurface.backgroundHex ?? '#000000').toFixed(6)} />
          <Line k="فاصله از بوم" v={`${((oklchLightness(layerSurface.backgroundHex ?? '#000000') - CANVAS_L) / Q).toFixed(4)}q`} />
        </Panel>

        {/* ── the component ─────────────────────────────────────────── */}
        <Panel title="کامپوننت روی این لایه" note={`کنترل = لایه + ۱ پله`}>
          <Line k="سطح" v={`S${ROLE_LEVEL[layer] + 1}`} />
          <Line k="رنگ" v={control.backgroundHex ?? ''} />
          <Line k="روشنایی" v={oklchLightness(control.backgroundHex ?? '#000000').toFixed(6)} />
          <Line k="فاصله از لایه" v={`${STEP_Q}q`} />
        </Panel>

        {/* ── what it wears ─────────────────────────────────────────── */}
        <Panel title="و چه می‌پوشد" note="هر عدد از موتور">
          <Line k="مرز (edge)" v={`S${borderLevel} · +${STEP_Q}q از کامپوننت`} />
          <Line k="جداکننده" v={`S${sepLevel} · +${(0.5 * LADDER_STEP / Q).toFixed(4)}q`} />
          <Line k="ریم" v={rim ? '+۱.۵ / ۱ / ۰.۵ پله' : 'ندارد'} />
          <Line k="سایه" v={ROLE_SHADOW.control === null ? 'ندارد' : `E${ROLE_SHADOW.control}`} />
          <Line k="ریم مجاز؟" v={ROLE_RIM.control ? 'بله' : 'نه'} />
        </Panel>
      </div>
    </div>
  );
}

function chip(on: boolean): React.CSSProperties {
  const idle = resolveSurface({ role: 'control', state: 'idle', on: 'work' });
  return {
    font: 'inherit',
    fontSize: 12,
    padding: '6px 14px',
    borderRadius: 999,
    cursor: 'pointer',
    background: on ? BRAND_HEX : idle.background,
    color: on ? CANVAS_HEX : T.secondary,
    border: `1px solid ${resolveBorder({ role: 'control', kind: 'separator', on: 'work' })}`,
    fontWeight: on ? 700 : 400,
  };
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>{children}</div>;
}

function Select({
  label, value, options, onChange, render,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; render?: (v: string) => string;
}) {
  const idle = resolveSurface({ role: 'control', state: 'idle', on: 'work' });
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 180 }}>
      <span style={{ fontSize: 11.5, color: T.tertiary }}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          font: 'inherit', fontSize: 13, padding: '9px 12px', borderRadius: 10,
          background: idle.background, color: T.primary,
          border: `1px solid ${resolveBorder({ role: 'control', kind: 'separator', on: 'work' })}`,
        }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ background: CANVAS_HEX }}>{render ? render(o) : o}</option>
        ))}
      </select>
    </label>
  );
}

function Panel({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600 }}>{title}</span>
        {note && <span style={{ fontSize: 11, color: T.quaternary }}>{note}</span>}
      </div>
      <div style={{ fontFamily: 'ui-monospace,Menlo,monospace', fontSize: 12 }}>{children}</div>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: `1px solid ${LINE}` }}>
      <span style={{ color: T.tertiary }}>{k}</span>
      <span style={{ textAlign: 'end' }}>{v}</span>
    </div>
  );
}
