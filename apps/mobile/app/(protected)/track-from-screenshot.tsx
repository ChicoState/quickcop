import { useRouter } from "expo-router";

import { useAuth } from "../../features/auth/AuthProvider";
import { ScreenshotTrackingScreen } from "../../features/screenshot-tracking/ScreenshotTrackingScreen";

export default function TrackFromScreenshotRoute() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <ScreenshotTrackingScreen
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
