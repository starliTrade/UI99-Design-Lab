import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { OTP } from '../OTP';

/**
 * The OTP is ONE input, and the tests are about why.
 *
 * The obvious implementation is N inputs, one per digit. The failures are not
 * cosmetic: paste has nowhere to land, `autocomplete="one-time-code"` is a
 * property of one field, and a screen reader meets six unlabelled boxes instead
 * of one field called "Verification code".
 */
describe('OTP — it is ONE field', () => {
  it('a screen reader meets one labelled field, not six boxes', () => {
    render(<OTP value="" onChange={() => {}} label="Verification code" />);
    const fields = screen.getAllByRole('textbox');
    expect(fields).toHaveLength(1);
    expect(screen.getByLabelText('Verification code')).toBe(fields[0]);
  });

  it('the boxes are a rendering of the value, not controls', () => {
    // Six focusable boxes is six tab stops for one value.
    render(<OTP value="4829" onChange={() => {}} label="Verification code" />);
    expect(screen.getAllByRole('textbox')).toHaveLength(1);
  });

  it('asks the platform for a numeric keyboard and a one-time code', () => {
    render(<OTP value="" onChange={() => {}} label="Verification code" />);
    const input = screen.getByLabelText('Verification code');
    expect(input.getAttribute('inputmode')).toBe('numeric');
    // This is the attribute that lets a phone offer the code from the SMS. It
    // only works on ONE field.
    expect(input.getAttribute('autocomplete')).toBe('one-time-code');
    expect(input.getAttribute('maxlength')).toBe('6');
  });
});

describe('OTP — paste and typing', () => {
  it('accepts a whole code pasted at once', () => {
    // The reason for one input. A code arrives as a single string, and N inputs
    // have nowhere to put it.
    const onChange = vi.fn();
    render(<OTP value="" onChange={onChange} label="Verification code" />);
    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '482913' } });
    expect(onChange).toHaveBeenCalledWith('482913');
  });

  it('strips anything that is not a digit', () => {
    const onChange = vi.fn();
    render(<OTP value="" onChange={onChange} label="Verification code" />);
    fireEvent.change(screen.getByLabelText('Verification code'), { target: { value: '48-29 13' } });
    expect(onChange).toHaveBeenCalledWith('482913');
  });

  it('never exceeds its length', () => {
    const onChange = vi.fn();
    render(<OTP value="" onChange={onChange} length={4} label="Code" />);
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: '123456789' } });
    expect(onChange).toHaveBeenCalledWith('1234');
  });

  it('says when it is complete, so a consumer does not poll', () => {
    const onComplete = vi.fn();
    render(<OTP value="" onChange={() => {}} onComplete={onComplete} length={4} label="Code" />);
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: '1234' } });
    expect(onComplete).toHaveBeenCalledWith('1234');
  });

  it('does NOT announce completion early', () => {
    const onComplete = vi.fn();
    render(<OTP value="" onChange={() => {}} onComplete={onComplete} length={4} label="Code" />);
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: '123' } });
    expect(onComplete).not.toHaveBeenCalled();
  });
});

describe('OTP — the error state', () => {
  it('says it is invalid and points at the message', () => {
    render(<OTP value="" onChange={() => {}} label="Code" error="That code has expired" />);
    const input = screen.getByLabelText('Code');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const id = input.getAttribute('aria-describedby');
    expect(document.getElementById(id!)).toBe(screen.getByText('That code has expired'));
  });

  it('announces the message', () => {
    render(<OTP value="" onChange={() => {}} label="Code" error="That code has expired" />);
    expect(screen.getByRole('alert')).toBe(screen.getByText('That code has expired'));
  });

  it('the error REPLACES the completion note — one line, and it is the urgent one', () => {
    render(<OTP value="1234" onChange={() => {}} length={4} label="Code" error="Expired" />);
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Expired')).toBeTruthy();
  });
});
