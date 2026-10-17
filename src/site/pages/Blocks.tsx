/**
 * LIMINAL · SITE — BLOCKS
 *
 * Whole screens, assembled from the library and nothing else. A component that
 * survives a real page survives a display case: the blocks are the test the
 * component pages cannot be, because a page has a topbar, a sidebar, a table, a
 * form and a 404 in it at the same time.
 *
 * Each one runs in the device frame — an iframe with its own viewport — so the
 * app's own breakpoints answer. A `max-width` box would show the desktop layout
 * in a picture frame and lie about what a phone gets.
 */
import React from 'react';
import { LiminalLayoutEngine as L } from '../../engine/liminal-layout-engine';
import { Heading, Text } from '../../components/atoms/Typography';
import { AppFrame } from '../AppFrame';
import { Section, Prose, Value, S, R, surfaceFor } from '../ui';

const SCREENS: { name: string; note: string; exercises: string }[] = [
  {
    name: 'Dashboard',
    note: 'a table, stats and a sidebar',
    exercises: 'AppShell · Topbar · Sidebar · NavItem · Breadcrumb · Stat · Table · Badge · Progress · Avatar',
  },
  {
    name: 'Project',
    note: 'a detail page with tabs',
    exercises: 'Tabs · Panel · Card · TreeView · AvatarGroup · Button',
  },
  {
    name: 'Login',
    note: 'a form, and the auth gate',
    exercises: 'Form · Field · Input · Button · Alert',
  },
  {
    name: 'Loading',
    note: 'the skeleton state',
    exercises: 'Skeleton · Spinner · Card',
  },
  {
    name: '404',
    note: 'the error page',
    exercises: 'ErrorPage · Button · Breadcrumb',
  },
];

export function BlocksPage() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: `${S[5]}px`, boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: `${S[6]}px`, minWidth: 0 }}>
      <header style={{ display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
        <Heading level={1} size={7}>
          Blocks
        </Heading>
        <Text level={3} tone="tertiary" style={{ maxWidth: '70ch' }}>
          Five screens, built from this library and nothing else. Change the width and the app's own
          breakpoints answer — the frame is an iframe with its own viewport, so 390 is a phone and not
          a narrow box.
        </Text>
      </header>

      <AppFrame />

      <Section title="What each screen exercises" note="A block is a test with a name">
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[3]}px` }}>
          {SCREENS.map((s) => (
            <div key={s.name} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {s.name} <span style={{ fontWeight: 400, opacity: 0.6, fontSize: 11 }}>— {s.note}</span>
              </span>
              <code style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 11, opacity: 0.65 }}>{s.exercises}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Why blocks matter" role="panel">
        <Prose>
          Every defect this project found in its last pass lived BETWEEN two layers: a mechanism in one
          and no consumer in another. A component page cannot find those, because a component page
          renders one component. A block renders a page, and a page is where two components have to
          agree about a surface, a z-index or a focus order.
        </Prose>
        <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[1]}px`, maxWidth: '78ch' }}>
          <Value label="Screens" value={String(SCREENS.length)} />
          <Value label="Frame" value="iframe — media queries fire at the frame's width" />
          <Value label="Source" value="src/app — the same kit the landing page shows" />
          <Value label="Breakpoints" value={`the engine's, from content: ${L.BREAKPOINTS.shellSidebar}px and up`} />
        </div>
      </Section>

      <Section title="Build your own">
        <Prose>
          A block is not a component you import — it is a page you write, from components that already
          know how to sit on each other. Start from a screen above, delete what you do not need, and
          the surfaces stay correct because nothing in the markup names a depth.
        </Prose>
        <div
          style={{
            ...surfaceFor('well').style,
            borderRadius: `${R.card}px`,
            padding: `${S[4]}px`,
            fontSize: 12,
            lineHeight: 2,
            opacity: 0.85,
          }}
        >
          A page declares <b>work</b>. A panel inside it declares <b>panel</b>. A control inside that
          declares <b>control</b>, and says what it is <i>on</i>. The engine resolves the three against
          each other, and the hierarchy cannot skip a step — which is the defect the docs site itself
          had, when its panels sat directly on the canvas.
        </div>
      </Section>
    </div>
  );
}

export default BlocksPage;
