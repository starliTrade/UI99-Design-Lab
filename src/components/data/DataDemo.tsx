import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Stat } from './Stat';
import { Table, TableColumn } from './Table';
import { Progress } from './Progress';
import { Avatar } from './Avatar';
import { AvatarGroup } from './AvatarGroup';
import { Card } from '../containers/Card';
import { Badge } from '../atoms/Badge';
import { Button } from '../atoms/Button';
import { Divider } from '../containers/Divider';
import {
  getLiminalStyle,
  getTextStyle,
} from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import {
  Database,
  Users,
  TrendingUp,
  AlertOctagon,
  RefreshCw,
  HardDrive,
  Cpu,
} from 'lucide-react';

export function DataDemo() {
  const [selectedRows, setSelectedRows] = useState<number[]>([1]); // Row index 1 selected by default

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  const containerStyle = getLiminalStyle({ surfaceLevel: 1, isContainer: true }).style;

  // Table Columns & Data
  const tableColumns: TableColumn[] = [
    { key: 'name', title: 'Shard Cluster', align: 'right' },
    { key: 'region', title: 'Region Zone', align: 'right' },
    { key: 'load', title: 'Core Load', align: 'center' },
    { key: 'status', title: 'Telemetry Status', align: 'left' },
  ];

  const tableData = [
    {
      id: 'cluster-01',
      name: 'Cluster-Alpha (H230)',
      region: 'europe-west2-a',
      load: '42.8%',
      status: <Badge semantic="success">Nominal</Badge>,
    },
    {
      id: 'cluster-02',
      name: 'Cluster-Beta (H155)',
      region: 'us-east1-b',
      load: '89.4%',
      status: <Badge semantic="warning">Elevated</Badge>,
    },
    {
      id: 'cluster-03',
      name: 'Cluster-Gamma (H270)',
      region: 'asia-east1-a',
      load: '14.1%',
      status: <Badge semantic="info">Standby</Badge>,
    },
    {
      id: 'cluster-04',
      name: 'Cluster-Delta (H015)',
      region: 'southamerica-east1',
      load: '98.7%',
      status: <Badge semantic="danger">Critical</Badge>,
    },
  ];

  const handleSelectRow = (index: number, selected: boolean) => {
    if (selected) {
      setSelectedRows((prev) => [...prev, index]);
    } else {
      setSelectedRows((prev) => prev.filter((i) => i !== index));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(tableData.map((_, i) => i));
    } else {
      setSelectedRows([]);
    }
  };

  return (
    <div
      style={{
        ...containerStyle,
        borderRadius: `${RADIUS.container}px`,
        padding: `${SPACING[5]}px`,
        boxSizing: 'border-box',
      }}
      className="space-y-6"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between pb-3"
        style={{ borderBottom: `1px solid rgba(255, 255, 255, 0.06)` }}
      >
        <div>
          <h2
            style={{
              fontSize: `${TYPOGRAPHY[4].fs}px`,
              fontWeight: 600,
              color: getTextStyle('primary', 1).color,
              margin: 0,
            }}
          >
            LIMINAL Data Kit · v1.0
          </h2>
          <p
            style={{
              fontSize: `${TYPOGRAPHY[1].fs}px`,
              fontFamily: 'monospace',
              color: getTextStyle('secondary', 1).color,
              marginTop: '4px',
              margin: 0,
            }}
          >
            Stat · Table · Progress · Avatar · AvatarGroup (Strict Optical Calibration)
          </p>
        </div>

        <Badge semantic="success">All Data Atoms Synced</Badge>
      </div>

      {/* 1. STAT CARDS GRID */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: getTextStyle('tertiary', 1).color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: `${SPACING[3]}px`,
          }}
        >
          1. Metric Telemetry Stats (Surface 1 · Rim 1 · Tabular Numeral Display)
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="QUORUM REVENUE"
            value="$1,482,900"
            trend={{ direction: 'up', value: '+14.2%', semantic: 'success' }}
            subtitle="vs. preceding epoch window"
            prefix={<TrendingUp size={14} />}
          />

          <Stat
            label="ACTIVE SESSIONS"
            value="34,821"
            trend={{ direction: 'up', value: '+8.4%', semantic: 'info' }}
            subtitle="TLS 1.3 mutual auth verified"
            prefix={<Users size={14} />}
          />

          <Stat
            label="INGRESS BANDWIDTH"
            value="892.4 MB/s"
            trend={{ direction: 'neutral', value: 'NOMINAL', semantic: 'info' }}
            subtitle="Anycast multi-region peering"
            prefix={<HardDrive size={14} />}
          />

          <Stat
            label="PACKET RETRIES"
            value="0.002%"
            trend={{ direction: 'down', value: '-65.0%', semantic: 'success' }}
            subtitle="Zero jitter edge hop #1"
            prefix={<AlertOctagon size={14} />}
          />
        </div>
      </div>

      <Divider spacing="md" />

      {/* 2. TABLE */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: getTextStyle('tertiary', 1).color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: `${SPACING[3]}px`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>2. Shard Topology Table (Header RimSide · Row Hover S1.5 · Selected S2 + Rim 1)</span>
          <span style={{ color: getTextStyle('quaternary', 1).color }}>
            {selectedRows.length} rows selected
          </span>
        </div>

        <Card padding="sm">
          <Table
            columns={tableColumns}
            data={tableData}
            selectable
            selectedRows={selectedRows}
            onSelectRow={handleSelectRow}
            onSelectAll={handleSelectAll}
            onRowClick={(_, index) => {
              const exists = selectedRows.includes(index);
              handleSelectRow(index, !exists);
            }}
          />
        </Card>
      </div>

      <Divider spacing="md" />

      {/* 3. PROGRESS BARS */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: getTextStyle('tertiary', 1).color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: `${SPACING[3]}px`,
          }}
        >
          3. Linear Progress Gauges (Track S3 · Fill Semantic/Brand · Smooth Width Easing)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card padding="md">
            <div className="space-y-4">
              <Progress
                value={78}
                size="md"
                semantic="success"
                showLabel
                label="Primary Quorum Sync"
              />

              <Progress
                value={45}
                size="md"
                semantic="warning"
                showLabel
                label="Thermal Threshold Limit"
              />
            </div>
          </Card>

          <Card padding="md">
            <div className="space-y-4">
              <Progress
                value={92}
                size="md"
                semantic="danger"
                showLabel
                label="HSM Memory Quota Depletion"
              />

              <Progress
                value={64}
                size="md"
                showLabel
                label="Brand Primary Execution (#E9ECF2)"
              />
            </div>
          </Card>
        </div>
      </div>

      <Divider spacing="md" />

      {/* 4. AVATARS & AVATAR GROUP */}
      <div>
        <div
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: getTextStyle('tertiary', 1).color,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            marginBottom: `${SPACING[3]}px`,
          }}
        >
          4. Avatars &amp; AvatarGroup (Sizes sm/md/lg · Extended Spectrum Fallback · S0 Canvas Border)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Individual Avatars */}
          <Card padding="md">
            <div className="space-y-3">
              <div style={{ fontSize: '12px', color: getTextStyle('tertiary', 1).color }}>
                INDIVIDUAL SIZES (SM 24px · MD 32px · LG 44px)
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Avatar name="Kaelen Vos" size="sm" hue={230} />
                  <span style={{ fontSize: '11px', color: getTextStyle('secondary', 1).color }}>
                    Small (24px)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar name="Mira Rayne" size="md" hue={145} />
                  <span style={{ fontSize: '11px', color: getTextStyle('secondary', 1).color }}>
                    Medium (32px)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Avatar name="Dmitri Vance" size="lg" hue={15} />
                  <span style={{ fontSize: '11px', color: getTextStyle('secondary', 1).color }}>
                    Large (44px)
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* AvatarGroup with Overflow */}
          <Card padding="md">
            <div className="space-y-3">
              <div style={{ fontSize: '12px', color: getTextStyle('tertiary', 1).color }}>
                AVATAR GROUP (5 USERS · MAX 4 · S0 CANVAS CUTOUT)
              </div>

              <div className="flex items-center justify-between">
                <AvatarGroup max={4} size="md">
                  <Avatar name="Alice Chen" hue={230} />
                  <Avatar name="Bob Vance" hue={145} />
                  <Avatar name="Clara O'Connor" hue={75} />
                  <Avatar name="David Lee" hue={290} />
                  <Avatar name="Elena Rostova" hue={350} />
                </AvatarGroup>

                <Button size="sm" variant="ghost">
                  Manage Access
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DataDemo;
