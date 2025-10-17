import { Navigate, Route, Routes } from 'react-router-dom';

import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { AppLayout } from '@/layouts/AppLayout';
import { useAuth } from '@/providers/AuthProvider';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { CampaignListPage } from '@/pages/campaigns/CampaignListPage';
import { CampaignDetailPage } from '@/pages/campaigns/CampaignDetailPage';
import { PlacementListPage } from '@/pages/placements/PlacementListPage';
import { BloggerListPage } from '@/pages/bloggers/BloggerListPage';
import { CounterpartyListPage } from '@/pages/counterparties/CounterpartyListPage';
import { UserListPage } from '@/pages/users/UserListPage';

const App: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="fullscreen-loader">Загружаем профиль...</div>;
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="campaigns" element={<CampaignListPage />} />
        <Route path="campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="placements" element={<PlacementListPage />} />
        <Route path="bloggers" element={<BloggerListPage />} />
        <Route path="counterparties" element={<CounterpartyListPage />} />
        <Route path="users" element={<UserListPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
