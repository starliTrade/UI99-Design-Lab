/**
 * LIMINAL · DOCS — TOKENS
 *
 * The engine's outputs, with the arithmetic that produced them. A token page
 * that only lists names teaches nothing; this one shows the step between each
 * surface, the alpha each text role derives to, and the floor that bound it.
 */
import React from 'react';
import { LADDER, getTextStyle } from '../../engine/spec-engine';
import { WELLS } from '../../engine/liminal-ladder';
import { PERCEPTUAL_QUANTUM, FOCUS_RING_COLOR } from '../../engine/liminal-ladder';
import { oklchLightness, contrastRatioHex } from '../../engine/liminal-color-math';
import { deriveTextToken, TEXT_ROLE_SPEC, type TextRole } from '../../engine/liminal-contrast';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { Section, Prose, Value, Stat, MONO, S, R } from '../ui';
import { useTheme } from '../theme';

const ROLES: TextRole[] = ['primary', 'secondary', 'tertiary', 'quaternary'];

export function TokensPage() {
  const { theme } = useTheme();
  const steps = theme.ladder.map((hex, i) =>
    i === 0 ? null : (oklchLightness(hex) - oklchLightness(theme.ladder[i - 1])) / PERCEPTUAL_QUANTUM,
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <Section title="نردبان" note={`${theme.ladder.length} پله · کوانتوم ${PERCEPTUAL_QUANTUM}`} role="work">
        <Prose>
          هر پله یک <b>کوانتوم ادراکی</b> از پلهٔ قبلی فاصله دارد — نه یک درصدِ دلبخواه. عددِ سبز یعنی
          گام در باند است؛ سرخ یعنی این هیو نمی‌تواند نگهش دارد.
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          {theme.ladder.map((hex, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: `${S[3]}px` }}>
              <code style={{ fontFamily: MONO, fontSize: 11, width: 24 }}>S{i}</code>
              <span
                style={{ width: 84, height: 20, background: hex, borderRadius: `${R.chip}px`, border: '1px solid rgba(255,255,255,0.08)' }}
              />
              <code style={{ fontFamily: MONO, fontSize: 11 }}>{hex}</code>
              <code style={{ fontFamily: MONO, fontSize: 11, opacity: 0.7 }}>
                L {oklchLightness(hex).toFixed(4)}
              </code>
              {steps[i] !== null && (
                <code
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    color: (steps[i] as number) < 1 ? 'var(--liminal-danger, #ba4646)' : undefined,
                    opacity: (steps[i] as number) < 1 ? 1 : 0.7,
                  }}
                >
                  +{(steps[i] as number).toFixed(2)}q
                </code>
              )}
            </div>
          ))}
        </div>
        {theme.warnings.length > 0 && (
          <Prose>
            <b style={{ color: 'var(--liminal-danger, #ba4646)' }}>{theme.warnings.length} هشدار:</b>{' '}
            {theme.warnings.map((w) => `S${w.level} (${w.q.toFixed(2)}q)`).join(' · ')}
          </Prose>
        )}
      </Section>

      <Section title="متن" note="آلفا مشتق می‌شود، نه انتخاب">
        <Prose>
          کفِ هر نقش از <b>کاربردِ اعلام‌شدهٔ</b> آن می‌آید: primary برای سرفصل، secondary و tertiary
          برای هر متنی که باید خوانده شود، quaternary فقط برای نشانه‌های غیرمتنی. هر دو عدسی حساب
          می‌شوند و <b>سخت‌گیرتر برنده است</b>.
        </Prose>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ opacity: 0.65 }}>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>نقش</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>کاربرد</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>کف WCAG</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>کف APCA</th>
                <th style={{ textAlign: 'start', padding: `${S[1]}px ${S[2]}px` }}>نمونه روی S3</th>
              </tr>
            </thead>
            <tbody>
              {ROLES.map((role) => {
                const spec = TEXT_ROLE_SPEC[role];
                const t = deriveTextToken(role, theme.ladder[3]);
                return (
                  <tr key={role} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: `${S[1]}px ${S[2]}px` }}>
                      <code style={{ fontFamily: MONO }}>{role}</code>
                    </td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, opacity: 0.75 }}>{spec.use}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{spec.wcag}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px`, fontFamily: MONO }}>{spec.apca}</td>
                    <td style={{ padding: `${S[1]}px ${S[2]}px` }}>
                      <span style={{ color: t.value, fontSize: 13 }}>نمونهٔ متنِ فارسی</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: `${S[3]}px` }}>
          {ROLES.map((role) => {
            const t = deriveTextToken(role, theme.ladder[3]);
            return (
              <Value
                key={role}
                label={`${role} روی S3`}
                value={`α ${t.alpha.toFixed(3)} · ${t.boundBy}`}
              />
            );
          })}
        </div>
      </Section>

      <Section title="چاه‌ها" note="زیرِ بوم — عمق، نه رنگ">
        <Prose>
          چاه جایی است که چیزی <b>فرورفته</b>: حالت خالی، بلوک کد، کنترلِ فشرده. یک‌ونیم پله زیر
          بوم می‌نشیند — بین بوم و chrome، نه یک مقدارِ اختراعی.
        </Prose>
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          {Object.entries(WELLS).map(([name, hex]) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
              <span style={{ width: 96, height: 28, background: hex, borderRadius: `${R.chip}px`, border: '1px solid rgba(255,255,255,0.08)' }} />
              <code style={{ fontFamily: MONO, fontSize: 11 }}>
                {name} {hex}
              </code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="معنایی و گسترده" note="فقط هیو قرارداد است، نه رنگ">
        <div style={{ display: 'flex', gap: `${S[3]}px`, flexWrap: 'wrap' }}>
          {(Object.keys(LiminalColorEngine.SEMANTICS) as (keyof typeof LiminalColorEngine.SEMANTICS)[]).map((k) => (
            <div key={String(k)} style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
              <span
                style={{
                  width: 64,
                  height: 26,
                  background: LiminalColorEngine.SEMANTICS[k].solid,
                  borderRadius: `${R.chip}px`,
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              />
              <code style={{ fontFamily: MONO, fontSize: 10 }}>{String(k)}</code>
            </div>
          ))}
        </div>
        <Prose>
          {LiminalColorEngine.EXTENDED_SPECTRUM.length} هیوی گسترده هم هست — برای نمودار و برچسب،
          نه برای سطح. سطح همیشه از نردبان می‌آید.
        </Prose>
      </Section>

      <Section title="حلقهٔ فوکوس" note="یک رنگ، یک قاعده">
        <div style={{ display: 'flex', alignItems: 'center', gap: `${S[4]}px`, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: `${S[2]}px ${S[4]}px`,
              borderRadius: `${R.control}px`,
              outline: `2px solid ${FOCUS_RING_COLOR}`,
              outlineOffset: 2,
              fontSize: 12,
            }}
          >
            فوکوسِ کیبورد
          </span>
          <Value label="رنگ" value={FOCUS_RING_COLOR} />
          <Value
            label="کنتراست روی S0"
            value={`${contrastRatioHex(FOCUS_RING_COLOR, LADDER[0]).toFixed(2)}:1`}
          />
        </div>
      </Section>
    </div>
  );
}
