import React, { useState } from 'react';
import { LiminalMotionEngine, MotionDurationKey, MotionEasingKey } from '../../engine/liminal-motion-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { getLiminalStyle, getTextStyle } from '../../engine/spec-engine';
import { Button } from './Button';
import {
  Play,
  ArrowCounterClockwise,
  Sparkle,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowsOut,
  Eye,
  Sliders,
} from '@phosphor-icons/react';
import { LiminalIcon } from '../../engine/liminal-icon-engine';

export function MotionDemo() {
  const [playRace, setPlayRace] = useState<boolean>(false);
  const [activeKeyframe, setActiveKeyframe] = useState<string>('enterFromBottom');
  const [keyframeKey, setKeyframeKey] = useState<number>(0);
  const [interactivePressed, setInteractivePressed] = useState<boolean>(false);

  const durations: { key: MotionDurationKey; label: string; desc: string; ms: number }[] = [
    { key: 'instant', label: 'Instant', desc: 'micro-feedback (checkbox, radio)', ms: LiminalMotionEngine.DURATION.instant },
    { key: 'fast', label: 'Fast', desc: 'hover & focus states', ms: LiminalMotionEngine.DURATION.fast },
    { key: 'normal', label: 'Normal', desc: 'state changes & button press', ms: LiminalMotionEngine.DURATION.normal },
    { key: 'slow', label: 'Slow', desc: 'small enter/exit (tooltip, popover)', ms: LiminalMotionEngine.DURATION.slow },
    { key: 'slower', label: 'Slower', desc: 'containers (modal, sheet, dropdown)', ms: LiminalMotionEngine.DURATION.slower },
    { key: 'dramatic', label: 'Dramatic', desc: 'hero CTA, mist halo', ms: LiminalMotionEngine.DURATION.dramatic },
  ];

  const easings: { key: MotionEasingKey; label: string; formula: string; desc: string }[] = [
    { key: 'out', label: 'Ease Out', formula: LiminalMotionEngine.EASING.out, desc: 'Enter: fast start, soft settle' },
    { key: 'in', label: 'Ease In', formula: LiminalMotionEngine.EASING.in, desc: 'Exit: soft start, fast snap' },
    { key: 'inOut', label: 'Ease In-Out', formula: LiminalMotionEngine.EASING.inOut, desc: 'Symmetric acceleration' },
    { key: 'spring', label: 'Liminal Spring', formula: LiminalMotionEngine.EASING.spring, desc: 'Signature tactile feedback' },
    { key: 'linear', label: 'Linear', formula: LiminalMotionEngine.EASING.linear, desc: 'Continuous rotation / telemetry' },
  ];

  const triggerAnimation = (name: string) => {
    setActiveKeyframe(name);
    setKeyframeKey((k) => k + 1);
  };

  const panelStyle = getLiminalStyle({ surfaceLevel: 2, isContainer: true }).style;
  const containerStyle = getLiminalStyle({ surfaceLevel: 1, isContainer: true }).style;

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
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
              <LiminalIcon icon={Sparkle} size="md" color="#8B9CF0" weight="light" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="font-bold text-sm sm:text-base tracking-tight"
                  style={{ color: getTextStyle('primary', 1).color }}
                >
                  LIMINAL MOTION ENGINE
                </h2>
                <span
                  className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full"
                  style={{
                    backgroundColor: LiminalColorEngine.SEMANTICS.SUCCESS.subtle,
                    color: LiminalColorEngine.SEMANTICS.SUCCESS.text,
                    border: `1px solid ${LiminalColorEngine.SEMANTICS.SUCCESS.border}`,
                  }}
                >
                  Locked Spec
                </span>
              </div>
              <p className="text-[11px] mt-0.5" style={{ color: getTextStyle('tertiary', 1).color }}>
                Physical continuity, zero ad-hoc milliseconds, perceptual elegance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPlayRace((prev) => !prev)}
              icon={playRace ? <LiminalIcon icon={ArrowCounterClockwise} size="sm" weight="light" /> : <LiminalIcon icon={Play} size="sm" weight="light" />}
            >
              {playRace ? 'Reset Race' : 'Run Curves'}
            </Button>
          </div>
        </div>

        {/* Spec Overview Pill Badges */}
        <div className="flex flex-wrap gap-2 text-[10px]">
          <span className="px-2.5 py-1 rounded bg-white/5 text-white/70">6 Locked Durations (100ms – 500ms)</span>
          <span className="px-2.5 py-1 rounded bg-white/5 text-white/70">5 Mathematical Easings</span>
          <span className="px-2.5 py-1 rounded bg-white/5 text-white/70">Preset Transitions (micro, hover, normal...)</span>
          <span className="px-2.5 py-1 rounded bg-white/5 text-white/70">Directional Keyframe Generators</span>
        </div>
      </div>

      {/* ─── SECTION 1: DURATIONS TIMELINE ─── */}
      <div
        className="p-5 space-y-4"
        style={{
          ...containerStyle,
          borderRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="font-bold" style={{ color: getTextStyle('primary', 1).color }}>
            1. SIX SYSTEM DURATIONS (DURATION.*)
          </div>
          <span style={{ color: getTextStyle('tertiary', 1).color }}>
            Scale: 100ms → 500ms
          </span>
        </div>

        <div className="space-y-3">
          {durations.map((d) => {
            return (
              <div
                key={d.key}
                className="p-3 rounded-xl space-y-2"
                style={{ ...panelStyle, borderRadius: `${LiminalLayoutEngine.RADIUS.card}px` }}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white/90">{d.label}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 font-mono text-[#8B9CF0]">
                      {d.ms}ms
                    </span>
                  </div>
                  <span className="text-[10px]" style={{ color: getTextStyle('tertiary', 2).color }}>
                    {d.desc}
                  </span>
                </div>

                {/* Progress bar track */}
                <div className="relative w-full h-4 bg-black/40 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#60A5FA] to-[#34C08B]"
                    style={{
                      width: playRace ? '100%' : '12%',
                      transition: `width ${d.ms}ms ${LiminalMotionEngine.EASING.out}`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── SECTION 2: EASING CURVES BENCH ─── */}
      <div
        className="p-5 space-y-4"
        style={{
          ...containerStyle,
          borderRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="font-bold" style={{ color: getTextStyle('primary', 1).color }}>
            2. FIVE MATHEMATICAL EASINGS (EASING.*)
          </div>
          <span style={{ color: getTextStyle('tertiary', 1).color }}>
            Cubic Bezier Curves
          </span>
        </div>

        <div className="space-y-3">
          {easings.map((e) => (
            <div
              key={e.key}
              className="p-3 rounded-xl space-y-2"
              style={{ ...panelStyle, borderRadius: `${LiminalLayoutEngine.RADIUS.card}px` }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white/90">{e.label}</span>
                  <span className="text-[10px] text-white/40">{e.desc}</span>
                </div>
                <code className="text-[9px] text-[#A5B4FC] font-mono">{e.formula}</code>
              </div>

              {/* Dynamic marble race track */}
              <div className="relative w-full h-6 bg-black/40 rounded-lg overflow-hidden flex items-center px-1">
                <div
                  className="w-4 h-4 rounded-full bg-[#E9ECF2] shadow-sm"
                  style={{
                    transform: playRace ? 'translateX(calc(100cqw - 24px))' : 'translateX(0)',
                    transition: `transform 400ms ${e.formula}`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── SECTION 3: KEYFRAME GENERATORS PLAYGROUND ─── */}
      <div
        className="p-5 space-y-4"
        style={{
          ...containerStyle,
          borderRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="font-bold" style={{ color: getTextStyle('primary', 1).color }}>
            3. KEYFRAME GENERATORS &amp; ENTRANCE / EXIT
          </div>
          <span style={{ color: getTextStyle('tertiary', 1).color }}>
            enterFrom · exitTo · fadeIn · scaleIn
          </span>
        </div>

        {/* Direction Trigger Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<LiminalIcon icon={ArrowDown} size="sm" weight="light" />}
            onClick={() => triggerAnimation('enterFromTop')}
          >
            Enter Top
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<LiminalIcon icon={ArrowUp} size="sm" weight="light" />}
            onClick={() => triggerAnimation('enterFromBottom')}
          >
            Enter Bottom
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<LiminalIcon icon={ArrowRight} size="sm" weight="light" />}
            onClick={() => triggerAnimation('enterFromLeft')}
          >
            Enter Left
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<LiminalIcon icon={ArrowLeft} size="sm" weight="light" />}
            onClick={() => triggerAnimation('enterFromRight')}
          >
            Enter Right
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<LiminalIcon icon={ArrowsOut} size="sm" weight="light" />}
            onClick={() => triggerAnimation('scaleIn')}
          >
            Scale In
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={<LiminalIcon icon={Eye} size="sm" weight="light" />}
            onClick={() => triggerAnimation('fadeIn')}
          >
            Fade In
          </Button>
        </div>

        {/* Animation Stage Preview */}
        <div
          className="w-full h-44 rounded-xl flex items-center justify-center relative overflow-hidden bg-black/40 border border-white/5"
        >
          <div
            key={keyframeKey}
            className="p-5 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-2xl"
            style={{
              ...getLiminalStyle({ surfaceLevel: 3, isContainer: true }).style,
              borderRadius: `${LiminalLayoutEngine.RADIUS.card}px`,
              animation: `${activeKeyframe} ${LiminalMotionEngine.DURATION.slower}ms ${LiminalMotionEngine.EASING.out} both`,
            }}
          >
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <LiminalIcon icon={Sparkle} size="sm" color="#8B9CF0" weight="light" />
            </div>
            <div className="text-xs font-bold text-white">Active Keyframe: {activeKeyframe}</div>
            <div className="text-[10px] text-white/50">
              Duration: {LiminalMotionEngine.DURATION.slower}ms · Curve: {LiminalMotionEngine.EASING.out}
            </div>
          </div>
        </div>
      </div>

      {/* ─── SECTION 4: INTERACTIVE WRAPPER & TRANSITION PRESETS ─── */}
      <div
        className="p-5 space-y-4"
        style={{
          ...containerStyle,
          borderRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
        }}
      >
        <div className="flex items-center justify-between pb-2 border-b border-white/5">
          <div className="font-bold" style={{ color: getTextStyle('primary', 1).color }}>
            4. CANONICAL PRESETS IN ACTION (TRANSITION.*)
          </div>
          <span style={{ color: getTextStyle('tertiary', 1).color }}>
            micro · hover · normal · spring
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            className="p-4 rounded-xl space-y-2 cursor-pointer transition-all"
            style={{
              ...panelStyle,
              transition: LiminalMotionEngine.TRANSITION.hover,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            <div className="text-xs font-semibold text-white">TRANSITION.hover</div>
            <div className="text-[10px] text-white/50">Fast 150ms out curve for immediate tactile response.</div>
          </div>

          <div
            className="p-4 rounded-xl space-y-2 cursor-pointer transition-all"
            style={{
              ...panelStyle,
              transition: LiminalMotionEngine.TRANSITION.normal,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div className="text-xs font-semibold text-white">TRANSITION.normal</div>
            <div className="text-[10px] text-white/50">Standard 200ms out curve for buttons and state transitions.</div>
          </div>

          <div
            className="p-4 rounded-xl space-y-2 cursor-pointer transition-all"
            style={{
              ...panelStyle,
              transition: LiminalMotionEngine.TRANSITION.spring,
            }}
            onMouseDown={() => setInteractivePressed(true)}
            onMouseUp={() => setInteractivePressed(false)}
            onMouseLeave={() => setInteractivePressed(false)}
          >
            <div className="text-xs font-semibold text-white">TRANSITION.spring</div>
            <div className="text-[10px] text-white/50">
              Signature Liminal curve (350ms, cubic-bezier(0.2, 0.8, 0.2, 1)).
            </div>
            <div
              className="text-[9px] mt-1 font-mono text-[#6EE0B4]"
            >
              {interactivePressed ? 'Spring compressed (active)!' : 'Click & hold to feel'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MotionDemo;
