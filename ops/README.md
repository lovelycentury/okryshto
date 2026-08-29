# ops — VPS deploy

Three sites on one server:

- https://profile.okryshto.dev — Next.js SSR
- https://storybook.okryshto.dev — static `@okryshto/react`
- https://iam.okryshto.dev — Keycloak (login theme from `@okryshto/iam`)

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
      ┌──────────┬───────────┴──────────┐
      │          │                      │
 ┌────┴────┐ ┌───┴──────┐         ┌─────┴─────┐
 │ profile │ │    iam   │         │ storybook │
 │  :5200  │ │   :8080  │         │    :80    │
 └─────────┘ └──────────┘         └───────────┘
```

| File                   | Role                                                     |
| ---------------------- | -------------------------------------------------------- |
| `Caddyfile`            | inner proxy: Host → profile / storybook / iam (HTTP)     |
| `docker-compose.yml`   | stack: caddy + profile + storybook + iam                 |
| `Dockerfile.profile`   | Next.js `output: "standalone"`                           |
| `Dockerfile.storybook` | Vite Storybook → static files inside `caddy:alpine`      |
| `Dockerfile.iam`       | Keycloakify theme JAR inside `quay.io/keycloak/keycloak` |
| `spa.Caddyfile`        | Caddy inside the storybook image: SPA fallback, cache    |

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

SSL/TLS → Overview → **Full** (same as the other `*.okryshto.dev` hosts).
Not Flexible, not Full (strict).

`~/vps-infra/Caddyfile` must have `profile.okryshto.dev`,
`storybook.okryshto.dev`, and `iam.okryshto.dev` → `reverse_proxy okryshto-caddy:80`. After editing:

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

Push to `main` → `.github/workflows/ci.yml`: check → 2 images to ghcr.io →
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
