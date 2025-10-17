export const PRODUCT_OPTIONS = [
  { value: 'TANKS', label: 'Танки' },
  { value: 'SHIPS', label: 'Корабли' },
  { value: 'BLITZ', label: 'Blitz' },
] as const;

export const CAMPAIGN_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Черновик' },
  { value: 'ACTIVE', label: 'Активная' },
  { value: 'COMPLETED', label: 'Завершена' },
] as const;

export const PLACEMENT_STATUS_OPTIONS = [
  { value: 'PLANNED', label: 'Планируется' },
  { value: 'AGREED', label: 'Согласовано' },
  { value: 'DECLINED', label: 'Отклонено' },
  { value: 'AWAITING_PAYMENT', label: 'Ожидает оплаты' },
  { value: 'AWAITING_PUBLICATION', label: 'Оплачено, ждем публикацию' },
  { value: 'PUBLISHED', label: 'Опубликовано' },
  { value: 'OVERDUE', label: 'Просрочено' },
  { value: 'CLOSED', label: 'Завершено' },
] as const;

export const PLACEMENT_TYPE_OPTIONS = [
  { value: 'POST', label: 'Пост' },
  { value: 'VIDEO', label: 'Видео' },
  { value: 'SHORT_FORM', label: 'Shorts / Reels' },
  { value: 'STREAM', label: 'Стриминг' },
  { value: 'STORIES', label: 'Сторис' },
  { value: 'INTEGRATION', label: 'Интеграция' },
  { value: 'ANNOUNCEMENT', label: 'Анонс' },
] as const;

export const PRICING_MODEL_OPTIONS = [
  { value: 'FIX', label: 'Fix' },
  { value: 'CPA', label: 'CPA' },
  { value: 'REVSHARE', label: 'RevShare' },
  { value: 'BARTER', label: 'Бартер' },
] as const;

export const PAYMENT_TERMS_OPTIONS = [
  { value: 'PREPAYMENT', label: 'Предоплата' },
  { value: 'POSTPAYMENT', label: 'Постоплата' },
  { value: 'PARTIAL', label: 'Частичная оплата' },
] as const;

export const CONTACT_CHANNEL_OPTIONS = [
  { value: 'EMAIL', label: 'Email' },
  { value: 'TELEGRAM', label: 'Telegram' },
  { value: 'WHATSAPP', label: 'WhatsApp' },
  { value: 'PHONE', label: 'Телефон' },
] as const;

export const COUNTERPARTY_TYPE_OPTIONS = [
  { value: 'LEGAL_ENTITY', label: 'Юр. лицо' },
  { value: 'SOLE_PROPRIETOR', label: 'ИП' },
  { value: 'SELF_EMPLOYED', label: 'Самозанятый' },
] as const;

export const COUNTERPARTY_RELATIONSHIP_OPTIONS = [
  { value: 'DIRECT', label: 'Прямой' },
  { value: 'AGENCY', label: 'Агентство' },
  { value: 'CPA_NETWORK', label: 'CPA-сеть' },
] as const;

export const USER_ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Админ' },
  { value: 'MANAGER', label: 'Менеджер' },
] as const;

export const USER_STATUS_OPTIONS = [
  { value: 'INVITED', label: 'Приглашен' },
  { value: 'ACTIVE', label: 'Активен' },
  { value: 'DEACTIVATED', label: 'Деактивирован' },
] as const;
