import React from 'react';
import { AppShell } from './AppShell';
import { PageHeader } from './PageHeader';
import { PageSection } from './PageSection';
import { Grid, GridCol } from './Grid';
import { Footer } from './Footer';
import { Breadcrumb } from '../nav/Breadcrumb';
import { Topbar } from '../nav/Topbar';
import { Sidebar } from '../nav/Sidebar';
import { NavItem } from '../nav/NavItem';
import { Card } from '../containers/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { getTextStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import {
  Layers,
  LayoutGrid,
  Columns,
  Maximize2,
  Share2,
  Server,
  Activity,
  Shield,
  Compass,
  DownloadCloud,
} from 'lucide-react';

export function LayoutDemo() {
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const breadcrumbItems = [
    { label: 'Infrastructure', href: '#infra' },
    { label: 'Spatial Architecture', href: '#spatial' },
    { label: '12-Column Blueprint', active: true },
  ];

  // Helper cell for grid demonstrations
  const DemoCell = ({ label, span }: { label: string; span: string }) => (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: `${RADIUS[8]}px`,
        padding: `${SPACING[3]}px`,
        textAlign: 'center',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: getTextStyle('secondary', 1).color,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '48px',
        boxSizing: 'border-box',
      }}
    >
      <span style={{ fontWeight: 600, color: getTextStyle('primary', 1).color }}>
        {label}
      </span>
      <span style={{ fontSize: '10px', color: getTextStyle('quaternary', 1).color }}>
        {span}
      </span>
    </div>
  );

  return (
    <div
      style={{
        background: '#060709', // Canvas #060709
        borderRadius: `${RADIUS.container}px`,
        overflow: 'hidden',
        boxSizing: 'border-box',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <AppShell
        maxWidth={1200}
        topbar={
          <Topbar
            sticky={false}
            logo={
              <div className="flex items-center gap-2">
                <span
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: `${RADIUS.chip}px`,
                    background: 'rgba(233, 236, 242, 0.08)',
                    border: '1px solid rgba(233, 236, 242, 0.16)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: LiminalColorEngine.BRAND_PRIMARY.hex,
                  }}
                >
                  <Layers size={14} />
                </span>
                <span
                  style={{
                    fontSize: `${TYPOGRAPHY[2].fs}px`,
                    fontWeight: 600,
                    color: getTextStyle('primary', 1).color,
                  }}
                >
                  LIMINAL LAYOUT
                </span>
                <Badge semantic="info">Spatial Shell</Badge>
              </div>
            }
            actions={
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary">
                  <Share2 size={13} className="mr-1" />
                  Share Plan
                </Button>
                <Button size="sm" variant="primary">
                  <DownloadCloud size={13} className="mr-1" />
                  Export Blueprint
                </Button>
              </div>
            }
          >
            <NavItem active>Blueprint</NavItem>
            <NavItem>Topology</NavItem>
            <NavItem>Breakpoints</NavItem>
          </Topbar>
        }
        sidebar={
          <Sidebar width={220} sticky={false}>
            <Sidebar.Section label="Spatial Geometry">
              <NavItem active>
                <LayoutGrid size={14} />
                <span>12-Col Grid</span>
              </NavItem>
              <NavItem>
                <Columns size={14} />
                <span>Responsive Rails</span>
              </NavItem>
              <NavItem>
                <Server size={14} />
                <span>Node Enclaves</span>
              </NavItem>
            </Sidebar.Section>

            <Sidebar.Section label="Landmarks">
              <NavItem>
                <Shield size={14} />
                <span>AppShell Body</span>
              </NavItem>
              <NavItem>
                <Activity size={14} />
                <span>Sticky Rails</span>
              </NavItem>
            </Sidebar.Section>
          </Sidebar>
        }
        footer={
          <Footer
            left={
              <span>
                LIMINAL v1.0 · Strict Neutral Layout · Zero Shadows · Zero Glass in Layout
              </span>
            }
          >
            <a href="#docs" style={{ color: getTextStyle('tertiary', 1).color, textDecoration: 'none' }}>
              Guidelines
            </a>
            <a href="#grid" style={{ color: getTextStyle('tertiary', 1).color, textDecoration: 'none' }}>
              12-Col Engine
            </a>
            <a href="#landmarks" style={{ color: getTextStyle('tertiary', 1).color, textDecoration: 'none' }}>
              Landmarks
            </a>
          </Footer>
        }
      >
        {/* 1. PAGE HEADER */}
        <PageHeader
          breadcrumb={<Breadcrumb items={breadcrumbItems} />}
          title="Cluster Topology Matrix"
          subtitle="Spatial orchestration of multi-tier hardware enclaves with 12-column responsive grid architecture."
          actions={
            <>
              <Button variant="secondary" size="sm">
                <Maximize2 size={13} className="mr-1" />
                Fullscreen View
              </Button>
              <Button variant="primary" size="sm">
                Provision Enclave
              </Button>
            </>
          }
        />

        {/* 2. SECTION 1: OVERVIEW METRICS */}
        <PageSection
          title="Overview Telemetry"
          subtitle="Core metrics across geographic zones"
          actions={
            <Badge semantic="success">Quorum 100% Synced</Badge>
          }
        >
          <Grid gap="md">
            <GridCol col={3} md={6} sm={12}>
              <Card title="Ingress Rate" padding="md">
                <div style={{ fontSize: '23px', fontWeight: 600, color: getTextStyle('primary', 1).color }}>
                  842.1 MB/s
                </div>
                <div style={{ fontSize: '11px', color: SEMANTICS.SUCCESS.text, marginTop: '4px' }}>
                  +14.2% versus epoch
                </div>
              </Card>
            </GridCol>

            <GridCol col={3} md={6} sm={12}>
              <Card title="Active Shards" padding="md">
                <div style={{ fontSize: '23px', fontWeight: 600, color: getTextStyle('primary', 1).color }}>
                  144 / 144
                </div>
                <div style={{ fontSize: '11px', color: getTextStyle('secondary', 1).color, marginTop: '4px' }}>
                  Zero partition detected
                </div>
              </Card>
            </GridCol>

            <GridCol col={3} md={6} sm={12}>
              <Card title="Transit Roundtrip" padding="md">
                <div style={{ fontSize: '23px', fontWeight: 600, color: SEMANTICS.SUCCESS.text }}>
                  3.2 ms
                </div>
                <div style={{ fontSize: '11px', color: getTextStyle('tertiary', 1).color, marginTop: '4px' }}>
                  Direct BGP edge peer
                </div>
              </Card>
            </GridCol>

            <GridCol col={3} md={6} sm={12}>
              <Card title="Memory Margin" padding="md">
                <div style={{ fontSize: '23px', fontWeight: 600, color: getTextStyle('primary', 1).color }}>
                  68.4%
                </div>
                <div style={{ fontSize: '11px', color: getTextStyle('secondary', 1).color, marginTop: '4px' }}>
                  Stable headroom reserved
                </div>
              </Card>
            </GridCol>
          </Grid>
        </PageSection>

        {/* 3. SECTION 2: 12-COLUMN GRID BENCH */}
        <PageSection
          title="12-Column Responsive Bench"
          subtitle="Span distribution: 12 · 6+6 · 4+4+4 · 3×4 · 8+4"
          divider
        >
          <div className="space-y-3">
            {/* Row 1: Span 12 */}
            <Grid gap="sm">
              <GridCol col={12}>
                <DemoCell label="Full Span (col=12)" span="12 columns (100% width)" />
              </GridCol>
            </Grid>

            {/* Row 2: Span 6 + 6 */}
            <Grid gap="sm">
              <GridCol col={6} md={6} sm={12}>
                <DemoCell label="Halves A (col=6)" span="Tablet: col=6 | Mobile: col=12" />
              </GridCol>
              <GridCol col={6} md={6} sm={12}>
                <DemoCell label="Halves B (col=6)" span="Tablet: col=6 | Mobile: col=12" />
              </GridCol>
            </Grid>

            {/* Row 3: Span 4 + 4 + 4 */}
            <Grid gap="sm">
              <GridCol col={4} md={6} sm={12}>
                <DemoCell label="Thirds A (col=4)" span="Tablet: col=6 | Mobile: col=12" />
              </GridCol>
              <GridCol col={4} md={6} sm={12}>
                <DemoCell label="Thirds B (col=4)" span="Tablet: col=6 | Mobile: col=12" />
              </GridCol>
              <GridCol col={4} md={12} sm={12}>
                <DemoCell label="Thirds C (col=4)" span="Tablet: col=12 | Mobile: col=12" />
              </GridCol>
            </Grid>

            {/* Row 4: Span 3 + 3 + 3 + 3 */}
            <Grid gap="sm">
              <GridCol col={3} md={6} sm={12}>
                <DemoCell label="Quarters 1 (col=3)" span="col=3" />
              </GridCol>
              <GridCol col={3} md={6} sm={12}>
                <DemoCell label="Quarters 2 (col=3)" span="col=3" />
              </GridCol>
              <GridCol col={3} md={6} sm={12}>
                <DemoCell label="Quarters 3 (col=3)" span="col=3" />
              </GridCol>
              <GridCol col={3} md={6} sm={12}>
                <DemoCell label="Quarters 4 (col=3)" span="col=3" />
              </GridCol>
            </Grid>

            {/* Row 5: Span 8 + 4 */}
            <Grid gap="sm">
              <GridCol col={8} md={8} sm={12}>
                <DemoCell label="Asymmetric Primary (col=8)" span="Desktop: 8 cols | Mobile: 12 cols" />
              </GridCol>
              <GridCol col={4} md={4} sm={12}>
                <DemoCell label="Asymmetric Aside (col=4)" span="Desktop: 4 cols | Mobile: 12 cols" />
              </GridCol>
            </Grid>
          </div>
        </PageSection>

        {/* 4. SECTION 3: HYBRID SECTION (COL 8 + COL 4) */}
        <PageSection
          title="Hybrid Composition"
          subtitle="Primary content stream paired with secondary telemetry rail"
          divider
        >
          <Grid gap="lg">
            <GridCol col={8} md={12} sm={12}>
              <Card title="Primary Workload Enclave (col=8)" padding="md">
                <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: getTextStyle('secondary', 1).color }}>
                  The 8-column main region houses high-density transactional logs, cryptographic HSM keys,
                  and deep inspection feeds. Governed by the strict neutral ladder, no colored rims or shadows
                  are permitted in this spatial layer.
                </p>
                <div className="pt-4 flex items-center gap-3">
                  <Button variant="primary" size="sm">
                    Inspect Trace
                  </Button>
                  <Button variant="ghost" size="sm">
                    Re-route Shards
                  </Button>
                </div>
              </Card>
            </GridCol>

            <GridCol col={4} md={12} sm={12}>
              <Card title="Secondary Rail (col=4)" padding="md">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span style={{ color: getTextStyle('tertiary', 1).color }}>HSM Status</span>
                    <span style={{ color: SEMANTICS.SUCCESS.text, fontWeight: 600 }}>ARMED</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: getTextStyle('tertiary', 1).color }}>Entropy Pool</span>
                    <span style={{ color: getTextStyle('primary', 1).color }}>99.9%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span style={{ color: getTextStyle('tertiary', 1).color }}>Replication</span>
                    <span style={{ color: getTextStyle('secondary', 1).color }}>Active</span>
                  </div>
                </div>
              </Card>
            </GridCol>
          </Grid>
        </PageSection>
      </AppShell>
    </div>
  );
}

export default LayoutDemo;
