# QuickCop Agent Guide

## Status and source of truth

This repository contains infrastructure plus initial mobile/API slices. Read `infrastructure_plan.md` before changing tooling, hosting, security, database, release, or stack choices. The plan selects Expo/React Native Android, NestJS, Supabase-managed PostgreSQL, Docker/Supabase CLI for local services, and Cloud Run API/worker services (`min-instances >= 1`). Revise the plan with `infra-planner` before changing any of those decisions.

## Repository map

- Front end/mobile: `apps/mobile` — Expo/React Native foundation and account/auth slices.
- API/backend: `apps/api` — NestJS/Supabase account boundary and tests; broader application behavior remains incomplete.
- Infrastructure: `compose.yaml`, `docker/`, `.env.example`.
- Tooling/tests: `package.json`, TypeScript/ESLint/Jest/Stryker configs, `scripts/`, `tests/`.
- CI: `.github/workflows/pr-checks.yml` and `.github/workflows/release.yml`.
- Documentation: `README.md`, `infrastructure_plan.md`, this file.
- Skills: `.agents/skills/`.

## Required boundaries

- Infrastructure work must not add product screens, API routes, domain models, auth, checkout logic, or production data.
- Do not commit secrets, `.env` files, certificates, reports, generated artifacts, or local database data.
- The API Dockerfile remains infrastructure-owned and must not be made buildable with a fake entrypoint; application-owned API packaging must be coordinated with the existing `apps/api` boundary.
- Only approved partner APIs may later support checkout. Never collect or store card numbers/CVV.

## Skills and workflow

- Use `infra-planner` for infrastructure decisions and `infra-builder` for plan-approved configuration.
- Use `frontend-ui-engineering` for mobile/UI work, `test-driven-development` for behavior changes, `test-in-browser` or `browser-testing-with-devtools` for browser verification, and `security-and-hardening` for secrets, PII, auth, payments, or integrations.
- Use `documentation-and-adrs` for durable decisions, `code-review-and-quality` before merge, `ci-cd-and-automation` for workflow changes, and `git-workflow-and-versioning` for commits/branches.

## Verification and lifecycle

After installing with `npm ci` on Node 22.14.0, verify root and application packages independently: root `npm ci`, `npm test -- --runInBand`, and `npm run typecheck`; then `cd apps/mobile`, run the same three commands. Run API package tests/typecheck through its own package scripts as they are added. Also run `npm run verify`, `npm run audit`, and `npm run test:smoke` for the root harness. The Compose smoke test is not a Supabase-local-stack check; report those environments separately.

## Change checklist

1. Read this file, the plan, and applicable local skill instructions.
2. Keep the change scoped; add tests with behavior changes and update documentation for changed developer commands.
3. Run the relevant checks, inspect `git diff --check`, and report unverified prerequisites.
4. Before committing, inspect staged changes for secrets and keep commits focused.
