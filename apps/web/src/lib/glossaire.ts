/** Glossaire pédagogique — contenu éditorial versionné dans le repo. */

export interface TermeGlossaire {
  id: string;
  terme: string;
  categorie: string;
  simple: string;
  quinze: string; // « Explique-moi comme si j'avais 15 ans »
  important: string; // pourquoi ça compte pour un débutant
}

export const GLOSSAIRE: TermeGlossaire[] = [
  {
    id: "action",
    terme: "Action",
    categorie: "Bases",
    simple:
      "Une part de propriété d'une entreprise. En achetant une action Apple, tu deviens copropriétaire d'une (minuscule) partie d'Apple.",
    quinze:
      "Imagine qu'une pizzeria se découpe en 1 000 parts pour financer un nouveau four. Tu achètes une part : si la pizzeria cartonne, ta part vaut plus cher ; si elle coule, ta part ne vaut plus rien.",
    important:
      "C'est la brique de base de la bourse. Le prix d'une action reflète ce que les investisseurs pensent de l'avenir de l'entreprise — pas seulement son présent.",
  },
  {
    id: "etf",
    terme: "ETF (tracker)",
    categorie: "Bases",
    simple:
      "Un panier d'actions (parfois des centaines) acheté en une seule fois. Un ETF « Monde » contient ~1 500 entreprises de nombreux pays.",
    quinze:
      "Au lieu de parier sur UN cheval, tu paries un peu sur tous les chevaux de la course en achetant un seul ticket. Tu gagnes moins si un cheval explose les records, mais tu ne perds pas tout si l'un d'eux trébuche.",
    important:
      "C'est l'outil de diversification le plus simple et le moins cher qui existe. La majorité des investisseurs particuliers feraient mieux avec un ETF diversifié qu'en choisissant des actions une par une.",
  },
  {
    id: "indice",
    terme: "Indice (S&P 500, CAC 40…)",
    categorie: "Bases",
    simple:
      "Un thermomètre qui mesure la santé d'un groupe d'actions. Le S&P 500 suit les 500 plus grandes entreprises américaines, le CAC 40 les 40 plus grandes françaises.",
    quinze:
      "C'est comme la moyenne générale d'une classe : elle résume en un chiffre le niveau de tous les élèves. Un élève peut avoir 18 pendant que la moyenne baisse.",
    important:
      "Quand on dit « la bourse monte », on parle en réalité d'un indice. On ne peut pas acheter un indice directement — mais un ETF qui le réplique, oui.",
  },
  {
    id: "obligation",
    terme: "Obligation",
    categorie: "Bases",
    simple:
      "Un prêt que tu fais à un État ou une entreprise, remboursé à une date fixée, avec des intérêts réguliers.",
    quinze:
      "Tu prêtes 100 € à ton oncle qui promet de te rendre 100 € dans 5 ans plus 3 € par an d'intérêts. C'est moins excitant que la pizzeria, mais plus prévisible.",
    important:
      "Les obligations sont considérées moins risquées que les actions. Quand les taux d'intérêt montent, la valeur des obligations existantes baisse — c'est le lien clé avec le reste du marché.",
  },
  {
    id: "market-cap",
    terme: "Capitalisation boursière (market cap)",
    categorie: "Bases",
    simple:
      "La valeur totale d'une entreprise en bourse : prix de l'action × nombre d'actions. Apple ≈ 3 000 milliards $, une petite biotech ≈ 100 millions $.",
    quinze:
      "Si une part de la pizzeria vaut 10 € et qu'il y a 1 000 parts, la pizzeria entière « vaut » 10 000 €.",
    important:
      "Elle donne l'échelle : +5 % sur une méga-cap est un événement énorme, +5 % sur une micro-cap arrive tous les jours. En crypto, la market cap aide à comparer les projets entre eux.",
  },
  {
    id: "volatilite",
    terme: "Volatilité",
    categorie: "Risque",
    simple:
      "L'ampleur des variations d'un actif. Une action qui bouge de ±0,5 % par jour est peu volatile ; le Bitcoin, qui peut bouger de ±5 %, est très volatil.",
    quinze:
      "C'est la différence entre un grand-huit et un télésiège : les deux montent, mais pas avec les mêmes secousses. Plus c'est secoué, plus tu peux gagner ou perdre vite.",
    important:
      "La volatilité mesure le risque le plus concret pour toi : de combien ton portefeuille peut chuter pendant que tu dors. Elle se paie en stress — dimensionne tes positions en fonction.",
  },
  {
    id: "vix",
    terme: "VIX (indice de la peur)",
    categorie: "Risque",
    simple:
      "Un indicateur de la nervosité attendue sur les actions américaines. Sous 15 : calme. 15-25 : normal à tendu. Au-dessus de 30 : stress important.",
    quinze:
      "C'est la météo marine des marchés : mer calme, agitée ou tempête. Les marins expérimentés consultent la météo avant de sortir — pas pour prédire, pour se préparer.",
    important:
      "Le VIX aide à répondre à « est-ce une situation normale ou exceptionnelle ? ». Un VIX élevé signifie des mouvements amples dans les DEUX sens.",
  },
  {
    id: "drawdown",
    terme: "Drawdown",
    categorie: "Risque",
    simple:
      "La baisse depuis le plus haut atteint. Si ton portefeuille est passé de 1 000 € à 800 €, tu vis un drawdown de -20 %.",
    quinze:
      "Tu avais 20/20 de moyenne, tu es à 16 : ta « chute depuis le sommet » est de 4 points, même si 16 reste correct. Ce qui compte, c'est ce que ça te fait de voir la baisse.",
    important:
      "Presque tous les investissements connaissent des drawdowns de -10 à -50 %. Savoir combien tu peux encaisser SANS vendre en panique est LA question à te poser avant d'investir.",
  },
  {
    id: "diversification",
    terme: "Diversification",
    categorie: "Risque",
    simple:
      "Répartir son argent entre plusieurs actifs, secteurs et zones géographiques pour qu'un seul problème ne coule pas tout le portefeuille.",
    quinze:
      "Ne mets pas tous tes œufs dans le même panier : si tu trébuches avec LE panier, tu perds tout. Avec cinq paniers, tu fais une omelette avec un seul.",
    important:
      "C'est la seule protection « gratuite » en finance : à rendement espéré égal, elle réduit le risque. Ta règle « max X % par position » dans l'app vient de là.",
  },
  {
    id: "correlation",
    terme: "Corrélation",
    categorie: "Risque",
    simple:
      "La tendance de deux actifs à bouger ensemble. Actions US et actions européennes : très corrélées. Actions et or : peu corrélés.",
    quinze:
      "Deux copains toujours d'accord = corrélés. Avoir dix copains qui pensent pareil, c'est comme n'avoir qu'un seul avis — dix actions très corrélées, c'est presque une seule position.",
    important:
      "Détenir 5 actifs qui chutent ensemble n'est PAS de la diversification. En crise, beaucoup de corrélations montent d'un coup — c'est le piège classique.",
  },
  {
    id: "liquidite",
    terme: "Liquidité",
    categorie: "Risque",
    simple:
      "La facilité à acheter ou vendre un actif rapidement sans faire bouger son prix. Apple : très liquide. Une petite crypto : parfois illiquide.",
    quinze:
      "Vendre un billet de concert connu, c'est instantané. Vendre une figurine rare, tu peux attendre des semaines ou brader le prix. La liquidité, c'est ça.",
    important:
      "Un actif illiquide peut être impossible à vendre au prix affiché, surtout en panique — exactement au moment où tu voudrais sortir.",
  },
  {
    id: "per",
    terme: "PER (price/earnings)",
    categorie: "Analyse",
    simple:
      "Le prix de l'action divisé par le bénéfice annuel par action. Un PER de 20 = tu paies 20 ans de bénéfices actuels.",
    quinze:
      "La pizzeria gagne 1 000 €/an et se vend 20 000 € : tu paies « 20 ans de pizzas ». Cher ou pas ? Ça dépend si elle va vendre plus de pizzas demain.",
    important:
      "Le PER aide à comparer des entreprises semblables. Un PER élevé n'est pas « mauvais » : il dit que le marché attend une forte croissance — et qu'il sera déçu si elle ne vient pas.",
  },
  {
    id: "dividende",
    terme: "Dividende",
    categorie: "Analyse",
    simple:
      "La part des bénéfices qu'une entreprise verse en cash à ses actionnaires, souvent chaque trimestre ou chaque année.",
    quinze:
      "La pizzeria a bien marché cette année : chaque détenteur de part reçoit 50 centimes. Tu peux les dépenser… ou racheter d'autres parts avec.",
    important:
      "Réinvestis, les dividendes composent : une grosse partie de la performance long terme des actions vient de là. Les ETF « capitalisants » (acc) le font automatiquement.",
  },
  {
    id: "volume",
    terme: "Volume",
    categorie: "Analyse",
    simple:
      "La quantité d'un actif échangée sur une période. Un volume inhabituel signale que quelque chose attire l'attention.",
    quinze:
      "C'est le nombre de personnes qui font la queue devant la boutique aujourd'hui. Une file soudaine devant une boutique d'habitude vide, ça interpelle.",
    important:
      "Un mouvement de prix avec gros volume est plus « sérieux » qu'un mouvement sans volume. C'est un des ingrédients de la détection d'anomalies.",
  },
  {
    id: "rsi",
    terme: "RSI",
    categorie: "Analyse technique",
    simple:
      "Un indicateur de 0 à 100 qui mesure la vitesse récente des hausses et des baisses. Au-dessus de 70 : « suracheté ». Sous 30 : « survendu ».",
    quinze:
      "C'est le compte-tours d'une voiture : dans le rouge, le moteur force. Ça ne dit pas que la voiture va s'arrêter — juste qu'elle ne pourra pas forcer indéfiniment.",
    important:
      "Utile pour repérer les excès d'enthousiasme ou de panique. Mais un actif peut rester « suracheté » pendant des mois — jamais un signal automatique.",
  },
  {
    id: "moyenne-mobile",
    terme: "Moyenne mobile",
    categorie: "Analyse technique",
    simple:
      "Le prix moyen des N derniers jours (souvent 50 ou 200), recalculé chaque jour. Elle lisse le bruit pour montrer la tendance de fond.",
    quinze:
      "Ta note d'un contrôle bouge beaucoup ; ta moyenne du trimestre bouge lentement. Être au-dessus de sa moyenne = bonne dynamique.",
    important:
      "Prix au-dessus de la moyenne 50 jours = tendance plutôt haussière (et inversement). Simple, robuste, utilisé par l'app pour l'étiquette « tendance ».",
  },
  {
    id: "support-resistance",
    terme: "Support / Résistance",
    categorie: "Analyse technique",
    simple:
      "Des zones de prix où un actif a souvent rebondi (support, en bas) ou bloqué (résistance, en haut) par le passé.",
    quinze:
      "Dans un jeu vidéo, il y a des murs invisibles où ton personnage bute souvent. Ils finissent parfois par céder — mais on sait où ils sont.",
    important:
      "Beaucoup d'investisseurs surveillent les mêmes niveaux, ce qui leur donne un vrai effet (prophétie autoréalisatrice). À utiliser comme repère, pas comme certitude.",
  },
  {
    id: "dca",
    terme: "DCA (investissement programmé)",
    categorie: "Stratégie",
    simple:
      "Investir la même somme à intervalle régulier (ex : 100 €/mois), quel que soit le prix, au lieu de tout placer d'un coup.",
    quinze:
      "Plutôt que dépenser tout ton argent de poche de l'année le 1er janvier au prix du jour, tu achètes un peu chaque mois : parfois cher, parfois soldé — au final, un prix moyen raisonnable.",
    important:
      "Le DCA neutralise la pire question (« est-ce le bon moment ? ») et l'émotion qui va avec. Pour un débutant, c'est souvent la meilleure stratégie par défaut.",
  },
  {
    id: "fomo",
    terme: "FOMO",
    categorie: "Psychologie",
    simple:
      "« Fear Of Missing Out » : la peur de rater le train quand un actif monte fort, qui pousse à acheter au pire moment.",
    quinze:
      "Tout le monde parle d'un jeu, tu l'achètes plein tarif le jour J pour ne pas être exclu… il est à -50 % deux mois après. Les marchés font pareil, en pire.",
    important:
      "Acheter APRÈS une forte hausse est statistiquement l'un des pires comportements du débutant. C'est exactement ce que le mode Anti-FOMO de l'app est conçu pour ralentir.",
  },
  {
    id: "bull-bear",
    terme: "Bull / Bear market",
    categorie: "Marchés",
    simple:
      "Bull market : phase de hausse durable (+20 % ou plus). Bear market : phase de baisse durable (-20 % ou plus depuis un sommet).",
    quinze:
      "Le taureau (bull) attaque de bas en haut avec ses cornes : ça monte. L'ours (bear) frappe de haut en bas avec sa patte : ça descend.",
    important:
      "Les deux phases sont normales et se succèdent depuis toujours. Un bear market n'est pas une anomalie à fuir — c'est un passage que ton plan doit prévoir.",
  },
  {
    id: "taux-directeur",
    terme: "Taux directeur",
    categorie: "Macro",
    simple:
      "Le « prix de l'argent » fixé par les banques centrales (Fed, BCE). Il influence tous les crédits, et donc toute l'économie.",
    quinze:
      "C'est le robinet d'eau de l'économie. Robinet ouvert (taux bas) : l'argent circule, on investit. Robinet serré (taux hauts) : tout ralentit pour calmer l'inflation.",
    important:
      "Les décisions de la Fed et de la BCE sont les événements qui font le plus bouger TOUS les marchés en même temps — d'où leur place dans le calendrier de l'app.",
  },
  {
    id: "inflation",
    terme: "Inflation",
    categorie: "Macro",
    simple:
      "La hausse générale des prix. À 5 % d'inflation, tes 100 € n'achètent plus que l'équivalent de 95 € un an plus tard.",
    quinze:
      "Le menu du kebab passe de 8 € à 8,50 € — ton billet de 10 € « rétrécit ». L'inflation, c'est le rétrécissement silencieux de ton argent.",
    important:
      "C'est LA raison d'investir : l'argent qui dort perd du pouvoir d'achat chaque année. C'est aussi la donnée macro que les banques centrales surveillent pour fixer les taux.",
  },
  {
    id: "obligations-10-ans",
    terme: "Taux 10 ans",
    categorie: "Macro",
    simple:
      "Le taux auquel un État emprunte sur 10 ans. Le « 10 ans américain » sert de référence mondiale pour valoriser presque tout le reste.",
    quinze:
      "Si le placement « sans risque » de l'État rapporte 5 %, pourquoi prendre des risques en bourse pour 6 % ? Quand ce taux monte, tout le reste doit devenir moins cher pour rester attractif.",
    important:
      "Sa hausse pèse mécaniquement sur les actions (surtout la tech) et la crypto. C'est le fil invisible qui relie les tuiles « taux » et « actions » de ton dashboard.",
  },
  {
    id: "stablecoin",
    terme: "Stablecoin",
    categorie: "Crypto",
    simple:
      "Une crypto conçue pour valoir toujours ~1 dollar (USDT, USDC), adossée à des réserves. Sert de « cash » dans l'écosystème crypto.",
    quinze:
      "Ce sont les jetons de la fête foraine : 1 jeton = 1 €, toujours. On ne les garde pas pour s'enrichir, mais pour jouer aux stands sans ressortir sa carte bancaire.",
    important:
      "Comprendre les stablecoins aide à lire le marché crypto : quand tout le monde « se met en stable », c'est un mouvement de fuite vers la sécurité.",
  },
  {
    id: "halving",
    terme: "Halving (Bitcoin)",
    categorie: "Crypto",
    simple:
      "Tous les ~4 ans, la création de nouveaux bitcoins est divisée par deux. C'est écrit dans le code depuis le départ.",
    quinze:
      "Imagine une mine d'or qui, tous les 4 ans, produit deux fois moins d'or, jusqu'à épuisement à 21 millions de pépites. La rareté est programmée.",
    important:
      "Les halvings structurent les « cycles » du Bitcoin et alimentent beaucoup de récits de marché. Connaître le mécanisme aide à trier les faits du marketing.",
  },
  {
    id: "spread",
    terme: "Spread",
    categorie: "Frais",
    simple:
      "L'écart entre le prix d'achat et le prix de vente à un instant donné. C'est un coût invisible payé à chaque transaction.",
    quinze:
      "Au bureau de change, on t'achète tes dollars à 0,90 € mais on te les vend 0,95 €. Les 5 centimes d'écart, c'est le spread.",
    important:
      "Sur les gros ETF et actions, le spread est minuscule ; sur les petites cryptos, il peut manger plusieurs % à l'aller-retour. Un coût que les débutants oublient toujours.",
  },
  {
    id: "frais-ter",
    terme: "Frais de gestion (TER)",
    categorie: "Frais",
    simple:
      "Le pourcentage prélevé chaque année par un fonds ou ETF. Un TER de 0,2 % = 2 € par an pour 1 000 € investis, prélevés automatiquement.",
    quinze:
      "C'est l'abonnement du fonds. 0,2 %/an semble rien… mais un abonnement de 2 %/an pendant 30 ans dévore environ un tiers de ta cagnotte finale. Les petits ruisseaux font les grandes fuites.",
    important:
      "À stratégie égale, les frais sont le meilleur prédicteur de la performance long terme. C'est LE critère n°1 pour choisir entre deux ETF semblables.",
  },
  {
    id: "pfu",
    terme: "Flat tax (PFU)",
    categorie: "Fiscalité",
    simple:
      "En France, les gains d'investissement (plus-values, dividendes, crypto) sont imposés à 30 % par défaut : 12,8 % d'impôt + 17,2 % de prélèvements sociaux.",
    quinze:
      "Tu revends tes cartes rares avec 100 € de bénéfice : l'État en prend 30. Il faut y penser AVANT de compter tes gains, pas après.",
    important:
      "Un gain de +10 % n'est en réalité que +7 % net. Certaines enveloppes (PEA, assurance-vie) réduisent cette facture — un sujet qui vaut la peine d'être appris tôt.",
  },
  {
    id: "plus-value",
    terme: "Plus-value / Moins-value",
    categorie: "Bases",
    simple:
      "La différence entre le prix de vente et le prix d'achat. Elle reste « latente » (virtuelle) tant que tu n'as pas vendu.",
    quinze:
      "Ta carte Pokémon achetée 10 € en vaut 25 € sur internet : +15 € de plus-value… sur le papier. Tant que tu ne vends pas, ce n'est pas de l'argent réel.",
    important:
      "Confondre gains latents et gains réels fait prendre de mauvaises décisions. L'impôt, lui, ne se déclenche qu'à la vente.",
  },
  {
    id: "fear-greed",
    terme: "Fear & Greed Index",
    categorie: "Sentiment",
    simple:
      "Un score 0-100 qui résume l'humeur du marché crypto : 0 = peur extrême, 100 = euphorie. Calculé à partir de volatilité, volumes, réseaux sociaux…",
    quinze:
      "C'est l'ambiance dans les gradins du stade : panique, ennui ou hystérie. L'ambiance ne dit pas qui va gagner le match — mais elle dit comment la foule réagira au prochain but.",
    important:
      "Les extrêmes sont plus intéressants que le milieu : l'euphorie générale invite à la prudence, la panique générale signale parfois des opportunités. Jamais un signal automatique.",
  },
];

export const TERME_PAR_ID: Record<string, TermeGlossaire> = Object.fromEntries(
  GLOSSAIRE.map((t) => [t.id, t]),
);
