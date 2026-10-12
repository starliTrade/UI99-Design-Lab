/**
 * LIMINAL · SURFACE CONTEXT
 * «کنترل نمی‌داند کجاست — میزبان به آن می‌گوید.»
 *
 * A control needs to know what hosts it. Passing that down by hand would mean
 * every Input inside a Modal carries `on="modal"`, and every one of those is a
 * chance to get it wrong.
 *
 * Instead a surface declares itself once, and everything inside reads the host
 * from context. `<SurfaceProvider role="modal">` makes every control inside sit
 * one step above the modal — automatically, at any depth.
 */

import { createContext, useContext } from 'react';
import type { ReactNode, ReactElement } from 'react';
import type { SurfaceRole } from './liminal-surface';

const SurfaceContext = createContext<SurfaceRole>('work');

export function SurfaceProvider({
  role,
  children,
}: {
  role: SurfaceRole;
  children: ReactNode;
}): ReactElement {
  return <SurfaceContext.Provider value={role}>{children}</SurfaceContext.Provider>;
}

/** The role of the nearest hosting surface. Defaults to the work surface. */
export function useHostSurface(): SurfaceRole {
  return useContext(SurfaceContext);
}
