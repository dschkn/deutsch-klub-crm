-- ============================================================
-- Deutsch-Klub CRM — Supabase Schema
-- Auto-generated from Normalized types
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS & AUTH
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'manager',
  branch_ids JSONB DEFAULT '[]',
  avatar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. STUDENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  phones JSONB DEFAULT '[]',
  emails JSONB DEFAULT '[]',
  language TEXT DEFAULT 'German',
  level TEXT DEFAULT 'A1',
  status TEXT DEFAULT 'active',
  group_ids JSONB DEFAULT '[]',
  contract_ids JSONB DEFAULT '[]',
  payment_ids JSONB DEFAULT '[]',
  lesson_ids JSONB DEFAULT '[]',
  task_ids JSONB DEFAULT '[]',
  chat_ids JSONB DEFAULT '[]',
  testing_ids JSONB DEFAULT '[]',
  notes JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. GROUPS
-- ============================================================

CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  code TEXT NOT NULL DEFAULT '',
  language TEXT DEFAULT 'German',
  level TEXT DEFAULT 'A1',
  course_type TEXT DEFAULT 'group',
  hours INTEGER DEFAULT 0,
  teacher_id TEXT DEFAULT '',
  teacher_name TEXT DEFAULT '',
  textbook TEXT DEFAULT '',
  student_ids JSONB DEFAULT '[]',
  lesson_ids JSONB DEFAULT '[]',
  schedule_ids JSONB DEFAULT '[]',
  contract_ids JSONB DEFAULT '[]',
  payment_ids JSONB DEFAULT '[]',
  room_id TEXT,
  zoom_room_id TEXT,
  status TEXT DEFAULT 'active',
  price NUMERIC DEFAULT 0,
  max_students INTEGER DEFAULT 12,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. TEACHERS
-- ============================================================

CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL DEFAULT '',
  full_name TEXT NOT NULL DEFAULT '',
  languages JSONB DEFAULT '["German"]',
  employment_type TEXT DEFAULT 'full_time',
  group_ids JSONB DEFAULT '[]',
  schedule_item_ids JSONB DEFAULT '[]',
  vacation_ids JSONB DEFAULT '[]',
  testing_slot_ids JSONB DEFAULT '[]',
  trial_lesson_slot_ids JSONB DEFAULT '[]',
  comment_ids JSONB DEFAULT '[]',
  is_online_only BOOLEAN DEFAULT false,
  hourly_rate NUMERIC DEFAULT 0,
  specializations JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. LESSONS
-- ============================================================

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL DEFAULT '',
  teacher_id TEXT NOT NULL DEFAULT '',
  room_id TEXT,
  zoom_room_id TEXT,
  date TIMESTAMPTZ,
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  status TEXT DEFAULT 'scheduled',
  topic TEXT DEFAULT '',
  attendance JSONB DEFAULT '[]',
  comment_ids JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. PAYMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL DEFAULT '',
  group_id TEXT,
  contract_id TEXT,
  invoice_id TEXT,
  amount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending',
  method TEXT,
  due_date TIMESTAMPTZ,
  paid_date TIMESTAMPTZ,
  description TEXT DEFAULT '',
  created_by TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. CONTRACTS
-- ============================================================

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL DEFAULT '',
  group_id TEXT,
  payment_ids JSONB DEFAULT '[]',
  status TEXT DEFAULT 'draft',
  signed_date TIMESTAMPTZ,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  documents JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. SCHEDULE ITEMS
-- ============================================================

CREATE TABLE IF NOT EXISTS schedule_items (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL DEFAULT '',
  group_id TEXT,
  student_id TEXT,
  lesson_type TEXT DEFAULT 'lesson',
  room_id TEXT,
  zoom_room_id TEXT,
  start TIMESTAMPTZ,
  "end" TIMESTAMPTZ,
  repeat_rule JSONB,
  status TEXT DEFAULT 'planned',
  previous_status TEXT,
  comment_ids JSONB DEFAULT '[]',
  group_name TEXT,
  group_level TEXT,
  group_language TEXT,
  course_type TEXT,
  format TEXT,
  teacher_name TEXT,
  classroom_name TEXT,
  student_name TEXT,
  capacity INTEGER,
  current_students INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 9. TASKS
-- ============================================================

CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  student_id TEXT,
  group_id TEXT,
  assignee_id TEXT NOT NULL DEFAULT '',
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  deadline TIMESTAMPTZ,
  comment_ids JSONB DEFAULT '[]',
  created_by TEXT DEFAULT '',
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. CONVERSATIONS (Chats)
-- ============================================================

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  channel TEXT DEFAULT 'telegram',
  student_id TEXT,
  contact_name TEXT NOT NULL DEFAULT '',
  contact_phones JSONB DEFAULT '[]',
  last_message TEXT DEFAULT '',
  last_message_time TIMESTAMPTZ,
  unread INTEGER DEFAULT 0,
  tags JSONB DEFAULT '[]',
  notes TEXT DEFAULT '',
  messages JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 11. VACATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS vacations (
  id TEXT PRIMARY KEY,
  teacher_id TEXT NOT NULL DEFAULT '',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  replacement_required BOOLEAN DEFAULT false,
  replacement_teacher_id TEXT,
  comment_ids JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 12. EVENTS (Club Events)
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  date TIMESTAMPTZ,
  start_time TEXT DEFAULT '',
  end_time TEXT DEFAULT '',
  room_id TEXT,
  zoom_room_id TEXT,
  capacity INTEGER DEFAULT 0,
  registration_ids JSONB DEFAULT '[]',
  status TEXT DEFAULT 'planned',
  language TEXT,
  level TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 13. EVENT REGISTRATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS event_registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL DEFAULT '',
  student_id TEXT NOT NULL DEFAULT '',
  registered_at TIMESTAMPTZ,
  attended BOOLEAN DEFAULT false
);

-- ============================================================
-- 14. APPLICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  phones JSONB DEFAULT '[]',
  emails JSONB DEFAULT '[]',
  source TEXT DEFAULT 'website',
  status TEXT DEFAULT 'new',
  comment TEXT,
  assigned_manager_id TEXT,
  related_student_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 15. LEADS
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL DEFAULT '',
  phones JSONB DEFAULT '[]',
  emails JSONB DEFAULT '[]',
  source TEXT DEFAULT 'website',
  language TEXT DEFAULT 'German',
  status TEXT DEFAULT 'new',
  notes TEXT DEFAULT '',
  assigned_manager_id TEXT DEFAULT '',
  converted_to_student_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 16. PERMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  description TEXT DEFAULT '',
  module TEXT DEFAULT ''
);

-- ============================================================
-- 17. ROLE PERMISSIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS role_permissions (
  role TEXT PRIMARY KEY,
  permission_ids JSONB DEFAULT '[]'
);

-- ============================================================
-- 18. COMMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL DEFAULT '',
  entity_id TEXT NOT NULL DEFAULT '',
  author_id TEXT NOT NULL DEFAULT '',
  text TEXT DEFAULT '',
  parent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- ============================================================
-- 19. ROOMS
-- ============================================================

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  type TEXT DEFAULT 'classroom',
  capacity INTEGER DEFAULT 0,
  branch_id TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 20. BRANCHES
-- ============================================================

CREATE TABLE IF NOT EXISTS branches (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  address TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  rooms JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- INDEXES for performance
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_language ON students(language);
CREATE INDEX IF NOT EXISTS idx_groups_status ON groups(status);
CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON groups(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_group_id ON lessons(group_id);
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id ON lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_date ON lessons(date);
CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_schedule_items_teacher_id ON schedule_items(teacher_id);
CREATE INDEX IF NOT EXISTS idx_schedule_items_start ON schedule_items(start);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_vacations_teacher_id ON vacations(teacher_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

-- ============================================================
-- SECURITY BASELINE
--
-- The frontend currently has demo-only local authentication and no verified
-- ownership model. Keep the Data API closed until Supabase Auth and role-based
-- policies are implemented and tested. A publishable key is not authorization.
-- ============================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vacations ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

-- Remove the insecure policy if this file is applied over an earlier schema.
DROP POLICY IF EXISTS "Allow all for anon" ON users;
DROP POLICY IF EXISTS "Allow all for anon" ON students;
DROP POLICY IF EXISTS "Allow all for anon" ON groups;
DROP POLICY IF EXISTS "Allow all for anon" ON teachers;
DROP POLICY IF EXISTS "Allow all for anon" ON lessons;
DROP POLICY IF EXISTS "Allow all for anon" ON payments;
DROP POLICY IF EXISTS "Allow all for anon" ON contracts;
DROP POLICY IF EXISTS "Allow all for anon" ON schedule_items;
DROP POLICY IF EXISTS "Allow all for anon" ON tasks;
DROP POLICY IF EXISTS "Allow all for anon" ON conversations;
DROP POLICY IF EXISTS "Allow all for anon" ON vacations;
DROP POLICY IF EXISTS "Allow all for anon" ON events;
DROP POLICY IF EXISTS "Allow all for anon" ON event_registrations;
DROP POLICY IF EXISTS "Allow all for anon" ON applications;
DROP POLICY IF EXISTS "Allow all for anon" ON leads;
DROP POLICY IF EXISTS "Allow all for anon" ON permissions;
DROP POLICY IF EXISTS "Allow all for anon" ON role_permissions;
DROP POLICY IF EXISTS "Allow all for anon" ON comments;
DROP POLICY IF EXISTS "Allow all for anon" ON rooms;
DROP POLICY IF EXISTS "Allow all for anon" ON branches;

-- Deny access through the Data API by default. Re-grant the minimum required
-- privileges together with tested, ownership-aware RLS policies.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated, public;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE USAGE, SELECT ON SEQUENCES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated, public;
