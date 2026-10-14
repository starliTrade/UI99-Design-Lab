/**
 * LIMINAL · DOCS — THE SHELL
 *
 * Built from the library it documents: `AppShell`, `Topbar`, `Sidebar`,
 * `NavItem`, `Button`, `Input`. That is not decoration — it means every page
 * view exercises the components, and a broken component breaks the docs, which
 * is exactly when someone will notice.
 */
import React from 'react';
import { LiminalLayoutEngine as L } from '../engine/liminal-layout-engine';

const BP = L.BREAKPOINTS;
import { Topbar } from '../components/nav/Topbar';
import { Sidebar, SidebarSection } from '../components/nav/Sidebar';
import { NavItem } from '../components/nav/NavItem';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/inputs/Input';
import { Badge } from '../components/atoms/Badge';
import { FIXTURES, coverage } from '../components/__matrix__/fixtures';
import { S, R, MONO, Btn, WORK, surfaceFor } from './ui';
import { useMediaQuery } from '../engine/liminal-hooks';
import { useTheme } from './theme';
import { PAGES, routeKey, type Route } from './routes';
import { CommandPalette } from '../components/nav/CommandPalette';
import { FOCUS_RING_COLOR } from '../engine/liminal-ladder';
import { LiminalColorEngine } from '../engine/liminal-color-engine';
import { getLadderVar } from '../engine/liminal-ladder';

/** The semantic roles, from the engine — a colour a reader can name. */
const SEMANTICS = LiminalColorEngine.SEMANTICS;

const pct = (n: number) => Math.round(n * 100);

function ThemeControls({
  compact,
  dir,
  onDir,
}: {
  compact?: boolean;
  dir: 'ltr' | 'rtl';
  onDir: (d: 'ltr' | 'rtl') => void;
}) {
  const { state, set, reset, isSystem, theme } = useTheme();
  // Two scales. There is no hue slider because there is no hue to move: the
  // ladder is the identity, and the density is clamped to the touch floor.
  const sliders: { key: keyof typeof state; label: string; min: number; max: number; step: number; fmt: (v: number) => string }[] = [
    { key: 'density', label: 'Density', min: 0.8, max: 1.4, step: 0.05, fmt: (v) => `${v.toFixed(2)}×` },
    { key: 'motion', label: 'Motion', min: 0, max: 2, step: 0.1, fmt: (v) => `${v.toFixed(1)}×` },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${S[3]}px`, flexWrap: 'wrap', minWidth: 0 }}>
      {!compact && sliders.map((s) => (
        <label key={s.key} style={{ display: 'flex', alignItems: 'center', gap: `${S[1]}px`, minWidth: 0 }}>
          <span style={{ fontSize: 10, opacity: 0.65, whiteSpace: 'nowrap' }}>{s.label}</span>
          <input
            type="range"
            min={s.min}
            max={s.max}
            step={s.step}
            value={state[s.key]}
            aria-label={s.label}
            onChange={(e) => set({ ...state, [s.key]: Number(e.target.value) })}
            style={{ width: 78, accentColor: FOCUS_RING_COLOR }}
          />
        </label>
      ))}
      <div style={{ display: 'flex', gap: 2, borderRadius: `${R.chip}px`, overflow: 'hidden' }} aria-hidden>
        {theme.ladder.map((hex, i) => (
          <span key={i} title={`S${i} ${hex}`} style={{ width: 9, height: 16, background: hex }} />
        ))}
      </div>
      {theme.warnings.length > 0 && (
        <span style={{ fontSize: 10, color: SEMANTICS.DANGER.text }} title={theme.warnings[0].why}>
          {theme.warnings[0].scale} clamped
        </span>
      )}
      <Btn
        onClick={() => onDir(dir === 'ltr' ? 'rtl' : 'ltr')}
        active={dir === 'rtl'}
        title="Flip the document direction"
      >
        {dir === 'ltr' ? 'LTR' : 'RTL'}
      </Btn>
      {!isSystem && (
        <Button size="sm" variant="ghost" onClick={reset}>
          Reset to the system theme
        </Button>
      )}
    </div>
  );
}

export function DocsShell({
  route,
  go,
  dir,
  onDir,
  children,
}: {
  route: Route;
  go: (r: Route) => void;
  dir: 'ltr' | 'rtl';
  onDir: (d: 'ltr' | 'rtl') => void;
  children: React.ReactNode;
}) {
  const [q, setQ] = React.useState('');
  const [navOpen, setNavOpen] = React.useState(false);
  /**
   * ⌘K — the palette, because a 74-row list is a list you scroll.
   *
   * The sidebar is the list, and a reviewer still has to hunt through it: the
   * palette is the same table, indexed by typing. It is the library's own
   * `CommandPalette`, so the studio is navigated by the thing it reviews.
   */
  const [paletteOpen, setPaletteOpen] = React.useState(false);
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
  // The CONTAINER is the page here, so a media query is the right question —
  // unlike the studio, which lives inside the demo's frame.
  // THE ENGINE'S BREAKPOINT, not a device category.
  //
  // This was `900px` — and the engine's own comment says the six numbers it
  // replaced were "device categories wearing numeric costumes". `shellSidebar`
  // is derived from the content: sidebar + gap + one readable column + padding.
  // The mobile nav appears there because that is where the layout stops fitting,
  // not because a phone is a phone.
  const narrow = useMediaQuery(`(max-width: ${BP.shellSidebar}px)`);
  const groups = React.useMemo(() => [...new Set(FIXTURES.map((f) => f.group))], []);
  const needle = q.trim().toLowerCase();
  const matches = needle
    ? FIXTURES.filter((f) => f.name.toLowerCase().includes(needle) || f.group.toLowerCase().includes(needle))
    : FIXTURES;

  const active = routeKey(route);

  /**
   * THE PAGES LIVE IN THE TOP BAR — «چند صفحه با نوارِ بالا».
   *
   * They were a section of the sidebar, which made the site read as one long
   * list with a page list bolted to the top of it. A page is not a component:
   * it belongs in the bar, and the sidebar belongs to the 74 rows that need
   * scrolling. On a narrow screen the bar has no room for six links, so they go
   * back into the drawer — where the theme controls already are, for the same
   * reason.
   */
  const pageNav = narrow ? null : (
    <div style={{ display: 'flex', alignItems: 'center', gap: S[1], minWidth: 0, overflowX: 'auto' }}>
      {PAGES.map((p) => (
        <Btn key={p.page} active={active === p.page} onClick={() => go({ page: p.page } as Route)} title={p.note}>
          {p.label}
        </Btn>
      ))}
    </div>
  );

  const paletteGroups = [
    {
      title: 'Pages',
      items: PAGES.map((p) => ({
        id: `page:${p.page}`,
        label: p.label,
        action: () => {
          go({ page: p.page } as Route);
          setPaletteOpen(false);
        },
      })),
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

  const nav = (
    <>
      {/* On a phone the four sliders do not fit a topbar, and a topbar that
          overflows drags the whole document wider than the device. They live in
          the drawer there, and the topbar keeps the ladder and the reset. */}
      {narrow && (
        <div style={{ paddingBlock: `${S[2]}px` }}>
          <ThemeControls dir={dir} onDir={onDir} />
        </div>
      )}
      <div style={{ paddingBlock: `${S[2]}px` }}>
        <Input
          size="sm"
          placeholder="Search components…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search components"
        />
      </div>
      {/* Only in the drawer: on a wide screen the pages are in the top bar. */}
      {narrow && (
        <SidebarSection label="Pages">
          {PAGES.map((p) => (
            <NavItem
              key={p.page}
              active={active === p.page}
              onClick={() => {
                go({ page: p.page } as Route);
                setNavOpen(false);
              }}
            >
              {p.label}
            </NavItem>
          ))}
        </SidebarSection>
      )}
      {groups.map((g) => {
        const rows = matches.filter((f) => f.group === g);
        if (!rows.length) return null;
        return (
          <SidebarSection key={g} label={g}>
            {rows.map((f) => {
              const c = pct(coverage(f));
              const missing = f.expected.filter((s) => !f.states.includes(s));
              return (
                <NavItem
                  key={f.name}
                  active={active === `component:${f.name}`}
                  onClick={() => {
                    go({ page: 'component', name: f.name });
                    setNavOpen(false);
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: `${S[2]}px`, width: '100%' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                    <code
                      style={{
                        fontFamily: MONO,
                        fontSize: 10,
                        flexShrink: 0,
                        opacity: c === 100 ? 0.5 : 0.95,
                        color: missing.length ? SEMANTICS.DANGER.text : undefined,
                      }}
                    >
                      {c}%
                    </code>
                  </span>
                </NavItem>
              );
            })}
          </SidebarSection>
        );
      })}
    </>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', minWidth: 0 }}>
      {/* NO WRAPPER ELEMENT: `Topbar` renders its own `<header>`, so wrapping it
          in another one made two banner landmarks, one inside the other — axe
          reports `landmark-banner-is-top-level`, `landmark-no-duplicate-banner`
          and `landmark-unique`, three violations from one div. */}
      <Topbar
          logo={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: `${S[2]}px` }}>
              {narrow && (
                <Btn onClick={() => setNavOpen((v) => !v)} active={navOpen} title="Navigation">
                  ☰
                </Btn>
              )}
              <span style={{ ...L.getTypeStyle(1, true), fontWeight: 700 }}>LIMINAL</span>
              <Badge>v1.0</Badge>
            </span>
          }
          actions={
            <>
              <Btn onClick={() => setPaletteOpen(true)} title="Search everything — ⌘K">
                ⌘K
              </Btn>
              <ThemeControls compact={narrow} dir={dir} onDir={onDir} />
            </>
          }
      >
        {pageNav}
      </Topbar>

      <div
        style={{
          display: 'flex',
          gap: `${S[5]}px`,
          width: '100%',
          maxWidth: 1600,
          margin: '0 auto',
          padding: `${S[5]}px`,
          boxSizing: 'border-box',
          flex: 1,
          minWidth: 0,
          alignItems: 'flex-start',
        }}
      >
        {/* A drawer on a phone, a column on a desktop. A fifty-item sidebar
            cannot become a bottom bar, and AppShell has no rule for either —
            its class names are hooks with no CSS behind them. */}
        <aside
          aria-label="Navigation"
          style={{
            width: narrow ? '100%' : 248,
            flexShrink: 0,
            alignSelf: 'flex-start',
            position: narrow ? 'fixed' : 'sticky',
            top: narrow ? 64 : `${S[8] + S[5]}px`,
            insetInlineStart: narrow ? 0 : undefined,
            zIndex: narrow ? 40 : undefined,
            // The chrome above it, from the engine's own scale: the topbar's
            // control height plus its padding, and the same again for the
            // in-page header.
            maxHeight: narrow
              ? `calc(100vh - ${L.CONTROL.md + L.SPACING[3] * 2}px)`
              : `calc(100vh - ${L.CONTROL.md + L.SPACING[3] * 2 + L.SPACING[6]}px)`,
            overflowY: 'auto',
            display: narrow && !navOpen ? 'none' : 'block',
            boxSizing: 'border-box',
            background: narrow ? getLadderVar(1) : undefined,
            borderInlineEnd: narrow ? `${L.BORDER.hairline}px solid ${getLadderVar(2)}` : undefined,
            padding: narrow ? `${S[3]}px` : undefined,
          }}
        >
          <Sidebar width={L.SIDEBAR_W}>{nav}</Sidebar>
        </aside>

        {/* THE CONTENT PLANE IS A WORK SURFACE, NOT THE CANVAS.
         *
         * The engine's rule: a `panel` is a surface NESTED INSIDE the work
         * surface, and the structural roles define the hierarchy rather than
         * sit inside it. So a panel belongs on work, not on the canvas.
         *
         * The docs put their panels straight on the canvas: measured, a panel
         * sat 3.56q above it and the work plane (S2) was never built. The panel
         * was at the right level and in the wrong place — nothing hosted it.
         * Now something does. */}
        <main
          style={{
            ...WORK.style,
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
          {children}
        </main>
      </div>

      {/* The library's own palette. A tool that hand-rolled its own would be a
          tool that cannot notice when the palette breaks. */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} groups={paletteGroups} />
    </div>
  );
}
