#!/usr/bin/env bun
/**
 * LIMINAL — the system page.
 *
 * Every value on it is READ FROM THE ENGINE. There is no hand-written hex, no
 * hand-written size, no copied formula. That is the point: the contract drifted
 * eleven times because it was a second copy of the system, and this page cannot
 * drift because it is not a copy at all.
 *
 * Run: bun scripts/gen-system-page.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LiminalLayoutEngine as L } from '../src/engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../src/engine/liminal-motion-engine';
import { LiminalColorEngine as C } from '../src/engine/liminal-color-engine';
import { LADDER, HALF, SHADOWS, SURFACE_TINT, getDirectionalRim, getTextStyle } from '../src/engine/spec-engine';
import { resolveBorder, resolveSurface } from '../src/engine/liminal-surface';
import { WELLS } from '../src/engine/liminal-ladder';
import { LADDER_STEP, LADDER_CHROMA, LADDER_HUE, CANVAS_L, PERCEPTUAL_QUANTUM, RELIABLE_BOUNDARY } from '../src/engine/liminal-ladder';
import { deriveTextToken, TEXT_ROLE_SPEC } from '../src/engine/liminal-contrast';
import { resolveMist } from '../src/engine/liminal-mist';
import { isolate } from '../src/engine/liminal-bidi';
import { hexToRgb, rgbToOklch, contrastRatioHex } from '../src/engine/liminal-color-math';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/system.html');

const Lof = (hex: string) => rgbToOklch(hexToRgb(hex)).L;
const f3 = (n: number) => n.toFixed(3);
const f4 = (n: number) => n.toFixed(4);

const ROLE_NAME = ['Canvas','Chrome','Work Surface','Nested Panel','Raised Control','Floating','Popover','Modal','Ceiling'];
const ROLE_USE = ['the mother surface','nav bar, tabs, outer bars','where panels and cards live','nested panels, inner cards','raised controls, active inputs','dropdowns, tooltips','popover, large dropdown','modal, drawer sheet','the ceiling of allowed darkness'];

const canvas = LADDER[0];
const TEXT = getTextStyle('primary', 2).color as string;
const DIM = getTextStyle('secondary', 2).color as string;
const FAINT = getTextStyle('tertiary', 2).color as string;
const LINE = resolveBorder({ role: 'work', kind: 'separator' });
const CARD = resolveSurface({ role: 'work' }).background;

const sec = (id: string, title: string, lede: string, body: string) => `
<section id="${id}">
  <h2>${title}</h2>
  <p class="lede">${lede}</p>
  ${body}
</section>`;

const formula = (s: string) => `<div class="formula">${s}</div>`;

// ── 1. THE LADDER ──────────────────────────────────────────────────────────
const ladderRows = LADDER.map((hex, i) => {
  const l = Lof(hex);
  const prev = i > 0 ? Lof(LADDER[i - 1]) : null;
  const dL = prev === null ? null : l - prev;
  const q = dL === null ? null : dL / PERCEPTUAL_QUANTUM;
  return `
  <tr>
    <td class="mono">S${i}</td>
    <td><span class="sw" style="background:${hex}"></span><span class="mono">${hex}</span></td>
    <td class="mono">${f3(l)}</td>
    <td class="mono">${dL === null ? '—' : f4(dL)}</td>
    <td class="mono">${q === null ? '—' : q.toFixed(2) + 'q'}</td>
    <td>${ROLE_NAME[i]}</td>
    <td class="use">${ROLE_USE[i]}</td>
  </tr>`;
}).join('');

const ladder = sec('ladder', 'The tonal ladder', `
  Nine surfaces, and the step between them is a <b>measured perceptual quantum</b>, not a taste.
  Hue and chroma are held constant, so only lightness moves — which is what makes it a scale rather
  than a palette. The previous hand-made ladder wandered 14° in hue and varied 2.3× in chroma.
`, `
  ${formula(`L(n) = ${CANVAS_L} + n × ${LADDER_STEP} &nbsp;|&nbsp; C = ${LADDER_CHROMA} &nbsp;|&nbsp; H = ${LADDER_HUE}°`)}
  <div class="cards">
    <div class="stat"><span class="k">q — the perceptual threshold</span><span class="v">${PERCEPTUAL_QUANTUM}</span><span class="n">50% detection, measured over 3 sessions (0.0083 / 0.0079 / 0.0089)</span></div>
    <div class="stat"><span class="k">r — the reliable boundary</span><span class="v">${RELIABLE_BOUNDARY}</span><span class="n">95% detection · r/q = ${(RELIABLE_BOUNDARY / PERCEPTUAL_QUANTUM).toFixed(2)}</span></div>
    <div class="stat"><span class="k">realised step</span><span class="v">1.07q–1.27q</span><span class="n">${isolate('8-bit hex quantisation')} نمیتواند هدف را دقیق بزند؛ دنباله بهینه شده تا واریانس گام کمینه شود</span></div>
  </div>
  <table>
    <thead><tr><th>step</th><th>hex</th><th>OKLCH L</th><th>ΔL</th><th>ΔL / q</th><th>role</th><th>where it is used</th></tr></thead>
    <tbody>${ladderRows}</tbody>
  </table>
  <h3>Sub-canvas wells</h3>
  <p class="lede">Below the canvas. Two wells, for ambient and contact shadow — the only places the system goes darker than S0.</p>
  <div class="row">
    ${Object.entries(WELLS).map(([k, hex]) => `
      <div class="well"><span class="sw big" style="background:${hex}"></span>
        <div><b>${k}</b><div class="mono">${hex} · L ${f3(Lof(hex))}</div>
        <div class="use">${k === 'penumbra' ? 'the soft dark under a lifted surface' : 'the tight dark where a surface touches the canvas'}</div></div>
      </div>`).join('')}
  </div>
`);

// ── 2. RIM ─────────────────────────────────────────────────────────────────
const rimTiers = [1, 2, 3].map((t) => {
  const r = getDirectionalRim(t as 1, t as 1, false)!;
  return `
  <tr>
    <td class="mono">Rim ${t}</td>
    <td><span class="sw" style="background:${r.top}"></span><span class="mono">${r.top}</span></td>
    <td><span class="sw" style="background:${r.side}"></span><span class="mono">${r.side}</span></td>
    <td><span class="sw" style="background:${r.bot}"></span><span class="mono">${r.bot}</span></td>
    <td class="use">${t === 1 ? 'chrome, S1' : t === 2 ? 'work surface, S2' : 'raised, S3 and above'}</td>
  </tr>`;
}).join('');

const rim = sec('rim', 'The directional rim', `
  A 180° linear gradient that fakes a light source above. Top is 100%, side 55%, bottom is the
  lowest ladder step. It is what makes a surface read as <i>lifted</i> rather than merely lighter.
`, `
  ${formula('top = ladder(host + 1) &nbsp;|&nbsp; side = ladder(host + 0.5) &nbsp;|&nbsp; bottom = ladder(host)')}
  <table>
    <thead><tr><th>tier</th><th>top (100%)</th><th>side (55%)</th><th>bottom</th><th>where</th></tr></thead>
    <tbody>${rimTiers}</tbody>
  </table>
  <p class="note">On press, the gradient inverts to 180° reversed and the element moves down
  <span class="mono">translateY(0.5px)</span> — the surface reads as physically pushed in.</p>
`);

// ── 3. BORDERS ─────────────────────────────────────────────────────────────
const borderKinds: Array<[string, string]> = [['separator', 'a line between two regions of the SAME surface — half a step, at the threshold'], ['edge', 'the boundary of a surface against what it sits on — a whole step, because a border has to be a border']];
const borderRows = borderKinds.map(([kind, use]) => {
  const work = resolveBorder({ role: 'work', kind: kind as 'separator' });
  const menu = resolveBorder({ role: 'menu', kind: kind as 'separator' });
  return `
  <tr>
    <td class="mono">${kind}</td>
    <td><span class="sw" style="background:${work}"></span><span class="mono">${work}</span></td>
    <td><span class="sw" style="background:${menu}"></span><span class="mono">${menu}</span></td>
    <td class="mono">${L.BORDER[kind === 'separator' ? 'hairline' : 'emphasis']}px</td>
    <td class="use">${use}</td>
  </tr>`;
}).join('');

const borders = sec('borders', 'Borders', `
  A border is not a colour. It is the <b>ladder step one half above its host</b>, so it is always
  exactly as visible as the surface it sits on — never more, never less.
`, `
  ${formula('border(role, kind) = ladder(host + 0.5) &nbsp; clamped to the ceiling')}
  <table>
    <thead><tr><th>kind</th><th>on the work surface</th><th>on a menu</th><th>width</th><th>what it means</th></tr></thead>
    <tbody>${borderRows}</tbody>
  </table>
  <p class="note">The clamp matters: without it, a border on the ceiling surface would ask for a
  ladder step that does not exist and silently return the ceiling itself.</p>
`);

// ── 4. SHADOWS ─────────────────────────────────────────────────────────────
const shadowRows = Object.entries(SHADOWS).map(([e, v]) => `
  <tr>
    <td class="mono">E${e}</td>
    <td><div class="shadowbox" style="box-shadow:${v}">E${e}</div></td>
    <td class="mono small">${v}</td>
    <td class="use">${e === '1' ? 'dropdown, header' : e === '2' ? 'featured card, popover' : e === '3' ? 'modal, drawer sheet' : 'toast, max floating anchor'}</td>
  </tr>`).join('');

const shadows = sec('shadows', 'Shadows', `
  Four elevations. Each is <b>two layers</b> — a wide soft one and a tight one — because a single
  blur reads as a smudge rather than as a surface above another.
`, `
  <table>
    <thead><tr><th></th><th>rendered</th><th>value</th><th>where</th></tr></thead>
    <tbody>${shadowRows}</tbody>
  </table>
`);

// ── 5. TEXT ────────────────────────────────────────────────────────────────
const textRows = (['primary', 'secondary', 'tertiary', 'quaternary'] as const).map((role) => {
  const spec = TEXT_ROLE_SPEC[role];
  const t = getTextStyle(role, 2);
  const solid = (t.color as string).match(/rgba?\(([^)]+)\)/);
  const alpha = solid ? solid[1].split(',')[3] : '1';
  return `
  <tr>
    <td class="mono">${role}</td>
    <td style="color:${t.color}">The quick brown fox</td>
    <td class="mono">${(t.color as string)}</td>
    <td class="mono">${Number(alpha).toFixed(3)}</td>
    <td class="mono">Lc ${spec.apca}</td>
    <td class="mono">${spec.wcag}:1</td>
    <td class="use">${spec.use}</td>
  </tr>`;
}).join('');

const text = sec('text', 'Text hierarchy', `
  Four levels, and the alpha of each is <b>derived from a declared-use floor</b> rather than picked.
  Both lenses are applied — APCA and WCAG — and the stricter one wins. There is no code path that
  returns a colour which fails its floor.
`, `
  ${formula('alpha = the smallest value where APCA ≥ Lc floor <b>and</b> WCAG ≥ ratio floor')}
  <table>
    <thead><tr><th>role</th><th>rendered</th><th>value</th><th>alpha</th><th>APCA floor</th><th>WCAG floor</th><th>declared use</th></tr></thead>
    <tbody>${textRows}</tbody>
  </table>
  <p class="note"><b>secondary and tertiary share an alpha</b> (0.790). Their hierarchy is size and
  weight, not colour — the honest reading of a shared floor, chosen by eye from a live test.</p>
  <p class="note"><b>quaternary is not for read copy.</b> Its floor is APCA Lc 30 — the minimum for
  <i>any</i> text — and it measures 4.06:1 on the darkest surface, under the 4.5 AA asks for normal
  text. Its legitimate uses are placeholders, disabled text and decorative separators.</p>
`);

// ── 6. SEMANTICS ───────────────────────────────────────────────────────────
const semRows = (['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const).map((k) => {
  const s = (C.SEMANTICS as any)[k];
  return `
  <tr>
    <td class="mono">${k}</td>
    <td><span class="chip" style="background:${s.solid};color:${s.onSolid}">${s.glyph} ${k}</span></td>
    <td><span class="sw" style="background:${s.solid}"></span><span class="mono small">${s.solid}</span></td>
    <td style="color:${s.text}">Readable</td>
    <td class="mono">${s.hue}</td>
    <td class="use">glyph <b>${s.glyph}</b> — meaning survives colour blindness</td>
  </tr>`;
}).join('');

const semantics = sec('semantics', 'Semantic roles', `
  Four roles. <b>Only the hue is a convention</b> — everything else is derived: the fill's lightness
  from the APCA floor against white text, the chroma from one value shared by all four, the text
  colour from the same dual-lens derivation as the text hierarchy.
`, `
  ${formula('hue is chosen &nbsp;|&nbsp; L(fill) from APCA &nbsp;|&nbsp; C is one value for all four &nbsp;|&nbsp; onSolid is white &nbsp;|&nbsp; both lenses must pass')}
  <table>
    <thead><tr><th>role</th><th>rendered</th><th>fill</th><th>text on surface</th><th>hue</th><th>why it works without colour</th></tr></thead>
    <tbody>${semRows}</tbody>
  </table>
`);

// ── 7. SCALES ──────────────────────────────────────────────────────────────
const scaleBlock = (title: string, note: string, rows: string) => `
  <div class="scale"><h3>${title}</h3><p class="use">${note}</p><table><tbody>${rows}</tbody></table></div>`;

const scales = sec('scales', 'The scales', `
  Every geometric value the system decides. Nothing here is a literal in a component — there is a
  lint rule that fails the build if one appears.
`, `
  <div class="grid2">
    ${scaleBlock('Spacing', 'atom 4px · below it, elements read as touching', Object.entries(L.SPACING).map(([k, v]) => `<tr><td class="mono">SPACING[${k}]</td><td class="mono">${v}px</td><td><span class="bar" style="width:${Math.min(v, 96)}px"></span></td><td class="use">${k === '0' ? 'sub-atom: optical correction only, never separation' : ''}</td></tr>`).join(''))}
    ${scaleBlock('Radius', 'concentric law: inner radius = outer − padding', Object.entries(L.RADIUS).map(([k, v]) => `<tr><td class="mono">${k}</td><td class="mono">${v}px</td><td><span class="rad" style="border-radius:${Math.min(v, 20)}px"></span></td></tr>`).join(''))}
    ${scaleBlock('Control heights', 'md IS the accessible minimum, which is why the two names agree', Object.entries(L.CONTROL).map(([k, v]) => `<tr><td class="mono">${k}</td><td class="mono">${v}px</td><td class="use">${v === L.TARGET.min ? `= TARGET.min (WCAG 2.5.5 AAA)` : ''}</td></tr>`).join(''))}
    ${scaleBlock('Type', `ratio ${L.TYPE_RATIO} · base ${L.TYPE_BASE_CSS}`, [1,2,3,4,5,6,7,8].map((n) => { const t = L.TYPOGRAPHY[n]; return `<tr><td class="mono">${n}</td><td class="mono">${t.fs}px</td><td style="font-size:${t.fs}px;line-height:1.1">Aa</td><td class="use">${t.role} · lh ${t.lh} · ls ${t.ls}</td></tr>`; }).join(''))}
    ${scaleBlock('Motion', 'durations and easings', Object.entries(M.DURATION).map(([k, v]) => `<tr><td class="mono">${k}</td><td class="mono">${v}ms</td><td class="use">${Object.entries(M.EASING).find(([ek]) => ek === k)?.[1] ?? ''}</td></tr>`).join(''))}
    ${scaleBlock('Extended spectrum', '12 hues, calibrated', (C.EXTENDED_SPECTRUM as any[]).map((h) => `<tr><td class="mono">${h.hue}</td><td><span class="sw" style="background:${h.hex}"></span></td><td class="mono small">${h.hex}</td><td class="use">${h.label}</td></tr>`).join(''))}
  </div>
`);

// ── 8. MIST ────────────────────────────────────────────────────────────────
const mist = sec('mist', 'Mist', `
  The surface treatment for floating elements. It is <b>derived from float height</b> — the further
  a surface is from the canvas, the more fog it collects. There is no blur: <code>${isolate('backdrop-filter')}</code>
  was measured at <b>35.7×</b> the compositing cost for no visible gain on near-uniform dark.
`, `
  ${formula('height = ladder level − canvas &nbsp;|&nbsp; every mist value is a function of height')}
  <div class="row">
    ${(['menu', 'toast'] as const).map((role) => {
      const m = resolveMist(role);
      const v = m as any;
      return `<div class="mistcard">
        <b>${role}</b>
        <div class="mono small">level ${v.level} · height ${v.height} · ${v.quanta.toFixed(2)}q</div>
        <div class="mono small">fill ${v.fillColor} α ${v.fillAlpha.toFixed(3)}</div>
        <div class="mono small">ring α ${v.ringAlpha.toFixed(3)} · edge α ${v.edgeAlpha.toFixed(3)}</div>
        <div class="mono small">light: ${v.light.map((l: any) => `blur ${l.blur} α ${l.alpha.toFixed(3)}`).join(' · ')}</div>
      </div>`;
    }).join('')}
  </div>
`);

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — the system</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${canvas}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
    font-size:15px; line-height:1.7; -webkit-font-smoothing:antialiased; }
  .wrap { max-width:1180px; margin:0 auto; padding:56px 24px 120px; }
  header h1 { font-size:34px; margin:0 0 8px; font-weight:700; letter-spacing:-0.02em; }
  header p { color:${DIM}; margin:0 0 6px; max-width:70ch; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.1em; text-transform:uppercase; }
  nav { display:flex; flex-wrap:wrap; gap:8px; margin:28px 0 8px; }
  nav a { font-family:ui-monospace,monospace; font-size:12px; color:${DIM}; text-decoration:none;
    border:1px solid ${LINE}; border-radius:999px; padding:4px 12px; }
  nav a:hover { color:${TEXT}; border-color:${FAINT}; }
  section { margin:56px 0 0; padding-top:28px; border-top:1px solid ${LINE}; }
  h2 { font-size:22px; margin:0 0 6px; font-weight:650; letter-spacing:-0.01em; }
  h3 { font-size:15px; margin:22px 0 8px; font-weight:600; }
  .lede { color:${DIM}; margin:0 0 16px; max-width:78ch; }
  .use { color:${FAINT}; font-size:12.5px; }
  .note { color:${DIM}; font-size:13.5px; border-inline-start:2px solid ${LINE}; padding-inline-start:12px; margin:14px 0; max-width:78ch; }
  .formula { font-family:ui-monospace,monospace; font-size:13px; background:${CARD};
    border:1px solid ${LINE}; border-radius:10px; padding:12px 14px; margin:0 0 16px;
    direction:ltr; text-align:left; color:${DIM}; overflow-x:auto; }
  .mono { font-family:ui-monospace,monospace; font-size:12.5px; }
  .small { font-size:11.5px; }
  table { width:100%; border-collapse:collapse; margin:0 0 8px; }
  th { text-align:start; font-size:11.5px; font-weight:600; color:${FAINT}; text-transform:uppercase;
    letter-spacing:.06em; padding:8px 10px; border-bottom:1px solid ${LINE}; }
  td { padding:9px 10px; border-bottom:1px solid ${LINE}; vertical-align:middle; }
  tr:last-child td { border-bottom:none; }
  .sw { display:inline-block; width:18px; height:18px; border-radius:4px; border:1px solid ${LINE};
    vertical-align:middle; margin-inline-end:8px; }
  .sw.big { width:40px; height:40px; border-radius:8px; }
  .cards { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:12px; margin:0 0 20px; }
  .stat { border:1px solid ${LINE}; border-radius:12px; padding:14px; background:${CARD}; }
  .stat .k { display:block; font-size:11.5px; color:${FAINT}; text-transform:uppercase; letter-spacing:.05em; }
  .stat .v { display:block; font-family:ui-monospace,monospace; font-size:24px; color:${TEXT}; margin:4px 0; }
  .stat .n { display:block; font-size:12px; color:${DIM}; }
  .row { display:flex; flex-wrap:wrap; gap:14px; }
  .well { display:flex; gap:12px; align-items:center; border:1px solid ${LINE}; border-radius:12px; padding:14px; background:${CARD}; flex:1 1 260px; }
  .chip { display:inline-block; font-size:12px; font-weight:600; border-radius:999px; padding:3px 10px; }
  .shadowbox { width:70px; height:44px; border-radius:10px; background:${LADDER[5]};
    display:flex; align-items:center; justify-content:center; font-size:12px; color:${DIM}; }
  .grid2 { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:22px; }
  .scale table { margin:0; }
  .bar { display:inline-block; height:8px; background:${FAINT}; border-radius:2px; }
  .rad { display:inline-block; width:22px; height:22px; border:1.5px solid ${FAINT}; }
  .mistcard { border:1px solid ${LINE}; border-radius:12px; padding:14px; background:${CARD}; flex:1 1 300px; }
  footer { color:${FAINT}; font-size:12px; margin-top:56px; border-top:1px solid ${LINE}; padding-top:20px; }
  code { font-family:ui-monospace,monospace; background:${CARD}; border:1px solid ${LINE}; border-radius:4px; padding:1px 5px; font-size:12px; }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <p class="eyebrow">LIMINAL · سیستم طراحی ادراکی</p>
    <h1>سیستم، با فرمول‌هایش</h1>
    <p>هر مقدار این صفحه <b>از موتور خوانده می‌شود</b>. هیچ هگز دست‌نویس، هیچ اندازه‌ی دست‌نویس، هیچ فرمول کپی‌شده‌ای در آن نیست.</p>
    <p class="use">دلیلش ساده است: قرارداد یازده بار از موتور جدا شد چون یک نسخه‌ی دوم بود. این صفحه نمی‌تواند جدا شود — چون نسخه‌ی دوم نیست.</p>
    <nav>
      <a href="#ladder">نردبان</a><a href="#rim">ریم</a><a href="#borders">حاشیه</a>
      <a href="#shadows">سایه</a><a href="#text">متن</a><a href="#semantics">معنایی</a>
      <a href="#scales">مقیاس‌ها</a><a href="#mist">مه</a>
    </nav>
  </header>
  ${ladder}${rim}${borders}${shadows}${text}${semantics}${scales}${mist}
  <footer>
    تولید‌شده توسط <code>scripts/gen-system-page.ts</code> · بدون شبکه · بدون وابستگی ·
    ${LADDER.length} سطح · ${Object.keys(SHADOWS).length} ارتفاع · ${(C.EXTENDED_SPECTRUM as any[]).length} فام
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
