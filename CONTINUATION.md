# NAQLA HR AI System — Continuation Notes

Status snapshot as of 2026-06-26. Read this before picking the work back up.

## Where things are

- Repo: `C:\Dev\naqla-hr-system` (moved out of the original OneDrive `Desktop\HR AI System` folder on purpose — OneDrive syncing `node_modules` causes lock/perf issues). The original reference files still live there too, and copies are at `reference-assets/` in this repo:
  - `People.docx` — the full functional spec this system is built from
  - `Naqla People & Culture.html` — branding export (dark `#211E1F` bg, pink `#F90D81` accent, Poppins/Figtree fonts, wordmark "naqla.")
  - `logos black_white.pdf`
  - `HAY-TOOL-CONTINUATION.md` — source notes for the standalone Hay job-evaluation HTML tool that `lib/hay-evaluation.ts` was ported from
  - `CPA-TOOL-CONTINUATION.md` — source notes for the standalone Critical Position Assessment HTML tool that the Critical Positions module was ported from
- GitHub: **https://github.com/ahmedsallam85/Naqlq-HR-System** (private). Two branches: `main` and `staging`, currently both at the same commit (`f3fc326`) — the Compensation module has been promoted to `main`/production.
- A separate, already-built sister project owned by the same user — **`hr-payroll-saas`** (Python/Flask, repo `Sallam10/hr-payroll-saas`, local copy at `C:\Users\AhmedSallam\OneDrive - NAQLA Trucking\Desktop\HR AI System\Payroll\hr-payroll-saas-main\`) — has a verified Egyptian payroll tax engine (`modules/tax_engine.py`) and full payroll schema (salary records, benefits, debts/installments, payroll runs). It was used as reference/source material for this repo's Compensation module (ported, not called into at runtime — this app stays single-stack TypeScript). Worth checking again if a future module (e.g. Recruitment's offer-letter compa-ratio logic) needs payroll-adjacent calculations.
- Build plan that was approved for the original Phase 0/1 scaffold: `C:\Users\AhmedSallam\.claude\plans\glittery-forging-castle.md`.

## How to run it locally

```bash
cd /c/Dev/naqla-hr-system
npm run dev
```

Open `http://localhost:3000/login`. Local dev's `.env` `DATABASE_URL` points at the **staging** Postgres database (no local SQLite anymore — the whole app runs on PostgreSQL everywhere now).

## Hosting (Railway + GitHub)

Project `naqla-hr-system` on Railway (workspace: ahmedsallam85's Projects), two environments:

| | Staging (test) | Production (live) |
|---|---|---|
| URL | https://web-staging-f27e.up.railway.app | https://web-production-352ade.up.railway.app |
| Branch | `staging` (auto-deploys on push) | `main` (auto-deploys on push) |
| Postgres service | `Postgres` | `Postgres-Vts9` |
| Login | `admin@naqla.com` / `ChangeMe123!` | `ahmed.sallam@naqlq.xyz` / (set directly by user, not in memory) |
| Data | demo employees | Empty — real data only |

**Day-to-day workflow**: just `git push origin staging` or `git push origin main` — Railway auto-builds and deploys. No manual `railway up` needed anymore (that was only used for the initial setup). Established promotion flow: build + verify on `staging` first, then `git checkout main && git merge staging && git push origin main`.

**If you ever need to deploy manually** (e.g. CLI is misbehaving): `railway up --service web --environment <staging|production>` — but `cd` into the repo first in the *same* shell call, since Railway's project link is tied to cwd and this harness's shell resets cwd between separate tool calls.

## Gotchas hit while building (so they don't get re-discovered)

- **Prisma 7 dropped schema-level `url =` on datasource.** `PrismaClient` must be constructed with an explicit driver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })` (see `lib/prisma.ts`, `prisma/seed.ts`, `prisma/seed-production.ts`). Plain `new PrismaClient()` throws.
- **The Prisma client's real entry point is `lib/generated/prisma/client`, not `lib/generated/prisma`.** No index barrel file in this generator output.
- **This shadcn/ui registry uses `@base-ui/react`, not Radix.** `Button` takes a `render` prop instead of `asChild`, and needs `nativeButton={false}` when the rendered element isn't an actual `<button>`.
- **Next.js 16 renamed `middleware.ts` to `proxy.ts`** (identical export contract).
- **NextAuth v5's `auth()` HOF silently breaks as the proxy.ts default export under Next 16** — it treated every request as logged in once deployed. Fixed by using `getToken` from `next-auth/jwt` directly in `proxy.ts`, with explicit `secureCookie: process.env.NODE_ENV === "production"` (otherwise it can't find the `__Secure-`-prefixed session cookie behind Railway's proxy).
- **`trustHost: true`** is required in `auth.ts` for production (avoids `UntrustedHost` error), and **`AUTH_URL`** must be set to the exact public HTTPS domain (otherwise NextAuth generates redirects to the internal `localhost:8080` address instead of the real domain).
- **Railway CLI (5.15.0) is flaky for provisioning.** `railway add --database postgres` / `railway deploy -t postgres` often hang or fail with a misleading `Unauthorized`, but may still succeed server-side — always verify with `railway service list --environment <env> --json` rather than trusting the command's exit status. A persistent `Unauthorized` across retries turned out to be a trial-plan resource limit, resolved by adding a payment method.
- **"service" in Railway is a project-level entity shared across environments.** To deploy an existing service into a new environment, target it there (`railway up --service web --environment production`) rather than creating a same-named new one.
- **Per-environment GitHub branch mapping must be set in the Railway dashboard, not the CLI.** `railway service source connect --branch X --environment Y` sets a *shared* service-level source — connecting staging after production silently overrode production's branch too (confirmed by testing). Fix: open the web service while viewing each environment specifically (environment switcher top-left) → Settings → Source → set the branch field there. Verified correct afterward by pushing distinct commits to each branch and confirming only the matching environment redeployed.
- `package.json`: `build` = `prisma generate && next build`, `start` = `prisma migrate deploy && next start` (migrations run automatically every container start), `postinstall` = `prisma generate`. `prisma` package must be in `dependencies`, not `devDependencies` (needed at runtime).
- **optional enum form fields need an `optionalEnum` zod helper** (`lib/validations/employee.ts`) — plain `z.enum([...]).optional()` doesn't treat `""` as unset, which broke Excel import for blank gender/maritalStatus/contractType/talentStatus cells. The literal array passed to it needs `as const` or the union type widens to `string` and breaks Prisma's generated types downstream.
- **Job Grading and Critical Positions are both ports of standalone single-file HTML tools** the user already had (`reference-assets/HAY-TOOL-CONTINUATION.md`, `reference-assets/CPA-TOOL-CONTINUATION.md`) — when extending either module, check the source notes first since they document the original scoring methodology and what was deliberately left out of the port.
- **Local dev's `DATABASE_URL` points at the live staging Postgres DB, not a throwaway local one.** Manual smoke-testing through the UI (or any one-off script) writes real rows there. After any such test, clean up with a temp script using `prisma` from `lib/prisma.ts` (run via `npx tsx` after sourcing `.env` into the shell — plain `npx tsx` doesn't auto-load `.env` the way Next.js does) — don't leave test rows sitting in staging.
- **Running a one-off Prisma script outside Next.js**: `npx tsx some-script.ts` only resolves `node_modules` (and loads `.env`) correctly if the script physically lives inside the project tree — a script in a temp/scratch directory outside the repo can't resolve `@/lib/prisma` or its dependencies even with absolute imports. Write the throwaway script into the repo root, run it, then delete it.

## What's built

- **Personnel** — full Employee schema, role-gated CRUD API at `/api/employees`, list/detail/create/edit UI.
- **Admin-managed dropdown lists** (`/admin/lookups`, HR_ADMIN only) — generic `LookupValue` table backs Employee org-placement fields instead of free text. Field metadata in `lib/employee-fields.ts`.
- **Bulk Excel import/export** (Personnel toolbar) — `lib/excel-template.ts` (exceljs), matches existing rows by Employee Code/Business Email, creates the rest, auto-adds new lookup values, reports per-row errors without blocking the file.
- **Job Grading** (`/job-grading`) — Hay methodology evaluation calculator (`lib/hay-evaluation.ts`), verified against the source tool's documented test cases. `JobRole` + `JobEvaluation` models persist history. Know-How/Problem-Solving/Accountability validity-color matrices and calculations have been corrected against the official Hay guide-chart manual (commits `f70f946`, `cb448fe`, `c729c16`). **No Naqla-grade/compensation-bracket mapping yet** — deliberately deferred (no fake financial data), current scope is Hay points/level only.
- **Critical Positions / Succession Planning** (`/critical-positions`) — `Designation` master list (Excel import/export, optionally linked to a real Personnel record as holder), 13-question Likert `CriticalAssessment` (5 sections, 0-65, Imperative/Important/Discretionary/Not Urgent priority bands) with full history per position, and a `SuccessProfile` form per position (SIGMA-template-style: Succession Position, incumbent, eligibility year, urgency, criteria, leadership). First-pass port from a standalone HTML tool — **known gaps**: the source tool's Results-tab bar-chart dashboard and its 3-sheet Excel export (Question Reference / Scoring Guide sheets) were not carried over. Also, the 13 question texts were written to match each section's stated purpose rather than transcribed verbatim from a source that only specified section names/weights/thresholds — flagged for HR to review/refine.
- **Compensation** (`/compensation`, HR_ADMIN only — live on both `staging` and `main`/production) — Egyptian payroll tax engine ported to TypeScript (`lib/payroll-tax.ts`) from the sister `hr-payroll-saas` project's verified `tax_engine.py`, golden-value-tested to match exactly. `CompensationRecord` (versioned history per employee, Standard gross-in or Reverse net-in calc mode → derives social insurance employee/company share, gross salary, income tax, martyr fund), `CompensationDeduction` (Premium Card / Money Fellows / Store Installment / Salary Advance Installment / Penalty, with optional installment tracking), `CompensationAddition` (sign-on bonus / performance bonus / salary advance), and a bank-transfer Excel export (`lib/compensation-export.ts`) logged per run in `BankTransferExport` for audit. **Known gap**: bank file column layout is a generic placeholder — the spec says "based on criteria we will feed the system with" and that criteria hasn't been provided yet; adjust `lib/compensation-export.ts` once the real bank format is known. Compa ratio is a manual entry field — no Job Grading grade→bracket mapping exists yet to auto-derive it. Migration applies automatically on deploy (`prisma migrate deploy` runs on every container start per `package.json`'s `start` script) — production's Postgres-Vts9 picks it up the same way staging's did, no manual migration step needed.

## Not yet built (remaining phases)

Per `reference-assets/People.docx` ([[project-hr-system-spec]] in Claude's memory):

1. **Recruitment** — requisition workflow, AI CV screening/sourcing, interview pipeline, AI-drafted offer letters, email automation, Zoho Recruit integration.
2. **Onboarding** — session assignment, onboarding video auto-send, calendar invites, handbook/welcome emails, completion notifications.
3. **Performance Management** — monthly scorecard (MSC) cycle, probation-evaluation notifications at day 75/80.
4. **Talent Management (9-box grid)** — the spec's 9-box performance×potential grid assessment is still separate from the Critical Positions/succession work above; not started.
5. **HR chatbot** — Claude-API-backed assistant over company policy docs.

Smaller known gaps inside already-shipped modules:
- Critical Positions: Results dashboard (bar chart) + full 3-sheet Excel export, 13-question wording review with HR.
- Job Grading: grade → compensation bracket mapping (would let Compensation's compa ratio be auto-derived instead of manual).
- Compensation: real bank-transfer file format (see above) — only known gap left, no branch-promotion work pending anymore.

Email/calendar integration is intentionally stubbed/out-of-scope until a module actually needs it (Onboarding is the first).

## Suggested next step

Compensation is live on both staging and production. Confirm it behaves on production (https://web-production-352ade.up.railway.app) with real data once HR starts entering it. Next big phase per spec order is **Recruitment** — worth a short planning pass first, since it touches AI CV screening and a Zoho Recruit integration decision.
