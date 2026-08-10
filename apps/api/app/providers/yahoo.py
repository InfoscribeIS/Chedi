"""Yahoo Finance provider (unofficial chart endpoint).

Covers indices, stocks, ETFs, gold/oil futures, forex — for free, but with
no guarantees: Yahoo throttles datacenter IPs and can change the endpoint.
That risk is accepted for a personal MVP and contained by the fallback
chain (see services/market_data.py). Personal use only — must be replaced
(e.g. by Stooq/Twelve Data) before any public deployment.
"""
from datetime import datetime, timezone

import httpx

from .base import Asset, HistCandle, ProviderError, Quote

BASE = "https://query1.finance.yahoo.com/v8/finance/chart"
SOURCE = "Yahoo Finance"
TIMEOUT = 10.0
HEADERS = {
    # Yahoo rejects requests without a browser-like User-Agent.
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0",
    "Accept": "application/json",
}


class YahooProvider:
    name = "yahoo"

    def get_quotes(self, assets: list[Asset]) -> dict[str, Quote]:
        out: dict[str, Quote] = {}
        errors: list[str] = []
        with httpx.Client(headers=HEADERS, timeout=TIMEOUT) as client:
            for asset in assets:
                try:
                    out[asset.symbol] = self._quote_from_chart(client, asset)
                except Exception as exc:
                    errors.append(f"{asset.symbol}: {exc}")
        if not out and assets:
            raise ProviderError(f"Yahoo quotes failed: {'; '.join(errors[:3])}")
        for a in assets:
            if a.symbol not in out:
                raise ProviderError(f"Yahoo missing {a.symbol}: {'; '.join(errors[:3])}")
        return out

    def get_history(self, asset: Asset, days: int) -> list[HistCandle]:
        rng = "1y" if days > 90 else ("3mo" if days > 30 else "1mo")
        try:
            with httpx.Client(headers=HEADERS, timeout=TIMEOUT) as client:
                result = self._fetch_chart(client, asset.provider_ref, rng)
            return self._candles(result)
        except ProviderError:
            raise
        except Exception as exc:  # httpx 429/5xx/réseau → format rattrapable par le fallback
            raise ProviderError(f"Yahoo history failed for {asset.symbol}: {exc}") from exc

    # -- internals ---------------------------------------------------------

    def _fetch_chart(self, client: httpx.Client, ref: str, rng: str) -> dict:
        resp = client.get(f"{BASE}/{ref}", params={"range": rng, "interval": "1d"})
        resp.raise_for_status()
        payload = resp.json()
        chart = payload.get("chart") or {}
        if chart.get("error"):
            raise ProviderError(str(chart["error"]))
        results = chart.get("result") or []
        if not results:
            raise ProviderError("empty chart result")
        return results[0]

    def _candles(self, result: dict) -> list[HistCandle]:
        ts = result.get("timestamp") or []
        quote = ((result.get("indicators") or {}).get("quote") or [{}])[0]
        closes = quote.get("close") or []
        opens = quote.get("open") or []
        highs = quote.get("high") or []
        lows = quote.get("low") or []
        vols = quote.get("volume") or []
        candles = []
        for i, t in enumerate(ts):
            close = closes[i] if i < len(closes) else None
            if close is None:  # holidays / gaps come back as null
                continue
            candles.append(
                HistCandle(
                    t=datetime.fromtimestamp(t, tz=timezone.utc).date(),
                    c=close,
                    o=_at(opens, i),
                    h=_at(highs, i),
                    l=_at(lows, i),
                    v=_at(vols, i),
                )
            )
        return candles

    def _quote_from_chart(self, client: httpx.Client, asset: Asset) -> Quote:
        result = self._fetch_chart(client, asset.provider_ref, "1y")
        meta = result.get("meta") or {}
        candles = self._candles(result)
        if not candles:
            raise ProviderError("no candles")
        closes = [c.c for c in candles]
        price = meta.get("regularMarketPrice") or closes[-1]
        prev = meta.get("chartPreviousClose")
        # last candle can BE the live session: compare against the prior close
        ref_24h = closes[-2] if len(closes) >= 2 else prev
        as_of_ts = meta.get("regularMarketTime")
        return Quote(
            symbol=asset.symbol,
            price=price,
            currency=meta.get("currency") or asset.currency,
            change_24h_pct=_pct(ref_24h, price),
            change_7d_pct=_pct(_back(closes, 5), price),
            change_30d_pct=_pct(_back(closes, 21), price),
            change_1y_pct=_pct(closes[0], price),
            sparkline_7d=[round(c, 4) for c in closes[-6:-1]] + [round(price, 4)],
            volume_24h=candles[-1].v,
            source=SOURCE,
            as_of=datetime.fromtimestamp(as_of_ts, tz=timezone.utc) if as_of_ts else datetime.now(timezone.utc),
        )


def _at(arr, i):
    return arr[i] if i < len(arr) and arr[i] is not None else None


def _back(closes: list[float], sessions: int) -> float | None:
    """Close `sessions` trading days before the last one."""
    idx = len(closes) - 1 - sessions
    return closes[idx] if idx >= 0 else None


def _pct(before, after):
    if not before or after is None:
        return None
    return round((after / before - 1) * 100, 2)
