/**
 * LIMINAL · SITE — THE LAB
 *
 * One component. One surface. Every variant, in every state, on that surface.
 *
 * WHY NOT A MATRIX OF EVERYTHING. The first version showed every component on every
 * surface at once, and it was unreadable: six sections of a hundred cells, and the thing
 * being judged — how ONE component behaves on ONE surface — was lost in it. A page whose
 * parts cannot be compared is a page that cannot be reviewed.
 *
 * So: pick a component, pick the surface it sits on, and see the component's own variants
 * against its own states. Nothing else. The surface is drawn as a real band at the
 * engine's value, so the relationship between the component and what hosts it is visible
 * rather than described.
 *
 * AND THE VALUES ARE PRINTED BESIDE IT. A variant that looks wrong is a variant whose
 * numbers can be read: the fill's level, the border's level, the rim's three stops —
 * every one of them resolved by the engine, so a bug in the engine shows up as a number
 * before it shows up as a colour.
 */
import React, { useState } from 'react';
import { FIXTURES } from '../../components/__matrix__/fixtures';
import {
  ROLE_LEVEL,
  resolveBorder,
  resolveBorderLevel,
  resolveSurface,
  type SurfaceRole,
} from '../../engine/liminal-surface';
import { LADDER_STEP, PERCEPTUAL_QUANTUM } from '../../engine/liminal-ladder';
import { SURFACE_TINT, getTextStyle } from '../../engine/spec-engine';
import { BRAND_HEX } from '../../engine/liminal-ladder';
import { Heading, Text } from '../../components/atoms/Typography';
import { Section, S, MONO, surfaceFor } from '../ui';

/** The text roles, so this page has no colour of its own. */
const T = {
  primary: getTextStyle('primary', 2).color,
  secondary: getTextStyle('secondary', 2).color,
  tertiary: getTextStyle('tertiary', 2).color,
  quaternary: getTextStyle('quaternary', 2).color,
};
const CANVAS_HEX = resolveSurface({ role: 'canvas' }).backgroundHex ?? '';
const BRAND = BRAND_HEX;
const CELL_LINE = SURFACE_TINT.subtle;



/** The surfaces a component can sit on, in hierarchy order. */
const HOSTS: SurfaceRole[] = ['canvas', 'chrome', 'work', 'panel', 'menu', 'modal'];

/** The states the engine can force without a pointer. */
const FORCEABLE: Record<string, string> = { hover: 'hover', focus: 'focus', active: 'active', disabled: 'disabled' };

export function LabPage() {
  const [name, setName] = useState('Button');
  const [host, setHost] = useState<SurfaceRole>('work');
  const fixture = FIXTURES.find((f) => f.name === name) ?? FIXTURES[0];
  if (!fixture) return null;

  const states = fixture.states.length ? fixture.states : ['default'];
  const variants = fixture.variants?.length ? fixture.variants : [undefined];
  const surface = surfaceFor(host);

  return (
    <>
      <Heading level={1}>آزمایشگاه</Heading>
      <Text tone="secondary" style={{ marginBottom: S[4] }}>
        یک کامپوننت، یک لایه، و همهٔ واریانت‌هایش در همهٔ حالت‌هایش. هر عدد از موتور.
      </Text>

      {/* ── the two pickers ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: S[5], marginBottom: S[5] }}>
        <Picker
          label="کامپوننت"
          value={fixture.name}
          options={FIXTURES.map((f) => f.name)}
          onPick={setName}
        />
        <Picker
          label="لایه"
          value={host}
          options={HOSTS as unknown as string[]}
          onPick={(v) => setHost(v as SurfaceRole)}
          render={(v) => `${v} · S${ROLE_LEVEL[v as SurfaceRole]}`}
        />
      </div>

      {/* ── the component, on that surface ─────────────────────────────── */}
      <Section
        title={`${fixture.name} روی ${host}`}
        note={`${surface.backgroundHex ?? ''} · ${fixture.kind ?? 'surface'} · ${variants.length} واریانت × ${states.length} حالت`}
      >
        <div style={{ overflowX: 'auto', paddingBottom: S[2] }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `120px repeat(${states.length}, minmax(140px, 1fr))`,
              gap: 1,
              background: CELL_LINE,
              borderRadius: 10,
              overflow: 'hidden',
              minWidth: 120 + states.length * 140,
            }}
          >
            {/* the header row */}
            <Cell head>واریانت</Cell>
            {states.map((state) => (
              <Cell key={state} head>{state}</Cell>
            ))}

            {/* one row per variant */}
            {variants.map((variant) => (
              <React.Fragment key={variant ?? 'only'}>
                <Cell head>{variant ?? '—'}</Cell>
                {states.map((state) => (
                  <div
                    key={state}
                    {...(FORCEABLE[state] ? { 'data-liminal-force': FORCEABLE[state] } : {})}
                    style={{
                      background: surface.background,
                      padding: S[4],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 92,
                    }}
                  >
                    {fixture.render(state, fixture.sizes[0], variant)}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </Section>

      {/* ── and the numbers, so a bug is readable ─────────────────────── */}
      <Section title="اعدادِ همین لایه" note="از موتور خوانده می‌شوند — نه نوشته">
        <div style={{ fontFamily: MONO, fontSize: 12, lineHeight: 2.1 }}>
          <div>میزبان: <b>{host}</b> · سطح S{ROLE_LEVEL[host]} · {surface.backgroundHex}</div>
          <div>
            fill کنترل: S{ROLE_LEVEL[host] + 1} · مرز:{' '}
            S{resolveBorderLevel({ role: 'control', kind: 'edge', on: host })} · جداکننده:{' '}
            S{resolveBorderLevel({ role: 'control', kind: 'separator', on: host })}
          </div>
          <div>
            فاصلهٔ fill از میزبان: {((LADDER_STEP / PERCEPTUAL_QUANTUM)).toFixed(4)}q · فاصلهٔ مرز از fill:{' '}
            {((LADDER_STEP / PERCEPTUAL_QUANTUM)).toFixed(4)}q
          </div>
          <div style={{ marginTop: S[2], color: T.quaternary }}>
            {resolveSurface({ role: 'control', on: host }).backgroundHex} ·{' '}
            {resolveSurface({ role: 'control', on: host }).rimColors ? 'ریم دارد' : 'ریم ندارد'}
          </div>
        </div>
      </Section>
    </>
  );
}

/** A small labelled picker — a row of buttons, not a select, so the options are visible. */
function Picker({
  label,
  value,
  options,
  onPick,
  render,
}: {
  label: string;
  value: string;
  options: string[];
  onPick: (v: string) => void;
  render?: (v: string) => string;
}) {
  const [open, setOpen] = useState(false);
  const idle = resolveSurface({ role: 'control', state: 'idle', on: 'work' });
  const borderHex = resolveBorder({ role: 'control', kind: 'edge', on: 'work' });
  return (
    <div>
      <div style={{ fontSize: 11, color: T.tertiary, marginBottom: 6, fontFamily: MONO }}>
        {label}
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          font: 'inherit',
          fontSize: 13,
          padding: `${S[1]}px ${S[3]}px`,
          borderRadius: 9,
          cursor: 'pointer',
          background: idle.background,
          color: T.primary,
          border: `1px solid ${borderHex}`,
        }}
      >
        {render ? render(value) : value} ▾
      </button>
      {open && (
        <div
          style={{
            position: 'absolute',
            zIndex: 20,
            marginTop: 6,
            padding: S[2],
            borderRadius: 10,
            background: surfaceFor('menu').background,
            border: `1px solid ${resolveBorder({ role: 'menu', kind: 'separator' })}`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 4,
            maxWidth: 420,
          }}
        >
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => { onPick(o); setOpen(false); }}
              style={{
                font: 'inherit',
                fontSize: 12,
                padding: `${S[0]}px ${S[2]}px`,
                borderRadius: 7,
                cursor: 'pointer',
                background: o === value ? BRAND : 'transparent',
                color: o === value ? CANVAS_HEX : T.secondary,
                border: 'none',
              }}
            >
              {render ? render(o) : o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Cell({ children, head }: { children: React.ReactNode; head?: boolean }) {
  return (
    <div
      style={{
        background: surfaceFor('panel').background,
        padding: `${S[1]}px ${S[2]}px`,
        fontSize: 10.5,
        fontFamily: MONO,
        color: T.tertiary,
        borderBottom: `1px solid ${CELL_LINE}`,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      {children}
    </div>
  );
}
