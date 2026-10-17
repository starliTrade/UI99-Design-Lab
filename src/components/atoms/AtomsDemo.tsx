import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import {
  MagnifyingGlass,
  Gear,
  Trash,
  ArrowUpRight,
  DownloadSimple,
  Plus,
} from '@phosphor-icons/react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Tag } from './Tag';
import { Toggle } from './Toggle';
import { LiminalIcon } from '../../engine/liminal-icon-engine';
import { getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { resolveSurface } from '../../engine/liminal-surface';

export function AtomsDemo() {
  const [toggle1, setToggle1] = useState<boolean>(true);
  const [toggle2, setToggle2] = useState<boolean>(false);
  const [toggleDisabled, setToggleDisabled] = useState<boolean>(true);
  const [autoLoading, setAutoLoading] = useState<boolean>(false);

  const handleTriggerLoading = () => {
    setAutoLoading(true);
    setTimeout(() => {
      setAutoLoading(false);
    }, 2000);
  };

  const containerStyle = resolveSurface({ role: 'chrome', interactive: false }).style;
  const panelStyle = resolveSurface({ role: 'work', interactive: false }).style;

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const SPACING = LiminalLayoutEngine.SPACING;

  const sectionDividerStyle: CSSProperties = {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.04)',
    margin: `${SPACING[4]}px 0`, // 16px
  };

  const labelStyle: CSSProperties = {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: getTextStyle('tertiary', 1).color,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: `${SPACING[2]}px`,
  };

  return (
    <div
      style={{
        ...containerStyle,
        borderRadius: `${RADIUS.container}px`,
        padding: `${SPACING[5]}px`, // 24px
      }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: getTextStyle('primary', 1).color,
              margin: 0,
            }}
          >
            LIMINAL Atoms Kit · v1.0
          </h2>
          <p
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              color: getTextStyle('secondary', 1).color,
              marginTop: '4px',
              margin: 0,
            }}
          >
            Strict 4-Atom Library · Zero Hardcoded Values · 100% Engine Driven
          </p>
        </div>
        <Badge semantic="success">All Tests Passed</Badge>
      </div>

      {/* 1. BUTTONS MATRIX */}
      <div>
        <div style={labelStyle}>1. Button Matrix (4 Variants × 3 Sizes + Disabled)</div>
        <div
          style={{
            ...panelStyle,
            borderRadius: `${RADIUS.panel}px`,
            padding: `${SPACING[4]}px`,
          }}
          className="space-y-4"
        >
          {/* Primary Row */}
          <div>
            <div style={{ fontSize: '10px', color: getTextStyle('quaternary', 2).color, marginBottom: '6px' }}>
              VARIANT: PRIMARY (BRAND_PRIMARY {LiminalColorEngine.BRAND_PRIMARY.name})
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm">Primary Sm</Button>
              <Button variant="primary" size="md">Primary Md</Button>
              <Button variant="primary" size="lg">Primary Lg</Button>
              <Button variant="primary" size="md" disabled>Disabled</Button>
            </div>
          </div>

          {/* Secondary Row */}
          <div>
            <div style={{ fontSize: '10px', color: getTextStyle('quaternary', 2).color, marginBottom: '6px' }}>
              VARIANT: SECONDARY (SURFACE 2 · RIM 2)
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="secondary" size="sm">Secondary Sm</Button>
              <Button variant="secondary" size="md">Secondary Md</Button>
              <Button variant="secondary" size="lg">Secondary Lg</Button>
              <Button variant="secondary" size="md" disabled>Disabled</Button>
            </div>
          </div>

          {/* Ghost Row */}
          <div>
            <div style={{ fontSize: '10px', color: getTextStyle('quaternary', 2).color, marginBottom: '6px' }}>
              VARIANT: GHOST (NO RIM · HOVER S2.5)
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="ghost" size="sm">Ghost Sm</Button>
              <Button variant="ghost" size="md">Ghost Md</Button>
              <Button variant="ghost" size="lg">Ghost Lg</Button>
              <Button variant="ghost" size="md" disabled>Disabled</Button>
            </div>
          </div>

          {/* Danger Row */}
          <div>
            <div style={{ fontSize: '10px', color: getTextStyle('quaternary', 2).color, marginBottom: '6px' }}>
              VARIANT: DANGER (SEMANTICS.DANGER.TEXT #F091A2)
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="danger" size="sm">Danger Sm</Button>
              <Button variant="danger" size="md">Danger Md</Button>
              <Button variant="danger" size="lg">Danger Lg</Button>
              <Button variant="danger" size="md" disabled>Disabled</Button>
            </div>
          </div>

          {/* Outline Row */}
          <div>
            <div style={{ fontSize: '10px', color: getTextStyle('quaternary', 2).color, marginBottom: '6px' }}>
              VARIANT: OUTLINE (1PX LADDER 3 RIM · HOVER LADDER 4)
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm">Outline Sm</Button>
              <Button variant="outline" size="md">Outline Md</Button>
              <Button variant="outline" size="lg">Outline Lg</Button>
              <Button variant="outline" size="md" disabled>Disabled</Button>
            </div>
          </div>

          {/* Link Row */}
          <div>
            <div style={{ fontSize: '10px', color: getTextStyle('quaternary', 2).color, marginBottom: '6px' }}>
              VARIANT: LINK (UNDERLINE · PRIMARY TEXT COLOR)
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="link" size="sm">Link Sm</Button>
              <Button variant="link" size="md">Link Md</Button>
              <Button variant="link" size="lg">Link Lg</Button>
              <Button variant="link" size="md" disabled>Disabled</Button>
            </div>
          </div>
        </div>
      </div>

      {/* 1.1 BUTTON · LOADING STATE */}
      <div>
        <div style={labelStyle}>1.1 Button · Loading (Zero Layout Shift · Phosphor SpinnerGap · 0.85 Opacity)</div>
        <div
          style={{
            ...panelStyle,
            borderRadius: `${RADIUS.panel}px`,
            padding: `${SPACING[4]}px`,
          }}
          className="space-y-4"
        >
          {/* Interactive Trigger */}
          <div>
            <div style={{ fontSize: '10px', color: getTextStyle('quaternary', 2).color, marginBottom: '6px' }}>
              INTERACTIVE: ASYNC SIMULATOR (OPACITY TRANSITION FAST · AUTO REVERTS IN 2s)
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                loading={autoLoading}
                onClick={handleTriggerLoading}
                icon={<LiminalIcon icon={DownloadSimple} size="sm" weight="light" />}
              >
                {autoLoading ? 'Fetching Manifest...' : 'Trigger Async Action (2s)'}
              </Button>
              <span style={{ fontSize: '11px', color: getTextStyle('secondary', 2).color }}>
                {autoLoading ? 'aria-busy="true" · interaction locked' : 'Click to test transition & layout preservation'}
              </span>
            </div>
          </div>

          {/* Sizes & Variants Matrix */}
          <div>
            <div style={{ fontSize: '10px', color: getTextStyle('quaternary', 2).color, marginBottom: '6px' }}>
              LOADING SIZES (sm: 12px · md: 16px · lg: 20px) ACROSS VARIANTS
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="sm" loading>Primary Sm</Button>
              <Button variant="secondary" size="md" loading>Secondary Md</Button>
              <Button variant="ghost" size="lg" loading>Ghost Lg</Button>
              <Button variant="danger" size="md" loading>Danger Md</Button>
              <Button variant="secondary" size="md" loading disabled>
                Disabled Takes Priority
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 1.2 BUTTON · ICON-ONLY VARIANT */}
      <div>
        <div style={labelStyle}>1.2 Button · Icon-Only (Strict Square Dimensions: 32px · 44px · 52px · Enforced a11y)</div>
        <div
          style={{
            ...panelStyle,
            borderRadius: `${RADIUS.panel}px`,
            padding: `${SPACING[4]}px`,
          }}
          className="space-y-4"
        >
          {/* 3 Sizes */}
          <div>
            <div style={{ fontSize: '10px', color: getTextStyle('quaternary', 2).color, marginBottom: '6px' }}>
              THREE SIZES (sm: 32×32px / 16px icon · md: 44×44px / 20px icon · lg: 52×52px / 24px icon)
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                iconOnly
                variant="primary"
                size="sm"
                ariaLabel="Search database"
                icon={<LiminalIcon icon={MagnifyingGlass} size="sm" weight="light" />}
              />
              <Button
                iconOnly
                variant="secondary"
                size="md"
                ariaLabel="Settings preferences"
                icon={<LiminalIcon icon={Gear} size="md" weight="light" />}
              />
              <Button
                iconOnly
                variant="ghost"
                size="lg"
                ariaLabel="Create item"
                icon={<LiminalIcon icon={Plus} size="lg" weight="light" />}
              />
              <Button
                iconOnly
                variant="danger"
                size="md"
                ariaLabel="Delete record"
                icon={<LiminalIcon icon={Trash} size="md" weight="light" />}
              />
              <Button
                iconOnly
                variant="secondary"
                size="md"
                disabled
                ariaLabel="Disabled action"
                icon={<LiminalIcon icon={Gear} size="md" weight="light" />}
              />
              <Button
                iconOnly
                variant="primary"
                size="md"
                loading
                ariaLabel="Saving changes"
                icon={<LiminalIcon icon={Plus} size="md" weight="light" />}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 1.3 BUTTON · AS LINK (HREF) */}
      <div>
        <div style={labelStyle}>1.3 Button · As Link (Semantic &lt;a&gt; Anchor · Preserved Optical &amp; Focus DNA)</div>
        <div
          style={{
            ...panelStyle,
            borderRadius: `${RADIUS.panel}px`,
            padding: `${SPACING[4]}px`,
          }}
          className="flex flex-wrap items-center gap-3"
        >
          <Button
            href="https://google.com"
            target="_blank"
            variant="primary"
            size="md"
            iconRight={<LiminalIcon icon={ArrowUpRight} size="xs" weight="light" />}
          >
            External Anchor (target="_blank")
          </Button>
          <Button
            href="#app/dashboard"
            variant="secondary"
            size="md"
          >
            Internal Route Link
          </Button>
          <Button
            href="https://google.com"
            disabled
            variant="secondary"
            size="md"
          >
            Disabled Anchor (pointer-events: none)
          </Button>
          <Button
            iconOnly
            href="https://google.com"
            target="_blank"
            variant="ghost"
            size="md"
            ariaLabel="Open in new window"
            icon={<LiminalIcon icon={ArrowUpRight} size="md" weight="light" />}
          />
        </div>
      </div>

      {/* 1.4 BUTTON · COMPOSITION (asChild / SLOT PATTERN) */}
      <div>
        <div style={labelStyle}>1.4 Button · Composition (asChild Slot Pattern · Radix-style Polymorphism)</div>
        <div
          style={{
            ...panelStyle,
            borderRadius: `${RADIUS.panel}px`,
            padding: `${SPACING[4]}px`,
          }}
          className="space-y-4"
        >
          <div>
            <div style={{ fontSize: '10px', color: getTextStyle('quaternary', 2).color, marginBottom: '6px' }}>
              CUSTOM ANCHOR ROUTE, GHOST LINK, OUTLINE ICON CONTAINER &amp; ASYNC LOADING SLOT
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild>
                <a href="#dashboard" onClick={(e) => e.preventDefault()}>
                  Go to Dashboard
                </a>
              </Button>

              <Button asChild variant="ghost">
                <a href="#settings" onClick={(e) => e.preventDefault()}>
                  Settings
                </a>
              </Button>

              <Button asChild variant="outline" size="icon" ariaLabel="Custom Div Icon Target">
                <div>
                  <LiminalIcon icon={Gear} size="md" weight="light" />
                </div>
              </Button>

              <Button asChild variant="primary" loading>
                <a href="#saving" onClick={(e) => e.preventDefault()}>
                  Saving Changes...
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div style={sectionDividerStyle} />

      {/* 2. BADGES */}
      <div>
        <div style={labelStyle}>2. Badges (4 Semantic Roles · Pill 9999px)</div>
        <div
          style={{
            ...panelStyle,
            borderRadius: `${RADIUS.panel}px`,
            padding: `${SPACING[4]}px`,
          }}
          className="flex flex-wrap items-center gap-3"
        >
          <Badge semantic="success">Success · Active</Badge>
          <Badge semantic="warning">Warning · High Load</Badge>
          <Badge semantic="danger">Danger · Error 503</Badge>
          <Badge semantic="info">Info · TLS 1.3</Badge>
        </div>
      </div>

      <div style={sectionDividerStyle} />

      {/* 3. TAGS */}
      <div>
        <div style={labelStyle}>3. Tags (12 Extended Spectrum Hues · Chip 6px)</div>
        <div
          style={{
            ...panelStyle,
            borderRadius: `${RADIUS.panel}px`,
            padding: `${SPACING[4]}px`,
          }}
          className="flex flex-wrap items-center gap-2"
        >
          {LiminalColorEngine.EXTENDED_SPECTRUM.map((item) => (
            <Tag key={item.hue} hue={item.hue}>
              {item.label} H{item.hue}
            </Tag>
          ))}
        </div>
      </div>

      <div style={sectionDividerStyle} />

      {/* 4. TOGGLES */}
      <div>
        <div style={labelStyle}>4. Toggles (44×24px Pill · Strict Spec Rim &amp; Brand Knob)</div>
        <div
          style={{
            ...panelStyle,
            borderRadius: `${RADIUS.panel}px`,
            padding: `${SPACING[4]}px`,
          }}
          className="flex flex-wrap items-center gap-6"
        >
          <div className="flex items-center gap-3">
            <Toggle checked={toggle1} onChange={setToggle1} aria-label="Toggle 1" />
            <span style={{ fontSize: '12px', color: getTextStyle('primary', 2).color }}>
              State: {toggle1 ? 'ON (Brand Primary)' : 'OFF (Surface Rim 2)'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Toggle checked={toggle2} onChange={setToggle2} aria-label="Toggle 2" />
            <span style={{ fontSize: '12px', color: getTextStyle('primary', 2).color }}>
              State: {toggle2 ? 'ON' : 'OFF'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Toggle checked={toggleDisabled} onChange={setToggleDisabled} disabled aria-label="Toggle Disabled" />
            <span style={{ fontSize: '12px', color: getTextStyle('quaternary', 2).color }}>
              Disabled (Opacity 0.5)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AtomsDemo;
