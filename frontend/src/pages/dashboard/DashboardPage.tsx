import { useMemo, useState } from 'react';

import { useDashboardSummary } from '@/api/queries/dashboard';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { PRODUCT_OPTIONS } from '@/utils/constants';
import { COUNTERPARTY_TYPE_LABELS, PRODUCT_LABELS, formatCurrency, formatNumber } from '@/utils/formatters';

const PERIOD_OPTIONS: Array<{ value: 'current_month' | 'last_month' | 'quarter' | 'year'; label: string }> = [
  { value: 'current_month', label: 'Текущий месяц' },
  { value: 'last_month', label: 'Прошлый месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год' },
];

const formatCurrencyWithPrecision = (value: number, fractionDigits = 0) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

export const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<'current_month' | 'last_month' | 'quarter' | 'year'>('current_month');
  const [product, setProduct] = useState<'ALL' | (typeof PRODUCT_OPTIONS)[number]['value']>('ALL');
  const { data, isLoading, isError } = useDashboardSummary({ period, product });

  const maxSpendByType = useMemo(() => {
    if (!data?.spendByCounterpartyType?.length) {
      return 0;
    }
    return Math.max(...data.spendByCounterpartyType.map((item) => item.spend));
  }, [data?.spendByCounterpartyType]);

  if (isLoading) {
    return <div className="card">Загружаем метрики...</div>;
  }

  if (isError || !data) {
    return <div className="card">Не удалось загрузить данные дэшборда.</div>;
  }

  const averageCpv = data.summary.averageCpv ?? 0;
  const averageEr = data.summary.averageEr ?? 0;

  return (
    <div className="page-stack">
      <Breadcrumbs items={[{ label: 'Дэшборд' }]} />

      <section className="card">
        <div className="card__header">
          <h2 className="card__title">Фильтры</h2>
        </div>
        <div className="filter-grid">
          <div className="form-control">
            <label htmlFor="dashboard-period">Период</label>
            <select
              id="dashboard-period"
              value={period}
              onChange={(event) => setPeriod(event.target.value as typeof period)}
            >
              {PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="dashboard-product">Продукт</label>
            <select
              id="dashboard-product"
              value={product}
              onChange={(event) => setProduct(event.target.value as typeof product)}
            >
              <option value="ALL">Все продукты</option>
              {PRODUCT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="card__title">Ключевые показатели</h2>
        <div className="dashboard-stats">
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Общий расход</span>
            <span className="dashboard-stats__value dashboard-stats__value--primary">
              {formatCurrency(data.summary.totalSpend)}
            </span>
          </div>
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Всего публикаций</span>
            <span className="dashboard-stats__value">{formatNumber(data.summary.totalPublications)}</span>
          </div>
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Средняя стоимость просмотра (CPV)</span>
            <span className="dashboard-stats__value">
              {data.summary.averageCpv !== null ? formatCurrencyWithPrecision(averageCpv, 2) : '—'}
            </span>
          </div>
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Средний ER</span>
            <span className="dashboard-stats__value">
              {data.summary.averageEr !== null ? `${averageEr.toFixed(1)}%` : '—'}
            </span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="card__title">Активные кампании</h2>
        {data.activeCampaigns.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Кампания</th>
                <th>Продукт</th>
                <th>Прогресс</th>
                <th>План / Потрачено</th>
              </tr>
            </thead>
            <tbody>
              {data.activeCampaigns.map((campaign) => {
                const timePercent = Math.round(campaign.timeProgress * 100);
                const budgetPercent = Math.round(campaign.budgetProgress * 100);
                const isBudgetAhead = campaign.budgetProgress >= campaign.timeProgress;

                return (
                  <tr key={campaign.id}>
                    <td>{campaign.name}</td>
                    <td>{PRODUCT_LABELS[campaign.product]}</td>
                    <td>
                      <div className="progress-dual">
                        <div
                          className="progress-dual__layer progress-dual__layer--time"
                          style={{ width: `${timePercent}%` }}
                        />
                        <div
                          className={[
                            'progress-dual__layer',
                            isBudgetAhead ? 'progress-dual__layer--budget-green' : 'progress-dual__layer--budget-yellow',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          style={{ width: `${budgetPercent}%` }}
                        />
                      </div>
                      <div className="progress-dual__legend">
                        <span>Время: {timePercent}%</span>
                        <span>Бюджет: {budgetPercent}%</span>
                      </div>
                    </td>
                    <td>
                      <div className="progress-budget">
                        <span>{formatCurrency(campaign.budgetPlanned)}</span>
                        <span>{formatCurrency(campaign.spend)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>Нет активных кампаний, соответствующих фильтрам.</p>
        )}
      </section>

      <section className="card">
        <h2 className="card__title">Топ-10 блогеров по расходу</h2>
        {data.topBloggers.length ? (
          <table className="table">
            <thead>
              <tr>
                <th>Блогер</th>
                <th>Размещений</th>
                <th>Расход</th>
                <th>Просмотры</th>
                <th>CPV</th>
              </tr>
            </thead>
            <tbody>
              {data.topBloggers.map((item) => (
                <tr key={item.bloggerId}>
                  <td>{item.name}</td>
                  <td>{formatNumber(item.placements)}</td>
                  <td>{formatCurrency(item.spend)}</td>
                  <td>{formatNumber(item.views)}</td>
                  <td>{item.averageCpv !== null ? formatCurrencyWithPrecision(item.averageCpv, 2) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Пока нет завершенных размещений по текущим фильтрам.</p>
        )}
      </section>

      <section className="card">
        <h2 className="card__title">Расход по типу контрагента</h2>
        {data.spendByCounterpartyType.length ? (
          <div className="chart-bars">
            {data.spendByCounterpartyType.map(({ type, spend }) => {
              const base = maxSpendByType > 0 ? (spend / maxSpendByType) * 100 : 0;
              const width = spend > 0 ? Math.max(8, base) : 4;
              return (
                <div key={type} className="chart-bars__item">
                  <div className="chart-bars__label">{COUNTERPARTY_TYPE_LABELS[type]}</div>
                  <div className="chart-bars__bar">
                    <div className="chart-bars__fill" style={{ width: `${width}%` }} />
                    <span className="chart-bars__value">{formatCurrency(spend)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p>Данные по расходу контрагентов отсутствуют для выбранных фильтров.</p>
        )}
      </section>
    </div>
  );
};
