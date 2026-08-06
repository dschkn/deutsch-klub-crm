# CRM architecture audit

**Branch:** `test-development`  
**Audit date:** 2026-08-06  
**Frozen baseline:** `afddf3139752a7c8c4efaf57720a3efeb029d6c0`  
**Baseline marker:** `>>---------------- EXACT COPY OF THE CURRENT WORKING VERSION ----------------`

## Executive summary

The CRM is a working React/Vite prototype, not a static HTML mock. It has routing, reusable UI components, a normalized in-memory data store, CRUD methods, selectors, local session handling, schedule interactions and an optional read-only Supabase hydration layer.

It is not yet a production CRM. The application currently mixes three data modes:

1. normalized entities from `DataStore`;
2. synthetic or imported demo collections from `src/data`;
3. browser-only state stored in React state or `localStorage`.

This mixture is the main architectural risk. A screen may look complete while only part of its data or actions are persistent.

## Current module status

| Area | Status | What is real now | What is still prototype-only |
| --- | --- | --- | --- |
| Build and deployment | Working | Vite build, TypeScript, ESLint and automatic deployment from `test-development` | No end-to-end smoke test after deployment |
| Routing | Working | Protected lazy-loaded routes and shared layout | Permission-based route enforcement is not implemented |
| Session and login | Partial | Browser session key and current-user lookup | Demo credentials are hard-coded; email login accepts any non-empty password; no Supabase Auth |
| Data model | Working foundation | Normalized maps, entity IDs, CRUD methods and relations | Legacy UI types are still reconstructed through selectors |
| Supabase | Partial | Optional read-only loading into `DataStore` | No writes, migrations contract, Auth integration or audited RLS policies |
| Students | Mostly working prototype | Lists, filters, pagination and detail views use selectors | Data is snapshotted on mount and may not react to later store changes |
| Groups | Mixed | Comments use `DataStore` CRUD | Group list is based on `realGroups` demo data; changes are not persisted remotely |
| Teacher schedule | Feature-rich prototype | Drag/drop, dialogs, comments, individual lessons and schedule rendering | Large monolith; mixes sample data, `DataStore` and `localStorage`; no server write path |
| Payments | Read-only prototype | Reads normalized payments and students | Add/export controls are presentation-only; no persistent payment workflow |
| Chats | Interactive mock | Local message composition works in the current component state | No messaging provider, API, persistence or delivery state integration |
| Reports | Derived demo analytics | Several charts derive values from store selectors | Some values and fallbacks are synthetic; export is not implemented |
| Settings | UI mock | Current demo user is displayed and switches work locally | Save, password, integrations and most settings are not persisted |
| Notifications | UI mock | Header presentation exists | Badge count is static and no notification service is connected |

## Confirmed architectural strengths

- Pages are already lazy-loaded, so the whole CRM is not shipped as one initial route chunk.
- `DataStore` keeps normalized entities by ID instead of embedding deeply duplicated objects.
- The store exposes subscriptions and CRUD methods, which is a usable base for a reactive adapter.
- Domain types already cover students, teachers, groups, schedule items, rooms, branches, permissions and future infrastructure entities.
- Supabase hydration is deliberately read-only until schema, authentication and RLS are audited.
- The deployment workflow verifies TypeScript, linting and production build before uploading a release.

## Main risks and likely error sources

### 1. Three competing sources of truth

Several pages combine `sampleData`, `realGroups`, selector output, component state and `localStorage`. The same entity can therefore have different values on different screens.

### 2. Store subscriptions are mostly unused

`DataStore` can notify listeners, but many pages call selectors inside `useMemo(..., [])`. They receive a snapshot at mount and may not refresh after CRUD operations or a future background sync.

### 3. Supabase is hydration, not persistence

The current integration reads tables into browser memory. Changes performed in the CRM are not written back to Supabase. Refreshing the page can therefore discard edits unless a feature separately uses `localStorage`.

### 4. Authentication is only a demo gate

The route guard checks whether a local storage key exists. It does not validate a token, user status, role, password or server session. This must not be treated as security.

### 5. `TeacherSchedule.tsx` is a monolith

The file is approximately 120 KB and owns rendering, drag/drop, forms, recurrence, comments, local persistence, validation and schedule calculations. This raises render cost, regression risk and the cost of connecting a real backend.

### 6. Legacy and normalized types coexist

`src/data/selectors.ts` converts normalized entities back into older nested UI types. This compatibility layer is useful during migration, but it adds repeated work and can silently fill missing fields with placeholders.

### 7. Automated coverage is missing

The CI pipeline runs typecheck, lint and build. No unit, integration or browser test suite is currently detected. A build can succeed while a dialog, drag operation or data conversion is broken.

### 8. Hard-coded domain assumptions

The code contains demo user IDs, static credentials, static managers, 2026 holidays, fallback KPI values and other temporary constants. These must move into configuration or database tables before production use.

## Refactoring performed in this cleanup

1. Created an immutable baseline commit with the exact working tree.
2. Removed the duplicate legacy CI workflow so one push no longer runs two full installations and builds.
3. Changed Supabase table hydration from sequential reads to parallel reads while preserving the same fallback behavior.
4. Moved protected route declarations and authentication storage constants out of `App.tsx` and the auth hook into dedicated configuration files.
5. Added this audit so future changes can distinguish working infrastructure from demo behavior.

No visual design or user-facing workflow was intentionally changed.

## Recommended next architecture

### Phase 1: introduce a data-access boundary

Create repository interfaces such as:

- `StudentRepository`
- `GroupRepository`
- `ScheduleRepository`
- `PaymentRepository`
- `AuthRepository`

The UI should call repositories instead of importing `sampleData`, `realGroups` or Supabase directly. A demo repository and a Supabase repository can then implement the same contract.

### Phase 2: establish the shared CRM and Teacher App schema

Prioritize stable tables and relations for:

- users and roles;
- teachers and students;
- groups and memberships;
- schedule items and recurrence;
- attendance;
- teacher availability;
- rooms and branches;
- payments and contracts;
- comments and audit history.

### Phase 3: implement real Auth and RLS

Replace the local storage gate with Supabase Auth or another server-side session system. Define RLS policies before enabling writes.

### Phase 4: split the schedule vertically

Extract schedule state, persistence, drag/drop, recurrence, forms and rendering into separate hooks and components. Keep one feature working end-to-end while moving it to repository-backed data.

### Phase 5: replace mocks one workflow at a time

A safe order is:

1. authentication;
2. students;
3. teachers;
4. groups;
5. schedule and attendance;
6. payments and contracts;
7. chats, reports and integrations.

### Phase 6: add regression tests

At minimum:

- selector and date-conversion unit tests;
- repository contract tests;
- login and route-guard integration tests;
- schedule drag/drop and recurrence tests;
- one deployed smoke test that opens the CRM and verifies the main route.
