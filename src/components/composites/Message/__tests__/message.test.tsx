import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { Message, Bubble, MessageList } from '../Message';

describe('MessageList — a log, which announces without stealing focus', () => {
  it('is a live region with a name', () => {
    render(<MessageList label="Conversation"><Message>Hi</Message></MessageList>);
    expect(screen.getByRole('log', { name: 'Conversation' })).toBeTruthy();
  });

  it('is a list, so the messages are countable', () => {
    render(
      <MessageList label="Conversation">
        <Message>One</Message>
        <Message>Two</Message>
      </MessageList>,
    );
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });
});

describe('Message — the sender is not colour', () => {
  it('puts the sender in the DOM as text, not only in the fill', () => {
    // A reader who cannot see the difference between two surfaces is told by the
    // label. Colour is the second signal, never the only one.
    render(<MessageList label="Chat"><Message from="me" name="You">Mine</Message></MessageList>);
    expect(screen.getByText('You')).toBeTruthy();
  });

  it('carries the direction as data, so the tail can be styled from it', () => {
    const { container } = render(<Bubble from="me">Mine</Bubble>);
    expect(container.firstElementChild?.getAttribute('data-from')).toBe('me');
  });

  it('a follow-up in a run can drop the tail', () => {
    const { container } = render(<Bubble from="them" tail={false}>Follow-up</Bubble>);
    expect(container.firstElementChild?.hasAttribute('data-tail')).toBe(false);
  });
});

describe('Bubble — the tail mirrors, the text does not', () => {
  it('uses LOGICAL corners, so the square one points at the sender in both directions', () => {
    // A tail on the start edge is on the left in English and the right in
    // Arabic. The words inside run right-to-left because they are Arabic, not
    // because the layout said so — a component that mirrors its text has broken
    // the text.
    const { container: mine } = render(<Bubble from="me">Mine</Bubble>);
    const mineEl = mine.firstElementChild as HTMLElement;
    expect(mineEl.style.borderEndEndRadius).toBe('6px');
    expect(mineEl.style.borderEndStartRadius).toBe('16px');

    const { container: theirs } = render(<Bubble from="them">Theirs</Bubble>);
    const theirsEl = theirs.firstElementChild as HTMLElement;
    expect(theirsEl.style.borderEndStartRadius).toBe('6px');
    expect(theirsEl.style.borderEndEndRadius).toBe('16px');
  });

  it('opts into the layer AND publishes the variables', () => {
    // The guard that caught InputGroup: opting in without publishing leaves a
    // variable nothing reads, and the bubble renders transparent.
    const { container } = render(<Bubble from="them">Theirs</Bubble>);
    const el = container.firstElementChild as HTMLElement;
    expect(el.hasAttribute('data-liminal-surface')).toBe(true);
    expect(el.style.getPropertyValue('--liminal-surface-idle')).toBeTruthy();
  });

  it('gives the tail a colour, because a pseudo-element cannot be reached from a style attribute', () => {
    const { container } = render(<Bubble from="me">Mine</Bubble>);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue('--liminal-bubble-tail')).toBeTruthy();
  });
});
