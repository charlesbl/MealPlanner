# Meal Planner

A web application built with Vue.js 3, TypeScript, and Vite to help users plan their weekly meals using an interactive calendar interface. It also features an integrated AI chatbot for assistance.

## Features

*   **Interactive Calendar:** Display a weekly calendar (Monday to Sunday) with navigation to previous/next weeks.
*   **Meal Planning:** Assign meals (Breakfast, Lunch, Dinner, Snacks) to specific days. Add, edit, and delete planned meals.
*   **AI Chatbot:** Integrated chatbot (using LangChain) to potentially assist with meal suggestions or other tasks (implementation details in `src/services/chatService.ts` and `src/components/ChatBot.vue`).
*   **State Management:** Uses Pinia for managing application state, particularly the meal plan.
*   **Persistence:** (Planned) Meal data will be saved to the browser's Local Storage.

## Tech Stack

*   **Frontend Framework:** [Vue.js 3](https://vuejs.org/) (using Composition API & `<script setup>`)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **State Management:** [Pinia](https://pinia.vuejs.org/)
*   **AI/Chat:** [LangChain](https://js.langchain.com/) / [@langchain/openai](https://www.npmjs.com/package/@langchain/openai)
*   **Date Utility:** [date-fns](https://date-fns.org/)

## Project Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd MealPlanner
    ```
2.  **Install dependencies:**
    Requires Node.js and npm (or yarn/pnpm).
    ```bash
    npm install
    ```

## Available Scripts

*   **`npm run dev`**: Runs the app in development mode with hot-reloading. Open [http://localhost:5173](http://localhost:5173) (or the port specified by Vite) to view it in the browser.
*   **`npm run build`**: Compiles and bundles the app for production into the `dist` folder.
*   **`npm run preview`**: Serves the production build locally for previewing.

## Project Structure

*   `public/`: Static assets.
*   `src/`: Main application source code.
    *   `assets/`: Static assets processed by Vite.
    *   `components/`: Reusable Vue components (e.g., `MealCard.vue`, `AddMealForm.vue`, `ChatBot.vue`).
    *   `services/`: Modules for external interactions (e.g., `chatService.ts`).
    *   `stores/`: Pinia state management stores (e.g., `mealStore.ts`).
    *   `types/`: TypeScript type definitions.
    *   `views/`: Top-level page components (e.g., `MealListView.vue`).
    *   `App.vue`: Root Vue component.
    *   `main.ts`: Application entry point.
    *   `style.css`: Global styles.
*   `index.html`: Main HTML entry file.
*   `vite.config.ts`: Vite configuration file.
*   `tsconfig.json`: TypeScript configuration files.
*   `package.json`: Project dependencies and scripts.
*   `specs.md`: Detailed application specifications.
*   `todos.md`: Development plan and task list.

