import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

export type CartItem = {
  id: string;
  name: string;
  retailer: string;
  price: number | null;
  quantity: number;
  productUrl?: string;
};

type CartItemInput = Omit<CartItem, "quantity">;

const STORAGE_KEY = "quickcop.cart";
let cartItems = readWebCart() ?? [];
const listeners = new Set<() => void>();

export function subscribeToCart(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyCartChanged() {
  listeners.forEach((listener) => listener());
}

function readWebCart(): CartItem[] | null {
  if (Platform.OS !== "web" || typeof localStorage === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : null;
  } catch {
    return null;
  }
}

function persistCart() {
  const serialized = JSON.stringify(cartItems);

  if (Platform.OS === "web") {
    try {
      localStorage.setItem(STORAGE_KEY, serialized);
    } catch {
      // Local storage can be unavailable in private browsing.
    }
    return;
  }

  void SecureStore.setItemAsync(STORAGE_KEY, serialized).catch(() => {
    // Keep cart behavior available if secure storage is unavailable.
  });
}

export async function loadCart() {
  if (Platform.OS !== "web") {
    try {
      const stored = await SecureStore.getItemAsync(STORAGE_KEY);
      if (stored) cartItems = JSON.parse(stored) as CartItem[];
    } catch {
      // Keep the in-memory cart if secure storage cannot be read.
    }
  }

  notifyCartChanged();
  return cartItems;
}

export function getCartItems() {
  return cartItems;
}

export function getCartItemCount() {
  return cartItems.reduce((count, item) => count + item.quantity, 0);
}

export function getCartSubtotal() {
  return cartItems.reduce(
    (subtotal, item) =>
      item.price === null ? subtotal : subtotal + item.price * item.quantity,
    0,
  );
}

export function hasUnavailableCartPrices() {
  return cartItems.some((item) => item.price === null);
}

export function addCartItem(input: CartItemInput) {
  const existingIndex = cartItems.findIndex(
    (item) => item.name === input.name && item.retailer === input.retailer,
  );

  if (existingIndex >= 0) {
    cartItems = cartItems.map((item, index) =>
      index === existingIndex
        ? {
            ...item,
            price: item.price ?? input.price,
            quantity: item.quantity + 1,
          }
        : item,
    );
  } else {
    cartItems = [...cartItems, { ...input, quantity: 1 }];
  }

  persistCart();
  notifyCartChanged();
}

export function incrementCartItem(id: string) {
  cartItems = cartItems.map((item) =>
    item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
  );
  persistCart();
  notifyCartChanged();
}

export function decrementCartItem(id: string) {
  cartItems = cartItems.flatMap((item) => {
    if (item.id !== id) return [item];
    return item.quantity <= 1 ? [] : [{ ...item, quantity: item.quantity - 1 }];
  });
  persistCart();
  notifyCartChanged();
}

export function removeCartItem(id: string) {
  cartItems = cartItems.filter((item) => item.id !== id);
  persistCart();
  notifyCartChanged();
}

export function clearCart() {
  cartItems = [];
  persistCart();
  notifyCartChanged();
}

export function resetCartForTests() {
  cartItems = [];
  if (Platform.OS === "web" && typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
}
