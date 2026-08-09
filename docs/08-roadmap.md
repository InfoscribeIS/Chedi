# 8. Roadmap et difficulté

> Estimations pour un étudiant en temps partiel (~10–12 h/semaine).
> Difficulté : ★☆☆☆☆ (facile) → ★★★★★ (difficile).

## Phase 0 — Fondations *(1 semaine · ★★☆☆☆)*
- Monorepo, FastAPI + Next.js branchés, couche fournisseurs avec mode démo, CI basique.
- **Livrable : l'app tourne de bout en bout avec des données démo.**
- *Risque principal : sur-ingénierie. Antidote : aucune feature, juste le squelette.*

## Phase 1 — Voir les marchés *(2 semaines · ★★★☆☆)*
- Fournisseurs CoinGecko + Yahoo réels, cache TTL, dashboard complet (tuiles, feux, sparklines), page Marchés, fiche actif avec graphique, recherche dans l'univers d'actifs.
- **Livrable : tu ouvres l'app le matin et tu vois l'état réel des marchés.**
- *Difficulté cachée : normaliser les données (fuseaux, jours fériés, crypto 24/7).* 

## Phase 2 — Comprendre *(1,5 semaine · ★★★☆☆)*
- Market Pulse (3 sous-scores + explications), résumé du jour (règles déterministes, puis Claude si clé), glossaire + tooltips, page Apprendre.
- **Livrable : l'app répond à « que se passe-t-il et pourquoi ? »**

## Phase 3 — Mon argent *(2 semaines · ★★★☆☆)*
- Portefeuille (CRUD positions + cash), valorisation temps réel, répartition, carte des risques en euros, règles personnelles, simulateur avant investissement, watchlist avec raisons.
- **Livrable : l'app répond à « que deviendrait MON portefeuille si… ? »**
- *Difficulté cachée : les calculs multi-devises. Tests unitaires obligatoires ici.*

## Phase 4 — Copilote IA *(1 semaine · ★★★☆☆)*
- Endpoint copilote avec grounding strict (snapshot marché + portefeuille injectés), garde-fous dans le system prompt, UI de chat avec sources, gestion « sans clé ».
- **Livrable : le MVP complet du doc 02.** 🎉

## Phase 5 — Consolidation *(1 semaine · ★★☆☆☆)*
- Tests des calculs financiers, polissage mobile, dark/light, déploiement (Vercel + Railway), sauvegarde de la base.
- **Livrable : l'app utilisable tous les jours depuis ton téléphone.**

**Total MVP : ~8–9 semaines calendaires en temps partiel.**

## Ensuite — V2 par tranches indépendantes (ordre conseillé)
| Tranche | Durée | Difficulté | Remarque |
|---|---|---|---|
| Journal d'investissement + capture de contexte | 1 sem. | ★★☆☆☆ | Valeur pédagogique énorme pour l'effort |
| Calendrier économique | 1 sem. | ★★☆☆☆ | Dépend d'une API gratuite (doc 04) |
| Simulateur DCA (historique réel) | 1 sem. | ★★★☆☆ | Réutilise le cache de chandelles |
| Rapport quotidien + digest | 1 sem. | ★★☆☆☆ | Cache LLM 1/jour |
| Anti-FOMO | 0,5 sem. | ★★☆☆☆ | Règle « +X % en N jours » + écran de friction |
| News v1 (RSS + résumé + FAIT/INTERPRÉTATION) | 2 sem. | ★★★★☆ | La déduplication est le morceau dur |
| Alertes v1 | 1,5 sem. | ★★★☆☆ | Nécessite un scheduler fiable |
| Auth + multi-utilisateur + Postgres/Redis | 2 sem. | ★★★★☆ | Uniquement si ouverture au public |

## V3 — chantiers (chacun = un mini-projet)
Sentiment multi-sources (★★★★★), anomalies statistiques (★★★★☆), stress tests corrélés (★★★★☆), replay historique (★★★★★ — surtout un problème de données), PWA/notifications (★★★☆☆).

## Règles de pilotage
1. **Une phase n'est finie que si tu l'utilises réellement.** Sinon, on la corrige avant d'avancer.
2. **Jamais deux phases en parallèle.**
3. À chaque fin de phase : 30 min de rétro — qu'est-ce qui manque VRAIMENT ? (souvent différent du plan).
4. Le passage V2 → V3 exige : 3 mois d'usage quotidien + au moins 1 décision réelle éclairée par l'app.
