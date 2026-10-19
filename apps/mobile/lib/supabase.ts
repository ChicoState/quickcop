import "react-native-url-polyfill/auto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { secureStorage } from "./secureStorage";
import {
  readSupabaseConfig,
  type SupabaseConfig,
  SupabaseConfigurationError,
} from "./supabaseConfig";

let config: SupabaseConfig | null = null;
export let supabaseConfigError: SupabaseConfigurationError | null = null;

try {
  config = readSupabaseConfig();
} catch (error) {
  if (error instanceof SupabaseConfigurationError) {
    supabaseConfigError = error;
  } else {
    throw error;
  }
}

export const supabase: SupabaseClient | null = config
  ? createClient(config.url, config.publishableKey, {
      auth: {
        storage: secureStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
