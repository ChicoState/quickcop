import { readApiUrl } from "../../lib/apiConfig";
import { supabase } from "../../lib/supabase";
import { withTimeout } from "../auth/authService";
import type { FailureKind, Result } from "./accountClient";

export type Product = {
  id: string;
  name: string;
  store: string;
  price: string;
  available: boolean;
  imageUrl: string | null;
  checkedAt: string;
};

const REQUEST_TIMEOUT_MS = 10_000;

async function request<T>(path: string): Promise<Result<T>> {
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
        headers: { Authorization: `Bearer ${token}` },
      }),
      REQUEST_TIMEOUT_MS,
      "Product request timed out.",
    );
    if (res.ok) return { ok: true, data: (await res.json()) as T };

    const kind: FailureKind = res.status === 401 ? "unauthorized" : "unknown";
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

export async function loadProducts(): Promise<Result<Product[]>> {
  return request<Product[]>("/products");
}
