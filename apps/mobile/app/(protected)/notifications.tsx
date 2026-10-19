import { useRouter } from "expo-router";

import { NotificationsScreen } from "../../features/notifications/NotificationsScreen";

export default function NotificationsRoute() {
  const router = useRouter();

  return (
    <NotificationsScreen
      onManageDeliveryPreferences={() => router.push("/(protected)/account")}
    />
  );
}
