from app import models
from app.services.market_data import get_market_data
from app.services.risk import (
    allocation,
    build_risk_cards,
    crypto_pct,
    est_volatility_pct,
    top_position_pct,
    value_positions,
)


def settings():
    return models.UserSettings(id=1, cash_eur=500.0, rule_max_crypto_pct=20.0,
                               rule_max_position_pct=25.0, rule_reserve_eur=0.0)


def make_views():
    market = get_market_data()
    positions = [
        models.Position(id=1, symbol="BTC", quantity=0.001, buy_price=90000, buy_currency="USD", note=""),
        models.Position(id=2, symbol="SPY", quantity=1, buy_price=600, buy_currency="USD", note=""),
    ]
    return market, value_positions(positions, market)


def test_valuation_produces_eur_values():
    _, views = make_views()
    assert all(v.value_eur > 0 for v in views)
    assert all(v.invested_eur > 0 for v in views)


def test_allocation_sums_to_100():
    _, views = make_views()
    slices = allocation(views, cash_eur=500.0)
    assert abs(sum(s.pct for s in slices) - 100.0) < 0.5
    assert any(s.asset_class == "cash" for s in slices)


def test_concentration_and_crypto_share():
    _, views = make_views()
    total = sum(v.value_eur for v in views) + 500.0
    top, name = top_position_pct(views, total)
    assert 0 < top < 100
    assert name
    assert 0 < crypto_pct(views, total) < 100


def test_estimated_volatility_bounds():
    _, views = make_views()
    total = sum(v.value_eur for v in views) + 500.0
    vol = est_volatility_pct(views, total)
    assert 0 < vol < 65  # bounded by the highest class vol (crypto)


def test_risk_cards_for_empty_portfolio():
    cards = build_risk_cards([], 0.0, settings())
    assert cards[0].key == "empty"


def test_risk_cards_complete():
    _, views = make_views()
    cards = build_risk_cards(views, 500.0, settings())
    keys = {c.key for c in cards}
    assert keys == {"concentration", "crypto", "volatility", "scenario"}
    assert all(c.headline and c.detail for c in cards)
