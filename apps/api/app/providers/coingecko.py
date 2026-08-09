"""CoinGecko provider (crypto). Free tier: ~30 req/min — always called
through the caching layer in services/market_data.py.

Attribution requirement: the frontend displays "Data by CoinGecko"
wherever this source is shown.
"""
from datetime import datetime, timezone

import httpx

from .base import Asset, HistCandle, ProviderError, Quote

BASE = "https://api.coingecko.com/api/v3"
SOURCE = "CoinGecko"
TIMEOUT = 10.0


class CoinGeckoProvider:
    name = "coingecko"

    def get_quotes(self, assets: list[Asset]) -> dict[str, Quote]:
        ids = ",".join(a.provider_ref for a in assets)
        by_ref = {a.provider_ref: a for a in assets}
        try:
            resp = httpx.get(
                f"{BASE}/coins/markets",
                params={
                    "vs_currency": "usd",
                    "ids": ids,
                    "sparkline": "true",
                    "price_change_percentage": "24h,7d,30d,1y",
                },
                timeout=TIMEOUT,
            )
            resp.raise_for_status()
            rows = resp.json()
        except Exception as exc:  # network, HTTP, JSON — all become ProviderError
            raise ProviderError(f"CoinGecko quotes failed: {exc}") from exc

        now = datetime.now(timezone.utc)
        out: dict[str, Quote] = {}
        for row in rows:
            asset = by_ref.get(row.get("id", ""))
            if asset is None:
                continue
            spark = (row.get("sparkline_in_7d") or {}).get("price") or []
            out[asset.symbol] = Quote(
                symbol=asset.symbol,
                price=row.get("current_price"),
                currency="USD",
                change_24h_pct=_r(row.get("price_change_percentage_24h_in_currency")),
                change_7d_pct=_r(row.get("price_change_percentage_7d_in_currency")),
                change_30d_pct=_r(row.get("price_change_percentage_30d_in_currency")),
                change_1y_pct=_r(row.get("price_change_percentage_1y_in_currency")),
                # hourly points over 7d (~168) — downsample to keep payloads small
                sparkline_7d=[round(p, 4) for p in spark[:: max(1, len(spark) // 30)]],
                volume_24h=row.get("total_volume"),
                market_cap=row.get("market_cap"),
                source=SOURCE,
                as_of=now,
            )
        missing = [a.symbol for a in assets if a.symbol not in out]
        if missing:
            raise ProviderError(f"CoinGecko missing symbols: {missing}")
        return out

    def get_history(self, asset: Asset, days: int) -> list[HistCandle]:
        try:
            resp = httpx.get(
                f"{BASE}/coins/{asset.provider_ref}/market_chart",
                params={"vs_currency": "usd", "days": days, "interval": "daily"},
                timeout=TIMEOUT,
            )
            resp.raise_for_status()
            data = resp.json()
        except Exception as exc:
            raise ProviderError(f"CoinGecko history failed: {exc}") from exc

        volumes = {int(ts): v for ts, v in data.get("total_volumes", [])}
        candles = []
        for ts, price in data.get("prices", []):
            day = datetime.fromtimestamp(ts / 1000, tz=timezone.utc).date()
            candles.append(HistCandle(t=day, c=price, v=volumes.get(int(ts))))
        # market_chart may return two points for today; keep one per day
        dedup: dict = {}
        for c in candles:
            dedup[c.t] = c
        return sorted(dedup.values(), key=lambda c: c.t)


def _r(v):
    return round(v, 2) if isinstance(v, (int, float)) else None
