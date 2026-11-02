import { useRouter } from "expo-router";

import { useAuth } from "../../features/auth/AuthProvider";
import { HomeScreen } from "../../features/home/HomeScreen";

export default function HomeRoute() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <HomeScreen
      navigation={{ replace: (route) => router.replace(route as never) }}
      onAccountInfo={() => router.push("/(protected)/account")}
      onLogout={async () => {
        let result = { ok: false };
        try {
          result = await logout();
        } catch {
          // Keep the local route transition recoverable if logout unexpectedly throws.
        }
        router.replace({
          pathname: "/(public)",
          params: result.ok ? undefined : { logout: "failed" },
        });
      }}
      onOpenNotifications={() => router.push("/(protected)/notifications")}
      onOpenWatchedItems={() => router.push("/(protected)/watched-items")}
      onOpenPopularProducts={() =>
        router.push("/(protected)/home/popular-products")
      }
    />
  );
}
