import { type ReactNode } from 'react';
import { createPortal as reactCreatePortal } from 'react-dom';

export interface LiminalPortalProps {
  children: ReactNode;
  container?: HTMLElement;
}

export function LiminalPortal({ children, container }: LiminalPortalProps): React.ReactPortal | null {
  if (typeof document === 'undefined') return null;
  const target = container || document.body;
  return reactCreatePortal(children, target);
}

export default LiminalPortal;
