# QuickCop Agent Guide

## Status and source of truth

This repository has infrastructure only. Read `infrastructure_plan.md` before changing tooling, hosting, security, database, release, or stack choices. The plan selects Expo/React Native Android, NestJS, PostgreSQL, Docker for local services, Cloud Run API/worker services (`min-instances >= 1`), and Cloud SQL private IP. Revise the plan with `infra-planner` before changing any of those decisions.

## Repository map

- Front end/mobile: `apps/mobile` — not created yet.
- API/backend: `apps/api` — not created yet.
- Infrastructure: `compose.yaml`, `docker/`, `.env.example`.
- Tooling/tests: `package.json`, TypeScript/ESLint/Jest/Stryker configs, `scripts/`, `tests/`.
- CI: `.github/workflows/pr-checks.yml` and `.github/workflows/release.yml`.
- Documentation: `README.md`, `infrastructure_plan.md`, this file.
- Skills: `.agents/skills/`.

## Required boundaries

- Infrastructure work must not add product screens, API routes, domain models, auth, checkout logic, or production data.
- Do not commit secrets, `.env` files, certificates, reports, generated artifacts, or local database data.
- The API Dockerfile is intentionally unbuildable until application-owned `apps/api` exists; do not add a fake entrypoint merely to make it build.
- Only approved partner APIs may later support checkout. Never collect or store card numbers/CVV.

## Skills and workflow

- Use `infra-planner` for infrastructure decisions and `infra-builder` for plan-approved configuration.
- Use `frontend-ui-engineering` for mobile/UI work, `test-driven-development` for behavior changes, `test-in-browser` or `browser-testing-with-devtools` for browser verification, and `security-and-hardening` for secrets, PII, auth, payments, or integrations.
- Use `documentation-and-adrs` for durable decisions, `code-review-and-quality` before merge, `ci-cd-and-automation` for workflow changes, and `git-workflow-and-versioning` for commits/branches.

## Verification and lifecycle

After installing with `npm ci` on Node 22.14.0, run `npm run verify`, `npm run audit`, and `npm run test:smoke`. CI mirrors the static checks and coverage harness; it additionally runs Gitleaks and CodeQL. `npm run test:smoke` starts then removes the PostgreSQL service and volume. For manual local use, start with `npm run docker:up` and always clean up with `npm run docker:down`.

## Change checklist

1. Read this file, the plan, and applicable local skill instructions.
2. Keep the change scoped; add tests with behavior changes and update documentation for changed developer commands.
3. Run the relevant checks, inspect `git diff --check`, and report unverified prerequisites.
4. Before committing, inspect staged changes for secrets and keep commits focused.
