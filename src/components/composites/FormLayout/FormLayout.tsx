import React from 'react';
import type { CSSProperties, ReactNode, FormEvent } from 'react';
import { getLadderColor, getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';

export interface FormLayoutProps {
  children: ReactNode;
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void;
  className?: string;
  style?: CSSProperties;
}

export interface FormSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface FormFieldProps {
  label: string;
  children: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
  style?: CSSProperties;
}

export interface FormRowProps {
  children: ReactNode;
  cols?: 2 | 3;
  className?: string;
  style?: CSSProperties;
}

export interface FormActionsProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export function FormSection({
  title,
  children,
  className = '',
  style: customStyle = {},
}: FormSectionProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  const titleStyle: CSSProperties = {
    fontSize: `${TYPOGRAPHY[3].fs}px`, // 16px
    lineHeight: TYPOGRAPHY[3].lh,
    letterSpacing: TYPOGRAPHY[3].ls,
    fontWeight: 600,
    color: getTextStyle('primary', 1).color,
    margin: 0,
    marginBottom: `${SPACING[1]}px`,
  };

  return (
    <div
      className={`liminal-form-section ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${SPACING[4]}px`, // 16px
        width: '100%',
        boxSizing: 'border-box',
        ...customStyle,
      }}
    >
      {title && <h3 style={titleStyle}>{title}</h3>}
      {children}
    </div>
  );
}

export function FormField({
  label,
  children,
  hint,
  error,
  className = '',
  style: customStyle = {},
}: FormFieldProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  return (
    <div
      className={`liminal-form-field ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${SPACING[2]}px`, // 8px
        width: '100%',
        boxSizing: 'border-box',
        ...customStyle,
      }}
    >
      <label
        style={{
          fontSize: '13px',
          fontWeight: 500,
          color: getTextStyle('tertiary', 1).color,
          userSelect: 'none',
        }}
      >
        {label}
      </label>

      {children}

      {hint && !error && (
        <span style={{ fontSize: '11px', color: getTextStyle('quaternary', 1).color }}>
          {hint}
        </span>
      )}

      {error && (
        <span style={{ fontSize: '11px', color: SEMANTICS.DANGER.text, fontWeight: 500 }}>
          {error}
        </span>
      )}
    </div>
  );
}

export function FormRow({
  children,
  cols = 2,
  className = '',
  style: customStyle = {},
}: FormRowProps) {
  const SPACING = LiminalLayoutEngine.SPACING;

  return (
    <div
      className={`liminal-form-row ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        gap: `${SPACING[4]}px`, // 16px
        width: '100%',
        boxSizing: 'border-box',
        ...customStyle,
      }}
    >
      {children}
    </div>
  );
}

export function FormActions({
  children,
  className = '',
  style: customStyle = {},
}: FormActionsProps) {
  const SPACING = LiminalLayoutEngine.SPACING;
  const rimSideColor = getLadderColor(1.5); // S1.5 border

  return (
    <div
      className={`liminal-form-actions ${className}`}
      style={{
        marginTop: `${SPACING[6]}px`, // 32px
        paddingTop: `${SPACING[4]}px`, // 16px
        borderTop: `1px solid ${rimSideColor}`,
        display: 'flex',
        alignItems: 'center',
        gap: `${SPACING[2]}px`, // 8px
        width: '100%',
        boxSizing: 'border-box',
        ...customStyle,
      }}
    >
      {children}
    </div>
  );
}

export function FormLayout({
  children,
  onSubmit,
  className = '',
  style: customStyle = {},
}: FormLayoutProps) {
  const rimSideColor = getLadderColor(1.5);

  return (
    <form
      onSubmit={onSubmit}
      className={`liminal-form-layout ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        boxSizing: 'border-box',
        ...customStyle,
      }}
    >
      {children}

      <style>{`
        .liminal-form-section + .liminal-form-section {
          margin-top: 32px !important;
          padding-top: 32px !important;
          border-top: 1px solid ${rimSideColor} !important;
        }
        @media (max-width: 600px) {
          .liminal-form-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </form>
  );
}

FormLayout.Section = FormSection;
FormLayout.Field = FormField;
FormLayout.Row = FormRow;
FormLayout.Actions = FormActions;

export default FormLayout;
