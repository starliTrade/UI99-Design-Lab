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
import { AppFrame } from './AppFrame';
import { Section, Prose, Value, S } from './ui';
import { routeKey, type Route } from './routes';

/**
 * EXAMPLES — the same app the hero shows, at full width.
 *
 * It used to be the old demo: a 1280-line page with fifteen tabs, its own
 * topbar and its own device switch, embedded inside the site that replaced it.
 * «نه این حجم از ارتفاع صفحه تب دار» — the tabs were the problem, and a page
 * that embeds the thing it replaced is a page with two designs in it.
 *
 * The app kit was always the good part: five real screens built from the
 * library. It is the whole page now, in the frame, with the screen switch.
 */
function ExamplesPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <Section title="Examples" note="A whole app, built from these components" role="work">
        <Prose>
          Five screens — dashboard, project, login, loading, 404 — assembled from the library and
          nothing else. A whole app is a better test than a showcase: a component that survives a
          real page survives a display case. Change the width and the app's own breakpoints answer.
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          <Value label="Dashboard" value="a table, stats, a sidebar and a breadcrumb" />
          <Value label="Project" value="a detail page with tabs and a tree" />
          <Value label="Login" value="a form, a field and the auth gate" />
          <Value label="Loading" value="the skeleton state" />
          <Value label="404" value="the error page" />
        </div>
      </Section>
      <AppFrame />
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
      // THE TOOL KEEPS ITS OWN LIST HERE, and that is a correction.
      //
      // It was `showList={false}`, on the reasoning that the docs' sidebar is
      // the list — but the sidebar NAVIGATES, it does not select: clicking a
      // component there leaves the studio for that component's page. So the
      // studio page could only ever review `FIXTURES[0]`, and a tool that shows
      // one component is not the tool. The component pages still pass
      // `showList={false}`, because there the sidebar's choice IS the selection.
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
