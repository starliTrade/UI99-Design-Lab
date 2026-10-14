/**
 * LIMINAL · STUDIO — THE APP FRAME
 *
 * «یک اپِ واقعی در قابِ دستگاه.»
 *
 * The hero of the studio is not a screenshot of an app and not a showcase of
 * buttons. It is the app kit — `src/app` — running inside the device frame, so
 * the first thing a visitor sees is the system carrying a whole product: a
 * topbar, a sidebar, a table, a form, a 404.
 *
 * AND IT IS THE SAME FRAME THE REVIEW TOOL USES. Not a lookalike: `DeviceFrame`
 * is an iframe with its own viewport, so at 390 the app's own media queries fire
 * and its layout is the layout a phone gets. A `max-width` box would have shown
 * the desktop app in a narrow picture frame, which is the lie the frame exists
 * to avoid.
 *
 * The screens are the app's own routes. A kit that cannot be navigated is a
 * still frame with extra steps.
 */
import React, { useState } from 'react';
import { DeviceFrame, DEVICE_HEIGHT, type DeviceWidth } from './DeviceFrame';
import { NavigationProvider, type Route } from '../app/navigation/useNavigation';
import { App } from '../app/App';
import { Segmented, S } from './ui';

/** The screens, and what each one is a test OF. */
const SCREENS = [
  { id: 'dashboard', label: 'Dashboard', note: 'a table, stats and a sidebar' },
  { id: 'project', label: 'Project', note: 'a detail page with tabs' },
  { id: 'login', label: 'Login', note: 'a form, and the auth gate' },
  { id: 'loading', label: 'Loading', note: 'the skeleton state' },
  { id: '404', label: '404', note: 'the error page' },
] as const;

type ScreenId = (typeof SCREENS)[number]['id'];

const ROUTES: Record<ScreenId, Route> = {
  dashboard: { name: 'dashboard' },
  project: { name: 'project', id: 'alpha' },
  login: { name: 'login' },
  loading: { name: 'loading' },
  '404': { name: '404' },
};

const DEVICES: DeviceWidth[] = ['phone', 'tablet', 'fluid'];

export function AppFrame({
  screen: initialScreen = 'dashboard',
  device: initialDevice = 'fluid',
}: {
  screen?: ScreenId;
  device?: DeviceWidth;
} = {}) {
  const [screen, setScreen] = useState<ScreenId>(initialScreen);
  const [device, setDevice] = useState<DeviceWidth>(initialDevice);
  const current = SCREENS.find((s) => s.id === screen)!;

  /**
   * NOT `alignItems: center` on this column: a centred child is sized to its
   * content, and the frame's own width is `100%` — so the two together resolved
   * to the frame's MIN-CONTENT width and the hero rendered a real app 320px
   * wide. The frame stretches; the controls are what is centred.
   */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: `${S[3]}px`, minWidth: 0 }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: `${S[3]}px`,
          minWidth: 0,
        }}
      >
        <Segmented
          value={screen}
          options={SCREENS.map((s) => ({ id: s.id, label: s.label, title: s.note }))}
          onChange={setScreen}
        />
        <Segmented label="device" value={device} options={DEVICES.map((d) => ({ id: d, label: d }))} onChange={setDevice} />
      </div>

      <DeviceFrame device={device} minHeight={DEVICE_HEIGHT[device]} note={current.note}>
        {/* The app's own router, remounted per screen: `initialRoute` is read at
            mount, so switching screens has to be a mount and not a prop. */}
        <NavigationProvider key={screen} initialRoute={ROUTES[screen]}>
          <App />
        </NavigationProvider>
      </DeviceFrame>
    </div>
  );
}

export default AppFrame;
