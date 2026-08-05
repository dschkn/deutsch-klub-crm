# Deutsch-Klub CRM

Internal CRM prototype for Deutsch-Klub. The application covers students, groups,
teachers, schedules, payments, contracts, leads, tasks, events, and role settings.

## Current status

This repository is a sanitized development baseline. It contains synthetic demo
records only. The current login flow and role switching are local UI prototypes;
they are not production authentication or authorization.

## Stack

- React 18 and TypeScript
- Vite
- Tailwind CSS, shadcn/ui, and Radix UI
- Supabase client and PostgreSQL schema

## Local development

Requirements: Node.js 20 or newer and npm.

```bash
npm ci
npm run dev
```

Production build:

```bash
npm run build
```

Without a `.env` file the app runs with synthetic seed data. To point the client
at a development Supabase project, copy `.env.example` to `.env.local` and fill
in the public URL and publishable key.

## Data safety

- Never commit student, teacher, employee, lead, payment, or contract exports.
- Keep raw CSV/TSV/XLSX files outside the repository.
- Never use a Supabase service-role or secret key in the browser or in `VITE_*`
  variables.
- The committed SQL schema enables RLS and revokes Data API access from `anon`
  and `authenticated` by default.
- Add access only together with Supabase Auth and tested, ownership-aware RLS
  policies.

## Project structure

```text
src/
  components/   shared and feature UI
  data/         synthetic seed data, selectors, and in-memory store
  hooks/        application hooks
  lib/          Supabase integration and utilities
  pages/        CRM screens
  types/        legacy and normalized domain models
supabase/
  schema.sql    closed-by-default development schema
```

## Known limitations

- Supabase Auth and production RBAC are not implemented yet.
- The frontend still contains both legacy UI types and the normalized data model.
  This is intentional during the migration and should not be rewritten wholesale.
- Seed data is generated in the browser and may differ between reloads.
- The SQL schema is a baseline, not a reviewed production migration history.
