import { useCallback, useMemo } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

import { BloggerListPage } from '@/pages/bloggers/BloggerListPage';
import { CounterpartyListPage } from '@/pages/counterparties/CounterpartyListPage';

type PartnersTab = 'bloggers' | 'counterparties';

const TABS: Array<{ id: PartnersTab; label: string }> = [
  { id: 'bloggers', label: 'Блогеры' },
  { id: 'counterparties', label: 'Контрагенты' },
];

export const PartnersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentTab = useMemo<PartnersTab>(() => {
    const tab = searchParams.get('tab');
    return tab === 'counterparties' ? 'counterparties' : 'bloggers';
  }, [searchParams]);

  const counterpartyIdParam = searchParams.get('counterpartyId');
  const counterpartyId = counterpartyIdParam ? Number(counterpartyIdParam) : undefined;
  const editIdParam = searchParams.get('editId');
  const editCounterpartyId = editIdParam ? Number(editIdParam) : undefined;

  const handleTabChange = (nextTab: PartnersTab) => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', nextTab);

    if (nextTab === 'bloggers' && counterpartyIdParam) {
      params.set('counterpartyId', counterpartyIdParam);
    }

    if (nextTab === 'counterparties') {
      params.delete('counterpartyId');
    }
    if (nextTab !== 'counterparties') {
      params.delete('editId');
    }

    setSearchParams(params);
  };

  const handleEditHandled = useCallback(() => {
    if (!editIdParam) {
      return;
    }
    const params = new URLSearchParams(searchParams);
    params.delete('editId');
    setSearchParams(params);
  }, [editIdParam, searchParams, setSearchParams]);

  if (currentTab === 'bloggers' && searchParams.get('tab') === null) {
    return <Navigate to="/partners?tab=bloggers" replace />;
  }

  return (
    <div className="page-stack">
      <section className="card">
        <div className="tabs" role="tablist" aria-label="Раздел Партнеры">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={currentTab === tab.id}
              className={['tabs__button', currentTab === tab.id ? 'tabs__button--active' : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {currentTab === 'bloggers' ? (
        <BloggerListPage counterpartyId={counterpartyId} />
      ) : (
        <CounterpartyListPage
          editCounterpartyId={editCounterpartyId}
          onEditCounterpartyHandled={handleEditHandled}
        />
      )}
    </div>
  );
};
