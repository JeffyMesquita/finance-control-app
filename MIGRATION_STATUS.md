# Next.js + NestJS Migration Status

> Operational tracker for the gradual migration. This file is intentionally mirrored in `finance-control-app` and `finance-control-backend`; update both copies in the same delivery.
>
> Last review: 2026-07-29
> Branch: `codex/complete-next-nest-migration`
> Scope: local work only. No remote migration, deploy, push, or PR is authorized by this tracker.

## Marking rules

- `[x]` Implemented and verified by the stated local gate.
- `[~]` Implemented in code, but still needs the stated local-infrastructure or parity proof.
- `[ ]` Not started for this migration cut.
- `[!]` Externally blocked or waiting for an explicit human action.

Do not move an item to `[x]` without adding its command/test evidence in the **Delivery log** below. Keep legacy routes and Server Actions until the domain reaches `[x]` in local validation and staging approval is explicitly granted.

## Current foundation

- [x] Next.js 16.2.12, React 19.2.8, TanStack Query 5 and Biome 2.5.5 are pinned in the frontend.
- [x] NestJS 11, Swagger, Throttler and Biome 2.5.5 are pinned in the backend.
- [x] Browser API path is same-origin: `/api/backend/*` rewrites to `${BACKEND_API_ORIGIN}/api/v1/*`.
- [x] Nest OpenAPI is versioned; frontend keeps a synchronized copy and generated schema.
- [x] Shared HTTP client has credentials, CSRF, timeout/abort, typed errors, one refresh flight and `Retry-After` support.
- [x] Feature flags use `NEXT_PUBLIC_NEST_DOMAINS`, allowing domain rollback.
- [~] Global Biome baseline remains to be reduced; all changed TypeScript files in this migration pass targeted Biome checks. Generated OpenAPI is validated by its dedicated contract gate.

## Security and platform

- [x] Nest exposes `/health/live`, `/health/ready`, request IDs, compatible error envelopes and rate-limit responses with `Retry-After`.
- [x] Auth endpoints exist: login, register, deprecated email adapter, Google callback, CSRF, refresh, logout and `/auth/me`.
- [x] Admin authorization uses server-controlled `app_metadata.role`; no `NEXT_PUBLIC_ADMIN_USER_ID` remains.
- [x] Request-scoped Supabase client receives the user token; privileged `service_role` access is explicit.
- [x] RLS hardening migrations, invite policy/constraints and `finance_mutate_transaction` were executed and validated against local Supabase.
- [x] Real cookie, refresh, reCAPTCHA (E2E adapter), referral and rate-limit behavior passed authenticated local E2E.

## Domain rollout tracker

### Auth, profile and settings

- [x] Nest endpoints and TanStack hooks exist for session, profile and settings.
- [x] Settings form no longer accesses Supabase directly; it uses the query/mutation hooks and preserves the flag fallback.
- [x] Authenticated Supertest and browser proof passed locally.
- [ ] Remove legacy auth/profile Route Handlers and Server Actions only after local and staging approval.

### Accounts, categories and transactions (financial core)

- [x] Nest CRUD, individual transaction lookup, filters, pagination and transaction statistics are implemented.
- [x] Frontend accounts, categories and transactions have TanStack hooks, query keys and rollback flags.
- [x] Atomic transaction RPC and additive RLS migrations are versioned.
- [x] PgTAP ownership/RPC tests with users A and B passed locally (45 assertions).
- [x] Authenticated Supertest passed (5 suites/6 tests) and Playwright passed the complete flow in Chromium, Firefox and WebKit (3 tests).
- [ ] Remove legacy financial Server Actions and Route Handlers only after parity fixtures and staging approval.

### Dashboard, reports and export

- [x] Nest dashboard, reports and export endpoints exist; frontend flags, TanStack hooks and binary downloads are active locally.
- [x] Deterministic parity fixtures cover dashboard cards, six monthly points, current/previous expense breakdown, reports overview and all five export datasets; the backend fixture suite passed.
- [x] Dashboard and reports use shared TanStack `queryOptions`, server-only cookie forwarding, `prefetchQuery`, `dehydrate` and `HydrationBoundary`; the browser matrix verified no immediate duplicate refetch and preserved the 401 fallback.
- [x] PDF generation uses `pdf-lib` with A4 layout, wrapping, multiple pages and injectable deterministic metadata; the PDF validity suite passed.
- [x] Activate `dashboard,reports,export` locally and cover the Nest path in the three-browser E2E; legacy paths remain for rollback.

### Goals and savings boxes

- [~] Nest CRUD exists and initial frontend hooks are flag-aware.
- [ ] Implement/test atomic deposits, withdrawals and transfers with ownership, locks and correlated balances.
- [ ] Complete query keys, mutations, parity fixtures and E2E before local activation.

### Investments

- [~] Nest CRUD exists.
- [ ] Finalize legacy snake_case contract, portfolio/summary, asset movements and atomic invested-value updates.
- [ ] Add OpenAPI sync, TanStack hooks, parity fixtures and E2E before activation.

### Feedback, referrals and administration

- [~] Admin summary/users and first-touch referral security foundations exist.
- [ ] Migrate feedback, notification/e-mail, referral, badges and full administration flows to Nest.
- [ ] Add AdminGuard/service-role integration tests and remove remaining frontend privileged dependencies.

## Local validation gate

- [x] Loopback-only preflight passed against local Supabase; no Docker or remote service was started by the test runner.
- [x] `pnpm db:test` passed: 45 PgTAP/RLS/RPC assertions.
- [x] `pnpm test:e2e:local` in the backend passed: 5 suites / 6 tests.
- [x] Backend Jest passed: 69 suites / 477 tests, including PDF and dashboard/report/export parity fixtures.
- [x] `pnpm exec playwright test e2e/core-finance.spec.ts` passed: 3 tests in Chromium, Firefox and WebKit, including hydrated dashboard/reports and CSV/PDF/JSON downloads.
- [x] `pnpm contracts:check` passed after synchronizing the generated frontend schema.
- [~] Biome global baseline is measured and did not increase: backend `HEAD 331 errors / 556 warnings` -> current `192 / 553`; frontend `HEAD 532 / 331` -> current `531 / 330`. All touched TypeScript files pass targeted Biome; legacy global violations remain.

## Legacy removal gate

- [ ] Remove the 43 Next Route Handlers only domain by domain after the respective rollout gate passes.
- [ ] Remove the 14 Server Action files only after their Nest replacement, parity fixture and E2E proof exist.
- [ ] Remove Supabase browser helpers, `next-auth`, Resend and other backend-only dependencies only when no references remain.
- [ ] Remove rollout flags only after all domains are proven in staging.

## Release gate

- [x] Local Supabase migrations/RLS validated.
- [x] Backend: typecheck, build, Jest (69 suites/477 tests), authenticated E2E, PgTAP, PDF/parity fixtures and OpenAPI generation/check are green; global Biome baseline remains [~].
- [x] Frontend: targeted Biome, typecheck, contracts check, Vitest (3 files/6 tests), build and three-browser Playwright are green; global Biome baseline remains [~].
- [ ] Staging sequence approved: migrations/RLS -> Nest -> frontend -> per-domain flag activation.
- [ ] Production authorization explicitly granted. This item remains unchecked by default.

## Delivery log

| Date | Area | Evidence | Result |
| --- | --- | --- | --- |
| 2026-07-28 | Backend database | `ed26058` | Added local RLS, referral integrity and financial RPC PgTAP coverage. |
| 2026-07-28 | Backend E2E | `6468682` | Added loopback-only preflight and authenticated local finance E2E harness. |
| 2026-07-28 | Frontend security | `826fc0a` | Replaced public admin-ID fallback with server role. |
| 2026-07-28 | Frontend financial E2E | `701d10e` | Added local three-browser core-finance journey. |
| 2026-07-28 | Frontend settings | `a462672` | Removed direct browser Supabase access from settings. Typecheck, Vitest, Biome and build passed. |
| 2026-07-29 | Financial core | `pnpm db:test` | 45 PgTAP/RLS/RPC assertions passed, including recurring interval and atomic ownership failures. |
| 2026-07-29 | Backend API | `pnpm exec jest --runInBand` | 69 suites / 477 tests passed; `pnpm test:e2e:local` passed 5 suites / 6 tests. |
| 2026-07-29 | Dashboard/reports/export | `pnpm exec jest --runInBand test/parity/dashboard-reports-export.fixture.spec.ts` | Deterministic dashboard, six-month, expense, reports and five export fixtures matched the Nest contracts. |
| 2026-07-29 | PDF export | `pnpm exec jest --runInBand src/infrastructure/export/pdf-export.service.spec.ts` | `pdf-lib` produced a valid multi-page A4 PDF with deterministic metadata and pt-BR text. |
| 2026-07-29 | SSR/hydration | `pnpm build` + Playwright matrix | Dashboard and reports prefetched through the server-only client, hydrated with shared keys, avoided immediate browser refetch and preserved 401 fallback. |
| 2026-07-29 | Frontend gates | `pnpm typecheck`, `pnpm contracts:check`, `pnpm test:unit`, `pnpm build` | Typecheck, contract sync, 3 unit files / 6 tests and production build passed. |
| 2026-07-29 | Browser matrix | `pnpm exec playwright test e2e/core-finance.spec.ts` | 3 tests passed: Chromium, Firefox and WebKit. |
| 2026-07-29 | Biome baseline | `biome ci --reporter=summary` against current worktree and archived `HEAD` | Backend 331/556 -> 192/553; frontend 532/331 -> 531/330 (errors/warnings). |
