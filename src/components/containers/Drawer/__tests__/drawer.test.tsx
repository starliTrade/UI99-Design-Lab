import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Drawer } from '../Drawer';
import { resolveSurface } from '../../../../engine/liminal-surface';
import { deriveTextToken, TEXT_ROLE_SPEC } from '../../../../engine/liminal-contrast';

/**
 * The Drawer's tests are about the handle.
 *
 * A drawer that can only be dismissed by dragging is a drawer half the readers
 * cannot dismiss. The handle is a BUTTON — labelled, focusable, activated by
 * Enter — and the drag is an addition to it. These tests hold that shape.
 */
describe('Drawer — the handle is a button, not a grip', () => {
  it('the handle is reachable and named', () => {
    render(<Drawer open title="Filters"><span>Body</span></Drawer>);
    expect(screen.getByRole('button', { name: 'Close' })).toBeTruthy();
  });

  it('activating the handle closes it — no pointer required', () => {
    const onClose = vi.fn();
    render(<Drawer open title="Filters" onClose={onClose}><span>Body</span></Drawer>);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('focus starts on the handle — the way out is the first thing found', () => {
    render(<Drawer open title="Filters"><span>Body</span></Drawer>);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Close' }));
  });
});

describe('Drawer — it is a modal', () => {
  it('announces itself as a dialog, named by its title', () => {
    render(<Drawer open title="Filters"><span>Body</span></Drawer>);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby')!)).toBe(screen.getByText('Filters'));
  });

  it('falls back to a name when it has no title', () => {
    render(<Drawer open><span>Body</span></Drawer>);
    expect(screen.getByRole('dialog', { name: 'Drawer' })).toBeTruthy();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(<Drawer open title="Filters" onClose={onClose}><span>Body</span></Drawer>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders nothing while closed', () => {
    render(<Drawer open={false} title="Filters"><span>Body</span></Drawer>);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('locks the page behind it', () => {
    const { unmount } = render(<Drawer open title="Filters"><span>Body</span></Drawer>);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});

describe('Drawer — it is a modal, not a popover', () => {
  it('declares the MODAL role, and takes over the view', () => {
    // The distinction is not decorative: a popover sits above the flow and the
    // reader keeps working. A drawer takes the view, and the role says so.
    expect(resolveSurface({ role: 'modal' }).level).toBe(7);
    expect(resolveSurface({ role: 'modal' }).level).toBeGreaterThan(resolveSurface({ role: 'popover' }).level);
  });

  it('holds both contrast floors for every text role on its own surface', () => {
    const surface = resolveSurface({ role: 'modal' }).backgroundHex;
    for (const role of ['primary', 'secondary', 'tertiary', 'quaternary'] as const) {
      const t = deriveTextToken(role, surface);
      const spec = TEXT_ROLE_SPEC[role];
      expect(t.wcag, `${role} wcag`).toBeGreaterThanOrEqual(spec.wcag);
      expect(Math.abs(t.apca), `${role} apca`).toBeGreaterThanOrEqual(spec.apca);
    }
  });

  it('every side is reachable — start, end and bottom all render a dialog', () => {
    for (const side of ['start', 'end', 'bottom'] as const) {
      const { unmount } = render(<Drawer open side={side} title="Filters"><span>Body</span></Drawer>);
      expect(screen.getByRole('dialog'), side).toBeTruthy();
      unmount();
    }
  });
});
