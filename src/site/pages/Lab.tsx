/**
 * LIMINAL · SITE — THE LAB
 *
 * One component, one surface, and only what you asked to see.
 *
 * WHY NOT EVERYTHING AT ONCE. The first version showed every component on every surface,
 * and it was unreadable. The second showed every variant against every state, and that
 * was still too much: a button has six variants and four states, and twenty-four cells
 * is a wall rather than a comparison. A page whose parts cannot be compared is a page
 * that cannot be reviewed.
 *
 * So everything is a choice: the component, the surface it sits on, which variants, and
 * which states. Pick two variants and one state and you are looking at exactly the thing
 * you are judging — which is what an eye test is for.
 *
 * AND IT IS MOBILE FIRST. One column, chips that wrap, and a preview band that is the
 * star of the page. Every control is a tap target, and nothing scrolls sideways.
 *
 * AND EVERY VALUE COMES FROM THE ENGINE — the text roles, the chip fills, the borders,
 * the preview band. The guard that watches for hand-picked colours caught this page twice
 * while it was being written, which is the guard working.
 */
import React, { useMemo, useState } from 'react';
import { FIXTURES } from '../../components/__matrix__/fixtures';
import {
  ROLE_LEVEL,
  resolveBorder,
  resolveBorderLevel,
  resolveSurface,
  type SurfaceRole,
} from '../../engine/liminal-surface';
import { LADDER_STEP, PERCEPTUAL_QUANTUM, BRAND_HEX } from '../../engine/liminal-ladder';
import { SURFACE_TINT, getTextStyle } from '../../engine/spec-engine';
import { Heading, Text } from '../../components/atoms/Typography';
import { S, MONO, surfaceFor } from '../ui';

const HOSTS: SurfaceRole[] = ['canvas', 'chrome', 'work', 'panel', 'menu', 'modal'];
const FORCEABLE: Record<string, string> = { hover: 'hover', focus: 'focus', active: 'active', disabled: 'disabled' };

const T = {
  primary: getTextStyle('primary', 2).color,
  secondary: getTextStyle('secondary', 2).color,
  tertiary: getTextStyle('tertiary', 2).color,
  quaternary: getTextStyle('quaternary', 2).color,
};
const CANVAS_HEX = resolveSurface({ role: 'canvas' }).backgroundHex ?? '';
const LINE = SURFACE_TINT.subtle;
const STEP_Q = (LADDER_STEP / PERCEPTUAL_QUANTUM).toFixed(4);

export function LabPage() {
  const [name, setName] = useState('Button');
  const [host, setHost] = useState<SurfaceRole>('work');
  const [pickedVariants, setPickedVariants] = useState<string[] | null>(null);
  const [pickedStates, setPickedStates] = useState<string[] | null>(null);

  const fixture = FIXTURES.find((f) => f.name === name) ?? FIXTURES[0];
  const surface = surfaceFor(host);

  const allVariants = useMemo(() => fixture?.variants?.length ? fixture.variants : ['—'], [fixture]);
  const allStates = useMemo(() => (fixture?.states.length ? fixture.states : ['default']), [fixture]);
  const variants = pickedVariants ?? allVariants;
  const states = pickedStates ?? allStates;

  if (!fixture) return null;

  const toggle = (list: string[], set: (v: string[]) => void, all: string[], v: string) => {
    const next = list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
    set(next.length ? next : all);
  };

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Heading level={1}>آزمایشگاه</Heading>
      <Text tone="secondary" style={{ marginBottom: S[5] }}>
        یک کامپوننت، یک لایه، و فقط چیزی که انتخاب می‌کنی.
      </Text>

      {/* ── ۱. the component ──────────────────────────────────────────── */}
      <Field label="کامپوننت">
        <Chips
          options={FIXTURES.map((f) => f.name)}
          selected={[name]}
          onPick={(v) => { setName(v); setPickedVariants(null); setPickedStates(null); }}
          scroll
        />
      </Field>

      {/* ── ۲. the surface it sits on ─────────────────────────────────── */}
      <Field label="لایه" note="و روی همان لایه، همه‌چیز از موتور می‌آید">
        <Chips
          options={HOSTS as unknown as string[]}
          selected={[host]}
          onPick={(v) => setHost(v as SurfaceRole)}
          render={(v) => `${v} · S${ROLE_LEVEL[v as SurfaceRole]}`}
        />
      </Field>

      {/* ── ۳. which variants ─────────────────────────────────────────── */}
      {allVariants.length > 1 && (
        <Field label="واریانت‌ها" note="چند تا را می‌خواهی؟">
          <Chips
            options={allVariants as string[]}
            selected={variants as string[]}
            onPick={(v) => toggle(variants as string[], setPickedVariants as (x: string[]) => void, allVariants as string[], v)}
          />
        </Field>
      )}

      {/* ── ۴. which states ───────────────────────────────────────────── */}
      {allStates.length > 1 && (
        <Field label="حالت‌ها" note="چند تا را می‌خواهی؟">
          <Chips
            options={allStates}
            selected={states}
            onPick={(v) => toggle(states, setPickedStates as (x: string[]) => void, allStates, v)}
          />
        </Field>
      )}

      {/* ── the preview: the star of the page ─────────────────────────── */}
      <div
        style={{
          marginTop: S[5],
          borderRadius: 16,
          overflow: 'hidden',
          border: `1px solid ${resolveBorder({ role: 'panel', kind: 'separator' })}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            padding: `${S[2]}px ${S[4]}px`,
            background: surfaceFor('panel').background,
            fontSize: 11.5,
            fontFamily: MONO,
            color: T.tertiary,
          }}
        >
          <span>{fixture.name}</span>
          <span>{host} · S{ROLE_LEVEL[host]} · {surface.backgroundHex}</span>
        </div>

        {/* the host band — full bleed, so the component sits ON something */}
        <div style={{ background: surface.background, padding: S[5] }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${states.length}, minmax(0, 1fr))`,
              gap: S[4],
            }}
          >
            {states.map((state) => (
              <div key={state} style={{ display: 'flex', flexDirection: 'column', gap: S[2], alignItems: 'center' }}>
                <div
                  {...(FORCEABLE[state] ? { 'data-liminal-force': FORCEABLE[state] } : {})}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: S[3],
                    alignItems: 'center',
                    width: '100%',
                  }}
                >
                  {variants.map((variant) => (
                    <div key={variant} style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      {fixture.render(state, fixture.sizes[0], variant === '—' ? undefined : variant)}
                    </div>
                  ))}
                </div>
                <div style={{ fontSize: 10.5, fontFamily: MONO, color: T.quaternary }}>{state}</div>
              </div>
            ))}
          </div>

          {variants.length > 1 && (
            <div
              style={{
                display: 'flex',
                gap: S[3],
                justifyContent: 'center',
                flexWrap: 'wrap',
                marginTop: S[4],
                fontSize: 10.5,
                fontFamily: MONO,
                color: T.quaternary,
              }}
            >
              {variants.map((v) => <span key={v}>{v}</span>)}
            </div>
          )}
        </div>
      </div>

      {/* ── and the numbers ───────────────────────────────────────────── */}
      <div style={{ marginTop: S[5], fontFamily: MONO, fontSize: 12, lineHeight: 2.2, color: T.secondary }}>
        <Row k="میزبان" v={`S${ROLE_LEVEL[host]} · ${surface.backgroundHex}`} />
        <Row k="fill باتن" v={`S${ROLE_LEVEL[host] + 1} · +${STEP_Q}q`} />
        <Row k="مرز (edge)" v={`S${resolveBorderLevel({ role: 'control', kind: 'edge', on: host })} · +${STEP_Q}q از fill`} />
        <Row k="جداکننده" v={`S${resolveBorderLevel({ role: 'control', kind: 'separator', on: host })}`} />
        <Row
          k="ریم"
          v={resolveSurface({ role: 'control', on: host }).rimColors ? `+۱.۵ / ۱ / ۰.۵ پله` : 'ندارد'}
        />
      </div>
    </div>
  );
}

/** A labelled group of chips. */
function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: S[4] }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: S[2], marginBottom: S[2] }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: T.secondary }}>{label}</span>
        {note && <span style={{ fontSize: 11, color: T.quaternary }}>{note}</span>}
      </div>
      {children}
    </div>
  );
}

/** A wrapping row of chips — tap targets, not a select. */
function Chips({
  options,
  selected,
  onPick,
  render,
  scroll,
}: {
  options: string[];
  selected: string[];
  onPick: (v: string) => void;
  render?: (v: string) => string;
  scroll?: boolean;
}) {
  const idle = resolveSurface({ role: 'control', state: 'idle', on: 'work' });
  const border = resolveBorder({ role: 'control', kind: 'separator', on: 'work' });
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: S[1],
        ...(scroll ? { maxHeight: 132, overflowY: 'auto' as const } : {}),
      }}
    >
      {options.map((o) => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onPick(o)}
            style={{
              font: 'inherit',
              fontSize: 12.5,
              padding: `${S[1]}px ${S[3]}px`,
              borderRadius: 999,
              cursor: 'pointer',
              background: on ? BRAND_HEX : idle.background,
              color: on ? CANVAS_HEX : T.secondary,
              border: `1px solid ${border}`,
              fontWeight: on ? 700 : 400,
              whiteSpace: 'nowrap',
            }}
          >
            {render ? render(o) : o}
          </button>
        );
      })}
    </div>
  );
}

/** One line of the numbers. */
function Row({ k, v }: { k: string; v: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: S[3],
        padding: `${S[1]}px 0`,
        borderBottom: `1px solid ${LINE}`,
      }}
    >
      <span style={{ color: T.tertiary }}>{k}</span>
      <span style={{ textAlign: 'end' }}>{v}</span>
    </div>
  );
}
