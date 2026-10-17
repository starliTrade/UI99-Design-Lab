import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { resolveSurface, resolveBorder } from '../../../engine/liminal-surface';
import type { SurfaceRole } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

export interface TagProps {
  /**
   * A spectrum hue. Tag is Badge's sibling but not its twin: Badge carries a
   * STATUS and needs a glyph that survives colour blindness, because colour
   * alone collapses under every form of it. Tag carries a CATEGORY, and the
   * label itself says which one — so the hue is decoration, not information,
   * and no glyph is needed.
   */
  hue?: number;
  /** Override the host surface. By default it is read from context. */
  host?: SurfaceRole;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * LIMINAL · TAG
 *
 * A tag used to sit on `SURFACE_TINT.subtle` — a white overlay at 0.03 — with a
 * border of `rgba(255,255,255,0.06)`. Three problems, and the third is the one
 * that decided it:
 *
 *  1. The overlay is a magic alpha. Nothing in the system can say why 0.03.
 *  2. The border is a raw literal, and the lint rule's `/^rgba?\(/` anchor
 *     misses it because the string starts with "1px".
 *  3. An overlay at a fixed alpha keeps climbing. Measured, the tag's surface
 *     reached L 0.1809 on the work surface — above LADDER[5] — and L 0.2342 on
 *     the toast level, which is ABOVE THE LADDER'S CEILING (L(8) = 0.2038). A
 *     white overlay does not respect the ladder; it just keeps going up.
 *
 * So the tag takes the treatment the badge already has: a surface one ladder
 * step above its host, and a hairline half a step above that. Both derived,
 * both bounded by the ladder, and both with a defined behaviour at the ceiling.
 *
 * The shape stays a chip (RADIUS.chip) where the badge is a pill — the two are
 * distinguished by meaning, not only by colour.
 */
export function Tag({
  hue = 230,
  host,
  children,
  className = '',
  style: customStyle = {},
}: TagProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  const contextHost = useHostSurface();
  const hostRole: SurfaceRole = host ?? contextHost;

  const spectrum =
    LiminalColorEngine.EXTENDED_SPECTRUM.find((item) => item.hue === hue) ??
    LiminalColorEngine.EXTENDED_SPECTRUM[7];

  const background = resolveSurface({ role: 'control', on: hostRole }).background;
  const rim = resolveBorder({ role: 'control', kind: 'separator', on: hostRole });

  const tagStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${SPACING[1]}px`, // 4px
    background,
    border: `1px solid ${rim}`,
    color: spectrum.hex,
    borderRadius: `${LiminalLayoutEngine.RADIUS.chip}px`, // 6px — a chip, not a pill
    // Fluid, like every other piece of type in the system. A static px here
    // ignored the reader's font-size setting.
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
    <span className={className} style={tagStyle}>
      {children}
    </span>
  );
}

export default Tag;
