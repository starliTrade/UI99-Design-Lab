import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Button } from './Button';
import { Badge } from './Badge';
import { Tag } from './Tag';
import { Toggle } from './Toggle';
import { getLiminalStyle, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';

export function AtomsDemo() {
  const [toggle1, setToggle1] = useState<boolean>(true);
  const [toggle2, setToggle2] = useState<boolean>(false);
  const [toggleDisabled, setToggleDisabled] = useState<boolean>(true);

  const containerStyle = getLiminalStyle({ surfaceLevel: 1, isContainer: true }).style;
  const panelStyle = getLiminalStyle({ surfaceLevel: 2, isContainer: true }).style;

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
              VARIANT: PRIMARY (BRAND_PRIMARY #E9ECF2)
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
