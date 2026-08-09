# 6. Pages et UX

> Cible : un débutant ouvre l'app sur son téléphone et comprend la situation en < 60 secondes,
> sans jamais être poussé à agir.

## 6.1 Principes UX (appliqués partout)

1. **Mobile-first** : navigation par barre inférieure (5 onglets max), le reste dans « Plus ».
2. **Divulgation progressive** : d'abord la conclusion en une phrase, puis les chiffres, puis les détails techniques — jamais l'inverse.
3. **Un feu de couleur n'est jamais seul** : chaque 🟢🟠🔴⚪ est accompagné d'une phrase d'explication et s'ouvre sur le détail du calcul. La couleur attire l'œil, le texte porte le sens.
4. **Parler en euros** : tout impact de risque est traduit dans la monnaie de TON portefeuille.
5. **Tooltips pédagogiques systématiques** : tout terme du glossaire est souligné en pointillés ; un appui affiche la définition simple + bouton « version 15 ans ».
6. **Source · horodatage** en petit sous chaque donnée importante.
7. **Étiquetage du contenu IA** : fond légèrement différent + mention « Résumé généré — peut contenir des interprétations ».
8. **Dark mode par défaut** (usage du soir), light mode disponible, choix mémorisé.
9. **Aucun dark pattern** : pas de rouge/vert clignotant, pas de compteur d'urgence, pas de notification « ça monte, achète ! ».

## 6.2 Navigation

```
Barre inférieure (mobile) :  [Dashboard] [Marchés] [Portefeuille] [Copilote] [Plus]
   "Plus" → Watchlist · Simulateur · Apprendre · (V2: Calendrier · Actualités · Journal)
Desktop : barre latérale avec les mêmes entrées, recherche universelle en haut.
```

## 6.3 Les pages du MVP

### 1. Dashboard (`/`)
```
┌─────────────────────────────────────┐
│  Salut 👋            [🔍] [🌙/☀️]   │
│  ─ Résumé du jour ────────────────  │
│  "Les actions montent, portées par  │
│   la tech. Bitcoin recule de 2 %.   │
│   À surveiller : décision Fed jeudi"│
│   ⓘ généré · sources · 09:41        │
│  ─ Market Pulse ──────────────────  │
│   [——●——····] 62/100  « Plutôt      │
│   favorable »   ▸ voir les 3 sous-  │
│   scores et pourquoi                │
│  ─ Marchés ───────────────────────  │
│  🟢 S&P 500      5 234   +0,8 % ▁▂▄▆│
│  🟢 Nasdaq       …                  │
│  🟠 Bitcoin      …       -2,1 %     │
│  ⚪ Or           …                  │
│  🔴 VIX          …      +15 %       │
│  (une tuile = prix, variation,      │
│   sparkline 7 j, feu + explication) │
└─────────────────────────────────────┘
```
- Objectif : réponses aux questions 1 (quoi), 2 (pourquoi, via résumé), 5 (normal/exceptionnel, via Pulse + VIX).

### 2. Marchés (`/marches`)
Liste complète par classe d'actifs (indices, crypto, métaux, énergie, forex, taux) avec tri et recherche. Chaque ligne ouvre la fiche actif.

### 3. Fiche actif (`/actif/[symbole]`)
- En-tête : nom, prix, variation, feu + phrase.
- Graphique interactif (1 s / 1 m / 1 an), volume.
- Bloc « Pourquoi ça bouge ? » : résumé généré à partir des données mesurées (étiqueté), distinguant *fait* (chiffres) et *interprétation*.
- Chiffres clés avec tooltips : volatilité 30 j, distance au plus haut 1 an (drawdown), tendance (au-dessus/en-dessous de la moyenne 50 j).
- Boutons : « ➕ Watchlist » · « 🧮 Simuler un achat » (→ simulateur pré-rempli).

### 4. Portefeuille (`/portefeuille`)
- Valeur totale, +/- value (€ et %), cash.
- Donut de répartition par classe d'actifs + liste des positions.
- **Carte des risques** : 4 tuiles en langage simple —
  concentration (« 45 % sur un seul actif 🔴 »), part crypto vs ta règle,
  volatilité estimée (« portefeuille plutôt nerveux »), perte en scénario -20 % actions (« ≈ -340 € »).
- Formulaire d'ajout de position en 4 champs (actif, quantité, prix, date).

### 5. Simulateur (`/simulateur`)
- « Si j'investis [200 €] sur [Bitcoin ▾] » → avant/après : allocation, concentration, part crypto, impact -10/-20/-30 % en euros, alerte si une de tes règles personnelles serait dépassée.
- Encadré permanent : « Ce sont des scénarios, pas des prédictions. »

### 6. Watchlist (`/watchlist`)
Tuiles des actifs suivis : prix, tendance 7 j, feu de risque, **ta raison de suivi** (saisie à l'ajout), bouton simuler.

### 7. Apprendre (`/apprendre`)
Glossaire ~30 termes, recherche, chaque fiche : définition simple → bouton « Explique-moi comme si j'avais 15 ans » → analogie concrète. (V2 : quiz, parcours.)

### 8. Copilote (`/assistant`)
- Chat avec suggestions de questions (« Pourquoi Bitcoin baisse ? », « Que risque mon portefeuille ? »).
- Chaque réponse liste ses sources (les données injectées) et ce qu'elle ne sait pas.
- Bandeau : « Le copilote explique, il ne recommande pas d'acheter ou de vendre. »
- Sans clé API configurée : message clair + le reste de l'app fonctionne normalement.

### Permanent (toutes pages)
Footer : « Outil d'information et d'apprentissage. Ceci n'est pas un conseil en investissement. Les performances passées ne préjugent pas des performances futures. » + lien « Comprendre les limites de cette app ».

Prochain document : [07 — Risques](07-risques.md)
