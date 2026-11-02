import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type CheckoutPreference = "retailer" | "assisted" | "automatic";

const STORAGE_KEY = "quickcop.checkout-preference";
let preference: CheckoutPreference = readWebPreference() ?? "automatic";

function readWebPreference(): CheckoutPreference | null {
  if (Platform.OS !== "web" || typeof localStorage === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === "retailer" ||
    stored === "assisted" ||
    stored === "automatic"
    ? stored
    : null;
}

function persistPreference() {
  if (Platform.OS === "web") {
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Local storage can be unavailable in private browsing.
    }
    return;
  }

  void SecureStore.setItemAsync(STORAGE_KEY, preference).catch(() => {
    // Keep the in-memory preference if secure storage is unavailable.
  });
}

export function getCheckoutPreference() {
  return preference;
}

export function setCheckoutPreference(value: CheckoutPreference) {
  preference = value;
  persistPreference();
}

export async function loadCheckoutPreference() {
  if (Platform.OS !== "web") {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (
        stored === "retailer" ||
        stored === "assisted" ||
        stored === "automatic"
      ) {
        preference = stored;
      }
    } catch {
      // Keep the in-memory default if secure storage cannot be read.
    }
  }

  return preference;
}

export function isValidRetailerUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function resetCheckoutPreferenceForTests() {
  preference = "automatic";
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
