/**
 * Live check — the border decision (2026-10-22), on real React elements.
 *
 * Every surface, border and interaction value comes from the engine. Each role is shown
 * twice: «قبل» = the full edge (the old default), «بعد» = the role's default kind
 * (`borderKindFor`). For floating roles the two are the same by design.
 *
 * Note: `src/components/_template` does not apply its border yet (its cssVars are still
 * commented out), so the live check reads the engine directly rather than the template.
 */
import React from 'react';
import {
  resolveSurface,
  resolveBorder,
  resolveInteractionVars,
  borderKindFor,
  FLOATING_ROLES,
} from '../engine/liminal-surface';
import type { SurfaceRole } from '../engine/liminal-surface';

const ROLES: SurfaceRole[] = ['work', 'panel', 'menu', 'popover', 'modal', 'toast'];

const page: React.CSSProperties = {
  minHeight: '100vh',
  background: resolveSurface({ role: 'canvas' }).background,
  color: '#e9ecf2',
  fontFamily: 'Vazirmatn, system-ui, sans-serif',
  direction: 'rtl',
  padding: 32,
  boxSizing: 'border-box',
};

function Card({ role, mode }: { role: SurfaceRole; mode: 'before' | 'after' }) {
  const kind = mode === 'before' ? 'edge' : borderKindFor(role);
  const surface = resolveSurface({ role }).background;
  const border = resolveBorder({ role, kind });
  return (
    <div
      style={{
        background: surface,
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: 20,
        minHeight: 96,
        display: 'grid',
        gap: 6,
        boxSizing: 'border-box',
      }}
    >
      <strong style={{ fontSize: 15 }}>{role}</strong>
      <span style={{ fontSize: 12, opacity: 0.6 }}>
        {mode === 'before' ? 'مرز (قبل)' : `${kind === 'edge' ? 'مرز' : 'جداکننده'} (بعد)`}
      </span>
    </div>
  );
}

function Control({ mode }: { mode: 'before' | 'after' }) {
  // The control on a work surface. Its idle border is the interaction variable, which
  // now follows the role default; «قبل» forces the edge the way the old default did.
  const v = resolveInteractionVars({ role: 'control', on: 'work' });
  const border = mode === 'before' ? resolveBorder({ role: 'control', kind: 'edge', on: 'work' }) : v['--liminal-border-idle'];
  return (
    <button
      style={{
        background: v['--liminal-surface-idle'],
        border: `1px solid ${border}`,
        color: '#e9ecf2',
        borderRadius: 10,
        padding: '12px 22px',
        fontSize: 15,
        fontFamily: 'inherit',
        cursor: 'pointer',
      }}
    >
      دکمه · {mode === 'before' ? 'قبل' : 'بعد'}
    </button>
  );
}

export function Live() {
  return (
    <div style={page}>
      <h1 style={{ fontSize: 20, margin: '0 0 6px' }}>مرز یا جداکننده — روی کامپوننت‌های واقعی موتور</h1>
      <p style={{ fontSize: 14, opacity: 0.6, maxWidth: '70ch', lineHeight: 1.8, margin: '0 0 28px' }}>
        ردیف بالا «قبل» (مرز یک‌پله‌ای برای همه) و ردیف پایین «بعد» (پیش‌فرض نقش) است.
        سطوح شناور (منو، پاپ‌اور، مودال، اعلان) در هر دو ردیف یکسان‌اند.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))', gap: 20 }}>
        {ROLES.map((role) => (
          <Card key={`before-${role}`} role={role} mode="before" />
        ))}
        <Control mode="before" />
        <div />
        <div />
        {ROLES.map((role) => (
          <Card key={`after-${role}`} role={role} mode="after" />
        ))}
        <Control mode="after" />
        <div />
        <div />
      </div>
      <p style={{ fontSize: 12, opacity: 0.5, marginTop: 28 }}>
        شناور: {FLOATING_ROLES.join('، ')} — بقیه: جداکننده.
      </p>
    </div>
  );
}

