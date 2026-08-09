"""Financial math must be tested — these calculations drive real decisions."""
from app import models
from app.schemas import SimRequest
from app.services.market_data import get_market_data
from app.services.simulator import simulate


def make_settings(cash=1000.0, max_crypto=20.0, max_pos=25.0, reserve=200.0):
    return models.UserSettings(
        id=1, cash_eur=cash,
        rule_max_crypto_pct=max_crypto,
        rule_max_position_pct=max_pos,
        rule_reserve_eur=reserve,
    )


def test_simulation_with_empty_portfolio():
    market = get_market_data()
    result = simulate(SimRequest(symbol="BTC", amount_eur=200), [], make_settings(), market)

    assert result.before.total_value_eur == 1000.0
    assert result.after.total_value_eur == 1000.0  # cash converted into asset, total unchanged
    assert result.after.cash_eur == 800.0
    assert result.after.crypto_pct == 20.0

    shocks = {s.shock_pct: s for s in result.scenarios}
    assert shocks[-30.0].asset_loss_eur == -60.0
    assert shocks[-30.0].portfolio_value_eur == 940.0


def test_simulation_flags_insufficient_cash():
    market = get_market_data()
    result = simulate(SimRequest(symbol="ETH", amount_eur=5000), [], make_settings(cash=100), market)
    assert any("Cash insuffisant" in w for w in result.warnings)


def test_simulation_flags_crypto_rule_breach():
    market = get_market_data()
    result = simulate(SimRequest(symbol="BTC", amount_eur=500), [], make_settings(cash=1000, max_crypto=20), market)
    # 500/1000 = 50% crypto > 20% rule
    assert result.after.crypto_pct == 50.0
    crypto_check = next(c for c in result.rule_checks if "Crypto" in c.rule)
    assert crypto_check.ok is False
    assert any("règle" in w for w in result.warnings)


def test_simulation_flags_reserve_breach():
    market = get_market_data()
    result = simulate(SimRequest(symbol="SPY", amount_eur=900), [], make_settings(cash=1000, reserve=200), market)
    assert any("réserve" in w for w in result.warnings)


def test_scenarios_include_existing_exposure():
    market = get_market_data()
    quote = market.get_quotes(["BTC"])["BTC"]
    btc_price_eur = market.to_eur(quote.price, quote.currency)
    existing = models.Position(id=1, symbol="BTC", quantity=100 / btc_price_eur, buy_price=quote.price * 0.9,
                               buy_currency="USD", note="")
    result = simulate(SimRequest(symbol="BTC", amount_eur=100), [existing], make_settings(cash=500), market)
    shock10 = next(s for s in result.scenarios if s.shock_pct == -10.0)
    # exposure ≈ 100 (existing) + 100 (new) → -10% ≈ -20 €
    assert abs(shock10.asset_loss_eur + 20.0) < 1.0
