# 07 — Agent : Nouveaux outils LLM

## Objectif

Ajouter deux nouveaux outils à l'agent LangGraph pour gérer le log alimentaire
et l'enrichissement nutritionnel des recettes existantes.

---

## Checklist

- [ ] Créer le tool `logFood`
- [ ] Créer le tool `enrichRecipeNutrition`
- [ ] Mettre à jour le prompt système de l'agent
- [ ] Brancher les nouveaux `ToolUpdateEvent` dans le front
- [ ] Tester les estimations avec des cas réels

---

## Tool 1 — logFood

### Déclenchement

L'utilisateur dit quelque chose comme :

- "J'ai mangé un bol de pâtes au saumon ce midi"
- "Petit déj : 2 oeufs brouillés et une tranche de pain"
- "Log : yaourt nature + fruits rouges"

### Description du tool (pour l'agent)

```
Loggue un aliment ou repas consommé par l'utilisateur dans son journal alimentaire.
Utilise ce tool quand l'utilisateur mentionne avoir mangé quelque chose.
Estime les calories et macronutriments à partir de la description.
```

### Paramètres

```
{
  description: string   // description du plat/aliment, telle que donnée par l'utilisateur
  date:        string   // YYYY-MM-DD, aujourd'hui par défaut
  mealType:    MealType // inféré du contexte (midi → lunch, matin → breakfast, etc.)
}
```

### Logique interne

```
1. Appeler POST /food-entries avec les paramètres
   (le backend se charge de l'estimation LLM des macros)
2. Retourner la FoodEntry créée avec les valeurs nutritionnelles
3. L'agent résume dans sa réponse :
   "J'ai loggué : Pâtes au saumon — 520 kcal, P: 35g, G: 60g, L: 18g"
```

### ToolUpdateEvent émis

```
{ type: "updateJournal", date: string }
→ Le front recharge le store journal pour la date concernée
```

---

## Tool 2 — enrichRecipeNutrition

### Déclenchement

- Automatiquement lors de la création d'une recette si les macros sont absentes
- Sur demande : "Calcule les calories de mes pâtes bolo"

### Description du tool (pour l'agent)

```
Calcule et sauvegarde les informations nutritionnelles (calories, macros)
d'une recette existante dans la bibliothèque de l'utilisateur.
```

### Paramètres

```
{
  recipeId: string   // ID de la recette à enrichir
}
```

### Logique interne

```
1. Récupérer la recette depuis la DB (nom + description)
2. Appeler le LLM avec :
   "Estime les macronutriments pour une portion de : {nom}
    Description : {description}
    Réponds en JSON : { calories, protein, carbs, fat }"
3. Mettre à jour la recette en base (nouveau champ nutrition)
4. Retourner la recette enrichie
```

### ToolUpdateEvent émis

```
{ type: "updateRecipe", recipeId: string }
→ Le front met à jour la carte dans la bibliothèque
```

---

## Mise à jour du prompt système de l'agent

Ajouter dans le system prompt :

```
Tu as accès au journal alimentaire de l'utilisateur.
Quand l'utilisateur mentionne avoir mangé quelque chose (passé composé, imparfait,
ou formulation directe "j'ai mangé / j'ai pris / petit déj c'était..."),
utilise le tool logFood pour enregistrer l'entrée dans son journal.

Infère le mealType depuis le contexte :
  - mentions de matin, petit déj, breakfast → breakfast
  - midi, déjeuner, lunch → lunch
  - soir, dîner, dinner → dinner
  - collation, snack, goûter → snack
  - sans contexte horaire → utilise l'heure actuelle pour inférer

Pour les recettes sans macros dans la bibliothèque,
propose d'utiliser enrichRecipeNutrition quand l'utilisateur
consulte ou discute de cette recette.
```

---

## Gestion des incertitudes

Si le LLM n'est pas sûr de l'estimation :

- Retourner les valeurs avec un flag `estimated: true`
- L'agent mentionne dans sa réponse que c'est une estimation approximative
- Pas de blocage : mieux vaut une estimation imparfaite que rien

Cas limites à gérer :

- Description trop vague ("j'ai mangé un truc") → demander précision avant de logger
- Quantité non précisée → assumer une portion standard et le mentionner
- Plat maison complexe → décomposer les ingrédients principaux si possible

---

## After Implementation

1. Check every box in this file's Checklist
2. Update the master checklist in `todoV2/README.md`
3. Run `pnpm format` — auto-formats all changed files
4. Run `pnpm lint` — catches any remaining issues
