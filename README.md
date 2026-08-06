# Deutsch-Klub CRM

Internal CRM prototype for students, groups, teachers, schedules, payments and
administrative workflows.

The repository currently uses synthetic demo data with optional read-only
Supabase hydration. Production authentication, persistent writes and audited
RLS policies are not enabled yet.

## Architecture status

See [`docs/architecture-audit.md`](docs/architecture-audit.md) for the current
working-versus-prototype map, known risks and the recommended migration path for
the shared CRM and Teacher App database.

## Development

Requires Node.js 20+ and npm.

```bash
npm ci
npm run dev
npm run check
```
