import { supabase } from "../../lib/supabase";

export type AuthFailureKind =
  | "configuration"
  | "credentials"
  | "network"
  | "unknown";

export type AuthFailure = {
  kind: AuthFailureKind;
};

export const AUTH_REQUEST_TIMEOUT_MS = 10_000;

export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs = AUTH_REQUEST_TIMEOUT_MS,
  message = "Authentication request timed out.",
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([operation, timeout]);
  } finally {
    if (timeoutId !== undefined) clearTimeout(timeoutId);
  }
}

export type SignInResult = { ok: true } | { ok: false; failure: AuthFailure };

export type SignUpResult =
  | { ok: true; sessionCreated: boolean }
  | { ok: false; failure: AuthFailure };

function isNetworkFailure(error: unknown) {
  return (
    error instanceof TypeError ||
    (error instanceof Error &&
      /network|fetch|timeout|offline/i.test(error.message))
  );
}

function classifyProviderFailure(error: unknown): AuthFailure {
  if (isNetworkFailure(error)) {
    return { kind: "network" };
  }

  if (
    error instanceof Error &&
    /invalid.*(login|credential)|credential.*invalid/i.test(error.message)
  ) {
    return { kind: "credentials" };
  }

  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    (error.status === 400 || error.status === 401)
  ) {
    return { kind: "credentials" };
  }

  return { kind: "unknown" };
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<SignInResult> {
  if (!supabase) {
    return { ok: false, failure: { kind: "configuration" } };
  }

  try {
    const { error } = await withTimeout(
      supabase.auth.signInWithPassword({ email, password }),
    );

    if (error) {
      return { ok: false, failure: classifyProviderFailure(error) };
    }

    return { ok: true };
  } catch (error) {
    return { ok: false, failure: classifyProviderFailure(error) };
  }
}

export async function signUpWithEmail(input: {
  email: string;
  password: string;
  username: string;
  phone: string | null;
}): Promise<SignUpResult> {
  if (!supabase) {
    return { ok: false, failure: { kind: "configuration" } };
  }

  try {
    const { data, error } = await withTimeout(
      supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            username: input.username,
            display_name: input.username,
            phone: input.phone,
          },
        },
      }),
    );

    if (error) {
      return { ok: false, failure: classifyProviderFailure(error) };
    }

    return { ok: true, sessionCreated: Boolean(data.session) };
  } catch (error) {
    return { ok: false, failure: classifyProviderFailure(error) };
  }
}

export async function signOut(): Promise<{ ok: boolean }> {
  if (!supabase) return { ok: false };

  const remoteLogout = withTimeout<{ error: unknown }>(
    supabase.auth.signOut({ scope: "global" }),
    AUTH_REQUEST_TIMEOUT_MS,
    "Remote logout timed out.",
  ).catch(() => ({ error: new Error("Remote logout failed.") }));

  let localLogoutSucceeded = false;
  try {
    const { error } = await withTimeout<{ error: unknown }>(
      supabase.auth.signOut({ scope: "local" }),
      2_000,
      "Local logout timed out.",
    );
    localLogoutSucceeded = !error;
  } catch {
    localLogoutSucceeded = false;
  }

  const { error: remoteError } = await remoteLogout;
  return { ok: localLogoutSucceeded && !remoteError };
}
