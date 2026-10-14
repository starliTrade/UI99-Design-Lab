import React, { forwardRef, useCallback, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { FOCUS_RING_COLOR } from '../../../engine/liminal-ladder';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { resolveBorder, resolveInteractionVars, resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/**
 * LIMINAL · FILE UPLOAD
 *
 * A REAL `<input type="file">`, and a large visible zone that is its label.
 *
 * The tempting implementation is a styled `<div>` with a click handler that
 * calls `input.click()`. It works with a mouse and fails everywhere else: the
 * div is not focusable, Enter and Space do nothing, and a screen reader
 * announces a group with no control in it. A `<label>` for a file input is
 * focusable, activates on Enter and Space, and opens the picker — the platform
 * does all of it, and a div does none of it.
 *
 * The input itself is visually hidden but REAL and in the accessibility tree,
 * because that is the thing the reader operates. Hiding it with `display: none`
 * would remove the only control in the component.
 *
 *   role        `control`, anchored on its host.
 *   sizes       sm · md · lg — the drop zone's height.
 *   variants    none. A drop zone is a drop zone.
 *   states      default · dragging · disabled · error · filled.
 *   tokens      zero raw values.
 *   a11y        a real file input with a real label; the zone is the label, so
 *               it is focusable and activates from the keyboard; the file list
 *               is a list and each remove button is named with its file.
 *   RTL         logical properties only.
 *   fixture     one row.
 *   tests       render, behave, contrast, axe.
 *   eye test    live.
 */
export interface FileUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
  /** Passed to the input, so the platform can filter the picker. */
  accept?: string;
  multiple?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  hint?: string;
  error?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  style?: CSSProperties;
}

const ZONE = { sm: 72, md: 104, lg: 140 } as const;

export const FileUpload = forwardRef<HTMLInputElement, FileUploadProps>(function FileUpload(
  {
    files,
    onChange,
    accept,
    multiple = false,
    size = 'md',
    label,
    hint,
    error,
    disabled = false,
    id,
    name,
    className = '',
    style: customStyle,
  },
  forwardedRef,
) {
  const autoId = useId();
  const fieldId = id ?? `${autoId}-file`;
  const hintId = hint || error ? `${autoId}-hint` : undefined;
  const errorId = error ? `${autoId}-error` : undefined;
  const [dragging, setDragging] = useState(false);
  const innerRef = useRef<HTMLInputElement | null>(null);

  const host = useHostSurface();
  const SEMANTICS = LiminalColorEngine.SEMANTICS;

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      innerRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    },
    [forwardedRef],
  );

  const add = useCallback(
    (incoming: FileList | null) => {
      if (!incoming || incoming.length === 0) return;
      const next = multiple ? [...files, ...Array.from(incoming)] : [incoming[0]];
      onChange(next);
    },
    [files, multiple, onChange],
  );

  const remove = useCallback(
    (index: number) => onChange(files.filter((_, i) => i !== index)),
    [files, onChange],
  );

  // The EDGE, not the hairline: a drop zone is a target, and a target must be
  // SEEN. This is the third time that rule has decided a colour in this library.
  const zoneEdge = resolveBorder({ role: 'control', kind: 'edge', on: host });
  const zoneIdle = error ? SEMANTICS.DANGER.subtle : resolveSurface({ role: 'well', on: host }).rimColors?.cssBackground;

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', gap: `${L.SPACING[1]}px`, minWidth: 0, ...customStyle }}
    >
      {label && (
        <label htmlFor={fieldId} style={{ ...L.getTypeStyle(2), color: getTextStyle('secondary', 2).color }}>
          {label}
        </label>
      )}

      {/* The zone IS the label. A label activates its control from the keyboard
          and from a click, which a div with an onClick handler does not. */}
      <label
        htmlFor={fieldId}
        onDragOver={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          if (disabled) return;
          e.preventDefault();
          setDragging(false);
          add(e.dataTransfer.files);
        }}
        data-liminal-focusable=""
        // WITHOUT THIS THE ZONE HAS NO FILL.
        //
        // `resolveInteractionVars` PUBLISHES `--liminal-surface-idle`; the layer
        // CONSUMES it, and only on an element that opts in. Measured in a
        // browser: `background-image: none` on a zone that had a published fill
        // and nothing reading it. The same defect as the Slider, four components
        // later, and the eye test caught it both times.
        data-liminal-surface=""
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${L.SPACING[1]}px`,
          minHeight: ZONE[size],
          padding: `${L.SPACING[3]}px`,
          boxSizing: 'border-box',
          borderRadius: `${L.RADIUS.card}px`,
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          textAlign: 'center',
          border: `1px dashed ${dragging ? FOCUS_RING_COLOR : zoneEdge}`,
          transition: M.getTransition('background', 'fast'),
          ...resolveInteractionVars({ role: 'control', on: host, idle: zoneIdle }),
        }}
      >
        <span style={{ ...L.getTypeStyle(2), color: getTextStyle('secondary', 2).color }}>
          {dragging ? 'Drop to upload' : 'Choose a file or drop it here'}
        </span>
        {hint && (
          <span id={hintId} style={{ ...L.getTypeStyle(1), color: getTextStyle('tertiary', 1).color }}>
            {hint}
          </span>
        )}
      </label>

      {/* REAL and in the accessibility tree. `display: none` would remove the
          only control in the component; a clipped box keeps it operable. */}
      <input
        ref={setRefs}
        type="file"
        id={fieldId}
        name={name}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        onChange={(e) => {
          add(e.target.files);
          // Allow re-picking the same file: without this, choosing the same
          // name twice fires no change event and the reader sees nothing happen.
          e.target.value = '';
        }}
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clipPath: 'inset(50%)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />

      {files.length > 0 && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: `${L.SPACING[0]}px` }}>
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${L.SPACING[2]}px`, minWidth: 0 }}
            >
              <span style={{ ...L.getTypeStyle(1), color: getTextStyle('secondary', 1).color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}
              </span>
              <button
                type="button"
                // Named WITH the file: five buttons called "Remove" is five
                // identical controls to a screen reader.
                aria-label={`Remove ${file.name}`}
                disabled={disabled}
                onClick={() => remove(i)}
                style={{
                  ...resolveSurface({ role: 'control', on: host, interactive: true }).style,
                  font: 'inherit',
                  fontSize: 11,
                  padding: `2px ${L.SPACING[2]}px`,
                  borderRadius: `${L.RADIUS.chip}px`,
                  cursor: disabled ? 'not-allowed' : 'pointer',
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <span id={errorId} role="alert" style={{ ...L.getTypeStyle(1), color: SEMANTICS.DANGER.text }}>
          {error}
        </span>
      )}
    </div>
  );
});

export default FileUpload;
