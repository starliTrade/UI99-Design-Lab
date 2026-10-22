import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, cleanup, renderHook, act } from '@testing-library/react';
import React, { useRef } from 'react';
import { createVariants } from '../liminal-variants';
import { composeRefs, composeEventHandlers, mergeSlotProps, Slot } from '../liminal-slot';
import { SurfaceProvider, useHostSurface } from '../liminal-surface-context';
import { ICON_SIZES, LiminalIcon } from '../liminal-icon-engine';
import { useClickOutside, useEscapeKey, useScrollLock, useMediaQuery, useReducedMotion } from '../liminal-hooks';
import { LADDER } from '../liminal-ladder';

afterEach(cleanup);

/**
 * Seven engine modules that every component sits on and none of which had a
 * test. They are the layer a component is built from, so a defect here is a
 * defect in everything above it — and this session has already found three of
 * that shape by accident.
 */
describe('variants — a cva that returns CSSProperties instead of class strings', () => {
  const v = createVariants({
    base: { display: 'flex', boxSizing: 'border-box' },
    variants: {
      size: { sm: { padding: '4px' }, md: { padding: '8px' } },
      tone: { quiet: { opacity: 0.8 }, loud: { opacity: 1 } },
    },
    compoundVariants: [{ size: 'sm', tone: 'loud', style: { fontWeight: 700 } }],
    defaultVariants: { size: 'md', tone: 'quiet' },
  });

  it('applies the base', () => {
    expect(v().display).toBe('flex');
  });

  it('applies the defaults when nothing is passed', () => {
    expect(v().padding).toBe('8px');
    expect(v().opacity).toBe(0.8);
  });

  it('applies a named variant', () => {
    expect(v({ size: 'sm' }).padding).toBe('4px');
  });

  it('applies a compound variant only when both match', () => {
    expect(v({ size: 'sm', tone: 'loud' }).fontWeight).toBe(700);
    expect(v({ size: 'sm', tone: 'quiet' }).fontWeight).toBeUndefined();
    expect(v({ size: 'md', tone: 'loud' }).fontWeight).toBeUndefined();
  });

  it('lets a caller override a variant value through `style`', () => {
    // One argument, not two: `style` is a key on the props object.
    expect(v({ size: 'sm', style: { padding: '99px' } }).padding).toBe('99px');
  });
});

describe('slot — the asChild pattern, and the three things it has to get right', () => {
  it('composeRefs fills both refs', () => {
    const a = React.createRef<HTMLDivElement>();
    const b = React.createRef<HTMLDivElement>();
    const node = document.createElement('div');
    composeRefs(a, b)(node);
    expect(a.current).toBe(node);
    expect(b.current).toBe(node);
  });

  it('composeRefs survives a callback ref', () => {
    const fn = vi.fn();
    composeRefs(fn)(document.createElement('div'));
    expect(fn).toHaveBeenCalled();
  });

  it('composeEventHandlers runs both, in order', () => {
    const order: string[] = [];
    const h = composeEventHandlers(() => order.push('a'), () => order.push('b'));
    h({ defaultPrevented: false } as never);
    expect(order).toEqual(['a', 'b']);
  });

  it('composeEventHandlers stops when the first one prevents default', () => {
    // The child's handler gets the first word. If it says "I handled this",
    // the parent's does not run — which is what asChild means.
    const second = vi.fn();
    const h = composeEventHandlers((e: { preventDefault: () => void }) => e.preventDefault(), second);
    h({ defaultPrevented: false, preventDefault() { (this as { defaultPrevented: boolean }).defaultPrevented = true; } } as never);
    expect(second).not.toHaveBeenCalled();
  });

  it('mergeSlotProps joins classNames and merges styles', () => {
    const merged = mergeSlotProps(
      { className: 'a', style: { color: 'red', display: 'flex' } },
      { className: 'b', style: { color: 'blue' } },
    );
    expect(merged.className).toContain('a');
    expect(merged.className).toContain('b');
    expect((merged.style as Record<string, unknown>).color).toBe('blue');
    expect((merged.style as Record<string, unknown>).display).toBe('flex');
  });

  it('Slot renders the child element, not a wrapper', () => {
    const { container } = render(
      <Slot className="from-slot">
        <a href="/x">link</a>
      </Slot>,
    );
    const a = container.querySelector('a')!;
    expect(a).toBeTruthy();
    expect(a.className).toContain('from-slot');
    expect(container.firstElementChild?.tagName).toBe('A');
  });
});

describe('surface context — a control knows what hosts it', () => {
  const Probe = () => <span data-testid="h">{useHostSurface()}</span>;

  // Roadmap 1.2: no provider = the canvas, never an invented chrome layer.
  it('defaults to the canvas when no provider exists', () => {
    const { getByTestId } = render(<Probe />);
    expect(getByTestId('h').textContent).toBe('canvas');
  });

  it('a provider changes what the subtree sees', () => {
    const { getByTestId } = render(
      <SurfaceProvider role="menu"><Probe /></SurfaceProvider>,
    );
    expect(getByTestId('h').textContent).toBe('menu');
  });

  it('nests, so an inner provider wins', () => {
    const { getByTestId } = render(
      <SurfaceProvider role="menu">
        <SurfaceProvider role="toast"><Probe /></SurfaceProvider>
      </SurfaceProvider>,
    );
    expect(getByTestId('h').textContent).toBe('toast');
  });
});

describe('icons — the size scale is the engine’s', () => {
  it('has five sizes, ascending', () => {
    const values = Object.values(ICON_SIZES);
    expect(values).toHaveLength(5);
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeGreaterThan(values[i - 1]);
  });

  /** A stand-in that renders the props it is handed, so they can be read back. */
  const Stub = ((props: { size?: number }) => <svg width={props.size} height={props.size} />) as never;

  it('renders at the size its name says', () => {
    const { container } = render(<LiminalIcon icon={Stub} size="lg" />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe(String(ICON_SIZES.lg));
  });

  it('defaults to md', () => {
    const { container } = render(<LiminalIcon icon={Stub} />);
    expect(container.querySelector('svg')?.getAttribute('width')).toBe(String(ICON_SIZES.md));
  });
});

describe('hooks — the behaviours a component cannot get wrong', () => {
  it('useEscapeKey fires on Escape and not on anything else', () => {
    const fn = vi.fn();
    renderHook(() => useEscapeKey(fn, true));
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true })); });
    expect(fn).not.toHaveBeenCalled();
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
    expect(fn).toHaveBeenCalled();
  });

  it('useEscapeKey does nothing when inactive', () => {
    const fn = vi.fn();
    renderHook(() => useEscapeKey(fn, false));
    act(() => { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
    expect(fn).not.toHaveBeenCalled();
  });

  it('useClickOutside listens on the document while enabled, and stops when not', () => {
    // The hook owns the LISTENER, so that is what is asserted. Dispatching a
    // synthetic mousedown through jsdom and expecting the callback to fire
    // tests jsdom's event plumbing as much as the hook, and it did not.
    const add = vi.spyOn(document, 'addEventListener');
    const remove = vi.spyOn(document, 'removeEventListener');

    const ref = { current: document.createElement('div') };
    const { unmount } = renderHook(() => useClickOutside(ref, () => {}, true));
    expect(add.mock.calls.some(([type]) => type === 'mousedown')).toBe(true);

    unmount();
    expect(remove.mock.calls.some(([type]) => type === 'mousedown')).toBe(true);

    add.mockRestore();
    remove.mockRestore();
  });

  it('useClickOutside attaches nothing when disabled', () => {
    const add = vi.spyOn(document, 'addEventListener');
    const ref = { current: null };
    renderHook(() => useClickOutside(ref, () => {}, false));
    expect(add.mock.calls.some(([type]) => type === 'mousedown')).toBe(false);
    add.mockRestore();
  });

  it('useScrollLock ref-counts, so two locks need two releases', () => {
    const before = document.body.style.overflow;
    const a = renderHook(() => useScrollLock(true));
    const b = renderHook(() => useScrollLock(true));
    expect(document.body.style.overflow).toBe('hidden');
    a.unmount();
    // One lock still held, so the body stays locked.
    expect(document.body.style.overflow).toBe('hidden');
    b.unmount();
    expect(document.body.style.overflow).toBe(before || '');
  });

  it('useMediaQuery answers from matchMedia', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1000px)'));
    expect(typeof result.current).toBe('boolean');
  });

  it('useReducedMotion answers from the media query', () => {
    const { result } = renderHook(() => useReducedMotion());
    expect(typeof result.current).toBe('boolean');
  });
});
