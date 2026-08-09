"""Pre-investment simulator: 'if I invest X € in Y, what happens to my
portfolio?' — pure deterministic math, symmetric caveats, no prediction.
"""
from .. import models
from ..schemas import SimRequest, SimResult, SimScenario, SimSnapshot
from .market_data import MarketDataService
from .risk import (
    PositionView,
    allocation,
    build_rule_checks,
    crypto_pct,
    est_volatility_pct,
    top_position_pct,
    value_positions,
)

SHOCKS = [-10.0, -20.0, -30.0]


def _snapshot(views: list[PositionView], cash_eur: float) -> SimSnapshot:
    total = sum(v.value_eur for v in views) + max(cash_eur, 0.0)
    top_pct, _ = top_position_pct(views, total)
    return SimSnapshot(
        total_value_eur=round(total, 2),
        cash_eur=round(cash_eur, 2),
        allocation=allocation(views, max(cash_eur, 0.0)),
        top_position_pct=top_pct,
        crypto_pct=crypto_pct(views, total),
        est_volatility_pct=est_volatility_pct(views, total),
    )


def simulate(
    req: SimRequest,
    positions: list[models.Position],
    settings: models.UserSettings,
    market: MarketDataService,
) -> SimResult:
    asset = market.asset(req.symbol)
    if asset is None:
        raise KeyError(req.symbol)

    views = value_positions(positions, market)
    before = _snapshot(views, settings.cash_eur)

    # Hypothetical new position, valued at today's price.
    hypo = PositionView(
        id=-1, symbol=asset.symbol, name=asset.name, asset_class=asset.asset_class,
        quantity=0, buy_price=0, buy_currency="EUR", buy_date=None, note="",
        current_price=None, price_currency="EUR",
        value_eur=req.amount_eur, invested_eur=req.amount_eur,
        source="simulation", as_of=None,
    )
    after_views = views + [hypo]
    after_cash = settings.cash_eur - req.amount_eur
    after = _snapshot(after_views, after_cash)

    # Shock applied to the TOTAL exposure to this asset after purchase
    # (existing position + new investment).
    exposure = sum(v.value_eur for v in after_views if v.symbol == asset.symbol)
    scenarios = []
    for shock in SHOCKS:
        loss = exposure * shock / 100
        shocked_total = after.total_value_eur + loss
        scenarios.append(SimScenario(
            shock_pct=shock,
            asset_loss_eur=round(loss, 2),
            portfolio_value_eur=round(shocked_total, 2),
            portfolio_change_pct=round(loss / after.total_value_eur * 100, 2) if after.total_value_eur else 0.0,
        ))

    warnings: list[str] = []
    if req.amount_eur > settings.cash_eur:
        warnings.append(
            f"Cash insuffisant : tu disposes de {settings.cash_eur:,.0f} € et la simulation porte sur "
            f"{req.amount_eur:,.0f} €.".replace(",", " ")
        )
    if after_cash < settings.rule_reserve_eur:
        warnings.append(
            f"Cet achat ferait passer ton cash sous ta réserve de sécurité ({settings.rule_reserve_eur:,.0f} €).".replace(",", " ")
        )
    if asset.asset_class == "crypto" and after.crypto_pct > settings.rule_max_crypto_pct:
        warnings.append(
            f"Ta part crypto passerait à {after.crypto_pct:.1f} % — au-dessus de ta règle "
            f"({settings.rule_max_crypto_pct:.0f} %)."
        )

    # Rule checks evaluated on the AFTER state.
    hypo_settings = models.UserSettings(
        id=0,
        cash_eur=max(after_cash, 0.0),
        rule_max_crypto_pct=settings.rule_max_crypto_pct,
        rule_max_position_pct=settings.rule_max_position_pct,
        rule_reserve_eur=settings.rule_reserve_eur,
    )
    rule_checks = build_rule_checks(after_views, after_cash, hypo_settings)

    return SimResult(
        symbol=asset.symbol,
        name=asset.name,
        amount_eur=req.amount_eur,
        before=before,
        after=after,
        scenarios=scenarios,
        rule_checks=rule_checks,
        warnings=warnings,
    )
