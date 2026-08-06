export const AUTH_STORAGE_KEY = 'crm_current_user_id';
export const DEFAULT_USER_ID = 'u1';

export function hasStoredSession(): boolean {
  return Boolean(localStorage.getItem(AUTH_STORAGE_KEY));
}
