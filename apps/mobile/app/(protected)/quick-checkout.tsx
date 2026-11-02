import { useRouter } from "expo-router";

import { useAuth } from "../../features/auth/AuthProvider";
import { QuickCheckoutScreen } from "../../features/quick-checkout/QuickCheckoutScreen";

export default function QuickCheckoutRoute() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <QuickCheckoutScreen
      navigation={{ replace: (route) => router.replace(route as never) }}
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
    />
  );
}
