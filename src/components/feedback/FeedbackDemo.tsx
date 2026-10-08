import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Alert } from './Alert';
import { Toast } from './Toast';
import { Tooltip } from './Tooltip';
import { Card } from '../containers/Card';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import { Divider } from '../containers/Divider';
import { Input } from '../inputs/Input';
import {
  getLiminalStyle,
  getTextStyle,
} from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import {
  ShieldAlert,
  BellRing,
  HelpCircle,
  KeyRound,
  ExternalLink,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export function FeedbackDemo() {
  // Toast triggers
  const [toastOpen, setToastOpen] = useState<boolean>(false);
  const [toastSemantic, setToastSemantic] = useState<'success' | 'warning' | 'danger' | 'info'>('success');
  const [toastMessage, setToastMessage] = useState<string>('Cryptographic signature generated successfully.');

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const containerStyle = getLiminalStyle({ surfaceLevel: 1, isContainer: true }).style;

  const triggerToast = (semantic: 'success' | 'warning' | 'danger' | 'info', msg: string) => {
    setToastSemantic(semantic);
    setToastMessage(msg);
    setToastOpen(true);
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
            LIMINAL Feedback Kit · v1.0
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
            Alert (Mist Quiet) · Toast (Mist Quiet + Gravity Anchor) · Tooltip (Neutral S4)
          </p>
        </div>

        <Badge semantic="success">LIMINAL Mist Active</Badge>
      </div>

      {/* 1. ALERTS SECTION (LIMINAL MIST QUIET TIER) */}
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
          1. Alerts (LIMINAL MIST Quiet Tier: Ring Blur · Halos · Caustic · Whisper · Signal)
        </div>

        <div className="space-y-3">
          {/* Success Alert */}
          <Alert
            semantic="success"
            title="Quorum Cryptographic Synchronized"
          >
            Consensus achieved across all 9 peer validators with zero reconciliation latency.
          </Alert>

          {/* Warning Alert with Actions */}
          <Alert
            semantic="warning"
            title="Thermal Throttling Alert on Core Ingress #3"
            actions={
              <>
                <Button size="sm" variant="secondary">
                  Inspect Metrics
                </Button>
                <Button size="sm" variant="ghost">
                  Acknowledge
                </Button>
              </>
            }
          >
            Temperature threshold surpassed 78°C. Automatic load-shedding is currently active.
          </Alert>

          {/* Danger Alert (Closable) */}
          <Alert
            semantic="danger"
            title="Hardware Security Module Key Expired"
            closable
          >
            The root-of-trust certificate for cluster enclave 0x7F expired at 04:00 UTC. Ingress traffic has been quarantined.
          </Alert>

          {/* Info Alert */}
          <Alert
            semantic="info"
            title="Kernel Maintenance Scheduled"
          >
            Live kernel upgrade v4.19-lim scheduled for 02:00 UTC epoch. Estimated sync downtime is 0.0ms.
          </Alert>
        </div>
      </div>

      <Divider spacing="md" />

      {/* 2. TOAST TRIGGERS (LIMINAL MIST QUIET TIER + SHADOWS[4] GRAVITY ANCHOR) */}
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
          2. Floating Toasts (Mist Quiet Tier + Deep Gravity Anchor SHADOWS[4] · Auto-Dismiss)
        </div>

        <Card padding="md">
          <div className="space-y-3">
            <p style={{ margin: 0, fontSize: '13px', color: getTextStyle('secondary', 1).color }}>
              Click any button below to trigger an authentic floating Mist Toast anchored to the screen bottom:
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                onClick={() => triggerToast('success', 'Node cluster Alpha-01 deployed successfully.')}
              >
                <CheckCircle2 size={14} className="mr-1" />
                Trigger Success Toast
              </Button>

              <Button
                variant="secondary"
                onClick={() => triggerToast('warning', 'High packet jitter recorded on gateway transit.')}
              >
                <AlertTriangle size={14} className="mr-1" />
                Trigger Warning Toast
              </Button>

              <Button
                variant="danger"
                onClick={() => triggerToast('danger', 'Peer authentication failed on port 8443.')}
              >
                <Flame size={14} className="mr-1" />
                Trigger Danger Toast
              </Button>

              <Button
                variant="ghost"
                onClick={() => triggerToast('info', 'BGP anycast routes rebalanced across regions.')}
              >
                <Info size={14} className="mr-1" />
                Trigger Info Toast
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Divider spacing="md" />

      {/* 3. TOOLTIPS (NEUTRAL S4 + RIM 2 + SHADOWS[2]) */}
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
          3. Tooltips (Neutral Surface 4 · Rim 2 · Dual-Layer SHADOWS[2] · 150ms Delay · Escape Key)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tooltip on Button (Top position) */}
          <Card padding="md">
            <div className="flex flex-col items-center justify-center space-y-3 py-2 text-center">
              <span style={{ fontSize: '11px', color: getTextStyle('tertiary', 1).color }}>
                TOOLTIP ON BUTTON (TOP POSITION)
              </span>

              <Tooltip
                content="Rotate private encryption key across all regional clusters"
                position="top"
              >
                <Button variant="secondary" size="sm">
                  <KeyRound size={14} className="mr-1" />
                  Rotate Keys
                </Button>
              </Tooltip>
            </div>
          </Card>

          {/* Tooltip on Interactive Input (Top position) */}
          <Card padding="md">
            <div className="flex flex-col items-center justify-center space-y-3 py-2 text-center">
              <span style={{ fontSize: '11px', color: getTextStyle('tertiary', 1).color }}>
                TOOLTIP ON INPUT (TOP POSITION)
              </span>

              <Tooltip
                content="SHA256 fingerprint hash of target enclave"
                position="top"
              >
                <div style={{ width: '180px' }}>
                  <Input
                    placeholder="0x7f83...9069"
                    defaultValue="0x7f83b1"
                  />
                </div>
              </Tooltip>
            </div>
          </Card>

          {/* Tooltip on Icon Button (Bottom position) */}
          <Card padding="md">
            <div className="flex flex-col items-center justify-center space-y-3 py-2 text-center">
              <span style={{ fontSize: '11px', color: getTextStyle('tertiary', 1).color }}>
                TOOLTIP ON ICON (BOTTOM POSITION)
              </span>

              <Tooltip
                content="Opens external security compliance report in zero-trust vault"
                position="bottom"
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.10)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: getTextStyle('secondary', 1).color,
                  }}
                >
                  <ExternalLink size={16} />
                </div>
              </Tooltip>
            </div>
          </Card>
        </div>
      </div>

      {/* RENDER TOAST PORTAL */}
      <Toast
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        semantic={toastSemantic}
        message={toastMessage}
        action={{
          label: 'Undo',
          onClick: () => setToastOpen(false),
        }}
        duration={4500}
        position="bottom-center"
      />
    </div>
  );
}

export default FeedbackDemo;
