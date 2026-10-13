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
      <Section title="نمونه‌ها" note="یک اپ ساخته‌شده با همین کامپوننت‌ها" role="work">
        <Prose>
          این همان دموی قبلی است — ورود، داشبورد، پروژه، حالت بارگذاری و ۴۰۴. نگه داشته شد چون
          یک اپِ کامل است، نه یک ویترین: اگر کامپوننتی در یک صفحهٔ واقعی نشکند، در ویترین هم
          نمی‌شکند.
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
  const key = routeKey(route);
  // A route change is a page change: scroll to the top, or the reader lands in
  // the middle of the next page.
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [key]);

  return (
    <ThemeProvider>
      <DocsShell route={route} go={setRoute}>
        <div key={key} style={{ minWidth: 0 }}>
          <Page route={route} go={setRoute} />
        </div>
      </DocsShell>
    </ThemeProvider>
  );
}

export default DocsApp;
