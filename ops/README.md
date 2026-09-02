# ops — VPS deploy

Sites on one server:

- https://profile.okryshto.dev — Next.js SSR
- https://storybook.okryshto.dev — static `@okryshto/react`
- https://iam.okryshto.dev — Keycloak (login theme from `@okryshto/iam`)
- https://resume.okryshto.dev — Vite SPA, served static (`apps/resume/fe`)
- https://resume-api.okryshto.dev — RAG backend (`apps/resume/be`). Split origin:
  the SPA is built with `VITE_API_BASE_URL=https://resume-api.okryshto.dev` and
  `resume-be`'s `CORS_ORIGINS` lists the SPA host.

```
                    internet
                       │  :80 / :443
                 ┌─────┴──────┐
                 │ vps-infra  │   ~/vps-infra Caddy (TLS, Cloudflare)
                 │   caddy    │
                 └─────┬──────┘
                       │  HTTP, network vps-infra_default
                 ┌─────┴──────┐
                 │ okryshto-  │   this compose, no host ports
                 │   caddy    │
                 └─────┬──────┘
      ┌──────────┬───────────┼──────────┬─────────────┐
      │          │           │          │             │
 ┌────┴────┐ ┌───┴────┐ ┌────┴────┐ ┌───┴─────┐ ┌─────┴──────┐
 │ profile │ │   iam  │ │storybook│ │resume-fe│ │  resume-be  │
 │  :5200  │ │  :8080 │ │   :80   │ │   :80   │ │    :5300    │
 └─────────┘ └────────┘ └─────────┘ └─────────┘ └──────┬──────┘
                                                       │ resume net
                                               ┌───────┴───────┐
                                               │ resume-libsql │  vector index
                                               │     :8080     │  (no host port)
                                               └───────────────┘
```

| File                    | Role                                                          |
| ----------------------- | ------------------------------------------------------------ |
| `Caddyfile`             | inner proxy: Host → profile / storybook / iam / resume / resume-api (HTTP) |
| `docker-compose.yml`    | stack: caddy + profile + storybook + iam + resume-{fe,be,libsql} |
| `Dockerfile.profile`    | Next.js `output: "standalone"`                               |
| `Dockerfile.storybook`  | Vite Storybook → static files inside `caddy:alpine`          |
| `Dockerfile.iam`        | Keycloakify theme JAR inside `quay.io/keycloak/keycloak`     |
| `Dockerfile.resume-fe`  | Vite SPA → static files inside `caddy:alpine`                |
| `spa.Caddyfile`         | Caddy inside the storybook / resume-fe images: SPA fallback, cache |

`resume-be` and `resume-ingest` build from `apps/resume/be/Dockerfile`
(stages `runtime` and `build`).

## resume: secrets + first ingest

`resume-be` needs `GOOGLE_GENERATIVE_AI_API_KEY` (chat + embeddings). Compose
reads it — plus optional `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `OLLAMA_API_KEY`,
`DEFAULT_MODEL_ID` — from an `.env` beside the compose file:

```bash
cd /srv/okryshto
printf 'GOOGLE_GENERATIVE_AI_API_KEY=%s\n' "$KEY" >> .env
```

The vector index starts empty. The knowledge files (`cv.md`, `personal.md`) are
private and never committed or baked into an image — copy them to the VPS and
run the one-shot ingest:

```bash
mkdir -p /srv/okryshto/resume-knowledge
scp apps/resume/be/knowledge/{cv,personal}.md  vps:/srv/okryshto/resume-knowledge/
ssh vps 'cd /srv/okryshto && docker compose --profile ingest run --rm resume-ingest'
```

Re-run that last command whenever the knowledge files change.

Edge TLS is Caddy from `~/vps-infra`. This stack joins the same Docker
network `vps-infra_default` and listens only inside it (`okryshto-caddy:80`).

## First-time VPS setup

### 1. Docker

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker "$USER"
# log in again
```

### 2. DNS (Cloudflare, proxied)

A records with the **orange cloud** (Proxied):

- `profile.okryshto.dev` → VPS IP
- `storybook.okryshto.dev` → VPS IP
- `iam.okryshto.dev` → VPS IP
- `resume.okryshto.dev` → VPS IP
- `resume-api.okryshto.dev` → VPS IP

SSL/TLS → Overview → **Full** (same as the other `*.okryshto.dev` hosts).
Not Flexible, not Full (strict).

`~/vps-infra/Caddyfile` must have `profile.okryshto.dev`,
`storybook.okryshto.dev`, `iam.okryshto.dev`, `resume.okryshto.dev`, and
`resume-api.okryshto.dev` → `reverse_proxy okryshto-caddy:80`. After editing:

```bash
cd ~/vps-infra && docker compose restart caddy
```

### 3. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80,443/tcp
sudo ufw enable
```

Port 5200 is not exposed — only through Caddy.

### 4. Stack files

```bash
sudo mkdir -p /srv/okryshto && sudo chown "$USER":"$USER" /srv/okryshto
# copy docker-compose.yml and Caddyfile from the repo
```

### 5. Deploy key for GitHub Actions

```bash
ssh-keygen -t ed25519 -f ~/.ssh/okryshto_deploy -C "github-actions" -N ""
ssh-copy-id -i ~/.ssh/okryshto_deploy.pub user@VPS_IP
ssh-keyscan VPS_IP
cat ~/.ssh/okryshto_deploy
```

Repo secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`,
`GHCR_TOKEN` (`read:packages` while packages are private).

### 6. First start

```bash
cd /srv/okryshto
docker compose up -d
docker compose logs -f caddy
```

If images were built on the machine instead of pulled from GHCR:

```bash
docker compose up -d --pull never --force-recreate --remove-orphans
```

The public `caddy:2-alpine` image must exist locally: `docker pull caddy:2-alpine`.

## After that

Push to `main` → `.github/workflows/deploy.yml`: build every image to ghcr.io →
scp compose + Caddyfile → `compose pull && up -d`.

PRs run `check` only.

Rollback: put a SHA tag instead of `latest` in `docker-compose.yml` and
`docker compose up -d`.

```bash
docker compose ps
docker compose logs -f profile
docker compose up -d --force-recreate caddy   # after editing Caddyfile
```

## Local image check

```bash
# from the monorepo root
docker build -f ops/Dockerfile.profile -t profile:local .
docker run --rm -p 5200:5200 profile:local
```

Same for `ops/Dockerfile.storybook`.

Keycloak theme (set bootstrap admin before `compose up`):

```bash
docker build -f ops/Dockerfile.iam -t ghcr.io/lovelycentury/okryshto/iam:latest .
# KC_BOOTSTRAP_ADMIN_USERNAME / KC_BOOTSTRAP_ADMIN_PASSWORD in the compose env
```
