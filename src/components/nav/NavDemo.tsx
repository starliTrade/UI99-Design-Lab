import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { NavItem } from './NavItem';
import { Tabs } from './Tabs';
import { Breadcrumb } from './Breadcrumb';
import { Card } from '../containers/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Input } from '../inputs/Input';
import {
  getTextStyle,
  getLiminalStyle,
} from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import {
  Compass,
  LayoutGrid,
  Shield,
  Activity,
  Server,
  Settings,
  Search,
  ExternalLink,
  Cpu,
  Radio,
  Wifi,
} from 'lucide-react';

export function NavDemo() {
  const [activeNav, setActiveNav] = useState<string>('gateways');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchVal, setSearchVal] = useState<string>('');

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const containerStyle = getLiminalStyle({ surfaceLevel: 1, isContainer: true }).style;

  const breadcrumbItems = [
    { label: 'Infrastructure', href: '#infra' },
    { label: 'Edge Gateways', href: '#gateways' },
    { label: 'Cluster Alpha (H230)', active: true },
  ];

  return (
    <div
      style={{
        ...containerStyle,
        borderRadius: `${RADIUS.container}px`,
        padding: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
      className="space-y-0"
    >
      {/* 1. TOPBAR */}
      <Topbar
        sticky={false}
        logo={
          <div className="flex items-center gap-2">
            <span
              style={{
                width: '28px',
                height: '28px',
                borderRadius: `${RADIUS.chip}px`,
                background: 'rgba(233, 236, 242, 0.10)',
                border: '1px solid rgba(233, 236, 242, 0.22)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: LiminalColorEngine.BRAND_PRIMARY.hex,
              }}
            >
              <Compass size={16} />
            </span>
            <span
              style={{
                fontSize: `${TYPOGRAPHY[3].fs}px`,
                fontWeight: 600,
                color: getTextStyle('primary', 1).color,
                letterSpacing: '-0.01em',
              }}
            >
              LIMINAL NAV
            </span>
            <Badge semantic="info">v1.0</Badge>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <div style={{ width: '180px' }} className="hidden sm:block">
              <Input
                type="search"
                placeholder="Quick jump..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                prefix={<Search size={14} />}
              />
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: getTextStyle('primary', 1).color,
              }}
            >
              L8
            </div>
            <Button size="sm" variant="primary">
              Deploy Route
            </Button>
          </div>
        }
      >
        <NavItem active={activeNav === 'gateways'} onClick={() => setActiveNav('gateways')}>
          Gateways
        </NavItem>
        <NavItem active={activeNav === 'security'} onClick={() => setActiveNav('security')}>
          Perimeters
        </NavItem>
        <NavItem active={activeNav === 'telemetry'} onClick={() => setActiveNav('telemetry')}>
          Telemetry
        </NavItem>
        <NavItem active={activeNav === 'system'} onClick={() => setActiveNav('system')}>
          Settings
        </NavItem>
      </Topbar>

      {/* 2. BODY LAYOUT: SIDEBAR + MAIN AREA */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: `${SPACING[5]}px`,
          padding: `${SPACING[5]}px`,
          boxSizing: 'border-box',
          minHeight: '480px',
        }}
        className="flex-col md:flex-row"
      >
        {/* SIDEBAR */}
        <Sidebar width={230} sticky={false}>
          <Sidebar.Section label="Topology Nodes">
            <NavItem
              active={activeNav === 'gateways'}
              onClick={() => setActiveNav('gateways')}
            >
              <LayoutGrid size={15} />
              <span>Gateway Clusters</span>
            </NavItem>

            <NavItem
              active={activeNav === 'security'}
              onClick={() => setActiveNav('security')}
            >
              <Shield size={15} />
              <span>Security Shards</span>
            </NavItem>

            <NavItem
              active={activeNav === 'telemetry'}
              onClick={() => setActiveNav('telemetry')}
            >
              <Activity size={15} />
              <span>Telemetry Streams</span>
            </NavItem>
          </Sidebar.Section>

          <Sidebar.Section label="Node Configuration">
            <NavItem
              active={activeNav === 'servers'}
              onClick={() => setActiveNav('servers')}
            >
              <Server size={15} />
              <span>Hardware Root</span>
            </NavItem>

            <NavItem
              active={activeNav === 'system'}
              onClick={() => setActiveNav('system')}
            >
              <Settings size={15} />
              <span>System Preferences</span>
            </NavItem>

            <NavItem disabled>
              <ExternalLink size={15} />
              <span>Audit Vault (Offline)</span>
            </NavItem>
          </Sidebar.Section>
        </Sidebar>

        {/* MAIN AREA */}
        <div style={{ flex: 1, minWidth: 0 }} className="space-y-4">
          {/* Breadcrumb row */}
          <div className="flex items-center justify-between pb-1">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center gap-2">
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: SEMANTICS.SUCCESS.solid,
                }}
              />
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: SEMANTICS.SUCCESS.text,
                }}
              >
                QUORUM SYNCHRONIZED
              </span>
            </div>
          </div>

          {/* Page Title & Subtitle */}
          <div>
            <h1
              style={{
                fontSize: `${TYPOGRAPHY[5].fs}px`,
                fontWeight: 600,
                color: getTextStyle('primary', 1).color,
                margin: 0,
              }}
            >
              Cluster Alpha Operations
            </h1>
            <p
              style={{
                fontSize: `${TYPOGRAPHY[2].fs}px`,
                color: getTextStyle('secondary', 1).color,
                marginTop: '4px',
                margin: 0,
              }}
            >
              Realtime ingress telemetry with dual-penumbra tabs and directional illumination.
            </p>
          </div>

          {/* TABS (Surface 1 container with Surface 3 Active + Micro E1 Shadow) */}
          <div className="pt-1">
            <Tabs value={activeTab} onChange={setActiveTab}>
              <Tabs.Tab value="overview">Overview Matrix</Tabs.Tab>
              <Tabs.Tab value="listeners">Active Listeners</Tabs.Tab>
              <Tabs.Tab value="certificates">TLS Certificates</Tabs.Tab>
              <Tabs.Tab value="quarantine" disabled>Quarantine Shard</Tabs.Tab>
            </Tabs>
          </div>

          {/* CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <Card title="Ingress Rate" padding="md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '11px', color: getTextStyle('tertiary', 1).color }}>
                    PEAK THROUGHPUT
                  </span>
                  <Wifi size={14} style={{ color: SEMANTICS.INFO.text }} />
                </div>
                <div
                  style={{
                    fontSize: '23px',
                    fontWeight: 600,
                    color: getTextStyle('primary', 1).color,
                  }}
                >
                  842.1 MB/s
                </div>
                <div style={{ fontSize: '11px', color: SEMANTICS.SUCCESS.text }}>
                  +14.2% versus baseline
                </div>
              </div>
            </Card>

            <Card title="Edge Microcode" padding="md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '11px', color: getTextStyle('tertiary', 1).color }}>
                    ACTIVE KERNEL
                  </span>
                  <Cpu size={14} style={{ color: LiminalColorEngine.BRAND_PRIMARY.hex }} />
                </div>
                <div
                  style={{
                    fontSize: '23px',
                    fontWeight: 600,
                    color: getTextStyle('primary', 1).color,
                  }}
                >
                  v4.19-lim
                </div>
                <div style={{ fontSize: '11px', color: getTextStyle('tertiary', 1).color }}>
                  Zero page faults detected
                </div>
              </div>
            </Card>

            <Card title="Transport Anycast" padding="md">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: '11px', color: getTextStyle('tertiary', 1).color }}>
                    SYNCHRONIZATION
                  </span>
                  <Radio size={14} style={{ color: SEMANTICS.SUCCESS.solid }} />
                </div>
                <div
                  style={{
                    fontSize: '23px',
                    fontWeight: 600,
                    color: SEMANTICS.SUCCESS.text,
                  }}
                >
                  3.2 ms
                </div>
                <div style={{ fontSize: '11px', color: getTextStyle('quaternary', 1).color }}>
                  Direct BGP peer established
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavDemo;
