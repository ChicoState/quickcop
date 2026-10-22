import { readApiUrl } from "../../lib/apiConfig";
import { supabase } from "../../lib/supabase";
import { withTimeout } from "../auth/authService";

export type NotificationAlert = {
  id: string;
  kind: "price_change" | "restock";
  name: string;
  retailer: string;
  previousPrice: string;
  currentPrice: string;
  targetPrice: string;
  enabled: boolean;
  createdAt: string;
};

export type NotificationFailureKind =
  | "configuration"
  | "unauthorized"
  | "network"
  | "unknown";

export type NotificationResult<T> =
  | { ok: true; data: T }
  | { ok: false; failure: { kind: NotificationFailureKind } };

const REQUEST_TIMEOUT_MS = 10_000;

async function request<T>(
  path: string,
  init?: RequestInit,
): Promise<NotificationResult<T>> {
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

    const response = await withTimeout(
      fetch(`${apiUrl}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }),
      REQUEST_TIMEOUT_MS,
      "Notification request timed out.",
    );

    if (response.ok) {
      return { ok: true, data: (await response.json()) as T };
    }

    return {
      ok: false,
      failure: {
        kind: response.status === 401 ? "unauthorized" : "unknown",
      },
    };
  } catch {
    try {
      readApiUrl();
    } catch {
      return { ok: false, failure: { kind: "configuration" } };
    }
    return { ok: false, failure: { kind: "network" } };
  }
}

export function loadNotifications() {
  return request<NotificationAlert[]>("/notifications");
}

export function updateNotification(id: string, enabled: boolean) {
  return request<NotificationAlert>(
    `/notifications/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ enabled }),
    },
  );
}
