import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { useCounterparty } from '@/api/queries/counterparties';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import {
  COUNTERPARTY_RELATIONSHIP_LABELS,
  COUNTERPARTY_TYPE_LABELS,
  PLACEMENT_STATUS_LABELS,
  formatCurrency,
  formatDate,
  formatNumber,
  statusBadgeClass,
} from '@/utils/formatters';

type DetailTab = 'details' | 'bloggers' | 'placements' | 'history';

const TABS: Array<{ id: DetailTab; label: string }> = [
  { id: 'details', label: 'Реквизиты' },
  { id: 'bloggers', label: 'Блогеры' },
  { id: 'placements', label: 'Размещения' },
  { id: 'history', label: 'Лента' },
];

export const CounterpartyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const counterpartyId = id ? Number(id) : NaN;
  const [activeTab, setActiveTab] = useState<DetailTab>('details');

  const { data, isLoading, error } = useCounterparty(Number.isNaN(counterpartyId) ? null : counterpartyId);

  useEffect(() => {
    if (location.hash === '#history') {
      setActiveTab('history');
    }
  }, [location.hash]);

  const counterparty = data?.counterparty;
  const comments = data?.comments ?? [];

  useEffect(() => {
    if (!counterparty && !isLoading && !error) {
      navigate('/partners?tab=counterparties', { replace: true });
    }
  }, [counterparty, error, isLoading, navigate]);

  const headerMetrics = useMemo(() => {
    if (!counterparty) {
      return [];
    }

    const totalPlacements = counterparty.placements?.length ?? 0;
    const totalSpend =
      counterparty.placements?.reduce((sum, placement) => {
        if (!placement?.fee) {
          return sum;
        }
        const numeric = Number(placement.fee);
        if (Number.isNaN(numeric)) {
          return sum;
        }
        return sum + numeric;
      }, 0) ?? 0;

    return [
      { label: 'Тип', value: COUNTERPARTY_TYPE_LABELS[counterparty.type] ?? counterparty.type },
      {
        label: 'Тип отношений',
        value:
          COUNTERPARTY_RELATIONSHIP_LABELS[counterparty.relationshipType] ?? counterparty.relationshipType,
      },
      { label: 'Блогеров', value: formatNumber(counterparty.bloggers?.length ?? 0) },
      { label: 'Размещений', value: formatNumber(totalPlacements) },
      { label: 'Сумма выплат', value: formatCurrency(totalSpend) },
    ];
  }, [counterparty]);

  const handleEditClick = () => {
    navigate(`/partners?tab=counterparties&editId=${counterpartyId}`, { replace: false });
  };

  if (isLoading) {
    return (
      <div className="page-stack">
        <p>Загружаем данные контрагента...</p>
      </div>
    );
  }

  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
    return (
      <div className="page-stack">
        <p>Не удалось загрузить контрагента: {errorMessage}</p>
      </div>
    );
  }

  if (!counterparty) {
    return (
      <div className="page-stack">
        <p>Контрагент не найден.</p>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <Breadcrumbs
        items={[
          { label: 'Партнеры', to: '/partners' },
          { label: 'Контрагенты', to: '/partners?tab=counterparties' },
          { label: counterparty.name },
        ]}
      />

      <section className="card">
        <div className="card__header">
          <div>
            <h2 className="card__title">{counterparty.name}</h2>
            <p className="card__subtitle">
              {COUNTERPARTY_TYPE_LABELS[counterparty.type] ?? counterparty.type} ·{' '}
              {COUNTERPARTY_RELATIONSHIP_LABELS[counterparty.relationshipType] ?? counterparty.relationshipType}
            </p>
          </div>
          <div className="card__actions">
            <button className="button button--ghost" type="button" onClick={() => navigate(-1)}>
              Назад
            </button>
            <button className="button" type="button" onClick={handleEditClick}>
              Редактировать
            </button>
          </div>
        </div>
        <div className="detail-metrics">
          {headerMetrics.map((metric) => (
            <div key={metric.label} className="detail-metrics__item">
              <span className="detail-metrics__label">{metric.label}</span>
              <span className="detail-metrics__value">{metric.value}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="tabs" role="tablist" aria-label="Карточка контрагента">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={['tabs__button', activeTab === tab.id ? 'tabs__button--active' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'details' && (
          <div className="detail-grid">
            <div className="detail-grid__group">
              <h4>Контактная информация</h4>
              <dl>
                <dt>Контактное лицо</dt>
                <dd>{counterparty.contactName ?? '—'}</dd>
                <dt>Email</dt>
                <dd>{counterparty.email ?? '—'}</dd>
                <dt>Телефон</dt>
                <dd>{counterparty.phone ?? '—'}</dd>
              </dl>
            </div>
            <div className="detail-grid__group">
              <h4>Реквизиты</h4>
              <dl>
                <dt>ИНН</dt>
                <dd>{counterparty.inn ?? '—'}</dd>
                {counterparty.kpp && (
                  <>
                    <dt>КПП</dt>
                    <dd>{counterparty.kpp}</dd>
                  </>
                )}
                {counterparty.ogrn && (
                  <>
                    <dt>ОГРН</dt>
                    <dd>{counterparty.ogrn}</dd>
                  </>
                )}
                {counterparty.ogrnip && (
                  <>
                    <dt>ОГРНИП</dt>
                    <dd>{counterparty.ogrnip}</dd>
                  </>
                )}
                {counterparty.legalAddress && (
                  <>
                    <dt>Юридический адрес</dt>
                    <dd>{counterparty.legalAddress}</dd>
                  </>
                )}
                {counterparty.registrationAddress && (
                  <>
                    <dt>Адрес регистрации</dt>
                    <dd>{counterparty.registrationAddress}</dd>
                  </>
                )}
              </dl>
            </div>
            <div className="detail-grid__group">
              <h4>Банковские данные</h4>
              <dl>
                <dt>Р/с</dt>
                <dd>{counterparty.checkingAccount ?? '—'}</dd>
                <dt>Банк</dt>
                <dd>{counterparty.bankName ?? '—'}</dd>
                <dt>БИК</dt>
                <dd>{counterparty.bik ?? '—'}</dd>
                <dt>Корр. счет</dt>
                <dd>{counterparty.correspondentAccount ?? '—'}</dd>
              </dl>
            </div>
            <div className="detail-grid__group">
              <h4>Прочее</h4>
              <dl>
                <dt>Телефон для чеков</dt>
                <dd>{counterparty.taxPhone ?? '—'}</dd>
                <dt>Платежные реквизиты</dt>
                <dd>{counterparty.paymentDetails ?? '—'}</dd>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'bloggers' && (
          <div className="table-wrapper">
            {counterparty.bloggers?.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Блогер</th>
                    <th>Площадка</th>
                    <th>Подписчики</th>
                    <th>Средний охват</th>
                    <th>Профиль</th>
                  </tr>
                </thead>
                <tbody>
                  {counterparty.bloggers.map((item) => (
                    <tr key={item.bloggerId}>
                      <td>{item.blogger.name}</td>
                      <td>{item.blogger.socialPlatform ?? '—'}</td>
                      <td>{formatNumber(item.blogger.followers)}</td>
                      <td>{formatNumber(item.blogger.averageReach)}</td>
                      <td>
                        <a href={item.blogger.profileUrl} target="_blank" rel="noreferrer">
                          Открыть
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Нет связанных блогеров.</p>
            )}
          </div>
        )}

        {activeTab === 'placements' && (
          <div className="table-wrapper">
            {counterparty.placements?.length ? (
              <table className="table">
                <thead>
                  <tr>
                    <th>Кампания</th>
                    <th>Блогер</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th>Стоимость</th>
                  </tr>
                </thead>
                <tbody>
                  {counterparty.placements.map((placement) => (
                    <tr key={placement.id}>
                      <td>{placement.campaign?.name ?? '—'}</td>
                      <td>{placement.blogger?.name ?? '—'}</td>
                      <td>
                        <span
                          className={statusBadgeClass(placement.status)}
                        >
                          {PLACEMENT_STATUS_LABELS[placement.status] ?? placement.status}
                        </span>
                      </td>
                      <td>{formatDate(placement.placementDate)}</td>
                      <td>{formatCurrency(placement.fee)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Размещения отсутствуют.</p>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-list">
            {comments.length ? (
              comments.map((comment) => (
                <article key={comment.id} className="history-list__item">
                  <header className="history-list__meta">
                    <span className="history-list__author">{comment.author.name}</span>
                    <span className="history-list__timestamp">{formatDate(comment.createdAt)}</span>
                    {comment.isSystem && <span className="badge badge--yellow">Система</span>}
                  </header>
                  <p className="history-list__body">{comment.body}</p>
                </article>
              ))
            ) : (
              <p>История пока пуста.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
};
