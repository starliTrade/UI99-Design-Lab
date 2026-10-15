import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { resolveSurface, resolveBorder, ROLE_LEVEL } from '../../../engine/liminal-surface';
import type { SurfaceRole } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';
import { getTextStyle } from '../../../engine/spec-engine';

export type BadgeSemantic = 'success' | 'warning' | 'danger' | 'info';

export interface BadgeProps {
  semantic?: BadgeSemantic;
  /** Alias of `semantic`, kept for the call sites that already use it. */
  variant?: BadgeSemantic;
  /**
   * A spectrum hue instead of a semantic role. There is no glyph for a hue —
   * a hue is not a meaning — so this path shows the label alone.
   */
  hue?: number;
  /** Override the host surface. By default it is read from context. */
  host?: SurfaceRole;
  role?: string;
  'aria-selected'?: boolean | 'true' | 'false';
  'aria-label'?: string;
  id?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * LIMINAL · BADGE
 *
 * «معنا از شکل می‌آید، رنگ فقط تأکیدش می‌کند.»
 *
 * The surface is one ladder step above whatever hosts the badge, and the rim is
 * a hairline half a step above that — both derived, neither written down. The
 * badge used to sit on `SURFACE_TINT.medium`, a white overlay that is on no
 * scale at all, which is why a "blue" badge read as a grey pill with blue
 * letters: the colour never reached the surface.
 *
 * The meaning is carried by the GLYPH, not by the colour, because colour alone
 * collapses under every form of colour blindness (WCAG 2.2 · 1.4.1). The glyph
 * is coloured too, so full-colour vision gets shape and colour together.
 *
 * The geometry is on the spacing scale. It used to be `3px 10px` with a `6px`
 * gap — three numbers that belong to no scale in this system.
 */
export function Badge({
  semantic = 'info',
  variant,
  hue,
  host,
  role,
  'aria-selected': ariaSelected,
  'aria-label': ariaLabel,
  id,
  children,
  className = '',
  style: customStyle = {},
}: BadgeProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  // Hooks are called unconditionally; the prop only overrides the result.
  const contextHost = useHostSurface();
  const hostRole: SurfaceRole = host ?? contextHost;

  const effectiveSemantic = variant ?? semantic;
  const key = effectiveSemantic.toUpperCase() as 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
  const spec = LiminalColorEngine.SEMANTICS[key] ?? LiminalColorEngine.SEMANTICS.INFO;

  // A badge is a relative surface: it sits one step above its host, at any depth.
  const background = resolveSurface({ role: 'control', on: hostRole }).background;
  const rim = resolveBorder({ role: 'control', kind: 'separator', on: hostRole });
  // The label is primary text ON THE BADGE'S OWN SURFACE, so it takes that
  // surface's alpha — the same derivation every other piece of text uses.
  const labelColor = getTextStyle('primary', ROLE_LEVEL[hostRole] + 1).color;

  const accent = hue !== undefined
    ? LiminalColorEngine.EXTENDED_SPECTRUM.find((x) => x.hue === hue)?.hex ?? spec.text
    : spec.text;

  const glyph = hue !== undefined ? null : spec.glyph;

  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${SPACING[1]}px`, // 4px
    background,
    border: `1px solid ${rim}`,
    color: labelColor, // neutral: the glyph carries the meaning
    borderRadius: `${LiminalLayoutEngine.RADIUS.full}px`, // the one place "loud" is allowed
    fontSize: LiminalLayoutEngine.getTypeSizeCss(1),
    letterSpacing: TYPOGRAPHY[1].ls,
    fontWeight: TYPOGRAPHY[2].weight,
    padding: `${SPACING[1]}px ${SPACING[3]}px`, // 4px 12px
    lineHeight: 1.45,
    userSelect: 'none',
    boxSizing: 'border-box',
    ...customStyle,
  };

  return (
    <span
      id={id}
      role={role}
      aria-selected={ariaSelected}
      aria-label={ariaLabel}
      className={className}
      style={badgeStyle}
    >
      {glyph && (
        // Decorative: the label already carries the meaning for assistive tech.
        <b
          aria-hidden="true"
          style={{
            color: accent,
            fontFamily: 'ui-monospace, monospace',
            fontSize: '0.92em',
            lineHeight: 1,
            fontWeight: 700,
            display: 'inline-block',
            minWidth: '0.62em',
            textAlign: 'center',
          }}
        >
          {glyph}
        </b>
      )}
      {children}
    </span>
  );
}

export default Badge;
