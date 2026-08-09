"""Crypto Fear & Greed index (alternative.me). Free, no key.

Attribution requirement: the frontend shows the alternative.me credit next
to this value. The index updates once a day → cached 1 h by the caller.
"""
from dataclasses import dataclass
from datetime import datetime, timezone

import httpx

from .base import ProviderError

URL = "https://api.alternative.me/fng/?limit=1"
SOURCE = "alternative.me (Crypto Fear & Greed)"


@dataclass
class FearGreed:
    value: int              # 0 (peur extrême) → 100 (euphorie)
    classification: str
    as_of: datetime
    source: str = SOURCE
    is_demo: bool = False


def fetch_fear_greed() -> FearGreed:
    try:
        resp = httpx.get(URL, timeout=10.0)
        resp.raise_for_status()
        row = resp.json()["data"][0]
        return FearGreed(
            value=int(row["value"]),
            classification=row.get("value_classification", ""),
            as_of=datetime.fromtimestamp(int(row["timestamp"]), tz=timezone.utc),
        )
    except Exception as exc:
        raise ProviderError(f"Fear & Greed failed: {exc}") from exc


def demo_fear_greed() -> FearGreed:
    return FearGreed(
        value=54,
        classification="Neutral",
        as_of=datetime.now(timezone.utc),
        source="démo (données fictives)",
        is_demo=True,
    )
