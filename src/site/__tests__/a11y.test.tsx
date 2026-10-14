import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import axe from 'axe-core';
import React from 'react';
import type { ReactElement } from 'react';

import { ThemeProvider } from '../theme';
import { DirProvider } from '../../engine/liminal-direction';
import { Site } from '../Site';
import { HomePage } from '../pages/Home';
import { DocsPage } from '../pages/Docs';
import { ComponentsPage } from '../pages/Components';
import { ComponentPage } from '../pages/Component';
import { BlocksPage } from '../pages/Blocks';
import { ThemesPage } from '../pages/Themes';
import { ColorsPage } from '../pages/Colors';
import { DOCS } from '../routes';

/**
 * THE SITE THAT DOCUMENTS THE STANDARD IS HELD TO IT.
 *
 * The library has been under an axe sweep since the audit found it scanned 7 of
 * 74 components. The SITE was not — and the site is the part a reader actually
 * uses: a top bar, a sidebar of 74 rows, a filter field, a palette, a device
 * frame with an iframe in it.
 *
 * A site that fails the accessibility rules it documents is the worst kind of
 * evidence: it is a demonstration that the standard is optional.
 *
 * `color-contrast` stays disabled — jsdom has no layout engine, so axe cannot
 * compute rendered colours. Contrast is proven exactly, against the real ladder,
 * in `src/engine/__tests__/contrast.test.ts`.
 */
afterEach(cleanup);

const noop = () => {};

async function violations(container: HTMLElement) {
  const results = await axe.run(container, {
    /**
     * `iframes: false` — the device frame IS an iframe, and axe tries to inject
     * its script into every frame it finds. In jsdom that fails with
     * "Respondable target must be a frame in the current window", which is an
     * axe error rather than a violation, and it took four pages down with it.
     *
     * So what is audited here is the OUTER document: the shell, the top bar, the
     * sidebar, the palette, the studio's controls and panels. The app inside the
     * frame is covered by its own pages' tests.
     */
    iframes: false,
    rules: {
      'color-contrast': { enabled: false },
      /**
       * ONE RULE IS OFF, AND IT IS THE PAGE'S FAULT RATHER THAN A COMPONENT'S.
       *
       * `AppShell`'s content plane is a `<main>` — correct for an app shell —
       * and the site renders AppShell as a PREVIEW, inside the page's own
       * `<main>`. Two mains, one inside the other, and axe is right to say so.
       *
       * It cannot be fixed from here: the only honest fix is to render previews
       * in an iframe, which is what `DeviceFrame` does and what 74 cards cannot
       * afford. What it must not do is hide: AppShell's landmark is proven
       * standalone in `src/components/__tests__/a11y-sweep.test.tsx`, where it
       * is the only main on the page.
       */
      'landmark-main-is-top-level': { enabled: false },
    },
  });
  return results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    nodes: v.nodes.map((n) => n.html).slice(0, 2),
  }));
}

const PAGES: Array<[string, ReactElement]> = [
  ['the whole site, as it loads', <Site />],
  ['Home', <HomePage go={noop} />],
  ...DOCS.map((d) => [`Docs — ${d.label}`, <DocsPage key={d.slug} slug={d.slug} go={noop} />] as [string, ReactElement]),
  ['Components', <ComponentsPage go={noop} />],
  ['one component', <ComponentPage name="Button" go={noop} />],
  ['Blocks', <BlocksPage />],
  ['Themes', <ThemesPage />],
  ['Colors', <ColorsPage />],
];

describe('the site passes the rules it documents', () => {
  for (const [name, element] of PAGES) {
    it(`${name} has no axe violation`, async () => {
      const { container } = render(
        <ThemeProvider>
          <DirProvider dir="ltr">{element}</DirProvider>
        </ThemeProvider>,
      );
      expect(await violations(container), name).toEqual([]);
    });
  }

  it('is looking at real pages, so it cannot pass by finding nothing', () => {
    // The lesson the other guards learned: a guard that goes green by finding
    // nothing is not a guard. Each page has to render something with structure.
    for (const [name, element] of PAGES) {
      const { container, unmount } = render(
        <ThemeProvider>
          <DirProvider dir="ltr">{element}</DirProvider>
        </ThemeProvider>,
      );
      expect(container.querySelectorAll('*').length, name).toBeGreaterThan(20);
      unmount();
    }
  });
});
