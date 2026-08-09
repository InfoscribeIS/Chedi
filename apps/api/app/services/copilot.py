"""AI copilot — a chat that ONLY comments on injected, measured data.

Guardrails (enforced here, not just hoped for):
- The model receives a fresh market snapshot + the user's portfolio metrics
  and is instructed to answer from that data only, stating uncertainty.
- System prompt forbids personalized buy/sell recommendations and promises.
- Output is capped; a tiny in-process rate limit protects the API budget.
- Without an API key the endpoint reports itself unavailable — the rest of
  the app works normally.
"""
import json
import threading
import time
from collections import deque

from sqlalchemy.orm import Session

from .. import models
from ..config import get_settings
from ..schemas import ChatMessage, CopilotOut, CopilotStatus
from .market import DASHBOARD_GROUPS
from .market_data import MarketDataService
from .pulse import compute_pulse
from .risk import allocation, build_rule_checks, value_positions

SYSTEM_PROMPT = """Tu es le copilote d'Invest Copilot, une app d'information et d'apprentissage \
pour un étudiant débutant en investissement (francophone).

RÈGLES ABSOLUES :
1. Tu réponds UNIQUEMENT à partir des DONNÉES fournies dans le contexte (snapshot marché, portefeuille). \
Tu ne connais pas l'actualité : ne cite jamais un événement, une annonce ou une cause que les données ne montrent pas. \
Si on te demande "pourquoi" un mouvement, décris ce que montrent les chiffres et propose des hypothèses génériques \
en les étiquetant clairement comme hypothèses.
2. Jamais de recommandation personnalisée d'achat ou de vente ("achète X", "vends Y", "c'est le moment de..."). \
Tu peux expliquer des concepts, décrire des risques, comparer des caractéristiques.
3. Jamais de promesse ou de projection de gain. Les performances passées ne préjugent pas des performances futures.
4. Dis explicitement quand tu ne sais pas ou quand les données sont insuffisantes ou anciennes.
5. Langage simple, réponses courtes (5-10 phrases max), pédagogiques. Explique les termes techniques.
6. Termine par une source quand tu cites un chiffre (ex: "(source : CoinGecko, il y a 2 min)").

Tu es un outil d'information : la décision et la responsabilité restent toujours à l'utilisateur."""


class RateLimiter:
    """Tiny fixed-window limiter — enough for a single-user local app."""

    def __init__(self, max_per_minute: int):
        self.max = max_per_minute
        self.hits: deque[float] = deque()
        self.lock = threading.Lock()

    def allow(self) -> bool:
        now = time.time()
        with self.lock:
            while self.hits and now - self.hits[0] > 60:
                self.hits.popleft()
            if len(self.hits) >= self.max:
                return False
            self.hits.append(now)
            return True


_limiter: RateLimiter | None = None


def get_limiter() -> RateLimiter:
    global _limiter
    if _limiter is None:
        _limiter = RateLimiter(get_settings().copilot_rate_limit_per_min)
    return _limiter


def status() -> CopilotStatus:
    settings = get_settings()
    if not settings.anthropic_api_key:
        return CopilotStatus(
            available=False,
            reason="Aucune clé API configurée (ANTHROPIC_API_KEY). Le reste de l'app fonctionne normalement.",
        )
    return CopilotStatus(available=True, model=settings.anthropic_copilot_model)


def _build_context(market: MarketDataService, db: Session) -> tuple[str, list[str]]:
    symbols = [s for _, syms in DASHBOARD_GROUPS for s in syms]
    quotes = market.get_quotes(symbols)
    pulse = compute_pulse(market, quotes)

    snapshot = {
        "marches": {
            sym: {
                "nom": market.asset(sym).name if market.asset(sym) else sym,
                "prix": q.price,
                "var_24h_pct": q.change_24h_pct,
                "var_7j_pct": q.change_7d_pct,
                "var_1an_pct": q.change_1y_pct,
                "source": q.source,
                "horodatage": q.as_of.isoformat() if q.as_of else None,
            }
            for sym, q in quotes.items()
        },
        "market_pulse": {
            "score": pulse.score,
            "label": pulse.label,
            "sous_scores": [{"nom": s.name, "score": s.score, "explication": s.explanation} for s in pulse.subscores],
        },
    }

    positions = db.query(models.Position).all()
    user = db.get(models.UserSettings, 1)
    if positions or (user and user.cash_eur):
        views = value_positions(positions, market)
        total = sum(v.value_eur for v in views) + (user.cash_eur if user else 0)
        snapshot["portefeuille"] = {
            "valeur_totale_eur": round(total, 2),
            "cash_eur": round(user.cash_eur, 2) if user else 0,
            "positions": [
                {"symbole": v.symbol, "nom": v.name, "classe": v.asset_class,
                 "valeur_eur": v.value_eur, "investi_eur": v.invested_eur}
                for v in views
            ],
            "repartition": [a.model_dump() for a in allocation(views, user.cash_eur if user else 0)],
            "regles_personnelles": [c.model_dump() for c in build_rule_checks(views, user.cash_eur if user else 0, user)]
            if user else [],
        }
    else:
        snapshot["portefeuille"] = "vide (aucune position saisie)"

    sources = sorted({q.source for q in quotes.values()})
    return json.dumps(snapshot, ensure_ascii=False, default=str), sources


def ask(message: str, history: list[ChatMessage], market: MarketDataService, db: Session) -> CopilotOut:
    settings = get_settings()
    import anthropic

    context, sources = _build_context(market, db)

    messages = [
        {"role": m.role, "content": m.content}
        for m in history
        if m.role in ("user", "assistant") and m.content.strip()
    ]
    messages.append({
        "role": "user",
        "content": (
            f"<donnees_mesurees>\n{context}\n</donnees_mesurees>\n\n"
            f"Question de l'utilisateur : {message}"
        ),
    })

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    response = client.messages.create(
        model=settings.anthropic_copilot_model,
        max_tokens=settings.copilot_max_tokens,
        system=SYSTEM_PROMPT,
        messages=messages,
    )
    answer = "".join(b.text for b in response.content if b.type == "text").strip()
    if not answer:
        answer = "Je n'ai pas pu formuler de réponse. Reformule ta question ?"

    return CopilotOut(answer=answer, sources=sources, model=settings.anthropic_copilot_model)
