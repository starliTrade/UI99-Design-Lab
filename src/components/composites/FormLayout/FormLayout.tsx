import React from 'react';
import type { CSSProperties, ReactNode, FormEvent } from 'react';
import { getLadderColor, getTextStyle } from '../../../engine/spec-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { resolveBorder } from '../../../engine/liminal-surface';

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
    fontSize: LiminalLayoutEngine.getTypeSizeCss(3), // 16px
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
  /**
   * THE LABEL HAS TO POINT AT SOMETHING.
   *
   * `<label>{label}</label>` with no `htmlFor` and nothing wrapped inside it is
   * a decoration: the input beside it has no accessible name, so a screen
   * reader announces "edit text" and nothing else. axe reports it as `label`,
   * critical — and it is the same defect this project already named once, when
   * `Label` was required to take an `htmlFor`: "a label with no `for` is a
   * decoration".
   *
   * The field owns the association now. It generates an id, gives it to the
   * child when the child does not have one, and points the label at it — so a
   * consumer that writes `<FormField label="Name"><Input /></FormField>` gets a
   * labelled input without having to know that ids exist.
   *
   * `hint` and `error` are wired to `aria-describedby` for the same reason: a
   * message the reader cannot reach is not a message.
   */
  const generated = React.useId();
  const describedBy: string[] = [];
  if (hint && !error) describedBy.push(`${generated}-hint`);
  if (error) describedBy.push(`${generated}-error`);

  let control: ReactNode = children;
  let controlId = generated;
  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<{ id?: string; 'aria-describedby'?: string }>;
    controlId = child.props.id ?? generated;
    control = React.cloneElement(child, {
      id: controlId,
      ...(describedBy.length ? { 'aria-describedby': describedBy.join(' ') } : null),
    });
  }

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
        htmlFor={React.isValidElement(children) ? controlId : undefined}
        style={{
          fontSize: LiminalLayoutEngine.getTypeSizeCss(2),
          fontWeight: 500,
          color: getTextStyle('tertiary', 1).color,
          userSelect: 'none',
        }}
      >
        {label}
      </label>

      {control}

      {hint && !error && (
        <span
          id={`${generated}-hint`}
          style={{ fontSize: LiminalLayoutEngine.getTypeSizeCss(1), color: getTextStyle('tertiary', 1).color }}
        >
          {hint}
        </span>
      )}

      {error && (
        <span
          id={`${generated}-error`}
          style={{ fontSize: LiminalLayoutEngine.getTypeSizeCss(1), color: SEMANTICS.DANGER.text, fontWeight: 500 }}
        >
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
  const rimSideColor = resolveBorder({ role: 'work', kind: 'hairline' }); // S1.5 border

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
  const rimSideColor = resolveBorder({ role: 'work', kind: 'hairline' });

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
        /* The form is the container; rows answer to the form's width, which is
           the width that actually constrains them. */
        .liminal-form-layout {
          container-type: inline-size;
          container-name: liminal-form;
        }
        .liminal-form-section + .liminal-form-section {
          margin-top: 32px !important;
          padding-top: 32px !important;
          border-top: 1px solid ${rimSideColor} !important;
        }
        /* Strictly below the row's floor — at formRow two fields still fit. */
        @container liminal-form (width < ${LiminalLayoutEngine.BREAKPOINTS.formRow}px) {
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
