/**
 * LIMINAL · DOCS — THE DEVICE FRAME
 *
 * A component rendered at a REAL device width, with media queries firing.
 *
 * WHY AN IFRAME AND NOT A NARROW BOX. A `max-width: 390px` div does not change
 * what a media query sees: `@media (max-width: 900px)` asks about the VIEWPORT,
 * and the viewport is still the desktop one. So a component with a breakpoint —
 * `AppShell`, `Sidebar` — renders its desktop layout inside a phone-sized box
 * and the frame lies about what it is showing.
 *
 * An iframe has its own viewport. Inside it, `window.innerWidth` IS 390, the
 * media query fires, and the component lays out the way it will on a phone.
 * That is the difference between a picture of a phone and a phone.
 *
 * The stylesheets are COPIED from this document into the frame's, so the
 * component inside is styled by the same CSS that styles it outside — including
 * the theme, which is a `<style>` element the provider injects.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { LiminalLayoutEngine as L } from '../engine/liminal-layout-engine';
import { getTextStyle, SURFACE_TINT } from '../engine/spec-engine';
import { resolveSurface } from '../engine/liminal-surface';
import { useTheme } from './theme';

export type DeviceWidth = 'phone' | 'tablet' | 'fluid';

const WIDTHS: Record<DeviceWidth, number | null> = { phone: 390, tablet: 768, fluid: null };
const LABELS: Record<DeviceWidth, string> = { phone: '390', tablet: '768', fluid: 'Fluid' };

/**
 * The frame's height, per device.
 *
 * A device dimension, like the width beside it — NOT a breakpoint. The engine's
 * breakpoints are derived from content and this is not one of those: a phone is
 * 390 wide because phones are 390 wide. Named here, once, so the app frame and
 * the component frame cannot disagree about how tall a phone is.
 */
export const DEVICE_HEIGHT: Record<DeviceWidth, number> = { phone: 620, tablet: 600, fluid: 560 };

export function DeviceFrame({
  device,
  children,
  minHeight = 220,
  note,
  chrome = 'device',
}: {
  device: DeviceWidth;
  children: React.ReactNode;
  minHeight?: number;
  /** A caption under the width, when the frame is not the studio's. */
  note?: string;
  /**
   * `device` puts the width above the frame, `browser` puts a browser bar in it.
   *
   * The landing page shows an app the way a product site does: inside a window
   * with three dots and an address. That is a different frame from the review
   * tool's, and it is the same iframe underneath — one implementation, two
   * costumes, which is the rule this project keeps having to relearn.
   */
  chrome?: 'device' | 'browser';
}) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [doc, setDoc] = useState<Document | null>(null);
  const width = WIDTHS[device];
  const CHROME = resolveSurface({ role: 'chrome', interactive: false });
  /**
   * THE THEME AND THE DIRECTION HAVE TO BE COPIED AGAIN, NOT ONCE.
   *
   * The stylesheets are cloned into the frame, and a clone is a photograph: the
   * theme is a `<style>` element whose TEXT changes when a slider moves, and the
   * direction is an attribute on the document element. Both were copied at mount
   * and never again — so the frame kept the theme it was born with, and a
   * reviewer moving the density slider would watch the page re-theme around a
   * frame that did not.
   *
   * The theme is a dependency now, and the direction is OBSERVED, because it is
   * set by `DirProvider` on the document element and never passes through here.
   */
  const { theme } = useTheme();
  const [dir, setDir] = useState<string>(() => document.documentElement.getAttribute('dir') ?? 'ltr');

  useEffect(() => {
    const read = () => setDir(document.documentElement.getAttribute('dir') ?? 'ltr');
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const inner = frame.contentDocument;
    if (!inner) return;

    // The frame's own document. `dir` and the theme attribute are copied because
    // they are on the document element, not in a stylesheet.
    inner.documentElement.setAttribute('dir', dir);
    inner.documentElement.setAttribute('lang', 'en');
    inner.documentElement.style.colorScheme = 'dark';

    // Every stylesheet this document has, in order. Vite injects `<style>` in
    // development and `<link>` in a build; both are copied, so the frame is
    // styled by exactly what styles the page.
    const head = inner.head;
    head.innerHTML = '';
    for (const node of [...document.querySelectorAll('style, link[rel=stylesheet]')]) {
      head.appendChild(node.cloneNode(true));
    }
    // React portals need a container that exists.
    inner.body.style.margin = '0';
    inner.body.style.padding = '0';
    setDoc(inner);
  }, [device, dir, theme.css]);

  const browserBar = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: `${L.SPACING[3]}px`,
        padding: `${L.SPACING[2]}px ${L.SPACING[3]}px`,
        borderBlockEnd: `${L.BORDER.hairline}px solid ${SURFACE_TINT.subtle}`,
      }}
    >
      <span style={{ display: 'flex', gap: L.SPACING[1] }} aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ width: L.SPACING[1], height: L.SPACING[1], borderRadius: L.RADIUS.full, background: SURFACE_TINT.strong }} />
        ))}
      </span>
      <span
        style={{
          flex: 1,
          minWidth: 0,
          fontSize: 11,
          opacity: 0.55,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {note ?? 'liminal.local'}
      </span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${L.SPACING[2]}px`, minWidth: 0 }}>
      {chrome === 'device' && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: `${L.SPACING[2]}px` }}>
          <span style={{ fontSize: 10, opacity: 0.6 }}>{LABELS[device]}</span>
          <span style={{ fontSize: 10, opacity: 0.4 }}>
            {note ?? (width ? 'media queries fire at this width' : 'the width of the page')}
          </span>
        </div>
      )}
      <div
        style={{
          ...CHROME.style,
          width: width ? `min(${width}px, 100%)` : '100%',
          borderRadius: `${L.RADIUS.card}px`,
          padding: chrome === 'browser' ? 0 : `${L.SPACING[3]}px`,
          boxSizing: 'border-box',
          minWidth: 0,
          overflow: 'hidden',
          transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {chrome === 'browser' && browserBar}
        <iframe
          ref={frameRef}
          title="Component preview"
          style={{
            width: '100%',
            minHeight,
            border: 'none',
            display: 'block',
            background: 'transparent',
            colorScheme: 'dark',
          }}
        />
      </div>
      {doc && createPortal(children, doc.body)}
    </div>
  );
}
