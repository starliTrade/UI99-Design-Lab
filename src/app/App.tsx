import React from 'react';
import { NavigationProvider, useNavigation } from './navigation/useNavigation';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProjectPage } from './pages/ProjectPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { LoadingPage } from './pages/LoadingPage';

function RouterView() {
  const { current } = useNavigation();

  switch (current.name) {
    case 'login':
      return <LoginPage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'project':
      return <ProjectPage id={current.id} />;
    case 'loading':
      return <LoadingPage />;
    case '404':
      return <NotFoundPage />;
    default:
      return <NotFoundPage />;
  }
}

export function App() {
  return (
    <NavigationProvider>
      <RouterView />
    </NavigationProvider>
  );
}

export default App;
