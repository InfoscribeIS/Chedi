"""Portfolio valuation and risk metrics.

Philosophy: rough, transparent, and expressed in euros. Every estimate says
what it assumes. We'd rather show "≈ -340 €" with a caveat than a falsely
precise Value-at-Risk.
"""
from dataclasses import dataclass
from datetime import datetime

from .. import models
from ..schemas import AllocationSlice, RiskCard, RuleCheck
from .market_data import MarketDataService

# Rough annualized volatility by asset class (pedagogical orders of magnitude,
# deliberately conservative). Correlation between holdings is assumed = 1,
# so the portfolio figure is an UPPER estimate — stated as such in the UI.
CLASS_VOL_ANNUAL_PCT = {
    "crypto": 65.0,
    "action": 25.0,
    "etf": 16.0,
    "indice": 16.0,
    "metal": 15.0,
    "energie": 30.0,
    "forex": 8.0,
    "taux": 10.0,
}

# Combined stress scenario shown on the risk map: equities -20 %, crypto -30 %.
SCENARIO_SHOCKS = {"action": -0.20, "etf": -0.20, "indice": -0.20, "crypto": -0.30, "metal": -0.10, "energie": -0.20}


@dataclass
class PositionView:
    id: int
    symbol: str
    name: str
    asset_class: str
    quantity: float
    buy_price: float
    buy_currency: str
    buy_date: object
    note: str
    current_price: float | None
    price_currency: str
    value_eur: float
    invested_eur: float
    source: str
    as_of: datetime | None


def value_positions(positions: list[models.Position], market: MarketDataService) -> list[PositionView]:
    symbols = [p.symbol for p in positions]
    quotes = market.get_quotes(symbols) if symbols else {}
    views: list[PositionView] = []
    for p in positions:
        asset = market.asset(p.symbol)
        q = quotes.get(asset.symbol) if asset else None
        price = q.price if q else None
        value_native = (price or 0) * p.quantity
        value_eur = market.to_eur(value_native, q.currency if q else "USD") if q else 0.0
        # Note: invested amount converted at TODAY'S fx rate (buy-date rate not stored in MVP).
        invested_eur = market.to_eur(p.buy_price * p.quantity, p.buy_currency)
        views.append(PositionView(
            id=p.id,
            symbol=asset.symbol if asset else p.symbol,
            name=asset.name if asset else p.symbol,
            asset_class=asset.asset_class if asset else "action",
            quantity=p.quantity,
            buy_price=p.buy_price,
            buy_currency=p.buy_currency,
            buy_date=p.buy_date,
            note=p.note,
            current_price=price,
            price_currency=(q.currency if q else "USD"),
            value_eur=round(value_eur, 2),
            invested_eur=round(invested_eur, 2),
            source=q.source if q else "n/a",
            as_of=q.as_of if q else None,
        ))
    return views


def allocation(views: list[PositionView], cash_eur: float) -> list[AllocationSlice]:
    total = sum(v.value_eur for v in views) + cash_eur
    if total <= 0:
        return []
    by_class: dict[str, float] = {}
    for v in views:
        by_class[v.asset_class] = by_class.get(v.asset_class, 0) + v.value_eur
    if cash_eur > 0:
        by_class["cash"] = cash_eur
    return [
        AllocationSlice(asset_class=k, value_eur=round(val, 2), pct=round(val / total * 100, 1))
        for k, val in sorted(by_class.items(), key=lambda kv: -kv[1])
    ]


def top_position_pct(views: list[PositionView], total_eur: float) -> tuple[float, str]:
    if not views or total_eur <= 0:
        return 0.0, ""
    top = max(views, key=lambda v: v.value_eur)
    return round(top.value_eur / total_eur * 100, 1), top.name


def crypto_pct(views: list[PositionView], total_eur: float) -> float:
    if total_eur <= 0:
        return 0.0
    crypto = sum(v.value_eur for v in views if v.asset_class == "crypto")
    return round(crypto / total_eur * 100, 1)


def est_volatility_pct(views: list[PositionView], total_eur: float) -> float:
    if total_eur <= 0:
        return 0.0
    vol = sum(v.value_eur / total_eur * CLASS_VOL_ANNUAL_PCT.get(v.asset_class, 20.0) for v in views)
    return round(vol, 1)  # cash contributes 0


def scenario_loss_eur(views: list[PositionView]) -> float:
    return round(sum(v.value_eur * SCENARIO_SHOCKS.get(v.asset_class, 0.0) for v in views), 2)


def build_risk_cards(views: list[PositionView], cash_eur: float, settings: models.UserSettings) -> list[RiskCard]:
    total = sum(v.value_eur for v in views) + cash_eur
    cards: list[RiskCard] = []
    if total <= 0:
        return [RiskCard(
            key="empty", title="Portefeuille vide", level="neutral",
            headline="Ajoute ton cash et tes positions pour voir ta carte des risques.",
            detail="Les indicateurs de risque se calculent sur ce que tu possèdes réellement.",
        )]

    top_pct, top_name = top_position_pct(views, total)
    level = "red" if top_pct > 40 else ("orange" if top_pct > 25 else ("green" if views else "neutral"))
    cards.append(RiskCard(
        key="concentration", title="Concentration", level=level,
        headline=(f"{top_pct:.0f} % sur {top_name}" if views else "Aucune position"),
        detail="Au-delà de ~25 % sur une seule ligne, une mauvaise nouvelle sur cet actif pèse lourd sur tout ton portefeuille. "
               f"Ta règle personnelle : max {settings.rule_max_position_pct:.0f} % par position.",
    ))

    c_pct = crypto_pct(views, total)
    level = "red" if c_pct > settings.rule_max_crypto_pct * 1.5 else ("orange" if c_pct > settings.rule_max_crypto_pct else "green")
    cards.append(RiskCard(
        key="crypto", title="Part crypto", level=level,
        headline=f"{c_pct:.0f} % de ton portefeuille",
        detail=f"Ta règle : max {settings.rule_max_crypto_pct:.0f} %. La crypto peut perdre 30 % en quelques jours — "
               "c'est la partie la plus explosive de ton portefeuille, dans les deux sens.",
    ))

    vol = est_volatility_pct(views, total)
    level = "red" if vol > 35 else ("orange" if vol > 20 else "green")
    mood = "nerveux" if vol > 35 else ("remuant" if vol > 20 else "plutôt calme")
    cards.append(RiskCard(
        key="volatility", title="Volatilité estimée", level=level,
        headline=f"≈ {vol:.0f} % par an — portefeuille {mood}",
        detail="Estimation haute par classe d'actifs (hypothèse prudente : tout baisse en même temps). "
               "À ~30 % de volatilité, une année à -25 % n'a rien d'anormal.",
    ))

    loss = scenario_loss_eur(views)
    loss_pct = (loss / total * 100) if total else 0
    level = "red" if loss_pct < -25 else ("orange" if loss_pct < -12 else "green")
    cards.append(RiskCard(
        key="scenario", title="Scénario de choc", level=level,
        headline=f"Actions -20 % et crypto -30 % → ≈ {loss:,.0f} € ({loss_pct:+.0f} %)".replace(",", " "),
        detail="Un scénario illustratif, pas une prédiction : ce type de baisse simultanée s'est déjà produit "
               "(2020, 2022). Question à te poser : pourrais-tu encaisser cette perte sans vendre en panique ?",
    ))
    return cards


def build_rule_checks(views: list[PositionView], cash_eur: float, settings: models.UserSettings) -> list[RuleCheck]:
    total = sum(v.value_eur for v in views) + cash_eur
    checks: list[RuleCheck] = []
    if total <= 0:
        return checks

    c_pct = crypto_pct(views, total)
    checks.append(RuleCheck(
        rule=f"Crypto ≤ {settings.rule_max_crypto_pct:.0f} % du portefeuille",
        ok=c_pct <= settings.rule_max_crypto_pct,
        current=c_pct, limit=settings.rule_max_crypto_pct,
        comment=f"Actuellement {c_pct:.1f} %.",
    ))

    top_pct, top_name = top_position_pct(views, total)
    checks.append(RuleCheck(
        rule=f"Aucune position > {settings.rule_max_position_pct:.0f} %",
        ok=top_pct <= settings.rule_max_position_pct,
        current=top_pct, limit=settings.rule_max_position_pct,
        comment=(f"Plus grosse ligne : {top_name} à {top_pct:.1f} %." if top_name else "Aucune position."),
    ))

    checks.append(RuleCheck(
        rule=f"Réserve de sécurité ≥ {settings.rule_reserve_eur:.0f} €",
        ok=cash_eur >= settings.rule_reserve_eur,
        current=round(cash_eur, 2), limit=settings.rule_reserve_eur,
        comment=f"Cash disponible : {cash_eur:,.0f} €.".replace(",", " "),
    ))
    return checks
