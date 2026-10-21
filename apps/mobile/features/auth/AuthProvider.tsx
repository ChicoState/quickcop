import { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";
import { AUTH_REQUEST_TIMEOUT_MS, signOut, withTimeout } from "./authService";

export type AuthState =
  | { status: "loading" }
  | { status: "authenticated"; session: Session }
  | { status: "unauthenticated" }
  | { status: "error"; message: string };

type AuthContextType = {
  authState: AuthState;
  logout: () => Promise<{ ok: boolean }>;
  retrySessionRestore: () => void;
};

const AuthContext = createContext<AuthContextType>({
  authState: { status: "loading" },
  logout: async () => ({ ok: false }),
  retrySessionRestore: () => undefined,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ status: "loading" });
  const [retryCount, setRetryCount] = useState(0);

  const retrySessionRestore = useCallback(() => {
    setRetryCount((current) => current + 1);
  }, []);

  const logout = useCallback(async () => {
    setAuthState({ status: "unauthenticated" });
    try {
      return await signOut();
    } catch {
      return { ok: false };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    setAuthState({ status: "loading" });

    if (!supabase) {
      setAuthState({
        status: "error",
        message: "Authentication is unavailable.",
      });
      return () => {
        mounted = false;
      };
    }

    let authEventReceived = false;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        authEventReceived = true;
        setAuthState(
          newSession
            ? { status: "authenticated", session: newSession }
            : { status: "unauthenticated" },
        );
      },
    );

    void withTimeout(
      supabase.auth.getSession(),
      AUTH_REQUEST_TIMEOUT_MS,
      "Session restoration timed out.",
    )
      .then(({ data, error }) => {
        if (!mounted || authEventReceived) return;
        if (error) {
          setAuthState({
            status: "error",
            message: "Unable to restore your session. Try again.",
          });
          return;
        }

        setAuthState(
          data.session
            ? { status: "authenticated", session: data.session }
            : { status: "unauthenticated" },
        );
      })
      .catch(() => {
        if (mounted && !authEventReceived) {
          setAuthState({
            status: "error",
            message: "Unable to restore your session. Try again.",
          });
        }
      });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [retryCount]);

  return (
    <AuthContext.Provider value={{ authState, logout, retrySessionRestore }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
