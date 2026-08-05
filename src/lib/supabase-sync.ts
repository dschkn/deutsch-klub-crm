import { supabase } from './supabase';
import { DataStore } from '../data/store';
import type {
  NormalizedStudent,
  NormalizedGroup,
  NormalizedTeacher,
  NormalizedUser,
  NormalizedPayment,
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

const TABLE_MAP: Record<TableName, {
  getAll: () => unknown[];
  import: (items: unknown[]) => void;
}> = {
  students: {
    getAll: () => DataStore.getInstance().getAllStudents(),
    import: (items) => DataStore.getInstance().importStudents(items as NormalizedStudent[]),
  },
  groups: {
    getAll: () => DataStore.getInstance().getAllGroups(),
    import: (items) => DataStore.getInstance().importGroups(items as NormalizedGroup[]),
  },
  teachers: {
    getAll: () => DataStore.getInstance().getAllTeachers(),
    import: (items) => DataStore.getInstance().importTeachers(items as NormalizedTeacher[]),
  },
  users: {
    getAll: () => DataStore.getInstance().getAllUsers(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addUser(item as NormalizedUser)),
  },
  payments: {
    getAll: () => DataStore.getInstance().getAllPayments(),
    import: (items) => DataStore.getInstance().importPayments(items as NormalizedPayment[]),
  },
  lessons: {
    getAll: () => DataStore.getInstance().getAllLessons(),
    import: (items) => DataStore.getInstance().importLessons(items as NormalizedLesson[]),
  },
  tasks: {
    getAll: () => DataStore.getInstance().getAllTasks(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addTask(item as NormalizedTask)),
  },
  conversations: {
    getAll: () => DataStore.getInstance().getAllConversations(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addConversation(item as NormalizedChatConversation)),
  },
  schedule_items: {
    getAll: () => DataStore.getInstance().getAllScheduleItems(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addScheduleItem(item as NormalizedTeacherScheduleItem)),
  },
  vacations: {
    getAll: () => DataStore.getInstance().getAllVacations(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addVacation(item as NormalizedVacation)),
  },
  events: {
    getAll: () => DataStore.getInstance().getAllEvents(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addEvent(item as NormalizedClubEvent)),
  },
  event_registrations: {
    getAll: () => DataStore.getInstance().getAllEventRegistrations(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addEventRegistration(item as NormalizedEventRegistration)),
  },
  applications: {
    getAll: () => DataStore.getInstance().getAllApplications(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addApplication(item as NormalizedApplication)),
  },
  leads: {
    getAll: () => DataStore.getInstance().getAllLeads(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addLead(item as NormalizedLead)),
  },
  permissions: {
    getAll: () => DataStore.getInstance().getAllPermissions(),
    import: (items) => DataStore.getInstance().setPermissions(items as NormalizedPermission[]),
  },
  role_permissions: {
    getAll: () => DataStore.getInstance().getAllRolePermissions(),
    import: (items) => DataStore.getInstance().setRolePermissions(items as NormalizedRolePermission[]),
  },
  comments: {
    getAll: () => DataStore.getInstance().getAllComments(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addComment(item as NormalizedComment)),
  },
  rooms: {
    getAll: () => DataStore.getInstance().getAllRooms(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addRoom(item as NormalizedRoom)),
  },
  branches: {
    getAll: () => DataStore.getInstance().getAllBranches(),
    import: (items) => items.forEach((item) => DataStore.getInstance().addBranch(item as NormalizedBranch)),
  },
};

function serializeDates(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return obj.toISOString();
  if (Array.isArray(obj)) return obj.map(serializeDates);
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = serializeDates(value);
    }
    return result;
  }
  return obj;
}

function deserializeDates(obj: unknown, dateFields: string[] = []): unknown {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(item => deserializeDates(item, dateFields));
  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (dateFields.includes(key) && typeof value === 'string') {
        result[key] = new Date(value);
      } else {
        result[key] = deserializeDates(value, dateFields);
      }
    }
    return result;
  }
  return obj;
}

const DATE_FIELDS = [
  'createdAt', 'updatedAt', 'startDate', 'endDate', 'dueDate', 'paidDate',
  'date', 'start', 'end', 'joinDate', 'deadline', 'lastMessageTime',
  'sentAt', 'registeredAt', 'signedAt', 'completedAt', 'lastSyncAt',
  'birthDate',
];

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
        'users', 'students', 'groups', 'teachers', 'payments', 'lessons',
        'tasks', 'conversations', 'schedule_items', 'vacations', 'events',
        'event_registrations', 'applications', 'leads', 'permissions',
        'role_permissions', 'comments', 'rooms', 'branches',
      ];

      let loadedAny = false;

      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*');
          if (error || !data || data.length === 0) continue;

          const deserialized = data.map(row => deserializeDates(row, DATE_FIELDS));
          TABLE_MAP[table].import(deserialized as unknown[]);
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

  async saveAll(): Promise<void> {
    if (!supabase) {
      console.warn('Supabase is not configured; local seed data was not persisted.');
      return;
    }

    try {
      const tables: TableName[] = [
        'users', 'students', 'groups', 'teachers', 'payments', 'lessons',
        'tasks', 'conversations', 'schedule_items', 'vacations', 'events',
        'event_registrations', 'applications', 'leads', 'permissions',
        'role_permissions', 'comments', 'rooms', 'branches',
      ];

      for (const table of tables) {
        try {
          const items = TABLE_MAP[table].getAll();
          if (items.length === 0) continue;

          const serialized = items.map(item => serializeDates(item));

          await supabase.from(table).delete().neq('id', '__none__');

          const chunks: never[][] = [];
          for (let i = 0; i < serialized.length; i += 500) {
            chunks.push(serialized.slice(i, i + 500) as never[]);
          }

          for (const chunk of chunks) {
            const { error } = await supabase.from(table).upsert(chunk, { onConflict: 'id' });
            if (error) {
              console.warn(`Failed to save ${table}:`, error.message);
            }
          }

          console.log(`Saved ${items.length} rows to ${table}`);
        } catch (err) {
          console.warn(`Failed to sync ${table}:`, err);
        }
      }
    } catch (err) {
      console.error('Supabase save failed:', err);
    }
  },

  async saveEntity(table: TableName, entity: { id: string }): Promise<void> {
    if (!supabase) return;

    try {
      const serialized = serializeDates(entity);
      const { error } = await supabase.from(table).upsert(serialized, { onConflict: 'id' });
      if (error) {
        console.warn(`Failed to save entity to ${table}:`, error.message);
      }
    } catch (err) {
      console.warn(`Failed to save entity to ${table}:`, err);
    }
  },

  async deleteEntity(table: TableName, id: string): Promise<void> {
    if (!supabase) return;

    try {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        console.warn(`Failed to delete entity from ${table}:`, error.message);
      }
    } catch (err) {
      console.warn(`Failed to delete entity from ${table}:`, err);
    }
  },
};
