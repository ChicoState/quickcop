import { useRouter } from "expo-router";

import { WatchedItemsScreen } from "../../features/watched-items/WatchedItemsScreen";
import { supabase } from "../../lib/supabase";

export default function WatchedItemsRoute() {
  const router = useRouter();

  return (
    <WatchedItemsScreen
      navigation={{ replace: (route) => router.replace(route as never) }}
      onLogout={async () => {
        await supabase.auth.signOut();
        router.replace("/");
      }}
    />
  );
}
