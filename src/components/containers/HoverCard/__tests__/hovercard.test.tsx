import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { HoverCard } from '../HoverCard';
import { Button } from '../../../atoms/Button/Button';
import { Popover } from '../../Popover/Popover';
import { resolveSurface } from '../../../../engine/liminal-surface';
import { deriveTextToken, TEXT_ROLE_SPEC } from '../../../../engine/liminal-contrast';

/**
 * The HoverCard's tests are mostly about what it must NOT do.
 *
 * A hover card and a popover are the same surface with opposite keyboard
 * contracts, and the failure mode of getting it wrong is not a broken layout —
 * it is a reader whose focus was taken for a glance, or a reader who cannot
 * reach the thing at all.
 */
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('HoverCard — it waits, then opens', () => {
  it('does not open the instant the pointer arrives', () => {
    render(<HoverCard trigger={<Button>Hover me</Button>} aria-label="Details"><span>Body</span></HoverCard>);
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Hover me' }));
    // Still closed: a pointer crossing the page must not fire it.
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('opens after the delay', () => {
    render(<HoverCard trigger={<Button>Hover me</Button>} openDelay={300} aria-label="Details"><span>Body</span></HoverCard>);
    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Hover me' }));
    act(() => { vi.advanceTimersByTime(320); });
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeTruthy();
  });

  it('a pointer that leaves before the delay never opens it', () => {
    render(<HoverCard trigger={<Button>Hover me</Button>} openDelay={300} aria-label="Details"><span>Body</span></HoverCard>);
    const trigger = screen.getByRole('button', { name: 'Hover me' });
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(150); });
    fireEvent.mouseLeave(trigger);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('HoverCard — it is not mouse-only', () => {
  it('opens on FOCUS, with no delay', () => {
    // A delay exists to stop a passing pointer from firing it. Focus is never
    // accidental, so it opens at once — otherwise a keyboard reader waits for a
    // hover they cannot perform.
    render(<HoverCard trigger={<Button>Hover me</Button>} openDelay={5000} aria-label="Details"><span>Body</span></HoverCard>);
    fireEvent.focus(screen.getByRole('button', { name: 'Hover me' }));
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeTruthy();
  });

  it('closes on Escape', () => {
    render(<HoverCard trigger={<Button>Hover me</Button>} open aria-label="Details"><span>Body</span></HoverCard>);
    const onOpenChange = vi.fn();
    render(<HoverCard trigger={<Button>Other</Button>} open onOpenChange={onOpenChange} aria-label="Other"><span>Body</span></HoverCard>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('describes the trigger while open, so the surface is announced', () => {
    render(<HoverCard trigger={<Button>Hover me</Button>} open aria-label="Details"><span>Body</span></HoverCard>);
    const trigger = screen.getByRole('button', { name: 'Hover me' });
    const id = trigger.getAttribute('aria-describedby');
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toBe(screen.getByRole('dialog'));
  });
});

describe('HoverCard — what it must NOT do', () => {
  it('does NOT take focus', () => {
    render(<HoverCard trigger={<Button>Hover me</Button>} open aria-label="Details"><span>Body</span></HoverCard>);
    const dialog = screen.getByRole('dialog');
    // Nothing here is required reading. Moving focus for a glance is a theft.
    expect(document.activeElement).not.toBe(dialog);
    expect(dialog.getAttribute('tabindex')).toBeNull();
  });

  it('is not modal, and does not claim to be', () => {
    render(<HoverCard trigger={<Button>Hover me</Button>} open aria-label="Details"><span>Body</span></HoverCard>);
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBeNull();
  });

  it('is not a popover: it has no aria-haspopup on the trigger', () => {
    render(<HoverCard trigger={<Button>Hover me</Button>} open aria-label="Details"><span>Body</span></HoverCard>);
    // A trigger that says "I have a popup" promises a click contract it does
    // not have.
    expect(screen.getByRole('button', { name: 'Hover me' }).getAttribute('aria-haspopup')).toBeNull();
  });

  it('and the Popover is not a hover card — the two are genuinely different', () => {
    render(<Popover trigger={<Button>Click me</Button>} aria-label="P"><span>Body</span></Popover>);
    const trigger = screen.getByRole('button', { name: 'Click me' });
    fireEvent.mouseEnter(trigger);
    act(() => { vi.advanceTimersByTime(5000); });
    // Hovering a popover's trigger must do nothing at all.
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('HoverCard — the contract holds', () => {
  it('declares the popover role, one step above a menu', () => {
    expect(resolveSurface({ role: 'popover' }).level).toBe(6);
    expect(resolveSurface({ role: 'menu' }).level).toBe(5);
  });

  it('holds both contrast floors for every text role', () => {
    const surface = resolveSurface({ role: 'popover' }).backgroundHex;
    for (const role of ['primary', 'secondary', 'tertiary', 'quaternary'] as const) {
      const t = deriveTextToken(role, surface);
      const spec = TEXT_ROLE_SPEC[role];
      expect(t.wcag, `${role} wcag`).toBeGreaterThanOrEqual(spec.wcag);
      expect(Math.abs(t.apca), `${role} apca`).toBeGreaterThanOrEqual(spec.apca);
    }
  });

  it('carries a shadow, because it floats', () => {
    expect(resolveSurface({ role: 'popover' }).shadow).toBeTruthy();
  });
});
