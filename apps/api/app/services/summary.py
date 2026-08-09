"""Daily market summary.

Two modes:
- rules  : deterministic French sentences computed from measured data — always
           available, zero cost, zero hallucination risk.
- Claude : nicer prose, but STRICTLY grounded — the model only receives the
           measured snapshot and must not invent numbers. Cached 15 min.

The UI labels both as generated content and lists the data sources.
"""
import threading
import time

from ..config import get_settings
from ..providers.base import Quote
from ..schemas import PulseOut, SummaryOut
from .market_data import MarketDataService

_cache_lock = threading.Lock()
_ai_cache: dict = {}  # {"text": str, "at": float}
AI_CACHE_TTL = 900  # seconds


def _fmt(q: Quote | None, name: str) -> str | None:
    if q is None or q.change_24h_pct is None:
        return None
    return f"{name} {q.change_24h_pct:+.1f} %"


def rule_based_summary(market: MarketDataService, quotes: dict[str, Quote], pulse: PulseOut) -> str:
    parts: list[str] = []

    eq = [quotes.get(s) for s in ("^GSPC", "^IXIC", "^STOXX50E")]
    eq_changes = [q.change_24h_pct for q in eq if q and q.change_24h_pct is not None]
    if eq_changes:
        avg = sum(eq_changes) / len(eq_changes)
        spx = quotes.get("^GSPC")
        detail = f" (S&P 500 {spx.change_24h_pct:+.1f} %)" if spx and spx.change_24h_pct is not None else ""
        if avg >= 0.4:
            parts.append(f"Les marchés actions progressent{detail}.")
        elif avg <= -0.4:
            parts.append(f"Les marchés actions reculent{detail}.")
        else:
            parts.append(f"Les marchés actions sont stables{detail}.")

    btc = quotes.get("BTC")
    if btc and btc.change_24h_pct is not None:
        verb = "progresse" if btc.change_24h_pct > 0.3 else ("recule" if btc.change_24h_pct < -0.3 else "est stable")
        parts.append(f"Bitcoin {verb} ({btc.change_24h_pct:+.1f} % sur 24 h, {btc.change_7d_pct:+.1f} % sur 7 j)."
                     if btc.change_7d_pct is not None else f"Bitcoin {verb} ({btc.change_24h_pct:+.1f} % sur 24 h).")

    vix = quotes.get("^VIX")
    if vix and vix.price is not None:
        if vix.price >= 25:
            parts.append(f"La volatilité est élevée (VIX à {vix.price:.0f}) : les investisseurs sont nerveux.")
        elif vix.price < 15:
            parts.append(f"La volatilité est faible (VIX à {vix.price:.0f}) : climat plutôt serein.")

    gold = quotes.get("GC=F")
    if gold and gold.change_24h_pct is not None and abs(gold.change_24h_pct) >= 1:
        direction = "monte" if gold.change_24h_pct > 0 else "baisse"
        parts.append(f"L'or {direction} de {abs(gold.change_24h_pct):.1f} % — souvent un signe de recherche de sécurité." if gold.change_24h_pct > 0
                     else f"L'or {direction} de {abs(gold.change_24h_pct):.1f} %.")

    parts.append(f"Market Pulse : {pulse.score}/100 ({pulse.label.lower()}).")
    return " ".join(parts)


def _snapshot_for_llm(quotes: dict[str, Quote], pulse: PulseOut) -> str:
    lines = []
    for sym, q in quotes.items():
        lines.append(
            f"{sym}: prix={q.price}, 24h={q.change_24h_pct}%, 7j={q.change_7d_pct}%, source={q.source}"
        )
    lines.append(f"MarketPulse={pulse.score}/100 ({pulse.label}); sous-scores=" +
                 ", ".join(f"{s.key}={s.score}" for s in pulse.subscores))
    return "\n".join(lines)


SUMMARY_SYSTEM = (
    "Tu écris le résumé du jour d'une app d'information financière pour un débutant francophone. "
    "Règles strictes : utilise UNIQUEMENT les données fournies (aucun chiffre, événement ou cause inventé). "
    "Si les données ne suffisent pas à expliquer un mouvement, dis-le. 3 phrases maximum, langage simple. "
    "Jamais de recommandation d'achat ou de vente, jamais de prédiction."
)


def ai_summary(market: MarketDataService, quotes: dict[str, Quote], pulse: PulseOut) -> str | None:
    settings = get_settings()
    if not settings.anthropic_api_key:
        return None

    with _cache_lock:
        cached = _ai_cache.get("data")
        if cached and time.time() - cached["at"] < AI_CACHE_TTL:
            return cached["text"]

    try:
        import anthropic

        client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
        response = client.messages.create(
            model=settings.anthropic_summary_model,
            max_tokens=400,
            system=SUMMARY_SYSTEM,
            messages=[{
                "role": "user",
                "content": "Données mesurées à l'instant :\n" + _snapshot_for_llm(quotes, pulse)
                           + "\n\nÉcris le résumé du jour.",
            }],
        )
        text = next((b.text for b in response.content if b.type == "text"), "").strip()
        if not text:
            return None
        with _cache_lock:
            _ai_cache["data"] = {"text": text, "at": time.time()}
        return text
    except Exception:
        # Any API failure degrades silently to the rule-based summary.
        return None


def build_summary(market: MarketDataService, quotes: dict[str, Quote], pulse: PulseOut) -> SummaryOut:
    from datetime import datetime, timezone

    settings = get_settings()
    sources = sorted({q.source for q in quotes.values()})

    text = ai_summary(market, quotes, pulse)
    if text is not None:
        return SummaryOut(
            text=text,
            generated_by=settings.anthropic_summary_model,
            is_ai=True,
            sources=sources,
            as_of=datetime.now(timezone.utc),
        )
    return SummaryOut(
        text=rule_based_summary(market, quotes, pulse),
        generated_by="règles déterministes (sans IA)",
        is_ai=False,
        sources=sources,
        as_of=datetime.now(timezone.utc),
    )
