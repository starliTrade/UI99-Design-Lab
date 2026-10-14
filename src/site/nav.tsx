/**
 * LIMINAL · SITE — THE NAVIGATION
 *
 * Built from the library it documents: `Topbar`, `Sidebar`, `NavItem`, `Button`,
 * `Badge`. Not decoration — it means every page view exercises the components,
 * and a broken component breaks the site, which is exactly when someone notices.
 */
import React from 'react';
import { Topbar } from '../components/nav/Topbar';
import { SidebarSection } from '../components/nav/Sidebar';
import { NavItem } from '../components/nav/NavItem';
import { Badge } from '../components/atoms/Badge';
import { Button } from '../components/atoms/Button';
import { FIXTURES, coverage } from '../components/__matrix__/fixtures';
import { LiminalLayoutEngine as L } from '../engine/liminal-layout-engine';
import { LiminalColorEngine } from '../engine/liminal-color-engine';
import { getLadderVar } from '../engine/liminal-ladder';
import { useMediaQuery } from '../engine/liminal-hooks';
import { mistCssVars } from '../engine/liminal-mist';
import { Btn, MONO, S, R, surfaceFor } from './ui';
import { DOCS, TOP_NAV, type Route } from './routes';

const SEMANTICS = LiminalColorEngine.SEMANTICS;
const BP = L.BREAKPOINTS;
const pct = (n: number) => Math.round(n * 100);

const isActive = (route: Route, page: Route['page']) => route.page === page;

/**
 * THE BAR FLOATS, AND IT IS MIST — not glass.
 *
 * Measured on a product page in the wild: its nav is a floating pill, inset from
 * the edges, `rgba(255,255,255,0.03)` with `blur(12px)`, radius 999px, and 48px
 * between its links. Airy, and it reads as a surface the page passes under
 * rather than a band cut across the top.
 *
 * LIMINAL cannot copy the glass, because the contract PURGED glass: a blurred
 * backdrop cost 35.7x a plain surface and was invisible on the near-uniform dark
 * backgrounds this system actually uses. What the contract kept is Mist — a
 * vertical fog inside the surface, one hairline of light on its top edge, a dark
 * shadow below that grows with height, and a faint seam. Every value derives
 * from the role's ladder height; none of it is hand-tuned.
 *
 * The diffusion is opted into HERE and nowhere else, because this is the one
 * surface in the system that has content scrolling under it: the opt-in exists
 * for exactly that case.
 */
export const NAV_HEIGHT = L.CONTROL.md;
/** How far the page has to start below the top, so the floating bar clears it. */
export const NAV_CLEARANCE = S[4] + NAV_HEIGHT + S[2] * 2 + S[5];

export function TopNav({
  route,
  go,
  onSearch,
  onMenu,
  dir,
  onDir,
}: {
  route: Route;
  go: (r: Route) => void;
  onSearch: () => void;
  onMenu?: () => void;
  dir: 'ltr' | 'rtl';
  onDir: (d: 'ltr' | 'rtl') => void;
}) {
  const narrow = useMediaQuery(`(max-width: ${BP.shellSidebar}px)`);
  /**
   * A GLASS, NOT A FOG — and the difference is two numbers.
   *
   * Measured on the reference: its pill is `rgba(255,255,255,0.03)` with
   * `blur(12px)`. Ours was the menu fog at 84% fill with the same blur — the
   * diffusion was on and there was nothing to see through it, because 84% of
   * what you looked at was the surface itself.
   *
   * `fill: 0.2` keeps a fifth of the fog and lets the page through the rest,
   * diffused. The seam and the top hairline are untouched, so the pill still
   * has an edge — a window has a frame.
   */
  const mist = mistCssVars('menu', { diffuse: true, fill: 0.2 });

  return (
    <div
      style={{
        position: 'fixed',
        insetBlockStart: S[4],
        insetInline: 0,
        zIndex: 60,
        paddingInline: `${S[4]}px`,
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <nav
        data-liminal-mist="diffuse"
        aria-label="Main"
        style={{
          ...mist,
          pointerEvents: 'auto',
          maxWidth: 1120,
          margin: '0 auto',
          height: NAV_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          gap: `${S[5]}px`,
          paddingInline: `${S[4]}px`,
          borderRadius: `${R.full}px`,
          boxSizing: 'border-box',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: `${S[2]}px`, flexShrink: 0 }}>
          {narrow && onMenu && (
            <button
              type="button"
              onClick={onMenu}
              aria-label="Navigation"
              style={{
                font: 'inherit',
                fontSize: 14,
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              ☰
            </button>
          )}
          <button
            type="button"
            onClick={() => go({ page: 'home' })}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${S[2]}px`,
              font: 'inherit',
              background: 'transparent',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'inherit',
            }}
          >
            <span style={{ ...L.getTypeStyle(2, true), fontWeight: 700 }}>LIMINAL</span>
            {!narrow && <Badge>v1.0</Badge>}
          </button>
        </span>

        {/* THE LINKS ARE NOT IN THE BAR ON A PHONE, and that is a measurement
            rather than a preference: five labels plus the actions need ~600px,
            and a bar that overflows drags the whole document wider than the
            device. Measured at 390: the nav alone was 400px and the actions 205,
            so the page scrolled sideways. On a phone they live in the drawer. */}
        {!narrow &&
          TOP_NAV.map((item) => (
            <Btn key={item.page} active={isActive(route, item.page)} onClick={() => go({ page: item.page } as Route)} title={item.note}>
              {item.label}
            </Btn>
          ))}

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: `${S[2]}px`, marginInlineStart: 'auto', flexShrink: 0 }}>
          <Btn onClick={onSearch} title="Search everything — ⌘K">
            {narrow ? '⌘K' : 'Search… ⌘K'}
          </Btn>
          <Btn onClick={() => onDir(dir === 'ltr' ? 'rtl' : 'ltr')} active={dir === 'rtl'} title="Flip the document direction">
            {dir.toUpperCase()}
          </Btn>
          {/* THE BAR ENDS IN AN ACTION. Measured on the same product page: its
              last item is "Try for free" — the links say where you can go and
              the last thing says what you can DO. */}
          <Button size="sm" variant="primary" onClick={() => go({ page: 'docs', slug: 'installation' })}>
            {narrow ? 'Start' : 'Get started'}
          </Button>
        </span>
      </nav>
    </div>
  );
}

/**
 * The docs sidebar: the pages, then the components.
 *
 * The components are a list here and not in the top bar because there are 74 of
 * them — a top bar that lists 74 things is a top bar nobody reads.
 */
export function DocsSidebar({
  route,
  go,
  q,
  onQ,
  onNavigate,
}: {
  route: Route;
  go: (r: Route) => void;
  q: string;
  onQ: (v: string) => void;
  onNavigate?: () => void;
}) {
  const groups = React.useMemo(() => [...new Set(FIXTURES.map((f) => f.group))], []);
  const needle = q.trim().toLowerCase();
  const matches = needle
    ? FIXTURES.filter((f) => f.name.toLowerCase().includes(needle) || f.group.toLowerCase().includes(needle))
    : FIXTURES;
  const sections = [...new Set(DOCS.map((d) => d.section))];

  return (
    <>
      <div style={{ paddingBlock: `${S[2]}px` }}>
        <input
          type="search"
          value={q}
          onChange={(e) => onQ(e.target.value)}
          placeholder="Filter components…"
          aria-label="Filter components"
          style={{
            ...surfaceFor('well').style,
            width: '100%',
            boxSizing: 'border-box',
            font: 'inherit',
            fontSize: 12,
            padding: `${S[2]}px ${S[3]}px`,
            borderRadius: `${R.control}px`,
            border: 'none',
            outline: 'none',
            color: 'inherit',
          }}
        />
      </div>

      {sections.map((section) => (
        <SidebarSection key={section} label={section}>
          {DOCS.filter((d) => d.section === section).map((d) => (
            <NavItem
              key={d.slug}
              active={route.page === 'docs' && route.slug === d.slug}
              onClick={() => {
                go({ page: 'docs', slug: d.slug });
                onNavigate?.();
              }}
            >
              {d.label}
            </NavItem>
          ))}
        </SidebarSection>
      ))}

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
                  active={route.page === 'component' && route.name === f.name}
                  onClick={() => {
                    go({ page: 'component', name: f.name });
                    onNavigate?.();
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
}

/** The mobile drawer: the same list, over the page, on a phone. */
export function NavDrawer({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: 'fixed',
        insetBlock: `${L.CONTROL.md + S[3] * 2}px 0`,
        insetInline: 0,
        zIndex: 45,
        background: getLadderVar(1),
        borderBlockStart: `${L.BORDER.hairline}px solid ${getLadderVar(2)}`,
        padding: `${S[3]}px`,
        overflowY: 'auto',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: `${S[2]}px` }}>
        <Btn onClick={onClose} title="Close navigation">
          Close
        </Btn>
      </div>
      {children}
    </div>
  );
}

export function SiteFooter({ go }: { go: (r: Route) => void }) {
  return (
    <footer
      style={{
        ...surfaceFor('chrome').style,
        borderBlockStart: `${L.BORDER.hairline}px solid ${getLadderVar(2)}`,
        padding: `${S[6]}px ${S[5]}px`,
        marginTop: `${S[7]}px`,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: `${S[5]}px`,
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px`, maxWidth: '44ch' }}>
          <span style={{ ...L.getTypeStyle(2, true), fontWeight: 700 }}>LIMINAL</span>
          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.9, opacity: 0.7 }}>
            A dark system where the component declares and the engine decides. Every surface, edge,
            colour and space comes from a rule — and the rule is written as a test.
          </p>
        </div>
        <nav aria-label="Footer" style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px` }}>
          {TOP_NAV.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => go({ page: item.page } as Route)}
              style={{
                font: 'inherit',
                fontSize: 12,
                textAlign: 'start',
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'inherit',
                opacity: 0.75,
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </footer>
  );
}
