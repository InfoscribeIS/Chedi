"""Deterministic offline data provider.

Generates realistic-looking price series with a per-symbol seeded random
walk, so the whole app (and its tests, and CI) runs with zero network and
zero API keys. Every quote is clearly labeled source="démo".
"""
import random
import zlib
from datetime import date, datetime, timedelta, timezone

from .base import Asset, HistCandle, Quote

SOURCE = "démo (données fictives)"

# Daily volatility by asset class — rough realistic orders of magnitude.
CLASS_DAILY_VOL = {
    "crypto": 0.035,
    "action": 0.016,
    "etf": 0.010,
    "indice": 0.010,
    "metal": 0.010,
    "energie": 0.020,
    "forex": 0.004,
    "taux": 0.015,
    "volatilite": 0.05,
}


def _seed(symbol: str) -> int:
    # hash() is salted per process; crc32 keeps the demo data stable across runs.
    return zlib.crc32(symbol.encode("utf-8"))


def _series(asset: Asset, days: int) -> list[float]:
    """Random walk ending exactly at the asset's demo_base price."""
    rng = random.Random(_seed(asset.symbol))
    vol = CLASS_DAILY_VOL.get(asset.asset_class, 0.012)
    steps = [rng.gauss(0.0004, vol) for _ in range(days)]
    prices = [1.0]
    for s in steps:
        prices.append(max(prices[-1] * (1 + s), 1e-9))
    scale = asset.demo_base / prices[-1]
    return [p * scale for p in prices]


class DemoProvider:
    name = "demo"

    def get_quotes(self, assets: list[Asset]) -> dict[str, Quote]:
        out: dict[str, Quote] = {}
        now = datetime.now(timezone.utc)
        for a in assets:
            s = _series(a, 400)
            price = s[-1]
            out[a.symbol] = Quote(
                symbol=a.symbol,
                price=round(price, 4 if price < 10 else 2),
                currency=a.currency,
                change_24h_pct=_pct(s[-2], price),
                change_7d_pct=_pct(s[-8], price),
                change_30d_pct=_pct(s[-31], price),
                change_1y_pct=_pct(s[-366], price),
                sparkline_7d=[round(x, 4) for x in s[-8:]],
                volume_24h=round(abs(random.Random(_seed(a.symbol) + 1).gauss(1, 0.3)) * price * 1e6, 0),
                market_cap=None,
                source=SOURCE,
                as_of=now,
            )
        return out

    def get_history(self, asset: Asset, days: int) -> list[HistCandle]:
        s = _series(asset, days)
        today = date.today()
        candles = []
        for i, close in enumerate(s[1:]):
            t = today - timedelta(days=days - 1 - i)
            candles.append(HistCandle(t=t, c=round(close, 4)))
        return candles


def _pct(before: float, after: float) -> float | None:
    if not before:
        return None
    return round((after / before - 1) * 100, 2)
