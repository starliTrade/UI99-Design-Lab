import React, { forwardRef } from 'react';
import type { CSSProperties } from 'react';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../../../engine/liminal-motion-engine';
import { getTextStyle } from '../../../engine/spec-engine';
import { FOCUS_RING_COLOR, getLadderVar } from '../../../engine/liminal-ladder';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { resolveBorder, resolveSurface } from '../../../engine/liminal-surface';
import { useHostSurface } from '../../../engine/liminal-surface-context';

/**
 * LIMINAL · STEPPER
 *
 * Where the reader is in a sequence, and how many steps are left.
 *
 * The three states are a DESIGN DECISION, not three colours:
 *
 *   complete   behind the reader. Filled, but quieter than where they are — it
 *              is context, not the answer.
 *   current    where they are. The BRAND, and the only element in the component
 *              that is loud. A stepper whose current step is one shade off the
 *              others has not told the reader anything.
 *   upcoming   ahead. An outline with no fill: present as a target, absent as a
 *              claim.
 *
 *   role        `chrome` — it is navigation, and it says so.
 *   sizes       sm · md · lg.
 *   variants    `orientation`: horizontal · vertical.
 *   states      complete · current · upcoming · error, per step.
 *   tokens      zero raw values.
 *   a11y        an ordered list, because a sequence IS ordered; the current step
 *               carries `aria-current="step"`, which is the attribute that
 *               exists for exactly this and is what a screen reader announces.
 *   RTL         the connector is a logical border; the order is not mirrored,
 *               because a sequence has a direction and it is not the page's.
 *   fixture     one row.
 *   tests       render, behave, contrast, axe.
 *   eye test    live.
 */
export interface StepperStep {
  id: string;
  label: string;
  /** Optional second line. */
  description?: string;
  state?: 'complete' | 'current' | 'upcoming' | 'error';
}

export interface StepperProps {
  steps: StepperStep[];
  /** Which step is current, by id. Wins over a per-step `state`. */
  current?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: CSSProperties;
}

const DOT = { sm: 20, md: 26, lg: 32 } as const;

export const Stepper = forwardRef<HTMLOListElement, StepperProps>(function Stepper(
  { steps, current, orientation = 'horizontal', size = 'md', className, style: customStyle },
  forwardedRef,
) {
  const host = useHostSurface();
  const SEMANTICS = LiminalColorEngine.SEMANTICS;
  const dot = DOT[size];
  const horizontal = orientation === 'horizontal';

  // The component declares its own surface, so it can be anchored inside
  // anything — the same rule every control follows.
  const surface = resolveSurface({ role: 'chrome', on: host });
  const edge = resolveBorder({ role: 'chrome', kind: 'hairline', on: host });

  const stateOf = (step: StepperStep, index: number): NonNullable<StepperStep['state']> => {
    if (step.state === 'error') return 'error';
    if (current) {
      if (step.id === current) return 'current';
      const at = steps.findIndex((s) => s.id === current);
      return index < at ? 'complete' : 'upcoming';
    }
    return step.state ?? 'upcoming';
  };

  const paint = (state: NonNullable<StepperStep['state']>) => {
    if (state === 'error') return { fill: SEMANTICS.DANGER.subtle, ink: SEMANTICS.DANGER.text, stroke: SEMANTICS.DANGER.solid };
    // The ink on the brand is the canvas: the darkest surface, which is what a
    // filled brand circle needs to be readable. From the engine, not a literal.
    // The VARIABLE, not the hex. `getLadderColor` returns a value a theme
    // cannot reach — the second guard caught that after the first caught the
    // indexing. Two guards, one mistake, two different ways of saying it.
    if (state === 'current') return { fill: FOCUS_RING_COLOR, ink: getLadderVar(0), stroke: FOCUS_RING_COLOR };
    if (state === 'complete') return { fill: SEMANTICS.SUCCESS.subtle, ink: SEMANTICS.SUCCESS.text, stroke: SEMANTICS.SUCCESS.solid };
    // Upcoming is an OUTLINE: present as a target, absent as a claim. The edge,
    // not the hairline — a hairline is half a step and a target must be SEEN.
    return { fill: 'transparent', ink: getTextStyle('tertiary', 2).color, stroke: edge };
  };

  return (
    <ol
      ref={forwardedRef}
      className={className}
      style={{
        ...surface.style,
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: horizontal ? 'row' : 'column',
        gap: horizontal ? `${L.SPACING[3]}px` : `${L.SPACING[2]}px`,
        alignItems: horizontal ? 'flex-start' : 'stretch',
        minWidth: 0,
        ...customStyle,
      }}
    >
      {steps.map((step, index) => {
        const state = stateOf(step, index);
        const { fill, ink, stroke } = paint(state);
        const last = index === steps.length - 1;
        return (
          <li
            key={step.id}
            // The attribute that exists for this, and the one a screen reader
            // announces. A stepper without it is a row of circles.
            aria-current={state === 'current' ? 'step' : undefined}
            style={{
              display: 'flex',
              flexDirection: horizontal ? 'column' : 'row',
              alignItems: horizontal ? 'center' : 'flex-start',
              gap: `${L.SPACING[1]}px`,
              flex: horizontal ? 1 : undefined,
              minWidth: 0,
              position: 'relative',
            }}
          >
            <span
              aria-hidden
              style={{
                width: dot,
                height: dot,
                flexShrink: 0,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                background: fill,
                border: `1px solid ${stroke}`,
                color: ink,
                fontSize: size === 'sm' ? 10 : 12,
                fontVariantNumeric: 'tabular-nums',
                transition: M.getTransition('background', 'normal'),
              }}
            >
              {state === 'complete' ? '✓' : index + 1}
            </span>

            {/* The connector. A logical border, so it runs the right way in both
                directions without a second component. */}
            {!last && (
              <span
                aria-hidden
                style={
                  horizontal
                    ? {
                        position: 'absolute',
                        insetInlineStart: dot,
                        top: dot / 2,
                        width: `calc(100% - ${dot}px)`,
                        height: 1,
                        background: state === 'complete' ? SEMANTICS.SUCCESS.solid : edge,
                      }
                    : {
                        position: 'absolute',
                        insetInlineStart: dot / 2,
                        top: dot,
                        width: 1,
                        height: `calc(100% - ${dot}px)`,
                        background: state === 'complete' ? SEMANTICS.SUCCESS.solid : edge,
                      }
                }
              />
            )}

            <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: horizontal ? 'center' : 'start' }}>
              <span
                style={{
                  ...L.getTypeStyle(2),
                  color: state === 'current' ? getTextStyle('primary', 2).color : getTextStyle('secondary', 2).color,
                  fontWeight: state === 'current' ? 600 : 400,
                }}
              >
                {step.label}
              </span>
              {step.description && (
                <span style={{ ...L.getTypeStyle(1), color: getTextStyle('tertiary', 1).color }}>{step.description}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
});

export default Stepper;
