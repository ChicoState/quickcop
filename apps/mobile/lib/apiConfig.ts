export class ApiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiConfigurationError";
  }
}

function isDevelopmentBuild(environment: Record<string, string | undefined>) {
  return (
    environment.NODE_ENV === "development" || environment.NODE_ENV === "test"
  );
}

export function readApiUrl(
  environment: Record<string, string | undefined> = process.env,
): string {
  const rawUrl = environment.EXPO_PUBLIC_API_URL?.trim();
  if (!rawUrl) {
    throw new ApiConfigurationError("Missing EXPO_PUBLIC_API_URL.");
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    throw new ApiConfigurationError("EXPO_PUBLIC_API_URL must be a valid URL.");
  }

  const localDevelopmentUrl =
    isDevelopmentBuild(environment) &&
    ["localhost", "127.0.0.1", "10.0.2.2"].includes(parsedUrl.hostname);
  if (parsedUrl.protocol !== "https:" && !localDevelopmentUrl) {
    throw new ApiConfigurationError(
      "EXPO_PUBLIC_API_URL must use HTTPS outside local development.",
    );
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new ApiConfigurationError(
      "EXPO_PUBLIC_API_URL must not contain credentials.",
    );
  }

  return rawUrl.replace(/\/+$/, "");
}
