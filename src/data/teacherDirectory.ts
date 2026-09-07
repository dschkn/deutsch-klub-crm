import { demoTeacherOptions, demoTeacherUserMap } from './demoTeachers';

export type TeacherLanguage = 'German' | 'English';

export interface TeacherDirectoryEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  languages: TeacherLanguage[];
  employmentType: 'full_time' | 'part_time' | 'hourly';
  format: 'offline' | 'online' | 'both';
  active: boolean;
  note: string;
  createdAt: string;
}

const STORAGE_KEY = 'dk-teacher-directory-v1';
export const TEACHER_DIRECTORY_EVENT = 'dk-teacher-directory-change';

const seedTeachers = (): TeacherDirectoryEntry[] => demoTeacherOptions.map((teacher, index) => ({
  id: teacher.id,
  name: teacher.name,
  email: demoTeacherUserMap[teacher.id]?.email || '',
  phone: demoTeacherUserMap[teacher.id]?.phone || '',
  languages: index % 5 === 0 ? ['German', 'English'] : ['German'],
  employmentType: index % 3 === 0 ? 'part_time' : 'hourly',
  format: teacher.isOnlineOnly ? 'online' : 'both',
  active: true,
  note: '',
  createdAt: new Date(2026, 0, Math.min(index + 1, 28)).toISOString(),
}));

export function getTeacherDirectory(): TeacherDirectoryEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as TeacherDirectoryEntry[];
  } catch { /* use demo data */ }
  return seedTeachers();
}

export function saveTeacherDirectory(teachers: TeacherDirectoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(teachers));
  window.dispatchEvent(new CustomEvent(TEACHER_DIRECTORY_EVENT));
}

export function subscribeToTeacherDirectory(listener: () => void) {
  window.addEventListener(TEACHER_DIRECTORY_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(TEACHER_DIRECTORY_EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}
