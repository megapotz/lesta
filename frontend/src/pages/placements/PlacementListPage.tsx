import type { ChangeEvent } from 'react';
import { useMemo, useState } from 'react';

import { useImportPlacements, usePlacements } from '@/api/queries/placements';
import { PLACEMENT_STATUS_OPTIONS } from '@/utils/constants';
import {
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

export const PlacementListPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const { data, isLoading } = usePlacements(statusFilter ? { status: statusFilter } : {});
  const importMutation = useImportPlacements();

  const placements = data?.placements ?? [];

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    await importMutation.mutateAsync(formData);
    event.target.value = '';
  };

  const exportCurrent = () => {
    const query = statusFilter ? '?status=' + statusFilter : '';
    window.open('/api/placements/export' + query, '_blank');
  };

  const rows = useMemo(() => placements, [placements]);

  return (
    <div className="page-stack">
      <section className="card">
        <div className="card__header">
          <h2 className="card__title">Размещения</h2>
          <div className="card__actions">
            <button className="button" onClick={exportCurrent}>
              Экспорт в CSV
            </button>
            <label className="button button--ghost">
              Импорт статусов
              <input type="file" accept=".xlsx,.csv" hidden onChange={handleFileUpload} />
            </label>
          </div>
        </div>
        <div className="form-control" style={{ maxWidth: '240px' }}>
          <label htmlFor="statusFilter">Статус</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="">Все</option>
            {PLACEMENT_STATUS_OPTIONS.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="card">
        <h3 className="card__title">Список размещений</h3>
        {isLoading ? (
          <p>Загружаем размещения...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Кампания</th>
                <th>Блогер</th>
                <th>Контрагент</th>
                <th>Статус</th>
                <th>Дата</th>
                <th>Fee</th>
                <th>Просмотры</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((placement) => {
                const rowClass = placement.status === 'OVERDUE'
                  ? 'table-row--alert'
                  : isOverdue(placement.status, placement.placementDate)
                  ? 'table-row--warning'
                  : '';
                return (
                  <tr key={placement.id} className={rowClass}>
                    <td>{placement.id}</td>
                    <td>{placement.campaign?.name ?? '—'}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};
