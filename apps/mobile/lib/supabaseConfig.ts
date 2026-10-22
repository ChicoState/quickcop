export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

export class SupabaseConfigurationError extends Error {
  readonly isPublicDiagnostic: boolean;

  constructor(message: string, isPublicDiagnostic: boolean) {
    super(message);
    this.name = "SupabaseConfigurationError";
    this.isPublicDiagnostic = isPublicDiagnostic;
  }
}

function isDevelopmentBuild() {
  return (
    process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
  );
}

function isServiceRoleJwt(value: string) {
  const payload = value.split(".")[1];
  if (!payload || typeof globalThis.atob !== "function") return false;

  try {
    const normalizedPayload = payload
      .replaceAll("-", "+")
      .replaceAll("_", "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const decoded = JSON.parse(globalThis.atob(normalizedPayload)) as {
      role?: unknown;
    };
    return decoded.role === "service_role";
  } catch {
    return false;
  }
}

export function readSupabaseConfig(
  environment: Record<string, string | undefined> = process.env,
): SupabaseConfig {
  const url = environment.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const publishableKey = (
    environment.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    environment.EXPO_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();
  const publicDiagnostic = isDevelopmentBuild();

  if (!url || !publishableKey) {
    throw new SupabaseConfigurationError(
      publicDiagnostic
        ? "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
        : "Authentication is unavailable.",
      publicDiagnostic,
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new SupabaseConfigurationError(
      publicDiagnostic
        ? "EXPO_PUBLIC_SUPABASE_URL must be a valid URL."
        : "Authentication is unavailable.",
      publicDiagnostic,
    );
  }

  const localDevelopmentUrl =
    publicDiagnostic &&
    ["localhost", "127.0.0.1", "10.0.2.2"].includes(parsedUrl.hostname);
  if (parsedUrl.protocol !== "https:" && !localDevelopmentUrl) {
    throw new SupabaseConfigurationError(
      publicDiagnostic
        ? "EXPO_PUBLIC_SUPABASE_URL must use HTTPS outside local development."
        : "Authentication is unavailable.",
      publicDiagnostic,
    );
  }

  if (isServiceRoleJwt(publishableKey)) {
    throw new SupabaseConfigurationError(
      publicDiagnostic
        ? "The public Supabase key must not contain a service-role key."
        : "Authentication is unavailable.",
      publicDiagnostic,
    );
  }

  return { url, publishableKey };
}
