import type { FormEvent } from 'react';
import { useState } from 'react';

import { useCounterparties, useCreateCounterparty } from '@/api/queries/counterparties';
import {
  COUNTERPARTY_RELATIONSHIP_OPTIONS,
  COUNTERPARTY_TYPE_OPTIONS,
} from '@/utils/constants';
import { COUNTERPARTY_RELATIONSHIP_LABELS, COUNTERPARTY_TYPE_LABELS } from '@/utils/formatters';

export const CounterpartyListPage: React.FC = () => {
  const [filters, setFilters] = useState({ search: '', type: '', active: 'true' });
  const [isCreating, setCreating] = useState(false);
  const [formState, setFormState] = useState<{
    name: string;
    type: string;
    relationshipType: string;
    email: string;
    phone: string;
    inn: string;
    paymentDetails: string;
  }>({
    name: '',
    type: COUNTERPARTY_TYPE_OPTIONS[0]?.value ?? 'LEGAL_ENTITY',
    relationshipType: COUNTERPARTY_RELATIONSHIP_OPTIONS[0]?.value ?? 'DIRECT',
    email: '',
    phone: '',
    inn: '',
    paymentDetails: '',
  });

  const { data, isLoading } = useCounterparties({
    ...(filters.search ? { search: filters.search } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.active ? { active: filters.active } : {}),
  });
  const createCounterparty = useCreateCounterparty();

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setFilters({
      search: (formData.get('search') as string) ?? '',
      type: (formData.get('type') as string) ?? '',
      active: (formData.get('active') as string) ?? '',
    });
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createCounterparty.mutateAsync({
      name: formState.name,
      type: formState.type,
      relationshipType: formState.relationshipType,
      email: formState.email || undefined,
      phone: formState.phone || undefined,
      inn: formState.inn || undefined,
      paymentDetails: formState.paymentDetails || undefined,
    });
    setFormState({
      name: '',
      type: COUNTERPARTY_TYPE_OPTIONS[0]?.value ?? 'LEGAL_ENTITY',
      relationshipType: COUNTERPARTY_RELATIONSHIP_OPTIONS[0]?.value ?? 'DIRECT',
      email: '',
      phone: '',
      inn: '',
      paymentDetails: '',
    });
    setCreating(false);
  };

  return (
    <div className="page-stack">
      <section className="card">
        <div className="card__header">
          <h2 className="card__title">Контрагенты</h2>
          <button className="button" onClick={() => setCreating((prev) => !prev)}>
            {isCreating ? 'Скрыть форму' : 'Добавить контрагента'}
          </button>
        </div>
        <form className="filter-grid" onSubmit={handleFilterSubmit}>
          <div className="form-control">
            <label htmlFor="counterparty-search">Поиск</label>
            <input id="counterparty-search" name="search" placeholder="Название" />
          </div>
          <div className="form-control">
            <label htmlFor="type">Тип</label>
            <select id="type" name="type" defaultValue={filters.type}>
              <option value="">Все</option>
              {COUNTERPARTY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="active">Активность</label>
            <select id="active" name="active" defaultValue={filters.active}>
              <option value="">Все</option>
              <option value="true">Активные</option>
              <option value="false">Деактивированные</option>
            </select>
          </div>
          <div className="form-control filter-actions">
            <button className="button" type="submit">
              Применить
            </button>
            <button className="button button--ghost" type="button" onClick={() => setFilters({ search: '', type: '', active: 'true' })}>
              Очистить
            </button>
          </div>
        </form>
      </section>

      {isCreating && (
        <section className="card">
          <h3 className="card__title">Новый контрагент</h3>
          <form className="form-grid form-grid--two" onSubmit={handleCreate}>
            <div className="form-control">
              <label htmlFor="partner-name">Название</label>
              <input
                id="partner-name"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="partner-type">Тип</label>
              <select
                id="partner-type"
                value={formState.type}
                onChange={(event) => setFormState((prev) => ({ ...prev, type: event.target.value }))}
              >
                {COUNTERPARTY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label htmlFor="partner-rel">Тип отношений</label>
              <select
                id="partner-rel"
                value={formState.relationshipType}
                onChange={(event) => setFormState((prev) => ({ ...prev, relationshipType: event.target.value }))}
              >
                {COUNTERPARTY_RELATIONSHIP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label htmlFor="partner-email">Email</label>
              <input
                id="partner-email"
                type="email"
                value={formState.email}
                onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="form-control">
              <label htmlFor="partner-phone">Телефон</label>
              <input
                id="partner-phone"
                value={formState.phone}
                onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
              />
            </div>
            <div className="form-control">
              <label htmlFor="partner-inn">ИНН</label>
              <input
                id="partner-inn"
                value={formState.inn}
                onChange={(event) => setFormState((prev) => ({ ...prev, inn: event.target.value }))}
              />
            </div>
            <div className="form-control form-control--full">
              <label htmlFor="partner-payment">Платежные реквизиты</label>
              <textarea
                id="partner-payment"
                rows={3}
                value={formState.paymentDetails}
                onChange={(event) => setFormState((prev) => ({ ...prev, paymentDetails: event.target.value }))}
              />
            </div>
            <div className="form-control form-actions">
            <button className="button" type="submit" disabled={createCounterparty.isPending}>
              {createCounterparty.isPending ? 'Создаем...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <h3 className="card__title">Реестр</h3>
        {isLoading ? (
          <p>Загружаем контрагентов...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Тип</th>
                <th>Отношения</th>
                <th>Email</th>
                <th>Телефон</th>
                <th>Активность</th>
              </tr>
            </thead>
            <tbody>
              {data?.counterparties.map((counterparty) => (
                <tr key={counterparty.id}>
                  <td>{counterparty.name}</td>
                  <td>{COUNTERPARTY_TYPE_LABELS[counterparty.type] ?? counterparty.type}</td>
                  <td>{COUNTERPARTY_RELATIONSHIP_LABELS[counterparty.relationshipType] ?? counterparty.relationshipType}</td>
                  <td>{counterparty.email ?? '—'}</td>
                  <td>{counterparty.phone ?? '—'}</td>
                  <td>
                    <span className={counterparty.isActive ? 'badge badge--green' : 'badge badge--red'}>
                      {counterparty.isActive ? 'Активен' : 'Не активен'}
                    </span>
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
