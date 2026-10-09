import React from 'react';
import { NavigationProvider, useNavigation, Route } from './navigation/useNavigation';
import { App } from './App';
import { Card } from '../components/containers/Card';
import { Button } from '../components/atoms/Button';
import { Badge } from '../components/atoms/Badge';
import { getTextStyle, getLiminalStyle } from '../engine/spec-engine';
import { LiminalLayoutEngine } from '../engine/liminal-layout-engine';
import {
  SquaresFour,
  GitBranch,
  Lock,
  Hourglass,
  WarningOctagon,
} from '@phosphor-icons/react';
import { LiminalIcon } from '../engine/liminal-icon-engine';

function NavigationToolbar() {
  const { current, navigate } = useNavigation();
  const TYPOGRAPHY = LiminalLayoutEngine.TYPOGRAPHY;
  const SPACING = LiminalLayoutEngine.SPACING;

  const routes: Array<{ route: Route; label: string; icon: React.ReactNode }> = [
    { route: { name: 'dashboard' }, label: 'داشبورد مرکزی', icon: <LiminalIcon icon={SquaresFour} size="xs" weight="light" /> },
    { route: { name: 'project', id: 'alpha' }, label: 'پروژه Alpha', icon: <LiminalIcon icon={GitBranch} size="xs" weight="light" /> },
    { route: { name: 'login' }, label: 'ورود (Auth Gate)', icon: <LiminalIcon icon={Lock} size="xs" weight="light" /> },
    { route: { name: 'loading' }, label: 'تست Loading (۳ ثانیه)', icon: <LiminalIcon icon={Hourglass} size="xs" weight="light" /> },
    { route: { name: '404' }, label: 'تست ۴۰۴ Not Found', icon: <LiminalIcon icon={WarningOctagon} size="xs" weight="light" /> },
  ];

  return (
    <div
      style={{
        background: '#08090C',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '10px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: `${SPACING[3]}px`,
      }}
    >
      {/* Route Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: getTextStyle('tertiary', 1).color,
            marginRight: '6px',
            userSelect: 'none',
          }}
        >
          ROUTE SWITCHER:
        </span>

        {routes.map((item, idx) => {
          const isActive =
            current.name === item.route.name &&
            (current.name !== 'project' || (item.route.name === 'project' && (current as any).id === item.route.id));

          return (
            <Button
              key={idx}
              size="sm"
              variant={isActive ? 'primary' : 'ghost'}
              onClick={() => navigate(item.route)}
            >
              {item.icon}
              <span className="mr-1">{item.label}</span>
            </Button>
          );
        })}
      </div>

      {/* Meta Indicators */}
      <div className="flex items-center gap-2">
        <Badge semantic="success">
          Mist CTA Budget: 1/1 ✓ (hero)
        </Badge>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'monospace',
            color: getTextStyle('quaternary', 1).color,
          }}
        >
          active: {current.name}
        </span>
      </div>
    </div>
  );
}

export function AppDemo() {
  const RADIUS = LiminalLayoutEngine.RADIUS;

  return (
    <div
      style={{
        borderRadius: `${RADIUS.container}px`,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: '#060709',
        boxSizing: 'border-box',
      }}
    >
      <NavigationProvider>
        <NavigationToolbar />
        <App />
      </NavigationProvider>
    </div>
  );
}

export default AppDemo;
