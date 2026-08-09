# 4. APIs et sources de données

> Tarifs et limites **vérifiés le 09/08/2026** (pages officielles + sources croisées ; les points
> incertains sont marqués *non vérifié*). Les conditions des APIs changent souvent : re-vérifier
> avant tout passage en production publique.

## 4.1 Comparatif par fournisseur

| Fournisseur | Données | Fraîcheur | Tier gratuit | 1er prix payant | Licence (points clés) | Verdict MVP étudiant |
|---|---|---|---|---|---|---|
| **CoinGecko** (Demo) | Crypto : prix, market cap, OHLC, historique | ~1 min | 30 req/min · 10 000/mois (clé gratuite) | 35 $/mois | Attribution obligatoire ; pas de redistribution | **Fort** — couvre toute la crypto du MVP avec cache 60 s |
| **Finnhub** | Quotes US temps réel, news sociétés, earnings calendar US | Temps réel (US) | **60 req/min** | ~12–100 $/mois *(non vérifié)* | Free = personnel/non commercial ; endpoints parfois migrés vers premium | **Fort** — le free tier le plus généreux pour les actions US |
| **Twelve Data** | Actions/ETF US, forex, crypto, indicateurs | Temps réel (US) | 8 crédits/min · 800/jour | 79 $/mois | Personnel, non-commercial | **Fort** — API très propre, bon 2ᵉ pilier |
| **Stooq** | EOD monde : indices, actions, or (XAUUSD), forex, matières premières | Fin de journée | CSV sans clé, quota informel journalier | — | Conditions floues *(non vérifié)* — prudence sur la republication | **Fort** — meilleure source 0 € pour indices mondiaux + or en EOD (1 téléchargement/jour + cache) |
| **FRED** (Fed St. Louis) | Macro US/international : inflation, taux, chômage, PIB | Dates de publication officielles | 120 req/min, pas de payant | — | Libre avec attribution (qq séries tierces restreintes) | **Fort** — incontournable, illimité en pratique |
| **alternative.me** | Crypto Fear & Greed (0–100) | 1×/jour | Sans clé, pas de limite publiée | — | Attribution affichée à côté de la donnée | **Fort** — sous-score sentiment gratuit |
| **Frankfurter / BCE** | Taux de change de référence (BCE, ~200 devises) | 1 fixing/jour (~16 h CET) | Sans clé, illimité (anti-abus) | — | Libre, open source | **Fort** — parfait pour les conversions EUR |
| **Yahoo Finance** (non officiel, `yfinance` v1.5.2 ou endpoint chart) | Tout : actions monde, indices, ETF, forex, or, historique | Temps réel/différé selon place | Gratuit, sans quota officiel | — | ToS Yahoo : usage perso toléré, redistribution exclue ; blocages 429 récurrents depuis les IP cloud | **Moyen** — idéal en dev et pour l'historique, **risqué en production** → toujours derrière notre couche d'abstraction avec fallback |
| **FMP** | Fondamentaux : bilans, ratios, profils (US surtout) | EOD en gratuit | 250 req/jour | ~19–29 $/mois | Perso ; redistribution interdite ; qualité à croiser | **Fort** (pour la V2 fondamentaux) |
| **Massive** (ex-Polygon.io, renommé 10/2025) | Actions US | EOD en gratuit | 5 req/min, EOD, 2 ans | 29 $/mois (différé 15 min, illimité) | Individuel uniquement | **Faible en gratuit** ; 1er upgrade payant intéressant |
| **Alpha Vantage** | Actions/forex/crypto, fondamentaux | EOD/différé en gratuit | **25 req/jour** | 49,99 $/mois | Perso ; quotas élargis possibles pour projets éducatifs | **Faible** — quota trop bas pour de l'interactif |
| **Tiingo** | EOD US propre, IEX intraday | EOD/IEX | 1 000 req/jour · 50/h | 30 $/mois | ⚠️ Free = « internal use only » : interdit d'**afficher** les données à des tiers | **Moyen** — disqualifié pour un front public, OK backtests perso |
| **Marketaux** | News finance taguées par ticker + sentiment | Délai free *(non vérifié)* | 100 req/jour (3 articles/req) | 24 $/mois | Standard | **Fort** pour News v1 (V2) |
| **NewsData.io** | News volume (2 000 articles/jour) | **Différé 12 h** | 200 crédits/jour | 199,99 $/mois | Commercial OK en free | **Moyen** — volume mais retard important |
| **CryptoPanic** | News crypto agrégées | Quasi temps réel | API v2 dev limitée + RSS ; limites exactes *(non vérifié)* | *(non vérifié)* | Attribution historique exigée | **Moyen** — RSS en secours |
| **metals.dev / GoldAPI** | Or/argent spot | Temps réel | ~100 req/mois | dès 1,49 $/mois | Standard | **Moyen** — utile seulement si or « live » requis ; sinon Stooq EOD suffit |

## 4.2 Calendrier économique gratuit (pour la V2)

1. **Flux JSON ForexFactory** (`nfs.faireconomy.media/ff_calendar_thisweek.json`) — testé fonctionnel le 09/08/2026 : événements de la semaine (CPI, PIB, décisions de taux) avec niveau d'impact, prévision, valeur précédente. Gratuit sans clé ; non officiel ; fenêtre glissante d'une semaine → archiver chaque semaine.
2. **Finnhub earnings calendar US** — gratuit (60 req/min) pour les dates de résultats.
3. **Dates FOMC/BCE codées en dur** — 8 réunions/an publiées à l'avance sur les sites officiels : zéro dépendance.
4. **FRED release calendar** — dates officielles des publications macro US.

## 4.3 Stack retenue pour le MVP (0 €/mois)

| Besoin du MVP | Source principale | Fallback |
|---|---|---|
| Crypto (BTC, ETH, top caps) | CoinGecko Demo (cache 120 s) | Mode démo |
| Indices, or, pétrole, EUR/USD, VIX, taux 10 ans, actions, ETF | Yahoo chart endpoint (cache 120 s) | Stooq EOD (V1.1) → mode démo |
| Sentiment crypto | alternative.me F&G (cache 1 h) | Mode démo |
| Conversion EUR | Cours EUR/USD ci-dessus | Frankfurter |
| Résumés / copilote | Claude API (optionnel, clé serveur) | Résumés déterministes par règles |

**Pourquoi ce choix** : zéro coût, zéro engagement, et chaque brique est remplaçable en écrivant un seul fichier grâce à la couche d'abstraction (doc 03). Le jour où Yahoo bloque nos IP : on écrit `stooq.py` (~80 lignes) et l'app continue en EOD — dégradation acceptable pour de l'investissement progressif.

**Trajectoire d'upgrade si l'app devient sérieuse** :
1. *0 €* : stack ci-dessus (MVP, usage perso).
2. *~0 €* : + Finnhub free (actions US temps réel) + FMP free (fondamentaux) + Marketaux free (news) — V2.
3. *~29 $/mois* : Massive Stocks Starter **ou** FMP Starter, le jour où (a) une limite gratuite est réellement atteinte, ou (b) l'app devient publique (obligation de sortir des tiers « usage personnel »).

## 4.4 Règles de licence à respecter (même en projet étudiant)

- Afficher les attributions exigées : « Data by CoinGecko », attribution alternative.me à côté du Fear & Greed.
- Ne jamais proposer d'export/redistribution des données brutes des fournisseurs.
- Yahoo non officiel et Tiingo free : usage strictement personnel — à remplacer **avant** toute mise en ligne publique.
- Les tiers « personal use » (Finnhub, Twelve Data, FMP) devront être revus si l'app est ouverte à d'autres utilisateurs.
