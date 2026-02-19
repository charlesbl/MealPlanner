# 03 — Shared Types

## Objectif

Ajouter dans `packages/shared-all` les nouveaux types Zod partagés entre front et back
pour le profil utilisateur, le journal alimentaire et les conversations.

---

## Checklist

- [ ] Ajouter le schéma `UserProfile`
- [ ] Ajouter le schéma `FoodEntry`
- [ ] Ajouter les types `MealType` et `NutritionInfo`
- [ ] Ajouter le schéma `Thread` (conversation)
- [ ] Exporter tous les nouveaux types depuis `index.ts`

---

## Nouveaux types

### NutritionInfo

Bloc de macros réutilisable, embarqué dans FoodEntry et Recipe.

```
NutritionInfo {
  calories: number       // kcal
  protein:  number       // grammes
  carbs:    number       // grammes
  fat:      number       // grammes
}
```

### MealType (enum)

Utilisé pour classer les entrées du journal.

```
MealType = "breakfast" | "lunch" | "dinner" | "snack"
```

### FoodEntry

Représente un aliment/plat logué dans le journal d'un jour donné.

```
FoodEntry {
  id:          string         // uuid
  userId:      string
  description: string         // texte libre saisi par l'utilisateur
  date:        string         // format YYYY-MM-DD
  mealType:    MealType
  nutrition:   NutritionInfo  // estimé par LLM
  createdAt:   Date
}
```

### UserProfile

Informations personnelles et objectifs nutritionnels de l'utilisateur.

```
UserProfile {
  userId:       string
  height:       number | null  // cm
  weight:       number | null  // kg
  age:          number | null
  calorieGoal:  number | null  // kcal/jour
  proteinGoal:  number | null  // g/jour
  carbsGoal:    number | null  // g/jour
  fatGoal:      number | null  // g/jour
  updatedAt:    Date
}
```

### Thread

Représente une conversation sauvegardée.

```
Thread {
  id:              string   // = langgraph thread_id
  userId:          string
  title:           string   // généré automatiquement par LLM
  createdAt:       Date
  lastMessageAt:   Date
}
```

---

## Mise à jour du type Recipe existant

Ajouter le champ optionnel `nutrition` au schéma `Recipe` :

```
Recipe {
  ...existant...
  nutrition?: NutritionInfo   // null si pas encore calculé
}
```

---

## Schémas de requête/réponse API

### Profil

```
UpdateProfileRequest  = Partial<Omit<UserProfile, "userId" | "updatedAt">>
UpdateProfileResponse = UserProfile
```

### Journal

```
CreateFoodEntryRequest {
  description: string
  date:        string    // YYYY-MM-DD
  mealType:    MealType
  // nutrition est calculé côté backend via LLM, pas envoyé par le front
}

CreateFoodEntryResponse = FoodEntry

GetFoodEntriesQuery {
  date:     string     // YYYY-MM-DD
  // possibilité d'étendre : startDate/endDate pour la vue semaine
}
```

### Threads

```
ThreadSummary {
  id:            string
  title:         string
  lastMessageAt: Date
}

ListThreadsResponse = ThreadSummary[]
```
