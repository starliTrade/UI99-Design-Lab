/**
 * LIMINAL · SITE — THE MATRIX
 *
 * One component, every state, on every surface.
 *
 * WHY THIS PAGE EXISTS. The engine was rebuilt from the ground up — the ladder is exact,
 * a border is one step, a rim is one and a half, a shadow is one quantum — and every
 * component reads those numbers. But nobody has LOOKED at a component on more than one
 * surface. A control is defined by its relationship to what hosts it, so a component
 * that reads well on the work plane may read wrong on a panel, and there is no page that
 * shows the difference.
 *
 * AND IT IS THE TOOL THE REDESIGN NEEDS. The reader's order is eye test first, and an eye
 * test needs every combination in one place: the component's own states down one axis,
 * the surfaces of the hierarchy down the other. Anything the matrix cannot render is
 * something the component cannot do.
 *
 * The states come from the fixture table, which already knows what each component
 * actually supports — so this page cannot show a state a component does not have.
 */
import React, { useState } from 'react';
import { FIXTURES } from '../../components/__matrix__/fixtures';
import { ROLE_LEVEL, resolveBorder, resolveSurface, type SurfaceRole } from '../../engine/liminal-surface';
import { SURFACE_TINT, getTextStyle } from '../../engine/spec-engine';
import { BRAND_HEX } from '../../engine/liminal-ladder';
import { Heading, Text } from '../../components/atoms/Typography';
import { Section, S, MONO, surfaceFor } from '../ui';

/** The surfaces a component can sit on, in hierarchy order. */
const HOSTS: SurfaceRole[] = ['canvas', 'chrome', 'work', 'panel', 'menu', 'modal'];

/** The states the engine can force without a pointer. */
const FORCEABLE: Record<string, string> = { hover: 'hover', focus: 'focus', active: 'active', disabled: 'disabled' };

/** Everything this page draws comes from the engine — a page with its own colours is a
 *  page that drifts, and the guard that found this one says so. */
const PICKER_IDLE = resolveSurface({ role: 'control', state: 'idle', on: 'work' });
const PICKER_HOVER = resolveSurface({ role: 'control', state: 'hover', on: 'work' });
const PICKER_BORDER = resolveBorder({ role: 'control', kind: 'separator', on: 'work' });
const LABEL = getTextStyle('tertiary', 2).color;
const CELL_LINE = SURFACE_TINT.subtle;

export function MatrixPage() {
  const [name, setName] = useState(FIXTURES[0]?.name ?? '');
  const fixture = FIXTURES.find((f) => f.name === name) ?? FIXTURES[0];
  if (!fixture) return null;

  const states = fixture.states.length ? fixture.states : ['default'];
  const variants = fixture.variants?.length ? fixture.variants : [undefined];

  return (
    <>
      <Heading level={1}>ماتریس</Heading>
      <Text tone="secondary" style={{ marginBottom: S[4] }}>
        یک کامپوننت، هر حالتش، روی هر سطح. و هر خانه از موتور می‌خواند — پس این صفحه
        نمی‌تواند چیزی نشان بدهد که سیستم ندارد.
      </Text>

      {/* ── the picker ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: S[1], marginBottom: S[5] }}>
        {FIXTURES.map((f) => (
          <button
            key={f.name}
            type="button"
            onClick={() => setName(f.name)}
            style={{
              font: 'inherit',
              fontSize: 12,
              padding: `${S[1]}px ${S[2]}px`,
              borderRadius: 8,
              cursor: 'pointer',
              border: '1px solid',
              borderColor: f.name === name ? PICKER_BORDER : PICKER_BORDER,
              background: f.name === name ? BRAND_HEX : PICKER_IDLE.background,
              color: f.name === name ? resolveSurface({ role: 'canvas' }).backgroundHex : LABEL,
              fontWeight: f.name === name ? 700 : 400,
            }}
          >
            {f.name}
          </button>
        ))}
      </div>

      {/* ── the matrix: one section per surface ────────────────────────── */}
      {HOSTS.map((host) => {
        const surface = surfaceFor(host);
        return (
          <Section
            key={host}
            title={`روی ${host} — S${ROLE_LEVEL[host]}`}
            note={`${surface.backgroundHex ?? ''} · ${HOSTS.indexOf(host) === 0 ? 'پایین‌ترین سطح' : `یک پله بالای ${HOSTS[HOSTS.indexOf(host) - 1]}`}`}
          >
            <div style={{ overflowX: 'auto', paddingBottom: S[2] }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${states.length * variants.length}, minmax(150px, 1fr))`,
                  gap: 1,
                  background: CELL_LINE,
                  borderRadius: 10,
                  overflow: 'hidden',
                  minWidth: states.length * variants.length * 150,
                }}
              >
                {variants.map((variant) =>
                  states.map((state) => (
                    <div key={`${variant ?? ''}-${state}`} style={{ background: surface.background }}>
                      <div
                        style={{
                          padding: `${S[1]}px ${S[2]}px`,
                          fontSize: 10.5,
                          fontFamily: MONO,
                          color: LABEL,
                          borderBottom: `1px solid ${CELL_LINE}`,
                        }}
                      >
                        {variant ? `${variant} · ` : ''}{state}
                      </div>
                      <div
                        {...(FORCEABLE[state] ? { 'data-liminal-force': FORCEABLE[state] } : {})}
                        style={{
                          padding: S[4],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: 96,
                        }}
                      >
                        {fixture.render(state, fixture.sizes[0], variant)}
                      </div>
                    </div>
                  )),
                )}
              </div>
            </div>
          </Section>
        );
      })}
    </>
  );
}
