import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { ButtonGroup } from '../ButtonGroup/ButtonGroup';
import { InputGroup } from '../../inputs/InputGroup/InputGroup';
import { Button } from '../../atoms/Button/Button';
import { Input } from '../../inputs/Input/Input';

describe('ButtonGroup — a group, not a toolbar', () => {
  it('says the buttons belong together, with a name', () => {
    render(
      <ButtonGroup label="Actions">
        <Button>Save</Button>
        <Button>Delete</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('group', { name: 'Actions' })).toBeTruthy();
  });

  it('keeps every button its own tab stop', () => {
    // A TOOLBAR is one tab stop with arrows inside it, because its buttons are a
    // set of commands over one thing. These are independent actions — a reader
    // who wants Delete should not arrow past Save to reach it.
    render(
      <ButtonGroup label="Actions">
        <Button>Save</Button>
        <Button>Delete</Button>
      </ButtonGroup>,
    );
    for (const b of screen.getAllByRole('button')) {
      expect(b.getAttribute('tabindex')).not.toBe('-1');
    }
  });

  it('does not take the buttons’ own semantics', () => {
    render(
      <ButtonGroup label="Actions">
        <Button>Save</Button>
      </ButtonGroup>,
    );
    expect(screen.getByRole('button', { name: 'Save' })).toBeTruthy();
  });
});

describe('InputGroup — the addon is not decoration', () => {
  it('hides a UNIT from a screen reader, because the label already says what the field is', () => {
    // Reading "dollar" before "Amount" tells the reader nothing they did not
    // have. A unit is part of the value, not a second label.
    render(
      <InputGroup prefix="$" suffix="USD">
        <Input label="Amount" />
      </InputGroup>,
    );
    const prefix = screen.getByText('$');
    expect(prefix.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('USD').getAttribute('aria-hidden')).toBe('true');
  });

  it('leaves the field itself labelled and reachable', () => {
    render(
      <InputGroup prefix="$">
        <Input label="Amount" />
      </InputGroup>,
    );
    expect(screen.getByLabelText('Amount')).toBeTruthy();
  });

  it('is a control surface, so the ring covers the whole group', () => {
    const { container } = render(
      <InputGroup prefix="$">
        <Input label="Amount" />
      </InputGroup>,
    );
    expect(container.firstElementChild?.hasAttribute('data-liminal-surface')).toBe(true);
  });
});
