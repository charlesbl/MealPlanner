# 11 — Frontend : Page Bibliothèque (refonte)

## Objectif
Refondre la page Bibliothèque avec le nouveau design system : vue grille ou liste,
filtres par type de repas, et affichage des calories/macros sur chaque carte.

---

## Checklist

- [ ] Refondre `LibraryPage.vue` avec Tailwind
- [ ] Refondre `RecipeCard.vue` (ajout nutrition, nouveau design)
- [ ] Ajouter les filtres par type de repas
- [ ] Ajouter le toggle grille / liste
- [ ] Afficher les macros estimées (ou bouton pour les calculer)
- [ ] Connecter `enrichRecipeNutrition` via le chat ou un bouton direct

---

## Structure de la page — LibraryPage.vue

```
<PageHeader>
  <h1>MES RECETTES</h1>
  <div class="header-actions">
    <SearchIcon />
    <GridListToggle v-model="viewMode" />
  </div>
</PageHeader>

<!-- Filtres -->
<FilterPills
  :options="['Tout', 'Matin', 'Midi', 'Soir', 'Snack']"
  v-model="activeFilter"
/>

<!-- Compteur -->
<p class="recipe-count">{{ filteredRecipes.length }} recettes</p>

<!-- Vue grille -->
<div v-if="viewMode === 'grid'" class="recipe-grid">
  <RecipeCardCompact
    v-for="recipe in filteredRecipes"
    :recipe="recipe"
    @click="openRecipeDetail(recipe)"
  />
</div>

<!-- Vue liste -->
<div v-else class="recipe-list">
  <RecipeCardFull
    v-for="recipe in filteredRecipes"
    :recipe="recipe"
  />
</div>

<!-- État vide -->
<EmptyState
  v-if="filteredRecipes.length === 0"
  message="Aucune recette dans cette catégorie"
  sub="Demandez à l'IA d'en créer une"
/>
```

---

## RecipeCardCompact.vue (vue grille)

Carte carrée pour la grille 2 colonnes.

```
Props: recipe: Recipe

Rendu:
  ┌─────────────────┐
  │ Nom de la       │
  │ recette         │
  │                 │
  │ 520 kcal        │  ← sand
  │ P·35 G·60 L·18  │  ← muted, xs
  └─────────────────┘

  Si recipe.nutrition === null :
    Afficher "— kcal" en muted à la place
    Icône sparkle en muted "Calculer"

  Au tap → ouvre RecipeDetailSheet
```

---

## RecipeCardFull.vue (vue liste)

Reprend l'essentiel de l'actuel `RecipeCard.vue`, refonte visuelle.

```
Props: recipe: Recipe

Rendu:
  ┌─────────────────────────────┐
  │ Nom de la recette           │
  │ [Midi] [Soir]   520 kcal ▼ │
  │─────────────────────────────│
  │ Description (collapsible)   │
  │ P: 35g  G: 60g  L: 18g     │
  │                    [🗑]     │
  └─────────────────────────────┘

  Expand/collapse garde le mécanisme checkbox existant
  Description rendue via MarkdownRenderer
```

---

## RecipeDetailSheet.vue (nouveau)

Bottom sheet de détail d'une recette, ouvert depuis la vue grille.

```
Contenu:
  - Nom (grand, serif si on l'adopte, sinon bold sans-serif)
  - Badges de type (Midi, Soir...)
  - Bloc nutrition si disponible :
    Anneau ou barres simplifié(es) (reprendre CalorieRing en mini)
  - Description complète en markdown
  - Actions :
    [+ Ajouter au plan]   [Supprimer]
    [Calculer les macros] (si nutrition absente)
```

---

## FilterPills.vue (composant réutilisable)

```
Props:
  options:  string[]
  modelValue: string   // filtre actif

Rendu:
  Rangée horizontale scrollable
  Option active : texte blanc + underline sand 2px
  Options inactives : texte muted, pas de décoration
  Aucun background, aucun pill shape
```

---

## Logique de filtrage

```
filteredRecipes = computed(() => {
  if activeFilter === 'Tout' → retourner tous les recipes triés par createdAt DESC
  sinon → filtrer par recipeType correspondant au filtre
})
```

Mapping filtres → RecipeType :
```
'Matin'  → Breakfast
'Midi'   → Lunch
'Soir'   → Dinner
'Snack'  → Snacks
```

---

## Notes

- La recherche (icône loupe) : dans un premier temps, filtre local sur le nom
- Le calcul des macros via `enrichRecipeNutrition` se fait en passant par le chat
  (l'utilisateur peut dire "calcule les macros de ma recette X")
  ou via un bouton qui ouvre directement le chat avec un message pré-rempli
- Conserver le comportement de suppression optimiste existant
