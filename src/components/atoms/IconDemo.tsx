import React, { useState } from 'react';
import {
  House,
  MagnifyingGlass,
  Gear,
  User,
  Plus,
  Check,
  X,
  ArrowRight,
  Shield,
  Bell,
  Cpu,
  WifiHigh,
  Sparkle,
} from '@phosphor-icons/react';
import {
  LiminalIcon,
  type IconSize,
  type IconWeight,
  ICON_SIZES,
} from '../../engine/liminal-icon-engine';
import { SpecEngine } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';

export function IconDemo() {
  const [selectedWeight, setSelectedWeight] = useState<IconWeight>('light');
  const [selectedSize, setSelectedSize] = useState<IconSize>('md');

  const sampleIcons = [
    { icon: House, name: 'House' },
    { icon: MagnifyingGlass, name: 'MagnifyingGlass' },
    { icon: Gear, name: 'Gear' },
    { icon: User, name: 'User' },
    { icon: Plus, name: 'Plus' },
    { icon: Check, name: 'Check' },
    { icon: X, name: 'X' },
    { icon: ArrowRight, name: 'ArrowRight' },
    { icon: Shield, name: 'Shield' },
    { icon: Bell, name: 'Bell' },
    { icon: Cpu, name: 'Cpu' },
    { icon: WifiHigh, name: 'WifiHigh' },
  ];

  const sizes: IconSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
  const weights: IconWeight[] = ['thin', 'light', 'regular', 'bold', 'fill', 'duotone'];

  const containerStyle = SpecEngine.style({ surfaceLevel: 1, isContainer: true }).style;
  const panelStyle = SpecEngine.style({ surfaceLevel: 2, isContainer: true }).style;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header banner */}
      <div
        className="p-5 sm:p-6 space-y-3"
        style={{
          ...containerStyle,
          borderRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                ...panelStyle,
                borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
              }}
            >
              <LiminalIcon icon={Sparkle} size="md" weight="light" color="#8B9CF0" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="font-bold text-sm sm:text-base tracking-tight"
                  style={{ color: SpecEngine.getTextStyle('primary', 1).color }}
                >
                  LIMINAL ICON SYSTEM
                </h2>
                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                  @phosphor-icons/react
                </span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: SpecEngine.getTextStyle('tertiary', 1).color }}>
                Canonical weight: light (1.5px stroke) · Tokens: xs (12px), sm (16px), md (20px), lg (24px), xl (32px)
              </p>
            </div>
          </div>
        </div>

        {/* Live Controls */}
        <div className="flex flex-wrap items-center gap-4 pt-1">
          <div className="flex items-center gap-2">
            <span style={{ color: SpecEngine.getTextStyle('secondary', 1).color }}>Weight Filter:</span>
            <div className="flex items-center gap-1">
              {weights.map((w) => (
                <button
                  key={w}
                  onClick={() => setSelectedWeight(w)}
                  className="px-2.5 py-1 text-[11px] rounded transition-all cursor-pointer uppercase"
                  style={{
                    backgroundColor: selectedWeight === w ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedWeight === w ? '#FFF' : 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span style={{ color: SpecEngine.getTextStyle('secondary', 1).color }}>Size Filter:</span>
            <div className="flex items-center gap-1">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className="px-2 py-1 text-[11px] rounded transition-all cursor-pointer uppercase font-mono"
                  style={{
                    backgroundColor: selectedSize === s ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    color: selectedSize === s ? '#FFF' : 'rgba(255, 255, 255, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {s} ({ICON_SIZES[s]}px)
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 1: SIZE × WEIGHT MATRIX ─── */}
      <div
        className="p-5 space-y-4"
        style={{
          ...containerStyle,
          borderRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="font-bold" style={{ color: SpecEngine.getTextStyle('primary', 1).color }}>
            1. SIZE TOKENS MATRIX ({selectedWeight.toUpperCase()} WEIGHT)
          </div>
          <span style={{ color: SpecEngine.getTextStyle('tertiary', 1).color }}>
            xs: 12px · sm: 16px · md: 20px · lg: 24px · xl: 32px
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {sizes.map((size) => (
            <div
              key={size}
              className="p-3 rounded-xl space-y-3 flex flex-col items-center justify-between"
              style={{ ...panelStyle, borderRadius: `${LiminalLayoutEngine.RADIUS.card}px` }}
            >
              <div className="text-[11px] text-center">
                <span className="font-bold text-white uppercase">{size}</span>
                <span className="text-white/40 block text-[10px]">{ICON_SIZES[size]}px</span>
              </div>

              <div className="grid grid-cols-3 gap-2 p-2 items-center justify-items-center">
                {sampleIcons.slice(0, 6).map((item, idx) => (
                  <LiminalIcon
                    key={idx}
                    icon={item.icon}
                    size={size}
                    weight={selectedWeight}
                    className="text-white/80 hover:text-white transition-colors"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 2: ALL WEIGHT COMBINATIONS ─── */}
      <div
        className="p-5 space-y-4"
        style={{
          ...containerStyle,
          borderRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="font-bold" style={{ color: SpecEngine.getTextStyle('primary', 1).color }}>
            2. WEIGHT COMPARISON MATRIX ({selectedSize.toUpperCase()} · {ICON_SIZES[selectedSize]}px)
          </div>
          <span style={{ color: SpecEngine.getTextStyle('tertiary', 1).color }}>
            Default: light (1.5px stroke)
          </span>
        </div>

        <div className="space-y-3">
          {weights.map((weight) => (
            <div
              key={weight}
              className="p-3.5 rounded-xl space-y-2"
              style={{ ...panelStyle, borderRadius: `${LiminalLayoutEngine.RADIUS.card}px` }}
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white capitalize">{weight}</span>
                  {weight === 'light' && (
                    <span className="px-1.5 py-0.5 text-[9px] rounded bg-blue-500/20 text-blue-300 font-semibold">
                      Canonical Default
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-white/40">
                  {weight === 'thin' && '1px stroke · ambient'}
                  {weight === 'light' && '1.5px stroke · interactive'}
                  {weight === 'regular' && '2px stroke · emphasis'}
                  {weight === 'bold' && '3px stroke · high emphasis'}
                  {weight === 'fill' && 'Solid surfaces'}
                  {weight === 'duotone' && 'Featured states'}
                </span>
              </div>

              <div className="flex items-center gap-4 flex-wrap pt-1">
                {sampleIcons.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1 p-1.5 rounded hover:bg-white/5 transition-colors">
                    <LiminalIcon
                      icon={item.icon}
                      size={selectedSize}
                      weight={weight}
                      className="text-white/80"
                    />
                    <span className="text-[9px] text-white/30 truncate max-w-[50px]">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IconDemo;
