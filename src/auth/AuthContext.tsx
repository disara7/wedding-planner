import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, ApiError, type AuthUser } from "../lib/api";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  googleClientId: string;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [googleClientId, setGoogleClientId] = useState(
    import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ""
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ user }, cfg] = await Promise.all([
          api.me(),
          api.getConfig().catch(() => ({ googleClientId: "" })),
        ]);
        if (cancelled) return;
        setUser(user);
        if (cfg.googleClientId) setGoogleClientId(cfg.googleClientId);
      } catch (err) {
        if (cancelled) return;
        // 401 just means "not logged in" — anything else we also treat as logged out.
        if (!(err instanceof ApiError)) console.error(err);
        try {
          const cfg = await api.getConfig();
          if (!cancelled && cfg.googleClientId) setGoogleClientId(cfg.googleClientId);
        } catch {
          /* ignore */
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await api.login({ email, password });
    setUser(user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const { user } = await api.register({ name, email, password });
      setUser(user);
    },
    []
  );

  const loginWithGoogle = useCallback(async (credential: string) => {
    const { user } = await api.google(credential);
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, googleClientId, login, register, loginWithGoogle, logout }),
    [user, loading, googleClientId, login, register, loginWithGoogle, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
