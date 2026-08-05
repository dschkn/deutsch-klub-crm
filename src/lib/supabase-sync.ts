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

const TABLE_MAP: Record<TableName, (items: unknown[]) => void> = {
  students: (items) => DataStore.getInstance().importStudents(items as NormalizedStudent[]),
  groups: (items) => DataStore.getInstance().importGroups(items as NormalizedGroup[]),
  teachers: (items) => DataStore.getInstance().importTeachers(items as NormalizedTeacher[]),
  users: (items) => items.forEach((item) => DataStore.getInstance().addUser(item as NormalizedUser)),
  payments: (items) => DataStore.getInstance().importPayments(items as NormalizedPayment[]),
  contracts: (items) => items.forEach((item) => DataStore.getInstance().addContract(item as NormalizedContract)),
  lessons: (items) => DataStore.getInstance().importLessons(items as NormalizedLesson[]),
  tasks: (items) => items.forEach((item) => DataStore.getInstance().addTask(item as NormalizedTask)),
  conversations: (items) => items.forEach((item) => DataStore.getInstance().addConversation(item as NormalizedChatConversation)),
  schedule_items: (items) => items.forEach((item) => DataStore.getInstance().addScheduleItem(item as NormalizedTeacherScheduleItem)),
  vacations: (items) => items.forEach((item) => DataStore.getInstance().addVacation(item as NormalizedVacation)),
  events: (items) => items.forEach((item) => DataStore.getInstance().addEvent(item as NormalizedClubEvent)),
  event_registrations: (items) => items.forEach((item) => DataStore.getInstance().addEventRegistration(item as NormalizedEventRegistration)),
  applications: (items) => items.forEach((item) => DataStore.getInstance().addApplication(item as NormalizedApplication)),
  leads: (items) => items.forEach((item) => DataStore.getInstance().addLead(item as NormalizedLead)),
  permissions: (items) => DataStore.getInstance().setPermissions(items as NormalizedPermission[]),
  role_permissions: (items) => DataStore.getInstance().setRolePermissions(items as NormalizedRolePermission[]),
  comments: (items) => items.forEach((item) => DataStore.getInstance().addComment(item as NormalizedComment)),
  rooms: (items) => items.forEach((item) => DataStore.getInstance().addRoom(item as NormalizedRoom)),
  branches: (items) => items.forEach((item) => DataStore.getInstance().addBranch(item as NormalizedBranch)),
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
    if (!supabase) return false;

    try {
      const { error: testError } = await supabase.from('students').select('id').limit(1);
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

      let loadedAny = false;

      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*');
          if (error || !data || data.length === 0) continue;

          const deserialized = data.map(deserializeRow);
          TABLE_MAP[table](deserialized as unknown[]);
          loadedAny = true;
          console.log(`Loaded ${data.length} rows from ${table}`);
        } catch {
          // skip table if it doesn't exist
        }
      }

      return loadedAny;
    } catch (err) {
      console.warn('Supabase load failed, using seed data:', err);
      return false;
    }
  },
};
