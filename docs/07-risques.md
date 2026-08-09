# 7. Risques — techniques, financiers, réglementaires

## 7.1 Risques techniques

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| **Casse d'une API gratuite** (Yahoo non officiel, changements CoinGecko) | Élevée à 12 mois | Données absentes | Couche fournisseurs interchangeable + chaîne de fallback + mode dégradé transparent (« données d'il y a 3 h ») + mode démo |
| **Rate limits dépassés** (CoinGecko ~30 req/min, etc.) | Élevée sans cache | Blocage temporaire | Cache TTL 60–300 s, refresh planifié plutôt qu'à chaque visite, regroupement des requêtes (1 appel pour N actifs) |
| **Hallucinations du LLM** (cause de baisse inventée, chiffre faux) | Certaine sans garde-fous | Perte de confiance, mauvaise décision | Grounding strict (le LLM ne commente que les données injectées), chiffres UI jamais issus du texte LLM, étiquetage « interprétation », température basse, phrase d'incertitude imposée |
| **Coût LLM qui dérape** | Moyenne | Facture surprise | Résumés mis en cache (1/jour + 1/refresh manuel), plafond de tokens, modèle économique (Haiku) pour les résumés, budget alerté chez le fournisseur |
| **Données historiques incomplètes** (week-ends crypto vs bourse fermée, jours fériés) | Certaine | Graphiques faux, % erronés | Normalisation par classe d'actifs dans la couche fournisseurs, tests unitaires sur les calculs de variation |
| **Fuseaux horaires / horodatage** | Élevée | « Variation 24 h » fausse | Tout en UTC côté serveur, conversion à l'affichage uniquement |
| **Dette du projet solo** (pas de review) | Élevée | Ralentissement progressif | Tests sur les calculs financiers (simulateur, risque, pulse) dès le MVP, CI simple, typage strict des deux côtés |

## 7.2 Risques financiers (coûts du projet)

| Poste | MVP | V2 (public, ~100 utilisateurs) |
|---|---|---|
| Données de marché | 0 € (tiers gratuits + différé) | 0–50 €/mois si passage à un tier payant (Twelve Data/Finnhub) |
| LLM | 0 € (sans clé) à ~5 €/mois (usage perso) | 10–50 €/mois (cache agressif indispensable) |
| Hébergement | 0 € (local) / 0–5 €/mois (Vercel free + Railway hobby) | 10–25 €/mois (Postgres managé + Redis) |
| Domaine | ~10 €/an | idem |
| **Total** | **≈ 0–6 €/mois** | **≈ 20–125 €/mois** |

Règle de pilotage : **aucune dépense récurrente tant que l'app n'est pas utilisée chaque semaine.** Chaque passage payant doit être déclenché par une limite réellement atteinte, jamais « au cas où ».

## 7.3 Risques réglementaires (France / UE) — à prendre au sérieux

⚠️ *Analyse de CTO, pas un avis juridique.*

1. **Conseil en investissement (MiFID II / AMF).** Fournir des **recommandations personnalisées** (« au vu de ton profil, achète X ») est une activité réglementée (CIF/PSI). Tant que l'app fournit de l'**information générale**, des **analyses de ton propre portefeuille** et des **outils de calcul**, sans recommandation personnalisée d'opération sur un instrument précis, elle reste un outil d'information. C'est LA raison pour laquelle : pas de « achète/vends », pas de liste « les 5 actions à acheter ce mois-ci », le copilote explique mais ne prescrit pas, et le simulateur montre des scénarios symétriques (baisse ET hausse).
2. **Usage strictement personnel d'abord.** Tant que tu es le seul utilisateur, le risque est quasi nul. Le jour où l'app devient publique (V2+), il faudra : mentions légales, disclaimers renforcés, relecture des formulations par un juriste (des cliniques juridiques universitaires font ça gratuitement), et vigilance accrue sur tout ce qui ressemble à une incitation.
3. **Licences des données.** La plupart des APIs gratuites interdisent la **redistribution publique** des données (Yahoo non officiel est le cas extrême : toléré en usage personnel, à remplacer avant toute mise en ligne publique). Le doc 04 note les restrictions par fournisseur ; la couche d'abstraction rend le remplacement peu coûteux.
4. **RGPD.** Le MVP mono-utilisateur local ne traite aucune donnée de tiers. En V2 multi-utilisateurs : registre simple, chiffrement au repos des portefeuilles, droit à l'export/suppression (l'export CSV prévu y répond déjà en partie).
5. **Crypto (MiCA).** Informer sur les cours ne pose pas de problème ; il faudra éviter tout ce qui ressemble à de la promotion d'actifs crypto spécifiques auprès du public.

## 7.4 Risque comportemental (le plus important pour TOI)

L'app peut échouer en réussissant : si elle te fait regarder les marchés 2 h/jour, elle a raté sa mission. Contre-mesures produit intégrées : rapport quotidien « 5 infos max », digest hebdo par défaut, anti-FOMO, journal qui confronte tes décisions à la réalité, benchmark « ETF Monde » (V2/V3) qui rappelle qu'un DCA passif bat la plupart des stratégies actives. **Le succès de l'app se mesure à la qualité de tes décisions, pas au temps passé dedans.**

Prochain document : [08 — Roadmap](08-roadmap.md)
