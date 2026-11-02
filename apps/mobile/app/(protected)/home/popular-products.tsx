import { useRouter } from "expo-router";

import { PopularProductsScreen } from "../../../features/popular-products/PopularProductsScreen";
import { supabase } from "../../../lib/supabase";

export default function PopularProductsRoute() {
  const router = useRouter();

  return (
    <PopularProductsScreen
      navigation={{
        push: (route) => router.push(`/(protected)${route}` as never),
        replace: (route) => router.replace(route as never),
      }}
      onLogout={async () => {
        await supabase.auth.signOut();
        router.replace("/");
      }}
    />
  );
}
