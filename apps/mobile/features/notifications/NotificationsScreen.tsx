import { useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type PriceAlert = {
  id: string;
  name: string;
  retailer: string;
  previousPrice: string;
  currentPrice: string;
  targetPrice: string;
  enabled: boolean;
};

const exampleAlerts: PriceAlert[] = [
  {
    id: "switch-2",
    name: "Nintendo Switch 2",
    retailer: "Target",
    previousPrice: "$499.99",
    currentPrice: "$449.99",
    targetPrice: "$450.00",
    enabled: true,
  },
  {
    id: "headphones",
    name: "Sony WH-1000XM6",
    retailer: "Amazon",
    previousPrice: "$449.99",
    currentPrice: "$398.00",
    targetPrice: "$400.00",
    enabled: true,
  },
];

type NotificationsScreenProps = {
  alerts?: PriceAlert[];
};

export function NotificationsScreen({
  alerts = exampleAlerts,
}: NotificationsScreenProps) {
  const [priceAlerts, setPriceAlerts] = useState(alerts);
  const [priceDropNotificationsEnabled, setPriceDropNotificationsEnabled] =
    useState(true);
  const [backInStockNotificationsEnabled, setBackInStockNotificationsEnabled] =
    useState(true);

  function setAlertEnabled(id: string, enabled: boolean) {
    setPriceAlerts((currentAlerts) =>
      currentAlerts.map((alert) =>
        alert.id === id ? { ...alert, enabled } : alert,
      ),
    );
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
                    Price dropped from {alert.previousPrice} to {alert.currentPrice}
                  </Text>
                  <Text style={styles.targetPrice}>
                    Your target: {alert.targetPrice}
                  </Text>
                </View>
                <Switch
                  accessibilityLabel={`${alert.name} price alert`}
                  onValueChange={(enabled) => setAlertEnabled(alert.id, enabled)}
                  thumbColor={alert.enabled ? "#FFFFFF" : "#B8B8B8"}
                  trackColor={{ false: "#4A4A4A", true: "#2E8B57" }}
                  value={alert.enabled}
                />
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            Notification settings
          </Text>
          <View style={styles.settingsCard}>
            <SettingRow
              description="Tell me when a watched item reaches my target price."
              label="Price drop notifications"
              onValueChange={setPriceDropNotificationsEnabled}
              value={priceDropNotificationsEnabled}
            />
            <View style={styles.divider} />
            <SettingRow
              description="Tell me when a watched item becomes available again."
              label="Back in stock notifications"
              onValueChange={setBackInStockNotificationsEnabled}
              value={backInStockNotificationsEnabled}
            />
          </View>
          <Text style={styles.helperText}>
            These settings are shown for preview only and are not saved yet.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type SettingRowProps = {
  description: string;
  label: string;
  onValueChange: (value: boolean) => void;
  value: boolean;
};

function SettingRow({
  description,
  label,
  onValueChange,
  value,
}: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingContent}>
        <Text style={styles.settingLabel}>{label}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        accessibilityLabel={label}
        onValueChange={onValueChange}
        thumbColor={value ? "#FFFFFF" : "#B8B8B8"}
        trackColor={{ false: "#4A4A4A", true: "#2E8B57" }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: "#fff", fontSize: 30, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#aaa", fontSize: 16, lineHeight: 22, marginBottom: 32 },
  section: { marginBottom: 32 },
  sectionTitle: { color: "#fff", fontSize: 21, fontWeight: "600", marginBottom: 14 },
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
  productName: { color: "#fff", fontSize: 17, fontWeight: "600", marginBottom: 4 },
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
  emptyTitle: { color: "#fff", fontSize: 17, fontWeight: "600", marginBottom: 6 },
  emptyText: { color: "#aaa", fontSize: 15, lineHeight: 21 },
  settingsCard: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  settingRow: { alignItems: "center", flexDirection: "row", paddingVertical: 16 },
  settingContent: { flex: 1, paddingRight: 12 },
  settingLabel: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 4 },
  settingDescription: { color: "#aaa", fontSize: 14, lineHeight: 20 },
  divider: { backgroundColor: "#2b2b2b", height: 1 },
  helperText: { color: "#888", fontSize: 13, lineHeight: 19, marginTop: 10 },
});
