import { Outlet } from 'react-router-dom';

import { AppHeader } from '@/components/common/AppHeader';
import { Sidebar } from '@/components/common/Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__content">
        <AppHeader />
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
