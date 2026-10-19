import { useRouter } from "expo-router";

import { useAuth } from "../../features/auth/AuthProvider";
import { HomeScreen } from "../../features/home/HomeScreen";

export default function HomeRoute() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <HomeScreen
      onAccountInfo={() => router.push("/(protected)/account")}
      onLogout={async () => {
        const result = await logout();
        router.replace({
          pathname: "/(public)",
          params: result.ok ? undefined : { logout: "failed" },
        });
      }}
      onOpenNotifications={() => router.push("/(protected)/notifications")}
    />
  );
}
