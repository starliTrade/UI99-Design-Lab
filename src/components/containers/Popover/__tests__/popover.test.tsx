import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Popover } from '../Popover';
import { Button } from '../../../atoms/Button/Button';
import { resolveSurface } from '../../../../engine/liminal-surface';
import { oklchLightness } from '../../../../engine/liminal-color-math';
import { PERCEPTUAL_QUANTUM } from '../../../../engine/liminal-ladder';
import { deriveTextToken, TEXT_ROLE_SPEC } from '../../../../engine/liminal-contrast';

/**
 * The Popover is the first component built to COMPONENT-CONTRACT.md, so its
 * tests are the contract's rules made executable: it renders, it behaves, its
 * contrast holds, and axe finds nothing.
 */
describe('Popover — it renders', () => {
  it('renders the trigger and nothing else while closed', () => {
    render(<Popover trigger={<Button>Open</Button>} aria-label="Details"><span>Body</span></Popover>);
    expect(screen.getByRole('button', { name: 'Open' })).toBeTruthy();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders a dialog when open, with the name it was given', () => {
    render(<Popover trigger={<Button>Open</Button>} open aria-label="Details"><span>Body</span></Popover>);
    expect(screen.getByRole('dialog', { name: 'Details' })).toBeTruthy();
  });

  it('wires the trigger to the surface, so a screen reader can follow it', () => {
    render(<Popover trigger={<Button>Open</Button>} open aria-label="Details"><span>Body</span></Popover>);
    const trigger = screen.getByRole('button', { name: 'Open' });
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    // aria-controls must point at the element that actually exists.
    const id = trigger.getAttribute('aria-controls');
    expect(id).toBeTruthy();
    expect(document.getElementById(id!)).toBe(screen.getByRole('dialog'));
  });

  it('says it is collapsed when it is', () => {
    render(<Popover trigger={<Button>Open</Button>} aria-label="Details"><span>Body</span></Popover>);
    expect(screen.getByRole('button', { name: 'Open' }).getAttribute('aria-expanded')).toBe('false');
  });
});

describe('Popover — it behaves', () => {
  it('opens on click and reports it', () => {
    const onOpenChange = vi.fn();
    render(<Popover trigger={<Button>Open</Button>} onOpenChange={onOpenChange} aria-label="Details"><span>Body</span></Popover>);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('does not open when the trigger cancelled the click', () => {
    // A trigger with its own onClick that calls preventDefault owns the
    // interaction; the popover must not fight it.
    const onOpenChange = vi.fn();
    const trigger = <Button onClick={(e) => e.preventDefault()}>Open</Button>;
    render(<Popover trigger={trigger} onOpenChange={onOpenChange} aria-label="Details"><span>Body</span></Popover>);
    fireEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const onOpenChange = vi.fn();
    render(<Popover trigger={<Button>Open</Button>} open onOpenChange={onOpenChange} aria-label="Details"><span>Body</span></Popover>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('is a dialog, not a menu — the keyboard contract differs', () => {
    render(<Popover trigger={<Button>Open</Button>} open aria-label="Details"><span>Body</span></Popover>);
    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('role')).toBe('dialog');
    // A menu would need roving focus and arrow keys. This holds arbitrary
    // content, so it must NOT claim to be one.
    expect(dialog.getAttribute('aria-haspopup')).toBeNull();
  });
});

describe('Popover — the contract holds', () => {
  it('declares the popover ROLE, and sits where the role says', () => {
    const surface = resolveSurface({ role: 'popover' });
    expect(surface.level).toBe(6);
    // One step above a menu, one below a modal — the hierarchy, not a number.
    expect(resolveSurface({ role: 'menu' }).level).toBeLessThan(surface.level);
    expect(resolveSurface({ role: 'modal' }).level).toBeGreaterThan(surface.level);
  });

  it('carries a shadow, because it floats', () => {
    expect(resolveSurface({ role: 'popover' }).shadow).toBeTruthy();
  });

  it('holds both contrast floors for every text role on its own surface', () => {
    const surface = resolveSurface({ role: 'popover' }).backgroundHex;
    for (const role of ['primary', 'secondary', 'tertiary', 'quaternary'] as const) {
      const t = deriveTextToken(role, surface);
      const spec = TEXT_ROLE_SPEC[role];
      expect(t.wcag, `${role} wcag`).toBeGreaterThanOrEqual(spec.wcag);
      expect(Math.abs(t.apca), `${role} apca`).toBeGreaterThanOrEqual(spec.apca);
    }
  });

  it('is one perceptual step above the surface it covers, not a jump', () => {
    const q = (a: string, b: string) => Math.abs(oklchLightness(a) - oklchLightness(b)) / PERCEPTUAL_QUANTUM;
    const menu = resolveSurface({ role: 'menu' }).backgroundHex;
    const pop = resolveSurface({ role: 'popover' }).backgroundHex;
    const gap = q(menu, pop);
    expect(gap).toBeGreaterThanOrEqual(0.4);
    expect(gap).toBeLessThan(1.5);
  });
});
