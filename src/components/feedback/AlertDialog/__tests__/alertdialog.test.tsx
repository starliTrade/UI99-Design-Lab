import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { AlertDialog } from '../AlertDialog';
import { resolveSurface } from '../../../../engine/liminal-surface';
import { deriveTextToken, TEXT_ROLE_SPEC } from '../../../../engine/liminal-contrast';
import { oklchLightness } from '../../../../engine/liminal-color-math';
import { PERCEPTUAL_QUANTUM } from '../../../../engine/liminal-ladder';

/**
 * The AlertDialog exists as its own component for one reason, and that reason
 * is the first test: FOCUS LANDS ON THE SAFE ACTION.
 *
 * A confirmation that puts focus on "Delete" is one stray Enter away from the
 * thing it was asking about. Everything else here is ordinary modal behaviour.
 */
describe('AlertDialog — focus lands on the safe action', () => {
  it('a destructive dialog focuses CANCEL, not the destructive button', () => {
    render(<AlertDialog open destructive title="Delete this project?" confirmLabel="Delete" cancelLabel="Cancel" />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Cancel' }));
    expect(document.activeElement).not.toBe(screen.getByRole('button', { name: 'Delete' }));
  });

  it('a non-destructive dialog focuses the confirm button, because it IS the safe one', () => {
    render(<AlertDialog open title="Save your work?" confirmLabel="Save" cancelLabel="Cancel" />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Save' }));
  });

  it('the stray Enter is harmless — activating the focused control cancels', () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(<AlertDialog open destructive title="Delete?" confirmLabel="Delete" cancelLabel="Cancel" onConfirm={onConfirm} onCancel={onCancel} />);
    // Enter on whatever has focus, without the reader having chosen anything.
    fireEvent.click(document.activeElement as Element);
    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });
});

describe('AlertDialog — it is a modal', () => {
  it('announces itself as an alert dialog, with a name and a description', () => {
    render(<AlertDialog open title="Delete this project?" description="This cannot be undone." />);
    const dialog = screen.getByRole('alertdialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const labelledBy = dialog.getAttribute('aria-labelledby');
    const describedBy = dialog.getAttribute('aria-describedby');
    expect(document.getElementById(labelledBy!)).toBe(screen.getByText('Delete this project?'));
    expect(document.getElementById(describedBy!)).toBe(screen.getByText('This cannot be undone.'));
  });

  it('is an alertdialog, NOT a dialog — a screen reader announces it with urgency', () => {
    render(<AlertDialog open title="Delete?" />);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('alertdialog')).toBeTruthy();
  });

  it('cancels on Escape', () => {
    const onCancel = vi.fn();
    render(<AlertDialog open title="Delete?" onCancel={onCancel} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onCancel).toHaveBeenCalled();
  });

  it('renders nothing at all while closed', () => {
    render(<AlertDialog open={false} title="Delete?" />);
    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('locks the page behind it', () => {
    const { unmount } = render(<AlertDialog open title="Delete?" />);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});

describe('AlertDialog — the contract holds', () => {
  it('declares the MODAL role, above a popover', () => {
    expect(resolveSurface({ role: 'modal' }).level).toBe(7);
    expect(resolveSurface({ role: 'modal' }).level).toBeGreaterThan(resolveSurface({ role: 'popover' }).level);
  });

  it('carries the deepest shadow — it is the highest thing that is not a toast', () => {
    const modal = resolveSurface({ role: 'modal' }).shadow;
    const popover = resolveSurface({ role: 'popover' }).shadow;
    expect(modal).toBeTruthy();
    expect(modal).not.toBe(popover);
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

  it('sits one perceptual step above a popover, not a jump', () => {
    const q = (a: string, b: string) => Math.abs(oklchLightness(a) - oklchLightness(b)) / PERCEPTUAL_QUANTUM;
    const gap = q(resolveSurface({ role: 'popover' }).backgroundHex, resolveSurface({ role: 'modal' }).backgroundHex);
    expect(gap).toBeGreaterThanOrEqual(0.4);
    expect(gap).toBeLessThan(1.5);
  });
});
