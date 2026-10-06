import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';
import { Checkbox } from './Checkbox';
import { Radio } from './Radio';
import { getLiminalStyle, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { Search, Mail, Lock, User, CheckCircle2 } from 'lucide-react';

export function InputsDemo() {
  // Input states
  const [textVal, setTextVal] = useState<string>('gateway-node-01');
  const [emailVal, setEmailVal] = useState<string>('architect@liminal.dev');
  const [passVal, setPassVal] = useState<string>('••••••••••••');
  const [searchVal, setSearchVal] = useState<string>('OKLCH Sapphire');

  // Select states
  const [selectVal, setSelectVal] = useState<string>('sapphire');
  const [selectErrorVal, setSelectErrorVal] = useState<string>('');

  // Textarea states
  const [textareaVal, setTextareaVal] = useState<string>(
    'The liminal boundary sits at 12px for cohesive grouping and 16px for separation.'
  );

  // Checkbox states
  const [check1, setCheck1] = useState<boolean>(true);
  const [check2, setCheck2] = useState<boolean>(false);
  const [checkDisabled, setCheckDisabled] = useState<boolean>(true);

  // Radio states
  const [radioVal, setRadioVal] = useState<string>('optimal');

  const containerStyle = getLiminalStyle({ surfaceLevel: 1, isContainer: true }).style;
  const panelStyle = getLiminalStyle({ surfaceLevel: 2, isContainer: true }).style;

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const SPACING = LiminalLayoutEngine.SPACING;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const selectOptions = [
    { value: 'sapphire', label: 'Sapphire Slate (H270 Locked)' },
    { value: 'emerald', label: 'Emerald Active (H155 Success)' },
    { value: 'amber', label: 'Amber Elevated (H85 Warning)' },
    { value: 'ruby', label: 'Ruby Critical (H15 Danger)' },
    { value: 'offline', label: 'Archived Cluster (Offline)', disabled: true },
  ];

  const sectionDividerStyle: CSSProperties = {
    height: '1px',
    background: 'rgba(255, 255, 255, 0.04)',
    margin: `${SPACING[5]}px 0`, // 24px
  };

  const sectionHeaderStyle: CSSProperties = {
    fontSize: '11px',
    fontFamily: 'monospace',
    color: getTextStyle('tertiary', 1).color,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    marginBottom: `${SPACING[3]}px`,
  };

  return (
    <div
      style={{
        ...containerStyle,
        borderRadius: `${RADIUS.container}px`,
        padding: `${SPACING[5]}px`,
      }}
      className="space-y-6"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div>
          <h2
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: getTextStyle('primary', 1).color,
              margin: 0,
            }}
          >
            LIMINAL Inputs Kit · v1.0
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
            Input · Select · Textarea · Checkbox · Radio (100% Engine Driven)
          </p>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 10px',
            borderRadius: `${RADIUS.full}px`,
            background: SEMANTICS.SUCCESS.subtle,
            border: `1px solid ${SEMANTICS.SUCCESS.border}`,
            color: SEMANTICS.SUCCESS.text,
            fontSize: '11px',
            fontFamily: 'monospace',
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={12} />
          <span>All Inputs Synced</span>
        </span>
      </div>

      {/* 1. INPUTS MATRIX (2-Column Grid) */}
      <div>
        <div style={sectionHeaderStyle}>
          1. Text Fields &amp; Input Variations (Surface 2 · Rim 2 · 44px Touch Target)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Node Identifier"
            placeholder="e.g. gateway-node-01"
            value={textVal}
            onChange={(e) => setTextVal(e.target.value)}
            helperText="Alphanumeric ASCII characters only"
            prefix={<User size={16} />}
          />

          <Input
            type="email"
            label="Security Contact"
            placeholder="name@domain.com"
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
            success="Verified GPG security signature active"
            prefix={<Mail size={16} />}
          />

          <Input
            type="password"
            label="Access Passphrase"
            placeholder="Enter passphrase"
            value={passVal}
            onChange={(e) => setPassVal(e.target.value)}
            helperText="128-bit quantum resistant token"
            prefix={<Lock size={16} />}
            suffix={<span style={{ fontSize: '10px', fontFamily: 'monospace' }}>AES-GCM</span>}
          />

          <Input
            type="search"
            label="Network Query"
            placeholder="Search telemetry or routes..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            prefix={<Search size={16} />}
            suffix={<kbd style={{ fontSize: '9px', padding: '2px 4px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>⌘K</kbd>}
          />

          <Input
            label="Cluster Hostname (Error State)"
            defaultValue="invalid_domain_name!"
            error="Domain syntax violates RFC 1035 spec"
          />

          <Input
            label="Provisioned Core (Disabled State)"
            defaultValue="core-09.internal.lan"
            disabled
            helperText="Node is quarantined and cannot be modified"
          />
        </div>
      </div>

      <div style={sectionDividerStyle} />

      {/* 2. SELECT & TEXTAREA (2-Column Grid) */}
      <div>
        <div style={sectionHeaderStyle}>
          2. Select &amp; Multiline Textarea (Surface 3 Dropdown · E1 Sub-Canvas Shadow)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Select
              label="Active Profile Route"
              options={selectOptions}
              value={selectVal}
              onChange={setSelectVal}
            />

            <Select
              label="Backup Route (Error State)"
              options={selectOptions}
              value={selectErrorVal}
              onChange={setSelectErrorVal}
              placeholder="Pick alternative fallback..."
              error="No failover route designated for this cluster"
            />

            <Select
              label="Legacy Provider (Disabled State)"
              options={selectOptions}
              defaultValue="offline"
              disabled
            />
          </div>

          <div className="space-y-4">
            <Textarea
              label="System Operational Manifest"
              value={textareaVal}
              onChange={(e) => setTextareaVal(e.target.value)}
              helperText="Markdown notes compiled into gateway configuration"
              rows={4}
            />

            <Textarea
              label="Recovery Diagnostics (Error State)"
              defaultValue="ERR_TIMEOUT: Packet loss detected on edge hop #4."
              error="Connection dropped while validating peer certificate"
              rows={2}
            />
          </div>
        </div>
      </div>

      <div style={sectionDividerStyle} />

      {/* 3. CHECKBOXES & RADIOS */}
      <div>
        <div style={sectionHeaderStyle}>
          3. Toggles &amp; Selectors (Checkbox 20px / Chip 6px · Radio 50% · Emerald 155)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Checkboxes Panel */}
          <div
            style={{
              ...panelStyle,
              borderRadius: `${RADIUS.panel}px`,
              padding: `${SPACING[4]}px`,
            }}
            className="space-y-3"
          >
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: getTextStyle('tertiary', 2).color }}>
              CHECKBOXES (SEMANTICS.SUCCESS SOLID #34C08B)
            </div>

            <div className="space-y-2.5">
              <Checkbox
                checked={check1}
                onChange={setCheck1}
                label="Enforce TLS 1.3 Strict Mutual Authentication"
              />

              <Checkbox
                checked={check2}
                onChange={setCheck2}
                label="Enable Zero-Knowledge Telemetry Sampling"
              />

              <Checkbox
                checked={checkDisabled}
                onChange={setCheckDisabled}
                disabled
                label="Hardware Root-of-Trust (Read-Only HSM)"
              />
            </div>
          </div>

          {/* Radios Panel */}
          <div
            style={{
              ...panelStyle,
              borderRadius: `${RADIUS.panel}px`,
              padding: `${SPACING[4]}px`,
            }}
            className="space-y-3"
          >
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: getTextStyle('tertiary', 2).color }}>
              RADIO GROUP (NAME="ROUTING_TIER")
            </div>

            <div className="space-y-2.5">
              <Radio
                name="routing_tier"
                value="optimal"
                checked={radioVal === 'optimal'}
                onChange={() => setRadioVal('optimal')}
                label="Ultra-Low Latency Direct Peer (Default)"
              />

              <Radio
                name="routing_tier"
                value="balanced"
                checked={radioVal === 'balanced'}
                onChange={() => setRadioVal('balanced')}
                label="Balanced Multi-Region Anycast"
              />

              <Radio
                name="routing_tier"
                value="eco"
                checked={radioVal === 'eco'}
                onChange={() => setRadioVal('eco')}
                label="Eco Low-Power Geo-Distributed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InputsDemo;
