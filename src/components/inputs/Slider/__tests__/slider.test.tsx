import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Slider } from '../Slider';
import { DirProvider } from '../../../../engine/liminal-direction';
import { resolveSurface } from '../../../../engine/liminal-surface';
import { deriveTextToken, TEXT_ROLE_SPEC } from '../../../../engine/liminal-contrast';

describe('Slider — it is a real range input', () => {
  it('is a slider to a screen reader, with a value it can announce', () => {
    render(<Slider value={40} onChange={() => {}} label="Volume" />);
    const input = screen.getByRole('slider', { name: 'Volume' });
    expect(input.getAttribute('type')).toBe('range');
    expect((input as HTMLInputElement).value).toBe('40');
  });

  it('carries min, max and step through to the platform', () => {
    render(<Slider value={5} onChange={() => {}} min={0} max={10} step={0.5} label="Volume" />);
    const input = screen.getByRole('slider') as HTMLInputElement;
    expect(input.min).toBe('0');
    expect(input.max).toBe('10');
    expect(input.step).toBe('0.5');
  });

  it('reports the NUMBER, not the string', () => {
    // A slider that hands its consumer "40" instead of 40 is a slider every
    // consumer has to parse.
    const onChange = vi.fn();
    render(<Slider value={40} onChange={onChange} label="Volume" />);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '55' } });
    expect(onChange).toHaveBeenCalledWith(55);
    expect(typeof onChange.mock.calls[0][0]).toBe('number');
  });

  it('the label is a real label, tied to the control', () => {
    render(<Slider value={40} onChange={() => {}} label="Volume" />);
    expect(screen.getByLabelText('Volume')).toBe(screen.getByRole('slider'));
  });
});

describe('Slider — the error state', () => {
  it('says it is invalid and points at the message', () => {
    render(<Slider value={40} onChange={() => {}} label="Volume" error="Out of range" />);
    const input = screen.getByRole('slider');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const id = input.getAttribute('aria-describedby');
    expect(document.getElementById(id!)).toBe(screen.getByText('Out of range'));
  });

  it('announces the message', () => {
    render(<Slider value={40} onChange={() => {}} label="Volume" error="Out of range" />);
    expect(screen.getByRole('alert')).toBe(screen.getByText('Out of range'));
  });
});

describe('Slider — RTL is computed, not assumed', () => {
  it('fills from the other end in RTL', () => {
    // A gradient cannot be flipped by a logical property, so the direction is
    // read and the angle chosen. Getting it wrong is a slider that fills from
    // the wrong end in Arabic — which looks like a bug in the VALUE.
    // The fill travels through the interaction layer's `--liminal-surface-idle`,
    // not through `background` — the layer owns the surface, and reading
    // `style.background` would read `transparent` and prove nothing.
    const read = (el: HTMLElement) => el.style.getPropertyValue('--liminal-surface-idle');

    const { container: ltr } = render(<Slider value={40} onChange={() => {}} label="Volume" />);
    expect(read(ltr.querySelector('input') as HTMLElement)).toContain('to right');

    const { container: rtl } = render(
      <DirProvider dir="rtl">
        <Slider value={40} onChange={() => {}} label="Volume" />
      </DirProvider>,
    );
    expect(read(rtl.querySelector('input') as HTMLElement)).toContain('to left');
  });
});

describe('Slider — the contract holds', () => {
  it('declares the control role', () => {
    expect(resolveSurface({ role: 'control' }).level).toBeGreaterThan(resolveSurface({ role: 'work' }).level);
  });

  it('holds both contrast floors for every text role on its own surface', () => {
    const surface = resolveSurface({ role: 'control', on: 'work' }).backgroundHex;
    for (const role of ['primary', 'secondary', 'tertiary', 'quaternary'] as const) {
      const t = deriveTextToken(role, surface);
      const spec = TEXT_ROLE_SPEC[role];
      expect(t.wcag, `${role} wcag`).toBeGreaterThanOrEqual(spec.wcag);
      expect(Math.abs(t.apca), `${role} apca`).toBeGreaterThanOrEqual(spec.apca);
    }
  });
});
