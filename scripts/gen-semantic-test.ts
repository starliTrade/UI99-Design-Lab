#!/usr/bin/env bun
/**
 * LIMINAL — the semantic colours: an eye test before a formula.
 *
 * The four semantic roles have no formula. Measured:
 *
 *   role      declared hue   on the spectrum?   solid L   text L
 *   SUCCESS   155            no                 0.721     0.828
 *   WARNING    85            no                 0.800     0.864
 *   DANGER     15            yes (Ruby)         0.637     0.760
 *   INFO      230            yes (Sapphire)     0.650     0.796
 *
 * Lightness swings from 0.637 to 0.800 with no rule, and the declared hue is
 * not even the OKLCH hue (INFO declares 230 and measures 257.5). So there are
 * two parallel palettes: the 12-hue spectrum, and these four.
 *
 * Four candidates. The eye decides the hue; the standards decide the lightness.
 *
 * Run: bun scripts/gen-semantic-test.ts
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LiminalColorEngine } from '../src/engine/liminal-color-engine';
import { getLadderColor, getTextStyle } from '../src/engine/spec-engine';
import { hexToRgb, rgbToOklch, oklchToHex, contrastRatioHex } from '../src/engine/liminal-color-math';
import { apcaMagnitude } from '../src/engine/liminal-contrast';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../design-lab/semantic-test.html');

const SP: any = LiminalColorEngine.EXTENDED_SPECTRUM;
const SEM: any = LiminalColorEngine.SEMANTICS;
const KEYS = ['SUCCESS', 'WARNING', 'DANGER', 'INFO'] as const;
const FA: Record<string, string> = { SUCCESS: 'فعال', WARNING: 'هشدار', DANGER: 'خطا', INFO: 'اطلاع' };
const GLYPH: Record<string, string> = { SUCCESS: '✓', WARNING: '!', DANGER: '×', INFO: 'i' };

/** The nearest spectrum hue for each role. Two are already on it. */
const SNAP: Record<string, number> = { SUCCESS: 145, WARNING: 75, DANGER: 15, INFO: 230 };

const canvas = getLadderColor(0);
const work = getLadderColor(2);
const TEXT = 'rgba(233,236,242,0.92)';
const DIM = 'rgba(233,236,242,0.55)';
const FAINT = 'rgba(233,236,242,0.28)';
const LINE = 'rgba(233,236,242,0.10)';

const rgba = (hex: string, a: number) => { const { r, g, b } = hexToRgb(hex); return `rgba(${r}, ${g}, ${b}, ${a})`; };
const spOf = (hue: number) => SP.find((s: any) => s.hue === hue);
const chromaOf = (hex: string) => { const { r, g, b } = hexToRgb(hex); return rgbToOklch({ r, g, b }); };

interface Facets { text: string; solid: string; onSolid: string; subtle: string; border: string }

/** Derive all five facets from ONE spectrum entry. */
function derive(hue: number, textL: number, solidL: number, boost: number): Facets {
  const s = spOf(hue);
  const { C, h } = chromaOf(s.hex);
  const solid = oklchToHex({ L: solidL, C: C * boost, h });
  return {
    text: oklchToHex({ L: textL, C, h }),
    solid,
    onSolid: oklchToHex({ L: 0.17, C: C * 0.2, h }),
    subtle: rgba(solid, 0.10),
    border: rgba(solid, 0.22),
  };
}

/** The lightness at which this hue's text hits an APCA floor on a surface. */
function textLForApca(hue: number, floor: number, bg: string, boost = 1, explicitC?: number, explicitH?: number): number {
  const { C, h } = explicitC !== undefined
    ? { C: explicitC, h: explicitH ?? hue }
    : chromaOf(spOf(hue).hex);
  // `apcaContrast` is SIGNED — negative for light-on-dark. Comparing it to a
  // positive floor always says "not enough", so the search walks straight to
  // white. The magnitude is the thing being floored.
  let lo = 0.4, hi = 0.98;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (apcaMagnitude(oklchToHex({ L: mid, C: C * boost, h }), bg) < floor) lo = mid; else hi = mid;
  }
  return hi;
}

/**
 * The most chromatic this hue can be at this lightness before sRGB clips.
 *
 * A fill wants saturation, but "as saturated as looks good" is a hand-picked
 * number. The gamut edge is not: it is a property of the colour space.
 */
function maxChroma(L: number, h: number): number {
  let lo = 0, hi = 0.4;
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2;
    const hex = oklchToHex({ L, C: mid, h });
    const back = chromaOf(hex);
    // if the round-trip moved the lightness, the colour was clipped
    if (Math.abs(back.L - L) > 0.002 || Math.abs(back.C - mid) > 0.002) hi = mid; else lo = mid;
  }
  return lo;
}

/** The role's ACTUAL OKLCH hue — the declared `hue` field does not match it. */
const trueHue = (k: string) => chromaOf(SEM[k].solid.replace(/var\([^,]+, /, '').replace(/\)$/, '')).h;

const current = (k: string): Facets => ({
  text: SEM[k].text,
  solid: SEM[k].solid.replace(/var\([^,]+, /, '').replace(/\)$/, ''),
  onSolid: SEM[k].onSolid,
  subtle: SEM[k].subtle,
  border: SEM[k].border,
});

const CANDIDATES = [
  {
    id: 'A', name: 'امروز — دست‌چین',
    why: 'وضعیت فعلی. L بین ۰.۶۳۷ تا ۰.۸۰۰ می‌چرخد و هیو دو نقش روی طیف نیست.',
    rule: 'هیچ. هر مقدار جداگانه انتخاب شده.',
    facets: (k: string) => current(k),
  },
  {
    id: 'B', name: 'روی طیف — L ثابت',
    why: 'هیو به نزدیک‌ترین پله‌ی طیف می‌چسبد. همه‌ی نقش‌ها یک L مشترک می‌گیرند.',
    rule: 'text L=0.80 · solid L=0.70 · chroma از طیف',
    facets: (k: string) => derive(SNAP[k], 0.80, 0.70, 1.0),
  },
  {
    id: 'C', name: 'روی طیف — solid پررنگ‌تر',
    why: 'همان B، ولی solid کرومای بیشتری می‌گیرد تا به‌عنوان دکمه پررنگ بماند.',
    rule: 'text L=0.80 · solid L=0.70 · chroma × 1.3',
    facets: (k: string) => derive(SNAP[k], 0.80, 0.70, 1.3),
  },
  {
    id: 'D', name: 'روی طیف — L از کنتراست',
    why: 'روشِ خودِ سیستم: L متن از کف کنتراست مشتق می‌شود، نه از یک عدد ثابت.',
    rule: `text L از APCA Lc 75 روی سطح کار (chroma از طیف) · solid L=0.70 · chroma × 1.3`,
    facets: (k: string) => derive(SNAP[k], textLForApca(SNAP[k], 75, work, 1.0), 0.70, 1.3),
  },
  {
    id: 'E', name: 'هیو داده‌شده — بقیه مشتق',
    why: 'طیف منبع درستی برای هیو نیست: snapping، DANGER را صورتی می‌کند. «سرخ = خطر» یک قرارداد است، نه چیزی که مشتق شود. ولی روشنایی و کرومای هر وجه می‌توانند مشتق شوند.',
    rule: 'hue = قرارداد (OKLCH واقعی) · text L از Lc 75 · solid L=0.70 · chroma = لبه‌ی گاموت × 0.88 · onSolid L=0.17',
    facets: (k: string) => {
      const h = trueHue(k);
      const solidC = maxChroma(0.70, h) * 0.88;
      const textC = maxChroma(0.80, h) * 0.80;
      const solid = oklchToHex({ L: 0.70, C: solidC, h });
      return {
        text: oklchToHex({ L: textLForApca(h, 75, work, 1.0, textC), C: textC, h }),
        solid,
        onSolid: oklchToHex({ L: 0.17, C: solidC * 0.2, h }),
        subtle: rgba(solid, 0.10),
        border: rgba(solid, 0.22),
      };
    },
  },
  {
    id: 'F', name: 'هیو داده‌شده — کرومای ثابت',
    why: 'E کرومای هر نقش را تا لبه‌ی گاموت می‌برد، پس سرخ بلندتر از آبی حرف می‌زند. لیمینال آرام است: هر چهار نقش باید هم‌بلندی داشته باشند.',
    rule: 'hue = قرارداد · text L از Lc 75 · solid L=0.70 · chroma = ثابت 0.15 (کلمپ‌شده به گاموت) · onSolid L=0.17',
    facets: (k: string) => {
      const h = trueHue(k);
      const solidC = Math.min(0.15, maxChroma(0.70, h));
      const textC = Math.min(0.15, maxChroma(0.80, h));
      const solid = oklchToHex({ L: 0.70, C: solidC, h });
      return {
        text: oklchToHex({ L: textLForApca(h, 75, work, 1.0, textC), C: textC, h }),
        solid,
        onSolid: oklchToHex({ L: 0.17, C: solidC * 0.2, h }),
        subtle: rgba(solid, 0.10),
        border: rgba(solid, 0.22),
      };
    },
  },
];

const chip = (f: Facets, k: string) => `
  <span class="badge" style="background:${getLadderColor(3)};border:1px solid ${getLadderColor(3.5)};color:${getTextStyle('primary', 3).color}">
    <b aria-hidden="true" style="color:${f.text}">${GLYPH[k]}</b>${FA[k]}
  </span>`;

const swatches = (f: Facets, k: string) => `
  <div class="sw">
    <span class="lab">متن</span>
    <span class="txt" style="color:${f.text}">${FA[k]} ${GLYPH[k]}</span>
  </div>
  <div class="sw">
    <span class="lab">solid</span>
    <span class="fill" style="background:${f.solid};color:${f.onSolid}">${FA[k]}</span>
  </div>
  <div class="sw">
    <span class="lab">chip</span>
    ${chip(f, k)}
  </div>`;

const row = (c: typeof CANDIDATES[number]) => `
  <section class="cand">
    <header><span class="cid">${c.id}</span><div><h3>${c.name}</h3><p class="why">${c.why}</p></div></header>
    <p class="rule">${c.rule}</p>
    ${KEYS.map((k) => `<div class="role"><span class="rname">${k}</span><div class="sws">${swatches(c.facets(k), k)}</div></div>`).join('')}
  </section>`;

const html = `<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>LIMINAL — تست چشمی رنگ‌های معنایی</title>
<style>
  :root { color-scheme: dark; }
  * { box-sizing: border-box; }
  body { margin:0; background:${canvas}; color:${TEXT};
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif; font-size:14px; line-height:1.75; }
  .wrap { max-width:1080px; margin:0 auto; padding:40px 24px 96px; }
  h1 { font-size:25px; margin:0 0 6px; font-weight:700; letter-spacing:-0.02em; }
  h2 { font-size:16px; margin:32px 0 10px; font-weight:600; }
  h3 { font-size:15px; margin:0 0 3px; font-weight:600; }
  .eyebrow { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; letter-spacing:.08em; text-transform:uppercase; }
  .sub { color:${DIM}; margin:0 0 8px; }
  .diag { border:1px solid ${LINE}; border-radius:14px; padding:18px; margin:0 0 26px; background:rgba(233,236,242,0.012); }
  table { width:100%; border-collapse:collapse; font-family:ui-monospace,monospace; font-size:12px; }
  th, td { text-align:right; padding:6px 9px; border-bottom:1px solid ${LINE}; }
  th { color:${FAINT}; font-weight:400; }
  .bad { color:#ffb4b4; } .good { color:#9ee6b4; }
  .cand { border:1px solid ${LINE}; border-radius:14px; padding:18px; margin:0 0 18px; background:rgba(233,236,242,0.012); }
  .cand header { display:flex; gap:12px; align-items:flex-start; margin-bottom:8px; }
  .cid { font-family:ui-monospace,monospace; font-size:13px; font-weight:700; border:1px solid ${LINE}; border-radius:8px; padding:3px 10px; flex-shrink:0; }
  .why { margin:0; color:${DIM}; font-size:13px; }
  .rule { font-family:ui-monospace,monospace; font-size:11.5px; color:${FAINT}; margin:0 0 14px; direction:ltr; text-align:left; }
  .role { display:flex; gap:14px; align-items:center; padding:9px 0; border-top:1px solid ${LINE}; }
  .rname { font-family:ui-monospace,monospace; font-size:11px; color:${FAINT}; width:74px; flex-shrink:0; }
  .sws { display:flex; gap:22px; align-items:center; flex-wrap:wrap; }
  .sw { display:flex; gap:8px; align-items:center; }
  .lab { font-family:ui-monospace,monospace; font-size:10px; color:${FAINT}; }
  .txt { font-size:13px; font-weight:600; }
  .fill { padding:4px 12px; border-radius:8px; font-size:12px; font-weight:600; }
  .badge { display:inline-flex; align-items:center; gap:4px; border-radius:9999px; padding:4px 12px;
    font-size:11px; font-weight:500; letter-spacing:.04em; }
  .badge b { font-family:ui-monospace,monospace; font-size:.92em; line-height:1; font-weight:700; min-width:.62em; text-align:center; }
  footer { color:${FAINT}; font-size:12px; margin-top:32px; }
  code { font-family:ui-monospace,monospace; }
</style>
</head>
<body>
<div class="wrap">
  <p class="eyebrow">LIMINAL · تست چشمی · رنگ معنایی</p>
  <h1>چهار نقش معنایی: هیو از کجا، روشنایی از کجا؟</h1>
  <p class="sub">دو پالت موازی وجود دارد — طیف ۱۲ هیویی، و این چهار. کاندیدها آن‌ها را یکی می‌کنند.</p>

  <div class="diag">
    <h2 style="margin-top:0">تشخیص — اندازه‌گیری‌شده</h2>
    <table>
      <thead><tr><th>نقش</th><th>هیو اعلام‌شده</th><th>هیوی واقعی OKLCH</th><th>روی طیف؟</th><th>L solid</th><th>L text</th></tr></thead>
      <tbody>
        ${KEYS.map((k) => {
          const s = SEM[k];
          const solid = s.solid.replace(/var\([^,]+, /, '').replace(/\)$/, '');
          const on = spOf(s.hue);
          const actual = chromaOf(solid);
          return `<tr><td>${k}</td><td>${s.hue}</td>
            <td class="${Math.abs(actual.h - s.hue) > 12 ? 'bad' : ''}">${actual.h.toFixed(1)}</td>
            <td class="${on ? 'good' : 'bad'}">${on ? 'بله · ' + on.label : 'خیر'}</td>
            <td class="bad">${chromaOf(solid).L.toFixed(3)}</td>
            <td class="bad">${chromaOf(s.text).L.toFixed(3)}</td></tr>`;
        }).join('')}
      </tbody>
    </table>
    <p class="sub" style="margin:12px 0 0">
      L از ۰.۶۳۷ تا ۰.۸۰۰ می‌چرخد. هیوی اعلام‌شده با هیوی واقعی نمی‌خواند (INFO: ۲۳۰ در برابر ۲۵۷.۵).
      یعنی هیچ فرمولی پشت این چهار نقش نیست.
    </p>
  </div>

  ${CANDIDATES.map(row).join('')}

  <footer>
    تولید‌شده توسط <code>scripts/gen-semantic-test.ts</code> · بدون شبکه ·
    طیف و معنایی‌ها از <code>LiminalColorEngine</code> · L از کنتراست با <code>apcaContrast</code>
  </footer>
</div>
</body>
</html>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, (html.length / 1024).toFixed(1) + 'KB');
