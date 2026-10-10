/**
 * LIMINAL · COMPONENT WRAPPER PATTERN & FACTORY
 * "DNA هر کامپوننت لیمینال — الگوی یکپارچه‌ی ساخت و ترکیب کامپوننت‌ها"
 * 
 * Standardizes:
 * 1. Slot component (Radix-style asChild pattern)
 * 2. Utilities: composeClassNames, composeStyles, composeEventHandlers, mergeProps
 * 3. createLiminalComponent factory with forwardRef, asChild, standard className & data attributes
 * 4. Full integration with LiminalComponentEngine & useLiminalInteraction
 */

import React, { forwardRef, type ComponentPropsWithRef, type ElementType, type ReactNode } from 'react';
import { Slot, type SlotProps, composeEventHandlers } from './liminal-slot';

// ===== UTILITY FUNCTIONS =====

/**
 * Merge className strings (deduplicate + combine)
 */
export function composeClassNames(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Merge style objects (user style overrides internal)
 */
export function composeStyles(
  ...styles: (React.CSSProperties | undefined | null)[]
): React.CSSProperties {
  return Object.assign({}, ...styles.filter(Boolean));
}

/**
 * Merge props (for Slot pattern)
 */
export function mergeProps<T extends Record<string, any>>(
  slotProps: T,
  childProps: T
): T {
  const overrideProps = { ...childProps };
  
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    // Compose event handlers
    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler && slotPropValue && childPropValue) {
      overrideProps[propName] = composeEventHandlers(slotPropValue, childPropValue) as any;
    }
    // Compose className
    else if (propName === 'className' && slotPropValue && childPropValue) {
      overrideProps[propName] = composeClassNames(slotPropValue, childPropValue) as any;
    }
    // Compose style
    else if (propName === 'style' && slotPropValue && childPropValue) {
      overrideProps[propName] = composeStyles(slotPropValue, childPropValue) as any;
    }
  }

  return { ...slotProps, ...overrideProps };
}

// ===== COMPONENT FACTORY =====

export interface LiminalComponentOptions<P> {
  displayName: string;
  defaultElement?: ElementType;
  defaultProps?: Partial<P>;
}

/**
 * Factory for creating Liminal components with standard features:
 * - forwardRef
 * - asChild (Slot pattern)
 * - className + style override
 * - data-liminal-component attribute
 * - displayName
 */
export function createLiminalComponent<P extends Record<string, any>>(
  options: LiminalComponentOptions<P>,
  render: (props: P & { ref?: React.Ref<any> }) => React.ReactElement | null
) {
  const { displayName, defaultElement = 'div', defaultProps = {} } = options;

  const Component = forwardRef<any, P & { asChild?: boolean }>((props, ref) => {
    const { asChild, className, style, ...restProps } = props as any;
    
    const mergedProps = {
      ...defaultProps,
      ...restProps,
      asChild,
      className: composeClassNames(className, `liminal-${displayName.toLowerCase()}`),
      style,
      'data-liminal-component': displayName.toLowerCase(),
    };

    const element = render({ ...mergedProps, ref } as any);

    if (asChild && React.isValidElement(element) && (element.type as any) !== Slot) {
      return React.createElement(Slot, mergedProps, element);
    }

    return element;
  });

  Component.displayName = displayName;
  return Component;
}

// ===== TYPE HELPERS =====

export type LiminalComponentProps<T extends ElementType = 'div'> = 
  ComponentPropsWithRef<T> & {
    asChild?: boolean;
    className?: string;
    style?: React.CSSProperties;
  };

export default createLiminalComponent;
