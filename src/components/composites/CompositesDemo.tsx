import React, { useState } from 'react';
import { EmptyState } from './EmptyState';
import { ErrorPage } from './ErrorPage';
import { Skeleton } from './Skeleton';
import { FormLayout } from './FormLayout';
import { Card } from '../containers/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Input } from '../inputs/Input';
import { Divider } from '../containers/Divider';
import { getTextStyle, getLiminalStyle } from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import {
  Inbox,
  Plus,
  RefreshCw,
  FolderOpen,
  KeyRound,
  ShieldCheck,
  User,
  Mail,
  Lock,
} from 'lucide-react';

export function CompositesDemo() {
  const [formSaved, setFormSaved] = useState<boolean>(false);
  const [errorSimulated, setErrorSimulated] = useState<boolean>(false);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  const containerStyle = getLiminalStyle({ surfaceLevel: 1, isContainer: true }).style;

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
            LIMINAL Composites Kit · v1.0
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
            EmptyState (Inverted Well) · ErrorPage (Calm Dignity) · Skeleton (S2/S2.5 Pulse) · FormLayout (Rhythm)
          </p>
        </div>

        <Badge semantic="info">Human States Handled</Badge>
      </div>

      {/* 1. EMPTY STATE DEMO */}
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
          1. Empty State (Inverted Concave Rim Well · Zero Dead Void · Expectant Posture)
        </div>

        <Card padding="lg">
          <EmptyState
            icon={<FolderOpen size={24} />}
            title="No Cryptographic Enclaves Provisioned"
            description="Your cluster currently has zero hardware security modules attached. Provision your primary enclave to begin signing ingress transactions."
            actions={
              <>
                <Button variant="primary" size="sm">
                  <Plus size={14} className="mr-1" />
                  Provision Enclave
                </Button>
                <Button variant="ghost" size="sm">
                  Browse Architecture Docs
                </Button>
              </>
            }
          />
        </Card>
      </div>

      <Divider spacing="md" />

      {/* 2. ERROR PAGE DEMO */}
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
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>2. Error Page (Quaternary Code · 16px Danger Accent · No Background Panic Tint)</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setErrorSimulated(!errorSimulated)}
          >
            Switch to {errorSimulated ? '404' : '500'}
          </Button>
        </div>

        <Card padding="lg">
          {errorSimulated ? (
            <ErrorPage
              code="500"
              title="Consensus Engine Quorum Interrupted"
              description="A hardware watchdog fault triggered failover on node alpha-09. Cryptographic recovery in progress across secondary shards."
              primaryAction={{
                label: 'Retry Connection',
                onClick: () => setErrorSimulated(false),
              }}
              secondaryAction={{
                label: 'Download Crash Diagnostic',
                onClick: () => {},
              }}
            />
          ) : (
            <ErrorPage
              code="404"
              title="Telemetry Shard Not Located"
              description="The requested immutable ledger address could not be verified on any active regional peer. Verify route parameters or check audit logs."
              primaryAction={{
                label: 'Return to Gateway',
                onClick: () => {},
              }}
              secondaryAction={{
                label: 'Audit Vault Logs',
                onClick: () => {},
              }}
            />
          )}
        </Card>
      </div>

      <Divider spacing="md" />

      {/* 3. SKELETON DEMO */}
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
          3. Skeletons (Pure S2 ↔ S2.5 Half-Step Pulse · Zero Harsh White Shimmer · Motion-Safe)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card A: Profile Row Skeleton */}
          <Card padding="md">
            <div className="space-y-3">
              <div style={{ fontSize: '12px', color: getTextStyle('tertiary', 1).color }}>
                AVATAR &amp; MULTI-LINE TEXT
              </div>

              <div className="flex items-center gap-3">
                <Skeleton variant="circle" />
                <div className="space-y-2 flex-1">
                  <Skeleton variant="title" width="60%" />
                  <Skeleton variant="text" count={2} />
                </div>
              </div>
            </div>
          </Card>

          {/* Card B: Block & Cards Skeleton */}
          <Card padding="md">
            <div className="space-y-3">
              <div style={{ fontSize: '12px', color: getTextStyle('tertiary', 1).color }}>
                HEADER &amp; MESH CARD
              </div>

              <Skeleton variant="title" width="50%" />
              <Skeleton variant="card" height={72} />
            </div>
          </Card>

          {/* Card C: Circle Row & Custom Metric */}
          <Card padding="md">
            <div className="space-y-3">
              <div style={{ fontSize: '12px', color: getTextStyle('tertiary', 1).color }}>
                PEER NODE CLUSTER ROW
              </div>

              <div className="flex items-center gap-2">
                <Skeleton variant="circle" width={32} height={32} />
                <Skeleton variant="circle" width={32} height={32} />
                <Skeleton variant="circle" width={32} height={32} />
                <Skeleton variant="circle" width={32} height={32} />
              </div>

              <div className="pt-2">
                <Skeleton variant="custom" height={24} width="85%" borderRadius={6} />
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Divider spacing="md" />

      {/* 4. FORM LAYOUT DEMO */}
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
          4. Form Layout (Strict Spacing Rhythm: Inner 8px · Field 16px · Section 32px + RimSide Divider)
        </div>

        <Card padding="lg">
          <FormLayout
            onSubmit={(e) => {
              e.preventDefault();
              setFormSaved(true);
              setTimeout(() => setFormSaved(false), 3000);
            }}
          >
            {/* Section 1: Basic Information */}
            <FormLayout.Section title="Principal Enclave Identity">
              <FormLayout.Row cols={2}>
                <FormLayout.Field label="Cluster Node Name">
                  <Input placeholder="e.g. hsm-alpha-node" defaultValue="hsm-tokyo-01" />
                </FormLayout.Field>

                <FormLayout.Field label="Operator Handle">
                  <Input placeholder="e.g. ops-sre-lead" defaultValue="lead.architect" />
                </FormLayout.Field>
              </FormLayout.Row>

              <FormLayout.Field
                label="Primary Contact Enclave"
                hint="Used strictly for automated quorum notifications and recovery ping tests"
              >
                <Input
                  type="email"
                  placeholder="enclave-lead@liminal.infra"
                  defaultValue="security@liminal.system"
                />
              </FormLayout.Field>
            </FormLayout.Section>

            {/* Section 2: Security Credentials */}
            <FormLayout.Section title="Cryptographic Access Tokens">
              <FormLayout.Row cols={2}>
                <FormLayout.Field label="Master Enclave Secret">
                  <Input
                    type="password"
                    placeholder="••••••••••••••••"
                    defaultValue="0x892a7f9c2d1b4"
                  />
                </FormLayout.Field>

                <FormLayout.Field
                  label="Re-enter Enclave Secret"
                  error={formSaved ? undefined : undefined}
                >
                  <Input
                    type="password"
                    placeholder="••••••••••••••••"
                    defaultValue="0x892a7f9c2d1b4"
                  />
                </FormLayout.Field>
              </FormLayout.Row>
            </FormLayout.Section>

            {/* Actions */}
            <FormLayout.Actions>
              <Button type="submit" variant="secondary">
                <ShieldCheck size={14} className="mr-1" />
                {formSaved ? 'Identity Verified ✓' : 'Save Enclave Configuration'}
              </Button>

              <Button type="button" variant="ghost">
                Reset Changes
              </Button>
            </FormLayout.Actions>
          </FormLayout>
        </Card>
      </div>
    </div>
  );
}

export default CompositesDemo;
