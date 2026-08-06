import { supabase } from './supabase';
import { DataStore } from '../data/store';
import type {
  NormalizedStudent,
  NormalizedGroup,
  NormalizedTeacher,
  NormalizedUser,
  NormalizedPayment,
  NormalizedContract,
  NormalizedLesson,
  NormalizedTask,
  NormalizedChatConversation,
  NormalizedTeacherScheduleItem,
  NormalizedVacation,
  NormalizedClubEvent,
  NormalizedEventRegistration,
  NormalizedApplication,
  NormalizedLead,
  NormalizedPermission,
  NormalizedRolePermission,
  NormalizedComment,
  NormalizedRoom,
  NormalizedBranch,
} from '../types/normalized';

type TableName =
  | 'students'
  | 'groups'
  | 'teachers'
  | 'users'
  | 'payments'
  | 'contracts'
  | 'lessons'
  | 'tasks'
  | 'conversations'
  | 'schedule_items'
  | 'vacations'
  | 'events'
  | 'event_registrations'
  | 'applications'
  | 'leads'
  | 'permissions'
  | 'role_permissions'
  | 'comments'
  | 'rooms'
  | 'branches';

type LoadedTable = {
  table: TableName;
  rows: unknown[];
  count: number;
};

const store = DataStore.getInstance();

const TABLE_MAP: Record<TableName, (items: unknown[]) => void> = {
  students: (items) => store.importStudents(items as NormalizedStudent[]),
  groups: (items) => store.importGroups(items as NormalizedGroup[]),
  teachers: (items) => store.importTeachers(items as NormalizedTeacher[]),
  users: (items) => items.forEach((item) => store.addUser(item as NormalizedUser)),
  payments: (items) => store.importPayments(items as NormalizedPayment[]),
  contracts: (items) => items.forEach((item) => store.addContract(item as NormalizedContract)),
  lessons: (items) => store.importLessons(items as NormalizedLesson[]),
  tasks: (items) => items.forEach((item) => store.addTask(item as NormalizedTask)),
  conversations: (items) => items.forEach((item) => store.addConversation(item as NormalizedChatConversation)),
  schedule_items: (items) => items.forEach((item) => store.addScheduleItem(item as NormalizedTeacherScheduleItem)),
  vacations: (items) => items.forEach((item) => store.addVacation(item as NormalizedVacation)),
  events: (items) => items.forEach((item) => store.addEvent(item as NormalizedClubEvent)),
  event_registrations: (items) => items.forEach((item) => store.addEventRegistration(item as NormalizedEventRegistration)),
  applications: (items) => items.forEach((item) => store.addApplication(item as NormalizedApplication)),
  leads: (items) => items.forEach((item) => store.addLead(item as NormalizedLead)),
  permissions: (items) => store.setPermissions(items as NormalizedPermission[]),
  role_permissions: (items) => store.setRolePermissions(items as NormalizedRolePermission[]),
  comments: (items) => items.forEach((item) => store.addComment(item as NormalizedComment)),
  rooms: (items) => items.forEach((item) => store.addRoom(item as NormalizedRoom)),
  branches: (items) => items.forEach((item) => store.addBranch(item as NormalizedBranch)),
};

const DATE_FIELDS = new Set([
  'createdAt', 'updatedAt', 'startDate', 'endDate', 'dueDate', 'paidDate',
  'date', 'start', 'end', 'joinDate', 'deadline', 'lastMessageTime',
  'sentAt', 'registeredAt', 'signedAt', 'completedAt', 'lastSyncAt',
  'birthDate',
]);

function toCamelCase(key: string): string {
  return key.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function deserializeRow(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(deserializeRow);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      const appKey = toCamelCase(key);
      if (DATE_FIELDS.has(appKey) && typeof value === 'string') {
        result[appKey] = new Date(value);
      } else {
        result[appKey] = deserializeRow(value);
      }
    }
    return result;
  }
  return obj;
}

// Intentionally read-only until the live schema, Auth and RLS model are audited.
export const supabaseSync = {
  async loadAll(): Promise<boolean> {
    const client = supabase;
    if (!client) return false;

    try {
      const { error: testError } = await client.from('students').select('id').limit(1);
      if (testError) {
        console.warn('Supabase tables not available, using seed data:', testError.message);
        return false;
      }

      const tables: TableName[] = [
        'users', 'students', 'groups', 'teachers', 'payments', 'contracts', 'lessons',
        'tasks', 'conversations', 'schedule_items', 'vacations', 'events',
        'event_registrations', 'applications', 'leads', 'permissions',
        'role_permissions', 'comments', 'rooms', 'branches',
      ];

      const loadedTables = await Promise.all(
        tables.map(async (table): Promise<LoadedTable | null> => {
          try {
            const { data, error } = await client.from(table).select('*');
            if (error || !data || data.length === 0) return null;

            return {
              table,
              rows: data.map(deserializeRow),
              count: data.length,
            };
          } catch {
            // Skip optional tables that are not available in the current schema.
            return null;
          }
        })
      );

      let loadedAny = false;

      for (const loaded of loadedTables) {
        if (!loaded) continue;

        TABLE_MAP[loaded.table](loaded.rows);
        loadedAny = true;
        console.info(`Loaded ${loaded.count} rows from ${loaded.table}`);
      }

      return loadedAny;
    } catch (err) {
      console.warn('Supabase load failed, using seed data:', err);
      return false;
    }
  },
};
