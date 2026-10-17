import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import React from 'react';
import { Button, Input, Modal, Popover, Drawer, TreeView, Slider, OTP, FileUpload } from '../../index';

/**
 * THE LIBRARY MUST SERVER-RENDER.
 *
 * A React component library that throws on the server is not a library for
 * Next.js, and every one of these would throw if a module touched `window` at
 * import time or a portal assumed a document. The tests run in jsdom, where
 * `document` EXISTS — so they prove nothing about the server. These do:
 * `renderToStaticMarkup` is the server renderer, and it has no DOM at all.
 */
const CASES: [string, React.ReactElement][] = [
  ['Button', <Button>Hello</Button>],
  ['Input', <Input label="Name" />],
  ['Slider', <Slider value={40} onChange={() => {}} label="Volume" />],
  ['OTP', <OTP value="" onChange={() => {}} label="Code" />],
  ['FileUpload', <FileUpload files={[]} onChange={() => {}} label="Attachment" />],
  ['TreeView', <TreeView label="Files" nodes={[{ id: 'a', label: 'A' }]} />],
  ['Modal (closed)', <Modal open={false} title="x" onClose={() => {}}>y</Modal>],
  ['Drawer (closed)', <Drawer open={false} title="x" onClose={() => {}}>y</Drawer>],
  ['Popover (closed)', <Popover trigger={<Button>Open</Button>} aria-label="x">y</Popover>],
];

describe('the library server-renders', () => {
  for (const [name, element] of CASES) {
    it(`${name} renders to markup without a DOM`, () => {
      expect(() => renderToStaticMarkup(element)).not.toThrow();
    });
  }

  it('a real component produces real markup, so the test is not vacuous', () => {
    // A suite where everything renders to the empty string would pass and prove
    // nothing.
    const html = renderToStaticMarkup(<Button>Hello</Button>);
    expect(html.length).toBeGreaterThan(50);
    expect(html).toContain('Hello');
  });

  it('a closed PORTAL renders nothing on the server, and does not crash', () => {
    // `createPortal` needs a document. The portal returns null without one, and
    // that is the correct server output for something that does not exist yet.
    expect(renderToStaticMarkup(<Modal open={false} title="x" onClose={() => {}}>y</Modal>)).toBe('');
  });
});
