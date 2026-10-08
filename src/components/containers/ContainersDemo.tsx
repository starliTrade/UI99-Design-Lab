import React, { useState } from 'react';
import type { CSSProperties } from 'react';
import { Card } from './Card';
import { Panel } from './Panel';
import { Modal } from './Modal';
import { Sheet } from './Sheet';
import { Divider } from './Divider';
import { Button } from '../atoms/Button';
import { Badge } from '../atoms/Badge';
import {
  getDirectionalRim,
  getTextStyle,
  getLadderColor,
  getLiminalStyle,
} from '../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../engine/liminal-color-engine';
import {
  ArrowsOut,
  Sliders,
  Sidebar,
  Shield,
  Pulse,
  Stack,
  Terminal,
} from '@phosphor-icons/react';
import { LiminalIcon } from '../../engine/liminal-icon-engine';

export function ContainersDemo() {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState<boolean>(false);
  const [rightSheetOpen, setRightSheetOpen] = useState<boolean>(false);

  const RADIUS = LiminalLayoutEngine.RADIUS;
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  // Inset Well setup: Concave Rim inside Card (Radius calculated via Concentric Harmony)
  // r_inner = max(4, r_outer - padding)
  const cardPadding = SPACING[5]; // 24px
  const innerRadius = LiminalLayoutEngine.getConcentricRadius(RADIUS.card, cardPadding); // max(4, 16 - 24) = 4px or customized 8px
  const concavePadding = SPACING[4]; // 16px
  const calculatedInnerRadius = LiminalLayoutEngine.getConcentricRadius(RADIUS.card, concavePadding); // max(4, 16 - 16) -> 4px (or 8px with 8px pad)

  // Inset Well: Surface 1 concave rim (top is darker, bottom has specular reflection)
  const concaveRim = getDirectionalRim(1, 2, true);

  const insetWellStyle: CSSProperties = {
    background: concaveRim ? concaveRim.cssBackground : getLadderColor(0.5),
    border: concaveRim ? '1px solid transparent' : 'none',
    borderRadius: `${calculatedInnerRadius}px`,
    padding: `${SPACING[3]}px`,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[2]}px`,
  };

  const containerStyle = getLiminalStyle({ surfaceLevel: 1, isContainer: true }).style;

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
        style={{ borderBottom: `1px solid ${getLadderColor(1.5)}` }}
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
            LIMINAL Containers Kit · v1.0
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
            Card · Panel · Modal · Sheet · Divider (Concentric Harmony &amp; Dual-Penumbra)
          </p>
        </div>

        <Badge semantic="success">All Containers Synced</Badge>
      </div>

      {/* 1. INTERACTIVE TRIGGERS ROW */}
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
          1. Floating Overlays (Dual-Penumbra SHADOWS[3] · Focus Trap · Portal)
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <LiminalIcon icon={ArrowsOut} size="xs" weight="light" className="mr-1" />
            Open Modal (Dialog)
          </Button>

          <Button variant="secondary" onClick={() => setBottomSheetOpen(true)}>
            <LiminalIcon icon={Sliders} size="xs" weight="light" className="mr-1" />
            Open Bottom Sheet
          </Button>

          <Button variant="secondary" onClick={() => setRightSheetOpen(true)}>
            <LiminalIcon icon={Sidebar} size="xs" weight="light" className="mr-1" />
            Open Right Sheet (Inspector)
          </Button>
        </div>
      </div>

      <Divider spacing="md" />

      {/* 2. CARDS ROW */}
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
          2. Cards (Surface 1 · Rim 1 · Radius 16 · Flat Zero Shadow)
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: with Title + Inset Well */}
          <Card title="Node Cryptographic Core" padding="md">
            <p style={{ margin: 0, marginBottom: `${SPACING[3]}px` }}>
              Main isolation perimeter running hardware-enforced microcode on
              Surface 1 with directional 180° illumination.
            </p>

            {/* Inset Well (Concave Inversion) */}
            <div style={insetWellStyle}>
              <div className="flex items-center justify-between">
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: getTextStyle('tertiary', 1).color,
                  }}
                >
                  INSET WELL · CONCAVE RIM (S0.5)
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: SEMANTICS.SUCCESS.text,
                  }}
                >
                  ENCLAVE LOCKED
                </span>
              </div>

              <div
                style={{
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  color: getTextStyle('primary', 1).color,
                }}
              >
                sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
              </div>
            </div>
          </Card>

          {/* Card 2: without Title, Internal Divider */}
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LiminalIcon icon={Shield} size="sm" weight="light" color={SEMANTICS.INFO.text} />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: getTextStyle('primary', 1).color,
                  }}
                >
                  Autonomous Transport Stream
                </span>
              </div>
              <Badge semantic="info">Realtime TLS</Badge>
            </div>

            <Divider spacing="sm" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div
                  style={{
                    fontSize: '11px',
                    color: getTextStyle('tertiary', 1).color,
                  }}
                >
                  LATENCY
                </div>
                <div
                  style={{
                    fontSize: '19px',
                    fontWeight: 600,
                    color: getTextStyle('primary', 1).color,
                  }}
                >
                  2.4 ms
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: '11px',
                    color: getTextStyle('tertiary', 1).color,
                  }}
                >
                  PACKET LOSS
                </div>
                <div
                  style={{
                    fontSize: '19px',
                    fontWeight: 600,
                    color: SEMANTICS.SUCCESS.text,
                  }}
                >
                  0.000%
                </div>
              </div>
            </div>

            <Divider spacing="sm" />

            <div
              style={{
                fontSize: '11px',
                color: getTextStyle('quaternary', 1).color,
                fontFamily: 'monospace',
              }}
            >
              Zero packet jitter recorded over 4,820 consecutive telemetry ticks.
            </div>
          </Card>
        </div>
      </div>

      <Divider spacing="md" />

      {/* 3. PANEL ROW */}
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
          3. Panel (Surface 2 · Rim 2 · Radius 20 · Header &amp; Grid)
        </div>

        <Panel
          title="Edge Gateway Cluster Matrix"
          actions={
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost">
                Refresh
              </Button>
              <Button size="sm" variant="secondary">
                Configure
              </Button>
            </div>
          }
          padding="md"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              style={{
                ...getLiminalStyle({ surfaceLevel: 1, isContainer: true }).style,
                borderRadius: `${RADIUS.card}px`,
                padding: `${SPACING[4]}px`,
                boxShadow: 'none',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: getTextStyle('primary', 1).color,
                  }}
                >
                  Cluster Region Europe-West2
                </span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: SEMANTICS.SUCCESS.solid,
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: getTextStyle('secondary', 1).color,
                  margin: 0,
                }}
              >
                9 ingress listeners synchronized with multi-region anycast
                routing table.
              </p>
            </div>

            <div
              style={{
                ...getLiminalStyle({ surfaceLevel: 1, isContainer: true }).style,
                borderRadius: `${RADIUS.card}px`,
                padding: `${SPACING[4]}px`,
                boxShadow: 'none',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: getTextStyle('primary', 1).color,
                  }}
                >
                  Cluster Region US-East1
                </span>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: SEMANTICS.SUCCESS.solid,
                  }}
                />
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: getTextStyle('secondary', 1).color,
                  margin: 0,
                }}
              >
                12 active pods maintaining quorum with zero replication lag.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <Divider spacing="md" />

      {/* 4. DIVIDERS SHOWCASE */}
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
          4. Dividers (Half-Step S1.5 #090A0D · Horizontal &amp; Vertical)
        </div>

        <div
          style={{
            ...getLiminalStyle({ surfaceLevel: 2, isContainer: true }).style,
            borderRadius: `${RADIUS.card}px`,
            padding: `${SPACING[4]}px`,
            boxShadow: 'none',
          }}
          className="space-y-4"
        >
          <div>
            <div
              style={{
                fontSize: '11px',
                color: getTextStyle('tertiary', 2).color,
                marginBottom: '4px',
              }}
            >
              HORIZONTAL DIVIDER WITH DIFFERENT SPACING:
            </div>
            <div style={{ color: getTextStyle('secondary', 2).color }}>Top Segment</div>
            <Divider spacing="sm" />
            <div style={{ color: getTextStyle('secondary', 2).color }}>Middle Segment (Small Spacing 8px)</div>
            <Divider spacing="lg" />
            <div style={{ color: getTextStyle('secondary', 2).color }}>Bottom Segment (Large Spacing 24px)</div>
          </div>

          <Divider spacing="md" />

          <div>
            <div
              style={{
                fontSize: '11px',
                color: getTextStyle('tertiary', 2).color,
                marginBottom: '8px',
              }}
            >
              VERTICAL DIVIDERS IN FLEX ROW:
            </div>
            <div className="flex items-center h-8">
              <span style={{ color: getTextStyle('primary', 2).color, fontSize: '13px' }}>
                Item Alpha
              </span>
              <Divider orientation="vertical" spacing="md" />
              <span style={{ color: getTextStyle('primary', 2).color, fontSize: '13px' }}>
                Item Beta
              </span>
              <Divider orientation="vertical" spacing="md" />
              <span style={{ color: getTextStyle('primary', 2).color, fontSize: '13px' }}>
                Item Gamma
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── MODAL COMPONENT ─── */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Execute Critical Kernel Rebalance"
        size="md"
        actions={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setModalOpen(false)}>
              Confirm Execution
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p style={{ margin: 0 }}>
            This operation will redistribute cryptographic shards across the 3
            verified host nodes in the active region.
          </p>
          <div
            style={{
              background: getLadderColor(2.5),
              borderRadius: `${RADIUS.control}px`,
              padding: `${SPACING[3]}px`,
              fontSize: '12px',
              fontFamily: 'monospace',
              color: SEMANTICS.WARNING.text,
            }}
          >
            Notice: Quorum verification latency will increase by approximately
            1.2ms during synchronization.
          </div>
        </div>
      </Modal>

      {/* ─── BOTTOM SHEET COMPONENT ─── */}
      <Sheet
        open={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        position="bottom"
        title="Telemetry Quick Inspector"
      >
        <div className="space-y-4 py-2">
          <p style={{ margin: 0 }}>
            Inspecting live stream from Edge Ingress Node 01. All TCP buffers are
            flushed and operating within memory limits.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              style={{
                background: getLadderColor(1.5),
                borderRadius: `${RADIUS.control}px`,
                padding: `${SPACING[3]}px`,
              }}
            >
              <div style={{ fontSize: '11px', color: getTextStyle('tertiary', 2).color }}>MEMORY</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: getTextStyle('primary', 2).color }}>34.2 MB</div>
            </div>

            <div
              style={{
                background: getLadderColor(1.5),
                borderRadius: `${RADIUS.control}px`,
                padding: `${SPACING[3]}px`,
              }}
            >
              <div style={{ fontSize: '11px', color: getTextStyle('tertiary', 2).color }}>GOROUTINES</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: getTextStyle('primary', 2).color }}>142</div>
            </div>

            <div
              style={{
                background: getLadderColor(1.5),
                borderRadius: `${RADIUS.control}px`,
                padding: `${SPACING[3]}px`,
              }}
            >
              <div style={{ fontSize: '11px', color: getTextStyle('tertiary', 2).color }}>CPU LOAD</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: SEMANTICS.SUCCESS.text }}>1.8%</div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="secondary" onClick={() => setBottomSheetOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Sheet>

      {/* ─── RIGHT SHEET COMPONENT ─── */}
      <Sheet
        open={rightSheetOpen}
        onClose={() => setRightSheetOpen(false)}
        position="right"
        size="md"
        title="Node Configuration Inspector"
      >
        <div className="space-y-4 py-2">
          <p style={{ margin: 0 }}>
            Fine-grained network parameters and routing rules for isolated
            container perimeter.
          </p>

          <div className="space-y-3">
            <div
              style={{
                padding: `${SPACING[3]}px`,
                borderRadius: `${RADIUS.control}px`,
                background: getLadderColor(1.5),
              }}
            >
              <div style={{ fontSize: '11px', color: getTextStyle('tertiary', 2).color }}>IP BINDING</div>
              <div style={{ fontSize: '13px', fontFamily: 'monospace', color: getTextStyle('primary', 2).color }}>192.168.1.100:8443</div>
            </div>

            <div
              style={{
                padding: `${SPACING[3]}px`,
                borderRadius: `${RADIUS.control}px`,
                background: getLadderColor(1.5),
              }}
            >
              <div style={{ fontSize: '11px', color: getTextStyle('tertiary', 2).color }}>CERTIFICATE ISSUER</div>
              <div style={{ fontSize: '13px', fontFamily: 'monospace', color: getTextStyle('primary', 2).color }}>CN=Liminal-Core-CA-v1</div>
            </div>

            <div
              style={{
                padding: `${SPACING[3]}px`,
                borderRadius: `${RADIUS.control}px`,
                background: getLadderColor(1.5),
              }}
            >
              <div style={{ fontSize: '11px', color: getTextStyle('tertiary', 2).color }}>CIPHER SUITE</div>
              <div style={{ fontSize: '13px', fontFamily: 'monospace', color: getTextStyle('primary', 2).color }}>TLS_AES_256_GCM_SHA384</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="ghost" onClick={() => setRightSheetOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setRightSheetOpen(false)}>
              Apply Changes
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

export default ContainersDemo;
