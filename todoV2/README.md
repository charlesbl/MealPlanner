# MealPlanner v2 — Checklist principale

> Mise à jour au fil de l'implémentation. Cocher chaque item quand le code est mergé et fonctionnel.

---

## Progression globale

```
Phase 1 — Fondations        [x] [x] [x]
Phase 2 — Backend           [x] [x] [x] [x] [x]
Phase 3 — Agent / LLM       [x] [x]
Phase 4 — Frontend          [x] [x] [x] [x] [x]
```

---

## Phase 1 — Fondations

- [x] **01 — Design system** : Tailwind v4, tokens, typographie, composants de base
- [x] **02 — Navigation** : Bottom bar 5 onglets, structure des 5 pages, suppression scroll-snap
- [x] **03 — Shared types** : Nouveaux types Zod (FoodEntry, UserProfile, Thread)

## Phase 2 — Backend (API)

- [x] **04 — DB : UserProfile** : Entité, migration, relation User 1-1
- [x] **05 — DB : FoodEntry** : Entité, migration, relation User + date + mealType
- [x] **06 — DB : Conversations** : Persistance des threads LangGraph, titres auto
- [x] **07 — API : Profil** : GET /profile, PUT /profile
- [x] **08 — API : Journal** : GET /food-entries, POST /food-entries, DELETE /food-entries/:id

## Phase 3 — Agent / LLM

- [x] **09 — Tool : logFood** : Estimation calories + macros depuis texte libre via LLM
- [x] **10 — Tool : enrichRecipe** : Calcul macros sur recettes existantes sans nutrition

## Phase 4 — Frontend

- [x] **11 — Page Profil** : Formulaire infos perso + objectifs + calcul TDEE
- [x] **12 — Page Journal** : Log alimentaire du jour, navigation date, graphe semaine
- [x] **13 — Page Dashboard** : Résumé du jour, semaine en cours, bouton quick-add
- [x] **14 — Page Bibliothèque** : Refonte grille, filtres, macros sur les cartes
- [x] **15 — Page Chat** : Historique conversations, drawer, recipe cards enrichies

---

## Notes

- Ordre d'implémentation : respecter la numérotation, chaque phase dépend de la précédente
- Fichiers de détail : voir `todoV2/01-*.md` à `todoV2/15-*.md`
- Prompts UI : voir `todoV2/page1Prompt.md` à `todoV2/page5Prompt.md`
