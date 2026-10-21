import { useRouter } from "expo-router";

import { NotificationsScreen } from "../features/notifications/NotificationsScreen";
import { supabase } from "../lib/supabase";

export default function NotificationsRoute() {
  const router = useRouter();

  return (
    <NotificationsScreen
      navigation={{ replace: (route) => router.replace(route as never) }}
      onLogout={async () => {
        await supabase.auth.signOut();
        router.replace("/");
      }}
    />
  );
}
