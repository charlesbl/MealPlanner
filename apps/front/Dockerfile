# syntax=docker/dockerfile:1

# ---- Builder image with pnpm ----
FROM node:22-alpine AS base
ENV PNPM_HOME=/root/.local/share/pnpm \
    PATH=/root/.local/share/pnpm:$PATH
RUN corepack enable && corepack prepare pnpm@10.15.0 --activate

FROM base AS deps
WORKDIR /workspace

# Copy only manifests for better caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-all/package.json packages/shared-all/
COPY apps/front/package.json apps/front/

# Install deps for the workspace (front + shared)
RUN pnpm install --frozen-lockfile

FROM deps AS build
WORKDIR /workspace

# Build-time configuration for Vite (injected into import.meta.env)
ARG VITE_API_URL
ARG VITE_AGENT_URL
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_AGENT_URL=${VITE_AGENT_URL}

# Copy full repo (honors .dockerignore)
COPY . .

# Build shared package(s) and front
RUN pnpm --filter @mealplanner/shared-all build \
    && pnpm --filter @mealplanner/front build


# ---- Runtime: nginx ----
FROM nginx:1.27-alpine AS runner

# Copy custom nginx config
COPY apps/front/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static assets
COPY --from=build /workspace/apps/front/dist/ /usr/share/nginx/html/

EXPOSE 80
STOPSIGNAL SIGQUIT
CMD ["nginx", "-g", "daemon off;"]
