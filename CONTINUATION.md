# NAQLA HR AI System — Continuation Notes

Status snapshot as of 2026-07-13. Read this before picking the work back up.

## Where things are

- Repo: `C:\Dev\naqla-hr-system` (moved out of the original OneDrive `Desktop\HR AI System` folder — OneDrive syncing `node_modules` causes lock/perf issues). Reference files are at `reference-assets/` in this repo:
  - `People.docx` — the full functional spec this system is built from
  - `Naqla People & Culture.html` — branding export (dark `#211E1F` bg, pink `#F90D81` accent, Poppins/Figtree fonts, wordmark "naqla.")
  - `logos black_white.pdf`
  - `HAY-TOOL-CONTINUATION.md` — source notes for the standalone Hay job-evaluation HTML tool that `lib/hay-evaluation.ts` was ported from
  - `CPA-TOOL-CONTINUATION.md` — source notes for the standalone Critical Position Assessment HTML tool that the Critical Positions module was ported from
- GitHub: **https://github.com/ahmedsallam85/Naqla-HR-System** (private, repo was renamed — old URL `Naqlq-HR-System` now redirects). Two branches: `main` and `staging`, both at the same commit.
- Sister project **`hr-payroll-saas`** (Python/Flask, `Sallam10/hr-payroll-saas`) has a verified Egyptian payroll tax engine used as reference for the Compensation module — ported to TypeScript, not called at runtime.
- Original build plan: `C:\Users\AhmedSallam\.claude\plans\glittery-forging-castle.md`.

## How to run it locally

```bash
cd /c/Dev/naqla-hr-system
npm run dev
```

Open `http://localhost:3000/login`. Local `.env` `DATABASE_URL` points at the **staging** Postgres database.

## Hosting (Railway + GitHub)

Project `naqla-hr-system` on Railway (workspace: ahmedsallam85's Projects):

| | Staging (test) | Production (live) |
|---|---|---|
| URL | https://web-staging-f27e.up.railway.app | https://web-production-352ade.up.railway.app |
| Postgres service | `Postgres` (eaa669c4) | `Postgres-SlGU` (2afe8b8d) |
| Login | `admin@naqla.com` / `ChangeMe123!` | `ahmed.sallam@naqlq.xyz` / (set by user) |

**Deploy command**: `railway up --service web --environment <staging|production> --detach`

**Promotion flow**: deploy to staging, verify, then deploy to production separately.

> ⚠️ **IMPORTANT — Postgres services were recreated on 2026-07-04** (both environments suffered a Railway private networking failure). Old service names `Postgres-Vts9` (production) and any prior staging Postgres are gone. Current services are in the table above.

> ⚠️ **IMPORTANT — Production Postgres backups not yet enabled.** Railway volumes are the only copy of production data. Enable Point-in-Time Recovery: Railway dashboard → Production → Postgres-SlGU → Settings → Backups. Must be done before real HR data is entered.

## Start script — has retry logic

`package.json` `start` script retries the DB connection up to 12 times (2 minutes) before giving up — Railway sometimes starts the web container before Postgres is ready:

```json
"start": "sh -c 'i=0; until prisma migrate deploy; do i=$((i+1)); if [ $i -ge 12 ]; then echo \"DB unreachable after 12 retries\"; exit 1; fi; echo \"DB not ready, retry $i/12 in 10s...\"; sleep 10; done && next start'"
```

## Gotchas hit while building

- **Prisma 7 dropped schema-level `url =` on datasource.** Must use explicit driver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })`. Plain `new PrismaClient()` throws.
- **Prisma client entry point is `lib/generated/prisma/client`**, not `lib/generated/prisma` — no index barrel.
- **shadcn/ui uses `@base-ui/react`, not Radix.** `Button` takes `render` prop, needs `nativeButton={false}` for non-`<button>` elements.
- **Next.js 16 renamed `middleware.ts` to `proxy.ts`** (identical export contract).
- **NextAuth v5 `auth()` HOF breaks as `proxy.ts` default export under Next 16** — use `getToken` from `next-auth/jwt` directly with `secureCookie: process.env.NODE_ENV === "production"`.
- **`trustHost: true`** required in `auth.ts` for production; **`AUTH_URL`** must be exact public HTTPS domain.
- **Railway private networking breaks permanently after a Postgres crash.** `P1001: Can't reach database server at <name>.railway.internal` even when service shows Online. Fix: delete and recreate the Postgres service — volume is preserved automatically.
- **Railway's public TCP proxy (`*.proxy.rlwy.net`) is NOT reachable from within Railway containers.** Switching `DATABASE_URL` to the public URL doesn't help — P1001 still fires inside the container.
- **`railway add --database postgres` has no `--environment` flag.** Switch environment first: `railway environment <staging|production>`, then add.
- **Old Postgres volume's `pg_authid` takes precedence over new service credentials.** When attaching an old volume to a new Postgres service, use the OLD password — the new `POSTGRES_PASSWORD` env var is ignored.
- **Railway volume persists after service deletion** — appears as "detached" in `railway volume list`. This is how data recovery works.
- **Data recovery procedure** (used twice on 2026-07-04, works reliably):
  1. `railway add --database postgres --json` → note new service ID and its auto-created volume ID
  2. `railway volume detach --volume <new-vol-id> --yes`
  3. `railway service link <temp-service-id>`
  4. `railway volume attach --volume <old-vol-id> --yes` — wait ~20s for redeploy
  5. Write `recover-data.mjs` in project root using `pg` (already in `node_modules`), src = old service public URL + OLD password, dst = new service public URL + new password
  6. `node recover-data.mjs`
  7. `railway service delete --service <name> --environment <env> --yes`
  8. Delete `recover-data.mjs`
- **`railway service delete` needs `--yes` + explicit `--service` + `--environment`** in non-interactive mode.
- **Static routes take precedence over dynamic `[param]` routes in Next.js App Router.** `/compensation/payroll` and `/compensation/incentives` resolve before `[employeeId]` catches them — no conflict.
- **optional enum form fields need `optionalEnum` zod helper** — plain `z.enum([...]).optional()` doesn't treat `""` as unset.
- **One-off Prisma scripts must live inside the project tree** — `npx tsx` won't resolve `@/lib/prisma` from outside the repo. Write to repo root, run, delete.
- **Prisma `reportingManagerId` type conflict** — `string | undefined` not assignable to `EmployeeCreateInput` union. Fixed with `as any` in `app/api/employees/route.ts` and `app/api/employees/[id]/route.ts`.

## What's built

### Sidebar
Collapsible navigation. Items with `children` render as a toggle button (chevron rotates on open/close). Auto-expands if the current path is within the section. Currently only **Compensation** has children. Pattern is in `components/app-sidebar.tsx` — extend `NAV_ITEMS` to add sub-items to other sections.

### People Directory
`/personnel` — renamed from "Personnel" (URL unchanged). Full Employee schema with 8 form sections matching the Employee Master Log Template. Role-gated CRUD at `/api/employees`. Form: numbered section headers (1–8) with muted background, consistent `h-10` field height, 3-column grid for 3-field sections. Detail view: same numbered headers, `grid-cols-2 lg:grid-cols-3`.

**20 fields added** in migration `20260704000000_people_directory_fields`:
- Personal: `nationality`, `numberOfDependents`
- Contact/Emergency: `emergencyContactName`, `emergencyContactRelationship`, `emergencyContactPhone`
- Employment: `probationEndDate`, `legalEntity`, `costCenter`, `lastPromotionTransferDate`, `previousDesignation`
- Compensation: `socialInsuranceSalary`
- Leave: `annualLeaveBalance`, `sickLeaveTaken`, `hajjLeaveUsed`
- Legal: `workPermitStatus`, `contractSigned`, `laborLawCategory`
- Exit: `reasonForLeaving`, `endOfServiceSettlement`, `rehireEligible`

`firstName`/`lastName` made nullable (migration `20260704000001_nullable_first_last_name`). Form uses single **Full Name (as on National ID)** field. `employeeCode` is auto-generated and read-only.

Six new lookup categories: `NATIONALITY`, `EMERGENCY_CONTACT_RELATIONSHIP`, `LEGAL_ENTITY`, `COST_CENTER`, `WORK_PERMIT_STATUS`, `LABOR_LAW_CATEGORY`.

### Admin — Dropdown Lists
`/admin/lookups` (HR_ADMIN only). `LookupValue` table backs org-placement and other select fields. Field metadata in `lib/employee-fields.ts`.

### Bulk Excel Import/Export
Personnel toolbar. `lib/excel-template.ts` (exceljs). Matches rows by Employee Code/Business Email, creates new ones, auto-adds lookup values, reports per-row errors.

### Job Grading
`/job-grading`. Hay methodology calculator (`lib/hay-evaluation.ts`). `JobRole` + `JobEvaluation` models. **No Naqla grade → compensation bracket mapping yet.**

### Critical Positions / Succession Planning
`/critical-positions`. `Designation` master list, 13-question `CriticalAssessment` (0–65, 4 priority bands), `SuccessProfile` per position. **Known gaps**: Results bar-chart dashboard and 3-sheet Excel export not ported; 13 question texts need HR review.

### Compensation
`/compensation` (HR_ADMIN only). Now has two sub-modules reachable from a collapsible sidebar entry:

- **Payroll** (`/compensation/payroll`) — Egyptian payroll tax engine (`lib/payroll-tax.ts`), `CompensationRecord` (versioned, Standard gross-in or Reverse net-in), `CompensationDeduction`, `CompensationAddition`, bank-transfer Excel export (`BankTransferExport`). **Known gap**: bank file column layout is a placeholder — real bank format not yet provided.
- **Incentives** (`/compensation/incentives`) — empty placeholder, coming later.

`/compensation` redirects to `/compensation/payroll`. Employee detail pages remain at `/compensation/[employeeId]` — static sub-routes (`/payroll`, `/incentives`) take precedence in the router.

## Not yet built (remaining phases)

Per `reference-assets/People.docx`:

1. **Recruitment** — requisition workflow, AI CV screening/sourcing, interview pipeline, AI-drafted offer letters, email automation, Zoho Recruit integration.
2. **Onboarding** — session assignment, onboarding video auto-send, calendar invites, handbook/welcome emails, completion notifications.
3. **Performance Management** — monthly scorecard (MSC) cycle, probation-evaluation notifications at day 75/80.
4. **Talent Management (9-box grid)** — performance × potential grid; not started.
5. **HR chatbot** — Claude-API-backed assistant over company policy docs.
6. **Compensation → Incentives** — sub-module stub exists at `/compensation/incentives`; content TBD.

Smaller gaps in shipped modules:
- Critical Positions: Results bar-chart dashboard, 3-sheet Excel export, 13-question wording review.
- Job Grading: grade → compensation bracket mapping.
- Compensation / Payroll: real bank-transfer file format.
- **Production Postgres backups: NOT YET ENABLED** — urgent.

## Suggested next step

1. **Enable Railway Postgres backups on production** (Postgres-SlGU) — do this before any real HR data is entered.
2. **Incentives sub-module** — content and data model TBD with HR; stub is already in place.
3. **Recruitment** — next major phase per spec order; worth a planning pass first (AI CV screening + Zoho Recruit integration decision).
