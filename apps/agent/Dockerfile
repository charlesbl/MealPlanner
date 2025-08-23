# syntax=docker/dockerfile:1

# ---- Base image with pnpm enabled ----
FROM node:22-alpine AS base
ENV PNPM_HOME=/root/.local/share/pnpm \
    PATH=/root/.local/share/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate


# ---- Dependencies (install) ----
FROM base AS deps
WORKDIR /workspace

# Only copy manifest files for better install caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-all/package.json packages/shared-all/
COPY packages/shared-back/package.json packages/shared-back/
COPY apps/agent/package.json apps/agent/

# Install all dependencies for the filtered subgraph (agent and its deps)
RUN pnpm install --frozen-lockfile


# ---- Build ----
FROM deps AS build
WORKDIR /workspace

# Copy the full monorepo (honors .dockerignore)
COPY . .

# Build only what's needed for the agent and prepare a deployable bundle
# Use legacy deploy per pnpm v10 behavior
RUN pnpm --filter @mealplanner/shared-all build \
    && pnpm --filter @mealplanner/shared-back build \
    && pnpm --filter @mealplanner/agent build \
    && pnpm deploy --filter @mealplanner/agent --prod --legacy out


# ---- Runtime image ----
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app

# Copy the deploy output produced by pnpm (contains the agent project, its deps, and node_modules)
COPY --from=build /workspace/out/ /app/

# Run as non-root user
RUN addgroup -S nodejs && adduser -S app -G nodejs \
    && chown -R app:nodejs /app
USER app

# The Agent requires PORT, DB_URL, and OpenRouter/OpenAI credentials at runtime
ENV PORT=3002
EXPOSE 3002

CMD ["node", "dist/index.js"]
