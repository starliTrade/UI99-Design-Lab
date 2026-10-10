import React, {
  forwardRef,
  useMemo,
} from 'react';
import type {
  CSSProperties,
  ReactNode,
  HTMLAttributes,
} from 'react';
import { DropdownMenuContent } from '../DropdownMenu/DropdownMenuContent';
import { DropdownMenuContext, type DropdownMenuContextValue } from '../DropdownMenu/DropdownMenu';
import { useContextMenuContext } from './ContextMenu';

export interface ContextMenuContentProps extends HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  minWidth?: number;
  loop?: boolean;
}

export const ContextMenuContent = forwardRef<HTMLDivElement, ContextMenuContentProps>(
  ({ children, ...props }, ref) => {
    const { isOpen, close, floatingRef, position } = useContextMenuContext();

    const dropdownMenuContextValue = useMemo<DropdownMenuContextValue>(
      () => ({
        isOpen,
        open: () => {},
        close,
        toggle: () => {},
        triggerRef: { current: null },
        floatingRef,
        position,
        updatePosition: () => {},
      }),
      [isOpen, close, floatingRef, position]
    );

    return (
      <DropdownMenuContext.Provider value={dropdownMenuContextValue}>
        <DropdownMenuContent ref={ref} {...props}>
          {children}
        </DropdownMenuContent>
      </DropdownMenuContext.Provider>
    );
  }
);
ContextMenuContent.displayName = 'ContextMenuContent';
