"""Provider layer contract.

Every quote/candle carries its `source` and `as_of` timestamp: traceability
is enforced here, at the lowest layer, so the UI gets it for free.
Swapping a data vendor = writing one new file implementing this contract.
"""
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Protocol


@dataclass
class Asset:
    symbol: str
    name: str
    asset_class: str
    currency: str
    provider: str
    provider_ref: str
    unit: str = ""
    demo_base: float = 100.0


@dataclass
class Quote:
    symbol: str
    price: float
    currency: str
    change_24h_pct: float | None = None
    change_7d_pct: float | None = None
    change_30d_pct: float | None = None
    change_1y_pct: float | None = None
    sparkline_7d: list[float] = field(default_factory=list)
    volume_24h: float | None = None
    market_cap: float | None = None
    source: str = ""
    as_of: datetime | None = None
    stale: bool = False


@dataclass
class HistCandle:
    t: date
    c: float
    o: float | None = None
    h: float | None = None
    l: float | None = None
    v: float | None = None


class ProviderError(Exception):
    pass


class MarketDataProvider(Protocol):
    name: str

    def get_quotes(self, assets: list[Asset]) -> dict[str, Quote]: ...

    def get_history(self, asset: Asset, days: int) -> list[HistCandle]: ...
