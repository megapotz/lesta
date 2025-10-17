import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useCampaignDetail } from '@/api/queries/campaigns';
import {
  CAMPAIGN_STATUS_LABELS,
  PLACEMENT_STATUS_LABELS,
  formatCurrency,
  formatDate,
  formatNumber,
  statusBadgeClass,
} from '@/utils/formatters';

const isOverdue = (status: string, placementDate?: string | null) => {
  if (!placementDate) {
    return false;
  }
  const date = new Date(placementDate);
  const today = new Date();
  return status === 'AWAITING_PUBLICATION' && date < today;
};

export const CampaignDetailPage: React.FC = () => {
  const params = useParams();
  const campaignId = Number(params.id);
  const { data, isLoading, isError } = useCampaignDetail(Number.isFinite(campaignId) ? campaignId : undefined);

  const placements = data?.campaign.placements ?? [];

  const exportFinance = () => {
    window.open('/api/placements/export?status=AWAITING_PAYMENT&campaignId=' + campaignId, '_blank');
  };

  const campaign = useMemo(() => data?.campaign, [data]);

  if (isLoading) {
    return <div className="card">Загружаем кампанию...</div>;
  }

  if (isError || !campaign) {
    return <div className="card">Кампания не найдена.</div>;
  }

  return (
    <div className="page-stack">
      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">{campaign.name}</h2>
            <p>{campaign.goal || 'Цель не указана.'}</p>
          </div>
          <div className="card__actions">
            <button className="button" onClick={exportFinance}>
              Экспорт для бухгалтерии
            </button>
          </div>
        </div>
        <div className="dashboard-stats">
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Продукт</span>
            <span className="dashboard-stats__value">{campaign.product}</span>
          </div>
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Статус</span>
            <span className={statusBadgeClass(campaign.status)}>
              {CAMPAIGN_STATUS_LABELS[campaign.status] ?? campaign.status}
            </span>
          </div>
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Период</span>
            <span className="dashboard-stats__value">
              {formatDate(campaign.startDate)} — {formatDate(campaign.endDate)}
            </span>
          </div>
          <div className="dashboard-stats__item">
            <span className="dashboard-stats__label">Бюджет</span>
            <span className="dashboard-stats__value">{formatCurrency(campaign.budgetPlanned)}</span>
          </div>
        </div>
      </section>

      <section className="card">
        <h3 className="card__title">Размещения</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Инфлюенсер</th>
              <th>Контрагент</th>
              <th>Статус</th>
              <th>Дата</th>
              <th>Fee</th>
              <th>Просмотры</th>
              <th>Ссылка</th>
            </tr>
          </thead>
          <tbody>
            {placements.map((placement) => {
              const rowClass = placement.status === 'OVERDUE' ? 'table-row--alert' : isOverdue(placement.status, placement.placementDate) ? 'table-row--warning' : '';
              return (
                <tr key={placement.id} className={rowClass}>
                  <td>{placement.id}</td>
                  <td>{placement.blogger?.name ?? '—'}</td>
                  <td>{placement.counterparty?.name ?? '—'}</td>
                  <td>
                    <span className={statusBadgeClass(placement.status)}>
                      {PLACEMENT_STATUS_LABELS[placement.status] ?? placement.status}
                    </span>
                  </td>
                  <td>{formatDate(placement.placementDate)}</td>
                  <td>{formatCurrency(placement.fee)}</td>
                  <td>{formatNumber(placement.views)}</td>
                  <td>
                    {placement.placementUrl ? (
                      <a href={placement.placementUrl} target="_blank" rel="noreferrer">
                        Перейти
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
};
