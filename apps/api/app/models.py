"""Persistent tables — only what belongs to the user.

Market prices are cache (in-memory), never a source of truth here.
Single-user MVP: a `user_id` column gets added to the possessive tables in V2.
"""
from datetime import date, datetime, timezone

from sqlalchemy import Date, DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Position(Base):
    __tablename__ = "positions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    symbol: Mapped[str] = mapped_column(String(24), index=True)
    quantity: Mapped[float] = mapped_column(Float)
    buy_price: Mapped[float] = mapped_column(Float)          # unit price, in buy_currency
    buy_currency: Mapped[str] = mapped_column(String(8), default="USD")
    buy_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    note: Mapped[str] = mapped_column(String(500), default="")


class WatchlistItem(Base):
    __tablename__ = "watchlist_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    symbol: Mapped[str] = mapped_column(String(24), unique=True, index=True)
    reason: Mapped[str] = mapped_column(String(500), default="")
    added_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class UserSettings(Base):
    """Singleton row (id=1): available cash + personal investing rules."""

    __tablename__ = "user_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    cash_eur: Mapped[float] = mapped_column(Float, default=0.0)
    rule_max_crypto_pct: Mapped[float] = mapped_column(Float, default=20.0)
    rule_max_position_pct: Mapped[float] = mapped_column(Float, default=25.0)
    rule_reserve_eur: Mapped[float] = mapped_column(Float, default=0.0)
