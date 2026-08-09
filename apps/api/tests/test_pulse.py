from app.services.market_data import get_market_data
from app.services.pulse import clamp, compute_pulse, volatility_score


def test_clamp_bounds():
    assert clamp(-10) == 0
    assert clamp(150) == 100
    assert clamp(54.4) == 54


def test_volatility_score_mapping():
    class Q:
        def __init__(self, price):
            self.price = price

    low, _ = volatility_score({"^VIX": Q(10)})
    mid, _ = volatility_score({"^VIX": Q(22)})
    high, _ = volatility_score({"^VIX": Q(40)})
    assert low == 100
    assert 0 < mid < 100
    assert high == 0
    missing, expl = volatility_score({})
    assert missing == 50 and "indisponible" in expl


def test_pulse_structure():
    market = get_market_data()
    quotes = market.get_quotes(["^GSPC", "^IXIC", "^STOXX50E", "BTC", "^VIX"])
    pulse = compute_pulse(market, quotes)

    assert 0 <= pulse.score <= 100
    assert len(pulse.subscores) == 3
    assert abs(sum(s.weight for s in pulse.subscores) - 1.0) < 1e-9
    for sub in pulse.subscores:
        assert 0 <= sub.score <= 100
        assert sub.explanation  # every score must be explainable
    assert pulse.label
    assert "sous-scores" in pulse.explanation or "score" in pulse.explanation.lower()
