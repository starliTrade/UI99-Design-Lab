/**
 * LIMINAL · DOCS — THE APP
 *
 * The site the library is read through. It replaces the old demo, which was a
 * mock browser with fifteen tabs: everything in one long page, nothing
 * addressable, and no place for a component to have a page of its own.
 *
 * Routing is state, not a URL router, for the same reason the old demo used it:
 * this ships as a static bundle and a route table is enough. The table is one
 * row per page, and the sidebar, the search and the switch all read it.
 */
import React, { useState } from 'react';
import { ThemeProvider } from './theme';
import { DirProvider, type Direction } from '../engine/liminal-direction';
import { DocsShell } from './shell';
import { OverviewPage } from './pages/Overview';
import { ComponentsPage } from './pages/Components';
import { ComponentPage } from './pages/Component';
import { TokensPage } from './pages/Tokens';
import { ContractPage } from './pages/Contract';
import { Studio } from '../studio/Studio';
import { App as LegacyDemo } from '../App';
import { Section, Prose, S } from './ui';
import { routeKey, type Route } from './routes';

function ExamplesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <Section title="Examples" note="An app built from these components" role="work">
        <Prose>
          This is the old demo — login, dashboard, project, loading and 404. It was kept because
          a whole app is a better test than a showcase: a component that survives a real page
          survives a display case.
        </Prose>
      </Section>
      <div style={{ minWidth: 0 }}>
        <LegacyDemo />
      </div>
    </div>
  );
}

function Page({ route, go }: { route: Route; go: (r: Route) => void }) {
  switch (route.page) {
    case 'overview':
      return <OverviewPage go={(name) => go({ page: 'component', name })} />;
    case 'components':
      return <ComponentsPage go={(name) => go({ page: 'component', name })} />;
    case 'component':
      return <ComponentPage name={route.name} />;
    case 'tokens':
      return <TokensPage />;
    case 'contract':
      return <ContractPage />;
    case 'studio':
      return <Studio />;
    case 'examples':
      return <ExamplesPage />;
    default:
      return <OverviewPage go={(name) => go({ page: 'component', name })} />;
  }
}

export function DocsApp() {
  const [route, setRoute] = useState<Route>({ page: 'overview' });
  /**
   * The direction is a first-class switch, not a build flag.
   *
   * The engine's RTL work — logical properties, the positioning engine, the
   * Jalali calendar, Persian typography — has no way to be SEEN except by
   * flipping the page. So the page flips. `DirProvider` puts `dir` on the
   * document element, which is where the browser reads it from and where
   * portals inherit it too.
   */
  const [dir, setDir] = useState<Direction>('ltr');
  const key = routeKey(route);
  // A route change is a page change: scroll to the top, or the reader lands in
  // the middle of the next page.
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [key]);

  return (
    <ThemeProvider>
      <DirProvider dir={dir}>
      <DocsShell route={route} go={setRoute} dir={dir} onDir={setDir}>
        <div key={key} style={{ minWidth: 0 }}>
          <Page route={route} go={setRoute} />
        </div>
      </DocsShell>
      </DirProvider>
    </ThemeProvider>
  );
}

export default DocsApp;
