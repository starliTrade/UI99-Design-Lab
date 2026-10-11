import React, { useState, useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { MagnifyingGlass, Command as CommandIcon } from '@phosphor-icons/react';
import {
  getTextStyle,
  getLadderColor,
  SHADOWS, VEIL } from '../../../engine/spec-engine';
import { LiminalColorEngine } from '../../../engine/liminal-color-engine';
import { LiminalLayoutEngine } from '../../../engine/liminal-layout-engine';
import { LiminalMotionEngine } from '../../../engine/liminal-motion-engine';
import { LiminalIcon } from '../../../engine/liminal-icon-engine';
import { LiminalPortal } from '../../../engine/liminal-portal';
import { useFocusTrap, useEscapeKey, useScrollLock, useRovingTabIndex, useReducedMotion } from '../../../engine/liminal-hooks';
import { Input } from '../../inputs/Input';

export interface CommandPaletteItem {
  id: string;
  label: string;
  icon?: ReactNode;
  shortcut?: string;
  action: () => void;
}

export interface CommandPaletteGroup {
  title: string;
  items: CommandPaletteItem[];
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  groups: CommandPaletteGroup[];
  className?: string;
  style?: CSSProperties;
}

export function CommandPalette({
  isOpen,
  onClose,
  groups,
  className = '',
  style: customStyle = {},
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useScrollLock(isOpen);
  useEscapeKey(onClose, isOpen);
  useFocusTrap(containerRef, isOpen);

  // Reset query and active index on open/close
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Filter groups and items
  const filteredGroups = groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      ),
    }))
    .filter((group) => group.items.length > 0);

  const flatItems = filteredGroups.flatMap((g) => g.items);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const { getItemProps } = useRovingTabIndex(flatItems, activeIndex, {
    orientation: 'vertical',
    loop: true,
    onSelect: (idx) => setActiveIndex(idx),
  });

  if (!isOpen) return null;

  const mist = LiminalColorEngine.getMistStyle(LiminalColorEngine.BRAND_PRIMARY.hex, 'quiet');
  const SPACING = LiminalLayoutEngine.SPACING;
  const RADIUS = LiminalLayoutEngine.RADIUS;
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;

  const backdropStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: VEIL.backdrop,
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${SPACING[4]}px`,
    animation: reducedMotion ? 'none' : LiminalMotionEngine.fadeIn(),
  };

  const panelStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '80vh',
    background: mist.background,
    backdropFilter: mist.backdropFilter,
    WebkitBackdropFilter: mist.WebkitBackdropFilter,
    boxShadow: `${SHADOWS[4]}, ${mist.boxShadow}`,
    borderRadius: `${RADIUS.container}px`,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: reducedMotion ? 'none' : LiminalMotionEngine.scaleIn(0.96),
    outline: 'none',
    boxSizing: 'border-box',
    border: `1px solid ${getLadderColor(3)}`,
    ...customStyle,
  };

  const headerStyle: CSSProperties = {
    padding: `${SPACING[3]}px`,
    borderBottom: `1px solid ${getLadderColor(2.5)}`,
  };

  const bodyStyle: CSSProperties = {
    padding: `${SPACING[2]}px`,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: `${SPACING[3]}px`,
    maxHeight: '380px',
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && flatItems[activeIndex]) {
      e.preventDefault();
      flatItems[activeIndex].action();
      onClose();
    }
  };

  return (
    <LiminalPortal>
      <div
        style={backdropStyle}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          ref={containerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Command Palette"
          className={className}
          style={panelStyle}
          onKeyDown={handleKeyDown}
        >
          {/* Mist ring layer */}
          <div style={mist.ringLayer as CSSProperties} />

          <div style={headerStyle}>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a command or search..."
              autoFocus
              leftIcon={<LiminalIcon icon={MagnifyingGlass} size="sm" weight="regular" />}
              style={{ border: 'none', background: 'transparent' }}
            />
          </div>

          <div style={bodyStyle}>
            {filteredGroups.length === 0 ? (
              <div
                style={{
                  padding: `${SPACING[4]}px`,
                  textAlign: 'center',
                  color: getTextStyle('tertiary', 1).color,
                  fontSize: `${TYPOGRAPHY[2].fs}px`,
                }}
              >
                No commands found
              </div>
            ) : (
              filteredGroups.map((group) => (
                <div key={group.title} style={{ display: 'flex', flexDirection: 'column', gap: `${SPACING[1]}px` }}>
                  <div
                    style={{
                      fontSize: `${TYPOGRAPHY[1].fs}px`,
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: getTextStyle('tertiary', 1).color,
                      padding: `0 ${SPACING[2]}px`,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {group.title}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {group.items.map((item) => {
                      const globalIndex = flatItems.findIndex((i) => i.id === item.id);
                      const isActive = globalIndex === activeIndex;
                      const itemProps = getItemProps(globalIndex);

                      return (
                        <div
                          key={item.id}
                          {...itemProps}
                          role="option"
                          aria-selected={isActive}
                          onClick={() => {
                            item.action();
                            onClose();
                          }}
                          onMouseEnter={() => setActiveIndex(globalIndex)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: `${SPACING[2]}px ${SPACING[3]}px`,
                            borderRadius: `${RADIUS.chip}px`,
                            cursor: 'pointer',
                            background: isActive ? getLadderColor(3) : 'transparent',
                            color: isActive ? getTextStyle('primary', 3).color : getTextStyle('primary', 1).color,
                            fontSize: `${TYPOGRAPHY[2].fs}px`,
                            fontWeight: isActive ? 500 : 400,
                            transition: reducedMotion
                              ? 'none'
                              : LiminalMotionEngine.getTransition('background', 'fast'),
                            position: 'relative',
                            zIndex: 1,
                            userSelect: 'none',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: `${SPACING[2]}px` }}>
                            {item.icon && <LiminalIcon icon={item.icon as any} size="sm" />}
                            <span>{item.label}</span>
                          </div>
                          {item.shortcut && (
                            <span
                              style={{
                                fontSize: `${TYPOGRAPHY[1].fs}px`,
                                fontFamily: 'monospace',
                                color: getTextStyle('tertiary', 1).color,
                                background: getLadderColor(2),
                                padding: `${SPACING[1]}px ${SPACING[2]}px`,
                                borderRadius: `${RADIUS.chip}px`,
                                border: `1px solid ${getLadderColor(3)}`,
                              }}
                            >
                              {item.shortcut}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </LiminalPortal>
  );
}

export default CommandPalette;
