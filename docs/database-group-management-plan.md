# Group management database plan

Status: design draft only. Nothing in `supabase/drafts/group_management_v1.sql` has been applied to a database.

## Why this is separate from `supabase/schema.sql`

The existing schema stores relationships twice in JSON arrays (`groups.student_ids` and `students.group_ids`). The proposed model replaces that with foreign keys and join tables so that Groups, Schedule, Students, and Tasks read the same records.

## Source of truth

| UI concern | PostgreSQL source |
| --- | --- |
| Group data and immutable number | `crm_groups` |
| Student profile and lifecycle status | `crm_students` |
| Student participation and group-specific payment status | `crm_group_memberships` |
| Recurring days and times | `crm_group_schedule_rules` |
| Generated/editable schedule cards | `crm_lessons` |
| Kanban tasks | `crm_tasks` |
| Editable standard task list | `crm_task_templates` |
| Notes | `crm_comments` |
| Uploaded-file metadata | `crm_student_files` |
| Actual file bytes | private Supabase Storage bucket (not yet configured) |

Removing the last membership does not delete the student. The foreign key uses `ON DELETE RESTRICT`, and removal is represented by `left_at`.

## Safe rollout later

1. Back up the self-hosted PostgreSQL database.
2. Record the installed PostgreSQL, Supabase, and CLI versions.
3. Inspect the actual tables, constraints, RLS policies, Auth setup, Storage setup, and migration history.
4. Install or update the Supabase CLI and discover commands with `supabase --help`.
5. Create the real migration with `supabase migration new group_management_v1`.
6. Copy the reviewed SQL from the draft into the generated timestamped migration.
7. Replace the final `rollback` with `commit` only in the real migration.
8. Test against a disposable copy/local stack; run type checks, integration tests, RLS tests, and database advisors.
9. Apply to the test database first, seed fictional data, and connect the `test-development` frontend.
10. Deploy to production only after a verified database backup and rollback rehearsal.

For a self-hosted database, the exact `db push`, `psql`, backup, and restore commands must be generated from the real connection topology. Do not paste credentials into Git or chat.

## Decisions still required

- Whether administrators authenticate through Supabase Auth or the current CRM login.
- Mapping of `crm_role` values to director, senior administrator, and administrator permissions.
- Whether payment status means a single marker or a payment ledger derived from invoices.
- Rules for regenerating future lessons when group days change, without modifying completed lessons.
- Storage limits, allowed MIME types, retention periods, and Russian personal-data requirements.
- Import mapping from the existing JSON-based tables into the normalized model.

## Current frontend bridge

The deployed prototype still uses browser storage. The next frontend phase should introduce repository/service functions that read and mutate these PostgreSQL tables through `@supabase/supabase-js`, then remove the browser-storage bridge after data migration.

