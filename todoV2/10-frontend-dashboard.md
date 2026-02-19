# 10 — Frontend : Page Dashboard (Home)

## Objectif

Créer la page d'accueil qui résume la situation du jour : calories consommées,
plan de la semaine en cours, et accès rapide au log alimentaire.

---

## Checklist

- [ ] Créer `DashboardPage.vue`
- [ ] Brancher `journalStore` et `planStore` et `profileStore`
- [ ] Créer le composant `WeekPlanStrip.vue`
- [ ] Créer le composant `QuickAddModal.vue`
- [ ] Gérer le cas profil incomplet (onboarding nudge)

---

## Structure de la page — DashboardPage.vue

```
<!-- Date du jour -->
<p class="date-label">JEUDI · 19 FÉVRIER</p>

<!-- Résumé calorique du jour -->
<AppCard class="calories-card">
  <CalorieRing
    :value="todayTotals.calories"
    :goal="calorieGoal"
  />
  <div class="macros-row">
    <MacroBar label="PROT" :value="todayTotals.protein" :goal="proteinGoal" />
    <MacroBar label="GLUC" :value="todayTotals.carbs"   :goal="carbsGoal" />
    <MacroBar label="LIP"  :value="todayTotals.fat"     :goal="fatGoal" />
  </div>
</AppCard>

<!-- Semaine en cours (plan repas) -->
<SectionLabel>CETTE SEMAINE</SectionLabel>
<WeekPlanStrip :plan="planStore.meals" />

<!-- Bouton quick-add -->
<AppCard class="quick-add-card" @click="openQuickAdd">
  <span class="muted-italic">J'ai mangé quelque chose…</span>
  <ArrowRightIcon class="sand-icon" />
</AppCard>

<!-- Nudge si profil incomplet -->
<NudgeCard
  v-if="!profileStore.profile?.calorieGoal"
  message="Définissez votre objectif calorique"
  cta="Compléter mon profil"
  @click="router.push('/profile')"
/>
```

---

## WeekPlanStrip.vue

Affiche les 7 jours de la semaine en cours avec les repas planifiés.

```
Props:
  plan: Meal[]   // les repas de la semaine depuis planStore

Rendu:
  Rangée de 7 pills jours :
    - Jour passé avec repas planifié  → pill #222222, checkmark sand
    - Jour passé sans repas           → pill #222222, pas de check
    - Jour courant                    → pill outline sand, highlighted
    - Jour futur avec repas           → pill #1A1A1A, point sand
    - Jour futur sans repas           → pill #1A1A1A vide

  Au tap sur un jour → naviguer vers /journal/YYYY-MM-DD
```

---

## QuickAddModal.vue

Modal rapide pour logger un repas sans quitter le dashboard.

```
Déclenchement : tap sur "J'ai mangé quelque chose…"

Rendu (bottom sheet) :
  Titre : "QU'EST-CE QUE VOUS AVEZ MANGÉ ?"

  Sélecteur mealType (4 pills) :
    [Matin]  [Midi]  [Soir]  [Snack]
    → pré-sélectionné selon l'heure actuelle

  Input texte libre :
    Placeholder : "Ex: un bol de pâtes au saumon"

  Bouton submit : "LOGGER"
    → Appelle journalStore.addEntry(desc, mealType)
    → Affiche un loader "Estimation en cours…"
    → À la réponse : ferme le modal, affiche un toast de confirmation
      "Loggué : 520 kcal"
    → Met à jour CalorieRing en temps réel
```

---

## Données chargées au montage

```
onMounted:
  journalStore.fetchDay()    // totaux du jour
  planStore.fetchPlan()      // plan de la semaine
  profileStore.fetchProfile() // objectifs (si pas déjà chargé)
```

---

## Toast de confirmation

Composant global léger (hors dashboard) :

```
Appel : toast.show(message, duration = 3000)

Rendu:
  Petite pill fixe en haut de l'écran
  Fond #111111, border hairline sand, texte blanc
  Apparaît de haut → slide down, disparaît après duration
```

---

## Notes

- `CalorieRing` et `MacroBar` sont réutilisés depuis la page Journal (même composants)
- Si `todayTotals.calories === 0` → afficher "Aucun repas loggué aujourd'hui" à la place
  de l'anneau vide, avec un lien vers le journal
- Le dashboard est volontairement léger : il redirige vers Journal et Plan pour les détails

---

## After Implementation

1. Check every box in this file's Checklist
2. Update the master checklist in `todoV2/README.md`
3. Run `pnpm format` — auto-formats all changed files
4. Run `pnpm lint` — catches any remaining issues
