# Plan de Refactoring - MealPlanner vers Deck de Repas (Chat First)

## 🎯 Objectif
Transformer l'application d'un système basé sur un calendrier avec dates vers un système de "deck de cartes" où les repas sont gérés sans dates spécifiques, avec possibilité de sélectionner des repas pour la semaine. **L'approche "chat first" est conservée** - l'interface principale reste le chat avec des widgets pour interagir avec les repas.

## 📋 Modifications Principales

### 1. **Refactoring du Modèle de Données (Store)**

#### 1.1 Nouveau MealStore
- **Supprimer** : Le champ `date` de l'interface `Meal`
- **Supprimer** : `DateMeal` interface (plus besoin d'assignation par date)
- **Conserver** : `id`, `name`, `description`, `mealType`, `createdAt`
- **Ajouter** : Nouveau système de sélection hebdomadaire

#### 1.2 Nouveau WeekStore 
- **Créer** : Store pour gérer la sélection hebdomadaire
- **Fonctionnalités** :
  - Liste des repas sélectionnés pour la semaine courante
  - Historique des semaines précédentes (optionnel)
  - Actions : ajouter/retirer des repas de la semaine
  - Génération automatique de suggestions

#### 1.3 Évolution du WidgetsStore
- **Conserver** : Le système de widgets pour l'approche chat-first
- **Modifier** : Types de widgets disponibles
- **Supprimer** : `Calendar` widget type
- **Ajouter** : `MealDeck` et `WeekView` widget types

### 2. **Refactoring de l'Interface Utilisateur (Chat First)**

#### 2.1 Architecture Chat First Conservée
- **Conserver** : `ChatBot.vue` comme composant principal
- **Conserver** : `Widgets.vue` pour l'affichage des widgets
- **Modifier** : Types de widgets disponibles

#### 2.2 Nouveaux Widgets

##### Widget "Deck de Repas" (`MealDeck.vue`)
- **Remplace** : `Calendar.vue`
- **Fonctionnalités** :
  - Grille scrollable de cartes de repas
  - Système de filtres par type de repas
  - Recherche par nom/description
  - Actions : modifier, supprimer, ajouter à la semaine
  - Pagination ou scroll infini si beaucoup de repas

##### Widget "Ma Semaine" (`WeekView.vue`)
- **Nouveau** : Widget pour la sélection hebdomadaire
- **Fonctionnalités** :
  - Affichage des repas sélectionnés pour la semaine
  - Répartition par type de repas (optionnel)
  - Actions : retirer de la semaine, réorganiser
  - Bouton pour générer une nouvelle sélection automatique

#### 2.3 Évolution des Widgets Existants
- **Supprimer** : `Calendar.vue` (remplacé par MealDeck)
- **Modifier** : `MealList.vue` → `MealDeck.vue` (nouvelle logique)
- **Supprimer** : `Meal.vue` (fonctionnalité intégrée dans les nouveaux widgets)

### 3. **Refactoring des Outils Agent (Chat First)**

#### 3.1 Outils à Modifier
- **Modifier** : `addOrUpdateMealTool.ts`
  - Supprimer le paramètre `date`
  - Simplifier la logique
- **Supprimer** : `searchMealsByDateTool.ts` (plus de dates)
- **Modifier** : `readMealsTool.ts` pour retourner tous les repas sans date
- **Modifier** : `showWidgetTool.ts` 
  - Supprimer le type `Calendar`
  - Ajouter les types `MealDeck` et `WeekView`

#### 3.2 Nouveaux Outils à Créer
- **Créer** : `addMealToWeekTool.ts`
  - Ajouter un repas existant à la sélection hebdomadaire
- **Créer** : `removeMealFromWeekTool.ts`
  - Retirer un repas de la sélection hebdomadaire
- **Créer** : `generateWeekSelectionTool.ts`
  - Générer automatiquement une sélection de X repas pour la semaine
  - Avec paramètres : nombre de repas, répartition par type, préférences
- **Créer** : `showMealDeckTool.ts` (ou intégrer dans showWidgetTool)
  - Afficher le widget deck de repas via le chat
- **Créer** : `showWeekViewTool.ts` (ou intégrer dans showWidgetTool)
  - Afficher le widget de la semaine via le chat

### 4. **Chat First : Interactions Typiques**

#### 4.1 Scénarios d'Usage
- **"Montre-moi mes repas"** → Affiche le widget MealDeck
- **"Crée un nouveau repas de type dîner"** → Utilise addOrUpdateMealTool
- **"Planifie ma semaine avec 7 repas"** → Utilise generateWeekSelectionTool + affiche WeekView
- **"Ajoute ce repas à ma semaine"** → Utilise addMealToWeekTool
- **"Montre ma sélection de la semaine"** → Affiche le widget WeekView
- **"Retire ce repas de ma semaine"** → Utilise removeMealFromWeekTool

#### 4.2 Intelligence Conversationnelle
- L'agent peut proposer d'afficher des widgets pertinents
- Compréhension contextuelle des demandes
- Suggestions proactives basées sur les actions utilisateur

### 5. **Refactoring des Composants**

#### 5.1 MealCard.vue
- **Modifier** : Supprimer l'affichage de la date
- **Ajouter** : Bouton "Ajouter à ma semaine"
- **Ajouter** : Indicateur visuel si le repas est déjà dans la semaine
- **Conserver** : Actions éditer/supprimer

#### 5.2 AddMealForm.vue
- **Modifier** : Supprimer le champ date
- **Simplifier** : Le formulaire devient plus simple

#### 5.3 ChatBot.vue (Chat First)
- **Conserver** : Interface chat principale
- **Améliorer** : Suggestions contextuelles pour les widgets
- **Ajouter** : Raccourcis rapides pour actions courantes

### 6. **Nouvelles Fonctionnalités Chat First**

#### 6.1 Commandes Chat Rapides
- **"/deck"** → Affiche le widget MealDeck
- **"/semaine"** → Affiche le widget WeekView
- **"/nouveau [type]"** → Lance la création d'un nouveau repas
- **"/genere [nombre]"** → Génère une sélection hebdomadaire

#### 6.2 Système de Tags (Optionnel)
- **Ajouter** : Tags aux repas pour faciliter la recherche
- **Exemples** : "rapide", "végétarien", "fait-maison", etc.
- **Chat** : Recherche par tags via le chat

#### 6.3 Système de Favoris (Optionnel)
- **Ajouter** : Marquer des repas comme favoris
- **Utilisation** : Priorité dans la génération automatique
- **Chat** : Commandes pour gérer les favoris

#### 6.4 Statistiques Simples
- **Ajouter** : Nombre total de repas dans le deck
- **Ajouter** : Répartition par type de repas
- **Ajouter** : Historique des sélections hebdomadaires
- **Chat** : Consultation via commandes

### 7. **Ordre d'Implémentation Recommandé (Chat First)**

1. **Phase 1 - Base de données**
   - Refactoring du MealStore (suppression des dates)
   - Création du WeekStore
   - Migration des données existantes
   - Mise à jour du WidgetsStore (nouveaux types)

2. **Phase 2 - Nouveaux Widgets**
   - Création de MealDeck.vue (remplace Calendar.vue)
   - Création de WeekView.vue
   - Mise à jour de Widgets.vue pour les nouveaux types

3. **Phase 3 - Outils Agent Chat**
   - Modification des outils existants (suppression dates)
   - Création des nouveaux outils (week management)
   - Mise à jour de showWidgetTool.ts
   - Tests des fonctionnalités chat

4. **Phase 4 - Améliorations Chat**
   - Modification de MealCard.vue
   - Ajout des filtres et recherche dans MealDeck
   - Système de génération automatique
   - Commandes chat rapides

5. **Phase 5 - Polissage Chat First**
   - Suppression des anciens fichiers (Calendar.vue)
   - Optimisations UX chat + widgets
   - Intelligence conversationnelle avancée
   - Tests finaux de l'expérience chat

## 🎨 Avantages de cette Approche Chat First

1. **Chat Central** : L'interface chat reste l'élément principal
2. **Widgets Contextuels** : Affichage intelligent selon les besoins
3. **Simplicité** : Plus besoin de gérer des dates complexes
4. **Flexibilité** : Les repas deviennent réutilisables à volonté
5. **UX Conversationnelle** : Interface intuitive via chat naturel
6. **Agent Intelligent** : Outils adaptés à la conversation

## 🗑️ Fichiers à Supprimer
- `src/components/widgets/Calendar.vue` (remplacé par MealDeck.vue)
- `src/components/widgets/Meal.vue` (fonctionnalité intégrée)
- `src/services/tools/searchMealsByDateTool.ts`

## ✨ Nouveaux Fichiers à Créer
- `src/components/widgets/MealDeck.vue` (remplace Calendar.vue)
- `src/components/widgets/WeekView.vue`
- `src/stores/weekStore.ts`
- `src/services/tools/addMealToWeekTool.ts`
- `src/services/tools/removeMealFromWeekTool.ts`
- `src/services/tools/generateWeekSelectionTool.ts`

## 🔄 Fichiers à Modifier
- `src/stores/mealStore.ts` (suppression logique dates)
- `src/stores/widgetsStore.ts` (nouveaux types de widgets)
- `src/services/tools/addOrUpdateMealTool.ts` (suppression paramètre date)
- `src/services/tools/readMealsTool.ts` (nouvelle logique sans dates)
- `src/services/tools/showWidgetTool.ts` (nouveaux types)
- `src/components/MealCard.vue` (suppression date, ajout actions semaine)
- `src/components/AddMealForm.vue` (suppression champ date)

## 📝 Notes d'Implémentation Chat First

### Migration des Données
- Les repas existants avec dates seront migrés vers le nouveau format sans date
- L'historique des dates sera perdu mais les repas seront conservés
- Le système de widgets existant sera conservé et étendu

### Interface Chat First
- Le chat reste l'interface principale et le point d'entrée
- Les widgets s'affichent en complément du chat selon le contexte
- Navigation fluide entre chat et widgets
- Commandes rapides pour un usage efficace

### Agent Intelligence
- Outils simplifiés mais plus puissants pour la conversation
- Capacité de génération intelligente de sélections hebdomadaires
- Meilleure compréhension des préférences utilisateur
- Suggestions proactives de widgets selon le contexte

### Architecture Widgets
- Le système de widgets dynamiques est conservé
- Nouveaux types de widgets adaptés à la logique "deck de repas"
- Un seul widget visible à la fois (principe existant maintenu)
- Intégration naturelle avec l'expérience chat

Ce plan transforme la logique des repas tout en conservant l'approche "chat first" et le système de widgets existant, garantissant une transition naturelle pour l'utilisateur.
