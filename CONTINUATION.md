# NAQLA HR AI System — Continuation Notes

Status snapshot as of 2026-06-19. Read this before picking the work back up.

## Where things are

- Repo: `C:\Dev\naqla-hr-system` (moved out of the original OneDrive `Desktop\HR AI System` folder on purpose — OneDrive syncing `node_modules` causes lock/perf issues). The original reference files still live there too, and copies are at `reference-assets/` in this repo:
  - `People.docx` — the full functional spec this system is built from
  - `Naqla People & Culture.html` — branding export (dark `#211E1F` bg, pink `#F90D81` accent, Poppins/Figtree fonts, wordmark "naqla.")
  - `logos black_white.pdf`
- GitHub: **https://github.com/ahmedsallam85/Naqlq-HR-System** (private). Two branches: `main` and `staging`.
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
| Data | 4 fake demo employees | Empty — real data only |

**Day-to-day workflow**: just `git push origin staging` or `git push origin main` — Railway auto-builds and deploys. No manual `railway up` needed anymore (that was only used for the initial setup).

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

## Not yet built (next phases, in spec order)

Per `reference-assets/People.docx` ([[project-hr-system-spec]] in Claude's memory):

1. **Org Structure & Grading** — Hay-theory-based AI job grading engine, grade → compensation bracket mapping.
2. **Compensation** — comp records, deductions/additions, automated bank transfer file generation.
3. **Recruitment** — requisition workflow, AI CV screening/sourcing, interview pipeline, AI-drafted offer letters, email automation, Zoho Recruit integration.
4. **Onboarding** — session assignment, onboarding video auto-send, calendar invites, handbook/welcome emails, completion notifications.
5. **Performance Management** — monthly scorecard (MSC) cycle, probation-evaluation notifications at day 75/80.
6. **Talent Management** — 9-box grid assessments, 6-month talent-mapping notifications.
7. **HR chatbot** — Claude-API-backed assistant over company policy docs.

Email/calendar integration is intentionally stubbed/out-of-scope until a module actually needs it (Onboarding is the first).

## Suggested next step

Plan and build the **Org Structure & Grading** module next, since Recruitment and Compensation both depend on a job's Hay grade existing first.
