import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

import type { PlacementStatus, UserStatus } from '@/types';
import {
  CAMPAIGN_STATUS_OPTIONS,
  CONTACT_CHANNEL_OPTIONS,
  COUNTERPARTY_RELATIONSHIP_OPTIONS,
  COUNTERPARTY_TYPE_OPTIONS,
  PAYMENT_TERMS_OPTIONS,
  PLACEMENT_STATUS_OPTIONS,
  PLACEMENT_TYPE_OPTIONS,
  PRICING_MODEL_OPTIONS,
  PRODUCT_OPTIONS,
  USER_ROLE_OPTIONS,
  USER_STATUS_OPTIONS,
} from './constants';

const labelMap = <T extends readonly { value: string; label: string }[]>(options: T) =>
  options.reduce<Record<string, string>>((acc, option) => {
    acc[option.value] = option.label;
    return acc;
  }, {});

export const PRODUCT_LABELS = labelMap(PRODUCT_OPTIONS);
export const CAMPAIGN_STATUS_LABELS = labelMap(CAMPAIGN_STATUS_OPTIONS);
export const PLACEMENT_STATUS_LABELS = labelMap(PLACEMENT_STATUS_OPTIONS);
export const PLACEMENT_TYPE_LABELS = labelMap(PLACEMENT_TYPE_OPTIONS);
export const PRICING_MODEL_LABELS = labelMap(PRICING_MODEL_OPTIONS);
export const PAYMENT_TERMS_LABELS = labelMap(PAYMENT_TERMS_OPTIONS);
export const CONTACT_CHANNEL_LABELS = labelMap(CONTACT_CHANNEL_OPTIONS);
export const COUNTERPARTY_TYPE_LABELS = labelMap(COUNTERPARTY_TYPE_OPTIONS);
export const COUNTERPARTY_RELATIONSHIP_LABELS = labelMap(COUNTERPARTY_RELATIONSHIP_OPTIONS);
export const USER_ROLE_LABELS = labelMap(USER_ROLE_OPTIONS);
export const USER_STATUS_LABELS = labelMap(USER_STATUS_OPTIONS);

export const formatCurrency = (value?: string | number | null) => {
  if (value === undefined || value === null) {
    return '—';
  }

  const numeric = typeof value === 'string' ? Number(value) : value;

  if (Number.isNaN(numeric)) {
    return '—';
  }

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(numeric);
};

export const formatNumber = (value?: number | null) => {
  if (value === undefined || value === null) {
    return '—';
  }
  return new Intl.NumberFormat('ru-RU').format(value);
};

export const formatDate = (value?: string | null) => {
  if (!value) {
    return '—';
  }

  try {
    return format(new Date(value), 'dd MMM yyyy', { locale: ru });
  } catch {
    return value;
  }
};

export const statusBadgeClass = (status: PlacementStatus | UserStatus | string) => {
  if (status === 'OVERDUE' || status === 'DECLINED' || status === 'DEACTIVATED') {
    return 'badge badge--red';
  }
  if (status === 'AWAITING_PAYMENT' || status === 'AWAITING_PUBLICATION' || status === 'INVITED') {
    return 'badge badge--yellow';
  }
  return 'badge badge--green';
};
