import { NavLink } from 'react-router-dom';

import { useAuth } from '@/providers/AuthProvider';

const navLinks = [
  { to: '/', label: 'Дэшборд', end: true },
  { to: '/campaigns', label: 'Кампании' },
  { to: '/placements', label: 'Размещения' },
  { to: '/bloggers', label: 'Блогеры' },
  { to: '/counterparties', label: 'Контрагенты' },
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
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }: { isActive: boolean }) =>
              ['sidebar__link', isActive ? 'sidebar__link--active' : ''].filter(Boolean).join(' ')
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
