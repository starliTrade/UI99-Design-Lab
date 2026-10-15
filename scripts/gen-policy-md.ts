#!/usr/bin/env bun
/**
 * LIMINAL — LIMINAL-POLICY.md: the value blocks are generated.
 *
 * Same shape as the contract, and for the same reason: the POLICY is the rules,
 * which are authored, and the NUMBERS are the engine's, which are derived. Writing
 * the numbers down a second time makes a copy, and copies drift — this project has
 * measured that eleven times in one file.
 *
 * So the rules stay in the file and the tables are regenerated, and a test asserts
 * the two are in sync.
 *
 * Run: bun scripts/gen-policy-md.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LADDER, CANVAS_L, LADDER_STEP, LADDER_CHROMA, LADDER_HUE, PERCEPTUAL_QUANTUM,
} from '../src/engine/liminal-ladder';
import {
  ROLE_LEVEL, ROLE_RIM, ROLE_SHADOW, resolveBorderLevel, FLOATING_ROLES,
} from '../src/engine/liminal-surface';
import { shadowModel, shadowPeakAlpha } from '../src/engine/liminal-shadow';
import { oklchToHex } from '../src/engine/liminal-color-math';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = resolve(__dirname, '../LIMINAL-POLICY.md');
const q = PERCEPTUAL_QUANTUM;
const Q = (a: number, b: number) => ((a - b) / q).toFixed(4);
const oklch = (level: number) => `oklch(${(CANVAS_L + level * LADDER_STEP).toFixed(7)} ${LADDER_CHROMA} ${LADDER_HUE})`;
const hexAt = (level: number) => oklchToHex({ L: CANVAS_L + level * LADDER_STEP, C: LADDER_CHROMA, h: LADDER_HUE });
const rgbAt = (level: number) => [1, 3, 5].map((i) => parseInt(hexAt(level).slice(i, i + 2), 16));
const ROLE = ['canvas', 'chrome', 'work', 'panel', 'control', 'menu', 'popover', 'modal', 'toast'] as const;

const blocks: Record<string, string> = {
  'constants': [
    '```',
    `L(n) = ${CANVAS_L} + n × ${LADDER_STEP}`,
    `C    = ${LADDER_CHROMA}      ← ثابت، یک مقیاس است`,
    `H    = ${LADDER_HUE}°     ← ثابت`,
    `q    = ${PERCEPTUAL_QUANTUM}    ← کوانتوم ادراکی، اندازه‌گیری‌شده`,
    `گام  = ${LADDER_STEP} = ${(LADDER_STEP / q).toFixed(4)}q   ← فاصله‌ی هر لایه از لایه‌ی قبلی`,
    `سقف  = L ≤ ${(CANVAS_L + 8 * LADDER_STEP).toFixed(4)}`,
    '```',
  ].join('\n'),

  'layers': [
    '| پله | نقش | hex | oklch (دقیق) | L | فاصله از قبلی |',
    '|---|---|---|---|---|---|',
    ...Array.from({ length: 9 }, (_, n) => {
      const l = CANVAS_L + n * LADDER_STEP;
      return `| **S${n}** | ${ROLE[n]} | \`${LADDER[n]}\` | \`${oklch(n)}\` | \`${l.toFixed(6)}\` | ${n === 0 ? '—' : '`1.1416q`'} |`;
    }),
  ].join('\n'),

  'borders': [
    '| لایه | جداکننده (`n+0.5`) | از سطح خودش | از میزبان | مرز (`n+1`) | از سطح خودش | از میزبان |',
    '|---|---|---|---|---|---|---|',
    ...Array.from({ length: 9 }, (_, n) => {
      const host = Math.max(0, n - 1);
      const cell = (kind: 'separator' | 'edge') => {
        const lvl = resolveBorderLevel({ role: ROLE[n], kind });
        return `\`S${lvl}\` · ${hexAt(lvl)}`;
      };
      const own = (kind: 'separator' | 'edge') => {
        const lvl = resolveBorderLevel({ role: ROLE[n], kind });
        return `${Q(CANVAS_L + lvl * LADDER_STEP, CANVAS_L + n * LADDER_STEP)}q`;
      };
      const fromHost = (kind: 'separator' | 'edge') => {
        const lvl = resolveBorderLevel({ role: ROLE[n], kind });
        return `${Q(CANVAS_L + lvl * LADDER_STEP, CANVAS_L + host * LADDER_STEP)}q`;
      };
      return `| S${n} | ${cell('separator')} | ${own('separator')} | ${fromHost('separator')} | ${cell('edge')} | ${own('edge')} | ${fromHost('edge')} |`;
    }),
  ].join('\n'),

  'shadows': [
    '| لایه | ارتفاع | near | far | میزبان S2 | میزبان S3 | اوج |',
    '|---|---|---|---|---|---|---|',
    ...FLOATING_ROLES.map((role) => {
      const h = ROLE_LEVEL[role];
      const a2 = shadowModel(h, rgbAt(2));
      const a3 = shadowModel(h, rgbAt(3));
      return `| S${h} ${role} | ${h} | \`${a2.near.toFixed(1)}px\` | \`${a2.far.toFixed(0)}px\` | \`α ${a2.nearAlpha.toFixed(4)}\` | \`α ${a3.nearAlpha.toFixed(4)}\` | **\`−1.000q\`** |`;
    }),
  ].join('\n'),

  'allowed': [
    '| پله | نقش | جداکننده | مرز | ریم | سایه |',
    '|---|---|---|---|---|---|',
    ...Array.from({ length: 9 }, (_, n) => {
      const role = ROLE[n];
      const rim = ROLE_RIM[role];
      const shadow = ROLE_SHADOW[role];
      return `| S${n} | ${role} | ✅ | ✅ | ${rim ? `درجه ${rim}` : '**ممنوع**'} | ${shadow === null ? '**ممنوع**' : `E${shadow}`} |`;
    }),
  ].join('\n'),
};

let text = readFileSync(FILE, 'utf8');
let count = 0;
for (const [name, value] of Object.entries(blocks)) {
  const re = new RegExp(`(<!-- gen:${name} -->)[\\s\\S]*?(<!-- /gen:${name} -->)`);
  if (!re.test(text)) continue;
  text = text.replace(re, `$1\n${value}\n$2`);
  count++;
}
writeFileSync(FILE, text);
console.log(`LIMINAL-POLICY.md — ${count} value block(s) regenerated`);
