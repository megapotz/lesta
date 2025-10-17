from enum import StrEnum


class Role(StrEnum):
    ADMIN = "ADMIN"
    MANAGER = "MANAGER"


class UserStatus(StrEnum):
    ACTIVE = "ACTIVE"
    INVITED = "INVITED"
    DEACTIVATED = "DEACTIVATED"


class SocialNetwork(StrEnum):
    YOUTUBE = "YouTube"
    TELEGRAM = "Telegram"
    VK = "VK"
    DZENN = "Dzen"
    TWITCH = "Twitch"
    INSTAGRAM = "Instagram"


class CounterpartyType(StrEnum):
    SELF_EMPLOYED = "Самозанятый"
    IE = "ИП"
    LEGAL = "Юридическое лицо"


class RelationshipType(StrEnum):
    DIRECT = "Прямой"
    AGENCY = "Агентство"
    CPA_NETWORK = "CPA-сеть"


class CampaignStatus(StrEnum):
    PLANNED = "PLANNED"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"


class Product(StrEnum):
    TANKS = "Танки"
    SHIPS = "Корабли"
    BLITZ = "Blitz"


class GoalType(StrEnum):
    AWARENESS = "Awareness"
    PERFORMANCE = "Performance"


class PlacementStatus(StrEnum):
    PLANNING = "Планируется"
    AGREED = "Согласовано"
    DECLINED = "Отклонено"
    WAITING_PAYMENT = "Ожидает оплаты"
    PAID_WAITING_PUBLICATION = "Оплачено, ждем публикацию"
    PUBLISHED = "Опубликовано"
    OVERDUE = "Просрочено"
    DONE = "Завершено"


class PaymentTerms(StrEnum):
    PREPAID = "Предоплата"
    POSTPAID = "Постоплата"
    PARTIAL = "Частичная оплата"


class PlacementType(StrEnum):
    POST = "Пост"
    VIDEO = "Видео"
    SHORTS = "Shorts / Reels"
    STREAM = "Стриминг"
    STORIES = "Сторис"
    INTEGRATION = "Интеграция в контент"
    ANNOUNCEMENT = "Анонс"


class PricingModel(StrEnum):
    FIX = "Fix"
    CPA = "CPA"
    REVSHARE = "RevShare"
    BARTER = "Бартер"


class ContactType(StrEnum):
    EMAIL = "Email"
    TELEGRAM = "Telegram"
    PHONE = "Phone"
    OTHER = "Other"

