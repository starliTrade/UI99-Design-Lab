import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Spinner } from '../Spinner/Spinner';
import { Kbd } from '../Kbd/Kbd';
import { Label } from '../Label/Label';
import { Collapsible } from '../../containers/Collapsible/Collapsible';

describe('Spinner', () => {
  it('announces that something is happening', () => {
    // A spinner that appears silently is one a screen reader never announces,
    // and the reader is left wondering whether their click registered.
    render(<Spinner label="Loading projects" />);
    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText('Loading projects')).toBeTruthy();
  });

  it('requires a label — "loading" alone tells the reader nothing', () => {
    // The prop is not optional in the type; this asserts the type is honest.
    render(<Spinner label="Loading projects" labelHidden />);
    expect(screen.getByText('Loading projects')).toBeTruthy();
  });
});

describe('Kbd', () => {
  it('is a real kbd, so the platform reads it as input', () => {
    const { container } = render(<Kbd keys={['⌘', 'K']} />);
    expect(container.querySelectorAll('kbd')).toHaveLength(2);
    expect(screen.getByText('⌘')).toBeTruthy();
  });

  it('renders a single key from children', () => {
    const { container } = render(<Kbd>Enter</Kbd>);
    expect(container.querySelector('kbd')?.textContent).toBe('Enter');
  });
});

describe('Label', () => {
  it('is tied to a control — a label with no `for` is a decoration', () => {
    render(
      <>
        <Label htmlFor="field">Project name</Label>
        <input id="field" />
      </>,
    );
    expect(screen.getByLabelText('Project name')).toBe(screen.getByRole('textbox'));
  });

  it('marks required visually, and says nothing on its own', () => {
    // The marker is aria-hidden: the INPUT carries aria-required, and a label
    // that also announces it is a screen reader saying it twice.
    const { container } = render(<Label htmlFor="f" required>Name</Label>);
    const marker = container.querySelector('span[aria-hidden]');
    expect(marker?.textContent).toBe('*');
  });

  it('shows the error in the danger role', () => {
    render(<Label htmlFor="f" error="That name is taken">Name</Label>);
    expect(screen.getByText('Name')).toBeTruthy();
  });
});

describe('Collapsible', () => {
  it('says BOTH the state and what it applies to', () => {
    // `aria-expanded` is the state; `aria-controls` is the object. A disclosure
    // with only the first is a state with no object.
    render(<Collapsible title="Advanced settings"><span>Body</span></Collapsible>);
    const trigger = screen.getByRole('button', { name: /Advanced settings/ });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    const controls = trigger.getAttribute('aria-controls');
    expect(controls).toBeTruthy();
  });

  it('opens, and the region is labelled by the trigger', () => {
    render(<Collapsible title="Advanced settings" defaultOpen><span>Body</span></Collapsible>);
    const trigger = screen.getByRole('button', { name: /Advanced settings/ });
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const region = screen.getByRole('region');
    expect(region.getAttribute('aria-labelledby')).toBe(trigger.id);
    expect(screen.getByText('Body')).toBeTruthy();
  });

  it('reports the change', () => {
    const onOpenChange = vi.fn();
    render(<Collapsible title="Advanced settings" onOpenChange={onOpenChange}><span>Body</span></Collapsible>);
    fireEvent.click(screen.getByRole('button', { name: /Advanced settings/ }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it('a disabled trigger does not open', () => {
    const onOpenChange = vi.fn();
    render(<Collapsible title="Advanced settings" disabled onOpenChange={onOpenChange}><span>Body</span></Collapsible>);
    fireEvent.click(screen.getByRole('button', { name: /Advanced settings/ }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
