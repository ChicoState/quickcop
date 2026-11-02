import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import {
  loadNotifications,
  updateNotification,
  type NotificationAlert,
} from "../api/notificationClient";
import { NotificationsScreen } from "./NotificationsScreen";

type State =
  | { status: "loading" }
  | { status: "ready"; alerts: NotificationAlert[] }
  | { status: "error" };

export function NotificationsContainer({
  onManageDeliveryPreferences,
}: {
  onManageDeliveryPreferences: () => void;
}) {
  const [state, setState] = useState<State>({ status: "loading" });
  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState({ status: "loading" });
    const result = await loadNotifications();
    if (!mountedRef.current || requestId !== requestIdRef.current) return;

    if (result.ok) setState({ status: "ready", alerts: result.data });
    else setState({ status: "error" });
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void load();
    return () => {
      mountedRef.current = false;
      requestIdRef.current += 1;
    };
  }, [load]);

  async function toggleAlert(id: string, enabled: boolean) {
    const result = await updateNotification(id, enabled);
    if (!result.ok) throw new Error("Unable to update notification.");
    if (mountedRef.current) {
      setState((current) =>
        current.status !== "ready"
          ? current
          : {
              status: "ready",
              alerts: current.alerts.map((alert) =>
                alert.id === id ? result.data : alert,
              ),
            },
      );
    }
  }

  if (state.status === "loading") {
    return <ActivityIndicator accessibilityLabel="Loading notifications" />;
  }

  if (state.status === "error") {
    return (
      <View>
        <Text>Unable to load notifications. Try again.</Text>
        <Pressable accessibilityRole="button" onPress={() => void load()}>
          <Text>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <NotificationsScreen
      alerts={state.alerts}
      onManageDeliveryPreferences={onManageDeliveryPreferences}
      onToggleAlert={toggleAlert}
    />
  );
}
