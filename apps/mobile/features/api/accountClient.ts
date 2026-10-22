import { readApiUrl } from "../../lib/apiConfig";
import { supabase } from "../../lib/supabase";
import { withTimeout } from "../auth/authService";
import {
  normalizeNotificationPreferences,
  type AccountInfo,
  type NotificationPreferences,
} from "../account/types";

export type FailureKind =
  | "configuration"
  | "unauthorized"
  | "conflict"
  | "validation"
  | "network"
  | "unknown";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; failure: { kind: FailureKind } };

export class AccountSaveError extends Error {}

type ApiAccount = {
  profile: {
    username: string;
    displayName: string | null;
    phone: string | null;
  };
  notificationPreferences: NotificationPreferences;
};

const REQUEST_TIMEOUT_MS = 10_000;

async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<Result<T>> {
  if (!supabase) return { ok: false, failure: { kind: "configuration" } };

  try {
    const apiUrl = readApiUrl();
    const { data } = await withTimeout(
      supabase.auth.getSession(),
      REQUEST_TIMEOUT_MS,
      "Session lookup timed out.",
    );
    const token = data.session?.access_token;
    if (!token) return { ok: false, failure: { kind: "unauthorized" } };

    const res = await withTimeout(
      fetch(`${apiUrl}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),
      REQUEST_TIMEOUT_MS,
      "Account request timed out.",
    );
    if (res.ok) return { ok: true, data: (await res.json()) as T };

    const kind: FailureKind =
      res.status === 401
        ? "unauthorized"
        : res.status === 409
          ? "conflict"
          : res.status === 400 || res.status === 422
            ? "validation"
            : "unknown";
    return { ok: false, failure: { kind } };
  } catch {
    try {
      readApiUrl();
    } catch {
      return { ok: false, failure: { kind: "configuration" } };
    }
    return { ok: false, failure: { kind: "network" } };
  }
}

export async function loadAccount(): Promise<
  Result<Omit<AccountInfo, "pushAvailability">>
> {
  const api = await request<ApiAccount>("/account");
  if (!api.ok) return api;

  try {
    // The email lives in Supabase Auth, not in our tables.
    const { data, error } = await withTimeout(
      supabase!.auth.getUser(),
      REQUEST_TIMEOUT_MS,
      "Session lookup timed out.",
    );
    if (error || !data.user) {
      return { ok: false, failure: { kind: "unauthorized" } };
    }

    const verifiedEmail = data.user.email ?? "";
    const pendingEmail = data.user.new_email ?? null;

    return {
      ok: true,
      data: {
        username: api.data.profile.username,
        phone: api.data.profile.phone,
        notificationPreferences: normalizeNotificationPreferences(
          api.data.notificationPreferences,
        ),
        verifiedEmail,
        pendingEmail,
        email: pendingEmail ?? verifiedEmail,
      },
    };
  } catch {
    return { ok: false, failure: { kind: "network" } };
  }
}

export async function saveAccount(next: AccountInfo): Promise<void> {
  const profile = await request("/account/profile", {
    method: "PATCH",
    body: JSON.stringify({ username: next.username, phone: next.phone }),
  });
  if (!profile.ok) {
    throw new AccountSaveError(
      profile.failure.kind === "conflict"
        ? "That username is taken."
        : profile.failure.kind === "network"
          ? "Unable to connect. Try again."
          : profile.failure.kind === "validation"
            ? "Check your username (letters, numbers, underscores) and phone number (digits, optional +)."
            : "We could not save your changes. Try again.",
    );
  }

  const prefs = await request("/account/notification-preferences", {
    method: "PATCH",
    body: JSON.stringify(next.notificationPreferences),
  });
  if (!prefs.ok) {
    throw new AccountSaveError(
      prefs.failure.kind === "network"
        ? "Unable to connect. Try again."
        : "We could not save your changes. Try again.",
    );
  }

  // Email changes go through Supabase's confirmation flow, never our tables.
  // Only start one if the address differs from what Supabase already has.
  try {
    const { data } = await withTimeout(
      supabase!.auth.getUser(),
      REQUEST_TIMEOUT_MS,
      "Session lookup timed out.",
    );
    const currentTarget = data.user?.new_email ?? data.user?.email;
    if (next.email !== currentTarget) {
      const { error } = await withTimeout(
        supabase!.auth.updateUser({ email: next.email }),
        REQUEST_TIMEOUT_MS,
        "Email change timed out.",
      );
      if (error) {
        throw new AccountSaveError(
          "Your other changes were saved, but we could not start the email change. Try again.",
        );
      }
    }
  } catch (error) {
    if (error instanceof AccountSaveError) throw error;
    throw new AccountSaveError(
      "Your other changes were saved, but we could not start the email change. Try again.",
    );
  }
}
