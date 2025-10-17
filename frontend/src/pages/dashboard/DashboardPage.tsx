import { useDashboardSummary } from '@/api/queries/dashboard';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(
    value,
  );

export const DashboardPage: React.FC = () => {
  const { data, isLoading, isError } = useDashboardSummary();

  if (isLoading) {
    return <div className="card">Загружаем метрики...</div>;
  }

  if (isError || !data) {
    return <div className="card">Не удалось загрузить данные дэшборда.</div>;
  }

  return (
    <div className="dashboard-grid">
      <section className="card">
        <h2 className="card__title">Сводка кампаний</h2>
        <div className="dashboard-stats">
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Всего кампаний</span>
            <span className="dashboard-stats__value">{data.summary.totalCampaigns}</span>
          </div>
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Активные</span>
            <span className="dashboard-stats__value dashboard-stats__value--primary">
              {data.summary.activeCampaigns}
            </span>
          </div>
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Запланированный бюджет</span>
            <span className="dashboard-stats__value">{formatCurrency(data.summary.plannedBudget)}</span>
          </div>
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Фактический расход</span>
            <span className="dashboard-stats__value">{formatCurrency(data.summary.totalSpend)}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h2 className="card__title">Топ-10 блогеров по расходу</h2>
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
                <td>{item.placements}</td>
                <td>{formatCurrency(item.spend)}</td>
                <td>{new Intl.NumberFormat('ru-RU').format(item.views)}</td>
                <td>{item.averageCpv ? formatCurrency(item.averageCpv) : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2 className="card__title">Расход по типу контрагента</h2>
        <div className="chart-bars">
          {data.spendByCounterpartyType.map(({ type, spend }) => (
            <div key={type} className="chart-bars__item">
              <div className="chart-bars__label">{type}</div>
              <div className="chart-bars__bar">
                <div
                  className="chart-bars__fill"
                  style={{ width: Math.min(100, spend === 0 ? 5 : spend / (data.summary.totalSpend || 1) * 100) + '%' }}
                />
                <span className="chart-bars__value">{formatCurrency(spend)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
