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
import { getTextStyle } from '../engine/spec-engine';
import { resolveSurface } from '../engine/liminal-surface';

export type DeviceWidth = 'phone' | 'tablet' | 'fluid';

const WIDTHS: Record<DeviceWidth, number | null> = { phone: 390, tablet: 768, fluid: null };
const LABELS: Record<DeviceWidth, string> = { phone: '390', tablet: '768', fluid: 'Fluid' };

export function DeviceFrame({
  device,
  children,
  minHeight = 220,
}: {
  device: DeviceWidth;
  children: React.ReactNode;
  minHeight?: number;
}) {
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const [doc, setDoc] = useState<Document | null>(null);
  const width = WIDTHS[device];
  const CHROME = resolveSurface({ role: 'chrome', interactive: false });

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const inner = frame.contentDocument;
    if (!inner) return;

    // The frame's own document. `dir` and the theme attribute are copied because
    // they are on the document element, not in a stylesheet.
    inner.documentElement.setAttribute('dir', document.documentElement.getAttribute('dir') ?? 'ltr');
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
  }, [device]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${L.SPACING[2]}px`, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: `${L.SPACING[2]}px` }}>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{LABELS[device]}</span>
        {width && <span style={{ fontSize: 10, opacity: 0.4 }}>media queries fire at this width</span>}
      </div>
      <div
        style={{
          ...CHROME.style,
          width: width ? `min(${width}px, 100%)` : '100%',
          borderRadius: `${L.RADIUS.card}px`,
          padding: `${L.SPACING[3]}px`,
          boxSizing: 'border-box',
          minWidth: 0,
          transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
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
