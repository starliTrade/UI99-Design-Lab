#!/usr/bin/env bun
/**
 * LIMINAL — W3C Design Tokens (DTCG).
 *
 * The system's tokens live in TypeScript and reach CSS through a generator this
 * repo owns. That is enough for this repo and not enough for anyone else: a
 * design tool, a native app, a Figma plugin and a Tailwind preset all read
 * tokens, and none of them read a TypeScript file.
 *
 * DTCG is the format they agree on. This emits it, and every value comes from
 * the engine — the same source the CSS layer reads, so the two cannot disagree.
 *
 * Run: bun scripts/gen-dtcg.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../src/engine/liminal-motion-engine';
import { LiminalColorEngine as C } from '../src/engine/liminal-color-engine';
import { LADDER, HALF, SURFACE_TINT, VEIL, getDirectionalRim, getTextStyle } from '../src/engine/spec-engine';
import { FLOAT_SHADOWS } from '../src/engine/liminal-surface';
import { LADDER_STEP, LADDER_CHROMA, LADDER_HUE, CANVAS_L, PERCEPTUAL_QUANTUM, RELIABLE_BOUNDARY, WELLS } from '../src/engine/liminal-ladder';
import { PERSIAN_FONT_STACK, PERSIAN_LINE_HEIGHT_FLOOR } from '../src/engine/liminal-persian';
import { TEXT_ROLE_SPEC } from '../src/engine/liminal-contrast';
import { TOKEN_VERSION, TOKEN_CHANGES, DEPRECATION_WINDOW_MINORS, tokenVersionSummary } from '../src/engine/liminal-token-version';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../tokens/liminal.tokens.json');

type Token = { $value: unknown; $type: string; $description?: string };
type Group = { [k: string]: Token | Group };

const color = (value: string, description?: string): Token => ({ $value: value, $type: 'color', ...(description ? { $description: description } : {}) });
const dim = (value: number, description?: string): Token => ({ $value: { value, unit: 'px' }, $type: 'dimension', ...(description ? { $description: description } : {}) });
const dur = (value: number, description?: string): Token => ({ $value: { value, unit: 'ms' }, $type: 'duration', ...(description ? { $description: description } : {}) });
const num = (value: number, description?: string): Token => ({ $value: value, $type: 'number', ...(description ? { $description: description } : {}) });
const str = (value: string, type = 'string', description?: string): Token => ({ $value: value, $type: type, ...(description ? { $description: description } : {}) });

const ROLE = ['canvas', 'chrome', 'work', 'panel', 'control', 'floating', 'popover', 'modal', 'ceiling'];
const ROLE_NOTE = ['the mother surface', 'nav bar, tabs, outer bars', 'where panels and cards live', 'nested panels, inner cards', 'raised controls, active inputs', 'dropdowns, tooltips', 'popover, large dropdown', 'modal, drawer sheet', 'the ceiling of allowed darkness'];

const ladder: Group = {};
LADDER.forEach((hex, i) => (ladder[`s${i}`] = color(hex, `${ROLE[i]} — ${ROLE_NOTE[i]}`)));
HALF.forEach((hex, i) => (ladder[`s${i}-5`] = color(hex, `the step between s${i} and s${i + 1}; used by hover and the skeleton pulse`)));
ladder.penumbra = color(WELLS.penumbra, 'the soft dark under a lifted surface');
ladder.umbra = color(WELLS.umbra, 'the tight dark where a surface touches the canvas');

const rim: Group = {};
[1, 2, 3].forEach((t) => {
  const r = getDirectionalRim(t as 1, t as 1, false)!;
  rim[`rim${t}`] = {
    top: color(r.top, '100% — the light comes from above'),
    side: color(r.side, '55%'),
    bottom: color(r.bot, 'the host surface itself'),
  } as Group;
});

const shadow: Group = {};
// NAMED BY ROLE, not by a tier number. `shadow.menu` says what it is for;
// `shadow.e1` needed a comment to say the same thing, which is a name that was
// never written.
Object.entries(FLOAT_SHADOWS).forEach(([role, v]) =>
  (shadow[role] = str(v, 'boxShadow', `the ${role} — a floating surface at its own height`)),
);

const tint: Group = {};
Object.entries(SURFACE_TINT).forEach(([k, v]) => (tint[k] = color(v, 'a fill, never for type')));
const veil: Group = {};
Object.entries(VEIL).forEach(([k, v]) => (veil[k] = color(v, 'the backdrop behind a modal')));

const text: Group = {};
(['primary', 'secondary', 'tertiary', 'quaternary'] as const).forEach((role) => {
  const spec = TEXT_ROLE_SPEC[role];
  text[role] = color(getTextStyle(role, 2).color as string, `APCA Lc ${spec.apca} · WCAG ${spec.wcag}:1 · ${spec.use}`);
});

const semantic: Group = {};
(['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const).forEach((k) => {
  const s = (C.SEMANTICS as any)[k];
  semantic[k.toLowerCase()] = {
    solid: color(s.solid, `the fill; hue ${s.hue} is a convention, the lightness is derived`),
    text: color(s.text, 'readable on a surface'),
    onSolid: color(s.onSolid, 'readable on the fill'),
    subtle: color(s.subtle, 'a wash, never for type'),
    border: color(s.border),
    glyph: str(s.glyph, 'string', 'meaning that survives colour blindness'),
  } as Group;
});

const spectrum: Group = {};
(C.EXTENDED_SPECTRUM as any[]).forEach((h) => (spectrum[String(h.hue)] = color(h.hex, h.label)));

const spacing: Group = {};
Object.entries(L.SPACING).forEach(([k, v]) => (spacing[String(k)] = dim(v as number, k === '0' ? 'the sub-atom: optical correction only, never separation' : k === '1' ? 'the atom; below this, elements read as touching' : undefined)));

const radius: Group = {};
Object.entries(L.RADIUS).forEach(([k, v]) => (radius[k] = dim(v as number, 'the concentric law: an inner radius is the outer minus the padding')));

const control: Group = {};
Object.entries(L.CONTROL).forEach(([k, v]) => (control[k] = dim(v as number, v === L.TARGET.min ? 'the system default, and the accessible minimum' : undefined)));
const target: Group = {};
Object.entries(L.TARGET).forEach(([k, v]) => (target[k] = dim(v as number, k === 'min' ? 'WCAG 2.5.5 (AAA)' : 'WCAG 2.5.8 (AA)')));
const border: Group = {};
Object.entries(L.BORDER).forEach(([k, v]) => (border[k] = dim(v as number)));

const type: Group = {};
Object.entries(L.TYPOGRAPHY).forEach(([lvl, t]) => {
  type[String(lvl)] = {
    fontSize: str(L.getTypeSizeCss(Number(lvl)), 'dimension', `fluid; base ${L.TYPE_BASE_CSS}`),
    lineHeight: num(t.lh, 'a unitless multiplier, not a length'),
    letterSpacing: str(t.ls, 'dimension'),
    fontWeight: num(t.weight, 'fontWeight'),
    role: str(t.role),
  } as Group;
});

const motion: Group = {};
Object.entries(M.DURATION).forEach(([k, v]) => (motion[k] = dur(v as number)));
const easing: Group = {};
Object.entries(M.EASING).forEach(([k, v]) => {
  const m = (v as string).match(/cubic-bezier\(([^)]+)\)/);
  easing[k] = m
    ? { $value: m[1].split(',').map((n) => Number(n.trim())), $type: 'cubicBezier' }
    : str(v as string, 'string', 'linear');
});

const doc = {
  $schema: 'https://design-tokens.github.io/community-group/format/',
  $description: 'LIMINAL — a perceptual dark-native design system. Every value is derived by the engine; none is hand-picked.',
  color: { ladder, rim, shadow, tint, veil, text, semantic, spectrum },
  dimension: { spacing, radius, control, target, border },
  typography: type,
  motion: { duration: motion, easing },
  font: {
    latin: str('ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif', 'fontFamily'),
    persian: str(PERSIAN_FONT_STACK, 'fontFamily', `the line-height floor ${PERSIAN_LINE_HEIGHT_FLOOR} is derived from this face's own metrics`),
  },
  $extensions: {
    // The token contract's OWN version, which is not the package version. A
    // component can be refactored without a token changing, and a token can
    // change without a line of component code moving.
    'com.liminal.contract': {
      version: TOKEN_VERSION,
      deprecationWindowMinors: DEPRECATION_WINDOW_MINORS,
      summary: tokenVersionSummary(),
      changes: TOKEN_CHANGES,
    },
    'com.liminal.ladder': {
      canvasL: CANVAS_L,
      step: LADDER_STEP,
      chroma: LADDER_CHROMA,
      hue: LADDER_HUE,
      perceptualQuantum: PERCEPTUAL_QUANTUM,
      reliableBoundary: RELIABLE_BOUNDARY,
      note: 'The step is a MEASURED perceptual quantum. A theme may change the hue; it may not change the step, because the step does not depend on the colour.',
    },
    'com.liminal.persian': {
      lineHeightFloor: PERSIAN_LINE_HEIGHT_FLOOR,
      note: 'From Vazirmatn: (2100 + 1100 + 0) / 2048. A different face needs the floor re-derived.',
    },
  },
};

mkdirSync(resolve(__dirname, '../tokens'), { recursive: true });
writeFileSync(OUT, JSON.stringify(doc, null, 2) + '\n');
const count = (g: unknown): number => {
  if (typeof g !== 'object' || g === null || Array.isArray(g)) return 0;
  return Object.values(g as Record<string, unknown>).reduce(
    (n, v) => n + (typeof v === 'object' && v !== null && !Array.isArray(v) && '$value' in v ? 1 : count(v)),
    0,
  );
};
console.log(`wrote ${OUT}`);
console.log(`  ${count(doc)} tokens across ${Object.keys(doc).filter((k) => !k.startsWith('$')).length} top-level groups`);
