import { NavLink } from 'react-router-dom';

import { useAuth } from '@/providers/AuthProvider';

const navLinks = [
  { to: '/', label: 'Дэшборд', end: true },
  { to: '/campaigns', label: 'Кампании' },
  { to: '/placements', label: 'Размещения' },
  { to: { pathname: '/partners', search: '?tab=bloggers' }, label: 'Партнеры' },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const links = [...navLinks];

  if (user?.role === 'ADMIN') {
    links.push({ to: '/users', label: 'Пользователи' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">Lesta Blogger HUB</div>
      <nav className="sidebar__nav">
        {links.map((link) => {
          const key = typeof link.to === 'string' ? link.to : `${link.to.pathname}${link.to.search ?? ''}`;
          return (
            <NavLink
              key={key}
              to={link.to}
              end={link.end}
              className={({ isActive }: { isActive: boolean }) =>
                ['sidebar__link', isActive ? 'sidebar__link--active' : ''].filter(Boolean).join(' ')
              }
            >
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
