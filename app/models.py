from __future__ import annotations

from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    ForeignKey,
    Table,
    Text,
    Float,
)
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .database import Base
from .enums import (
    Role,
    UserStatus,
    SocialNetwork,
    CounterpartyType,
    RelationshipType,
    CampaignStatus,
    Product,
    GoalType,
    PlacementStatus,
    PaymentTerms,
    PlacementType,
    PricingModel,
    ContactType,
)


blogger_counterparty = Table(
    "blogger_counterparty",
    Base.metadata,
    Column("blogger_id", ForeignKey("bloggers.id"), primary_key=True),
    Column("counterparty_id", ForeignKey("counterparties.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(32), default=Role.MANAGER.value)
    status: Mapped[str] = mapped_column(String(32), default=UserStatus.INVITED.value)
    password_hash: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)


class Counterparty(Base):
    __tablename__ = "counterparties"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(64))
    inn: Mapped[Optional[str]] = mapped_column(String(32))
    relationship_type: Mapped[Optional[str]] = mapped_column(String(64))
    payment_details: Mapped[Optional[str]] = mapped_column(Text)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    bloggers: Mapped[list[Blogger]] = relationship(
        secondary=blogger_counterparty, back_populates="counterparties"
    )


class Blogger(Base):
    __tablename__ = "bloggers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    url: Mapped[str] = mapped_column(String(512), unique=True, index=True)
    network: Mapped[str] = mapped_column(String(64))
    subscribers: Mapped[Optional[int]] = mapped_column(Integer)
    avg_reach: Mapped[Optional[int]] = mapped_column(Integer)
    contact_type: Mapped[Optional[str]] = mapped_column(String(64))
    contact_value: Mapped[Optional[str]] = mapped_column(String(255))

    counterparties: Mapped[list[Counterparty]] = relationship(
        secondary=blogger_counterparty, back_populates="bloggers"
    )


class Campaign(Base):
    __tablename__ = "campaigns"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    product: Mapped[Optional[str]] = mapped_column(String(64))
    goal_type: Mapped[Optional[str]] = mapped_column(String(64))
    budget: Mapped[Optional[float]] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(32), default=CampaignStatus.PLANNED.value)
    start_date: Mapped[Optional[date]] = mapped_column(Date)
    end_date: Mapped[Optional[date]] = mapped_column(Date)


class Placement(Base):
    __tablename__ = "placements"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    campaign_id: Mapped[int] = mapped_column(ForeignKey("campaigns.id"))
    blogger_id: Mapped[int] = mapped_column(ForeignKey("bloggers.id"))
    counterparty_id: Mapped[Optional[int]] = mapped_column(ForeignKey("counterparties.id"))
    created_by_user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id"))

    placement_date: Mapped[Optional[date]] = mapped_column(Date)
    fee: Mapped[Optional[float]] = mapped_column(Float)
    link: Mapped[Optional[str]] = mapped_column(String(1024))
    screenshot_url: Mapped[Optional[str]] = mapped_column(String(1024))
    views: Mapped[Optional[int]] = mapped_column(Integer)
    likes: Mapped[Optional[int]] = mapped_column(Integer)
    comments: Mapped[Optional[int]] = mapped_column(Integer)
    shares: Mapped[Optional[int]] = mapped_column(Integer)
    er: Mapped[Optional[float]] = mapped_column(Float)

    status: Mapped[str] = mapped_column(String(64), default=PlacementStatus.PLANNING.value)
    payment_terms: Mapped[Optional[str]] = mapped_column(String(64))
    placement_type: Mapped[Optional[str]] = mapped_column(String(64))
    pricing_model: Mapped[Optional[str]] = mapped_column(String(64))
    erid_token: Mapped[Optional[str]] = mapped_column(String(255))
    alanbase_sub1: Mapped[Optional[str]] = mapped_column(String(255))
    tracking_link: Mapped[Optional[str]] = mapped_column(String(1024))

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Comment(Base):
    __tablename__ = "comments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    text: Mapped[str] = mapped_column(Text)
    blogger_id: Mapped[Optional[int]] = mapped_column(ForeignKey("bloggers.id"))
    counterparty_id: Mapped[Optional[int]] = mapped_column(ForeignKey("counterparties.id"))


class PricePreset(Base):
    __tablename__ = "price_presets"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    blogger_id: Mapped[int] = mapped_column(ForeignKey("bloggers.id"))
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Float)

