"""Pydantic DTOs — the API contract with the frontend.

Every market data payload carries `source` + `as_of` so the UI can always
show where a number comes from and how fresh it is.
"""
from datetime import date, datetime

from pydantic import BaseModel, Field

DISCLAIMER = (
    "Outil d'information et d'apprentissage. Ceci n'est pas un conseil en "
    "investissement. Les scénarios ne sont pas des prédictions."
)


class Light(BaseModel):
    color: str  # "green" | "orange" | "red" | "neutral"
    label: str
    reason: str


class QuoteOut(BaseModel):
    symbol: str
    name: str
    asset_class: str
    currency: str
    unit: str = ""
    price: float | None = None
    change_24h_pct: float | None = None
    change_7d_pct: float | None = None
    change_30d_pct: float | None = None
    change_1y_pct: float | None = None
    sparkline_7d: list[float] = []
    volume_24h: float | None = None
    market_cap: float | None = None
    source: str
    as_of: datetime | None = None
    stale: bool = False
    light: Light


class SubScore(BaseModel):
    key: str
    name: str
    score: int  # 0-100
    weight: float
    explanation: str
    source: str


class PulseOut(BaseModel):
    score: int
    label: str
    explanation: str
    subscores: list[SubScore]
    as_of: datetime
    disclaimer: str = "Indicateur pédagogique — jamais un signal d'achat ou de vente."


class SummaryOut(BaseModel):
    text: str
    generated_by: str  # "rules" | model name
    is_ai: bool
    sources: list[str]
    as_of: datetime
    note: str = "Résumé automatique — interprétation, pas un fait."


class MarketGroup(BaseModel):
    title: str
    quotes: list[QuoteOut]


class OverviewOut(BaseModel):
    as_of: datetime
    data_mode: str
    groups: list[MarketGroup]
    pulse: PulseOut
    summary: SummaryOut
    disclaimer: str = DISCLAIMER


class Candle(BaseModel):
    t: date
    o: float | None = None
    h: float | None = None
    l: float | None = None
    c: float
    v: float | None = None


class AssetStats(BaseModel):
    volatility_30d_annualized_pct: float | None = None
    drawdown_from_1y_high_pct: float | None = None
    high_1y: float | None = None
    low_1y: float | None = None
    above_sma50: bool | None = None
    trend_label: str = ""


class WhyBlock(BaseModel):
    facts: list[str]
    interpretation: str | None = None
    generated: bool = False
    note: str = "Les faits sont mesurés ; l'interprétation est une hypothèse, pas une certitude."


class AssetDetailOut(BaseModel):
    quote: QuoteOut
    stats: AssetStats
    why: WhyBlock
    candles: list[Candle]
    history_source: str
    disclaimer: str = DISCLAIMER


# ---------- portfolio ----------

class PositionIn(BaseModel):
    symbol: str
    quantity: float = Field(gt=0)
    buy_price: float = Field(gt=0)
    buy_currency: str = "USD"
    buy_date: date | None = None
    note: str = ""


class PositionOut(BaseModel):
    id: int
    symbol: str
    name: str
    asset_class: str
    quantity: float
    buy_price: float
    buy_currency: str
    buy_date: date | None
    note: str
    current_price: float | None
    price_currency: str
    value_eur: float
    invested_eur: float
    pnl_eur: float
    pnl_pct: float | None
    source: str
    as_of: datetime | None


class AllocationSlice(BaseModel):
    asset_class: str
    value_eur: float
    pct: float


class RiskCard(BaseModel):
    key: str
    title: str
    level: str  # "green" | "orange" | "red" | "neutral"
    headline: str
    detail: str


class RuleCheck(BaseModel):
    rule: str
    ok: bool
    current: float
    limit: float
    comment: str


class PortfolioOut(BaseModel):
    positions: list[PositionOut]
    cash_eur: float
    total_value_eur: float
    invested_eur: float
    pnl_eur: float
    pnl_pct: float | None
    allocation: list[AllocationSlice]
    risk_cards: list[RiskCard]
    rule_checks: list[RuleCheck]
    fx_eur_usd: float
    as_of: datetime
    disclaimer: str = DISCLAIMER


class SettingsOut(BaseModel):
    cash_eur: float
    rule_max_crypto_pct: float
    rule_max_position_pct: float
    rule_reserve_eur: float


class SettingsIn(BaseModel):
    cash_eur: float | None = Field(default=None, ge=0)
    rule_max_crypto_pct: float | None = Field(default=None, ge=0, le=100)
    rule_max_position_pct: float | None = Field(default=None, ge=0, le=100)
    rule_reserve_eur: float | None = Field(default=None, ge=0)


# ---------- simulator ----------

class SimRequest(BaseModel):
    symbol: str
    amount_eur: float = Field(gt=0, le=10_000_000)


class SimSnapshot(BaseModel):
    total_value_eur: float
    cash_eur: float
    allocation: list[AllocationSlice]
    top_position_pct: float
    crypto_pct: float
    est_volatility_pct: float


class SimScenario(BaseModel):
    shock_pct: float
    asset_loss_eur: float
    portfolio_value_eur: float
    portfolio_change_pct: float


class SimResult(BaseModel):
    symbol: str
    name: str
    amount_eur: float
    before: SimSnapshot
    after: SimSnapshot
    scenarios: list[SimScenario]
    rule_checks: list[RuleCheck]
    warnings: list[str]
    note: str = "Scénarios illustratifs (baisse de l'actif acheté), pas des prédictions."
    disclaimer: str = DISCLAIMER


# ---------- watchlist ----------

class WatchlistIn(BaseModel):
    symbol: str
    reason: str = ""


class WatchlistItemOut(BaseModel):
    id: int
    symbol: str
    reason: str
    added_at: datetime
    quote: QuoteOut | None


# ---------- copilot ----------

class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str = Field(max_length=4000)


class CopilotIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    history: list[ChatMessage] = Field(default=[], max_length=12)


class CopilotOut(BaseModel):
    answer: str
    sources: list[str]
    model: str
    disclaimer: str = "Le copilote explique ; il ne recommande jamais d'acheter ou de vendre."


class CopilotStatus(BaseModel):
    available: bool
    model: str | None = None
    reason: str | None = None


class AssetRef(BaseModel):
    symbol: str
    name: str
    asset_class: str
    currency: str
