import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Supabase's session payload (access token + refresh token + user metadata)
// routinely exceeds SecureStore's 2048-byte per-item limit, so the session
// itself is kept in AsyncStorage. Nothing else currently uses this module.
export const secureStorage = {
  getItem: (key: string): Promise<string | null> => {
    if (Platform.OS === "web") {
      return Promise.resolve(localStorage.getItem(key));
    }
    return AsyncStorage.getItem(key);
  },

  setItem: (key: string, value: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },

  removeItem: (key: string): Promise<void> => {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};
