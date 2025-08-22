# MealPlanner API

Minimal Express + TypeORM API.

Scripts:

-   dev: start in watch mode
-   typeorm: run TypeORM CLI (ESM)
-   migration:generate/run/revert: manage migrations

Env (.env):
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, PORT

Endpoints:

-   GET /users/:id
-   PUT /users/:id body: { name: string }
