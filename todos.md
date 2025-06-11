# Meal Planner - Development Plan (todos.md)

This document outlines the steps to build the Meal Planner application based on `specs.md`.

## Phase 1: Project Setup & Basic Structure

- [x] Initialize Vue.js 3 + TypeScript project (using Vite)
- [x] Install Pinia for state management
- [x] Install Vue Router (optional, but good for structure)
- [x] Set up basic project structure (components, views/pages, stores)
- [x] Choose and set up a styling solution (e.g., Tailwind CSS, basic CSS)

## Phase 2: Core Functionality - Meal List View

- [ ] Create `MealListView.vue` component.
- [ ] Implement scrollable container for meal cards.
- [ ] Create `MealCard.vue` component to display individual meals.
- [ ] Design card layout with meal name, description, and meal type.
- [ ] Add visual styling to make cards distinct and readable.
- [ ] Implement responsive design for different screen sizes.

## Phase 3: Core Functionality - Meal Management

- [ ] Create a simple data structure for meals (e.g., `{ id: string, name: string, description: string, mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks', createdAt: Date }`).
- [ ] Implement Pinia store (`mealStore.ts`) to manage meals collection.
- [ ] Display meals from the store as cards in the scrollable list.
- [ ] Add functionality to add a new meal:
    - [ ] Create a modal or form (`AddMealForm.vue`).
    - [ ] Allow users to enter meal name, description, and select meal type.
    - [ ] Save the new meal to the Pinia store.
- [ ] Add functionality to edit an existing meal:
    - [ ] Trigger edit mode (e.g., click on a meal card).
    - [ ] Populate the form with existing meal data.
    - [ ] Update the meal in the Pinia store.
- [ ] Add functionality to delete a meal:
    - [ ] Add a delete button/icon to meal cards.
    - [ ] Remove the meal from the Pinia store upon confirmation.

## Phase 4: Data Persistence

- [ ] Implement logic to save the Pinia store state (meals collection) to Local Storage whenever it changes.
- [ ] Implement logic to load the state from Local Storage when the application starts.

## Phase 5: Styling & Refinement

- [ ] Apply chosen styling framework/CSS to all components.
- [ ] Ensure responsive design (basic usability on different screen sizes).
- [ ] Refine UI/UX based on initial implementation.

## Phase 6: Testing (Optional but Recommended)

- [ ] Set up basic unit tests (e.g., using Vitest).
- [ ] Write tests for Pinia store logic.
- [ ] Write tests for key components.

## Phase 7: Build & Deployment (Optional)

- [ ] Create a production build (`npm run build`).
- [ ] Deploy to a hosting service (e.g., Netlify, Vercel, GitHub Pages).
