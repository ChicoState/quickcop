import { useRouter } from "expo-router";

import { HomeScreen } from "../features/home/HomeScreen";
import { supabase } from "../lib/supabase";

export default function HomeRoute() {
  const router = useRouter();

  return (
    <HomeScreen
      navigation={{ replace: (route) => router.replace(route as never) }}
      onLogout={async () => {
        await supabase.auth.signOut();
        router.replace("/");
      }}
      onOpenNotifications={() => router.replace("/notifications")}
      onOpenPopularProducts={() => router.replace("/home/popular-products")}
      onOpenWatchedItems={() => router.replace("/watched-items")}
    />
  );
}
