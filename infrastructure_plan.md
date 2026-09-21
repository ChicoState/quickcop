# Infrastructure Plan

> Planning only. This document describes future infrastructure work. No installations, configuration changes, containers, workflows, deployments, or other implementation files were created by the infrastructure-planning process.

## 1. Project and User Experience

- **Application:** Android mobile stock-tracking and partner-retailer checkout application.
- **Primary users:** Individual U.S. shoppers.
- **Primary user task:** Track partner-retailer products, receive a prompt restock alert, and complete an approved fast checkout using a device wallet or payment-provider flow.
- **Selected platform:** Android cross-platform mobile app (React Native/Expo); Android Play Store initial release.
- **User-experience rationale:** An installed app supports prompt push notifications while the hosted service monitors stock continuously.
- **Required operating systems, browsers, or devices:** Android devices supported by the selected Expo/React Native and Google Play policies.
- **Offline or native-device requirements:** Network is required for monitoring and checkout; Android push notifications and device authentication are required.

## 2. Connectivity and Application Shape

- **Connectivity model:** Single-user web-enabled.
- **Accounts and authentication:** One shopper account per user; use a managed identity provider with passkeys where supported, short-lived sessions, and MFA-capable recovery.
- **Backend required:** Yes. It runs approved partner stock-monitoring integrations, sends notifications, and enforces authorization.
- **Cross-device persistence:** Hosted, per-account data.
- **Interaction between accounts:** None.
- **Primary application components:** Expo Android client, NestJS API and worker process, PostgreSQL, notification provider, payment/wallet integration, and approved partner-retailer APIs.
- **Checkout boundary:** Only participating retailers with approved checkout APIs are supported. The app must never automate arbitrary retailer sites or retain raw payment credentials.

## 3. Selected Technology Stack

| Area                    | Selected technology                                      | Purpose                                            | Version policy                              |
| ----------------------- | -------------------------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| Primary language        | TypeScript                                               | Shared mobile and server language                  | Supported stable releases                   |
| Mobile framework        | React Native with Expo                                   | Android application and device notifications       | Supported stable Expo SDK                   |
| Runtime or SDK          | Node.js LTS; Android SDK                                 | Server runtime; Android build tooling              | Current supported LTS / Play-compatible SDK |
| Package manager         | npm                                                      | Dependency and lockfile management                 | Bundled with selected Node LTS              |
| Backend framework       | NestJS                                                   | Authenticated API, partner integrations, workers   | Supported stable major                      |
| Build or packaging tool | Expo Application Services (EAS) / Android Gradle tooling | Signed Android release artifacts                   | Supported stable tooling                    |
| API layer               | HTTPS JSON API                                           | Client, partner, and checkout-provider integration | Versioned contract                          |

## 4. Storage and Persistence

- **Storage model:** Hosted relational storage.
- **Primary data store:** PostgreSQL for accounts, tracked product URLs/identifiers, availability history, notification preferences, and encrypted delivery addresses.
- **User files or object storage:** Not planned initially; do not persist payment or identity-document files.
- **Local-development storage:** PostgreSQL Docker service with disposable developer data.
- **Production hosting model:** Cloud SQL for PostgreSQL with private IP, automated backups, and tested restores. Cloud Run API and worker services connect through private networking with least-privilege service accounts.
- **Schema and migration approach:** Versioned, reviewed migrations executed once by a controlled release job.
- **Backup, export, or recovery approach:** Encrypted scheduled backups, tested restores, per-user account/address export and deletion capability, and retention periods approved by counsel.
- **Secrets and connection-string approach:** Secret manager/environment injection only; no credentials in source, images, logs, or mobile clients.
- **Payment and address handling:** Do not collect, store, log, or transmit PAN, CVV, or wallet credentials. Use partner-approved Apple Pay/Google Pay, Stripe Link, or equivalent provider flows; retain only provider tokens and minimal transaction references when permitted. Encrypt saved delivery addresses at rest and in transit, authorize per user, audit privileged access, and delete on account deletion.
- **Reason this storage fits the access pattern:** PostgreSQL supports secure per-account data, transactional alert state, and fast partner checkout preparation.

## 5. Testing Tools

| Test layer       | Tool or library                                          | Planned scope                                                                      | Planned execution point                         |
| ---------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------- | ----------------------------------------------- |
| Unit             | Jest and React Native Testing Library                    | Mobile UI, validation, notification presentation                                   | Local and pull requests                         |
| Integration      | Jest/NestJS test utilities and Testcontainers PostgreSQL | Auth, authorization, encrypted address access, partner adapters, stock transitions | Local and pull requests                         |
| End-to-end or UI | Maestro                                                  | Android onboarding, alert receipt, and approved checkout handoff                   | Pull requests when practical; release candidate |

## 6. Test Analysis

| Capability                            | Tool                                      | Planned policy                                                                                                |
| ------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Coverage                              | Jest V8/Istanbul coverage                 | Collect client and server reports on pull requests                                                            |
| Coverage threshold or regression rule | Repository-defined modest threshold       | Block reductions below the approved baseline; ratchet upward deliberately                                     |
| Mutation testing                      | StrykerJS                                 | Scheduled, critical server modules only: stock state, authorization, address protection, checkout preparation |
| Flaky-test or duration analysis       | CI timing and retry reporting             | Investigate repeated failures; do not hide them with unlimited retries                                        |
| Reporting                             | GitHub Actions artifacts and PR summaries | Retain coverage and failed mobile-test artifacts                                                              |

## 7. Static Analysis and Security

| Check                                    | Tool                                              | Planned enforcement                                            |
| ---------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| Formatting                               | Prettier                                          | Verify on pull requests                                        |
| Linting                                  | ESLint                                            | Block pull requests                                            |
| Type checking or compiler warnings       | TypeScript compiler                               | Block pull requests with strict settings                       |
| Anti-pattern or maintainability analysis | ESLint rules and Semgrep                          | Block high-confidence findings; tune reviewed false positives  |
| Dependency vulnerability scanning        | Dependabot and npm audit/compatible advisory scan | Dependabot updates; block actionable high/critical findings    |
| Secret scanning                          | GitHub secret scanning and Gitleaks               | Block detected secrets; rotate exposed credentials immediately |
| Static security analysis                 | CodeQL and Semgrep                                | CodeQL scheduled and on relevant PRs; Semgrep on PRs           |
| Container scanning                       | Trivy                                             | Scan production API and PostgreSQL images before release       |

## 8. Development Technologies Requiring Manual Installation

These are developer-workstation prerequisites that will not be supplied by the planned Docker environment.

| Technology                                            | Why it is needed                              | Required on which machines                   | Version policy                    | Planned installation or verification method | Why Docker does not provide it                       |
| ----------------------------------------------------- | --------------------------------------------- | -------------------------------------------- | --------------------------------- | ------------------------------------------- | ---------------------------------------------------- |
| Git                                                   | Source control                                | All developer machines                       | Supported stable                  | Future documented setup check               | Developer host tool                                  |
| Node.js LTS and npm                                   | Expo tooling and local client development     | All developer machines                       | Supported LTS                     | Future version check                        | Mobile tooling runs on host                          |
| Android Studio and Android SDK                        | Emulator, debugging, and Android builds       | Android app developers                       | Play-compatible supported version | Future documented setup check               | Requires host emulator/device integration            |
| Java JDK required by Gradle                           | Android builds                                | Android app developers and Android CI runner | Expo/Gradle-compatible LTS        | Future documented setup check               | Native Android toolchain dependency                  |
| Docker Desktop/Engine                                 | Planned local backend and database containers | Backend developers                           | Supported stable                  | Future documented setup check               | It is the local container runtime                    |
| Google Play developer account and signing credentials | Store publishing                              | Release owner/secure CI                      | Current Play requirements         | Obtain before release                       | Account-held credentials cannot be baked into Docker |

### Host tools intentionally not required

- **Not required because Docker supplies them:** Production-like NestJS runtime and local PostgreSQL service.
- **Not required for this platform:** Xcode, iOS SDK, Apple signing/notarization tools, and desktop packaging SDKs.

## 9. Docker Plan

- **Planned Docker role:** Local development for the NestJS backend and PostgreSQL; containerized API/worker deployment to Cloud Run.
- **Future files that would be created during implementation:** API Dockerfile, PostgreSQL service definition, Compose configuration, `.dockerignore`, and environment templates.
- **Planned images and services:** Local multi-stage non-root NestJS API/worker image and version-pinned PostgreSQL image; Cloud Run deploys the API/worker image and Cloud SQL supplies production PostgreSQL.
- **Development container behavior:** API and database run as separate services; source bind mount only for development; database data uses a named volume.
- **Ports:** Bind database only to the internal Docker network; expose API only through a TLS-capable reverse proxy/gateway.
- **Bind mounts and named volumes:** Named persistent PostgreSQL volume; avoid mounting host secrets or production data.
- **Environment-variable and secret handling:** Inject runtime secrets from the platform secret manager; never copy `.env` files or credentials into images.
- **Local database or service containers:** PostgreSQL only; use Testcontainers for isolated integration-test databases.
- **Production image or non-container release path:** Publish scanned API/worker image to Artifact Registry and deploy separate Cloud Run API and worker services with `min-instances` at least 1; use Cloud SQL private IP. Android artifact is built on a native Android runner and published separately.
- **Build stages and hardening:** Multi-stage build, minimal runtime base, non-root users, `.dockerignore`, pinned bases, health checks, read-only filesystem where compatible, and no embedded secrets.
- **Planned future development command:** `docker compose up` (future only; do not run during planning).
- **Planned future production command:** Deployment-platform-specific image rollout command (future only; select before implementation).

## 10. GitHub Actions Plan

### A. Automated pull-request checks

- **Future workflow file:** `.github/workflows/pr-checks.yml`
- **Trigger:** `pull_request`.
- **Runner or matrix:** Ubuntu for server/static checks; Android-compatible runner/emulator for Maestro where practical.
- **Permissions:** Read-only `contents`; grant only narrowly scoped permissions required for reports.
- **Planned jobs in order:**
  1. Checkout, set up Node LTS and Java/Android tooling where needed, restore npm cache, and run lockfile-enforced `npm ci`.
  2. Verify Prettier, ESLint, TypeScript, Semgrep, Gitleaks, and dependency advisories.
  3. Run unit and integration tests with ephemeral Testcontainers PostgreSQL; collect coverage.
  4. Build API and Android application validation; run Trivy against built container images.
  5. Run practical Maestro Android flows and upload traces/screenshots/logs on failure.
  6. Run or upload CodeQL analysis according to its supported GitHub configuration.
- **Service containers:** Prefer Testcontainers-created PostgreSQL; no external production service access.
- **Caching:** npm cache keyed by lockfile; Android/Gradle cache keyed by build files.
- **Coverage and analysis reporting:** Upload coverage, security results, and concise PR summaries.
- **Failure artifacts:** Coverage reports, test logs, Maestro screenshots/traces, and build logs.
- **Checks that should block merging:** Formatting, linting, type checks, unit/integration tests, coverage policy, high/critical actionable security findings, build validation, and required mobile smoke flow.
- **Proposed branch-protection settings:** Require the preceding checks, one approving review, up-to-date branches, and no force pushes to the protected default branch.

### B. New-release deployment

- **Future workflow file:** `.github/workflows/release.yml`
- **Release trigger:** Protected `v*` tag or `workflow_dispatch` with an explicit release version.
- **Release destination:** Google Play Store production track, Cloud Run API and worker services (each `min-instances` ≥ 1), and Cloud SQL for PostgreSQL with private IP and automated backups.
- **Runner or matrix:** Ubuntu for container build/scan; Android-compatible native runner for signed Android artifact.
- **Planned jobs in order:**
  1. Re-run lockfile install, static checks, tests, coverage gate, Android/API build validation, and container scan.
  2. Build, sign, and upload the Android App Bundle to the chosen Google Play track.
  3. Build and publish the scanned API/worker image to Artifact Registry, then deploy the API and worker Cloud Run services after protected-environment approval; verify each has `min-instances` ≥ 1.
  4. Run controlled database migrations, health checks, and partner-integration smoke checks; publish release notes and artifact checksums.
- **Build artifacts:** Signed Android App Bundle, API image digest, SBOM/scan report, coverage report, and checksums.
- **Signing, notarization, or store requirements:** Google Play Console account, Android app-signing key managed securely, and Play publishing service-account credentials; no Apple requirements in the Android-only release.
- **Database migration step:** Approved, backward-compatible migration job before application rollout; backup first.
- **Environment approval:** Required for production deploy and Play production promotion.
- **Post-deployment verification:** API health check, private synthetic stock-notification check, and approved partner checkout-session smoke test without real charges.
- **Failed-release or rollback approach:** Halt Play rollout or use Play rollback controls; redeploy the prior API image digest; restore only a tested backup when migration rollback is unsafe.

### GitHub configuration required later

| Name                                        | Type                         | Purpose                                                          |
| ------------------------------------------- | ---------------------------- | ---------------------------------------------------------------- |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`          | Secret                       | Authenticate CI publishing to Google Play                        |
| `ANDROID_SIGNING_KEY` and signing passwords | Secrets                      | Sign Android release artifacts                                   |
| `GCP_WORKLOAD_IDENTITY_PROVIDER`            | GitHub variable              | Google Cloud Workload Identity Federation provider resource name |
| `GCP_SERVICE_ACCOUNT`                       | GitHub variable              | Least-privilege deployer service-account email                   |
| `GCP_PROJECT_ID` and `GCP_REGION`           | GitHub variables             | Target Artifact Registry, Cloud Run, and Cloud SQL location      |
| `CLOUD_SQL_INSTANCE`                        | GitHub variable              | Production Cloud SQL instance connection identifier              |
| `DATABASE_URL` and encryption-key material  | Secrets                      | Connect securely and encrypt protected address fields            |
| Partner API credentials                     | Secrets                      | Access approved inventory and checkout integrations              |
| `production`                                | Protected GitHub environment | Require approval and scope production secrets                    |
| Google Play Console account                 | Account                      | Own Android distribution and release controls                    |

## 11. Planned Repository Artifacts - Not Created by This Skill

- [ ] Application manifests and npm lockfile.
- [ ] Expo/React Native mobile application and NestJS backend project files.
- [ ] Test, coverage, Maestro, StrykerJS, Prettier, ESLint, TypeScript, Semgrep, and Gitleaks configuration.
- [ ] API Dockerfile, Compose configuration, `.dockerignore`, and environment templates.
- [ ] `.github/workflows/pr-checks.yml`.
- [ ] `.github/workflows/release.yml`.
- [ ] Deployment, database migration, Google Play, and signing configuration.

## 12. Assumptions and Open Items

- **Assumptions:** First launch is U.S.-only; only partner retailers with approved APIs are supported; Android is the sole initial client; user confirmation via a supported wallet/provider remains required for payment authorization.
- **Decisions still requiring an external account, credential, certificate, or organizational approval:** Partner agreements/API access, payment-provider onboarding, Google Cloud project and Workload Identity Federation setup, Cloud Run/Cloud SQL service accounts, Google Play developer account, Android signing, push-notification provider, encryption-key management, and legal/privacy review.
- **Items to confirm before implementation begins:** Exact supported retailers and checkout contracts; provider for Android wallet/payment authorization; target Android OS range; address retention period; privacy policy, consent, deletion/export flow, incident response, and applicable U.S./California legal obligations.
