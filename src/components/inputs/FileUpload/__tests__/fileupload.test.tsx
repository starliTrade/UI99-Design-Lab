import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { FileUpload } from '../FileUpload';

const file = (name: string) => new File(['x'], name, { type: 'application/pdf' });

describe('FileUpload — a real input, and a zone that is its label', () => {
  it('has a real file input in the accessibility tree', () => {
    // `display: none` would remove the only control in the component.
    render(<FileUpload files={[]} onChange={() => {}} label="Attachment" />);
    expect(screen.getByLabelText('Attachment')).toBeTruthy();
  });

  it('the zone IS the label, so it activates from the keyboard', () => {
    // A div with an onClick handler works with a mouse and fails everywhere
    // else: not focusable, Enter does nothing, and a screen reader announces a
    // group with no control in it.
    const { container } = render(<FileUpload files={[]} onChange={() => {}} label="Attachment" />);
    const labels = container.querySelectorAll('label[for]');
    expect(labels.length).toBeGreaterThanOrEqual(1);
    const zone = [...labels].find((l) => l.textContent?.includes('Choose a file'));
    expect(zone?.getAttribute('for')).toBe(screen.getByLabelText('Attachment').id);
  });

  it('reports the files it was given', () => {
    render(<FileUpload files={[file('a.pdf')]} onChange={() => {}} label="Attachment" />);
    expect(screen.getByText('a.pdf')).toBeTruthy();
  });
});

describe('FileUpload — the list', () => {
  it('is a list', () => {
    render(<FileUpload files={[file('a.pdf'), file('b.pdf')]} onChange={() => {}} label="Attachment" />);
    expect(screen.getByRole('list')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('names each remove button WITH its file', () => {
    // Five buttons called "Remove" is five identical controls to a screen reader.
    render(<FileUpload files={[file('a.pdf'), file('b.pdf')]} onChange={() => {}} label="Attachment" />);
    expect(screen.getByRole('button', { name: 'Remove a.pdf' })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Remove b.pdf' })).toBeTruthy();
  });

  it('removing reports the list without that file', () => {
    const onChange = vi.fn();
    render(<FileUpload files={[file('a.pdf'), file('b.pdf')]} onChange={onChange} label="Attachment" />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove a.pdf' }));
    const next = onChange.mock.calls[0][0] as File[];
    expect(next).toHaveLength(1);
    expect(next[0].name).toBe('b.pdf');
  });
});

describe('FileUpload — the error state', () => {
  it('says it is invalid and points at the message', () => {
    render(<FileUpload files={[]} onChange={() => {}} label="Attachment" error="That file is too large" />);
    const input = screen.getByLabelText('Attachment');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert')).toBe(screen.getByText('That file is too large'));
  });

  it('describes the input with the hint when there is no error', () => {
    render(<FileUpload files={[]} onChange={() => {}} label="Attachment" hint="PDF, up to 10MB" />);
    const input = screen.getByLabelText('Attachment');
    const id = input.getAttribute('aria-describedby');
    expect(document.getElementById(id!)).toBe(screen.getByText('PDF, up to 10MB'));
  });
});

describe('FileUpload — the zone is a target', () => {
  it('is at least the control height, because a target must be reachable', () => {
    const { container } = render(<FileUpload files={[]} onChange={() => {}} label="Attachment" size="md" />);
    const zone = [...container.querySelectorAll('label')].find((l) => l.textContent?.includes('Choose a file')) as HTMLElement;
    expect(parseInt(zone.style.minHeight, 10)).toBeGreaterThanOrEqual(44);
  });

  it('accepts a drop', () => {
    const onChange = vi.fn();
    const { container } = render(<FileUpload files={[]} onChange={onChange} label="Attachment" />);
    const zone = [...container.querySelectorAll('label')].find((l) => l.textContent?.includes('Choose a file'))!;
    fireEvent.drop(zone, { dataTransfer: { files: [file('dropped.pdf')] } });
    expect(onChange).toHaveBeenCalled();
    expect((onChange.mock.calls[0][0] as File[])[0].name).toBe('dropped.pdf');
  });
});
