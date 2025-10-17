import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { useBloggers, useCreateBlogger } from '@/api/queries/bloggers';
import { useCounterparties } from '@/api/queries/counterparties';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { CONTACT_CHANNEL_OPTIONS } from '@/utils/constants';
import { formatNumber } from '@/utils/formatters';

type BloggerListPageProps = {
  counterpartyId?: number;
};

type FilterState = {
  search: string;
  social: string;
  counterpartyId: string;
};

export const BloggerListPage: React.FC<BloggerListPageProps> = ({ counterpartyId }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    social: '',
    counterpartyId: counterpartyId ? String(counterpartyId) : '',
  });
  const [filterInputs, setFilterInputs] = useState<FilterState>(filters);
  const [isCreating, setCreating] = useState(false);
  const [formState, setFormState] = useState<{
    name: string;
    profileUrl: string;
    socialPlatform: string;
    followers: string;
    averageReach: string;
    primaryChannel: string;
    primaryContact: string;
    counterpartyId: string;
  }>({
    name: '',
    profileUrl: '',
    socialPlatform: '',
    followers: '',
    averageReach: '',
    primaryChannel: '',
    primaryContact: '',
    counterpartyId: '',
  });

  const { data, isLoading } = useBloggers({
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.social ? { social: filters.social } : {}),
    ...(filters.counterpartyId ? { counterpartyId: Number(filters.counterpartyId) } : {}),
  });
  const { data: counterparties } = useCounterparties({ active: 'true' });
  const createBlogger = useCreateBlogger();

  const bloggers = data?.bloggers ?? [];

  useEffect(() => {
    const nextId = counterpartyId ? String(counterpartyId) : '';
    setFilters((prev) => ({ ...prev, counterpartyId: nextId }));
    setFilterInputs((prev) => ({ ...prev, counterpartyId: nextId }));
  }, [counterpartyId]);

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters(filterInputs);
  };

  const handleResetFilters = () => {
    const reset = { search: '', social: '', counterpartyId: filterInputs.counterpartyId };
    setFilterInputs(reset);
    setFilters(reset);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createBlogger.mutateAsync({
      name: formState.name,
      profileUrl: formState.profileUrl,
      socialPlatform: formState.socialPlatform || undefined,
      followers: formState.followers ? Number(formState.followers) : undefined,
      averageReach: formState.averageReach ? Number(formState.averageReach) : undefined,
      primaryChannel: formState.primaryChannel || undefined,
      primaryContact: formState.primaryContact || undefined,
      counterpartyIds: formState.counterpartyId ? [Number(formState.counterpartyId)] : undefined,
    });
    setFormState({
      name: '',
      profileUrl: '',
      socialPlatform: '',
      followers: '',
      averageReach: '',
      primaryChannel: '',
      primaryContact: '',
      counterpartyId: '',
    });
    setCreating(false);
  };

  const counterpartyOptions = useMemo(() => counterparties?.counterparties ?? [], [counterparties]);

  return (
    <div className="page-stack">
      <Breadcrumbs
        items={[
          { label: 'Партнеры', to: '/partners' },
          { label: 'Блогеры' },
        ]}
      />

      <section className="card">
        <div className="card__header">
          <h2 className="card__title">Блогеры</h2>
          <button className="button" onClick={() => setCreating((prev) => !prev)}>
            {isCreating ? 'Скрыть форму' : 'Добавить блогера'}
          </button>
        </div>
        <form className="filter-grid" onSubmit={handleFilterSubmit}>
          <div className="form-control">
            <label htmlFor="blogger-search">Поиск</label>
            <input
              id="blogger-search"
              name="search"
              placeholder="Название или профиль"
              value={filterInputs.search}
              onChange={(event) => setFilterInputs((prev) => ({ ...prev, search: event.target.value }))}
            />
          </div>
          <div className="form-control">
            <label htmlFor="social">Площадка</label>
            <input
              id="social"
              name="social"
              placeholder="Например, Telegram"
              value={filterInputs.social}
              onChange={(event) => setFilterInputs((prev) => ({ ...prev, social: event.target.value }))}
            />
          </div>
          <div className="form-control filter-actions">
            <button className="button" type="submit">
              Применить
            </button>
            <button className="button button--ghost" type="button" onClick={handleResetFilters}>
              Очистить
            </button>
          </div>
        </form>
      </section>

      {isCreating && (
        <section className="card">
          <h3 className="card__title">Новый блогер</h3>
          <form className="form-grid form-grid--two" onSubmit={handleCreate}>
            <div className="form-control">
              <label htmlFor="blogger-name">Название</label>
              <input
                id="blogger-name"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="profileUrl">Ссылка на профиль</label>
              <input
                id="profileUrl"
                value={formState.profileUrl}
                onChange={(event) => setFormState((prev) => ({ ...prev, profileUrl: event.target.value }))}
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="platform">Площадка</label>
              <input
                id="platform"
                value={formState.socialPlatform}
                onChange={(event) => setFormState((prev) => ({ ...prev, socialPlatform: event.target.value }))}
              />
            </div>
            <div className="form-control">
              <label htmlFor="followers">Подписчики</label>
              <input
                id="followers"
                type="number"
                min="0"
                value={formState.followers}
                onChange={(event) => setFormState((prev) => ({ ...prev, followers: event.target.value }))}
              />
            </div>
            <div className="form-control">
              <label htmlFor="averageReach">Средний охват</label>
              <input
                id="averageReach"
                type="number"
                min="0"
                value={formState.averageReach}
                onChange={(event) => setFormState((prev) => ({ ...prev, averageReach: event.target.value }))}
              />
            </div>
            <div className="form-control">
              <label htmlFor="primaryChannel">Канал связи</label>
              <select
                id="primaryChannel"
                value={formState.primaryChannel}
                onChange={(event) => setFormState((prev) => ({ ...prev, primaryChannel: event.target.value }))}
              >
                <option value="">Не указан</option>
                {CONTACT_CHANNEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label htmlFor="primaryContact">Контакт</label>
              <input
                id="primaryContact"
                value={formState.primaryContact}
                onChange={(event) => setFormState((prev) => ({ ...prev, primaryContact: event.target.value }))}
              />
            </div>
            <div className="form-control">
              <label htmlFor="counterparty">Контрагент</label>
              <select
                id="counterparty"
                value={formState.counterpartyId}
                onChange={(event) => setFormState((prev) => ({ ...prev, counterpartyId: event.target.value }))}
              >
                <option value="">Не привязан</option>
                {counterpartyOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control form-actions">
              <button className="button" type="submit" disabled={createBlogger.isPending}>
                {createBlogger.isPending ? 'Добавляем...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <h3 className="card__title">Реестр</h3>
        {isLoading ? (
          <p>Загружаем блогеров...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Ник</th>
                <th>Площадка</th>
                <th>Подписчики</th>
                <th>Средний охват</th>
                <th>Контрагенты</th>
                <th>Контакт</th>
              </tr>
            </thead>
            <tbody>
              {bloggers.map((blogger) => (
                <tr key={blogger.id}>
                  <td>
                    <a href={blogger.profileUrl} target="_blank" rel="noreferrer">
                      {blogger.name}
                    </a>
                  </td>
                  <td>{blogger.socialPlatform ?? '—'}</td>
                  <td>{formatNumber(blogger.followers)}</td>
                  <td>{formatNumber(blogger.averageReach)}</td>
                  <td>
                    <div className="tag-list">
                      {blogger.counterparties?.length
                        ? blogger.counterparties.map((item) => item.counterparty.name).join(', ')
                        : '—'}
                    </div>
                  </td>
                  <td>{blogger.primaryContact ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};
