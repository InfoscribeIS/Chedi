"""Central market data access: universe + providers + cache + fallback.

Fallback chain (mode "auto"):
    live provider → last known good value (flagged stale) → demo data.
The app therefore always renders, and always says what it is showing.
"""
import json
import threading
from pathlib import Path

from cachetools import TTLCache

from ..config import get_settings
from ..providers.base import Asset, HistCandle, ProviderError, Quote
from ..providers.coingecko import CoinGeckoProvider
from ..providers.demo import DemoProvider
from ..providers.feargreed import FearGreed, demo_fear_greed, fetch_fear_greed
from ..providers.frankfurter import FrankfurterProvider
from ..providers.yahoo import YahooProvider

UNIVERSE_PATH = Path(__file__).resolve().parent.parent / "data" / "universe.json"


def load_universe() -> dict[str, Asset]:
    raw = json.loads(UNIVERSE_PATH.read_text(encoding="utf-8"))
    return {row["symbol"]: Asset(**row) for row in raw}


class MarketDataService:
    def __init__(self, mode: str | None = None):
        settings = get_settings()
        self.mode = mode or settings.data_mode
        self.universe = load_universe()
        self._live = {"coingecko": CoinGeckoProvider(), "yahoo": YahooProvider()}
        self._forex_backup = FrankfurterProvider()  # repli réel (BCE) pour l'EUR/USD
        self._demo = DemoProvider()
        self._quote_cache: TTLCache = TTLCache(maxsize=512, ttl=settings.quote_cache_ttl)
        self._history_cache: TTLCache = TTLCache(maxsize=256, ttl=settings.history_cache_ttl)
        self._fg_cache: TTLCache = TTLCache(maxsize=1, ttl=3600)
        self._last_good: dict[str, Quote] = {}
        self._lock = threading.Lock()

    # ---- assets ----------------------------------------------------------

    def asset(self, symbol: str) -> Asset | None:
        return self.universe.get(symbol.upper()) or self.universe.get(symbol)

    def search(self, query: str) -> list[Asset]:
        q = query.strip().lower()
        if not q:
            return list(self.universe.values())
        return [
            a for a in self.universe.values()
            if q in a.symbol.lower() or q in a.name.lower() or q in a.asset_class.lower()
        ]

    # ---- quotes ----------------------------------------------------------

    def get_quotes(self, symbols: list[str]) -> dict[str, Quote]:
        assets = [a for s in symbols if (a := self.asset(s))]
        with self._lock:
            out = {a.symbol: self._quote_cache[a.symbol] for a in assets if a.symbol in self._quote_cache}
        missing = [a for a in assets if a.symbol not in out]
        if missing:
            fetched = self._fetch_quotes(missing)
            with self._lock:
                for sym, q in fetched.items():
                    # Les valeurs de repli sont AUSSI mises en cache : pendant un
                    # blocage du fournisseur (429), on arrête de le marteler à
                    # chaque page — il se débloque d'autant plus vite.
                    self._quote_cache[sym] = q
                    if not q.stale and not q.source.startswith("démo"):
                        self._last_good[sym] = q
            out.update(fetched)
        return out

    def _fetch_quotes(self, assets: list[Asset]) -> dict[str, Quote]:
        if self.mode == "demo":
            return self._demo.get_quotes(assets)

        out: dict[str, Quote] = {}
        by_provider: dict[str, list[Asset]] = {}
        for a in assets:
            by_provider.setdefault(a.provider, []).append(a)

        for provider_name, batch in by_provider.items():
            try:
                out.update(self._live[provider_name].get_quotes(batch))
            except ProviderError:
                if self.mode == "live":
                    raise
                out.update(self._fallback_quotes(batch))
        return out

    def _fallback_quotes(self, assets: list[Asset]) -> dict[str, Quote]:
        out: dict[str, Quote] = {}
        demo_needed: list[Asset] = []
        # Le forex a un repli RÉEL (fixing BCE) avant toute donnée fictive :
        # ce taux sert aussi aux conversions EUR du portefeuille.
        forex = [a for a in assets if a.asset_class == "forex"]
        if forex:
            try:
                out.update(self._forex_backup.get_quotes(forex))
            except ProviderError:
                pass  # continue vers dernière-valeur-connue puis démo
        for a in assets:
            if a.symbol in out:
                continue
            good = self._last_good.get(a.symbol)
            if good is not None:
                stale = Quote(**{**good.__dict__})
                stale.stale = True
                stale.source = f"{good.source} (données non rafraîchies)"
                out[a.symbol] = stale
            else:
                demo_needed.append(a)
        if demo_needed:
            demo = self._demo.get_quotes(demo_needed)
            for q in demo.values():
                q.source = "démo (source réelle indisponible)"
            out.update(demo)
        return out

    # ---- history ---------------------------------------------------------

    def get_history(self, symbol: str, days: int = 365) -> tuple[list[HistCandle], str]:
        asset = self.asset(symbol)
        if asset is None:
            raise KeyError(symbol)
        key = (asset.symbol, days)
        with self._lock:
            if key in self._history_cache:
                return self._history_cache[key]

        if self.mode == "demo":
            result = (self._demo.get_history(asset, days), "démo (données fictives)")
        else:
            try:
                candles = self._live[asset.provider].get_history(asset, days)
                source = "CoinGecko" if asset.provider == "coingecko" else "Yahoo Finance"
                result = (candles, source)
            except ProviderError:
                if self.mode == "live":
                    raise
                result = None
                if asset.asset_class == "forex":
                    try:
                        result = (self._forex_backup.get_history(asset, days),
                                  "Frankfurter (taux de référence BCE)")
                    except ProviderError:
                        result = None
                if result is None:
                    result = (self._demo.get_history(asset, days), "démo (source réelle indisponible)")

        with self._lock:
            self._history_cache[key] = result
        return result

    # ---- fear & greed ----------------------------------------------------

    def get_fear_greed(self) -> FearGreed:
        with self._lock:
            if "fg" in self._fg_cache:
                return self._fg_cache["fg"]
        if self.mode == "demo":
            fg = demo_fear_greed()
        else:
            try:
                fg = fetch_fear_greed()
            except ProviderError:
                if self.mode == "live":
                    raise
                fg = demo_fear_greed()
        with self._lock:
            self._fg_cache["fg"] = fg
        return fg

    # ---- fx --------------------------------------------------------------

    def fx_usd_per_eur(self) -> float:
        """USD per 1 EUR — used to convert USD amounts to EUR."""
        quotes = self.get_quotes(["EURUSD=X"])
        q = quotes.get("EURUSD=X")
        if q and q.price:
            return float(q.price)
        return 1.09  # conservative default, only reachable if EURUSD missing from universe

    def to_eur(self, amount: float, currency: str) -> float:
        cur = currency.upper()
        if cur == "EUR":
            return amount
        if cur == "USD":
            return amount / self.fx_usd_per_eur()
        # JPY/HKD etc. only appear for index points (never money amounts) in the MVP.
        return amount


_service: MarketDataService | None = None


def get_market_data() -> MarketDataService:
    global _service
    if _service is None:
        _service = MarketDataService()
    return _service


def reset_market_data(mode: str | None = None) -> MarketDataService:
    """Used by tests to force a fresh service (e.g. demo mode)."""
    global _service
    _service = MarketDataService(mode=mode)
    return _service
