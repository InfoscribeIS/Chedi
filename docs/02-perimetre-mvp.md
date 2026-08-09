# 2. Périmètre — MVP, V2, V3

> Principe de découpage : le MVP doit répondre chaque matin, en moins de 60 secondes, aux questions
> « Que se passe-t-il ? », « Quel est le risque ? », « Que deviendrait mon portefeuille si… ? »
> Tout le reste attend.

## 2.1 MVP (v0.x) — indispensable, objectif : utilisable par toi en 4–6 semaines

| # | Fonctionnalité (n° de ton cahier des charges) | Contenu retenu pour le MVP | Ce qu'on reporte volontairement |
|---|---|---|---|
| 1 | **Dashboard** (§1) | Indices US/EU/Asie, BTC/ETH, or, pétrole, EUR/USD, VIX, taux 10 ans US ; feux 🟢🟠🔴⚪ ; résumé du jour ; source + horodatage sur chaque tuile | Sentiment multi-sources, breadth avancé |
| 2 | **Market Pulse** (§2) | Score 0–100 avec **3 sous-scores transparents** (momentum, volatilité, sentiment crypto Fear & Greed) + explication en français des formules | Liquidité, corrélations, comportement investisseurs |
| 3 | **Fiche actif** (§3) | Prix, variations 24 h/7 j/1 m/1 an, graphique interactif, volatilité, volume, tendance simple, « pourquoi ça bouge » (résumé généré à partir des données, clairement étiqueté) | Fondamentaux détaillés, news par actif, corrélation au portefeuille |
| 4 | **Mode débutant** (§4) | Glossaire ~30 termes, chaque terme avec définition simple + version « comme si j'avais 15 ans », tooltips dans toute l'app | Quiz, parcours d'apprentissage |
| 5 | **Copilote IA** (§5) | Chat contraint : il reçoit les données du jour (snapshot marché + ton portefeuille) et ne commente que ça, avec sources et mentions d'incertitude. Sans clé API : réponses désactivées proprement | Recherche web, comparaison d'ETF, explication de news |
| 6 | **Portefeuille** (§6) | Saisie manuelle positions + cash ; valeur, +/- values, répartition par classe d'actif, concentration, part crypto, **carte des risques simple en euros** | Exposition sectorielle/géographique fine, devises, drawdown historique réel |
| 7 | **Simulateur avant investissement** (§7) | « Si j'investis X € sur Y » : nouvelle allocation, concentration, impact -10/-20/-30 % en €, vérification de tes règles personnelles | Scénarios corrélés multi-actifs |
| 8 | **Watchlist** (§19) | Actifs suivis + raison du suivi + tendance/risque | Alertes, prochaine date importante |
| — | **Garde-fous** | Disclaimer permanent, aucune recommandation d'achat/vente, source + horodatage sur toute donnée, mode démo sans clés API | — |

**Pourquoi ce périmètre :** chaque élément est soit une donnée qu'on sait obtenir gratuitement (doc 04), soit un calcul déterministe (simulateur, risque). Rien dans le MVP ne dépend d'une source de données coûteuse ni d'un modèle statistique fragile. C'est ce qui rend les 4–6 semaines réalistes.

## 2.2 V2 — utile, une fois le MVP utilisé quotidiennement pendant ≥ 1 mois

- **Calendrier financier** (§9) : décisions Fed/BCE, CPI, emploi, résultats — via API calendrier économique gratuite.
- **News Intelligence v1** (§11) : agrégation 2–3 flux RSS sérieux + résumé IA + étiquette FAIT / INTERPRÉTATION ; déduplication simple par similarité de titres.
- **Journal d'investissement** (§15) avec capture automatique du contexte marché.
- **Anti-FOMO** (§16) : détection « +X % en N jours » → écran de friction avec alternatives (attendre, fractionner, DCA).
- **Simulateur DCA** (§8) : tout de suite vs 3/6/12 mois, sur données historiques réelles.
- **Rapport quotidien** (§20) : « 5 infos max » généré et mis en cache 1×/jour (coût LLM maîtrisé).
- **Alertes v1** (§10) : seuils de prix et variations inhabituelles, notifications regroupées.
- **Authentification multi-utilisateur** + chiffrement des données portefeuille (le MVP est mono-utilisateur local).
- **Import CSV courtier** (amélioration n°6 du doc 01).
- Redis en cache partagé + PostgreSQL managé (le MVP tourne sur SQLite).

## 2.3 V3 — avancé, seulement si l'app a prouvé son utilité

- **Sentiment multi-sources** (§12) : agrégation réseaux sociaux/news avec l'indicateur euphorie/peur comparé aux données réelles.
- **Détection d'anomalies** (§13) : z-scores sur volume/volatilité, divergences prix-sentiment, corrélations inhabituelles.
- **Stress tests multi-scénarios** (§14) : chocs corrélés (récession, taux, crise géopolitique) avec matrices de corrélation historiques.
- **Replay historique** (§18) : nécessite un vrai jeu de données historiques (prix + news datées) — gros travail de données, immense valeur pédagogique.
- **Score de qualité des données complet** (§17) : le MVP affiche déjà source + fraîcheur ; la V3 ajoute contradictions entre sources et niveau de confiance.
- Notifications push, PWA/mobile natif, comparateur d'ETF, benchmark « ETF Monde » automatique.

## 2.4 Ce que l'app ne fera jamais (décisions produit fermes)

- Passer des ordres ou se connecter en écriture à un courtier.
- Émettre une recommandation personnalisée « achète / vends » (frontière réglementaire, doc 07).
- Promettre ou projeter un rendement (« tu gagnerais X € ») — seuls des **scénarios** symétriques (hausse ET baisse) sont montrés.
- Transformer un indicateur en signal automatique d'achat/vente.

Prochain document : [03 — Architecture technique](03-architecture.md)
