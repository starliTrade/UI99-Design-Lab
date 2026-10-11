import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { getLadderColor } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { useReducedMotion } from '../../../engine/liminal-hooks';
import { resolveBorder, resolveSurface } from '../../../engine/liminal-surface';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  hue?: number;
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
  style?: CSSProperties;
}

// Convert 6-digit hex color to rgba string
function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) return `rgba(233, 236, 242, ${alpha})`;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Extract max 2 initials from name
function getInitials(name?: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function Avatar({
  src,
  name,
  size = 'md',
  hue,
  status,
  className = '',
  style: customStyle = {},
}: AvatarProps) {
  const [imageError, setImageError] = useState<boolean>(false);
  const reducedMotion = useReducedMotion();

  const sizes: Record<'sm' | 'md' | 'lg', { px: number; fs: number; dotPx: number }> = {
    sm: { px: 24, fs: 10, dotPx: 7 },
    md: { px: 32, fs: 12, dotPx: 9 },
    lg: { px: 44, fs: 15, dotPx: 12 },
  };

  const { px, fs, dotPx } = sizes[size];
  const rimSideColor = resolveBorder({ role: 'control', kind: 'hairline' });
  const canvasBorderColor = resolveSurface({ role: 'canvas' }).background;

  // Pick color from EXTENDED_SPECTRUM
  const spectrum = LiminalColorEngine.EXTENDED_SPECTRUM;
  let spectrumItem = spectrum[7]; // default Sapphire 230

  if (hue !== undefined) {
    const found = spectrum.find((s) => s.hue === hue);
    if (found) spectrumItem = found;
  } else if (name) {
    // Deterministic hash from name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = (hash << 5) - hash + name.charCodeAt(i);
      hash |= 0;
    }
    const index = Math.abs(hash) % spectrum.length;
    spectrumItem = spectrum[index];
  }

  const avatarStyle: CSSProperties = {
    width: `${px}px`,
    height: `${px}px`,
    borderRadius: '50%',
    border: `1px solid ${rimSideColor}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${fs}px`,
    fontWeight: 600,
    fontFamily: 'inherit',
    flexShrink: 0,
    overflow: 'hidden',
    userSelect: 'none',
    boxSizing: 'border-box',
    background: hexToRgba(spectrumItem.hex, 0.15),
    color: spectrumItem.hex,
    position: 'relative',
    ...customStyle,
  };

  const showImage = Boolean(src && !imageError);

  // Status color mapping
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  const statusColors = {
    online: SEMANTICS.SUCCESS.solid,
    offline: resolveSurface({ role: 'control' }).background,
    away: SEMANTICS.WARNING.solid,
    busy: SEMANTICS.DANGER.solid,
  };

  const dotColor = status ? statusColors[status] : undefined;

  return (
    <span className={className} style={avatarStyle} title={name}>
      {showImage ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
            display: 'block',
          }}
        />
      ) : (
        getInitials(name)
      )}

      {status && dotColor && (
        <>
          {!reducedMotion && status === 'online' && (
            <style>
              {`
                @keyframes avatar-pulse {
                  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 192, 139, 0.7); }
                  70% { transform: scale(1); box-shadow: 0 0 0 4px rgba(52, 192, 139, 0); }
                  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 192, 139, 0); }
                }
              `}
            </style>
          )}
          <span
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: `${dotPx}px`,
              height: `${dotPx}px`,
              borderRadius: '50%',
              backgroundColor: dotColor,
              border: `2px solid ${canvasBorderColor}`,
              boxSizing: 'content-box',
              animation: !reducedMotion && status === 'online' ? 'avatar-pulse 2s infinite ease-in-out' : 'none',
            }}
          />
        </>
      )}
    </span>
  );
}

export default Avatar;

