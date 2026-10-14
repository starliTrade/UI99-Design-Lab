/**
 * LIMINAL · STUDIO
 *
 * The tool a component is reviewed with, and it is ORGANISED AS AN ACCORDION.
 *
 * It used to be a long page: every panel open, one under another, and a reviewer
 * scrolled past four things to reach the fifth. The height was the problem — a
 * page you scroll is a page whose parts you cannot compare, because the first is
 * gone by the time you reach the last.
 *
 * So: the component list is an accordion, and the panels are an accordion. The
 * preview is always open, because it is what the page is for. Everything else is
 * one click away and one click shut, and the whole tool fits a screen.
 *
 * IT IS BUILT FROM THE LIBRARY IT REVIEWS. `Accordion`, `Input`, `Button` — the
 * same components a consumer gets. A tool that hand-rolled its own disclosure
 * would be a tool that cannot notice when the disclosure breaks.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { FIXTURES, coverage } from '../components/__matrix__/fixtures';
import { LiminalLayoutEngine as L } from '../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../engine/liminal-motion-engine';
import { Accordion } from '../components/containers/Accordion/Accordion';
import { Input } from '../components/inputs/Input/Input';
import { Badge } from '../components/atoms/Badge/Badge';
import { DeviceFrame, type DeviceWidth } from '../site/DeviceFrame';
import { FORCE_CSS } from './panels';
import {
  CodePanel,
  ContractChecks,
  CoveragePanel,
  EngineReadout,
  readEngineSnapshot,
  type EngineSnapshot,
} from './panels';
import { MONO, S, R, WELL, WORK, CHROME, Segmented } from '../site/ui';
import { useTheme } from '../site/theme';
import { LiminalColorEngine } from '../engine/liminal-color-engine';

/** The semantic roles, from the engine — a colour a reader can name. */
const SEMANTICS = LiminalColorEngine.SEMANTICS;

const FORCED = [
  { id: 'none', label: 'free' },
  { id: 'hover', label: 'hover' },
  { id: 'focus', label: 'focus' },
  { id: 'active', label: 'pressed' },
  { id: 'disabled', label: 'disabled' },
] as const;
type ForcedId = (typeof FORCED)[number]['id'];

const DEVICES: DeviceWidth[] = ['phone', 'tablet', 'fluid'];
const pct = (n: number) => Math.round(n * 100);

export function Studio({ initial, showList = true }: { initial?: string; showList?: boolean } = {}) {
  const groups = useMemo(() => [...new Set(FIXTURES.map((f) => f.group))], []);
  const [selected, setSelected] = useState<string>(initial ?? FIXTURES[0].name);
  const [size, setSize] = useState<string | undefined>();
  const [state, setState] = useState<string | undefined>();
  const [variant, setVariant] = useState<string | undefined>();
  const [forced, setForced] = useState<ForcedId>('none');
  const [device, setDevice] = useState<DeviceWidth>('fluid');
  const [q, setQ] = useState('');
  const { theme } = useTheme();

  const fixture = FIXTURES.find((f) => f.name === selected) ?? FIXTURES[0];
  const activeSize = size && fixture.sizes.includes(size) ? size : fixture.sizes[0];
  const activeState = state && fixture.states.includes(state) ? state : fixture.states[0];
  const activeVariant = variant && fixture.variants?.includes(variant) ? variant : fixture.variants?.[0];
  const rendered = fixture.render(activeState, activeSize, activeVariant);

  /**
   * The preview is STATE, not a ref.
   *
   * A ref is null on the first pass — the frame portals the preview into the
   * iframe, and a portal mounts one render after the frame's own effect — so an
   * effect that reads `previewRef.current` finds nothing, returns, and never
   * runs again, because its dependencies did not change. The panels then said
   * "no element with data-liminal-surface in the preview" for every component
   * in the library, on every fresh load.
   *
   * A callback ref turns "the node exists" into a state change, and the effect
   * that reads the engine runs when there is something to read.
   */
  const [preview, setPreview] = useState<HTMLDivElement | null>(null);
  const [snapshot, setSnapshot] = useState<EngineSnapshot | null>(null);
  useEffect(() => {
    if (!preview) return;
    const read = () => {
      const el =
        preview.querySelector<HTMLElement>('[data-liminal-surface]') ??
        preview.querySelector<HTMLElement>('[data-liminal-focus-within]') ??
        preview.querySelector<HTMLElement>('[data-liminal-focusable]');
      setSnapshot(readEngineSnapshot(el, theme.ladder));
    };
    read();
    /**
     * And it is read again when the preview's CONTENT changes: switching the
     * forced state or the fixture replaces the element the engine published, and
     * the question is about the element that is there now. Attributes are NOT
     * observed — a hover changes an inline style, and re-reading on every
     * attribute change would be a render loop for a value that did not change.
     */
    const observer = new MutationObserver(read);
    observer.observe(preview, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [preview, selected, activeState, activeSize, activeVariant, forced, theme.ladder]);

  const pick = (name: string) => {
    setSelected(name);
    const f = FIXTURES.find((x) => x.name === name)!;
    setSize(f.sizes[0]);
    setState(f.states[0]);
    setVariant(f.variants?.[0]);
    setForced('none');
  };

  const needle = q.trim().toLowerCase();
  const matches = needle
    ? FIXTURES.filter((f) => f.name.toLowerCase().includes(needle) || f.group.toLowerCase().includes(needle))
    : FIXTURES;

  // The component list, as an accordion. One group open at a time would hide the
  // others; `multiple` lets a reviewer keep two open while comparing.
  const listItems = groups
    .map((g) => {
      const rows = matches.filter((f) => f.group === g);
      if (!rows.length) return null;
      return {
        id: g,
        title: `${g} · ${rows.length}`,
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {rows.map((f) => {
              const on = f.name === selected;
              const c = pct(coverage(f));
              const missing = f.expected.filter((s) => !f.states.includes(s));
              return (
                <button
                  key={f.name}
                  type="button"
                  onClick={() => pick(f.name)}
                  aria-current={on ? 'true' : undefined}
                  style={{
                    ...(on ? WORK.style : { background: 'transparent' }),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: `${S[2]}px`,
                    width: '100%',
                    font: 'inherit',
                    fontSize: 12,
                    textAlign: 'start',
                    padding: `${S[1]}px ${S[2]}px`,
                    borderRadius: `${R.chip}px`,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
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
                </button>
              );
            })}
          </div>
        ),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[4]}px`, minWidth: 0 }}>
      <style>{FORCE_CSS}</style>

      {/* ── the controls, on one line ─────────────────────────────────────── */}
      <div
        style={{
          ...CHROME.style,
          display: 'flex',
          alignItems: 'center',
          gap: `${S[4]}px`,
          flexWrap: 'wrap',
          padding: `${S[3]}px`,
          borderRadius: `${R.card}px`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: `${S[2]}px` }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{fixture.name}</span>
          <Badge>{`${pct(coverage(fixture))}%`}</Badge>
        </div>
        <Segmented label="device" value={device} options={DEVICES.map((d) => ({ id: d, label: d }))} onChange={setDevice} />
        <Segmented label="force" value={forced} options={FORCED.map((f) => ({ id: f.id, label: f.label }))} onChange={setForced} />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${S[4]}px`, alignItems: 'flex-start', minWidth: 0 }}>
        {/* ── the component list, as an accordion ───────────────────────── */}
        {showList && (
          <div style={{ flex: `1 1 ${L.SIDEBAR_W}px`, maxWidth: L.SIDEBAR_W + L.SPACING[6], minWidth: 0, display: 'flex', flexDirection: 'column', gap: `${S[2]}px` }}>
            <Input size="sm" placeholder="Filter…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Filter components" />
            <Accordion items={listItems} type="multiple" headingLevel={3} defaultOpen={[fixture.group]} />
          </div>
        )}

        {/* ── the work ───────────────────────────────────────────────────── */}
        <div style={{ flex: `2 1 ${L.FIELD_MIN * 2}px`, minWidth: 0, display: 'flex', flexDirection: 'column', gap: `${S[4]}px` }}>
          {/* The prop controls, derived from what the fixture says it HAS. */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${S[4]}px` }}>
            {(
              [
                ['size', fixture.sizes, activeSize, setSize],
                ['state', fixture.states, activeState, setState],
                ['variant', fixture.variants ?? [], activeVariant, setVariant],
              ] as const
            )
              .filter(([, values]) => values.length > 1)
              .map(([name, values, active, set]) => (
                <Segmented
                  key={name}
                  label={name}
                  value={active ?? ''}
                  options={values.map((v) => ({ id: v, label: v }))}
                  onChange={set}
                />
              ))}
          </div>

          <DeviceFrame device={device} minHeight={device === 'phone' ? 340 : 200}>
            <div
              ref={setPreview}
              className={forced === 'none' ? undefined : `force-${forced}`}
              style={{
                ...WELL.style,
                borderRadius: `${R.card}px`,
                padding: `${S[5]}px`,
                minHeight: 132,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflowX: 'auto',
                transition: M.getTransition('background', 'normal'),
              }}
            >
              {rendered}
            </div>
          </DeviceFrame>

          {/* ── the panels, as an accordion ─────────────────────────────── */}
          <Accordion
            type="multiple"
            headingLevel={3}
            items={[
              { id: 'engine', title: 'Engine — what it published', content: <EngineReadout snapshot={snapshot} /> },
              {
                id: 'contract',
                title: 'Contract — does the surface hold',
                // THE COMPONENT'S OWN SURFACE, not the well it sits on.
                //
                // This was `snapshot?.level != null ? WELL.backgroundHex :
                // WELL.backgroundHex` — a ternary whose two branches are the
                // same expression. It read as a decision and was a constant, so
                // the panel measured the text hierarchy against the preview
                // well for every component in the library: the one number it
                // reported was about a surface the component had not painted.
                content: (
                  <ContractChecks
                    surfaceHex={snapshot?.surfaceHex ?? WELL.backgroundHex}
                    level={snapshot?.level ?? null}
                  />
                ),
              },
              {
                id: 'coverage',
                title: `Coverage — ${pct(coverage(fixture))}%`,
                content: (
                  <CoveragePanel
                    name={fixture.name}
                    has={fixture.states}
                    expected={fixture.expected}
                    sizes={fixture.sizes}
                    variants={fixture.variants ?? []}
                    coveragePercent={pct(coverage(fixture))}
                  />
                ),
              },
              { id: 'code', title: 'Code — the element that rendered', content: <CodePanel element={rendered} /> },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export default Studio;
