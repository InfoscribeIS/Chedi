# 🦉 Invest Copilote

> **Analyser · Comprendre · Investir** — le copilote des débutants en investissement.

Invest Copilote transforme le bruit des marchés (actions, ETF, indices, crypto, or, pétrole,
taux, devises) en informations simples pour un débutant : que se passe-t-il, pourquoi, quel est
le risque, et que deviendrait **mon** portefeuille si… ?

⚠️ **Outil d'information et d'apprentissage. Ceci n'est pas un conseil en investissement.**
L'app n'émet jamais de recommandation d'achat/vente et ne promet jamais de rendement.

## Ce que fait le MVP (v0.1)

- **Dashboard** : indices US/EU/Asie, BTC/ETH, or, pétrole, EUR/USD, VIX, taux 10 ans — avec
  feux 🟢🟠🔴⚪ *toujours accompagnés d'une explication*, sparklines 7 j, source + horodatage
  sur chaque donnée, et résumé du jour (par règles, ou par Claude si une clé API est fournie).
- **Market Pulse** : score 0-100 décomposé en 3 sous-scores transparents (momentum, volatilité
  VIX, sentiment crypto Fear & Greed), chaque formule expliquée en français.
- **Fiche actif** : graphique interactif (TradingView Lightweight Charts), variations 24 h → 1 an,
  volatilité, distance au plus haut, tendance, et bloc « Pourquoi ça bouge ? » qui sépare
  **faits mesurés** et **interprétation**.
- **Portefeuille** : saisie manuelle, valorisation en €, répartition (donut), **carte des risques
  en euros** (concentration, part crypto, volatilité estimée, scénario de choc) et **règles
  personnelles** (crypto max %, position max %, réserve intouchable).
- **Simulateur avant investissement** : « si j'investis 200 € sur X » → avant/après, scénarios
  -10/-20/-30 % en euros, vérification de tes règles.
- **Watchlist** avec la *raison* du suivi.
- **Apprendre** : glossaire FR (~28 termes) avec mode « Explique-moi comme si j'avais 15 ans »,
  accessible partout via les termes soulignés.
- **Copilote IA** (optionnel) : chat Claude strictement limité aux données mesurées par l'app,
  qui cite ses sources et ne recommande jamais d'acheter/vendre. Sans clé API, le reste de
  l'app fonctionne normalement.
- **Mode démo intégral** : sans réseau ni clé, l'app tourne sur des données fictives réalistes,
  clairement étiquetées.

La vision complète (V2 : calendrier, news, journal, anti-FOMO… V3 : sentiment, anomalies,
replay) est documentée dans [`docs/`](docs/) — analyse produit, architecture, comparatif
d'APIs, modèle de données, risques et roadmap.

## Démarrage rapide

Prérequis : Python ≥ 3.11, Node ≥ 20.

```bash
# 1. Backend (port 8000)
cd apps/api
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/uvicorn app.main:app --reload
# → http://localhost:8000/docs (Swagger)

# 2. Frontend (port 3000) — autre terminal
cd apps/web
npm install
npm run dev
# → http://localhost:3000
```

Sans configuration, l'app essaie les sources réelles (CoinGecko, Yahoo, alternative.me) et
bascule automatiquement en données démo si elles sont injoignables.

### Configuration (optionnelle) — `apps/api/.env`

```bash
cp apps/api/.env.example apps/api/.env
```

| Variable | Défaut | Rôle |
|---|---|---|
| `DATA_MODE` | `auto` | `auto` (réel + repli démo), `demo` (hors-ligne), `live` (réel strict) |
| `ANTHROPIC_API_KEY` | *(vide)* | Active le résumé IA et le copilote. Sans clé : résumés par règles, copilote désactivé proprement |
| `ANTHROPIC_COPILOT_MODEL` | `claude-sonnet-5` | Modèle du chat (passer à `claude-opus-5` pour la qualité maximale) |
| `ANTHROPIC_SUMMARY_MODEL` | `claude-haiku-4-5` | Modèle des résumés (économique, mis en cache 15 min) |
| `DATABASE_URL` | `sqlite:///./investcopilot.db` | SQLite en dev ; une URL PostgreSQL suffit pour migrer |

Les clés API ne quittent **jamais** le serveur : le frontend ne parle qu'à l'API locale.

### Tests

```bash
cd apps/api && .venv/bin/python -m pytest        # 21 tests (calculs financiers + API, hors-ligne)
cd apps/web && npm run build                     # type-check + build
```

## Structure

```
apps/api   FastAPI — couche fournisseurs de données (CoinGecko/Yahoo/F&G/démo, interchangeables),
           services (pulse, risque, simulateur, résumé, copilote), SQLite/SQLAlchemy
apps/web   Next.js 16 + Tailwind 4 — thème clair/sombre dérivé du logo, palette dataviz validée
docs/      Analyse CTO : produit, périmètre MVP/V2/V3, architecture, APIs, données, risques, roadmap
```

## Crédits données

Données de marché : [CoinGecko](https://www.coingecko.com), Yahoo Finance (endpoint non
officiel, usage personnel), [alternative.me](https://alternative.me/crypto/fear-and-greed-index/)
(Crypto Fear & Greed). Graphiques : [TradingView Lightweight Charts](https://github.com/tradingview/lightweight-charts).
Les tiers gratuits imposent des limites et interdisent la redistribution — voir
[`docs/04-apis-donnees.md`](docs/04-apis-donnees.md) avant toute mise en ligne publique.
