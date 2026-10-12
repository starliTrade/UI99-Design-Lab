import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Combobox } from './Combobox';
import { MultiSelect } from './MultiSelect';
import { Textarea } from './Textarea';
import { Checkbox } from './Checkbox';
import { Radio } from './Radio';
import { Toggle } from '../atoms/Toggle';
import { getLiminalStyle, getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import { MagnifyingGlass, Envelope, Lock, User, CheckCircle, Globe, Cpu, HardDrives, ShieldCheck } from '@phosphor-icons/react';
import { LiminalIcon } from '../../engine/liminal-icon-engine';
import { DirProvider } from '../../engine/liminal-direction';

export function InputsDemo() {
  // Input states
  const [textVal, setTextVal] = useState<string>('gateway-node-01');
  const [emailVal, setEmailVal] = useState<string>('architect@liminal.dev');
  const [passVal, setPassVal] = useState<string>('••••••••••••');
  const [searchVal, setSearchVal] = useState<string>('OKLCH Sapphire');
  const [suffixVal, setSuffixVal] = useState<string>('dev-ops');
  const [countVal, setCountVal] = useState<string>('cluster-alpha-09');
  const [clearVal, setClearVal] = useState<string>('active-connection-pool');

  // Select states
  const [selectVal, setSelectVal] = useState<string>('sapphire');
  const [selectRtlVal, setSelectRtlVal] = useState<string>('emerald');
  const [selectErrorVal, setSelectErrorVal] = useState<string>('');

  // Combobox states
  const [comboboxVal, setComboboxVal] = useState<string>('lon-gateway');
  const [comboboxPrefixVal, setComboboxPrefixVal] = useState<string>('');

  // MultiSelect states
  const [multiSelectVal, setMultiSelectVal] = useState<string[]>(['lon-gateway', 'nyc-cache']);
  const [multiSelectClusterVal, setMultiSelectClusterVal] = useState<string[]>(['sapphire', 'emerald']);

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

  // Toggle states
  const [toggle1, setToggle1] = useState<boolean>(true);
  const [toggle2, setToggle2] = useState<boolean>(false);
  const [toggleDisabled, setToggleDisabled] = useState<boolean>(true);

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

  const comboboxOptions = [
    {
      value: 'lon-gateway',
      label: 'London Edge Gateway (eu-west-2)',
      icon: <LiminalIcon icon={Globe} size="sm" weight="light" />,
    },
    {
      value: 'fra-core',
      label: 'Frankfurt Core Compute (eu-central-1)',
      icon: <LiminalIcon icon={Cpu} size="sm" weight="light" />,
    },
    {
      value: 'nyc-cache',
      label: 'New York High-Speed Cache (us-east-1)',
      icon: <LiminalIcon icon={HardDrives} size="sm" weight="light" />,
    },
    {
      value: 'tyo-proxy',
      label: 'Tokyo SSL Inspection Proxy (ap-northeast-1)',
      icon: <LiminalIcon icon={ShieldCheck} size="sm" weight="light" />,
    },
    {
      value: 'sin-backup',
      label: 'Singapore Disaster Recovery (ap-southeast-1)',
      icon: <LiminalIcon icon={Globe} size="sm" weight="light" />,
    },
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
          <LiminalIcon icon={CheckCircle} size="xs" weight="light" />
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
            prefix={<LiminalIcon icon={User} size="sm" weight="light" />}
          />

          <Input
            type="email"
            label="Security Contact"
            placeholder="name@domain.com"
            value={emailVal}
            onChange={(e) => setEmailVal(e.target.value)}
            success="Verified GPG security signature active"
            prefix={<LiminalIcon icon={Envelope} size="sm" weight="light" />}
          />

          <Input
            type="password"
            label="Access Passphrase (Password Toggle Demo)"
            placeholder="Enter passphrase"
            value={passVal}
            onChange={(e) => setPassVal(e.target.value)}
            helperText="Click Eye icon to toggle visibility (LiminalIcon sm/light)"
            togglePassword
            prefix={<LiminalIcon icon={Lock} size="sm" weight="light" />}
            suffix={<span style={{ fontSize: '10px', fontFamily: 'monospace' }}>AES-GCM</span>}
          />

          <Input
            type="search"
            label="Network Query (Prefix & Clearable Demo)"
            placeholder="Search telemetry or routes..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            clearable
            prefix={<LiminalIcon icon={MagnifyingGlass} size="sm" weight="light" />}
            suffix={<kbd style={{ fontSize: '9px', padding: '2px 4px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>⌘K</kbd>}
          />

          <Input
            label="Operator Realm (Suffix Demo)"
            placeholder="username"
            value={suffixVal}
            onChange={(e) => setSuffixVal(e.target.value)}
            suffix="@example.com"
            helperText="Text suffix rendered at 13px tertiary tone"
          />

          <Input
            label="Cluster Alias (Character Count Demo)"
            placeholder="Enter cluster alias"
            value={countVal}
            onChange={(e) => setCountVal(e.target.value)}
            maxLength={32}
            showCount
            helperText="Counter shifts warning at 90% (>28) and danger at limit"
          />

          <Input
            label="Filter Query (Clearable Demo)"
            placeholder="Type to test clear button..."
            value={clearVal}
            onChange={(e) => setClearVal(e.target.value)}
            clearable
            prefix={<LiminalIcon icon={MagnifyingGlass} size="sm" weight="light" />}
            helperText="Click 'X' icon to clear value"
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

      {/* 2. SELECT & COMBOBOX & TEXTAREA (Grid Showcase) */}
      <div>
        <div style={sectionHeaderStyle}>
          2. Select &amp; Combobox Autocomplete (Custom CaretDown · RTL Positioning · MIST Quiet Portal)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Select
              label="Active Profile Route (Select LTR — CaretDown Icon)"
              options={selectOptions}
              value={selectVal}
              onChange={setSelectVal}
            />

            {/* Direction comes from the document, not from a prop on the field.
                This is the same component; only the surrounding direction differs. */}
            <DirProvider dir="rtl">
              <Select
                label="مسیر فعال کلاستر (Select RTL — آیکون CaretDown در سمت چپ)"
                options={selectOptions}
                value={selectRtlVal}
                onChange={setSelectRtlVal}
                helperText="چیدمان راست‌به‌چپ با قرارگیری آیکون CaretDown در سمت چپ"
              />
            </DirProvider>

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
            <Combobox
              label="Edge Compute Node (Combobox Autocomplete)"
              options={comboboxOptions}
              value={comboboxVal}
              onChange={setComboboxVal}
              placeholder="Type or pick edge node..."
              helperText="Live query filter · MIST quiet floating panel · SHADOWS[3] · LiminalPortal"
            />

            <Combobox
              label="Security Proxy Stream (Prefix Search Combobox)"
              prefix={<LiminalIcon icon={MagnifyingGlass} size="sm" weight="light" />}
              options={comboboxOptions}
              value={comboboxPrefixVal}
              onChange={setComboboxPrefixVal}
              placeholder="Search cluster routes..."
            />

            <MultiSelect
              label="Active Edge Nodes (Multi-Select Chip-based)"
              options={comboboxOptions}
              value={multiSelectVal}
              onChange={setMultiSelectVal}
              placeholder="Add edge nodes..."
              helperText="Badge tags variant='info' · Removable X · Backspace to delete · LiminalPortal MIST panel"
            />

            <MultiSelect
              label="Cluster Failover Targets (Multi-Select Validation)"
              options={selectOptions}
              value={multiSelectClusterVal}
              onChange={setMultiSelectClusterVal}
              placeholder="Select failover cluster..."
              helperText="Multi-select chip container with focus ring & directional rim"
            />

            <Textarea
              label="System Operational Manifest (Character Count Demo)"
              value={textareaVal}
              onChange={(e) => setTextareaVal(e.target.value)}
              maxLength={120}
              showCount
              helperText="Markdown notes compiled into gateway configuration"
              rows={3}
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Toggles Panel */}
          <div
            style={{
              ...panelStyle,
              borderRadius: `${RADIUS.panel}px`,
              padding: `${SPACING[4]}px`,
            }}
            className="space-y-3"
          >
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: getTextStyle('tertiary', 2).color }}>
              TOGGLE SWITCHES (BRAND_PRIMARY / LADDER)
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: getTextStyle('secondary', 2).color }}>Global Mesh Firewall</span>
                <Toggle checked={toggle1} onChange={setToggle1} aria-label="Global Mesh Firewall" />
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: getTextStyle('secondary', 2).color }}>Auto-Failover Route</span>
                <Toggle checked={toggle2} onChange={setToggle2} aria-label="Auto-Failover Route" />
              </div>

              <div className="flex items-center justify-between">
                <span style={{ fontSize: '13px', color: getTextStyle('secondary', 2).color }}>Quarantine Mode</span>
                <Toggle checked={toggleDisabled} onChange={setToggleDisabled} disabled aria-label="Quarantine Mode" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InputsDemo;
