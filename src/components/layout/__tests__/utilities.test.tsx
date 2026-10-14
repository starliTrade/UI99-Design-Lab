import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { VisuallyHidden } from '../VisuallyHidden/VisuallyHidden';
import { Stack } from '../Stack/Stack';
import { AspectRatio } from '../AspectRatio/AspectRatio';
import { ScrollArea } from '../ScrollArea/ScrollArea';
import { FocusScope } from '../FocusScope/FocusScope';
import { LiminalLayoutEngine as L } from '../../../engine/liminal-layout-engine';

describe('VisuallyHidden — hidden from the eye, present for the reader', () => {
  it('is in the accessibility tree', () => {
    // `display: none` removes it entirely, which is the opposite of the point.
    render(<VisuallyHidden>Screen reader only</VisuallyHidden>);
    expect(screen.getByText('Screen reader only')).toBeTruthy();
  });

  it('is clipped, not removed — and it is ONE pixel, not zero', () => {
    // A zero-sized element is skipped by some assistive technology, so the
    // smallest thing that is still an element is the right size.
    render(<VisuallyHidden>Hidden</VisuallyHidden>);
    const el = screen.getByText('Hidden');
    expect(el.style.width).toBe('1px');
    expect(el.style.height).toBe('1px');
    expect(el.style.clipPath).toBe('inset(50%)');
    expect(el.style.display).not.toBe('none');
  });

  it('can be marked focusable, for a skip link', () => {
    render(<VisuallyHidden focusable>Skip to content</VisuallyHidden>);
    expect(screen.getByText('Skip to content').getAttribute('data-liminal-visually-hidden')).toBe('focusable');
  });

  it('renders as the element it is asked to be', () => {
    render(<VisuallyHidden as="h2">Section name</VisuallyHidden>);
    expect(screen.getByRole('heading', { level: 2, name: 'Section name' })).toBeTruthy();
  });
});

describe('Stack — one direction, one gap, from the scale', () => {
  it('takes a STEP, not a number of pixels', () => {
    render(<Stack gap={3} data-testid="s"><span>a</span></Stack>);
    expect(screen.getByTestId('s').style.gap).toBe(`${L.SPACING[3]}px`);
  });

  it('adds no role — a layout wrapper that announces itself is a stop to step through', () => {
    const { container } = render(<Stack><span>a</span></Stack>);
    expect(container.firstElementChild?.getAttribute('role')).toBeNull();
  });

  it('a row follows the document direction, because it is a flex row', () => {
    render(<Stack direction="row" data-testid="s"><span>a</span></Stack>);
    expect(screen.getByTestId('s').style.flexDirection).toBe('row');
  });
});

describe('AspectRatio — the child cannot decide the height', () => {
  it('sets the ratio', () => {
    render(<AspectRatio ratio={16 / 9} data-testid="a">x</AspectRatio>);
    // The browser normalises a unitless ratio to `n / 1`.
    expect(screen.getByTestId('a').style.aspectRatio).toBe(`${16 / 9} / 1`);
  });

  it('positions the child, so a tall child cannot push the box', () => {
    const { container } = render(<AspectRatio data-testid="a">x</AspectRatio>);
    const inner = container.querySelector('[data-testid=a] > div') as HTMLElement;
    expect(inner.style.position).toBe('absolute');
  });
});

describe('ScrollArea — a region a keyboard can scroll', () => {
  it('is focusable AND named when it scrolls', () => {
    // A `<div>` with `overflow: auto` is scrollable by pointer and by nothing
    // else. WCAG 2.1.1 is explicit.
    render(<ScrollArea label="Scrollable content">x</ScrollArea>);
    const region = screen.getByRole('group', { name: 'Scrollable content' });
    expect(region.getAttribute('tabindex')).toBe('0');
  });

  it('is NOT a tab stop when it has no name — a stop that does nothing is a defect', () => {
    const { container } = render(<ScrollArea>x</ScrollArea>);
    expect(container.firstElementChild?.getAttribute('tabindex')).toBeNull();
    expect(container.firstElementChild?.getAttribute('role')).toBeNull();
  });

  it('takes a token step for its height', () => {
    const { container } = render(<ScrollArea maxHeight={6}>x</ScrollArea>);
    expect((container.firstElementChild as HTMLElement).style.maxHeight).toBe(`${L.SPACING[6]}px`);
  });
});

describe('FocusScope — a trap with a way out', () => {
  it('renders its children', () => {
    render(<FocusScope active={false}><button>Inside</button></FocusScope>);
    expect(screen.getByRole('button', { name: 'Inside' })).toBeTruthy();
  });

  it('calls onEscape when the reader presses it', () => {
    const onEscape = vi.fn();
    render(<FocusScope onEscape={onEscape}><button>Inside</button></FocusScope>);
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' });
    expect(onEscape).toHaveBeenCalled();
  });

  it('does NOT swallow Escape when it has no exit', () => {
    // Swallowing the only key that could free the reader is worse than not
    // trapping.
    const onEscape = vi.fn();
    render(
      <div onKeyDown={onEscape}>
        <FocusScope>
          <button>Inside</button>
        </FocusScope>
      </div>,
    );
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' });
    expect(onEscape).toHaveBeenCalled();
  });
});
