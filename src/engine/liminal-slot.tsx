import React, {
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';

export interface SlotProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

/**
 * Compose multiple refs into a single callback ref
 */
export function composeRefs<T>(...refs: (Ref<T> | undefined | null)[]) {
  return (node: T) => {
    refs.forEach((ref) => {
      if (!ref) return;
      if (typeof ref === 'function') {
        ref(node);
      } else if (typeof ref === 'object' && 'current' in ref) {
        (ref as React.MutableRefObject<T>).current = node;
      }
    });
  };
}

/**
 * Compose event handlers (first parent, then child if not defaultPrevented)
 */
export function composeEventHandlers<E>(
  parentHandler?: (event: E) => void,
  childHandler?: (event: E) => void,
  { checkForDefaultPrevented = true } = {}
): (event: E) => void {
  return (event: E) => {
    parentHandler?.(event);
    if (!checkForDefaultPrevented || !(event as any)?.defaultPrevented) {
      childHandler?.(event);
    }
  };
}

/**
 * Smart merge props for Slot:
 * - style: {...parent.style, ...child.style}
 * - className: joined with space
 * - event handlers: composed (parent then child)
 * - other props: child overrides parent
 */
export function mergeSlotProps(
  parentProps: Record<string, any>,
  childProps: Record<string, any>
): Record<string, any> {
  const merged: Record<string, any> = { ...parentProps, ...childProps };

  // 1. Merge style (...parent.style, ...child.style)
  if (parentProps.style || childProps.style) {
    merged.style = {
      ...(parentProps.style || {}),
      ...(childProps.style || {}),
    };
  }

  // 2. Merge className
  if (parentProps.className || childProps.className) {
    merged.className = [parentProps.className, childProps.className]
      .filter(Boolean)
      .join(' ');
  }

  // 3. Compose event handlers
  for (const propName of Object.keys(parentProps)) {
    if (/^on[A-Z]/.test(propName)) {
      const parentHandler = parentProps[propName];
      const childHandler = childProps[propName];
      if (typeof parentHandler === 'function' && typeof childHandler === 'function') {
        merged[propName] = composeEventHandlers(parentHandler, childHandler);
      } else if (typeof parentHandler === 'function') {
        merged[propName] = parentHandler;
      }
    }
  }

  return merged;
}

/**
 * LIMINAL Slot Component
 * Merges its own props onto its immediate child element (Radix-style asChild)
 */
export const Slot = forwardRef<HTMLElement, SlotProps>(({ children, ...parentProps }, ref) => {
  if (React.isValidElement(children)) {
    const childRef = (children as any).ref || (children.props as any)?.ref;
    const mergedRef = composeRefs(ref, childRef);
    const mergedProps = mergeSlotProps(parentProps, children.props as Record<string, any>);

    return React.cloneElement(children, {
      ...mergedProps,
      ref: mergedRef,
    } as any);
  }

  if (React.Children.count(children) > 1) {
    return <>{children}</>;
  }

  return null;
});

Slot.displayName = 'Slot';

export default Slot;
