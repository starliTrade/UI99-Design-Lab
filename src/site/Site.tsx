/**
 * LIMINAL · SITE
 *
 * The product site: a landing page, the docs, the components, the blocks, the
 * themes and the colours — and the studio, which is the tool the rest of it is
 * about.
 *
 * IT IS SHAPED LIKE A COMPONENT LIBRARY'S SITE, because that shape is settled:
 * a top bar with five destinations, a sidebar inside the docs, a page per
 * component. There is nothing to gain by inventing a different one, and a
 * reader who has used one of these sites already knows how to use this one.
 *
 * Routing is state, not a URL router: this ships as a static bundle and a route
 * table is enough. The table is one row per page, and the top bar, the sidebar
 * and the palette all read it.
 */
import React, { useState } from 'react';
import { ThemeProvider } from './theme';
import { DirProvider, type Direction } from '../engine/liminal-direction';
import { CommandPalette } from '../components/nav/CommandPalette';
import { Sidebar } from '../components/nav/Sidebar';
import { LiminalLayoutEngine as L } from '../engine/liminal-layout-engine';
import { useMediaQuery } from '../engine/liminal-hooks';
import { FIXTURES } from '../components/__matrix__/fixtures';
import { S, R, Btn, surfaceFor } from './ui';
import { TopNav, DocsSidebar, NavDrawer, SiteFooter, NAV_CLEARANCE } from './nav';
import { DOCS, TOP_NAV, routeKey, type Route } from './routes';
import { HomePage } from './pages/Home';
import { DocsPage } from './pages/Docs';
import { ComponentsPage } from './pages/Components';
import { ComponentPage } from './pages/Component';
import { BlocksPage } from './pages/Blocks';
import { ThemesPage } from './pages/Themes';
import { ColorsPage } from './pages/Colors';

const BP = L.BREAKPOINTS;

/** The pages that carry the component sidebar. */
const WITH_SIDEBAR: Route['page'][] = ['docs', 'component'];

function Page({ route, go }: { route: Route; go: (r: Route) => void }) {
  switch (route.page) {
    case 'docs':
      return <DocsPage slug={route.slug} go={go} />;
    case 'components':
      return <ComponentsPage go={(name) => go({ page: 'component', name })} />;
    case 'component':
      return <ComponentPage name={route.name} go={go} />;
    case 'blocks':
      return <BlocksPage />;
    case 'themes':
      return <ThemesPage />;
    case 'colors':
      return <ColorsPage />;
    default:
      return <HomePage go={go} />;
  }
}

export function Site() {
  const [route, setRoute] = useState<Route>({ page: 'home' });
  /**
   * The direction is a first-class switch, not a build flag.
   *
   * The engine's RTL work — logical properties, the positioning engine, the
   * Jalali calendar, Persian typography — has no way to be SEEN except by
   * flipping the page. `DirProvider` puts `dir` on the document element, which
   * is where the browser reads it from and where portals inherit it too.
   */
  const [dir, setDir] = useState<Direction>('ltr');
  const [q, setQ] = useState('');
  const [navOpen, setNavOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const narrow = useMediaQuery(`(max-width: ${BP.shellSidebar}px)`);
  const key = routeKey(route);
  const sidebar = WITH_SIDEBAR.includes(route.page);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // A route change is a page change: scroll to the top, or the reader lands in
  // the middle of the next page.
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
    setNavOpen(false);
  }, [key]);

  const go = (r: Route) => setRoute(r);

  const paletteGroups = [
    {
      title: 'Pages',
      items: [
        ...TOP_NAV.map((t) => ({ id: `page:${t.page}`, label: t.label, action: () => { go({ page: t.page } as Route); setPaletteOpen(false); } })),
        ...DOCS.map((d) => ({ id: `doc:${d.slug}`, label: `Docs — ${d.label}`, action: () => { go({ page: 'docs', slug: d.slug }); setPaletteOpen(false); } })),
      ],
    },
    {
      title: 'Components',
      items: FIXTURES.map((f) => ({
        id: `component:${f.name}`,
        label: f.name,
        action: () => {
          go({ page: 'component', name: f.name });
          setPaletteOpen(false);
        },
      })),
    },
  ];

  /**
   * The sidebar is the COMPONENT list and the docs pages — not the five
   * destinations, which are in the bar.
   *
   * They were in here, so on a wide screen the page showed the same five links
   * twice: once in the floating bar and once at the top of the sidebar. The five
   * belong to the DRAWER, where the bar has no room for them, and that is the
   * only place they are drawn a second time.
   */
  const sidebarNav = <DocsSidebar route={route} go={go} q={q} onQ={setQ} onNavigate={() => setNavOpen(false)} />;

  const drawerNav = (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${S[1]}px`, paddingBlock: `${S[2]}px` }}>
        {TOP_NAV.map((item) => (
          <Btn key={item.page} active={route.page === item.page} onClick={() => go({ page: item.page } as Route)} title={item.note}>
            {item.label}
          </Btn>
        ))}
      </div>
      {sidebarNav}
    </>
  );

  return (
    <ThemeProvider>
      <DirProvider dir={dir}>
        {/* The bar FLOATS over the page, so the page has to start below it. */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', minWidth: 0, paddingBlockStart: `${NAV_CLEARANCE}px`, boxSizing: 'border-box' }}>
          <TopNav
            route={route}
            go={go}
            onSearch={() => setPaletteOpen(true)}
            onMenu={() => setNavOpen((v) => !v)}
            dir={dir}
            onDir={setDir}
          />

          {sidebar ? (
            <div
              style={{
                display: 'flex',
                gap: `${S[5]}px`,
                width: '100%',
                maxWidth: 1440,
                margin: '0 auto',
                padding: `${S[5]}px`,
                boxSizing: 'border-box',
                flex: 1,
                minWidth: 0,
                alignItems: 'flex-start',
              }}
            >
              {/* A drawer on a phone, a column on a desktop. */}
              <aside
                aria-label="Navigation"
                style={{
                  width: narrow ? 0 : L.SIDEBAR_W + S[4],
                  flexShrink: 0,
                  alignSelf: 'flex-start',
                  position: 'sticky',
                  top: `${NAV_CLEARANCE + S[2]}px`,
                  maxHeight: `calc(100vh - ${NAV_CLEARANCE + S[2] * 2}px)`,
                  overflowY: 'auto',
                  display: narrow ? 'none' : 'block',
                  boxSizing: 'border-box',
                }}
              >
                <Sidebar width={L.SIDEBAR_W}>{sidebarNav}</Sidebar>
              </aside>

              <main
                style={{
                  ...surfaceFor('work').style,
                  flex: `2 1 ${L.FIELD_MIN * 2}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: `${S[4]}px`,
                  minWidth: 0,
                  boxSizing: 'border-box',
                  borderRadius: `${R.card}px`,
                  padding: `${S[4]}px`,
                }}
              >
                <div key={key} style={{ minWidth: 0 }}>
                  <Page route={route} go={go} />
                </div>
              </main>
            </div>
          ) : (
            <main style={{ flex: 1, minWidth: 0 }}>
              <div key={key}>
                <Page route={route} go={go} />
              </div>
            </main>
          )}

          <SiteFooter go={go} />
        </div>

        {narrow && (
          <NavDrawer open={navOpen} onClose={() => setNavOpen(false)}>
            {drawerNav}
          </NavDrawer>
        )}

        <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} groups={paletteGroups} />
      </DirProvider>
    </ThemeProvider>
  );
}

export default Site;
