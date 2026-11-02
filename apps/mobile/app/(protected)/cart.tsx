import { useRouter } from "expo-router";

import { CartScreen } from "../../features/cart/CartScreen";
import { useAuth } from "../../features/auth/AuthProvider";

export default function CartRoute() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <CartScreen
      navigation={{
        push: (route) => router.push(`/(protected)${route}` as never),
        replace: (route) => router.replace(route as never),
      }}
      onLogout={async () => {
        await logout();
        router.replace("/(public)");
      }}
    />
  );
}
