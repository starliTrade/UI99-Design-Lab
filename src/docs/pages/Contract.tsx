/**
 * LIMINAL · DOCS — THE CONTRACT
 *
 * The rules, and the guard that holds each one. A rule without a guard is a
 * habit: this project has already watched a defect appear seven times, so every
 * rule here names the test that fails when it is broken.
 *
 * The checks below are computed live, from the same engine the components use.
 */
import React from 'react';
import { LADDER, SURFACE_TINT } from '../../engine/spec-engine';
import { PERCEPTUAL_QUANTUM, FOCUS_RING_COLOR, BRAND_HEX } from '../../engine/liminal-ladder';
import { oklchLightness, contrastRatioHex } from '../../engine/liminal-color-math';
import { deriveTextToken, TEXT_ROLE_SPEC, type TextRole } from '../../engine/liminal-contrast';
import { ROLE_LEVEL } from '../../engine/liminal-surface';
import { Section, Prose, Value, Stat, MONO, S } from '../ui';
import { useTheme } from '../theme';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';

/** The semantic roles, from the engine — a colour a reader can name. */
const SEMANTICS = LiminalColorEngine.SEMANTICS;

const ROLES: TextRole[] = ['primary', 'secondary', 'tertiary', 'quaternary'];

interface Rule {
  rule: string;
  why: string;
  guard: string;
}

const RULES: Rule[] = [
  {
    rule: 'Values become tokens. Selections become names. Raw numbers are forbidden.',
    why: 'A number written inside a component drifts away from the contract, and no test can say whether it is right.',
    guard: 'no-raw-numbers.test.ts',
  },
  {
    rule: 'One resolver for a surface.',
    why: 'Two resolvers disagreed about the same depth: one drew a rim of 1, the other a rim of 2. A component could pick either.',
    guard: 'one-resolver.test.ts',
  },
  {
    rule: 'Six interaction variables, one producer.',
    why: 'A component that assembles them by hand can publish a hover value and forget the idle one — or set background inline and cancel the rule that reads them.',
    guard: 'interaction-vars.test.ts',
  },
  {
    rule: 'A surface is a variable; a baked hex is not allowed.',
    why: 'The mist was built from LADDER[level], so a themed page had a mist that ignored the theme.',
    guard: 'theme-reach.test.ts',
  },
  {
    rule: 'A text alpha is derived, not chosen.',
    why: 'tertiary was hand-picked at 3.7:1 while it is 12.5px copy. Now the floor comes from the declared use and the stricter lens wins.',
    guard: 'contrast.test.ts',
  },
  {
    rule: 'Every component must be in the fixture table.',
    why: 'The studio, the matrix and the a11y sweep all read that one table. A component that is not in it passes through none of them.',
    guard: 'a11y-sweep.test.tsx',
  },
  {
    rule: 'The contract is generated from the code.',
    why: 'DESIGN-CONTRACT.md drifted eleven times behind the engine. Its numeric blocks are generated now.',
    guard: 'contract-md.test.ts',
  },
  {
    rule: 'No component bakes a ladder colour into a style.',
    why: 'A hex where a variable belongs is a surface that does not follow a theme.',
    guard: 'theme-reach.test.ts',
  },
];

function Check({ ok, label, detail }: { ok: boolean; label: string; detail: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: `${S[2]}px`, minWidth: 0 }}>
      <span style={{ color: ok ? undefined : SEMANTICS.DANGER.text, fontSize: 12, flexShrink: 0 }}>
        {ok ? '✓' : '✗'}
      </span>
      <span style={{ fontSize: 12, flexShrink: 0 }}>{label}</span>
      <code style={{ fontFamily: MONO, fontSize: 11, opacity: 0.7, overflowWrap: 'anywhere' }}>{detail}</code>
    </div>
  );
}

export function ContractPage() {
  const { theme } = useTheme();

  // ── the engine's invariants, computed live ───────────────────────────────
  const steps = theme.ladder.slice(1).map((hex, i) => (oklchLightness(hex) - oklchLightness(theme.ladder[i])) / PERCEPTUAL_QUANTUM);
  const minStep = Math.min(...steps);
  const monotonic = theme.ladder.every((hex, i) => i === 0 || oklchLightness(hex) > oklchLightness(theme.ladder[i - 1]));
  const levels = Object.values(ROLE_LEVEL);
  const levelsOrdered = levels.every((l, i) => i === 0 || l >= levels[i - 1]);
  const floors = ROLES.flatMap((role) =>
    theme.ladder.map((surface) => {
      const t = deriveTextToken(role, surface);
      const spec = TEXT_ROLE_SPEC[role];
      return { role, ok: t.wcag >= spec.wcag && Math.abs(t.apca) >= spec.apca };
    }),
  );
  const floorsOk = floors.every((f) => f.ok);
  const ringOk = contrastRatioHex(BRAND_HEX, LADDER[0]) >= 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <Section title="Contract" note="Every rule, and the guard that holds it" role="panel">
        <Prose>
          A rule with no guard is a habit. This project watched one defect appear <b>seven
          times</b> — so every rule here names the test that goes red when it is broken.
        </Prose>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ opacity: 0.65 }}>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>Rule</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>Why</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>Guard</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map((r) => (
                <tr key={r.guard + r.rule} style={{ borderTop: `${L.BORDER.hairline}px solid ${SURFACE_TINT.medium}` }}>
                  <td style={{ padding: `${S[2]}px`, fontWeight: 600 }}>{r.rule}</td>
                  <td style={{ padding: `${S[2]}px`, opacity: 0.8, lineHeight: 1.9 }}>{r.why}</td>
                  <td style={{ padding: `${S[2]}px` }}>
                    <code style={{ fontFamily: MONO, fontSize: 10 }}>{r.guard}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Invariants — live" note="Computed now, on the current theme">
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${L.CELL_MIN * 2}px, 1fr))`, gap: `${S[4]}px` }}>
          <Stat value={`${minStep.toFixed(2)}q`} label="Smallest step" tone={minStep < 1 ? 'warn' : undefined} />
          <Stat value={floors.length ? `${floors.length}` : '0'} label="Contrast cells" />
          <Stat value={ringOk ? '✓' : '✗'} label="Focus ring" tone={ringOk ? undefined : 'warn'} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Check ok={minStep >= 1} label="Every step ≥ 1 quantum" detail={`smallest ${minStep.toFixed(3)}q of ${PERCEPTUAL_QUANTUM}`} />
          <Check ok={monotonic} label="The ladder rises" detail={`${theme.ladder.length} steps`} />
          <Check ok={levelsOrdered} label="Roles are ordered" detail={`${levels.length} roles`} />
          <Check ok={floorsOk} label="Every role holds both floors on every surface" detail={`${floors.length} cells`} />
          <Check ok={ringOk} label="The focus ring is visible on the canvas" detail={`${contrastRatioHex(BRAND_HEX, LADDER[0]).toFixed(2)}:1`} />
        </div>
        {!floorsOk && (
          <Prose>
            <b style={{ color: SEMANTICS.DANGER.text }}>Cells below the floor:</b>{' '}
            {floors.filter((f) => !f.ok).map((f) => f.role).join(' · ')}
          </Prose>
        )}
      </Section>

      <Section title="And what has no guard yet" note="Honestly">
        <Prose>
          No bundle budget is measured. There is no Storybook. There is no per-component API
          table. And 46 of 48 components still lack complete sizes and variants — because they were
          written before the engine settled. All of it is recorded in the roadmap.
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Value label="Bundle budget in CI" value="none" tone="warn" />
          <Value label="Storybook" value="none" tone="warn" />
          <Value label="Per-component API table" value="none" tone="warn" />
          <Value label="Complete components (size + variant + state)" value="2 of 48" tone="warn" />
        </div>
      </Section>
    </div>
  );
}
