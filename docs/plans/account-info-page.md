# Specification and Implementation Plan: Account Info and Alert Preferences

## Objective

Let an authenticated QuickCop shopper view and edit their account information and control how they receive stock alerts. The page contains required username and email fields, an optional phone number, and four independent delivery controls:

- Restock alerts by push notification
- Restock alerts by email
- Price-change alerts by push notification
- Price-change alerts by email

The delivery preferences must never pause, remove, or otherwise change monitoring of any item the shopper has selected. The background worker continues collecting stock and price events for all tracked items; it applies preferences only when deciding whether to deliver an already-detected event.

## Confirmed Scope

- The Account Info page is an editable authenticated-user page.
- Username and email are required; phone number is optional.
- Push and email are the only delivery methods in this release. Phone is profile data, not an SMS-alert opt-in.
- Each alert type/channel pair is independently toggleable.
- All four delivery controls default to off; the shopper must opt in explicitly.
- Any observed price decrease is alert-worthy. Delivery is deduplicated for an unchanged observed price.
- A changed email remains pending until verified; email alerts continue using the prior verified email during that period.
- If push is enabled but Android permission or a device token is unavailable, retain the preference, show push as unavailable with a path to device settings, and resume push delivery when registration becomes available.
- Saving profile details and delivery preferences persists across app sessions and devices.

## Out of Scope

- Pausing, adding, or removing tracked items from this page.
- SMS alerts, additional alert categories, or per-item notification overrides.
- Changing the stock/price monitoring cadence based on a user's preferences.
- Password, identity-provider, or account-deletion management UI.

## Existing Constraints

- The mobile application is Expo/React Native in `apps/mobile` and currently has local-only auth prototype screens.
- `apps/api` does not yet exist. Durable profile data, authorization, event processing, and notification delivery require the future NestJS API and worker specified in `infrastructure_plan.md`.
- PostgreSQL is the planned system of record. Cloud Run API and worker services remain separate, always-on services; this plan does not change that infrastructure decision.

## User Flow

1. The signed-in shopper opens Account Info from the home experience.
2. The app loads the authenticated shopper's profile and preferences, showing a loading and an error/retry state as appropriate.
3. The shopper edits username, email, or the optional phone field and changes any of the four delivery toggles.
4. The shopper saves. Inline validation remains visible, the save control prevents duplicate submission, and a success or safe error message is announced accessibly.
5. Future stock-monitoring code records a restock or price decrease event independently of these preferences. Delivery code sends only through the currently enabled, available matching channel(s). With all four toggles off, the event is still recorded and monitoring continues, but no push or email is sent.
6. When push is enabled but unavailable, the app retains the choice and explains how to enable Android notifications; it must not silently switch the preference off.

## Proposed Contract

Define the shared API contract before implementing either client or server. Do not expose password hashes, sessions, verification tokens, provider identifiers, or other internal security fields.

```ts
type AlertKind = "RESTOCK" | "PRICE_CHANGE";
type DeliveryChannel = "PUSH" | "EMAIL";

interface AccountInfo {
  username: string;
  email: string;
  phone: string | null;
  notificationPreferences: Record<AlertKind, Record<DeliveryChannel, boolean>>;
}

interface UpdateAccountInfoInput {
  username: string;
  email: string;
  phone: string | null;
  notificationPreferences: Record<AlertKind, Record<DeliveryChannel, boolean>>;
}
```

- `GET /api/account` returns only the signed-in account's `AccountInfo`.
- `PATCH /api/account` atomically validates and updates the supplied non-email fields and preferences; when email changes, it records the replacement as pending verification while retaining the prior verified delivery address, then returns canonical account state.
- An unauthenticated request returns `401`; a request cannot name or modify another account. Invalid input returns the project's consistent `422` validation error shape.
- Email-address changes must use the identity provider's verified-email flow before becoming the active delivery address. The prior verified email remains active until verification completes; the exact managed-provider integration is deferred until the provider is selected.
- A push preference represents delivery intent, not proof that a current device can receive push. The response must expose non-sensitive push availability so the client can present a remediation state.

## Data and Worker Invariant

Store a per-account profile record plus four boolean preference values (or equivalently a normalized account-alert-delivery-preference table with uniqueness on account, alert kind, and delivery channel). All four preferences default to `false` at account creation. Preserve a verified email separately from a pending replacement email, and store device-registration/permission availability without overwriting the user's push preference.

The worker pipeline must preserve this ordering:

```text
Tracked item -> partner stock/price check -> event detection + persistence
                                               -> preference lookup -> enabled delivery channels -> push/email
```

There must be no preference condition on the stock/price check or event-detection stages. A price decrease event is eligible once per changed observed price; the unchanged price must not produce repeated delivery. Integration tests must prove that an account with all four preferences disabled still produces the expected monitoring event and does not receive delivery attempts.

## Security and Privacy Requirements

- Authenticate every read/write and derive the account identity exclusively from the session/token; never accept an account ID from the client for these operations.
- Validate and normalize input at the API boundary: bounded username, valid normalized email, optional normalized phone, and exactly the supported preference keys/channels.
- Treat email and phone as PII: do not log them, do not return them in unrelated APIs, use TLS in transit, and apply the database encryption/access controls selected in the infrastructure plan.
- Require current authenticated-session protection and provider re-verification for an email change; return non-sensitive validation/conflict errors.
- Use parameterized database access, least-privilege worker/API service accounts, and audit security-sensitive profile/email changes without recording the raw values.
- A disabled notification preference is not consent to stop processing tracked-item monitoring data; explain this in nearby UI helper copy.

## Commands and Verification Environment

Current repository checks:

```bash
npm run verify
npm run audit
npm run test:smoke
cd apps/mobile && npm test -- --runInBand
cd apps/mobile && npm run typecheck
```

When `apps/api` exists, add focused API and worker integration commands to its documented package scripts. Run them against disposable PostgreSQL/Testcontainers data only.

## Implementation Plan

### Task 1: Establish the contract, persistence migration, and safe defaults

**Description:** Add the application-owned account/profile and notification-preference contract, migration, and account-creation defaults in the future API. Align onboarding so email is required and phone remains optional; remove the current misleading implication that phone enables future text alerts.

**Acceptance criteria:**

- [ ] Profile storage represents username, verified email, nullable phone, and every supported alert/channel preference with explicit defaults.
- [ ] All four preference defaults are `false`; profile storage preserves a pending email change and the prior verified delivery address.
- [ ] Registration cannot create an account without an email; it does not imply SMS delivery from a supplied phone number.
- [ ] The migration is reversible/tested according to the project's migration process and does not alter tracked-item monitoring records.

**Verification:**

- [ ] Migration and repository tests pass against disposable PostgreSQL.
- [ ] API contract/type tests cover the four preference values and nullable phone.

**Dependencies:** Application-owned API and migration tooling must exist.

**Likely files:** `apps/api` account module/migration/types, `apps/mobile/features/auth/CreateAccountScreen.tsx`, account-creation tests.

### Task 2: Implement authenticated profile read/update behavior

**Description:** Add `GET /api/account` and atomic `PATCH /api/account`, using the authenticated identity as the only account selector.

**Acceptance criteria:**

- [ ] A shopper can retrieve and update only their own canonical account information and all four preferences.
- [ ] Invalid profile fields or unsupported preference keys return a consistent validation error without partial persistence.
- [ ] Email change enters the selected identity provider's verification process while delivery remains on the prior verified email; sensitive values do not appear in logs or error payloads.
- [ ] Push preference remains enabled when device permission/token registration is unavailable, and the returned state lets the client explain how to restore availability.

**Verification:**

- [ ] API integration tests cover success, invalid input, unauthenticated access, cross-account access, and atomic update failure.
- [ ] Security review confirms boundary validation and no PII logging.

**Dependencies:** Task 1; real authentication/session ownership in the API.

**Likely files:** `apps/api` account controller/service/DTO/validation/tests.

### Task 3: Preserve monitoring independently from delivery preferences

**Description:** Implement the worker's event-to-delivery boundary so monitoring records restock/price-change events first, then applies enabled delivery channels.

**Acceptance criteria:**

- [ ] Partner polling and event detection run for every selected item regardless of any preference, verification, or device-permission state.
- [ ] Any observed price decrease produces one eligible event per changed price; enabled available channels receive it once according to delivery/idempotency rules, while disabled or unavailable channels receive no delivery attempt.
- [ ] Turning every toggle off still records the monitoring event and keeps the selected item eligible for later checks.

**Verification:**

- [ ] Worker integration tests exercise each alert type/channel combination and the all-disabled case.
- [ ] Test assertions distinguish event detection/persistence from push/email dispatch attempts.

**Dependencies:** Tasks 1-2; tracked-item and stock-event worker foundations.

**Likely files:** `apps/api` worker/event/delivery modules and integration tests.

### Checkpoint: Backend behavior

- [ ] Contract, authorization, migration, and worker invariant tests are green.
- [ ] A reviewer confirms that no preference gates monitoring or event persistence.

### Task 4: Add the mobile Account Info screen and navigation

**Description:** Add an authenticated route reachable from Home, with grouped profile fields and a clearly labeled Alert preferences section containing four accessible toggle controls.

**Acceptance criteria:**

- [ ] Username, email, and optional phone are editable; the empty phone field is saved as absent rather than a placeholder value.
- [ ] Restock and price-change rows each provide independent Push and Email controls, with helper copy stating that delivery settings do not stop item monitoring.
- [ ] The screen shows pending-email verification and push-unavailable states without changing the user's saved delivery choices; it has loading, error/retry, disabled-saving, validation, and save-success states and follows the existing black/white mobile styling without introducing a new UI library.

**Verification:**

- [ ] React Native Testing Library tests cover rendering, required-field validation, each toggle, retry, successful save, pending email verification, and push-unavailable remediation.
- [ ] Screen-reader labels/state and touch targets are manually checked on an Android emulator.

**Dependencies:** Task 2 contract (or a deliberately isolated typed repository mock for an earlier UI-only slice).

**Likely files:** `apps/mobile/app/account.tsx`, `apps/mobile/features/account/AccountInfoScreen.tsx`, account styles/client/types/tests, `apps/mobile/app/home.tsx`, `apps/mobile/features/home/HomeScreen.tsx`.

### Task 5: Connect mobile state to the authenticated API and complete regression coverage

**Description:** Replace any UI-only fixture with the account API client, preserve server-canonical values after save, and cover the full flow.

**Acceptance criteria:**

- [ ] The app loads and saves through the authenticated contract, displays safe failure states, and does not expose other-account data.
- [ ] Updated settings persist after a screen reload/session refresh.
- [ ] Existing login, account-creation, and logout prototype tests remain valid or are intentionally updated to reflect real authentication behavior.

**Verification:**

- [ ] Focused mobile tests plus API/worker integration suites pass.
- [ ] `npm run verify`, `npm run audit`, `npm run test:smoke`, `git diff --check`, and the mobile test/typecheck commands pass under Node 22.14.0.

**Dependencies:** Tasks 2 and 4.

**Likely files:** account API client/hook, mobile route/screen tests, API contract tests.

### Checkpoint: Feature complete

- [ ] Profile changes, all four delivery controls, validation, and persistence work end-to-end.
- [ ] The all-disabled test demonstrates continued event detection with zero delivery attempts.
- [ ] Accessibility and PII/authentication review are complete.

## Dependency Order

```text
Task 1 (contract + data) -> Task 2 (authorized API) -> Task 4 (mobile page) -> Task 5 (end-to-end)
                                  \
                                   -> Task 3 (worker delivery boundary)
```

Tasks 3 and 4 may proceed in parallel after the contract and Task 2's ownership/validation behavior are stable. The migration and contract must be sequential and reviewed first.

## Risks and Mitigations

| Risk                                                                             | Impact | Mitigation                                                                                                       |
| -------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------- |
| Preferences accidentally gate polling                                            | High   | Keep event detection before preference lookup; make the all-disabled monitoring test a required regression test. |
| Email change enables delivery to an unverified address                           | High   | Keep the prior verified email active until managed identity-provider verification completes.                     |
| Profile endpoint leaks or edits another user's data                              | High   | Derive identity from authentication, enforce per-account authorization, and test cross-account attempts.         |
| UI and worker interpret preference names differently                             | Medium | Define a shared finite contract for two alert kinds and two channels; contract-test it.                          |
| Existing prototype treats phone as an alternate login/contact and mentions texts | Medium | Make email required, retain phone as nullable profile data, and remove SMS language in the same change.          |
| Push is enabled but cannot reach the active device                               | Medium | Preserve intent, surface availability/remediation in the client, and re-register tokens when permission returns. |
| Small price fluctuations create repeated alerts                                  | Medium | Emit only on a decrease and deduplicate delivery for the same observed price.                                    |

## Deferred Decisions

- The managed identity provider has not yet been selected, so the precise email-change re-verification flow is deferred.
- Push-token registration implementation, email provider selection, and notification deduplication retention windows belong to their respective future delivery specifications.
