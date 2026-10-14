/**
 * LIMINAL · DOCS — THE PRIMITIVES
 *
 * The docs app is built from the engine's own roles, exactly like the
 * components it documents. A documentation site that hand-picked its surfaces
 * could not honestly document a system that forbids hand-picking — and the
 * reader would be looking at a third design language, not at LIMINAL.
 *
 * So there is no CSS file here and no raw number: every surface is
 * `resolveSurface({ role })`, every space is `SPACING`, every colour is a token.
 */
import React from 'react';
import { resolveSurface, type SurfaceRole } from '../engine/liminal-surface';
import { LiminalLayoutEngine as L } from '../engine/liminal-layout-engine';
import { LiminalMotionEngine as M } from '../engine/liminal-motion-engine';
import { LiminalColorEngine } from '../engine/liminal-color-engine';

/** The semantic roles, from the engine — a colour a reader can name. */
const SEMANTICS = LiminalColorEngine.SEMANTICS;

export const S = L.SPACING;
export const R = L.RADIUS;
export const MONO = 'ui-monospace, SFMono-Regular, Menlo, monospace';

export const CANVAS = resolveSurface({ role: 'canvas', interactive: false });
export const CHROME = resolveSurface({ role: 'chrome', interactive: false });
export const WORK = resolveSurface({ role: 'work', interactive: false });
export const PANEL = resolveSurface({ role: 'panel', interactive: false });
export const WELL = resolveSurface({ role: 'well', interactive: false });
export const MENU = resolveSurface({ role: 'menu', interactive: false });
export const POPOVER = resolveSurface({ role: 'popover', interactive: false });

export function surfaceFor(role: SurfaceRole) {
  return resolveSurface({ role, interactive: false });
}

/** A panel. The docs' one container, so every page has the same rhythm. */
export function Section({
  title,
  note,
  children,
  role = 'panel',
  id,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
  role?: SurfaceRole;
  id?: string;
}) {
  const surface = surfaceFor(role);
  return (
    <section
      id={id}
      aria-label={title}
      style={{
        ...surface.style,
        borderRadius: `${R.card}px`,
        padding: `${S[4]}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${S[3]}px`,
        minWidth: 0,
      }}
    >
      <header style={{ display: 'flex', alignItems: 'baseline', gap: `${S[2]}px`, flexWrap: 'wrap' }}>
        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{title}</h3>
        {note && <span style={{ fontSize: 11, opacity: 0.7 }}>{note}</span>}
      </header>
      {children}
    </section>
  );
}

/** The panels call it Card; the pages call it Section. One component, one shape. */
export const Card = Section;

/** A label/value row, monospaced, so two runs can be compared character by character. */
export function Value({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'warn' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: `${S[3]}px`, alignItems: 'baseline', minWidth: 0 }}>
      <span style={{ fontSize: 11, opacity: 0.7, flexShrink: 0 }}>{label}</span>
      <code
        style={{
          fontFamily: MONO,
          fontSize: 11,
          direction: 'ltr',
          textAlign: 'left',
          overflowWrap: 'anywhere',
          color: tone === 'warn' ? SEMANTICS.DANGER.text : undefined,
        }}
      >
        {value}
      </code>
    </div>
  );
}

/** A number with a caption. The docs' one way of stating a measurement. */
export function Stat({ value, label, tone }: { value: string; label: string; tone?: 'ok' | 'warn' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span
        style={{
          fontSize: 22,
          fontWeight: 600,
          lineHeight: 1.1,
          color: tone === 'warn' ? SEMANTICS.DANGER.text : undefined,
        }}
      >
        {value}
      </span>
      <span style={{ fontSize: 11, opacity: 0.7 }}>{label}</span>
    </div>
  );
}

/** A button. Declares a role like every other control in the system. */
export function Btn({
  children,
  onClick,
  on,
  active,
  href,
  title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  on?: SurfaceRole;
  active?: boolean;
  href?: string;
  title?: string;
}) {
  const surface = resolveSurface({ role: 'control', on: on ?? 'chrome', interactive: true });
  const style: React.CSSProperties = {
    ...surface.style,
    font: 'inherit',
    fontSize: 12,
    padding: `${S[1]}px ${S[3]}px`,
    borderRadius: `${R.chip}px`,
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: `${S[1]}px`,
    ...(active ? WELL.style : null),
    transition: M.getTransition('background', 'fast'),
  };
  if (href) {
    return (
      <a href={href} style={style} title={title}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" onClick={onClick} aria-pressed={active} style={style} title={title}>
      {children}
    </button>
  );
}

export function Code({ children, block }: { children: string; block?: boolean }) {
  if (!block) {
    return <code style={{ fontFamily: MONO, fontSize: 11, direction: 'ltr' }}>{children}</code>;
  }
  return (
    <pre
      style={{
        margin: 0,
        fontFamily: MONO,
        fontSize: 11,
        direction: 'ltr',
        textAlign: 'left',
        overflowX: 'auto',
        whiteSpace: 'pre',
        opacity: 0.9,
      }}
    >
      {children}
    </pre>
  );
}

export function Prose({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: 0, fontSize: 12, lineHeight: 2, opacity: 0.85, maxWidth: '78ch' }}>{children}</p>;
}

/**
 * The element tree as JSX source, one level deep.
 *
 * Not a string the docs invented: it walks the element the fixture returned, so
 * what you read is what rendered. `forwardRef` wraps a component in an object,
 * so the name is read through `displayName`/`render.name`.
 */
export function toJsx(el: React.ReactElement, indent = 0, depth = 0): string {
  const pad = '  '.repeat(indent);
  const type = el.type as unknown as { displayName?: string; name?: string; render?: { name?: string } };
  const name =
    typeof el.type === 'string' ? el.type : type.displayName ?? type.name ?? type.render?.name ?? 'Component';
  const p = (el.props ?? {}) as Record<string, unknown>;
  const attrs = Object.entries(p)
    .filter(([k]) => k !== 'children')
    .map(([k, v]) => {
      if (typeof v === 'string') return `${k}="${v}"`;
      if (typeof v === 'number') return `${k}={${v}}`;
      if (typeof v === 'boolean') return v ? k : `${k}={false}`;
      return `${k}={…}`;
    });
  const kids = p.children;
  const head = `<${name}${attrs.length ? ' ' + attrs.join(' ') : ''}`;
  if (kids === undefined || kids === null) return `${pad}${head} />`;
  if (depth >= 1) return `${pad}${head}>…</${name}>`;
  const childList = Array.isArray(kids) ? kids : [kids];
  const rendered = childList.map((c) =>
    React.isValidElement(c) ? toJsx(c, indent + 1, depth + 1) : `${pad}  ${typeof c === 'string' ? c : '{…}'}`,
  );
  return `${pad}${head}>\n${rendered.join('\n')}\n${pad}</${name}>`;
}
