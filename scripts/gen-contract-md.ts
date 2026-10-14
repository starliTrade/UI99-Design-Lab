#!/usr/bin/env bun
/**
 * LIMINAL — DESIGN-CONTRACT.md: the value blocks are generated.
 *
 * The contract has two kinds of content and they need different treatment:
 *
 *   PROSE      why the system is the way it is. Authored, and it stays in the
 *              file. A generator would freeze it into a template.
 *   VALUES     ladder hexes, spacing, radius, type, alphas, semantics, the
 *              spectrum, durations, easings, CSS variables. These are already
 *              derived by the engine, so writing them down a second time is a
 *              copy — and copies drift. Measured: eleven mismatches.
 *
 * So the value blocks are wrapped in markers and regenerated. Same shape as
 * `index.css`: the file is the source of the prose, the engine is the source of
 * the numbers, and a test asserts the two are in sync.
 *
 * Run: bun scripts/gen-contract-md.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../src/engine/liminal-motion-engine';
import { LiminalColorEngine as C } from '../src/engine/liminal-color-engine';
import { LADDER, HALF, SHADOWS, SURFACE_TINT, VEIL, getDirectionalRim } from '../src/engine/spec-engine';
import { LADDER_STEP, LADDER_CHROMA, LADDER_HUE, CANVAS_L, PERCEPTUAL_QUANTUM, RELIABLE_BOUNDARY, WELLS } from '../src/engine/liminal-ladder';
import { hexToRgb, rgbToOklch } from '../src/engine/liminal-color-math';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, '../DESIGN-CONTRACT.md');

const Lof = (hex: string) => rgbToOklch(hexToRgb(hex)).L.toFixed(3);
const n = (v: number) => v.toFixed(4).replace(/0+$/, '').replace(/\.$/, '');

const ROLE_NAME: Record<number, string> = {
  0: 'Canvas', 1: 'Chrome', 2: 'Work Surface', 3: 'Nested Panel', 4: 'Raised Control',
  5: 'Floating', 6: 'Popover', 7: 'Modal', 8: 'Ceiling',
};
const ROLE_DESC: Record<number, string> = {
  0: 'بستر مادر و مرجع مطلق تاریکی',
  1: 'نوبار، تب‌های ناوبری، نوارهای بیرونی',
  2: 'سطح کار؛ میزبان پنل‌ها و کارت‌ها',
  3: 'پنل‌های تو در تو، کارت‌های داخلی',
  4: 'کنترل‌های برجسته، اینپوت‌های فعال',
  5: 'منوهای بازشونده، تولتیپ',
  6: 'پاپ‌اور، دراپ‌داون بزرگ',
  7: 'مدال، دراور شیت',
  8: 'سقف تاریکی مجاز',
};

const BLOCKS: Record<string, () => string> = {
  'ladder-formula': () =>
    `$$L(n) = ${CANVAS_L} + n \\times ${LADDER_STEP} \\quad | \\quad C = ${LADDER_CHROMA} \\quad | \\quad H = ${LADDER_HUE}°$$`,

  'ladder-steps': () =>
    LADDER.map((hex, i) => `- **S${i} (${ROLE_NAME[i]}):** \`${hex}\` ($L \\approx ${Lof(hex)}$) — ${ROLE_DESC[i]}`).join('\n'),

  'ladder-wells': () =>
    `- **S-1 (Penumbra Ambient):** \`${WELLS.penumbra}\` ($L \\approx ${Lof(WELLS.penumbra)}$)\n` +
    `- **S-2 (Contact Umbra):** \`${WELLS.umbra}\` ($L \\approx ${Lof(WELLS.umbra)}$)`,

  'rim': () =>
    [1, 2, 3].map((tier) => {
      const r = getDirectionalRim(tier as 1, tier as 1, false);
      return `- **Rim ${tier}${tier === 1 ? ' (Chrome / S1)' : tier === 2 ? ' (Work Surface / S2)' : ' (Raised / S3+)'}:** Top \`${r.top}\` | Side \`${r.side}\` | Bottom \`${r.bot}\``;
    }).join('\n'),

  'shadows': () =>
    Object.entries(SHADOWS)
      .map(([e, v]) => `- **E${e}:**\n  \`${(v as string).replace(/, /g, ', ')}\``)
      .join('\n'),

  'spacing': () => {
    const entries = Object.entries(L.SPACING);
    const cohesive = entries.filter(([, v]) => (v as number) <= 12);
    const separating = entries.filter(([, v]) => (v as number) >= 16);
    const line = ([k, v]: [string, unknown]) => `  - \`SPACING[${k}]\` = \`${v}px\``;
    return (
      `- پیوسته (Cohesive): $\\le 12px$\n` + cohesive.map(line).join('\n') +
      `\n- جداکننده (Separating): $\\ge 16px$\n` + separating.map(line).join('\n')
    );
  },

  'radius': () =>
    Object.entries(L.RADIUS).map(([k, v]) => `- **RADIUS.${k}:** \`${v}px\``).join('\n'),

  'typography': () =>
    `**نسبت:** \`${L.TYPE_RATIO}\` · **سطح پایه:** \`${L.TYPE_BASE_LEVEL}\`\n\n` +
    `**پایه‌ی شناور:** \`${L.TYPE_BASE_CSS}\`\n\n` +
    `| سطح | نقش | ضریب | اندازه در پایه‌ی مرجع (${L.TYPE_BASE_REF}px) | line-height | letter-spacing | وزن |\n` +
    `|---|---|---|---|---|---|---|\n` +
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => {
      const t = L.TYPOGRAPHY[lvl];
      return `| ${lvl} | ${t.role} | ${L.typeScale(lvl).toFixed(6)} | ${t.fs}px | ${t.lh} | ${t.ls} | ${t.weight} |`;
    }).join('\n'),

  'alphas': () =>
    `| نقش | آلفا | کف APCA | کف WCAG |\n|---|---|---|---|\n` +
    ['primary', 'secondary', 'tertiary', 'quaternary']
      .map((r) => {
        const h: any = (L as any).TEXT_HIERARCHY ?? null;
        return `| ${r} | ${h ? h[r][0] : '—'} | — | — |`;
      })
      .join('\n'),

  'semantics': () =>
    (['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const)
      .map((k) => {
        const s = (C.SEMANTICS as any)[k];
        return `- **${k}:** Solid \`${s.solid}\` | Text \`${s.text}\` | On-solid \`${s.onSolid}\` | Subtle \`${s.subtle}\` | Border \`${s.border}\` | Glyph \`${s.glyph}\``;
      })
      .join('\n'),

  'brand': () => {
    const b: any = C.BRAND_PRIMARY;
    return `- \`${b.hex}\` — ${b.name}. hover \`${b.hover}\` · active \`${b.active}\` · on \`${b.onColor}\``;
  },

  'spectrum': () =>
    (C.EXTENDED_SPECTRUM as any[])
      .map((s) => `${s.label} (\`${s.hex}\`), hue ${s.hue}`)
      .join(' · ') + '.',

  'durations': () =>
    Object.entries(M.DURATION).map(([k, v]) => `- \`${k}\`: \`${v}ms\``).join('\n'),

  'easings': () =>
    Object.entries(M.EASING).map(([k, v]) => `- \`${k}\`: \`${v}\``).join('\n'),

  'transitions': () =>
    Object.entries(M.TRANSITION).map(([k, v]) => `- **${k}:** \`${v}\``).join('\n'),

  'quantum': () =>
    `- $q = ${PERCEPTUAL_QUANTUM}$ — آستانه‌ی ادراکی (۵۰٪ تشخیص)\n` +
    `- $r = ${RELIABLE_BOUNDARY}$ — مرز قابل‌اعتماد (۹۵٪ تشخیص) · $r/q = ${(RELIABLE_BOUNDARY / PERCEPTUAL_QUANTUM).toFixed(2)}$`,
};

let md = readFileSync(FILE, 'utf8');
let replaced = 0;
for (const [name, build] of Object.entries(BLOCKS)) {
  const re = new RegExp(`(<!-- gen:${name} -->)([\\s\\S]*?)(<!-- /gen:${name} -->)`);
  if (!re.test(md)) continue;
  md = md.replace(re, `$1\n${build()}\n$3`);
  replaced++;
}
writeFileSync(FILE, md);
console.log(`DESIGN-CONTRACT.md — ${replaced} value block(s) regenerated`);
