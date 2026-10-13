import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { Tabs, TabPanel } from '../nav/Tabs/Tabs';

afterEach(cleanup);

/**
 * `Tabs` rendered `role="tab"` with `aria-selected` and nothing else. There was
 * no `aria-controls`, no `role="tabpanel"` and no `aria-labelledby` anywhere in
 * the library — so a screen reader could read the tabs and had no way to reach
 * what they control. That is an incomplete ARIA Tabs pattern, not a missing
 * nicety.
 */
describe('Tabs — the two halves name each other', () => {
  const items = [{ id: 'a', label: 'A' }, { id: 'b', label: 'B' }];

  const renderTabs = (value = 'a') =>
    render(
      <Tabs items={items} value={value} onChange={() => {}}>
        <TabPanel value="a">Panel A</TabPanel>
        <TabPanel value="b">Panel B</TabPanel>
      </Tabs>,
    );

  it('gives every tab an id and an aria-controls', () => {
    const { container } = renderTabs();
    const tabs = [...container.querySelectorAll('[role="tab"]')];
    expect(tabs).toHaveLength(2);
    for (const t of tabs) {
      expect(t.getAttribute('id')).toBeTruthy();
      expect(t.getAttribute('aria-controls')).toBeTruthy();
    }
  });

  it('points each aria-controls at a real panel', () => {
    const { container } = renderTabs();
    for (const t of container.querySelectorAll('[role="tab"]')) {
      const panel = container.querySelector(`#${CSS.escape(t.getAttribute('aria-controls')!)}`);
      expect(panel, `panel for ${t.textContent}`).toBeTruthy();
      expect(panel!.getAttribute('role')).toBe('tabpanel');
    }
  });

  it('points each panel back at its tab', () => {
    const { container } = renderTabs();
    for (const p of container.querySelectorAll('[role="tabpanel"]')) {
      const label = p.getAttribute('aria-labelledby');
      expect(label).toBeTruthy();
      expect(container.querySelector(`#${CSS.escape(label!)}`)?.getAttribute('role')).toBe('tab');
    }
  });

  it('hides the panels that are not selected', () => {
    const { container } = renderTabs('a');
    const panels = [...container.querySelectorAll('[role="tabpanel"]')];
    expect(panels[0].hasAttribute('hidden')).toBe(false);
    expect(panels[1].hasAttribute('hidden')).toBe(true);
  });

  it('keeps the ids unique across two instances on one page', () => {
    const { container } = render(
      <>
        <Tabs items={[{ id: 'a', label: 'A' }]} value="a" onChange={() => {}}><TabPanel value="a">1</TabPanel></Tabs>
        <Tabs items={[{ id: 'a', label: 'A' }]} value="a" onChange={() => {}}><TabPanel value="a">2</TabPanel></Tabs>
      </>,
    );
    const ids = [...container.querySelectorAll('[id]')].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('makes a panel focusable, so the reader can move into it', () => {
    const { container } = renderTabs();
    expect(container.querySelector('[role="tabpanel"]')!.getAttribute('tabindex')).toBe('0');
  });
});
