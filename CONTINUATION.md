# NAQLA HR AI System — Continuation Notes

Status snapshot as of 2026-07-04. Read this before picking the work back up.

## Where things are

- Repo: `C:\Dev\naqla-hr-system` (moved out of the original OneDrive `Desktop\HR AI System` folder on purpose — OneDrive syncing `node_modules` causes lock/perf issues). The original reference files still live there too, and copies are at `reference-assets/` in this repo:
  - `People.docx` — the full functional spec this system is built from
  - `Naqla People & Culture.html` — branding export (dark `#211E1F` bg, pink `#F90D81` accent, Poppins/Figtree fonts, wordmark "naqla.")
  - `logos black_white.pdf`
  - `HAY-TOOL-CONTINUATION.md` — source notes for the standalone Hay job-evaluation HTML tool that `lib/hay-evaluation.ts` was ported from
  - `CPA-TOOL-CONTINUATION.md` — source notes for the standalone Critical Position Assessment HTML tool that the Critical Positions module was ported from
- GitHub: **https://github.com/ahmedsallam85/Naqlq-HR-System** (private). Two branches: `main` and `staging`.
- A separate, already-built sister project owned by the same user — **`hr-payroll-saas`** (Python/Flask, repo `Sallam10/hr-payroll-saas`, local copy at `C:\Users\AhmedSallam\OneDrive - NAQLA Trucking\Desktop\HR AI System\Payroll\hr-payroll-saas-main\`) — has a verified Egyptian payroll tax engine (`modules/tax_engine.py`) and full payroll schema. It was used as reference/source material for this repo's Compensation module (ported, not called into at runtime — this app stays single-stack TypeScript).
- Build plan that was approved for the original Phase 0/1 scaffold: `C:\Users\AhmedSallam\.claude\plans\glittery-forging-castle.md`.

## How to run it locally

```bash
cd /c/Dev/naqla-hr-system
npm run dev
```

Open `http://localhost:3000/login`. Local dev's `.env` `DATABASE_URL` points at the **staging** Postgres database (no local SQLite — the whole app runs on PostgreSQL everywhere now).

## Hosting (Railway + GitHub)

Project `naqla-hr-system` on Railway (workspace: ahmedsallam85's Projects), two environments:

| | Staging (test) | Production (live) |
|---|---|---|
| URL | https://web-staging-f27e.up.railway.app | https://web-production-352ade.up.railway.app |
| Postgres service | `Postgres` (eaa669c4) | `Postgres-SlGU` (2afe8b8d) |
| Login | `admin@naqla.com` / `ChangeMe123!` | `ahmed.sallam@naqlq.xyz` / (set by user) |

**Day-to-day workflow**: `railway up --service web --environment <staging|production> --detach`. The Railway CLI must be linked to the right environment first (`railway environment staging` or `railway environment production`) before running `railway add`. The web service is the same Railway service shared across both environments (same service ID `ae073393`).

**Established promotion flow**: build + verify on staging first, then deploy to production separately.

> ⚠️ **IMPORTANT — Postgres services were recreated on 2026-07-04** (both staging and production). Both suffered a Railway private networking failure (see Gotchas below). The Postgres service names and credentials changed. If anything references the old service names `Postgres-Vts9` (production) or any previous staging Postgres, those are gone. Current active services are listed in the table above.

> ⚠️ **IMPORTANT — Back up the production Postgres.** Railway volumes are the only copy of production data. Enable Point-in-Time Recovery in the Railway dashboard: Production → Postgres-SlGU → Settings → Backups. This has not been set up yet as of this session.

## Start script — has retry logic

`package.json`'s `start` script was changed from `prisma migrate deploy && next start` to:

```json
"start": "sh -c 'i=0; until prisma migrate deploy; do i=$((i+1)); if [ $i -ge 12 ]; then echo \"DB unreachable after 12 retries\"; exit 1; fi; echo \"DB not ready, retry $i/12 in 10s...\"; sleep 10; done && next start'"
```

This retries the DB connection up to 12 times (2 minutes total) before giving up — Railway sometimes starts the web container before Postgres is fully ready.

## Gotchas hit while building (so they don't get re-discovered)

- **Prisma 7 dropped schema-level `url =` on datasource.** `PrismaClient` must be constructed with an explicit driver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })` (see `lib/prisma.ts`, `prisma/seed.ts`). Plain `new PrismaClient()` throws.
- **The Prisma client's real entry point is `lib/generated/prisma/client`, not `lib/generated/prisma`.** No index barrel file in this generator output.
- **This shadcn/ui registry uses `@base-ui/react`, not Radix.** `Button` takes a `render` prop instead of `asChild`, and needs `nativeButton={false}` when the rendered element isn't an actual `<button>`.
- **Next.js 16 renamed `middleware.ts` to `proxy.ts`** (identical export contract).
- **NextAuth v5's `auth()` HOF silently breaks as the proxy.ts default export under Next 16** — fixed by using `getToken` from `next-auth/jwt` directly in `proxy.ts`, with explicit `secureCookie: process.env.NODE_ENV === "production"`.
- **`trustHost: true`** is required in `auth.ts` for production (avoids `UntrustedHost` error), and **`AUTH_URL`** must be set to the exact public HTTPS domain.
- **Railway private networking can break permanently after a Postgres crash.** Symptoms: `P1001: Can't reach database server at <name>.railway.internal` even after the Postgres service shows "Online". The fix is to delete the Postgres service and create a new one — the old volume is preserved automatically and can be used to recover data (see Data Recovery below). This happened to both staging and production on 2026-07-04.
- **Railway's public TCP proxy (`*.proxy.rlwy.net`) is reachable from outside Railway but NOT from within Railway containers.** When Postgres private networking breaks, you can't work around it by switching `DATABASE_URL` to the public URL — it still fails from inside the container with P1001. The only real fix is to recreate the Postgres service.
- **`railway add --database postgres` has no `--environment` flag.** You must switch the linked environment first: `railway environment <staging|production>`, then run the add command. If you forget, the new service goes into whichever environment is currently linked.
- **When you attach an old Postgres volume to a new Postgres service, the DB password used is the one stored inside the old volume's `pg_authid` table — not the new service's `POSTGRES_PASSWORD` env var.** The new service generates fresh credentials but the old data directory ignores them. Use the OLD password (from the crashed service's variables) to connect to the recovery service.
- **Railway volume persists after service deletion.** When you delete a Postgres service, its volume is NOT deleted — it becomes "detached" and shows in `railway volume list`. This is how data recovery is possible.
- **Data recovery procedure** (used twice today, works reliably):
  1. Create a temp Postgres service: `railway add --database postgres --json`
  2. Detach its auto-created volume: `railway volume detach --volume <new-vol-id> --yes`
  3. Link to the temp service: `railway service link <temp-service-id>`
  4. Attach the old volume: `railway volume attach --volume <old-vol-id> --yes`
  5. Wait ~20s for it to redeploy with old data
  6. Write a `recover-data.mjs` in the project root (uses `pg` from `node_modules`) connecting old → new using OLD password for src and new service's public URL for dst
  7. Run: `node recover-data.mjs`
  8. Delete temp service: `railway service delete --service <name> --environment <env> --yes`
  9. Delete `recover-data.mjs`
- **`railway service delete` is non-interactive in background mode** — pass `--yes` and both `--service` and `--environment` explicitly.
- **optional enum form fields need an `optionalEnum` zod helper** (`lib/validations/employee.ts`) — plain `z.enum([...]).optional()` doesn't treat `""` as unset.
- **Running a one-off Prisma script outside Next.js**: `npx tsx some-script.ts` only resolves `node_modules` correctly if the script physically lives inside the project tree — write throwaway scripts in the repo root, run them, then delete them.
- **Prisma `reportingManagerId` type conflict**: `reportingManagerId: string | undefined` is not assignable to Prisma's `EmployeeCreateInput` union type (it expects either the relational input object or `undefined`, not a scalar string). Fixed with `as any` on both the `prisma.employee.create()` and `prisma.employee.update()` calls in `app/api/employees/route.ts` and `app/api/employees/[id]/route.ts`.

## What's built

- **People Directory** (renamed from "Personnel" — URL `/personnel/` unchanged) — full Employee schema with 8 form sections matching the Employee Master Log Template, role-gated CRUD API at `/api/employees`, list/detail/create/edit UI. Employee form has numbered section headers (1–8) with muted background, consistent `h-10` field height across all inputs and selects, 3-column grid for small sections. Detail view uses the same numbered section style with `grid-cols-2 lg:grid-cols-3`.

  Employee model has **20 additional fields** added in migration `20260704000000_people_directory_fields`:
  - Personal: `nationality`, `numberOfDependents`
  - Contact/Emergency: `emergencyContactName`, `emergencyContactRelationship`, `emergencyContactPhone`
  - Employment: `probationEndDate`, `legalEntity`, `costCenter`, `lastPromotionTransferDate`, `previousDesignation`
  - Compensation: `socialInsuranceSalary`
  - Leave: `annualLeaveBalance`, `sickLeaveTaken`, `hajjLeaveUsed`
  - Legal: `workPermitStatus`, `contractSigned`, `laborLawCategory`
  - Exit: `reasonForLeaving`, `endOfServiceSettlement`, `rehireEligible`

  `firstName` and `lastName` are now nullable (migration `20260704000001_nullable_first_last_name`). The form uses a single **Full Name (as on National ID)** field (`fullName`) instead. `employeeCode` is auto-generated and shown read-only in the form.

  Six new admin lookup categories added to `lib/lookup-categories.ts`: `NATIONALITY`, `EMERGENCY_CONTACT_RELATIONSHIP`, `LEGAL_ENTITY`, `COST_CENTER`, `WORK_PERMIT_STATUS`, `LABOR_LAW_CATEGORY`.

- **Admin-managed dropdown lists** (`/admin/lookups`, HR_ADMIN only) — generic `LookupValue` table backs Employee org-placement fields. Field metadata in `lib/employee-fields.ts`.
- **Bulk Excel import/export** (Personnel toolbar) — `lib/excel-template.ts` (exceljs), matches existing rows by Employee Code/Business Email, creates the rest, auto-adds new lookup values, reports per-row errors without blocking the file.
- **Job Grading** (`/job-grading`) — Hay methodology evaluation calculator (`lib/hay-evaluation.ts`). `JobRole` + `JobEvaluation` models persist history. **No Naqla-grade/compensation-bracket mapping yet** — deliberately deferred.
- **Critical Positions / Succession Planning** (`/critical-positions`) — `Designation` master list, 13-question Likert `CriticalAssessment` (5 sections, 0-65, priority bands), `SuccessProfile` per position. **Known gaps**: Results-tab bar-chart dashboard and 3-sheet Excel export not ported; 13 question texts need HR review.
- **Compensation** (`/compensation`, HR_ADMIN only) — Egyptian payroll tax engine (`lib/payroll-tax.ts`), `CompensationRecord` (versioned history, Standard gross-in or Reverse net-in), `CompensationDeduction`, `CompensationAddition`, bank-transfer Excel export logged in `BankTransferExport`. **Known gap**: bank file column layout is a placeholder — real bank format not yet provided.

## Not yet built (remaining phases)

Per `reference-assets/People.docx`:

1. **Recruitment** — requisition workflow, AI CV screening/sourcing, interview pipeline, AI-drafted offer letters, email automation, Zoho Recruit integration.
2. **Onboarding** — session assignment, onboarding video auto-send, calendar invites, handbook/welcome emails, completion notifications.
3. **Performance Management** — monthly scorecard (MSC) cycle, probation-evaluation notifications at day 75/80.
4. **Talent Management (9-box grid)** — performance × potential grid assessment; not started.
5. **HR chatbot** — Claude-API-backed assistant over company policy docs.

Smaller known gaps inside already-shipped modules:
- Critical Positions: Results dashboard (bar chart) + full 3-sheet Excel export, 13-question wording review with HR.
- Job Grading: grade → compensation bracket mapping (would let Compensation's compa ratio be auto-derived instead of manual).
- Compensation: real bank-transfer file format.
- **Production Postgres backups: not yet enabled** — must be set up in Railway dashboard before any real HR data is entered.

## Suggested next step

People Directory is now fully live on production with the redesigned 8-section form. Before starting the next module:

1. **Enable Railway Postgres backups on production** (Postgres-SlGU) — critical before HR starts entering real data.
2. **Recruitment** is next per spec order — worth a short planning pass first since it touches AI CV screening and a Zoho Recruit integration decision.
