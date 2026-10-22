import { useLocalSearchParams, useRouter } from "expo-router";

import { LoginScreen } from "../../features/auth/LoginScreen";

export default function LoginRoute() {
  const router = useRouter();
  const { logout } = useLocalSearchParams<{ logout?: string }>();

  return (
    <LoginScreen
      initialNotice={
        logout === "failed"
          ? "You were signed out on this device, but the server could not be reached. Try again later."
          : undefined
      }
      onCreateAccount={() => router.push("/(public)/create-account")}
      onLogin={() => router.replace("/(protected)/home")}
    />
  );
}
