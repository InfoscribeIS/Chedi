"""Frankfurter (taux de référence BCE) — repli réel pour l'EUR/USD.

Gratuit, sans clé, sans quota publié. Un fixing par jour ouvré (~16h CET) :
suffisant pour convertir un portefeuille et suivre la tendance, et toujours
préférable à une valeur fictive. Source affichée telle quelle dans l'UI.
"""
import time
from datetime import date, datetime, timedelta, timezone

import httpx

from .base import Asset, HistCandle, ProviderError, Quote

BASE = "https://api.frankfurter.dev/v1"
SOURCE = "Frankfurter (taux de référence BCE)"
TIMEOUT = 10.0


def _series(days: int) -> list[HistCandle]:
    start = (date.today() - timedelta(days=days)).isoformat()
    last_exc: Exception | None = None
    for attempt in range(2):  # une 2e chance absorbe les ratés réseau ponctuels
        try:
            resp = httpx.get(
                f"{BASE}/{start}..",
                params={"base": "EUR", "symbols": "USD"},
                timeout=TIMEOUT,
            )
            resp.raise_for_status()
            rates = resp.json()["rates"]
            break
        except Exception as exc:
            last_exc = exc
            if attempt == 0:
                time.sleep(0.8)
    else:
        raise ProviderError(f"Frankfurter history failed: {last_exc}") from last_exc

    candles = [
        HistCandle(t=date.fromisoformat(day), c=values["USD"])
        for day, values in sorted(rates.items())
        if values.get("USD")
    ]
    if not candles:
        raise ProviderError("Frankfurter: série vide")
    return candles


def _pct(before: float | None, after: float) -> float | None:
    if not before:
        return None
    return round((after / before - 1) * 100, 2)


def _back(closes: list[float], sessions: int) -> float | None:
    idx = len(closes) - 1 - sessions
    return closes[idx] if idx >= 0 else None


class FrankfurterProvider:
    """Ne couvre que les parités EUR/xxx — utilisé pour EURUSD=X."""

    name = "frankfurter"

    def get_quotes(self, assets: list[Asset]) -> dict[str, Quote]:
        candles = _series(370)
        closes = [c.c for c in candles]
        price = closes[-1]
        out: dict[str, Quote] = {}
        for asset in assets:
            out[asset.symbol] = Quote(
                symbol=asset.symbol,
                price=price,
                currency="USD",
                change_24h_pct=_pct(_back(closes, 1), price),
                change_7d_pct=_pct(_back(closes, 5), price),
                change_30d_pct=_pct(_back(closes, 21), price),
                change_1y_pct=_pct(closes[0], price),
                sparkline_7d=[round(c, 4) for c in closes[-6:]],
                source=SOURCE,
                as_of=datetime.combine(
                    candles[-1].t, datetime.min.time(), tzinfo=timezone.utc
                ).replace(hour=15),  # fixing BCE ~16h CET
            )
        return out

    def get_history(self, asset: Asset, days: int) -> list[HistCandle]:
        return _series(days)
