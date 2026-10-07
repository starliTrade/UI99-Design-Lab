import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';

export interface AppShellProps {
  topbar?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  mobileNav?: ReactNode;
  maxWidth?: number;
  className?: string;
  style?: CSSProperties;
}

export function AppShell({
  topbar,
  sidebar,
  children,
  footer,
  mobileNav,
  maxWidth = 1280,
  className = '',
  style: customStyle = {},
}: AppShellProps) {
  const SPACING = LiminalLayoutEngine.SPACING;

  return (
    <div
      className={`liminal-app-shell ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        boxSizing: 'border-box',
        ...customStyle,
      }}
    >
      {/* 1. Topbar Landmark */}
      {topbar && (
        <header className="liminal-shell-header" style={{ width: '100%', flexShrink: 0 }}>
          {topbar}
        </header>
      )}

      {/* 2. Main Shell Body */}
      <div
        className={`liminal-shell-body ${mobileNav ? 'liminal-has-mobile-nav' : ''}`}
        style={{
          display: 'flex',
          gap: `${SPACING[5]}px`, // 24px
          maxWidth: `${maxWidth}px`,
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
          padding: `${SPACING[5]}px`,
          flex: 1,
          paddingBottom: mobileNav ? '80px' : `${SPACING[5]}px`,
        }}
      >
        {/* Sidebar Landmark */}
        {sidebar && (
          <aside
            className="liminal-shell-sidebar"
            style={{
              width: '220px',
              flexShrink: 0,
              alignSelf: 'flex-start',
              position: 'sticky',
              top: '88px', // 64px Topbar + 24px gap
              boxSizing: 'border-box',
            }}
          >
            {sidebar}
          </aside>
        )}

        {/* Main Content Landmark */}
        <main
          className="liminal-shell-main"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: `${SPACING[7]}px`, // 48px between sections
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          {children}
        </main>
      </div>

      {/* 3. Footer Landmark */}
      {footer && (
        <footer className="liminal-shell-footer" style={{ width: '100%', flexShrink: 0 }}>
          <div style={{ maxWidth: `${maxWidth}px`, margin: '0 auto', padding: `0 ${SPACING[5]}px` }}>
            {footer}
          </div>
        </footer>
      )}

      {/* 4. Bottom Mobile Nav for <640px */}
      {mobileNav && (
        <nav
          className="liminal-shell-mobile-nav"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            boxSizing: 'border-box',
          }}
        >
          {mobileNav}
        </nav>
      )}

      <style>{`
        @media (max-width: 800px) {
          .liminal-shell-body { flex-direction: column !important; padding: 16px !important; }
          .liminal-shell-body.liminal-has-mobile-nav {
            padding-bottom: calc(80px + env(safe-area-inset-bottom)) !important;
          }
          .liminal-shell-sidebar { display: none !important; }
        }
        @media (min-width: 640px) {
          .liminal-shell-mobile-nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AppShell;
