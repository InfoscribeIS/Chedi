"""Asset detail: stats computed from history + a 'why is it moving' block.

The 'why' block separates FACTS (measured numbers) from INTERPRETATION
(rule-based hypotheses, clearly labeled). No AI needed here — honesty first.
"""
import math

from ..schemas import AssetDetailOut, AssetStats, Candle, WhyBlock
from .market import to_quote_out
from .market_data import MarketDataService


def _annualized_vol_pct(closes: list[float], asset_class: str) -> float | None:
    if len(closes) < 15:
        return None
    window = closes[-31:]
    rets = [math.log(b / a) for a, b in zip(window, window[1:]) if a > 0]
    if len(rets) < 10:
        return None
    mean = sum(rets) / len(rets)
    var = sum((r - mean) ** 2 for r in rets) / (len(rets) - 1)
    periods = 365 if asset_class == "crypto" else 252  # crypto trades every day
    return round(math.sqrt(var) * math.sqrt(periods) * 100, 1)


def build_detail(market: MarketDataService, symbol: str) -> AssetDetailOut:
    asset = market.asset(symbol)
    if asset is None:
        raise KeyError(symbol)

    quote = market.get_quotes([asset.symbol])[asset.symbol]
    candles, hist_source = market.get_history(asset.symbol, 365)
    closes = [c.c for c in candles]
    price = quote.price or (closes[-1] if closes else None)

    high_1y = max(closes) if closes else None
    low_1y = min(closes) if closes else None
    drawdown = round((price / high_1y - 1) * 100, 1) if price and high_1y else None
    vol = _annualized_vol_pct(closes, asset.asset_class)

    sma50 = sum(closes[-50:]) / min(len(closes), 50) if closes else None
    above_sma50 = (price > sma50) if price and sma50 else None
    trend_label = ""
    if above_sma50 is not None:
        trend_label = (
            "Au-dessus de sa moyenne 50 jours (tendance plutôt haussière)"
            if above_sma50
            else "En-dessous de sa moyenne 50 jours (tendance plutôt baissière)"
        )

    stats = AssetStats(
        volatility_30d_annualized_pct=vol,
        drawdown_from_1y_high_pct=drawdown,
        high_1y=round(high_1y, 4) if high_1y else None,
        low_1y=round(low_1y, 4) if low_1y else None,
        above_sma50=above_sma50,
        trend_label=trend_label,
    )

    facts: list[str] = []
    if quote.change_24h_pct is not None:
        facts.append(f"Variation 24 h : {quote.change_24h_pct:+.1f} %")
    if quote.change_7d_pct is not None:
        facts.append(f"Variation 7 jours : {quote.change_7d_pct:+.1f} %")
    if quote.change_1y_pct is not None:
        facts.append(f"Variation 1 an : {quote.change_1y_pct:+.1f} %")
    if drawdown is not None and drawdown < -1:
        facts.append(f"Actuellement à {drawdown:.0f} % de son plus haut sur 1 an")
    if vol is not None:
        facts.append(f"Volatilité annualisée (30 j) : ≈ {vol:.0f} %")

    interpretation = None
    if quote.change_24h_pct is not None and vol is not None:
        daily_vol = vol / math.sqrt(365 if asset.asset_class == "crypto" else 252)
        ratio = abs(quote.change_24h_pct) / daily_vol if daily_vol else 0
        if ratio >= 2:
            interpretation = (
                f"Le mouvement du jour ({quote.change_24h_pct:+.1f} %) est INHABITUEL pour cet actif "
                f"(≈ {ratio:.1f}× sa variation quotidienne typique de ±{daily_vol:.1f} %). "
                "Un événement spécifique l'explique probablement — vérifie l'actualité de sources fiables avant toute décision."
            )
        elif ratio >= 1:
            interpretation = (
                f"Le mouvement du jour est un peu au-dessus de la normale pour cet actif "
                f"(variation quotidienne typique : ±{daily_vol:.1f} %). Rien d'exceptionnel à ce stade."
            )
        else:
            interpretation = (
                f"Le mouvement du jour est dans la norme pour cet actif "
                f"(variation quotidienne typique : ±{daily_vol:.1f} %). "
                "Le bruit de marché quotidien n'a généralement pas de cause identifiable."
            )

    return AssetDetailOut(
        quote=to_quote_out(asset, quote),
        stats=stats,
        why=WhyBlock(facts=facts, interpretation=interpretation, generated=False),
        candles=[Candle(t=c.t, o=c.o, h=c.h, l=c.l, c=round(c.c, 6), v=c.v) for c in candles],
        history_source=hist_source,
    )
