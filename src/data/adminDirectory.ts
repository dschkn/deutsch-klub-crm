import { demoAdministrators, type DemoAdministrator } from './demoAdministrators';

export interface AdminDirectoryEntry extends DemoAdministrator {
  email: string;
  phone: string;
  login: string;
  active: boolean;
  avatar?: string;
  columnColor: string;
  createdAt: string;
}

const STORAGE_KEY = 'dk-admin-directory-v1';
export const ADMIN_DIRECTORY_EVENT = 'dk-admin-directory-change';

const colors = ['#c8d3e3', '#c4ddcf', '#d8cbe9', '#c0dbea', '#ead8bd', '#e6c6cc', '#c9d0df'];

function seed(): AdminDirectoryEntry[] {
  return demoAdministrators.map((admin, index) => ({
    ...admin,
    email: `admin${String(index + 1).padStart(2, '0')}@deutsch-klub.ru`,
    phone: '',
    login: `admin${index + 1}`,
    active: true,
    columnColor: colors[index] || '#d6dbe3',
    createdAt: new Date(2026, 0, index + 1).toISOString(),
  }));
}

export function getAdminDirectory(): AdminDirectoryEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as AdminDirectoryEntry[];
  } catch { /* use seed */ }
  return seed();
}

export function saveAdminDirectory(admins: AdminDirectoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(admins));
  window.dispatchEvent(new CustomEvent(ADMIN_DIRECTORY_EVENT));
}

export function subscribeToAdminDirectory(listener: () => void) {
  window.addEventListener(ADMIN_DIRECTORY_EVENT, listener);
  window.addEventListener('storage', listener);
  return () => { window.removeEventListener(ADMIN_DIRECTORY_EVENT, listener); window.removeEventListener('storage', listener); };
}
