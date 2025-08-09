# MealPlanner DB Service

This service runs a local PostgreSQL instance using Docker Compose for development.

## Usage

1. Ensure Docker Desktop is installed and running.
2. Create your environment file:
    - Copy `.env.example` to `.env` and adjust values if needed.
3. Start the database:
    - With pnpm at repo root: `pnpm db:up`
    - Or from this folder: `docker compose up -d`
4. Stop the database:
    - With pnpm: `pnpm db:down`
    - Or here: `docker compose down`

## Purge database data (DANGER: destroys data)

To delete all local database data by removing the Docker volume, run from the repo root:

-   `pnpm db:purge`

Then you can bring the DB back up with `pnpm db:up` and re-run migrations/seed from the API if needed.

Only use this in development. This will delete all data in the local DB volume (`mealplanner_pg_data`).

The database will be accessible at `localhost:5432` by default with the credentials from `.env`.

The data volume is named `mealplanner_pg_data`.
