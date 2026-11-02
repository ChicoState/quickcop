import { describe, expect, it } from "@jest/globals";

import { ApiConfigurationError, readApiUrl } from "../lib/apiConfig";

describe("readApiUrl", () => {
  it("requires the API URL", () => {
    expect(() => readApiUrl({})).toThrow("Missing EXPO_PUBLIC_API_URL.");
  });

  it("allows HTTPS API URLs and removes trailing slashes", () => {
    expect(
      readApiUrl({ EXPO_PUBLIC_API_URL: "https://api.quickcop.example///" }),
    ).toBe("https://api.quickcop.example");
  });

  it("allows HTTP only for local development hosts", () => {
    expect(
      readApiUrl({
        NODE_ENV: "development",
        EXPO_PUBLIC_API_URL: "http://10.0.2.2:3000",
      }),
    ).toBe("http://10.0.2.2:3000");
  });

  it("rejects HTTP outside local development", () => {
    expect(() =>
      readApiUrl({
        NODE_ENV: "production",
        EXPO_PUBLIC_API_URL: "http://api.quickcop.example",
      }),
    ).toThrow(ApiConfigurationError);
  });

  it("rejects credentials embedded in the API URL", () => {
    expect(() =>
      readApiUrl({
        EXPO_PUBLIC_API_URL: "https://user:password@api.quickcop.example",
      }),
    ).toThrow(ApiConfigurationError);
  });
});
