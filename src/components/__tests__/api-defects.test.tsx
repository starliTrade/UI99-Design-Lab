import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Modal } from '../containers/Modal/Modal';
import { Select } from '../inputs/Select/Select';
import { Checkbox } from '../inputs/Checkbox/Checkbox';
import { Radio } from '../inputs/Radio/Radio';

afterEach(cleanup);

describe('Modal — an id that cannot be duplicated', () => {
  // It was `id="liminal-modal-title"`, a fixed string. Two modals on one page
  // produced duplicate ids and `aria-labelledby` pointed at whichever the
  // browser found first, so the second dialog was announced by the first
  // dialog's title.
  // Modal renders through a portal, so it is in document.body, not in the
  // container the render returns.
  const idOf = () => document.querySelector('[role="dialog"] h2')?.id;

  it('gives each instance its own title id', () => {
    render(<Modal open title="First" onClose={() => {}}>x</Modal>);
    const a = idOf();
    cleanup();
    render(<Modal open title="Second" onClose={() => {}}>x</Modal>);
    const b = idOf();
    expect(a).toBeTruthy();
    expect(b).toBeTruthy();
    expect(a).not.toBe(b);
  });

  it('points aria-labelledby at its own title', () => {
    render(<Modal open title="Only" onClose={() => {}}>x</Modal>);
    const dialog = document.querySelector('[role="dialog"]')!;
    const label = dialog.getAttribute('aria-labelledby');
    expect(label).toBeTruthy();
    expect(document.getElementById(label!)?.textContent).toBe('Only');
  });

  it('leaves the source free of the fixed id', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/components/containers/Modal/Modal.tsx'), 'utf8');
    expect(src).not.toContain("'liminal-modal-title'");
    expect(src).not.toContain('"liminal-modal-title"');
  });
});

describe('Select — one onChange signature', () => {
  // It accepted either `(value: string)` or `(event)` and tried to tell them
  // apart with `try { onChange(value) } catch { onChange(e) }`. Calling an
  // event-style handler with a string does NOT throw, so the catch never fired
  // and the caller silently received a string where it expected an event.
  it('declares exactly one signature', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/components/inputs/Select/Select.tsx'), 'utf8');
    expect(src).toContain('onChange?: (value: string) => void;');
    expect(src).not.toContain('ChangeEvent<HTMLSelectElement>) => void');
  });

  it('has no try/catch around the callback', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/components/inputs/Select/Select.tsx'), 'utf8');
    // The whole body of the change handler, so a `try` elsewhere in the file
    // cannot satisfy or trip this.
    const body = src.slice(src.indexOf('const handleChange'), src.indexOf('const handleFocus'));
    expect(body).not.toContain('try');
    expect(body).not.toContain('catch');
  });

  it('calls the handler with the value', () => {
    const seen: string[] = [];
    const { container } = render(
      <Select label="Pick" options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }]} onChange={(v) => seen.push(v)} />,
    );
    const select = container.querySelector('select')!;
    select.value = 'b';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(seen).toEqual(['b']);
  });
});

describe('the public barrel — every category is reachable', () => {
  it('re-exports layout and composites', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/components/index.ts'), 'utf8');
    for (const cat of ['atoms', 'inputs', 'containers', 'feedback', 'data', 'nav', 'layout', 'composites']) {
      expect(src, cat).toContain(`export * from './${cat}';`);
    }
  });
});

describe('the motion engine — no side effect on import', () => {
  const src = readFileSync(resolve(process.cwd(), 'src/engine/liminal-motion-engine.ts'), 'utf8');

  it('does not touch the document at module scope', () => {
    // It injected a <style> into document.head on import, which makes the
    // module non-tree-shakeable and RSC-hostile.
    expect(src).not.toContain('document.createElement');
    expect(src).not.toContain('document.head.appendChild');
  });

  it('keeps the keyframes in a stylesheet instead', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/engine/liminal-motion.css'), 'utf8');
    expect(css).toContain('@keyframes');
    const index = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
    expect(index).toContain('liminal-motion.css');
  });

  it('names the properties a transition may animate', () => {
    // `transition: all` animates layout properties too.
    expect(src).toContain('ANIMATABLE');
    expect(src).not.toMatch(/`all \$\{/);
  });

  it('has no dead reduced-motion style with !important', () => {
    // React ignores `!important` in an inline style object, so it could not
    // have worked even if something had used it. Nothing did. The comment that
    // records the removal names it, so this checks for the DECLARATION.
    expect(src).not.toMatch(/REDUCED_MOTION_STYLE\s*=/);
    // `!important` as a VALUE, not as the word in the comment that records the
    // removal — a bare substring check would fail on its own explanation.
    expect(src).not.toMatch(/'[^']*!important[^']*'/);
  });
});

describe('Checkbox and Radio — focus the control, not its label', () => {
  // The label carried `tabIndex={0}` and the real input `tabIndex={-1}`, so
  // focus landed on a non-interactive element. A screen reader may not announce
  // "checkbox, checked" for a label, and the browser's own focus ring goes to
  // the wrong box.
  for (const [name, ui] of [
    ['Checkbox', <Checkbox checked={false} onChange={() => {}} label="Agree" />],
    ['Radio', <Radio checked={false} onChange={() => {}} name="g" value="a" label="One" />],
  ] as const) {
    it(`${name} puts the tab stop on the input`, () => {
      const { container } = render(ui);
      const input = container.querySelector('input')!;
      const label = container.querySelector('label')!;
      expect(input.getAttribute('tabindex')).toBe('0');
      expect(label.hasAttribute('tabindex')).toBe(false);
    });
  }
});

describe('Modal — the background is inert, not merely announced as inert', () => {
  it('marks the rest of the page inert while it is open', () => {
    const outside = document.createElement('div');
    outside.id = 'root';
    const sibling = document.createElement('div');
    sibling.textContent = 'behind';
    outside.appendChild(sibling);
    document.body.appendChild(outside);
    render(<Modal open title="D" onClose={() => {}}>x</Modal>);
    expect(sibling.hasAttribute('inert')).toBe(true);
    cleanup();
    expect(sibling.hasAttribute('inert')).toBe(false);
    outside.remove();
  });
});
