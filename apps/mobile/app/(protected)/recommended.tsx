import { useRouter } from "expo-router";

import { RecommendedProductsScreen } from "../../features/recommended-products/RecommendedProductsScreen";
import { supabase } from "../../lib/supabase";

export default function RecommendedProductsRoute() {
  const router = useRouter();

  return (
    <RecommendedProductsScreen
      navigation={{ replace: (route) => router.replace(route as never) }}
      onLogout={async () => {
        if (supabase) await supabase.auth.signOut();
        router.replace("/");
      }}
    />
  );
}
