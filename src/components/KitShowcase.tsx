import React, { useState } from 'react';
import {
  Button,
  Badge,
  Tag,
  Toggle,
  Avatar,
  Input,
  Select,
  Textarea,
  Checkbox,
  Card,
  Panel,
  Modal,
  Sheet,
  Alert,
  Toast,
  Tooltip,
  Stat,
  Table,
  Progress,
  Tabs,
  Breadcrumb,
} from './index';
import { getLiminalStyle, LiminalState, getTextStyle } from '../engine/spec-engine';
import { LiminalColorEngine } from '../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../engine/liminal-layout-engine';
import {
  Sparkles,
  Command,
  Search,
  Check,
  Send,
  AlertTriangle,
  Info,
  Shield,
  Activity,
  Layers,
  Terminal,
  MousePointer,
  Cpu,
  Key,
  Globe,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export function KitShowcase() {
  // State controls for interactive testing
  const [buttonState, setButtonState] = useState<LiminalState>('idle');
  const [toggleState, setToggleState] = useState<boolean>(true);
  const [checkbox1, setCheckbox1] = useState<boolean>(true);
  const [checkbox2, setCheckbox2] = useState<boolean>(false);
  const [selectValue, setSelectValue] = useState<string>('eu-central');
  const [inputValue, setInputValue] = useState<string>('master.node.liminal');
  const [progressVal, setProgressVal] = useState<number>(68);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastSemantic, setToastSemantic] = useState<'success' | 'warning' | 'danger' | 'info'>('success');
  const [activeSubTab, setActiveSubTab] = useState<string>('all');

  const triggerToast = (semantic: 'success' | 'warning' | 'danger' | 'info') => {
    setToastSemantic(semantic);
    setToastOpen(true);
  };

  const sampleTableData = [
    { id: 'node-01', name: 'Frankfurt-Core', status: 'Healthy', latency: '4.2ms', load: '32%' },
    { id: 'node-02', name: 'Dublin-Edge', status: 'Healthy', latency: '6.8ms', load: '45%' },
    { id: 'node-03', name: 'Stockholm-Sync', status: 'Warning', latency: '18.4ms', load: '89%' },
    { id: 'node-04', name: 'Zurich-Vault', status: 'Healthy', latency: '3.9ms', load: '18%' },
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Header banner */}
      <div
        className="p-5 sm:p-6 space-y-3"
        style={{
          ...getLiminalStyle({ surfaceLevel: 1, isContainer: true }).style,
          borderRadius: `${LiminalLayoutEngine.RADIUS.container}px`,
        }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                ...getLiminalStyle({ surfaceLevel: 2, isContainer: true }).style,
                borderRadius: `${LiminalLayoutEngine.RADIUS.control}px`,
              }}
            >
              <Layers className="w-5 h-5 text-[#8B9CF0]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className="font-bold text-sm sm:text-base tracking-tight"
                  style={{ color: getTextStyle('primary', 1).color }}
                >
                  LIMINAL COMPONENT KIT v1.0
                </h2>
                <Badge semantic="success">6 Groups</Badge>
              </div>
              <p className="text-[11px] mt-0.5" style={getTextStyle('tertiary', 1)}>
                Strictly derived from Locked Spec: Atoms, Inputs, Containers, Feedback, Data, Nav
              </p>
            </div>
          </div>

          {/* Sub-filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-[11px]">
            {['all', 'atoms', 'inputs', 'containers', 'feedback', 'data', 'nav'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className="px-2.5 py-1 uppercase text-[10px] tracking-wider rounded-md transition-all cursor-pointer whitespace-nowrap"
                style={{
                  ...(activeSubTab === tab
                    ? {
                        ...getLiminalStyle({ surfaceLevel: 3, interactive: true }).style,
                        color: getTextStyle('primary', 3).color,
                        fontWeight: 600,
                      }
                    : {
                        background: 'transparent',
                        color: getTextStyle('secondary', 1).color,
                      }),
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Live System State Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <span style={getTextStyle('secondary', 1)}>Interactive State Override:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {(['idle', 'hover', 'focus', 'active', 'disabled'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setButtonState(st)}
                className="px-2.5 py-1 text-[11px] rounded-md transition-all cursor-pointer uppercase"
                style={{
                  ...(buttonState === st
                    ? {
                        ...getLiminalStyle({ surfaceLevel: 3, interactive: true }).style,
                        color: getTextStyle('primary', 3).color,
                        fontWeight: 600,
                      }
                    : {
                        background: 'rgba(255, 255, 255, 0.03)',
                        color: getTextStyle('tertiary', 1).color,
                        border: '1px solid rgba(255, 255, 255, 0.04)',
                      }),
                }}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          GROUP 1: ATOMS
         ───────────────────────────────────────────────────────────── */}
      {(activeSubTab === 'all' || activeSubTab === 'atoms') && (
        <Card
          title="GROUP 1: ATOMS"
          subtitle="Button (4 variants) · Badge · Tag · Toggle · Avatar"
          action={<Badge semantic="info">Base Primitives</Badge>}
        >
          <div className="space-y-6">
            {/* 1.1 Buttons */}
            <div className="space-y-3">
              <div className="text-[11px] uppercase font-bold tracking-wider" style={getTextStyle('tertiary', 1)}>
                Buttons (Variants &amp; Sizes · Controlled State: {buttonState.toUpperCase()})
              </div>

              <div className="flex flex-wrap gap-2.5 items-center">
                <Button variant="primary" forcedState={buttonState} icon={<Command className="w-3.5 h-3.5" />}>
                  Primary Brand
                </Button>
                <Button variant="secondary" forcedState={buttonState} icon={<Shield className="w-3.5 h-3.5" />}>
                  Secondary Rim 2
                </Button>
                <Button variant="ghost" forcedState={buttonState}>
                  Ghost Surface
                </Button>
                <Button variant="danger" forcedState={buttonState} icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                  Danger Red
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 items-center pt-1">
                <Button size="sm" variant="secondary">Small 32px</Button>
                <Button size="md" variant="secondary">Medium 42px</Button>
                <Button size="lg" variant="primary">Large 50px</Button>
                <Button variant="secondary" disabled>Disabled State</Button>
              </div>
            </div>

            {/* 1.2 Badges & Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
              <div className="space-y-2">
                <div className="text-[11px] uppercase font-bold tracking-wider" style={getTextStyle('tertiary', 1)}>
                  Badges (Pill Geometry · Semantic Set)
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge semantic="success">Success H155</Badge>
                  <Badge semantic="warning">Warning H85</Badge>
                  <Badge semantic="danger">Danger H15</Badge>
                  <Badge semantic="info">Info H230</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] uppercase font-bold tracking-wider" style={getTextStyle('tertiary', 1)}>
                  Tags (Chip Radius 6px · Extended Spectrum)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Tag hue={15}>H15 Coral</Tag>
                  <Tag hue={75}>H75 Amber</Tag>
                  <Tag hue={145}>H145 Mint</Tag>
                  <Tag hue={200}>H200 Cyan</Tag>
                  <Tag hue={260}>H260 Violet</Tag>
                  <Tag hue={320}>H320 Rose</Tag>
                </div>
              </div>
            </div>

            {/* 1.3 Toggle & Avatar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/5">
              <div className="space-y-2">
                <div className="text-[11px] uppercase font-bold tracking-wider" style={getTextStyle('tertiary', 1)}>
                  Toggle Switch (Liminal Physical Surface Shift)
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Toggle on={toggleState} onChange={setToggleState} />
                    <span className="text-xs" style={getTextStyle('secondary', 1)}>
                      {toggleState ? 'Active (Brand Soft White)' : 'Idle (Surface 3 · Rim 2)'}
                    </span>
                  </div>
                  <Toggle on={false} onChange={() => {}} disabled />
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] uppercase font-bold tracking-wider" style={getTextStyle('tertiary', 1)}>
                  Avatars (Surface 2 · Rim 1 · Radius 16px)
                </div>
                <div className="flex items-center gap-3">
                  <Avatar size="sm" initials="S1" hue={145} />
                  <Avatar size="md" initials="LM" hue={230} />
                  <Avatar size="lg" initials="KC" hue={290} />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GROUP 2: INPUTS
         ───────────────────────────────────────────────────────────── */}
      {(activeSubTab === 'all' || activeSubTab === 'inputs') && (
        <Card
          title="GROUP 2: INPUTS"
          subtitle="Input · Select · Textarea · Checkbox with strict Focus Ring outline: 2px solid ladder(n+1)"
          action={<Badge semantic="info">Form Controls</Badge>}
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Node Hostname"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                leftIcon={<Globe className="w-3.5 h-3.5" />}
                helperText="Focus ring: outline 2px solid #0D0E12 (ladder n+1)"
              />

              <Select
                label="Region Cluster"
                value={selectValue}
                onChange={setSelectValue}
                options={[
                  { value: 'eu-central', label: 'eu-central-1 (Frankfurt)', hint: '3ms' },
                  { value: 'eu-west', label: 'eu-west-1 (Ireland)', hint: '7ms' },
                  { value: 'us-east', label: 'us-east-1 (N. Virginia)', hint: '68ms' },
                  { value: 'ap-east', label: 'ap-east-1 (Hong Kong)', hint: '142ms' },
                ]}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea
                label="Cryptographic Public Key"
                rows={3}
                defaultValue="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKbUf87... liminal-core-root"
                helperText="Multi-line textarea on Surface 2 (#0A0B0F)"
              />

              <div className="space-y-3">
                <span className="font-mono text-[11px] uppercase tracking-wider block" style={getTextStyle('tertiary', 1)}>
                  Security Toggles &amp; Checkboxes
                </span>
                <div className="space-y-2.5">
                  <Checkbox
                    checked={checkbox1}
                    onChange={setCheckbox1}
                    label="Strict mTLS Handshake"
                    description="Require bidirectional cert check on every hop"
                  />
                  <Checkbox
                    checked={checkbox2}
                    onChange={setCheckbox2}
                    label="Zero-Knowledge Audit Trail"
                    description="Record proofs into immutable merkle log"
                  />
                  <Checkbox
                    checked={false}
                    onChange={() => {}}
                    disabled
                    label="Quantum Resistance (Enforced)"
                    description="Hardware key locked"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GROUP 3: CONTAINERS
         ───────────────────────────────────────────────────────────── */}
      {(activeSubTab === 'all' || activeSubTab === 'containers') && (
        <Card
          title="GROUP 3: CONTAINERS &amp; OVERLAYS"
          subtitle="Card (S1) · Panel (S2 concentric) · Modal (S5 + E3) · Sheet (S5 Drawer)"
          action={<Badge semantic="info">Spatial Hierarchy</Badge>}
        >
          <div className="space-y-4">
            <Panel parentRadius={24} padding={16} surfaceLevel={2}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold" style={{ color: getTextStyle('primary', 2).color }}>
                    Nested Panel on Surface 2 (#0A0B0F)
                  </div>
                  <div className="text-[11px] mt-0.5" style={getTextStyle('tertiary', 2)}>
                    Concentric Radius Formula: r_inner = max(4, r_outer − padding) = 24 − 16 = 8px. Parallel curves!
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
                    Open Modal (S5)
                  </Button>
                  <Button size="sm" variant="primary" onClick={() => setSheetOpen(true)}>
                    Open Sheet (Drawer)
                  </Button>
                </div>
              </div>
            </Panel>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div
                className="p-4 space-y-2"
                style={{
                  ...getLiminalStyle({ surfaceLevel: 4, isFeatured: true }).style,
                  borderRadius: `${LiminalLayoutEngine.RADIUS.card}px`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#E9B44C]">ELEVATION E2</span>
                  <Badge semantic="warning">Sub-Canvas</Badge>
                </div>
                <div className="font-semibold" style={{ color: getTextStyle('primary', 4).color }}>
                  Surface 4 Featured Card
                </div>
                <p className="text-[11px] leading-relaxed" style={getTextStyle('tertiary', 4)}>
                  Used for high-priority contextual widgets, popovers, and elevated summaries with dual-layer penumbra.
                </p>
              </div>

              <div
                className="p-4 space-y-2"
                style={{
                  ...getLiminalStyle({ surfaceLevel: 2, isContainer: true }).style,
                  borderRadius: `${LiminalLayoutEngine.RADIUS.card}px`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#6EE0B4]">SURFACE 2</span>
                  <Badge semantic="success">Rim 1 Specular</Badge>
                </div>
                <div className="font-semibold" style={{ color: getTextStyle('primary', 2).color }}>
                  Surface 2 Base Panel
                </div>
                <p className="text-[11px] leading-relaxed" style={getTextStyle('tertiary', 2)}>
                  Controls and intermediate groupings live here. ΔL = 0.015 ensures seamless perceptual separation.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GROUP 4: FEEDBACK
         ───────────────────────────────────────────────────────────── */}
      {(activeSubTab === 'all' || activeSubTab === 'feedback') && (
        <Card
          title="GROUP 4: FEEDBACK"
          subtitle="Alert · Toast (E4 Shadow) · Tooltip (Micro S4 Popover)"
          action={<Badge semantic="info">Notification Engine</Badge>}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Alert semantic="success" title="Cluster Consensus Achieved">
                All 16 validator nodes confirmed block #8,941,203 with 0ms clock skew.
              </Alert>
              <Alert semantic="warning" title="Memory Ceiling Nearing Limen">
                Pod memory utilization reached 84% on Frankfurt worker 2.
              </Alert>
              <Alert semantic="danger" title="TLS Handshake Reject">
                Revoked certificate encountered on ingress port 443.
              </Alert>
              <Alert semantic="info" title="Scheduled Maintenance">
                Sub-canvas routing migration will occur on Sunday 03:00 UTC.
              </Alert>
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-xs" style={getTextStyle('secondary', 1)}>Trigger Live Toasts:</span>
                <Button size="sm" variant="secondary" onClick={() => triggerToast('success')}>Success Toast</Button>
                <Button size="sm" variant="secondary" onClick={() => triggerToast('danger')}>Danger Toast</Button>
              </div>

              <div className="flex items-center gap-3">
                <Tooltip content="Surface 4 · Elevation E1 Micro Floating Label">
                  <Button size="sm" variant="ghost" icon={<Info className="w-3.5 h-3.5" />}>
                    Hover For Tooltip
                  </Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GROUP 5: DATA
         ───────────────────────────────────────────────────────────── */}
      {(activeSubTab === 'all' || activeSubTab === 'data') && (
        <Card
          title="GROUP 5: DATA PRESENTATION"
          subtitle="Stat Cards · Monospace Data Table · Linear Progress Bar"
          action={<Badge semantic="info">Telemetry</Badge>}
        >
          <div className="space-y-4">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat
                label="Edge Latency"
                value="4.18 ms"
                change="−1.4ms"
                changeType="positive"
                meta="vs 30d avg"
                icon={<Activity className="w-3.5 h-3.5 text-[#34C08B]" />}
              />
              <Stat
                label="Memory Limen"
                value="68.4%"
                change="+3.2%"
                changeType="negative"
                meta="floor 60%"
                icon={<Cpu className="w-3.5 h-3.5 text-[#E9B44C]" />}
              />
              <Stat
                label="Signatures / Sec"
                value="48.2k"
                change="+12.0%"
                changeType="positive"
                meta="peak load"
                icon={<Key className="w-3.5 h-3.5 text-[#6FA8EC]" />}
              />
            </div>

            {/* Progress Bar with Live Slider */}
            <div className="p-3.5 space-y-2 rounded-xl" style={getLiminalStyle({ surfaceLevel: 2, isContainer: true }).style}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold" style={{ color: getTextStyle('primary', 2).color }}>
                  System Capacity Slider
                </span>
                <span style={getTextStyle('tertiary', 2)}>{progressVal}% Utilization</span>
              </div>
              <Progress value={progressVal} showValue semantic="brand" height={8} />
              <div className="pt-1 flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>
            </div>

            {/* Table */}
            <div className="space-y-1.5">
              <div className="text-[11px] uppercase font-bold tracking-wider" style={getTextStyle('tertiary', 1)}>
                Active Nodes (Monospace Grid with S1/S2 Separators)
              </div>
              <Table
                columns={[
                  { key: 'name', header: 'Node Identifier' },
                  {
                    key: 'status',
                    header: 'Health',
                    render: (item) => (
                      <Badge semantic={item.status === 'Healthy' ? 'success' : 'warning'}>
                        {item.status}
                      </Badge>
                    ),
                  },
                  { key: 'latency', header: 'RTT', align: 'right' },
                  { key: 'load', header: 'CPU Load', align: 'right' },
                ]}
                data={sampleTableData}
                keyExtractor={(item) => item.id}
              />
            </div>
          </div>
        </Card>
      )}

      {/* ─────────────────────────────────────────────────────────────
          GROUP 6: NAVIGATION
         ───────────────────────────────────────────────────────────── */}
      {(activeSubTab === 'all' || activeSubTab === 'nav') && (
        <Card
          title="GROUP 6: NAVIGATION"
          subtitle="Segmented Tabs (S1 Track · S3 Active Segment) · Breadcrumb Trail"
          action={<Badge semantic="info">Spatial Wayfinding</Badge>}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-[11px] uppercase font-bold tracking-wider" style={getTextStyle('tertiary', 1)}>
                Breadcrumb Navigation
              </div>
              <Breadcrumb
                items={[
                  { id: '1', label: 'Cluster Root', onClick: () => {} },
                  { id: '2', label: 'Security Domain', onClick: () => {} },
                  { id: '3', label: 'Cryptographic HSM', active: true },
                ]}
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-white/5">
              <div className="text-[11px] uppercase font-bold tracking-wider" style={getTextStyle('tertiary', 1)}>
                Segmented Controller (Liminal Tabs)
              </div>
              <Tabs
                items={[
                  { id: 'tab1', label: 'Live Telemetry', icon: <Activity className="w-3 h-3" /> },
                  { id: 'tab2', label: 'Security Audit', icon: <Shield className="w-3 h-3" />, badge: <Badge semantic="warning">3</Badge> },
                  { id: 'tab3', label: 'HSM Config', icon: <Sliders className="w-3 h-3" /> },
                ]}
                value="tab1"
                onChange={() => {}}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Floating Modals and Sheets */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Surface 5 Modal Dialog"
        description="Ceiling L 0.203 (#131418) · Rim 3 · Elevation E3 Sub-Canvas Penumbra"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>Confirm Action</Button>
          </>
        }
      >
        <p>
          This modal dialog enforces the physical limit of the dark UI ladder: Surface 5 is the maximum elevated overlay, encased in Rim 3 directional light and anchored by dual-layer ambient + contact sub-canvas shadows.
        </p>
      </Modal>

      <Sheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Surface 5 Bottom Drawer"
        subtitle="Mobile-First Touch Affordance with S3 Action Bar"
        footer={
          <Button variant="primary" fullWidth onClick={() => setSheetOpen(false)}>
            Close Drawer
          </Button>
        }
      >
        <div className="space-y-3">
          <p>
            Designed for 100% responsive fluid mobile interaction. The drag handle at top provides tactile guidance without breaking the clean aesthetic.
          </p>
          <div className="p-3 rounded-lg text-[11px]" style={getLiminalStyle({ surfaceLevel: 2, isContainer: true }).style}>
            Sub-Canvas E3 Anchor: 0 8px 28px rgba(3,4,6,0.44), 0 3px 8px rgba(1,2,3,0.30)
          </div>
        </div>
      </Sheet>

      <Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        semantic={toastSemantic}
        title={toastSemantic === 'success' ? 'Transaction Committed' : 'Handshake Flagged'}
        description="Elevation E4 Sub-Canvas Shadow · Surface 4"
      />
    </div>
  );
}
