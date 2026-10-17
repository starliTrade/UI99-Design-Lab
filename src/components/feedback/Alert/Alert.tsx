import React, { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { getTextStyle } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { CheckCircle, Warning, XCircle, Info, X } from '@phosphor-icons/react';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import { mistCssVars } from '../../../engine/liminal-mist';

export interface AlertProps {
  semantic: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  /**
   * The DOCUMENT level of the title, when the title is a heading.
   *
   * It was `<h4>`, hard-coded — which is a decision about the page the alert is
   * dropped into, made by a component that cannot see the page. On the studio's
   * index the sections are `h2`, so an `h4` skipped a level and axe reported
   * `heading-order`: a screen reader's outline showed a gap.
   *
   * `Accordion` already takes a `headingLevel` for the same reason. The default
   * is unchanged, so nothing that renders an Alert today moves.
   */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
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
  headingLevel = 4,
  children,
  actions,
  closable = true,
  onClose,
  icon,
  className = '',
  style: customStyle = {},
}: AlertProps) {
  const [closed, setClosed] = useState<boolean>(false);

  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  if (closed) return null;

  const semKey = semantic.toUpperCase() as 'SUCCESS' | 'WARNING' | 'DANGER' | 'INFO';
  const semanticObj = SEMANTICS[semKey] ?? SEMANTICS.INFO;
  const solidColor = semanticObj.solid;

  // LIMINAL MIST: quiet tier mist light (soft halos + caustic + whisper + separate ringLayer)
  // An alert sits above the page; its mist follows from the role.
  const mistVars = mistCssVars('modal');

  // Default icons
  const defaultIcons: Record<'success' | 'warning' | 'danger' | 'info', ReactNode> = {
    success: <LiminalIcon icon={CheckCircle} size="md" weight="light" color={solidColor} />,
    warning: <LiminalIcon icon={Warning} size="md" weight="light" color={solidColor} />,
    danger: <LiminalIcon icon={XCircle} size="md" weight="light" color={solidColor} />,
    info: <LiminalIcon icon={Info} size="md" weight="light" color={solidColor} />,
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
    padding: `${SPACING[4]}px ${SPACING[5]}px`, // 16px 24px
    display: 'flex',
    alignItems: 'flex-start',
    gap: `${SPACING[3]}px`, // 12px
    boxSizing: 'border-box',
    width: '100%',
    transition: LiminalMotionEngine.TRANSITION.normal,
    ...customStyle,
  };

  const titleStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2), // 13px
    lineHeight: TYPOGRAPHY[2].lh,
    fontWeight: 600,
    color: getTextStyle('primary', 1).color,
    margin: 0,
    marginBottom: children ? `${SPACING[1]}px` : 0,
  };

  const messageStyle: CSSProperties = {
    fontSize: LiminalLayoutEngine.getTypeSizeCss(2), // 13px
    lineHeight: 1.6,
    color: getTextStyle('secondary', 1).color,
    margin: 0,
  };

  const closeBtnStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    padding: `${SPACING[1]}px`,
    cursor: 'pointer',
    // The layer owns `color` — see data-liminal-hover-color below. Setting it
    // here would cancel the hover rule, which is exactly what had happened.
    '--liminal-color-idle': getTextStyle('tertiary', 1).color,
    // primary, not secondary: secondary and tertiary derive to the SAME alpha
    // (0.790), so a secondary hover was a no-op — the icon never brightened.
    '--liminal-hover-color': getTextStyle('primary', 1).color,
    borderRadius: `${RADIUS[6]}px`, // 6px
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: LiminalMotionEngine.getTransition('color', 'fast'),
    marginInlineStart: 'auto',
    flexShrink: 0,
  } as CSSProperties;

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={className}
      data-liminal-mist=""
      style={containerStyle}
    >
      {/* ─── RING LAYER (separate blurred 1px border element) ─── */}

      {/* Icon: sharp signal */}
      <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0, marginTop: `${SPACING[0]}px` }}>
        {alertIcon}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {title &&
          React.createElement(`h${headingLevel}`, { style: titleStyle }, title)}
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
          data-liminal-hover-color=""
          style={closeBtnStyle}
        >
          <LiminalIcon icon={X} size="sm" weight="light" />
        </button>
      )}
    </div>
  );
}

export default Alert;
