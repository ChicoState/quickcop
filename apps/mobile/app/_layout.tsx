import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { ConfigurationErrorScreen } from "../features/auth/ConfigurationErrorScreen";
import { AuthProvider, useAuth } from "../features/auth/AuthProvider";
import { supabaseConfigError } from "../lib/supabase";

function RootNavigator() {
  const { authState, retrySessionRestore } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (authState.status === "loading" || authState.status === "error") return;

    const inProtectedRoutes = segments[0] === "(protected)";
    const inPublicRoutes = segments[0] === "(public)";

    if (authState.status === "authenticated" && !inProtectedRoutes) {
      router.replace("/(protected)/home");
    } else if (authState.status === "unauthenticated" && !inPublicRoutes) {
      router.replace("/(public)");
    }
  }, [authState, router, segments]);

  if (authState.status === "loading") return null;

  if (authState.status === "error") {
    return (
      <ConfigurationErrorScreen
        message={authState.message}
        onRetry={retrySessionRestore}
      />
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  if (supabaseConfigError) {
    return <ConfigurationErrorScreen message={supabaseConfigError.message} />;
  }

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}
