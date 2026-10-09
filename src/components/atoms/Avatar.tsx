import React from 'react';
import { getDirectionalRim } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  initials?: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
  hue?: number;
  className?: string;
}

const AVATAR_SIZES: Record<AvatarSize, { dimension: number; fontSize: number }> = {
  sm: { dimension: 28, fontSize: 11 },
  md: { dimension: 36, fontSize: 13 },
  lg: { dimension: 44, fontSize: 16 },
};

export function Avatar({
  initials,
  src,
  alt = 'Avatar',
  size = 'md',
  hue = 230,
  className = '',
}: AvatarProps) {
  const { dimension, fontSize } = AVATAR_SIZES[size];
  const ext = LiminalColorEngine.EXTENDED_SPECTRUM.find((x) => x.hue === hue);
  const textColor = ext?.hex ?? '#8CC3F2';
  const rim = getDirectionalRim(2, 1);

  return (
    <div
      className={`inline-flex items-center justify-center font-mono font-medium overflow-hidden select-none ${className}`}
      style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        borderRadius: `${LiminalLayoutEngine.RADIUS.card}px`,
        background: rim ? rim.cssBackground : '#0A0B0F',
        border: '1px solid transparent',
        color: textColor,
        fontSize: `${fontSize}px`,
      }}
      title={alt}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <span>{initials || 'LM'}</span>
      )}
    </div>
  );
}
