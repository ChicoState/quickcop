import { useEffect, useState } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { NotificationAlert } from "../api/notificationClient";

export type PriceAlert = NotificationAlert;

type NotificationsScreenProps = {
  alerts: PriceAlert[];
  onManageDeliveryPreferences: () => void;
  onToggleAlert: (id: string, enabled: boolean) => Promise<void>;
};

export function NotificationsScreen({
  alerts,
  onManageDeliveryPreferences,
  onToggleAlert,
}: NotificationsScreenProps) {
  const [priceAlerts, setPriceAlerts] = useState(alerts);
  const [toggleError, setToggleError] = useState("");

  useEffect(() => setPriceAlerts(alerts), [alerts]);

  async function setAlertEnabled(id: string, enabled: boolean) {
    const previous = priceAlerts.find((alert) => alert.id === id)?.enabled;
    setToggleError("");
    setPriceAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === id ? { ...alert, enabled } : alert,
      ),
    );
    try {
      await onToggleAlert(id, enabled);
    } catch {
      if (previous !== undefined) {
        setPriceAlerts((currentAlerts) =>
          currentAlerts.map((alert) =>
            alert.id === id ? { ...alert, enabled: previous } : alert,
          ),
        );
      }
      setToggleError("Unable to update this alert. Try again.");
    }
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text accessibilityRole="header" style={styles.title}>
          Price alerts
        </Text>
        <Text style={styles.subtitle}>
          Track price drops for the items you are watching.
        </Text>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Recent price drops
          </Text>

          {priceAlerts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No price alerts yet</Text>
              <Text style={styles.emptyText}>
                Watch an item and set a target price to see alerts here.
              </Text>
            </View>
          ) : (
            priceAlerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertContent}>
                  <Text style={styles.productName}>{alert.name}</Text>
                  <Text style={styles.retailer}>{alert.retailer}</Text>
                  <Text style={styles.priceChange}>
                    Price dropped from {alert.previousPrice} to{" "}
                    {alert.currentPrice}
                  </Text>
                  <Text style={styles.targetPrice}>
                    Your target: {alert.targetPrice}
                  </Text>
                </View>
                <Switch
                  accessibilityLabel={`${alert.name} price alert`}
                  onValueChange={(enabled) =>
                    setAlertEnabled(alert.id, enabled)
                  }
                  thumbColor={alert.enabled ? "#FFFFFF" : "#B8B8B8"}
                  trackColor={{ false: "#4A4A4A", true: "#2E8B57" }}
                  value={alert.enabled}
                />
              </View>
            ))
          )}
          {toggleError ? (
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {toggleError}
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityLabel="Manage delivery preferences"
          accessibilityRole="button"
          onPress={onManageDeliveryPreferences}
          style={styles.preferencesLink}
        >
          <Text style={styles.preferencesLinkText}>
            Manage delivery preferences
          </Text>
          <Text style={styles.preferencesLinkDescription}>
            Choose how you receive price-change and restock alerts.
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: "#fff", fontSize: 30, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#aaa", fontSize: 16, lineHeight: 22, marginBottom: 32 },
  section: { marginBottom: 32 },
  sectionTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "600",
    marginBottom: 14,
  },
  alertCard: {
    alignItems: "center",
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    padding: 16,
  },
  alertContent: { flex: 1, paddingRight: 12 },
  productName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  retailer: { color: "#aaa", fontSize: 14, marginBottom: 10 },
  priceChange: { color: "#fff", fontSize: 15, lineHeight: 21, marginBottom: 4 },
  targetPrice: { color: "#79DCA0", fontSize: 14, fontWeight: "600" },
  emptyCard: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    padding: 22,
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
  },
  emptyText: { color: "#aaa", fontSize: 15, lineHeight: 21 },
  errorText: { color: "#FFB4AB", fontSize: 14, marginTop: 12 },
  preferencesLink: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  preferencesLinkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  preferencesLinkDescription: { color: "#aaa", fontSize: 14, lineHeight: 20 },
});
