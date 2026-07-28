# Next.js + NestJS Migration Status

> Operational tracker for the gradual migration. This file is intentionally mirrored in `finance-control-app` and `finance-control-backend`; update both copies in the same delivery.
>
> Last review: 2026-07-28
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
- [~] Global Biome baseline remains to be reduced; all files changed in this migration must pass Biome.

## Security and platform

- [x] Nest exposes `/health/live`, `/health/ready`, request IDs, compatible error envelopes and rate-limit responses with `Retry-After`.
- [x] Auth endpoints exist: login, register, deprecated email adapter, Google callback, CSRF, refresh, logout and `/auth/me`.
- [x] Admin authorization uses server-controlled `app_metadata.role`; no `NEXT_PUBLIC_ADMIN_USER_ID` remains.
- [x] Request-scoped Supabase client receives the user token; privileged `service_role` access is explicit.
- [~] RLS hardening migrations, invite policy/constraints and `finance_mutate_transaction` are written but not yet executed against local Supabase.
- [~] Real cookie, refresh, reCAPTCHA, referral and rate-limit behavior awaits local Supabase E2E.

## Domain rollout tracker

### Auth, profile and settings

- [x] Nest endpoints and TanStack hooks exist for session, profile and settings.
- [x] Settings form no longer accesses Supabase directly; it uses the query/mutation hooks and preserves the flag fallback.
- [~] Local browser and Supertest proof is pending.
- [ ] Remove legacy auth/profile Route Handlers and Server Actions only after local and staging approval.

### Accounts, categories and transactions (financial core)

- [x] Nest CRUD, individual transaction lookup, filters, pagination and transaction statistics are implemented.
- [x] Frontend accounts, categories and transactions have TanStack hooks, query keys and rollback flags.
- [x] Atomic transaction RPC and additive RLS migrations are versioned.
- [~] Run PgTAP ownership/RPC tests with users A and B locally.
- [~] Run authenticated Supertest and Playwright flow: register, login, account/category/transaction CRUD, account swap, balance check and logout.
- [ ] Remove legacy financial Server Actions and Route Handlers only after parity fixtures and staging approval.

### Dashboard, reports and export

- [~] Nest dashboard and export endpoints exist; frontend has conditional dashboard/report hooks.
- [ ] Capture legacy response fixtures and assert JSON parity.
- [ ] Add server prefetch/hydration for dashboard and first transaction page.
- [ ] Activate `dashboard` locally, add E2E, then retire equivalent legacy paths.

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

## Local validation gate (current blocker)

- [!] Docker Desktop is not running; this tracker must never start it automatically.
- [!] `finance-control-backend/.env.e2e` is absent. Create it manually from `.env.e2e.example` and fill only local Supabase values.
- [ ] Manually run `supabase start` after Docker is ready.
- [ ] `pnpm db:reset:local`.
- [ ] `pnpm db:test` (PgTAP RLS and atomic RPC assertions).
- [ ] `pnpm test:e2e:local` in the backend.
- [ ] `pnpm test:e2e:local` in the frontend (Chromium, Firefox and WebKit).

## Legacy removal gate

- [ ] Remove the 43 Next Route Handlers only domain by domain after the respective rollout gate passes.
- [ ] Remove the 14 Server Action files only after their Nest replacement, parity fixture and E2E proof exist.
- [ ] Remove Supabase browser helpers, `next-auth`, Resend and other backend-only dependencies only when no references remain.
- [ ] Remove rollout flags only after all domains are proven in staging.

## Release gate

- [ ] Local Supabase migrations/RLS validated.
- [ ] Backend: Biome, typecheck, build, Jest, authenticated E2E and OpenAPI check are green.
- [ ] Frontend: Biome, typecheck, contracts check, Vitest, build and three-browser Playwright are green.
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