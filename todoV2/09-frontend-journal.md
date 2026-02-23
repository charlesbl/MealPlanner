# 09 — Frontend : Page Journal

## Objectif

Créer la page Journal permettant de visualiser les aliments consommés jour par jour,
les totaux de calories et macros, et d'ajouter manuellement des entrées via texte libre.

---

## Checklist

- [ ] Créer `journalStore` (Pinia)
- [ ] Créer `journalService` dans `shared-all`
- [ ] Créer `JournalPage.vue`
- [ ] Créer le composant `CalorieRing.vue`
- [ ] Créer le composant `MacroBar.vue`
- [ ] Créer le composant `WeekChart.vue`
- [ ] Créer le composant `FoodEntryRow.vue`
- [ ] Gérer le quick-add (texte libre → LLM)

---

## journalStore (Pinia)

```
state:
  currentDate:  string           // YYYY-MM-DD, aujourd'hui par défaut
  entries:      FoodEntry[]      // entrées du jour courant
  totals:       NutritionInfo    // somme du jour
  weekData:     { date, totals }[] // 7 derniers jours
  loading:      boolean
  adding:       boolean          // en cours d'ajout LLM

actions:
  setDate(date)         → change currentDate + fetchDay()
  fetchDay()            → GET /food-entries?date → met à jour entries + totals
  fetchWeek()           → GET /food-entries/week?startDate → met à jour weekData
  addEntry(description, mealType)  → POST /food-entries → recharge le jour
  removeEntry(id)       → DELETE /food-entries/:id → recharge le jour

getters:
  calorieGoal   → lire depuis profileStore.profile.calorieGoal ?? 2000
  proteinGoal   → profileStore.profile.proteinGoal
  carbsGoal     → profileStore.profile.carbsGoal
  fatGoal       → profileStore.profile.fatGoal
```

---

## Structure de la page — JournalPage.vue

```
<!-- Navigation jour -->
<DayNavigation
  :date="currentDate"
  @prev="store.setDate(previousDay)"
  @next="store.setDate(nextDay)"
/>

<!-- Résumé calorique -->
<AppCard class="summary-card">
  <CalorieRing
    :value="totals.calories"
    :goal="calorieGoal"
  />
  <div class="macros">
    <MacroBar label="Prot" :value="totals.protein" :goal="proteinGoal" color="blue" />
    <MacroBar label="Gluc" :value="totals.carbs"   :goal="carbsGoal"  color="orange" />
    <MacroBar label="Lip"  :value="totals.fat"     :goal="fatGoal"    color="yellow" />
  </div>
</AppCard>

<!-- Log alimentaire groupé par repas -->
<div v-for="mealType in ['breakfast','lunch','dinner','snack']">
  <SectionLabel>{{ mealTypeLabel(mealType) }}</SectionLabel>
  <AppCard>
    <FoodEntryRow
      v-for="entry in entriesForMeal(mealType)"
      :entry="entry"
      @delete="store.removeEntry(entry.id)"
    />
    <AddEntryRow
      :mealType="mealType"
      @add="(desc) => store.addEntry(desc, mealType)"
    />
  </AppCard>
</div>

<!-- Graphe semaine -->
<SectionLabel>CETTE SEMAINE</SectionLabel>
<WeekChart :data="weekData" :goal="calorieGoal" :currentDate="currentDate" />
```

---

## CalorieRing.vue

Anneau circulaire SVG (pas de lib externe).

```
Props:
  value:  number   // calories consommées
  goal:   number   // objectif

Rendu:
  - Cercle SVG avec stroke-dasharray calculé pour le % de remplissage
  - Arc en couleur sand si < 100%, rouge si > 100%
  - Centre : grand nombre "{value}" en blanc, petit texte "/ {goal} kcal" en muted
  - Stroke width: 3px, rayon adaptatif
```

---

## MacroBar.vue

Barre de progression horizontale pour un macro.

```
Props:
  label:  string
  value:  number   // consommé
  goal:   number   // objectif (null = pas de barre de goal)
  color:  string   // pour la couleur de la barre

Rendu:
  [LABEL]  [████████░░░░]  [value / goal g]
  Barre : fond #222222, remplissage sand (ou couleur prop)
  Dépassement : barre en rouge
```

---

## WeekChart.vue

Graphique à barres pour les 7 derniers jours.

```
Props:
  data:        { date, totals }[]
  goal:        number
  currentDate: string

Rendu (SVG ou CSS) :
  - 7 barres rectangulaires flat
  - Hauteur proportionnelle aux calories (max = goal × 1.3)
  - Couleur : jour courant = sand, jours passés = #333333, futurs = #1A1A1A
  - Ligne pointillée horizontale à la hauteur du goal
  - Initiale du jour sous chaque barre (L, M, M, J, V, S, D)
```

---

## FoodEntryRow.vue

Ligne d'une entrée alimentaire dans le log.

```
Props:
  entry: FoodEntry

Rendu:
  [description]          [calories kcal]   [🗑]
  Swipe left pour supprimer (optionnel, ou juste bouton delete)
```

---

## AddEntryRow.vue

Ligne "+ Ajouter" qui s'expand en input texte.

```
État collapsed:
  [+ Ajouter un repas]   (texte muted, dashed border)

État expanded (tap):
  [Input texte libre...] [▶ Envoyer]

Au submit:
  - Afficher un spinner "Estimation en cours…"
  - Appeler store.addEntry(description, mealType)
  - À la réponse → recollapse et afficher la nouvelle entrée
```

---

## Notes

- La date dans l'URL (`/journal/2026-02-19`) permet le partage et le retour arrière
- Pas possible de logger pour une date future
- L'entrée LLM peut prendre 2-3s : afficher un état de chargement clair
- Si pas d'objectif défini (profileStore vide) → afficher un nudge
  "Définissez votre objectif calorique dans le Profil" à la place du goal

---

## After Implementation

1. Check every box in this file's Checklist
2. Update the master checklist in `todoV2/README.md`
3. Run `pnpm format` — auto-formats all changed files
4. Run `pnpm lint` — catches any remaining issues
