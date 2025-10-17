import type { FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  useCounterparties,
  useCreateCounterparty,
  useUpdateCounterparty,
} from '@/api/queries/counterparties';
import {
  COUNTERPARTY_RELATIONSHIP_OPTIONS,
  COUNTERPARTY_TYPE_OPTIONS,
} from '@/utils/constants';
import {
  COUNTERPARTY_RELATIONSHIP_LABELS,
  COUNTERPARTY_TYPE_LABELS,
  formatCurrency,
  formatNumber,
} from '@/utils/formatters';
import type { Counterparty } from '@/types';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';

type ColumnId = 'name' | 'type' | 'inn' | 'relationshipType' | 'bloggers' | 'payouts' | 'actions';

const columnConfig: Array<{ id: ColumnId; label: string; locked?: boolean }> = [
  { id: 'name', label: 'Название / ФИО', locked: true },
  { id: 'type', label: 'Тип' },
  { id: 'inn', label: 'ИНН' },
  { id: 'relationshipType', label: 'Тип отношений' },
  { id: 'bloggers', label: 'Кол-во блогеров' },
  { id: 'payouts', label: 'Сумма выплат' },
  { id: 'actions', label: 'Действия', locked: true },
];

const columnStorageKey = 'counterparties.table.columns';

const defaultFormState = {
  name: '',
  type: COUNTERPARTY_TYPE_OPTIONS[0]?.value ?? 'LEGAL_ENTITY',
  relationshipType: COUNTERPARTY_RELATIONSHIP_OPTIONS[0]?.value ?? 'DIRECT',
  contactName: '',
  email: '',
  phone: '',
  inn: '',
  kpp: '',
  ogrn: '',
  ogrnip: '',
  legalAddress: '',
  registrationAddress: '',
  checkingAccount: '',
  bankName: '',
  bik: '',
  correspondentAccount: '',
  taxPhone: '',
  paymentDetails: '',
};

type FormState = typeof defaultFormState;
type FilterState = {
  search: string;
  type: string;
  relationshipType: string;
};

type CounterpartyListPageProps = {
  editCounterpartyId?: number;
  onEditCounterpartyHandled?: () => void;
};

export const CounterpartyListPage: React.FC<CounterpartyListPageProps> = ({
  editCounterpartyId,
  onEditCounterpartyHandled,
}) => {
  const [filters, setFilters] = useState<FilterState>({ search: '', type: '', relationshipType: '' });
  const [filterInputs, setFilterInputs] = useState<FilterState>(filters);
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingCounterparty, setEditingCounterparty] = useState<Counterparty | null>(null);
  const [formState, setFormState] = useState<FormState>(defaultFormState);

  const [isColumnMenuOpen, setColumnMenuOpen] = useState(false);
  const columnMenuRef = useRef<HTMLDivElement | null>(null);

  const createCounterparty = useCreateCounterparty();
  const updateCounterparty = useUpdateCounterparty();

  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.relationshipType) params.relationshipType = filters.relationshipType;
    return params;
  }, [filters]);

  const { data, isLoading } = useCounterparties(queryParams);

  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnId, boolean>>(() => {
    const allVisible = columnConfig.reduce(
      (acc, column) => {
        acc[column.id] = true;
        return acc;
      },
      {} as Record<ColumnId, boolean>,
    );

    if (typeof window === 'undefined') {
      return allVisible;
    }

    try {
      const stored = window.localStorage.getItem(columnStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as Record<ColumnId, boolean>;
        const merged = { ...allVisible, ...parsed };
        columnConfig.forEach((column) => {
          if (column.locked) {
            merged[column.id] = true;
          }
        });
        return merged;
      }
    } catch {
      // ignore storage parsing errors
    }

    return allVisible;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(columnStorageKey, JSON.stringify(visibleColumns));
  }, [visibleColumns]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!columnMenuRef.current) {
        return;
      }
      if (!columnMenuRef.current.contains(event.target as Node)) {
        setColumnMenuOpen(false);
      }
    };

    if (isColumnMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isColumnMenuOpen]);

  useEffect(() => {
    if (editingCounterparty) {
      setFormState({
        name: editingCounterparty.name ?? '',
        type: editingCounterparty.type,
        relationshipType: editingCounterparty.relationshipType,
        contactName: editingCounterparty.contactName ?? '',
        email: editingCounterparty.email ?? '',
        phone: editingCounterparty.phone ?? '',
        inn: editingCounterparty.inn ?? '',
        kpp: editingCounterparty.kpp ?? '',
        ogrn: editingCounterparty.ogrn ?? '',
        ogrnip: editingCounterparty.ogrnip ?? '',
        legalAddress: editingCounterparty.legalAddress ?? '',
        registrationAddress: editingCounterparty.registrationAddress ?? '',
        checkingAccount: editingCounterparty.checkingAccount ?? '',
        bankName: editingCounterparty.bankName ?? '',
        bik: editingCounterparty.bik ?? '',
        correspondentAccount: editingCounterparty.correspondentAccount ?? '',
        taxPhone: editingCounterparty.taxPhone ?? '',
        paymentDetails: editingCounterparty.paymentDetails ?? '',
      });
      setFormVisible(true);
    } else {
      setFormState(defaultFormState);
    }
  }, [editingCounterparty]);

  useEffect(() => {
    if (
      !editCounterpartyId ||
      !data?.counterparties?.length ||
      editingCounterparty?.id === editCounterpartyId
    ) {
      return;
    }

    const match = data.counterparties.find((item) => item.id === editCounterpartyId);

    if (match) {
      setEditingCounterparty(match);
      setFormVisible(true);
      onEditCounterpartyHandled?.();
    }
  }, [data?.counterparties, editCounterpartyId, editingCounterparty?.id, onEditCounterpartyHandled]);

  useEffect(() => {
    setFilterInputs(filters);
  }, [filters]);

  const handleFilterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters(filterInputs);
  };

  const handleResetFilters = () => {
    const reset = { search: '', type: '', relationshipType: '' };
    setFilterInputs(reset);
    setFilters(reset);
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      name: formState.name,
      type: formState.type,
      relationshipType: formState.relationshipType,
      contactName: formState.contactName || undefined,
      email: formState.email || undefined,
      phone: formState.phone || undefined,
      inn: formState.inn || undefined,
      kpp: formState.kpp || undefined,
      ogrn: formState.ogrn || undefined,
      ogrnip: formState.ogrnip || undefined,
      legalAddress: formState.legalAddress || undefined,
      registrationAddress: formState.registrationAddress || undefined,
      checkingAccount: formState.checkingAccount || undefined,
      bankName: formState.bankName || undefined,
      bik: formState.bik || undefined,
      correspondentAccount: formState.correspondentAccount || undefined,
      taxPhone: formState.taxPhone || undefined,
      paymentDetails: formState.paymentDetails || undefined,
    };

    if (editingCounterparty) {
      await updateCounterparty.mutateAsync({ id: editingCounterparty.id, ...payload });
    } else {
      await createCounterparty.mutateAsync(payload);
    }

    setEditingCounterparty(null);
    setFormState(defaultFormState);
    setFormVisible(false);
  };

  const toggleColumn = (columnId: ColumnId) => {
    const column = columnConfig.find((item) => item.id === columnId);

    if (column?.locked) {
      return;
    }

    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const handleStartCreate = () => {
    setEditingCounterparty(null);
    setFormVisible(true);
  };

  const visibleColumnOrder = columnConfig.filter((column) => visibleColumns[column.id]);

  const isLegalEntity = formState.type === 'LEGAL_ENTITY';
  const isSoleProprietor = formState.type === 'SOLE_PROPRIETOR';
  const isSelfEmployed = formState.type === 'SELF_EMPLOYED';

  return (
    <div className="page-stack">
      <Breadcrumbs
        items={[
          { label: 'Партнеры', to: '/partners' },
          { label: 'Контрагенты' },
        ]}
      />

      <section className="card">
        <div className="card__header">
          <h2 className="card__title">Контрагенты</h2>
          <div className="card__actions">
            <div className="column-toggle" ref={columnMenuRef}>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => setColumnMenuOpen((prev) => !prev)}
              >
                Настроить столбцы
              </button>
              {isColumnMenuOpen && (
                <div className="column-toggle__menu">
                  {columnConfig.map((column) => (
                    <label key={column.id} className="column-toggle__option">
                      <input
                        type="checkbox"
                        checked={visibleColumns[column.id]}
                        disabled={column.locked}
                        onChange={() => toggleColumn(column.id)}
                      />
                      <span>{column.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <button className="button" type="button" onClick={handleStartCreate}>
              Добавить контрагента
            </button>
          </div>
        </div>

        <form className="filter-grid" onSubmit={handleFilterSubmit}>
          <div className="form-control">
            <label htmlFor="counterparty-search">Поиск по названию/ИНН</label>
            <input
              id="counterparty-search"
              name="search"
              placeholder="Введите название или ИНН"
              value={filterInputs.search}
              onChange={(event) => setFilterInputs((prev) => ({ ...prev, search: event.target.value }))}
            />
          </div>
          <div className="form-control">
            <label htmlFor="type">Тип</label>
            <select
              id="type"
              name="type"
              value={filterInputs.type}
              onChange={(event) => setFilterInputs((prev) => ({ ...prev, type: event.target.value }))}
            >
              <option value="">Все типы</option>
              {COUNTERPARTY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label htmlFor="relationshipType">Тип отношений</label>
            <select
              id="relationshipType"
              name="relationshipType"
              value={filterInputs.relationshipType}
              onChange={(event) =>
                setFilterInputs((prev) => ({ ...prev, relationshipType: event.target.value }))
              }
            >
              <option value="">Все типы отношений</option>
              {COUNTERPARTY_RELATIONSHIP_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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

      {isFormVisible && (
        <section className="card">
          <div className="card__header">
            <h3 className="card__title">
              {editingCounterparty ? `Редактирование: ${editingCounterparty.name}` : 'Новый контрагент'}
            </h3>
            <button
              className="button button--ghost"
              type="button"
              onClick={() => {
                setEditingCounterparty(null);
                setFormVisible(false);
              }}
            >
              Скрыть форму
            </button>
          </div>

          <form className="form-grid form-grid--two" onSubmit={handleFormSubmit}>
            <div className="form-control">
              <label htmlFor="partner-name">Название / ФИО</label>
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
              <label htmlFor="partner-contact">Контактное лицо</label>
              <input
                id="partner-contact"
                value={formState.contactName}
                onChange={(event) => setFormState((prev) => ({ ...prev, contactName: event.target.value }))}
              />
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

            {(isLegalEntity || isSoleProprietor) && (
              <div className="form-control">
                <label htmlFor="partner-kpp">КПП</label>
                <input
                  id="partner-kpp"
                  value={formState.kpp}
                  onChange={(event) => setFormState((prev) => ({ ...prev, kpp: event.target.value }))}
                />
              </div>
            )}

            {isLegalEntity && (
              <>
                <div className="form-control">
                  <label htmlFor="partner-ogrn">ОГРН</label>
                  <input
                    id="partner-ogrn"
                    value={formState.ogrn}
                    onChange={(event) => setFormState((prev) => ({ ...prev, ogrn: event.target.value }))}
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="partner-legal-address">Юридический адрес</label>
                  <input
                    id="partner-legal-address"
                    value={formState.legalAddress}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, legalAddress: event.target.value }))
                    }
                  />
                </div>
              </>
            )}

            {isSoleProprietor && (
              <>
                <div className="form-control">
                  <label htmlFor="partner-ogrnip">ОГРНИП</label>
                  <input
                    id="partner-ogrnip"
                    value={formState.ogrnip}
                    onChange={(event) => setFormState((prev) => ({ ...prev, ogrnip: event.target.value }))}
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="partner-registration-address">Адрес регистрации</label>
                  <input
                    id="partner-registration-address"
                    value={formState.registrationAddress}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, registrationAddress: event.target.value }))
                    }
                  />
                </div>
              </>
            )}

            {(isLegalEntity || isSoleProprietor) && (
              <>
                <div className="form-control">
                  <label htmlFor="partner-checking-account">Расчетный счет</label>
                  <input
                    id="partner-checking-account"
                    value={formState.checkingAccount}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, checkingAccount: event.target.value }))
                    }
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="partner-bank-name">Банк</label>
                  <input
                    id="partner-bank-name"
                    value={formState.bankName}
                    onChange={(event) => setFormState((prev) => ({ ...prev, bankName: event.target.value }))}
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="partner-bik">БИК</label>
                  <input
                    id="partner-bik"
                    value={formState.bik}
                    onChange={(event) => setFormState((prev) => ({ ...prev, bik: event.target.value }))}
                  />
                </div>
                <div className="form-control">
                  <label htmlFor="partner-correspondent">Корр. счет</label>
                  <input
                    id="partner-correspondent"
                    value={formState.correspondentAccount}
                    onChange={(event) =>
                      setFormState((prev) => ({ ...prev, correspondentAccount: event.target.value }))
                    }
                  />
                </div>
              </>
            )}

            {isSelfEmployed && (
              <div className="form-control">
                <label htmlFor="partner-tax-phone">Телефон (Мой Налог)</label>
                <input
                  id="partner-tax-phone"
                  value={formState.taxPhone}
                  onChange={(event) => setFormState((prev) => ({ ...prev, taxPhone: event.target.value }))}
                />
              </div>
            )}

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
              <button
                className="button"
                type="submit"
                disabled={createCounterparty.isPending || updateCounterparty.isPending}
              >
                {createCounterparty.isPending || updateCounterparty.isPending
                  ? 'Сохраняем...'
                  : editingCounterparty
                  ? 'Сохранить изменения'
                  : 'Сохранить'}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <div className="card__header">
          <h3 className="card__title">Реестр</h3>
        </div>
        {isLoading ? (
          <p>Загружаем контрагентов...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                {visibleColumnOrder.map((column) => (
                  <th key={column.id}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.counterparties.map((counterparty) => {
                const bloggerCount = counterparty.bloggers?.length ?? 0;
                const totalPayout =
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

                return (
                  <tr key={counterparty.id}>
                    {visibleColumns.name && (
                      <td>
                        <Link className="link" to={`/counterparties/${counterparty.id}`}>
                          {counterparty.name}
                        </Link>
                      </td>
                    )}
                    {visibleColumns.type && (
                      <td>{COUNTERPARTY_TYPE_LABELS[counterparty.type] ?? counterparty.type}</td>
                    )}
                    {visibleColumns.inn && <td>{counterparty.inn ?? '—'}</td>}
                    {visibleColumns.relationshipType && (
                      <td>
                        {COUNTERPARTY_RELATIONSHIP_LABELS[counterparty.relationshipType] ??
                          counterparty.relationshipType}
                      </td>
                    )}
                    {visibleColumns.bloggers && (
                      <td>
                        {bloggerCount ? (
                          <Link className="link" to={`/partners?tab=bloggers&counterpartyId=${counterparty.id}`}>
                            {formatNumber(bloggerCount)}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}
                    {visibleColumns.payouts && <td>{formatCurrency(totalPayout)}</td>}
                    {visibleColumns.actions && (
                      <td className="table__actions">
                        <button
                          type="button"
                          className="link-button"
                          onClick={() => setEditingCounterparty(counterparty)}
                        >
                          Редактировать
                        </button>
                        <Link className="link-button" to={`/counterparties/${counterparty.id}#history`}>
                          Посмотреть историю
                        </Link>
                      </td>
                    )}
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
