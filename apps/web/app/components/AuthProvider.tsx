'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  providers?: string[];
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { email: string; password: string; name?: string }) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const REFRESH_MIN_INTERVAL_MS = 30_000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshInFlightRef = useRef<Promise<void> | null>(null);
  const lastRefreshAtRef = useRef(0);

  useEffect(() => {
    const loadProfile = async () => {
      if (!accessToken || user) return;
      try {
        const response = await fetch(`${API_URL}/me`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!response.ok) return;
        const data = await response.json();
        setUser(data);
      } catch {
        setUser(null);
      }
    };
    loadProfile();
  }, [accessToken, user]);

  const persistToken = useCallback((token: string | null) => {
    setAccessToken(token);
  }, []);

  const login = useCallback(async (payload: { email: string; password: string }) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error ?? 'Αποτυχία σύνδεσης.');
    }

    const data = await response.json();
    persistToken(data.accessToken);
    setUser(data.user ?? null);
  }, [persistToken]);

  const register = useCallback(async (payload: { email: string; password: string; name?: string }) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error ?? 'Αποτυχία εγγραφής.');
    }

    const data = await response.json();
    persistToken(data.accessToken);
    setUser(data.user ?? null);
  }, [persistToken]);

  const refresh = useCallback(
    async (options?: { force?: boolean }) => {
      const now = Date.now();
      const withinInterval = now - lastRefreshAtRef.current < REFRESH_MIN_INTERVAL_MS;
      if (!options?.force && (refreshInFlightRef.current || withinInterval)) {
        return refreshInFlightRef.current ?? Promise.resolve();
      }

      const refreshPromise = (async () => {
        try {
          const response = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          });

          if (!response.ok) {
            persistToken(null);
            setUser(null);
            return;
          }

          const data = await response.json();
          persistToken(data.accessToken);
          setUser(data.user ?? null);
          lastRefreshAtRef.current = Date.now();
        } catch {
          // Network failures should not clear an existing session in memory.
        } finally {
          refreshInFlightRef.current = null;
        }
      })();

      refreshInFlightRef.current = refreshPromise;
      return refreshPromise;
    },
    [persistToken]
  );

  useEffect(() => {
    const bootstrap = async () => {
      await refresh({ force: true });
      setLoading(false);
    };
    bootstrap();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    persistToken(null);
    setUser(null);
  }, [persistToken]);

  const value = useMemo(
    () => ({ user, accessToken, loading, login, register, refresh, logout }),
    [user, accessToken, loading, login, register, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
