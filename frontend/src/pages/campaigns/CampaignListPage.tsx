import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useCampaigns, useCreateCampaign } from '@/api/queries/campaigns';
import { CAMPAIGN_STATUS_OPTIONS, PRODUCT_OPTIONS } from '@/utils/constants';
import {
  CAMPAIGN_STATUS_LABELS,
  PRODUCT_LABELS,
  formatCurrency,
  formatDate,
  statusBadgeClass,
} from '@/utils/formatters';

const cleanFilters = (filters: Record<string, string>) =>
  Object.entries(filters).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value) {
      acc[key] = value;
    }
    return acc;
  }, {});

export const CampaignListPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ search: '', status: '', product: '' });
  const [isCreating, setCreating] = useState(false);
  const [formState, setFormState] = useState<{
    name: string;
    product: string;
    status: string;
    goal: string;
    startDate: string;
    endDate: string;
    budgetPlanned: string;
  }>({
    name: '',
    product: PRODUCT_OPTIONS[0]?.value ?? 'TANKS',
    status: 'DRAFT',
    goal: '',
    startDate: '',
    endDate: '',
    budgetPlanned: '',
  });

  const queryFilters = useMemo(() => cleanFilters(filters), [filters]);
  const { data, isLoading } = useCampaigns(queryFilters);
  const createCampaign = useCreateCampaign();

  const handleFilterChange = (event: FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    setFilters({
      search: (formData.get('search') as string) ?? '',
      product: (formData.get('product') as string) ?? '',
      status: (formData.get('status') as string) ?? '',
    });
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createCampaign.mutateAsync({
      name: formState.name,
      product: formState.product,
      status: formState.status,
      goal: formState.goal,
      startDate: formState.startDate || undefined,
      endDate: formState.endDate || undefined,
      budgetPlanned: formState.budgetPlanned ? Number(formState.budgetPlanned) : undefined,
    });
    setCreating(false);
    setFormState({
      name: '',
      product: PRODUCT_OPTIONS[0]?.value ?? 'TANKS',
      status: 'DRAFT',
      goal: '',
      startDate: '',
      endDate: '',
      budgetPlanned: '',
    });
  };

  return (
    <div className="page-stack">
      <section className="card">
        <div className="card__header">
          <h2 className="card__title">Кампании</h2>
          <button className="button" onClick={() => setCreating((prev) => !prev)}>
            {isCreating ? 'Скрыть форму' : 'Создать кампанию'}
          </button>
        </div>
        <form className="filter-grid" onSubmit={handleFilterChange}>
          <div className="form-control">
            <label htmlFor="search">Поиск</label>
            <input
              id="search"
              name="search"
              placeholder="Название кампании"
              defaultValue={filters.search}
            />
          </div>
          <div className="form-control">
            <label htmlFor="product">Продукт</label>
            <select id="product" name="product" defaultValue={filters.product}>
              <option value="">Все</option>
              {PRODUCT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="status">Статус</label>
            <select id="status" name="status" defaultValue={filters.status}>
              <option value="">Все</option>
              {CAMPAIGN_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control filter-actions">
            <button className="button" type="submit">
              Применить фильтр
            </button>
            <button
              className="button button--ghost"
              type="button"
              onClick={() => {
                setFilters({ search: '', status: '', product: '' });
              }}
            >
              Очистить
            </button>
          </div>
        </form>
      </section>

      {isCreating && (
        <section className="card">
          <h3 className="card__title">Новая кампания</h3>
          <form className="form-grid form-grid--two" onSubmit={handleCreate}>
            <div className="form-control">
              <label htmlFor="name">Название</label>
              <input
                id="name"
                value={formState.name}
                onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                required
              />
            </div>
            <div className="form-control">
              <label htmlFor="product-create">Продукт</label>
              <select
                id="product-create"
                value={formState.product}
                onChange={(event) => setFormState((prev) => ({ ...prev, product: event.target.value }))}
              >
                {PRODUCT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label htmlFor="status-create">Статус</label>
              <select
                id="status-create"
                value={formState.status}
                onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
              >
                {CAMPAIGN_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label htmlFor="budget">Бюджет (₽)</label>
              <input
                id="budget"
                type="number"
                min="0"
                value={formState.budgetPlanned}
                onChange={(event) => setFormState((prev) => ({ ...prev, budgetPlanned: event.target.value }))}
              />
            </div>
            <div className="form-control">
              <label htmlFor="startDate">Дата начала</label>
              <input
                id="startDate"
                type="date"
                value={formState.startDate}
                onChange={(event) => setFormState((prev) => ({ ...prev, startDate: event.target.value }))}
              />
            </div>
            <div className="form-control">
              <label htmlFor="endDate">Дата окончания</label>
              <input
                id="endDate"
                type="date"
                value={formState.endDate}
                onChange={(event) => setFormState((prev) => ({ ...prev, endDate: event.target.value }))}
              />
            </div>
            <div className="form-control form-control--full">
              <label htmlFor="goal">Цель</label>
              <textarea
                id="goal"
                rows={3}
                value={formState.goal}
                onChange={(event) => setFormState((prev) => ({ ...prev, goal: event.target.value }))}
              />
            </div>
            <div className="form-control form-actions">
            <button className="button" type="submit" disabled={createCampaign.isPending}>
              {createCampaign.isPending ? 'Создаем...' : 'Сохранить'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <h3 className="card__title">Результаты</h3>
        {isLoading ? (
          <p>Загружаем кампании...</p>
        ) : (
          <table className="table table--clickable">
            <thead>
              <tr>
                <th>Название</th>
                <th>Продукт</th>
                <th>Статус</th>
                <th>Ответственный</th>
                <th>Публикации</th>
                <th>Период</th>
                <th>Бюджет/Расход</th>
              </tr>
            </thead>
            <tbody>
              {data?.campaigns.map((campaign) => (
                <tr key={campaign.id} onClick={() => navigate('/campaigns/' + campaign.id)}>
                  <td>{campaign.name}</td>
                  <td>{PRODUCT_LABELS[campaign.product] ?? campaign.product}</td>
                  <td>
                    <span className={statusBadgeClass(campaign.status)}>
                      {CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}
                    </span>
                  </td>
                  <td>{campaign.owner?.name ?? '—'}</td>
                  <td>{campaign._count?.placements ?? 0}</td>
                  <td>
                    {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
                  </td>
                  <td>
                    {formatCurrency(campaign.budgetPlanned)} / {formatCurrency(campaign.spend ?? 0)}
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
