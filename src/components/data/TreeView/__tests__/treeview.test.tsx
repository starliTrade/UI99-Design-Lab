import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TreeView } from '../TreeView';

const NODES = [
  { id: 'src', label: 'src', children: [{ id: 'engine', label: 'engine' }, { id: 'ui', label: 'ui' }] },
  { id: 'readme', label: 'README.md' },
];

/**
 * A tree is a composite widget with ONE tab stop and a SIX-part keyboard
 * contract. A tree that handles only ↑ ↓ has broken four promises, and the
 * reader finds out by pressing a key that does nothing.
 */
describe('TreeView — the structure a screen reader navigates', () => {
  it('is a tree, with treeitems inside it', () => {
    render(<TreeView nodes={NODES} label="Files" />);
    expect(screen.getByRole('tree', { name: 'Files' })).toBeTruthy();
    expect(screen.getAllByRole('treeitem')).toHaveLength(2);
  });

  it('says which nodes CAN be expanded, and only those', () => {
    // `aria-expanded` on a leaf tells a screen reader a lie about the node.
    render(<TreeView nodes={NODES} label="Files" />);
    const items = screen.getAllByRole('treeitem');
    expect(items[0].getAttribute('aria-expanded')).toBe('false');
    expect(items[1].getAttribute('aria-expanded')).toBeNull();
  });

  it('reports depth, so the hierarchy is announced', () => {
    render(<TreeView nodes={NODES} label="Files" expanded={['src']} />);
    const items = screen.getAllByRole('treeitem');
    expect(items[0].getAttribute('aria-level')).toBe('1');
    expect(items[1].getAttribute('aria-level')).toBe('2');
  });

  it('puts the children in a group INSIDE the parent, which is what nesting means', () => {
    const { container } = render(<TreeView nodes={NODES} label="Files" expanded={['src']} />);
    const parent = container.querySelector('[role=treeitem]')!;
    expect(parent.querySelector('[role=group]')).toBeTruthy();
  });
});

describe('TreeView — one tab stop, six keys', () => {
  it('is ONE tab stop, not one per node', () => {
    render(<TreeView nodes={NODES} label="Files" />);
    const tabbable = screen.getAllByRole('treeitem').filter((i) => i.getAttribute('tabindex') === '0');
    expect(tabbable).toHaveLength(1);
  });

  it('↓ and ↑ move through the VISIBLE nodes', () => {
    render(<TreeView nodes={NODES} label="Files" />);
    const items = screen.getAllByRole('treeitem');
    fireEvent.keyDown(items[0], { key: 'ArrowDown' });
    expect(screen.getAllByRole('treeitem')[1].getAttribute('tabindex')).toBe('0');
    fireEvent.keyDown(screen.getAllByRole('treeitem')[1], { key: 'ArrowUp' });
    expect(screen.getAllByRole('treeitem')[0].getAttribute('tabindex')).toBe('0');
  });

  it('→ expands a closed node', () => {
    render(<TreeView nodes={NODES} label="Files" />);
    fireEvent.keyDown(screen.getAllByRole('treeitem')[0], { key: 'ArrowRight' });
    expect(screen.getAllByRole('treeitem')[0].getAttribute('aria-expanded')).toBe('true');
  });

  it('→ steps INTO an open node — the half a tree usually forgets', () => {
    // UNCONTROLLED, so the tree owns its own expansion. A controlled tree with
    // no `onExpandedChange` is a tree whose state cannot move, and the first
    // version of this test rendered one and blamed the component.
    render(<TreeView nodes={NODES} label="Files" />);
    const first = screen.getAllByRole('treeitem')[0];
    fireEvent.keyDown(first, { key: 'ArrowRight' }); // expand
    fireEvent.keyDown(screen.getAllByRole('treeitem')[0], { key: 'ArrowRight' }); // step in
    expect(screen.getAllByRole('treeitem')[1].getAttribute('tabindex')).toBe('0');
  });

  it('← collapses an open node', () => {
    render(<TreeView nodes={NODES} label="Files" />);
    fireEvent.keyDown(screen.getAllByRole('treeitem')[0], { key: 'ArrowRight' });
    expect(screen.getAllByRole('treeitem')[0].getAttribute('aria-expanded')).toBe('true');
    fireEvent.keyDown(screen.getAllByRole('treeitem')[0], { key: 'ArrowLeft' });
    expect(screen.getAllByRole('treeitem')[0].getAttribute('aria-expanded')).toBe('false');
  });

  it('← steps OUT to the parent when the node is already closed', () => {
    render(<TreeView nodes={NODES} label="Files" />);
    fireEvent.keyDown(screen.getAllByRole('treeitem')[0], { key: 'ArrowRight' });
    fireEvent.keyDown(screen.getAllByRole('treeitem')[1], { key: 'ArrowLeft' });
    expect(screen.getAllByRole('treeitem')[0].getAttribute('tabindex')).toBe('0');
  });

  it('Home and End go to the ends of the VISIBLE list', () => {
    render(<TreeView nodes={NODES} label="Files" />);
    fireEvent.keyDown(screen.getAllByRole('treeitem')[0], { key: 'End' });
    expect(screen.getAllByRole('treeitem')[1].getAttribute('tabindex')).toBe('0');
    fireEvent.keyDown(screen.getAllByRole('treeitem')[1], { key: 'Home' });
    expect(screen.getAllByRole('treeitem')[0].getAttribute('tabindex')).toBe('0');
  });

  it('Enter selects, and reports it', () => {
    const onSelect = vi.fn();
    render(<TreeView nodes={NODES} label="Files" onSelect={onSelect} />);
    fireEvent.keyDown(screen.getAllByRole('treeitem')[1], { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith('readme');
  });

  it('a disabled node cannot be selected', () => {
    const onSelect = vi.fn();
    render(<TreeView nodes={[{ id: 'a', label: 'A', disabled: true }]} label="Files" onSelect={onSelect} />);
    fireEvent.keyDown(screen.getAllByRole('treeitem')[0], { key: 'Enter' });
    expect(onSelect).not.toHaveBeenCalled();
  });
});

describe('TreeView — selection is not the same as focus', () => {
  it('moving through the tree does not select anything', () => {
    const onSelect = vi.fn();
    render(<TreeView nodes={NODES} label="Files" onSelect={onSelect} />);
    fireEvent.keyDown(screen.getAllByRole('treeitem')[0], { key: 'ArrowDown' });
    // A reader can look around without choosing.
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('says which node is selected', () => {
    render(<TreeView nodes={NODES} label="Files" selected="readme" onSelect={() => {}} />);
    const items = screen.getAllByRole('treeitem');
    expect(items[0].getAttribute('aria-selected')).toBe('false');
    expect(items[1].getAttribute('aria-selected')).toBe('true');
  });
});
