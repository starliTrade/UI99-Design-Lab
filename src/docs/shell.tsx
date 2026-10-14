/**
 * LIMINAL · DOCS — THE SHELL
 *
 * Built from the library it documents: `AppShell`, `Topbar`, `Sidebar`,
 * `NavItem`, `Button`, `Input`. That is not decoration — it means every page
 * view exercises the components, and a broken component breaks the docs, which
 * is exactly when someone will notice.
 */
import React from 'react';
import { Topbar } from '../components/nav/Topbar';
import { Sidebar, SidebarSection } from '../components/nav/Sidebar';
import { NavItem } from '../components/nav/NavItem';
import { Button } from '../components/atoms/Button';
import { Input } from '../components/inputs/Input';
import { Badge } from '../components/atoms/Badge';
import { FIXTURES, coverage } from '../components/__matrix__/fixtures';
import { S, R, MONO, Btn, surfaceFor } from './ui';
import { useMediaQuery } from '../engine/liminal-hooks';
import { useTheme } from './theme';
import { PAGES, routeKey, type Route } from './routes';

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
            style={{ width: 78, accentColor: 'var(--liminal-brand, #E9ECF2)' }}
          />
        </label>
      ))}
      <div style={{ display: 'flex', gap: 2, borderRadius: `${R.chip}px`, overflow: 'hidden' }} aria-hidden>
        {theme.ladder.map((hex, i) => (
          <span key={i} title={`S${i} ${hex}`} style={{ width: 9, height: 16, background: hex }} />
        ))}
      </div>
      {theme.warnings.length > 0 && (
        <span style={{ fontSize: 10, color: 'var(--liminal-danger, #ba4646)' }} title={theme.warnings[0].why}>
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
  // The CONTAINER is the page here, so a media query is the right question —
  // unlike the studio, which lives inside the demo's frame.
  const narrow = useMediaQuery('(max-width: 900px)');
  const groups = React.useMemo(() => [...new Set(FIXTURES.map((f) => f.group))], []);
  const needle = q.trim().toLowerCase();
  const matches = needle
    ? FIXTURES.filter((f) => f.name.toLowerCase().includes(needle) || f.group.toLowerCase().includes(needle))
    : FIXTURES;

  const active = routeKey(route);

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
                        color: missing.length ? 'var(--liminal-danger, #ba4646)' : undefined,
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
      <header style={{ width: '100%', flexShrink: 0 }}>
        <Topbar
          logo={
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: `${S[2]}px` }}>
              {narrow && (
                <Btn onClick={() => setNavOpen((v) => !v)} active={navOpen} title="Navigation">
                  ☰
                </Btn>
              )}
              <span style={{ fontWeight: 700, letterSpacing: '0.02em' }}>LIMINAL</span>
              <Badge>v1.0</Badge>
            </span>
          }
          actions={<ThemeControls compact={narrow} dir={dir} onDir={onDir} />}
        />
      </header>

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
            maxHeight: narrow ? 'calc(100vh - 64px)' : 'calc(100vh - 140px)',
            overflowY: 'auto',
            display: narrow && !navOpen ? 'none' : 'block',
            boxSizing: 'border-box',
            background: narrow ? 'var(--liminal-s1)' : undefined,
            borderInlineEnd: narrow ? '1px solid var(--liminal-s2)' : undefined,
            padding: narrow ? `${S[3]}px` : undefined,
          }}
        >
          <Sidebar width={248}>{nav}</Sidebar>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
