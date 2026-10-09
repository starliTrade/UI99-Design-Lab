import React from 'react';
import { NavigationProvider, NavigationContext, useNavigation } from './navigation/useNavigation';
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
  const existingNav = React.useContext(NavigationContext);
  if (existingNav) {
    return <RouterView />;
  }

  return (
    <NavigationProvider>
      <RouterView />
    </NavigationProvider>
  );
}

export default App;
