import { describe, expect, it } from "@jest/globals";

import {
  readSupabaseConfig,
  SupabaseConfigurationError,
} from "../lib/supabaseConfig";

describe("readSupabaseConfig", () => {
  it("requires the public project URL and publishable key", () => {
    expect(() => readSupabaseConfig({})).toThrow(
      "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  });

  it("allows HTTPS project URLs", () => {
    expect(
      readSupabaseConfig({
        EXPO_PUBLIC_SUPABASE_URL: "https://quickcop.supabase.co",
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }),
    ).toEqual({
      url: "https://quickcop.supabase.co",
      publishableKey: "sb_publishable_test",
    });
  });

  it("allows HTTP only for local development hosts", () => {
    expect(
      readSupabaseConfig({
        EXPO_PUBLIC_SUPABASE_URL: "http://10.0.2.2:54321",
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
      }).url,
    ).toBe("http://10.0.2.2:54321");
  });

  it("rejects service-role JWTs in the public key slot", () => {
    const payload = "eyJyb2xlIjoic2VydmljZV9yb2xlIn0=";

    expect(() =>
      readSupabaseConfig({
        EXPO_PUBLIC_SUPABASE_URL: "https://quickcop.supabase.co",
        EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY: `header.${payload}.signature`,
      }),
    ).toThrow(SupabaseConfigurationError);
  });
});
