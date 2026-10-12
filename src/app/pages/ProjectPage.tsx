import React, { useState } from 'react';
import { useNavigation } from '../navigation/useNavigation';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { PageSection } from '../../components/layout/PageSection';
import { Grid, GridCol } from '../../components/layout/Grid';
import { Footer } from '../../components/layout/Footer';
import { Topbar } from '../../components/nav/Topbar';
import { Sidebar } from '../../components/nav/Sidebar';
import { NavItem } from '../../components/nav/NavItem';
import { Breadcrumb } from '../../components/nav/Breadcrumb';
import { Tabs } from '../../components/nav/Tabs';
import { Alert } from '../../components/feedback/Alert';
import { Stat } from '../../components/data/Stat';
import { Table, TableColumn } from '../../components/data/Table';
import { Card } from '../../components/containers/Card';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Toggle } from '../../components/atoms/Toggle';
import { Select } from '../../components/inputs/Select';
import { Input } from '../../components/inputs/Input';
import { getTextStyle, BRAND_ALPHA, SURFACE_TINT } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import {
  GitBranch,
  SquaresFour,
  ChartBar,
  Gear,
  Bell,
  MagnifyingGlass,
  CheckCircle,
  FileText,
  SlidersHorizontal,
  Stack,
  ArrowLeft,
} from '@phosphor-icons/react';
import { LiminalIcon } from '../../engine/liminal-icon-engine';
import { resolveBorder } from '../../engine/liminal-surface';

/** A page-level boundary is a hairline on the panel role. */
const pageRim = resolveBorder({ role: 'panel', kind: 'hairline' });

export function ProjectPage({ id }: { id: string }) {
  const { navigate } = useNavigation();
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [quarantineEnabled, setQuarantineEnabled] = useState<boolean>(false);
  const [selectedTaskRows, setSelectedTaskRows] = useState<number[]>([1]);

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const BRAND = LiminalColorEngine.BRAND_PRIMARY;

  const projectTitle = id === 'alpha' ? 'Compute Cluster Alpha' : `Enterprise Project ${id.toUpperCase()}`;

  const breadcrumbItems = [
    { label: 'Home', onClick: () => navigate({ name: 'dashboard' }) },
    { label: 'Projects', onClick: () => navigate({ name: 'dashboard' }) },
    { label: projectTitle, active: true },
  ];

  const taskColumns: TableColumn[] = [
    { key: 'task', title: 'Task Title', align: 'right' },
    { key: 'assignee', title: 'Direct Assignee', align: 'right' },
    { key: 'priority', title: 'Priority', align: 'center' },
    { key: 'state', title: 'Status', align: 'left' },
  ];

  const taskData = [
    {
      id: 'task-1',
      task: 'Upgrade HSM firmware to v2.4',
      assignee: 'Kaelen Vos',
      priority: <Badge semantic="danger">P0 Urgent</Badge>,
      state: 'Completed',
    },
    {
      id: 'task-2',
      task: 'Review root keys in Tokyo enclave',
      assignee: 'Mira Rayne',
      priority: <Badge semantic="warning">P1 High</Badge>,
      state: 'In Progress',
    },
    {
      id: 'task-3',
      task: '40 Gbps synthetic traffic test',
      assignee: 'Chen Wei',
      priority: <Badge semantic="info">P2 Normal</Badge>,
      state: 'Scheduled',
    },
  ];

  return (
    <AppShell
      maxWidth={1280}
      topbar={
        <Topbar
          sticky
          logo={
            <div className="flex items-center gap-2">
              <span
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: `${RADIUS.chip}px`,
                  background: BRAND_ALPHA.subtle,
                  border: `1px solid ${pageRim}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: BRAND.hex,
                }}
              >
                <LiminalIcon icon={Stack} size="sm" weight="light" color={BRAND.hex} />
              </span>
              <span
                style={{
                  fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
                  fontWeight: 600,
                  color: getTextStyle('primary', 1).color,
                }}
              >
                LIMINAL SYSTEM
              </span>
            </div>
          }
          actions={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => navigate({ name: 'dashboard' })}
              >
                <LiminalIcon icon={ArrowLeft} size="xs" weight="light" className="mr-1" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          }
        >
          <NavItem onClick={() => navigate({ name: 'dashboard' })}>Dashboard</NavItem>
          <NavItem active>Projects</NavItem>
          <NavItem onClick={() => navigate({ name: 'loading' })}>Analytics</NavItem>
        </Topbar>
      }
      sidebar={
        <Sidebar width={220} sticky>
          <Sidebar.Section label="Main Menu">
            <NavItem onClick={() => navigate({ name: 'dashboard' })}>
              <LiminalIcon icon={SquaresFour} size="sm" weight="light" />
              <span>Central Dashboard</span>
            </NavItem>
            <NavItem active>
              <LiminalIcon icon={GitBranch} size="sm" weight="light" />
              <span>Projects</span>
            </NavItem>
            <NavItem onClick={() => navigate({ name: 'loading' })}>
              <LiminalIcon icon={ChartBar} size="sm" weight="light" />
              <span>Data Analytics</span>
            </NavItem>
          </Sidebar.Section>

          <Sidebar.Section label="Management">
            <NavItem onClick={() => navigate({ name: '404' })}>
              <LiminalIcon icon={Bell} size="sm" weight="light" />
              <span>System Alerts</span>
            </NavItem>
            <NavItem onClick={() => navigate({ name: 'login' })}>
              <LiminalIcon icon={Gear} size="sm" weight="light" />
              <span>Identity Settings</span>
            </NavItem>
          </Sidebar.Section>
        </Sidebar>
      }
      footer={
        <Footer
          left={
            <span>
              Project: {projectTitle} · Active cluster in East Asia region
            </span>
          }
        >
          <button
            onClick={() => navigate({ name: 'dashboard' })}
            style={{
              background: 'none',
              border: 'none',
              color: getTextStyle('tertiary', 1).color,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate({ name: 'login' })}
            style={{
              background: 'none',
              border: 'none',
              color: getTextStyle('tertiary', 1).color,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Sign Out
          </button>
        </Footer>
      }
    >
      {/* 1. Page Header */}
      <PageHeader
        breadcrumb={<Breadcrumb items={breadcrumbItems} />}
        title={projectTitle}
        subtitle="Shard configuration, hardware keys, and enclave deployment status"
        actions={
          <>
            <Button size="sm" variant="secondary">
              <LiminalIcon icon={FileText} size="xs" weight="light" className="mr-1" />
              <span>Status Report</span>
            </Button>
            <Button size="sm" variant="ghost">
              Edit Specifications
            </Button>
          </>
        }
      />

      {/* 2. Project Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="tasks">Tasks & Activities</Tabs.Tab>
        <Tabs.Tab value="members">Team Members</Tabs.Tab>
        <Tabs.Tab value="files">Files & Keys</Tabs.Tab>
        <Tabs.Tab value="settings">Shard Settings</Tabs.Tab>
      </Tabs>

      {/* 3. Inline Mist Alert (closable) */}
      <Alert
        semantic="success"
        title="Current sprint completed successfully"
        closable
      >
        All 8 compute nodes with joint signature upgraded to the next phase without any desynchronization errors.
      </Alert>

      {/* 4. Telemetry Stats Grid */}
      <PageSection title="Shard Operational Metrics">
        <Grid gap="md">
          <GridCol col={3} md={6} sm={12}>
            <Stat label="Active Members Count" value="12 Engineers" subtitle="Root access verified" />
          </GridCol>
          <GridCol col={3} md={6} sm={12}>
            <Stat label="Error Rate" value="0.001%" trend={{ direction: 'down', value: '-90%', semantic: 'success' }} subtitle="Stability threshold" />
          </GridCol>
          <GridCol col={3} md={6} sm={12}>
            <Stat label="Compute Load" value="42.8%" subtitle="Balanced distribution" />
          </GridCol>
          <GridCol col={3} md={6} sm={12}>
            <Stat label="Uptime" value="99.99%" trend={{ direction: 'up', value: 'SLA', semantic: 'info' }} subtitle="In the last 30 days" />
          </GridCol>
        </Grid>
      </PageSection>

      {/* 5. Tasks Table with Filters */}
      <PageSection
        title="Inspection & Development Activities"
        subtitle="List of current enclave engineer tasks"
        divider
        actions={
          <div style={{ width: '180px' }}>
            <Select
              value={filterRegion}
              onChange={setFilterRegion}
              options={[
                { value: 'all', label: 'All Regions' },
                { value: 'tokyo', label: 'Tokyo Enclave' },
                { value: 'frankfurt', label: 'Frankfurt Enclave' },
              ]}
            />
          </div>
        }
      >
        <Card padding="sm">
          <Table
            columns={taskColumns}
            data={taskData}
            selectable
            selectedRows={selectedTaskRows}
            onSelectRow={(idx, sel) => {
              if (sel) setSelectedTaskRows((p) => [...p, idx]);
              else setSelectedTaskRows((p) => p.filter((i) => i !== idx));
            }}
          />
        </Card>
      </PageSection>

      {/* 6. Settings Controls from Atoms */}
      <PageSection
        title="Real-time Enclave Settings"
        subtitle="Manage auto-sync status and security quarantine"
        divider
      >
        <Card padding="md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: getTextStyle('primary', 1).color }}>
                  Telemetry Auto-Sync
                </div>
                <div style={{ fontSize: '11px', color: getTextStyle('secondary', 1).color, marginTop: '2px' }}>
                  Send load cell data to core every 5s
                </div>
              </div>
              <Toggle checked={autoSync} onChange={setAutoSync} />
            </div>

            <div style={{ height: '1px', background: SURFACE_TINT.subtle }} />

            <div className="flex items-center justify-between">
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: getTextStyle('primary', 1).color }}>
                  Auto-Quarantine on Voltage Fluctuation
                </div>
                <div style={{ fontSize: '11px', color: getTextStyle('secondary', 1).color, marginTop: '2px' }}>
                  Block input on suspected hardware tampering
                </div>
              </div>
              <Toggle checked={quarantineEnabled} onChange={setQuarantineEnabled} />
            </div>
          </div>
        </Card>
      </PageSection>
    </AppShell>
  );
}

export default ProjectPage;
