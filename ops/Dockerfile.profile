# syntax=docker/dockerfile:1.7
#
# @okkly/profile — Next.js App Router, server-side rendering, i18n (next-intl).
#
# This is NOT a static site: it needs a live Node process that renders pages
# on request. The runtime image is therefore node, not caddy.
#
#   docker build -f ops/Dockerfile.profile -t profile .   # context = monorepo root
#
# Why standalone: `next build` with output:"standalone" (see
# apps/profile/next.config.ts) emits a ready server plus only the
# node_modules that are actually imported. We copy that folder — ~180 MB
# instead of the full ~1.5 GB pnpm tree.

FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm" \
    PATH="/pnpm:$PATH" \
    CI="true" \
    NEXT_TELEMETRY_DISABLED="1"
RUN corepack enable
WORKDIR /repo

# Dependencies come from the lockfile and are cached as their own layer.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm fetch

FROM deps AS build
COPY . .
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline
# NODE_ENV=production at build time: Next strips dev helpers and minifies.
ENV NODE_ENV=production
RUN --mount=type=cache,id=next-profile,target=/repo/apps/profile/.next/cache \
    pnpm --filter "@okkly/profile..." --if-present run build

# ─────────────────────────────────────────────────────────────────────────────
# Runtime: plain node, no pnpm, no sources, no devDependencies.
# ─────────────────────────────────────────────────────────────────────────────
FROM node:22-slim AS runtime
ENV NODE_ENV=production \
    PORT=5200 \
    HOSTNAME=0.0.0.0
WORKDIR /app

# Do not run as root: if SSR is RCE'd, the process should own nothing.
# The official image already has user `node` (uid 1000).
USER node

# standalone already has its node_modules and server.js — layout mirrors the
# monorepo because outputFileTracingRoot points at the repo root.
COPY --from=build --chown=node:node /repo/apps/profile/.next/standalone ./
# Static JS/CSS chunks are intentionally omitted from standalone — copy them.
COPY --from=build --chown=node:node /repo/apps/profile/.next/static ./apps/profile/.next/static
COPY --from=build --chown=node:node /repo/apps/profile/public ./apps/profile/public

EXPOSE 5200
CMD ["node", "apps/profile/server.js"]
