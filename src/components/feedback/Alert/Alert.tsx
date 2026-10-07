import React, { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getTextStyle } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface AlertProps {
  semantic: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  closable?: boolean;
  onClose?: () => void;
  icon?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function Alert({
  semantic,
  title,
  children,
  actions,
  closable = true,
  onClose,
  icon,
  className = '',
  style: customStyle = {},
}: AlertProps) {
  const [closed, setClosed] = useState<boolean>(false);
  const [closeHovered, setCloseHovered] = useState<boolean>(false);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  if (closed) return null;

  const semKey = semantic.toUpperCase() as 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
  const semanticObj = SEMANTICS[semKey] ?? SEMANTICS.INFO;
  const solidColor = semanticObj.solid;

  // LIMINAL MIST: quiet tier mist light (soft halos + caustic + whisper + separate ringLayer)
  const mist = LiminalColorEngine.getMistStyle(solidColor, 'quiet');

  // Default icons
  const defaultIcons: Record<'success' | 'warning' | 'danger' | 'info', ReactNode> = {
    success: <CheckCircle2 size={20} style={{ color: solidColor, flexShrink: 0 }} />,
    warning: <AlertTriangle size={20} style={{ color: solidColor, flexShrink: 0 }} />,
    danger: <XCircle size={20} style={{ color: solidColor, flexShrink: 0 }} />,
    info: <Info size={20} style={{ color: solidColor, flexShrink: 0 }} />,
  };

  const alertIcon = icon !== undefined ? icon : defaultIcons[semantic];

  // A11y role
  const role = semantic === 'danger' || semantic === 'warning' ? 'alert' : 'status';
  const ariaLive = semantic === 'success' || semantic === 'info' ? 'polite' : undefined;

  const handleDismiss = () => {
    setClosed(true);
    onClose?.();
  };

  const containerStyle: CSSProperties = {
    position: 'relative',
    overflow: 'visible',
    borderRadius: `${RADIUS.card}px`, // 16px
    background: mist.background,
    boxShadow: mist.boxShadow,
    padding: `${SPACING[4]}px ${SPACING[5]}px`, // 16px 24px
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${SPACING[3]}px`, // 12px
    boxSizing: 'border-box',
    width: '100%',
    transition: 'all 0.2s ease',
    ...customStyle,
  };

  const titleStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    fontWeight: 600,
    color: getTextStyle('primary', 1).color,
    margin: 0,
    marginBottom: children ? `${SPACING[1]}px` : 0,
  };

  const messageStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[2].fs}px`, // 13px
    lineHeight: 1.6,
    color: getTextStyle('secondary', 1).color,
    margin: 0,
  };

  const closeBtnStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    padding: '4px',
    cursor: 'pointer',
    color: closeHovered
      ? getTextStyle('secondary', 1).color
      : getTextStyle('tertiary', 1).color,
    borderRadius: `${RADIUS[6]}px`, // 6px
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.15s ease',
    marginLeft: 'auto',
    flexShrink: 0,
  };

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={className}
      style={containerStyle}
    >
      {/* ─── RING LAYER (separate blurred 1px border element) ─── */}
      <span aria-hidden="true" style={mist.ringLayer} />

      {/* Icon: sharp signal */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: '2px' }}>
        {alertIcon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title && <h4 style={titleStyle}>{title}</h4>}
        {children && <div style={messageStyle}>{children}</div>}

        {actions && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${SPACING[2]}px`,
              marginTop: `${SPACING[2]}px`,
            }}
          >
            {actions}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {closable && (
        <button
          type="button"
          aria-label="Dismiss alert"
          onClick={handleDismiss}
          onMouseEnter={() => setCloseHovered(true)}
          onMouseLeave={() => setCloseHovered(false)}
          style={closeBtnStyle}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default Alert;
