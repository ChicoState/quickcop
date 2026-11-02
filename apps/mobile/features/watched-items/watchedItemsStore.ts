import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type WatchedItem = {
  id: string;
  name: string;
  store: string;
  currentPrice: string;
  targetPrice: string;
  alertEnabled: boolean;
  productUrl?: string;
  screenshotUri?: string;
};

const placeholderItems: WatchedItem[] = [
  {
    id: "switch-2",
    name: "Nintendo Switch 2",
    store: "Target",
    currentPrice: "$449.99",
    targetPrice: "$450.00",
    alertEnabled: true,
  },
  {
    id: "headphones",
    name: "Sony WH-1000XM6",
    store: "Amazon",
    currentPrice: "$398.00",
    targetPrice: "$400.00",
    alertEnabled: false,
  },
];

const STORAGE_KEY = "quickcop.watched-items";
let watchedItems = readWebItems() ?? placeholderItems;

function readWebItems(): WatchedItem[] | null {
  if (Platform.OS !== "web" || typeof localStorage === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as WatchedItem[]) : null;
  } catch {
    return null;
  }
}

function persistWatchedItems() {
  const serialized = JSON.stringify(watchedItems);

  if (Platform.OS === "web") {
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Local storage may be unavailable in private browsing or tests.
    }
    return;
  }

  void SecureStore.setItemAsync(STORAGE_KEY, serialized).catch(() => {
    // Secure storage may be unavailable on an unsupported device.
  });
}

export async function loadWatchedItems() {
  if (Platform.OS !== "web") {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) watchedItems = JSON.parse(stored) as WatchedItem[];
    } catch {
      // Keep the in-memory fallback when secure storage cannot be read.
    }
  }

  return watchedItems;
}

export function getWatchedItems() {
  return watchedItems;
}

export function addWatchedItem(item: WatchedItem) {
  watchedItems = [...watchedItems, item];
  persistWatchedItems();
}

export function removeWatchedItem(id: string) {
  watchedItems = watchedItems.filter((item) => item.id !== id);
  persistWatchedItems();
}

export type WatchedItemUpdates = Pick<
  WatchedItem,
  "name" | "store" | "productUrl" | "targetPrice"
>;

export function updateWatchedItem(id: string, updates: WatchedItemUpdates) {
  watchedItems = watchedItems.map((item) =>
    item.id === id ? { ...item, ...updates } : item,
  );
  persistWatchedItems();
}

export function updateWatchedItemAlert(id: string, alertEnabled: boolean) {
  watchedItems = watchedItems.map((item) =>
    item.id === id ? { ...item, alertEnabled } : item,
  );
  persistWatchedItems();
}

export function resetWatchedItemsForTests() {
  watchedItems = placeholderItems.map((item) => ({ ...item }));
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
