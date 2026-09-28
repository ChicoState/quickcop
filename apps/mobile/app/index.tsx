import { useRouter } from "expo-router";

import { LoginScreen } from "../features/auth/LoginScreen";

export default function LoginRoute() {
  const router = useRouter();

  return (
    <LoginScreen
      onCreateAccount={() => router.push("/create-account")}
      onLogin={() => router.replace("/home")}
    />
  );
}
