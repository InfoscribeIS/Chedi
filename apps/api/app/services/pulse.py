"""Market Pulse: a 0-100 pedagogical score built from three TRANSPARENT
sub-scores. Formulas are simple on purpose — every value can be explained
in one French sentence, and the UI always shows the sub-scores, never just
the composite (a single number would fake certainty).
"""
from datetime import datetime, timezone

from ..providers.base import Quote
from ..schemas import PulseOut, SubScore
from .market_data import MarketDataService

MOMENTUM_SYMBOLS = ["^GSPC", "^IXIC", "^STOXX50E", "BTC"]
WEIGHTS = {"momentum": 0.4, "volatility": 0.3, "sentiment": 0.3}


def clamp(v: float, lo: float = 0, hi: float = 100) -> int:
    return int(max(lo, min(hi, round(v))))


def momentum_score(quotes: dict[str, Quote]) -> tuple[int, str]:
    changes = [
        quotes[s].change_7d_pct
        for s in MOMENTUM_SYMBOLS
        if s in quotes and quotes[s].change_7d_pct is not None
    ]
    if not changes:
        return 50, "Momentum inconnu (données 7 jours indisponibles)."
    avg = sum(changes) / len(changes)
    positives = sum(1 for c in changes if c > 0)
    score = clamp(50 + avg * 8)
    return score, (
        f"Moyenne des variations 7 j de {len(changes)} marchés majeurs : {avg:+.1f} % "
        f"({positives}/{len(changes)} en hausse). 50 = neutre, au-dessus = dynamique positive."
    )


def volatility_score(quotes: dict[str, Quote]) -> tuple[int, str]:
    vix = quotes.get("^VIX")
    if vix is None or vix.price is None:
        return 50, "VIX indisponible — sous-score neutre par défaut."
    v = vix.price
    score = clamp(100 - (v - 10) * 3.33)
    zone = "faible" if v < 15 else ("normale" if v < 22 else ("élevée" if v < 30 else "très élevée"))
    return score, (
        f"VIX à {v:.0f} → volatilité {zone}. Plus le VIX monte, plus ce sous-score baisse "
        f"(VIX 10 → 100 pts, VIX 40 → 0 pt)."
    )


def sentiment_score(market: MarketDataService) -> tuple[int, str, str]:
    fg = market.get_fear_greed()
    label_fr = {
        "Extreme Fear": "peur extrême",
        "Fear": "peur",
        "Neutral": "neutre",
        "Greed": "avidité",
        "Extreme Greed": "euphorie",
    }.get(fg.classification, fg.classification.lower() or "n/a")
    explanation = (
        f"Indice Fear & Greed crypto : {fg.value}/100 ({label_fr}). "
        "Attention : un sentiment extrême (dans un sens ou l'autre) est souvent un signal de prudence, "
        "pas une confirmation de tendance."
    )
    return clamp(fg.value), explanation, fg.source


def compute_pulse(market: MarketDataService, quotes: dict[str, Quote]) -> PulseOut:
    mom, mom_expl = momentum_score(quotes)
    vol, vol_expl = volatility_score(quotes)
    sent, sent_expl, sent_src = sentiment_score(market)

    quote_sources = ", ".join(sorted({q.source for q in quotes.values()})) or "n/a"
    subscores = [
        SubScore(key="momentum", name="Momentum (7 j)", score=mom,
                 weight=WEIGHTS["momentum"], explanation=mom_expl, source=quote_sources),
        SubScore(key="volatility", name="Volatilité (VIX)", score=vol,
                 weight=WEIGHTS["volatility"], explanation=vol_expl, source=quote_sources),
        SubScore(key="sentiment", name="Sentiment (crypto)", score=sent,
                 weight=WEIGHTS["sentiment"], explanation=sent_expl, source=sent_src),
    ]
    composite = clamp(sum(s.score * s.weight for s in subscores))

    if composite >= 65:
        label = "Plutôt favorable"
    elif composite >= 45:
        label = "Mitigé"
    elif composite >= 30:
        label = "Prudence"
    else:
        label = "Tendu"

    strongest = max(subscores, key=lambda s: s.score)
    weakest = min(subscores, key=lambda s: s.score)
    explanation = (
        f"Score {composite}/100 : moyenne pondérée de 3 sous-scores (momentum 40 %, volatilité 30 %, "
        f"sentiment 30 %). Point fort : {strongest.name.lower()} ({strongest.score}). "
        f"Point faible : {weakest.name.lower()} ({weakest.score}). "
        "Un score n'est jamais une raison suffisante d'agir — ouvre les sous-scores pour comprendre."
    )

    return PulseOut(
        score=composite,
        label=label,
        explanation=explanation,
        subscores=subscores,
        as_of=datetime.now(timezone.utc),
    )
