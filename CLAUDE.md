# CLAUDE.md

## Structure

Monorepo (pnpm workspaces): `apps/front` (Vue3+Pinia), `apps/api` (Express5+TypeORM), `apps/agent` (LangChain+LangGraph), `packages/shared-all`, `packages/shared-back`.

## Commands

```bash
pnpm typecheck | lint | format | format:check # use it after a task to ensure code quality
pnpm migration:generate -- --name <Name> # never manually edit generated files
pnpm migration:run
```

## Patterns

- **API features**: follow existing features (auth, recipe, meal, user) — same folder structure, controller factory, middleware, envelope
- **Agent tools**: follow existing tools pattern
- **Prompts**: Need to be write in english
- **Schemas**: Zod in `shared-all`, reused for validation and `z.infer<>` types
- **Entities**: define indexes/constraints in decorators, never in migrations
