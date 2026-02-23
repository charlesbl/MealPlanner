# 05 — Backend : Journal alimentaire (FoodEntry)

## Objectif

Persister les entrées alimentaires loguées par l'utilisateur (via texte libre),
avec leur estimation nutritionnelle calculée par le LLM.
Exposer une API REST pour lire, créer et supprimer des entrées.

---

## Checklist

- [ ] Créer l'entité TypeORM `FoodEntry`
- [ ] Créer la migration associée
- [ ] Créer le service `FoodEntryService`
- [ ] Créer le router Express `journalRouter`
- [ ] Brancher le call LLM dans le service (estimation nutrition)
- [ ] Brancher le router dans `app.ts`

---

## Entité TypeORM — FoodEntry

Table : `food_entries`

```
Colonnes :
  id            UUID       PK, généré auto
  user_id       UUID       FK → users.id, ON DELETE CASCADE
  description   TEXT       texte libre saisi par l'utilisateur
  date          DATE       format YYYY-MM-DD
  meal_type     ENUM       breakfast | lunch | dinner | snack
  calories      FLOAT
  protein       FLOAT      grammes
  carbs         FLOAT      grammes
  fat           FLOAT      grammes
  created_at    TIMESTAMP  auto
```

Index : `(user_id, date)` pour les requêtes par jour.

---

## Endpoints API

### GET /food-entries?date=YYYY-MM-DD

- Auth requise
- Retourne toutes les FoodEntry de l'utilisateur pour la date donnée
- Triées par `created_at` ASC
- Réponse :
    ```
    {
      entries: FoodEntry[],
      totals: NutritionInfo   // somme de toutes les entrées du jour
    }
    ```

### GET /food-entries/week?startDate=YYYY-MM-DD

- Auth requise
- Retourne les totaux agrégés par jour sur 7 jours à partir de startDate
- Réponse :
    ```
    {
      days: {
        date:    string,
        totals:  NutritionInfo
      }[]
    }
    ```

### POST /food-entries

- Auth requise
- Body : `CreateFoodEntryRequest { description, date, mealType }`
- Le service appelle le LLM pour estimer les macros depuis `description`
- Persiste l'entrée avec les macros estimées
- Réponse : `FoodEntry` créée

### DELETE /food-entries/:id

- Auth requise
- Vérifier que l'entrée appartient à l'utilisateur
- Supprimer et retourner 204

---

## Estimation nutritionnelle via LLM

Dans `FoodEntryService.estimateNutrition(description: string)` :

```
Appeler le LLM (Claude) avec un prompt système du type :
  "Tu es un nutritionniste. Estime les macronutriments pour : {description}.
   Réponds uniquement en JSON : { calories, protein, carbs, fat }
   Toutes les valeurs en nombre entier."

Parser la réponse JSON
En cas d'erreur de parsing → retourner des valeurs nulles / 0
```

Ce call LLM est interne au backend, pas via l'agent LangGraph.
Utiliser le SDK Anthropic directement depuis l'API.

---

## Notes

- Les valeurs nutritionnelles sont des **estimations** — le préciser dans l'UI
- Conserver la description originale pour permettre des corrections futures
- Pas de modification d'une entrée pour l'instant (delete + recréer)

---

## After Implementation

1. Check every box in this file's Checklist
2. Update the master checklist in `todoV2/README.md`
3. Run `pnpm format` — auto-formats all changed files
4. Run `pnpm lint` — catches any remaining issues
