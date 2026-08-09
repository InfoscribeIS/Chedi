# 1. Analyse du produit — Invest Copilot

> Rôle de ce document : regard de CTO sur l'idée, avant toute ligne de code.

## 1.1 L'idée en une phrase

**Un "copilote" qui transforme le bruit des marchés en informations compréhensibles par un débutant, et qui ralentit les mauvaises décisions au lieu d'accélérer les transactions.**

C'est un positionnement rare. La quasi-totalité des apps du marché (courtiers, trackers de portefeuille, apps de trading) sont conçues pour **augmenter** le nombre de transactions. Ton idée est conçue pour **augmenter la compréhension**. C'est ta force principale — il faut la protéger à chaque décision produit.

## 1.2 Forces de l'idée

1. **Positionnement clair et différenciant** : "comprendre avant d'agir" vs "trader plus". Le mode Anti-FOMO, le journal d'investissement et le simulateur *avant* investissement forment un trio que presque personne ne propose.
2. **Garde-fous pensés dès la conception** : tu as toi-même exigé sources, horodatage, incertitude affichée, pas de promesse de gain. C'est exactement ce qu'un produit financier sérieux doit faire, et c'est plus difficile à rajouter après coup qu'à intégrer dès le départ.
3. **Utilisateur = fondateur** : tu construis l'outil dont tu as besoin chaque semaine. Boucle de feedback immédiate, zéro étude de marché nécessaire pour la V1.
4. **La pédagogie comme moteur** : glossaire, "explique-moi comme si j'avais 15 ans", replay historique — l'app t'apprend à investir pendant que tu l'utilises. La valeur augmente avec le temps même si tu n'investis pas.
5. **Lucidité sur les limites** : tu demandes des sous-scores plutôt qu'un score unique, un score de qualité des données, la séparation FAIT / INTERPRÉTATION / RUMEUR. C'est mûr, et ça guide directement l'architecture (traçabilité des données de bout en bout).

## 1.3 Faiblesses et risques de l'idée

1. **Périmètre énorme.** Tes 20 modules représentent 18–36 mois de développement pour une personne seule. Le risque n°1 du projet n'est ni technique ni financier : c'est **l'abandon par épuisement**. Réponse : un MVP vertical très réduit (doc 02).
2. **Le coût des données, pas le coût du code.** Le code est gratuit ; les données temps réel de qualité coûtent cher (des centaines d'€/mois chez les fournisseurs sérieux). Réponse : accepter du différé 15 min / fin de journée pour le MVP — pour de l'investissement progressif (pas du trading), c'est largement suffisant, et il faut l'assumer dans l'UI.
3. **Dépendance au LLM sur un domaine à risque.** Un LLM peut halluciner une cause de baisse, un chiffre, une date. Réponse architecture : le LLM ne "sait" rien — il **commente uniquement des données qu'on lui injecte** (grounding), cite ses sources, et l'UI distingue toujours donnée mesurée / interprétation générée.
4. **Certaines features demandent des données difficiles ou chères** : sentiment multi-sources, détection d'anomalies, déduplication de news. Ce sont des projets à part entière → V3.
5. **Frontière réglementaire.** Une app qui dit "quels actifs méritent ton attention" flirte avec le conseil en investissement (activité réglementée AMF). Réponse : rester un outil d'**information générique et d'analyse de TON portefeuille**, jamais de recommandation personnalisée d'achat/vente (détail au doc 07).
6. **Le score unique reste un piège même avec des sous-scores.** Un chiffre 0–100 sera lu comme un feu vert/rouge quoi qu'on affiche autour. Réponse UI : le score n'est jamais cliquable vers une action, il s'ouvre toujours sur son explication.
7. **Concurrence indirecte grande publique** (Yahoo Finance, TradingView, apps courtiers). Assumé : la V1 est un outil personnel ; la différenciation (pédagogie FR + garde-fous + portefeuille) ne se joue pas sur la donnée brute.

## 1.4 Dix améliorations auxquelles tu n'as probablement pas pensé

1. **Règles personnelles d'investissement (contrat avec toi-même).** À l'onboarding : budget max, % crypto max, réserve intouchable, horizon. Chaque simulation est comparée à *tes* règles : "Cet achat porterait ta crypto à 34 % — ta règle est 20 %." C'est le garde-fou le plus puissant possible, et il est trivial à coder.
2. **Frais et fiscalité dans toutes les simulations.** Frais de courtage, TER des ETF, et la flat tax française (PFU 30 % sur les plus-values). Un débutant qui ignore les frais compare des rendements fictifs. Impact long terme visualisé (1 % de frais/an = ~25 % de capital en moins sur 30 ans).
3. **Benchmark automatique "Et si j'avais juste acheté un ETF Monde ?"** Chaque décision du journal est comparée a posteriori à un simple DCA sur MSCI World. C'est LA leçon que les études académiques répètent, transformée en feature.
4. **Le cash est une position.** Afficher le cash comme un actif avec son rendement (fonds euro / livret / monétaire ~2–3 %) et son érosion par l'inflation. "Ne rien faire" devient une décision visible et évaluable — anti-FOMO structurel.
5. **Parler en euros, pas en pourcentages.** "-20 % sur le Nasdaq" est abstrait ; "ton portefeuille perdrait environ 340 €" est concret. Tout le module risque doit convertir les % en € de TON portefeuille.
6. **Import CSV des courtiers (Trade Republic, Degiro, Binance…).** La saisie manuelle est la première cause d'abandon des trackers de portefeuille. Un import CSV est 10× plus simple qu'une connexion API broker et couvre 90 % du besoin.
7. **Digest hebdomadaire par défaut, temps réel sur opt-in.** L'hygiène attentionnelle est une feature : par défaut, l'app ne te sollicite qu'une fois par semaine. Cohérent avec ton rapport quotidien "5 infos max".
8. **Journal pré-rempli automatiquement.** Au moment où tu enregistres une décision, l'app capture seule le contexte (prix, RSI, VIX, pulse, top news). Six mois plus tard, la comparaison décision/réalité est riche sans effort de saisie.
9. **Score de compréhension avant achat.** Mini-checklist de 5 questions ("Sais-tu ce que contient cet ETF ? Peux-tu expliquer pourquoi il monterait ?"). Pas bloquant, juste un miroir. Buffett : "n'achète jamais ce que tu ne comprends pas" — transformé en UX.
10. **Mode dégradé transparent.** Quand une source est en panne ou en retard, l'app le dit ("cours d'il y a 3 h — Yahoo indisponible") au lieu d'afficher silencieusement des données périmées. Découle de ton score de qualité des données, mais érigé en principe systématique d'UI.

## 1.5 Verdict CTO

L'idée est **bonne et finançable en temps étudiant** à trois conditions :

- réduire le MVP à une tranche verticale utilisable en 4–6 semaines (doc 02) ;
- accepter des données différées/gratuites et l'afficher honnêtement ;
- verrouiller dès le premier commit les garde-fous (pas de recommandation personnalisée, sources + horodatage partout, LLM contraint aux données injectées).

Prochain document : [02 — Périmètre MVP / V2 / V3](02-perimetre-mvp.md)
