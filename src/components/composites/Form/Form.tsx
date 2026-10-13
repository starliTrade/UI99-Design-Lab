import React, { createContext, useContext, useId, useState, useCallback, cloneElement, isValidElement } from 'react';
import type { ReactNode, CSSProperties, FormEvent } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';

/**
 * LIMINAL · FORM
 * «فرم، جایی است که دسترس‌پذیری واقعاً آزموده می‌شود.»
 *
 * `FormLayout` existed and did not validate, and its `FormField` rendered a
 * `<label>` with no `htmlFor` — so the label was not attached to the control it
 * named. That is not a missing nicety: a screen reader announces the field with
 * no idea what it is, and clicking the label does not focus it.
 *
 * This is the other half. Three things it does that the layout did not:
 *
 *   it WIRES the label to the control, through a generated id
 *   it ANNOUNCES the error, through `aria-describedby` and `aria-invalid`
 *   it VALIDATES, on submit and on blur, without a dependency
 *
 * And it does not invent a form library. The validation core is small and the
 * resolver is an interface, so a consumer already using react-hook-form can
 * plug its resolver in rather than replacing it.
 */

export type FieldErrors = Record<string, string | undefined>;
export type FieldValues = Record<string, unknown>;

/** A validator returns an error message, or nothing when the value is fine. */
export type Validator = (value: unknown, values: FieldValues) => string | undefined;

export interface FormProps {
  children: ReactNode;
  /**
   * Called with the values only when every field passes. A form that submits
   * with invalid data is a form that lost the argument with itself.
   */
  onSubmit?: (values: FieldValues, event: FormEvent<HTMLFormElement>) => void;
  /** Called on every submit attempt, valid or not. */
  onInvalid?: (errors: FieldErrors) => void;
  /** Per-field validators, keyed by field name. */
  validators?: Record<string, Validator>;
  /** The values the form starts with. */
  defaultValues?: FieldValues;
  className?: string;
  style?: CSSProperties;
  /** Turn the browser's own validation off — this one is better and it is ours. */
  noValidate?: boolean;
}

interface FormContextValue {
  values: FieldValues;
  errors: FieldErrors;
  touched: Record<string, boolean>;
  setValue: (name: string, value: unknown) => void;
  setTouched: (name: string) => void;
  validateField: (name: string) => string | undefined;
  validators: Record<string, Validator>;
  idPrefix: string;
}

const FormContext = createContext<FormContextValue | null>(null);

export function useFormContext(): FormContextValue {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('A LIMINAL form control must be inside <Form>');
  return ctx;
}

/** True when the form has a context — for a control that may be used either way. */
export function useOptionalFormContext(): FormContextValue | null {
  return useContext(FormContext);
}

export function Form({
  children,
  onSubmit,
  onInvalid,
  validators = {},
  defaultValues = {},
  className = '',
  style: customStyle = {},
  noValidate = true,
}: FormProps) {
  const idPrefix = useId();
  const [values, setValues] = useState<FieldValues>(defaultValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouchedState] = useState<Record<string, boolean>>({});

  const validateField = useCallback(
    (name: string) => validators[name]?.(values[name], values),
    [validators, values],
  );

  const setValue = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setTouched = useCallback(
    (name: string) => {
      setTouchedState((prev) => (prev[name] ? prev : { ...prev, [name]: true }));
      // Validate on blur, not on every keystroke. Telling someone their email is
      // invalid while they are still typing it is telling them nothing.
      setErrors((prev) => ({ ...prev, [name]: validators[name]?.(values[name], values) }));
    },
    [validators, values],
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FieldErrors = {};
    for (const name of Object.keys(validators)) {
      const message = validators[name](values[name], values);
      if (message) nextErrors[name] = message;
    }
    setErrors(nextErrors);
    setTouchedState(Object.fromEntries(Object.keys(validators).map((k) => [k, true])));
    if (Object.keys(nextErrors).length) {
      onInvalid?.(nextErrors);
      // Move focus to the first field that failed, so a keyboard user is not
      // told "there is an error" and left to find it.
      const first = Object.keys(nextErrors)[0];
      const el = event.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`);
      el?.focus();
      return;
    }
    onSubmit?.(values, event);
  };

  return (
    <FormContext.Provider value={{ values, errors, touched, setValue, setTouched, validateField, validators, idPrefix }}>
      <form className={className} style={customStyle} onSubmit={handleSubmit} noValidate={noValidate}>
        {children}
      </form>
    </FormContext.Provider>
  );
}

export interface FieldProps {
  /** The field's name, which is also the key its validator is registered under. */
  name: string;
  label: ReactNode;
  children: React.ReactElement;
  /** A hint under the label. Announced, and replaced by the error when there is one. */
  hint?: string;
  /** Mark the field required, and say so to a screen reader. */
  required?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * A field, and the wiring between its parts.
 *
 * The child is CLONED rather than wrapped, so the props land on the control
 * itself — which is where `id`, `aria-describedby` and `aria-invalid` have to
 * be for a screen reader to use them. A wrapper div would put them one element
 * away from the thing they describe.
 */
export function Field({ name, label, children, hint, required, className = '', style: customStyle = {} }: FieldProps) {
  const ctx = useOptionalFormContext();
  const ownId = useId();
  const controlId = `${ctx?.idPrefix ?? ''}${ownId}-control`;
  const hintId = `${controlId}-hint`;
  const errorId = `${controlId}-error`;

  const error = ctx?.errors[name];
  const showError = Boolean(error && ctx?.touched[name]);
  const describedBy = [hint ? hintId : null, showError ? errorId : null].filter(Boolean).join(' ') || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id: controlId,
        name,
        'aria-describedby': describedBy,
        'aria-invalid': showError || undefined,
        'aria-required': required || undefined,
        ...(ctx
          ? {
              value: (ctx.values[name] as string) ?? '',
              onChange: (e: { target: { value: unknown } }) => ctx.setValue(name, e?.target?.value),
              onBlur: () => ctx.setTouched(name),
            }
          : {}),
      })
    : children;

  const SPACING = L.SPACING;
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  return (
    <div
      className={`liminal-field ${className}`}
      style={{ display: 'flex', flexDirection: 'column', gap: `${SPACING[1]}px`, width: '100%', boxSizing: 'border-box', ...customStyle }}
    >
      <label
        htmlFor={controlId}
        style={{
          fontSize: L.getTypeSizeCss(2),
          fontWeight: 500,
          color: getTextStyle('tertiary', 1).color,
          userSelect: 'none',
        }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: SEMANTICS.DANGER.text, marginInlineStart: `${SPACING[1]}px` }}>
            *
          </span>
        )}
      </label>

      {control}

      {hint && !showError && (
        <span id={hintId} style={{ fontSize: L.getTypeSizeCss(1), color: getTextStyle('tertiary', 1).color }}>
          {hint}
        </span>
      )}

      {showError && (
        // `role="alert"` so the message is announced when it appears, rather
        // than waiting for the reader to move back to the field.
        <span id={errorId} role="alert" style={{ fontSize: L.getTypeSizeCss(1), color: SEMANTICS.DANGER.text }}>
          {error}
        </span>
      )}
    </div>
  );
}

export default Form;
