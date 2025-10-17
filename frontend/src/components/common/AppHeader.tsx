import { useAuth } from '@/providers/AuthProvider';

export const AppHeader: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="app-header__info">
        <h1 className="app-header__title">Lesta Blogger HUB</h1>
        <p className="app-header__subtitle">Контроль инфлюенсер кампаний</p>
      </div>
      <div className="app-header__actions">
        <span className="app-header__user">{user?.name}</span>
        <button className="button button--ghost" onClick={() => logout()}>
          Выйти
        </button>
      </div>
    </header>
  );
};
