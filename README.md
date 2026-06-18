# NAQLA HR AI System

Internal HR platform for NAQLA Trucking, built per `reference-assets/People.docx`.

## Stack

Next.js (App Router) + TypeScript, Prisma + SQLite (dev), NextAuth (credentials), Tailwind + shadcn/ui, Anthropic Claude API (later phases).

## Getting started

```bash
npm install
cp .env.example .env   # fill in AUTH_SECRET (openssl rand -base64 32)
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Seeded users (password `ChangeMe123!` for all):

- `admin@naqla.com` — HR_ADMIN
- `manager@naqla.com` — LINE_MANAGER
- `employee@naqla.com` — EMPLOYEE

## Modules

- **Personnel** — implemented (employee records, CRUD, role-gated)
- Compensation, Recruitment, Onboarding, Performance, Talent — planned, shown as "soon" in the sidebar
