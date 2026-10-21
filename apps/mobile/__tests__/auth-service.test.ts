import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { signInWithEmail, signOut } from "../features/auth/authService";
import { supabase } from "../lib/supabase";

jest.mock("../lib/supabase", () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

const mockAuth = (supabase as NonNullable<typeof supabase>).auth as unknown as {
  signInWithPassword: jest.MockedFunction<
    (input: {
      email: string;
      password: string;
    }) => Promise<{ error: unknown | null }>
  >;
  signOut: jest.MockedFunction<
    (options?: {
      scope: "global" | "local";
    }) => Promise<{ error: unknown | null }>
  >;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.signInWithPassword.mockResolvedValue({ error: null });
  mockAuth.signOut.mockResolvedValue({ error: null });
});

describe("authService", () => {
  it("classifies unexpected sign-in failures separately from credentials", async () => {
    mockAuth.signInWithPassword.mockRejectedValue(
      new Error("Unexpected provider failure"),
    );

    await expect(
      signInWithEmail("person@example.com", "password123"),
    ).resolves.toEqual({
      ok: false,
      failure: { kind: "unknown" },
    });
  });

  it("clears local auth while attempting remote revocation", async () => {
    await expect(signOut()).resolves.toEqual({ ok: true });

    expect(mockAuth.signOut).toHaveBeenNthCalledWith(1, { scope: "global" });
    expect(mockAuth.signOut).toHaveBeenNthCalledWith(2, { scope: "local" });
  });

  it("reports remote logout failure without leaving local auth uncleared", async () => {
    mockAuth.signOut
      .mockResolvedValueOnce({ error: new Error("remote failure") })
      .mockResolvedValueOnce({ error: null });

    await expect(signOut()).resolves.toEqual({ ok: false });
    expect(mockAuth.signOut).toHaveBeenNthCalledWith(2, { scope: "local" });
  });

  it("still attempts remote revocation when local logout fails", async () => {
    mockAuth.signOut
      .mockResolvedValueOnce({ error: null })
      .mockResolvedValueOnce({ error: new Error("local failure") });

    await expect(signOut()).resolves.toEqual({ ok: false });
    expect(mockAuth.signOut).toHaveBeenNthCalledWith(1, { scope: "global" });
  });
});
