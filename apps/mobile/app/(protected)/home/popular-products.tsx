import { useRouter } from "expo-router";

import { PopularProductsScreen } from "../../../features/popular-products/PopularProductsScreen";
import { supabase } from "../../../lib/supabase";

export default function PopularProductsRoute() {
  const router = useRouter();

  return (
    <PopularProductsScreen
      navigation={{ replace: (route) => router.replace(route as never) }}
      onLogout={async () => {
        await supabase.auth.signOut();
        router.replace("/");
      }}
    />
  );
}
