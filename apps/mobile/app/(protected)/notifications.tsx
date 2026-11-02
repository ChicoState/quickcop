import { useRouter } from "expo-router";

import { NotificationsContainer } from "../../features/notifications/NotificationsContainer";

export default function NotificationsRoute() {
  const router = useRouter();

  return (
    <NotificationsContainer
      onManageDeliveryPreferences={() => router.push("/(protected)/account")}
    />
  );
}
