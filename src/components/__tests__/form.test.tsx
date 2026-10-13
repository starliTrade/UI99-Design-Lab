import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/react';
import React from 'react';
import { Form, Field } from '../composites/Form/Form';
import { Input } from '../inputs/Input/Input';

afterEach(cleanup);

const email = (v: unknown) => (String(v ?? '').includes('@') ? undefined : 'ایمیل معتبر نیست');
const required = (v: unknown) => (String(v ?? '').trim() ? undefined : 'این فیلد لازم است');

const setup = (props: Record<string, unknown> = {}) =>
  render(
    <Form validators={{ email, name: required }} defaultValues={{ email: '', name: '' }} {...props}>
      <Field name="name" label="نام" required hint="نام کامل">
        <Input />
      </Field>
      <Field name="email" label="ایمیل">
        <Input />
      </Field>
      <button type="submit">بفرست</button>
    </Form>,
  );

/**
 * `FormLayout` existed and did not validate, and its `FormField` rendered a
 * `<label>` with no `htmlFor` — so the label was not attached to the control it
 * named. A screen reader announced the field with no idea what it was, and
 * clicking the label did not focus it.
 */
describe('form — the label is attached to the control it names', () => {
  it('gives the control an id and points htmlFor at it', () => {
    const { container } = setup();
    const label = container.querySelector('label')!;
    const id = label.getAttribute('for');
    expect(id).toBeTruthy();
    expect(container.querySelector(`#${CSS.escape(id!)}`)).toBeTruthy();
  });

  it('puts the id on the CONTROL, not on a wrapper', () => {
    const { container } = setup();
    const label = container.querySelector('label')!;
    const control = container.querySelector(`#${CSS.escape(label.getAttribute('for')!)}`)!;
    expect(['INPUT', 'SELECT', 'TEXTAREA']).toContain(control.tagName);
  });

  it('keeps the ids unique across two forms on one page', () => {
    const { container } = render(
      <>
        <Form><Field name="a" label="A"><Input /></Field></Form>
        <Form><Field name="a" label="A"><Input /></Field></Form>
      </>,
    );
    const ids = [...container.querySelectorAll('[id]')].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('form — the hint and the error are announced', () => {
  it('describes the control with its hint', () => {
    const { container } = setup();
    const control = container.querySelector('input')!;
    const describedBy = control.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(container.querySelector(`#${CSS.escape(describedBy!)}`)?.textContent).toBe('نام کامل');
  });

  it('marks a required field to the reader, not only with an asterisk', () => {
    const { container } = setup();
    expect(container.querySelector('input')!.getAttribute('aria-required')).toBe('true');
  });

  it('the asterisk itself is hidden from the reader', () => {
    // It is a visual convention; the ARIA attribute is the announcement.
    const { container } = setup();
    const star = [...container.querySelectorAll('span')].find((s) => s.textContent === '*');
    expect(star?.getAttribute('aria-hidden')).toBe('true');
  });
});

describe('form — validation happens where it should', () => {
  it('does not complain while the field is still empty and untouched', () => {
    const { container } = setup();
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(container.querySelector('input')!.getAttribute('aria-invalid')).toBeNull();
  });

  it('validates on blur, not on every keystroke', () => {
    // The value typed is INVALID, so the point is the timing and not the value:
    // telling someone their field is wrong while they are still filling it in is
    // telling them nothing.
    const { container } = setup();
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: '   ' } });
    expect(container.querySelector('[role="alert"]')).toBeNull();
    fireEvent.blur(input);
    expect(container.querySelector('[role="alert"]')?.textContent).toBe('این فیلد لازم است');
  });

  it('announces the error with role=alert and marks the control invalid', () => {
    const { container } = setup();
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    const alert = container.querySelector('[role="alert"]')!;
    expect(alert).toBeTruthy();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(alert.id);
  });

  it('replaces the hint with the error rather than showing both', () => {
    const { container } = setup();
    const input = container.querySelector('input')!;
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);
    expect(container.textContent).not.toContain('نام کامل');
  });
});

describe('form — a form does not submit with invalid data', () => {
  it('refuses, and calls onInvalid instead', () => {
    const onSubmit = vi.fn();
    const onInvalid = vi.fn();
    const { container } = setup({ onSubmit, onInvalid });
    fireEvent.submit(container.querySelector('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
    expect(onInvalid).toHaveBeenCalled();
  });

  it('submits the values when every field passes', () => {
    const onSubmit = vi.fn();
    const { container } = setup({ onSubmit });
    const [name, mail] = [...container.querySelectorAll('input')];
    fireEvent.change(name, { target: { value: 'Starli' } });
    fireEvent.change(mail, { target: { value: 'a@b.c' } });
    fireEvent.submit(container.querySelector('form')!);
    expect(onSubmit).toHaveBeenCalledWith({ name: 'Starli', email: 'a@b.c' }, expect.anything());
  });

  it('marks every field touched on submit, so the errors are all visible', () => {
    const { container } = setup();
    fireEvent.submit(container.querySelector('form')!);
    expect(container.querySelectorAll('[role="alert"]').length).toBe(2);
  });

  it('turns the browser’s own validation off, because this one is better', () => {
    const { container } = setup();
    expect(container.querySelector('form')!.hasAttribute('novalidate')).toBe(true);
  });
});

describe('input — the control height is exactly its token', () => {
  // It was not. `CONTROL.md` says 44 and the input rendered at 48, because the
  // padding was a fixed value and `minHeight` is only a floor: 26 (line box) +
  // 2x10 (padding) + 2 (border) is 48.
  //
  // A fixed padding cannot be right, because the padding plus the content must
  // equal the declared height and the content differs between a Button and an
  // Input. So the vertical padding is DERIVED — `calc((44px - 1lh - 2px) / 2)` —
  // and the control is exactly its declared height at every viewport, because
  // `1lh` follows the fluid type and the padding absorbs the difference.
  it('derives the vertical padding from the control height', () => {
    const { container } = render(<Input size="md" />);
    const wrapper = container.querySelector('input')!.parentElement!;
    const padding = wrapper.style.paddingBlock || wrapper.style.paddingTop;
    expect(padding).toContain('1lh');
    expect(padding).toContain('44px');
  });

  it('uses the engine’s control scale, not a literal', () => {
    for (const [size, expected] of [['sm', 32], ['md', 44], ['lg', 52]] as const) {
      const { container } = render(<Input size={size} />);
      const wrapper = container.querySelector('input')!.parentElement!;
      expect(wrapper.style.minHeight, size).toBe(`${expected}px`);
      cleanup();
    }
  });

  it('defaults to md, which is also the accessible minimum', () => {
    const { container } = render(<Input />);
    expect(container.querySelector('input')!.parentElement!.style.minHeight).toBe('44px');
  });
});
