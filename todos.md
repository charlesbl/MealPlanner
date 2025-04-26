# Meal Planner - Development Plan (todos.md)

This document outlines the steps to build the Meal Planner application based on `specs.md`.

## Phase 1: Project Setup & Basic Structure

- [x] Initialize Vue.js 3 + TypeScript project (using Vite)
- [x] Install Pinia for state management
- [x] Install Vue Router (optional, but good for structure)
- [x] Set up basic project structure (components, views/pages, stores)
- [x] Choose and set up a styling solution (e.g., Tailwind CSS, basic CSS)

## Phase 2: Core Functionality - Calendar View

- [ ] Create `CalendarView.vue` component.
- [ ] Implement logic to display the current week (e.g., Monday-Sunday).
- [ ] Add navigation buttons (Previous/Next Week).
- [ ] Implement logic to update the displayed week based on navigation.
- [ ] Display dates within each day cell.
- [ ] Highlight the current date.
- [ ] Structure day cells to hold meal slots (Breakfast, Lunch, Dinner, Snacks).

## Phase 3: Core Functionality - Meal Planning

- [ ] Create `MealSlot.vue` component (or similar) to represent a meal area within a day.
- [ ] Create a simple data structure for planned meals (e.g., `{ date: 'YYYY-MM-DD', slot: 'Breakfast', description: 'Oatmeal' }`).
- [ ] Implement Pinia store (`mealStore.ts`) to manage planned meals.
- [ ] Display planned meals from the store in the correct date/slot on the calendar.
- [ ] Add functionality to add a new meal:
    - [ ] Create a modal or form (`AddMealForm.vue`).
    - [ ] Allow users to select a date and slot (pre-filled if clicking on a specific slot).
    - [ ] Allow users to enter a meal description.
    - [ ] Save the new meal to the Pinia store.
- [ ] Add functionality to edit an existing meal:
    - [ ] Trigger edit mode (e.g., click on a meal).
    - [ ] Populate the form with existing meal data.
    - [ ] Update the meal in the Pinia store.
- [ ] Add functionality to delete a planned meal:
    - [ ] Add a delete button/icon to planned meals.
    - [ ] Remove the meal from the Pinia store upon confirmation.

## Phase 4: Data Persistence

- [ ] Implement logic to save the Pinia store state (planned meals) to Local Storage whenever it changes.
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
