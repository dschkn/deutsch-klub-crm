import { useState, useEffect, useCallback } from 'react';
import { DataStore } from '../data/store';
import type { NormalizedUser } from '../types/normalized';

const CURRENT_USER_KEY = 'crm_current_user_id';
const DEFAULT_USER_ID = 'u1'; // Elena Voigt (Director)

let _cachedUser: NormalizedUser | null = null;
let _cachedUserId: string | null = null;

function getUserFromStore(userId: string): NormalizedUser | undefined {
  const store = DataStore.getInstance();
  return store.getUser(userId);
}

export function useCurrentUser() {
  const [userId, setUserIdState] = useState<string>(() => {
    return localStorage.getItem(CURRENT_USER_KEY) || DEFAULT_USER_ID;
  });

  const [user, setUser] = useState<NormalizedUser | undefined>(() => {
    return getUserFromStore(userId);
  });

  useEffect(() => {
    const stored = localStorage.getItem(CURRENT_USER_KEY) || DEFAULT_USER_ID;
    if (stored !== userId) {
      setUserIdState(stored);
    }
    const u = getUserFromStore(stored);
    setUser(u);
    _cachedUser = u || null;
    _cachedUserId = stored;
  }, [userId]);

  const setCurrentUser = useCallback((newUserId: string) => {
    localStorage.setItem(CURRENT_USER_KEY, newUserId);
    setUserIdState(newUserId);
    const u = getUserFromStore(newUserId);
    setUser(u);
    _cachedUser = u || null;
    _cachedUserId = newUserId;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setUserIdState(DEFAULT_USER_ID);
    const u = getUserFromStore(DEFAULT_USER_ID);
    setUser(u);
    _cachedUser = u || null;
    _cachedUserId = DEFAULT_USER_ID;
  }, []);

  return { user, userId, setCurrentUser, logout };
}

export function getCurrentUserSync(): NormalizedUser | undefined {
  const id = _cachedUserId || localStorage.getItem(CURRENT_USER_KEY) || DEFAULT_USER_ID;
  if (_cachedUser && _cachedUserId === id) return _cachedUser;
  const u = getUserFromStore(id);
  _cachedUser = u || null;
  _cachedUserId = id;
  return u;
}
