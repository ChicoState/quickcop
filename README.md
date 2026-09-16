# QuickCop

Android-first stock tracking and partner-retailer checkout is planned here. The repository currently contains its development infrastructure only; no mobile app, NestJS API, authentication, product model, or checkout behavior has been implemented.

## Repository map

- `infrastructure_plan.md` — approved stack, security, hosting, and release decisions.
- `package.json`, `tsconfig.json`, `eslint.config.mjs`, Jest and Stryker configuration — shared TypeScript quality harness.
- `compose.yaml`, `docker/` — local PostgreSQL and future API image configuration.
- `scripts/smoke-postgres.sh` — disposable PostgreSQL readiness/`SELECT 1` smoke test.
- `tests/` — empty unit and integration test locations for future application tests.
- `.github/workflows/` — pull-request checks and guarded release prerequisite workflow.
- `.agents/skills/` — project-supplied agent guidance.
- `apps/mobile` and `apps/api` — not created yet; application implementation owns them.

## Getting Started

1. Install [Git](https://git-scm.com/downloads), [Docker Desktop or Docker Engine](https://docs.docker.com/get-docker/), and [Node.js 22.14.0 LTS](https://nodejs.org/). Android application developers also need [Android Studio and the Android SDK](https://developer.android.com/studio) plus the JDK required by the selected Gradle/Expo version. Docker does not replace Android tooling or Google Play signing.
2. Copy the safe local-service template, then keep real values untracked:

   ```bash
   cp .env.example .env
   ```

   `.env` is only for local PostgreSQL. Production secrets belong in Google Cloud Secret Manager and GitHub protected-environment secrets, never in source control.

3. Install the locked tooling with Node 22:

   ```bash
   npm ci
   ```

   The current host has Node 18, so this equivalent containerized command is verified here:

   ```bash
   docker run --rm --user "$(id -u):$(id -g)" -v "$PWD":/workspace -w /workspace node:22.14-bookworm-slim npm ci
   ```

4. Run quality checks and the local database smoke test:

   ```bash
   npm run verify
   npm run test:smoke
   ```

   `npm test` and `npm run test:integration` validate an empty harness until application-owned tests exist. `npm run test:smoke` starts PostgreSQL, performs only `SELECT 1`, and stops/removes its local volume.

5. For an interactive local database, run `npm run docker:up`; clean it up with `npm run docker:down`.

## Docker and deployment boundary

`compose.yaml` runs pinned `postgres:17.2-bookworm` locally and exposes it only on `127.0.0.1`. `docker/api.Dockerfile` is a hardened future NestJS image template and cannot build until `apps/api` is created by the application phase.

Production is planned for Cloud Run API and worker services with at least one minimum instance each, plus private-IP Cloud SQL PostgreSQL with automated backups. The release workflow deliberately stops at prerequisites while mobile/API entrypoints and real protected-environment settings are absent; it does not publish, deploy, migrate, or contact Google Cloud.

## GitHub setup required later

Create a `production` protected environment and configure the plan-named `GCP_WORKLOAD_IDENTITY_PROVIDER`, `GCP_SERVICE_ACCOUNT`, `GCP_PROJECT_ID`, `GCP_REGION`, `CLOUD_SQL_INSTANCE`, `CLOUD_RUN_API_SERVICE`, and `CLOUD_RUN_WORKER_SERVICE` variables. Google Play publishing also needs its service-account JSON, Android signing key/password secrets, Google Cloud Workload Identity Federation, Artifact Registry, Cloud Run services, Cloud SQL instance, partner credentials, encryption-key management, and legal/privacy approval.

## Troubleshooting

- **Node version mismatch:** use Node 22.14.0 (`nvm use`) or the documented Node 22 Docker command.
- **Docker permission denied:** ensure Docker Desktop/Engine is running and your user can access the Docker daemon, then retry `npm run test:smoke`.
- **Port 5432 occupied:** change `POSTGRES_PORT` in untracked `.env` and restart the Compose service.
- **Missing environment variable in release:** configure the named GitHub `production` environment variable; the guarded workflow intentionally fails before release actions.
