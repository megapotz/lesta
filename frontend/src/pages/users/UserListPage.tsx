import type { FormEvent } from 'react';
import { useState } from 'react';

import { useUsers, useCreateUser, useRegenerateInvite, useUpdateUser } from '@/api/queries/users';
import { useAuth } from '@/providers/AuthProvider';
import { USER_ROLE_OPTIONS, USER_STATUS_OPTIONS } from '@/utils/constants';
import { USER_ROLE_LABELS, USER_STATUS_LABELS, statusBadgeClass } from '@/utils/formatters';

export const UserListPage: React.FC = () => {
  const { user } = useAuth();
  const { data, isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const regenerateInvite = useRegenerateInvite();
  const [formState, setFormState] = useState<{ name: string; email: string; role: string }>({
    name: '',
    email: '',
    role: USER_ROLE_OPTIONS[1]?.value ?? 'MANAGER',
  });

  if (user?.role !== 'ADMIN') {
    return <div className="card">Доступ разрешен только администраторам.</div>;
  }

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createUser.mutateAsync({ ...formState });
    setFormState({ name: '', email: '', role: USER_ROLE_OPTIONS[1]?.value ?? 'MANAGER' });
  };

  return (
    <div className="page-stack">
      <section className="card">
        <h2 className="card__title">Новый пользователь</h2>
        <form className="form-grid form-grid--two" onSubmit={handleCreate}>
          <div className="form-control">
            <label htmlFor="user-name">Имя</label>
            <input
              id="user-name"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="user-email">Email</label>
            <input
              id="user-email"
              type="email"
              value={formState.email}
              onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </div>
          <div className="form-control">
            <label htmlFor="user-role">Роль</label>
            <select
              id="user-role"
              value={formState.role}
              onChange={(event) => setFormState((prev) => ({ ...prev, role: event.target.value }))}
            >
              {USER_ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control form-actions">
            <button className="button" type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? 'Создаем...' : 'Пригласить'}
              </button>
          </div>
        </form>
      </section>

      <section className="card">
        <h3 className="card__title">Пользователи</h3>
        {isLoading ? (
          <p>Загружаем...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Имя</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {data?.users.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{USER_ROLE_LABELS[item.role] ?? item.role}</td>
                  <td>
                    <span className={statusBadgeClass(item.status)}>
                      {USER_STATUS_LABELS[item.status] ?? item.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(event) => updateUser.mutate({ id: item.id, status: event.target.value })}
                    >
                      {USER_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      className="button button--ghost"
                      type="button"
                      onClick={() => regenerateInvite.mutate(item.id)}
                    >
                      Обновить приглашение
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};
