# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MealPlanner is a monorepo (pnpm workspaces) with 3 apps and 2 shared packages:

- **`apps/front`** — Vue 3 + Vite + Pinia SPA
- **`apps/api`** — Express 5 + TypeORM + PostgreSQL REST API
- **`apps/agent`** — LangChain + LangGraph AI agent (SSE streaming)
- **`packages/shared-all`** — Zod schemas + service functions shared between front and API/agent
- **`packages/shared-back`** — JWT auth middleware shared between api and agent

## Commands

```bash
# Dev
pnpm dev:stack          # Start DB + all services (recommended)
pnpm dev:front          # Frontend only (http://localhost:5173)
pnpm dev:api            # API only (http://localhost:3000)
pnpm dev:agent          # Agent only (http://localhost:3001)

# Build
pnpm build              # Build all packages in parallel
pnpm build:shared-all   # Must build shared packages before apps

# Code quality
pnpm lint               # Lint all packages
pnpm format             # Format with Prettier
pnpm format:check       # Check formatting without writing

# Database (Docker)
pnpm db:up              # Start PostgreSQL containers (required before dev)
pnpm db:down            # Stop containers
pnpm db:purge           # Stop and remove volumes

# Migrations (TypeORM)
pnpm migration:generate -- --name <MigrationName>   # Generate from entity diff
pnpm migration:run                                   # Apply pending migrations
```

## Architecture

### Monorepo Structure

Shared packages must be built before apps consume them. `shared-all` is used by all three apps; `shared-back` is used by `api` and `agent`.

### API (`apps/api`)

- **Module pattern**: each feature (auth, recipe, meal, user) has its own folder with `routes.ts`, `controller.ts`, `entity.ts`
- **Controller factories**: controllers are created via factory functions (`recipeControllerFactory(dataSource)`) for dependency injection
- **Auth**: Bearer JWT via `requireAuth` middleware (from `shared-back`)
- **Validation**: Zod schemas from `shared-all` at route boundaries
- **Response envelope**: all responses use `{ status: "success"|"error", data?, error? }` — see `APIResponsePayload` in `packages/shared-all/src/schemas/common.schemas.ts`
- **Database**: TypeORM with migrations (never `synchronize: true` in production — migrations are guarded to run only in production via env check)
- **Migrations**: Always define indexes, constraints, and relations in entity decorators (`@Index`, `@Unique`, etc.) so `migration:generate` produces the correct SQL automatically. **Never manually edit generated migration files** — if a migration is missing something, fix the entity and regenerate.

### Agent (`apps/agent`)

- Uses `createReactAgent` (LangChain) with a PostgreSQL checkpointer for multi-turn memory
- Streams via Server-Sent Events; event types: `streamStart`, `stream`, `streamEnd`, `toolStart`, `toolEnd`, `end`
- All tools follow the `AgentTool<T>` interface with optional `getToolUpdateEventOnToolStart/End` for UI feedback
- Tools call the API internally using a service token (not user JWT)

### Frontend (`apps/front`)

- Horizontal scroll layout with 3 "pages": Library, Plan, Chat
- Pinia stores: `authStore`, `libraryStore`, `planStore`, `threadStore`, `toolDataUpdateStore`
- `toolDataUpdateStore` receives tool execution events from SSE to update library/plan in real-time without extra API calls
- Auth token stored in localStorage, injected into API requests by `authService`

### Database

Two PostgreSQL instances (both via Docker Compose in `apps/db`):

- Port **5432**: API data (`users`, `recipes`, `meals`)
- Port **5433**: LangGraph conversation checkpointer (agent)

### Data Model

```
UserEntity  1──* RecipeEntity  *──* MealEntity
                                       (meal plan)
```

`MealEntity` links a user to a recipe in their plan (with optional `order`). Cascade deletes on user removal.

## Key Conventions

- **Zod schemas live in `shared-all`** and are reused for both runtime validation (API/agent) and TypeScript types (`z.infer<>`)
- **ESM throughout** — use `import/export`, file extensions required in Node imports (`.js` even for `.ts` files)
- **TypeScript strict mode** on all packages
- **No test framework** is configured
- The LLM model is configured via `OPENROUTER_API_KEY` and model string in `apps/agent/src/llm.ts` (currently `z-ai/glm-4.7` via OpenRouter)
