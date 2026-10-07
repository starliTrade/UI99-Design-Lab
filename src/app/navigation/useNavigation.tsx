import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Route =
  | { name: 'login' }
  | { name: 'dashboard' }
  | { name: 'project'; id: string }
  | { name: 'loading' }
  | { name: '404' };

export interface NavigationContextType {
  current: Route;
  navigate: (route: Route) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

function parseHash(hash: string): Route {
  const clean = hash.replace(/^#\/?/, '').trim();
  if (!clean || clean === 'app' || clean === 'dashboard') return { name: 'dashboard' };
  if (clean === 'login') return { name: 'login' };
  if (clean === 'loading') return { name: 'loading' };
  if (clean === '404') return { name: '404' };
  if (clean.startsWith('project/')) {
    const id = clean.split('/')[1] || 'alpha';
    return { name: 'project', id };
  }
  return { name: '404' };
}

function routeToHash(route: Route): string {
  switch (route.name) {
    case 'dashboard':
      return 'dashboard';
    case 'login':
      return 'login';
    case 'loading':
      return 'loading';
    case 'project':
      return `project/${route.id}`;
    case '404':
      return '404';
  }
}

export function NavigationProvider({
  children,
  initialRoute = { name: 'dashboard' },
}: {
  children: ReactNode;
  initialRoute?: Route;
}) {
  const [current, setCurrent] = useState<Route>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#app/')) {
      const sub = window.location.hash.replace('#app/', '');
      return parseHash(sub);
    }
    return initialRoute;
  });

  const navigate = (newRoute: Route) => {
    setCurrent(newRoute);
    if (typeof window !== 'undefined') {
      window.location.hash = `#app/${routeToHash(newRoute)}`;
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      if (typeof window !== 'undefined' && window.location.hash.startsWith('#app/')) {
        const sub = window.location.hash.replace('#app/', '');
        setCurrent(parseHash(sub));
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <NavigationContext.Provider value={{ current, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextType {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

export default useNavigation;
