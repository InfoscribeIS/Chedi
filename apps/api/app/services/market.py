"""Dashboard assembly: quotes → QuoteOut with a traffic light + explanation.

The traffic light is deliberately simple and ALWAYS ships with a French
sentence explaining it — the UI never shows a color without its reason.
"""
from datetime import datetime, timezone

from ..providers.base import Asset, Quote
from ..schemas import Light, MarketGroup, OverviewOut, QuoteOut
from .market_data import MarketDataService
from .pulse import compute_pulse

DASHBOARD_GROUPS: list[tuple[str, list[str]]] = [
    ("Actions & indices", ["^GSPC", "^IXIC", "^STOXX50E", "^FCHI", "^GDAXI", "^N225"]),
    ("Crypto", ["BTC", "ETH", "SOL"]),
    ("Métaux & énergie", ["GC=F", "SI=F", "CL=F"]),
    ("Taux, devises & volatilité", ["^TNX", "EURUSD=X", "^VIX"]),
]


def light_for(asset: Asset, q: Quote) -> Light:
    d1 = q.change_24h_pct
    d7 = q.change_7d_pct

    if asset.asset_class == "volatilite":
        v = q.price or 0
        if v < 15:
            return Light(color="green", label="Marché calme", reason=f"VIX à {v:.0f} : volatilité faible, situation normale.")
        if v < 22:
            return Light(color="neutral", label="Volatilité normale", reason=f"VIX à {v:.0f} : dans la moyenne historique (15–20).")
        if v < 30:
            return Light(color="orange", label="Nervosité", reason=f"VIX à {v:.0f} : les investisseurs se couvrent, mouvements plus amples possibles.")
        return Light(color="red", label="Stress de marché", reason=f"VIX à {v:.0f} : niveau de stress élevé, situation exceptionnelle.")

    if asset.asset_class == "taux":
        if d1 is not None and d1 >= 1.5:
            return Light(color="orange", label="Taux en hausse", reason="Les taux longs montent nettement : cela pèse souvent sur les actions et la croissance.")
        if d1 is not None and d1 <= -1.5:
            return Light(color="green", label="Détente des taux", reason="Les taux longs baissent : conditions de financement plus faciles.")
        return Light(color="neutral", label="Taux stables", reason="Pas de mouvement marquant sur les taux longs aujourd'hui.")

    if d1 is None:
        return Light(color="neutral", label="Données limitées", reason="Variation 24 h indisponible pour cet actif.")

    if d1 <= -2 or (d7 is not None and d7 <= -6):
        return Light(color="red", label="Forte baisse", reason=_reason(asset, d1, d7, "baisse marquée"))
    if d1 <= -0.8 or (d1 < 0 and (d7 or 0) < 0):
        return Light(color="orange", label="Sous pression", reason=_reason(asset, d1, d7, "tendance hésitante à baissière"))
    if d1 >= 0.3:
        return Light(color="green", label="En hausse", reason=_reason(asset, d1, d7, "dynamique positive"))
    return Light(color="neutral", label="Stable", reason=_reason(asset, d1, d7, "peu de mouvement"))


def _reason(asset: Asset, d1, d7, mood: str) -> str:
    parts = [f"{asset.name} : {d1:+.1f} % sur 24 h"]
    if d7 is not None:
        parts.append(f"{d7:+.1f} % sur 7 j")
    return ", ".join(parts) + f" — {mood}. La couleur résume, elle ne recommande rien."


def to_quote_out(asset: Asset, q: Quote) -> QuoteOut:
    return QuoteOut(
        symbol=asset.symbol,
        name=asset.name,
        asset_class=asset.asset_class,
        currency=q.currency or asset.currency,
        unit=asset.unit,
        price=q.price,
        change_24h_pct=q.change_24h_pct,
        change_7d_pct=q.change_7d_pct,
        change_30d_pct=q.change_30d_pct,
        change_1y_pct=q.change_1y_pct,
        sparkline_7d=q.sparkline_7d,
        volume_24h=q.volume_24h,
        market_cap=q.market_cap,
        source=q.source,
        as_of=q.as_of,
        stale=q.stale,
        light=light_for(asset, q),
    )


def build_overview(market: MarketDataService) -> OverviewOut:
    # summary is imported lazily to avoid a circular import at module load
    from .summary import build_summary

    symbols = [s for _, syms in DASHBOARD_GROUPS for s in syms]
    quotes = market.get_quotes(symbols)

    groups = []
    for title, syms in DASHBOARD_GROUPS:
        outs = [to_quote_out(market.asset(s), quotes[s]) for s in syms if s in quotes]
        groups.append(MarketGroup(title=title, quotes=outs))

    pulse = compute_pulse(market, quotes)
    summary = build_summary(market, quotes, pulse)

    sources = {q.source for q in quotes.values()}
    if all(s.startswith("démo") for s in sources):
        data_mode = "demo"
    elif any(s.startswith("démo") or "non rafraîchies" in s for s in sources):
        data_mode = "degraded"
    else:
        data_mode = "live"

    return OverviewOut(
        as_of=datetime.now(timezone.utc),
        data_mode=data_mode,
        groups=groups,
        pulse=pulse,
        summary=summary,
    )
