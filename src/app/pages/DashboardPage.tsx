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
import { Stat } from '../../components/data/Stat';
import { Table, TableColumn } from '../../components/data/Table';
import { Progress } from '../../components/data/Progress';
import { Avatar } from '../../components/data/Avatar';
import { AvatarGroup } from '../../components/data/AvatarGroup';
import { Card } from '../../components/containers/Card';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Mist } from '../../components/atoms/Mist';
import { Input } from '../../components/inputs/Input';
import { getTextStyle, BRAND_ALPHA, SURFACE_TINT } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import {
  SquaresFour,
  GitBranch,
  ChartBar,
  Gear,
  Bell,
  MagnifyingGlass,
  Plus,
  ArrowUpRight,
  Shield,
  Stack,
  Sparkle,
} from '@phosphor-icons/react';
import { LiminalIcon } from '../../engine/liminal-icon-engine';

export function DashboardPage() {
  const { navigate } = useNavigation();
  const [selectedRows, setSelectedRows] = useState<number[]>([0]);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const BRAND = LiminalColorEngine.BRAND_PRIMARY;

  const breadcrumbItems = [
    { label: 'Home', onClick: () => navigate({ name: 'dashboard' }) },
    { label: 'Dashboard', active: true },
  ];

  const tableColumns: TableColumn[] = [
    { key: 'name', title: 'Project Title', align: 'right' },
    { key: 'tier', title: 'Security Tier', align: 'right' },
    { key: 'progress', title: 'Progress Status', align: 'center' },
    { key: 'status', title: 'Deployment Status', align: 'left' },
  ];

  const tableData = [
    {
      id: 'proj-alpha',
      name: 'Alpha Cluster Redesign',
      tier: 'HSM Enclave Level 4',
      progress: '84%',
      status: <Badge semantic="success">Nominal</Badge>,
    },
    {
      id: 'proj-beta',
      name: 'Distributed Database Migration',
      tier: 'PostgreSQL Shard Cluster',
      progress: '62%',
      status: <Badge semantic="info">Syncing</Badge>,
    },
    {
      id: 'proj-gamma',
      name: 'TLS 1.3 Protocol Security Audit',
      tier: 'Zero-Trust Gateway',
      progress: '98%',
      status: <Badge semantic="success">Verified</Badge>,
    },
    {
      id: 'proj-delta',
      name: 'Network Load Cell Optimization',
      tier: 'Anycast Transit',
      progress: '29%',
      status: <Badge semantic="warning">Elevated</Badge>,
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
                  border: '1px solid rgba(233, 236, 242, 0.16)',
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
                  fontSize: `${TYPOGRAPHY[2].fs}px`,
                  fontWeight: 600,
                  color: getTextStyle('primary', 1).color,
                }}
              >
                LIMINAL SYSTEM
              </span>
            </div>
          }
          actions={
            <div className="flex items-center gap-3">
              <div style={{ width: '180px' }} className="hidden sm:block">
                <Input
                  type="search"
                  placeholder="Search shards..."
                  prefix={<LiminalIcon icon={MagnifyingGlass} size="xs" weight="light" />}
                />
              </div>

              <button
                type="button"
                onClick={() => navigate({ name: 'login' })}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="User Profile"
              >
                <Avatar name="Kaelen Vos" size="sm" hue={230} />
              </button>
            </div>
          }
        >
          <NavItem active onClick={() => navigate({ name: 'dashboard' })}>
            Dashboard
          </NavItem>
          <NavItem onClick={() => navigate({ name: 'project', id: 'alpha' })}>
            Projects
          </NavItem>
          <NavItem onClick={() => navigate({ name: 'loading' })}>
            Analytics
          </NavItem>
        </Topbar>
      }
      sidebar={
        <Sidebar width={220} sticky>
          <Sidebar.Section label="Main Menu">
            <NavItem active onClick={() => navigate({ name: 'dashboard' })}>
              <LiminalIcon icon={SquaresFour} size="sm" weight="light" />
              <span>Central Dashboard</span>
            </NavItem>
            <NavItem onClick={() => navigate({ name: 'project', id: 'alpha' })}>
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
              Liminal Operations Console v1.0 · All metrics synced in real time
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
            onClick={() => navigate({ name: 'project', id: 'alpha' })}
            style={{
              background: 'none',
              border: 'none',
              color: getTextStyle('tertiary', 1).color,
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Project Alpha
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
        title="System Overview"
        subtitle="Real-time cloud cluster metrics and telemetry with perceptual separation"
        actions={
          /* The Single Allowed Hero Mist in the entire App */
          <Mist
            as="button"
            tier="hero"
            light={BRAND.hex}
            onClick={() => navigate({ name: 'project', id: 'alpha' })}
          >
            <LiminalIcon icon={Plus} size="xs" weight="light" />
            <span>New Project</span>
          </Mist>
        }
      />

      {/* 2. Key Metrics Section */}
      <PageSection
        title="Key Telemetry Statistics"
        subtitle="Active node performance and compute resources"
      >
        <Grid gap="md">
          <GridCol col={3} md={6} sm={12}>
            <Stat
              label="Signed Transactions"
              value="1,482,900"
              trend={{ direction: 'up', value: '+14.2%', semantic: 'success' }}
              subtitle="Compared to previous period"
            />
          </GridCol>

          <GridCol col={3} md={6} sm={12}>
            <Stat
              label="Online Clusters"
              value="144 / 144"
              trend={{ direction: 'up', value: '100%', semantic: 'info' }}
              subtitle="Optimal stability state"
            />
          </GridCol>

          <GridCol col={3} md={6} sm={12}>
            <Stat
              label="Network Latency Rate"
              value="2.4 ms"
              trend={{ direction: 'down', value: '-18%', semantic: 'success' }}
              subtitle="Regional internal traffic"
            />
          </GridCol>

          <GridCol col={3} md={6} sm={12}>
            <Stat
              label="Enclave Memory Usage"
              value="54.2%"
              trend={{ direction: 'neutral', value: 'Normal', semantic: 'info' }}
              subtitle="Free storage space"
            />
          </GridCol>
        </Grid>
      </PageSection>

      {/* 3. Recent Projects Section */}
      <PageSection
        title="Recent Projects"
        subtitle="List of active infrastructure repositories and deployments"
        divider
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate({ name: 'project', id: 'alpha' })}
          >
            <span>View Alpha Details</span>
            <LiminalIcon icon={ArrowUpRight} size="xs" weight="light" className="mr-1" />
          </Button>
        }
      >
        <Card padding="sm">
          <Table
            columns={tableColumns}
            data={tableData}
            selectable
            selectedRows={selectedRows}
            onSelectRow={(idx, sel) => {
              if (sel) setSelectedRows((p) => [...p, idx]);
              else setSelectedRows((p) => p.filter((i) => i !== idx));
            }}
            onSelectAll={(all) => {
              setSelectedRows(all ? tableData.map((_, i) => i) : []);
            }}
            onRowClick={(row) => {
              if (row.id === 'proj-alpha') {
                navigate({ name: 'project', id: 'alpha' });
              }
            }}
          />
        </Card>
      </PageSection>

      {/* 4. Team & Progress Section */}
      <PageSection
        title="Development Team & Sprint Status"
        subtitle="Human resource allocation and operational phase progress"
        divider
      >
        <Grid gap="lg">
          <GridCol col={8} md={12} sm={12}>
            <Card padding="md">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: getTextStyle('primary', 1).color }}>
                      Liminal Core Architecture Team
                    </h4>
                    <p style={{ margin: 0, fontSize: '11px', color: getTextStyle('secondary', 1).color, marginTop: '2px' }}>
                      5 active senior engineers in this cluster
                    </p>
                  </div>

                  <AvatarGroup max={4} size="md">
                    <Avatar name="Kaelen Vos" hue={230} />
                    <Avatar name="Mira Rayne" hue={145} />
                    <Avatar name="Dmitri Vance" hue={15} />
                    <Avatar name="Elena Rostova" hue={290} />
                    <Avatar name="Chen Wei" hue={75} />
                  </AvatarGroup>
                </div>

                <div className="space-y-3 pt-2">
                  <Progress
                    value={84}
                    semantic="success"
                    showLabel
                    label="Migration to Zero-Shimmer Architecture"
                  />
                  <Progress
                    value={68}
                    semantic="info"
                    showLabel
                    label="S0..S5 Tonal Ladder Metrics Sync"
                  />
                  <Progress
                    value={42}
                    semantic="warning"
                    showLabel
                    label="HSM Load Testing Implementation"
                  />
                </div>
              </div>
            </Card>
          </GridCol>

          <GridCol col={4} md={12} sm={12}>
            <Card padding="md">
              <div className="space-y-3">
                <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: getTextStyle('primary', 1).color }}>
                  Quick Navigation Guide
                </h4>

                <div className="space-y-2 text-xs">
                  <button
                    onClick={() => navigate({ name: 'project', id: 'alpha' })}
                    className="w-full p-2 text-left rounded-md transition-all cursor-pointer flex items-center justify-between"
                    style={{
                      background: SURFACE_TINT.subtle,
                      color: getTextStyle('primary', 1).color,
                    }}
                  >
                    <span>Project Alpha Page</span>
                    <LiminalIcon icon={ArrowUpRight} size="xs" weight="light" />
                  </button>

                  <button
                    onClick={() => navigate({ name: 'loading' })}
                    className="w-full p-2 text-left rounded-md transition-all cursor-pointer flex items-center justify-between"
                    style={{
                      background: SURFACE_TINT.subtle,
                      color: getTextStyle('primary', 1).color,
                    }}
                  >
                    <span>Loading Page Test</span>
                    <LiminalIcon icon={ArrowUpRight} size="xs" weight="light" />
                  </button>

                  <button
                    onClick={() => navigate({ name: '404' })}
                    className="w-full p-2 text-left rounded-md transition-all cursor-pointer flex items-center justify-between"
                    style={{
                      background: SURFACE_TINT.subtle,
                      color: getTextStyle('primary', 1).color,
                    }}
                  >
                    <span>404 Page Test</span>
                    <LiminalIcon icon={ArrowUpRight} size="xs" weight="light" />
                  </button>
                </div>
              </div>
            </Card>
          </GridCol>
        </Grid>
      </PageSection>
    </AppShell>
  );
}

export default DashboardPage;
