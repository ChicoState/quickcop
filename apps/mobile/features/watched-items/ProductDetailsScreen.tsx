import { useState } from "react";
import {
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AuthenticatedHeader,
  type AuthenticatedNavigation,
} from "../navigation/AuthenticatedHeader";
import { addCartItem } from "../cart/cartStore";
import { type WatchedItem, type WatchedItemUpdates } from "./watchedItemsStore";

type ProductDetailsScreenProps = {
  item: WatchedItem;
  onSave?: (updates: WatchedItemUpdates) => void;
  onToggleAlert?: (enabled: boolean) => void;
  onUnwatch?: () => void;
  navigation?: AuthenticatedNavigation;
  onLogout?: () => void | Promise<void>;
};

export function ProductDetailsScreen({
  item,
  onSave,
  onToggleAlert,
  onUnwatch,
  navigation,
  onLogout,
}: ProductDetailsScreenProps) {
  const [name, setName] = useState(item.name);
  const [store, setStore] = useState(item.store);
  const [productUrl, setProductUrl] = useState(item.productUrl ?? "");
  const [targetPrice, setTargetPrice] = useState(
    item.targetPrice.replace(/^\$/, ""),
  );
  const [screenshotUnavailable, setScreenshotUnavailable] = useState(false);
  const [saved, setSaved] = useState(false);

  function saveChanges() {
    onSave?.({
      name: name.trim(),
      store: store.trim(),
      productUrl: productUrl.trim() || undefined,
      targetPrice: targetPrice.trim().startsWith("$")
        ? targetPrice.trim()
        : `$${targetPrice.trim()}`,
    });
    setSaved(true);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthenticatedHeader navigation={navigation} onLogout={onLogout} />
        <Text accessibilityRole="header" style={styles.title}>
          Product Details
        </Text>

        {item.screenshotUri && !screenshotUnavailable ? (
          <Image
            accessibilityLabel="Original product screenshot"
            onError={() => setScreenshotUnavailable(true)}
            source={{ uri: item.screenshotUri }}
            style={styles.screenshot}
          />
        ) : item.screenshotUri ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableTitle}>Screenshot unavailable</Text>
            <Text style={styles.secondaryText}>
              The original image is no longer available on this device.
            </Text>
          </View>
        ) : (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableTitle}>No screenshot saved</Text>
            <Text style={styles.secondaryText}>
              This item was not tracked from a screenshot.
            </Text>
          </View>
        )}

        <View style={styles.detailsCard}>
          <Text style={styles.label}>Product name</Text>
          <TextInput
            accessibilityLabel="Product name"
            onChangeText={setName}
            style={styles.input}
            value={name}
          />
          <Text style={styles.label}>Retailer</Text>
          <TextInput
            accessibilityLabel="Retailer"
            onChangeText={setStore}
            style={styles.input}
            value={store}
          />
          <Text style={styles.label}>Product URL</Text>
          <TextInput
            accessibilityLabel="Product URL"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setProductUrl}
            style={styles.input}
            value={productUrl}
          />
          <Text style={styles.label}>Current price</Text>
          <Text style={styles.value}>{item.currentPrice || "Unavailable"}</Text>
          <Text style={styles.label}>Target price</Text>
          <TextInput
            accessibilityLabel="Target price"
            keyboardType="decimal-pad"
            onChangeText={setTargetPrice}
            style={styles.input}
            value={targetPrice}
          />
        </View>

        {productUrl.trim() && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open retailer URL"
            onPress={() => void Linking.openURL(productUrl.trim())}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Open retailer URL</Text>
          </Pressable>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Add ${item.name} to cart`}
          onPress={() =>
            addCartItem({
              id: item.id,
              name: item.name,
              retailer: item.store,
              productUrl: item.productUrl,
              price: item.currentPrice.startsWith("$")
                ? Number.parseFloat(item.currentPrice.replace("$", ""))
                : null,
            })
          }
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Add to cart</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={saveChanges}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Save changes</Text>
        </Pressable>
        {saved && <Text style={styles.saved}>Saved locally.</Text>}
        <View style={styles.watchRow}>
          <Text style={styles.value}>Price alert</Text>
          <Switch
            accessibilityLabel={`${item.name} price alert`}
            onValueChange={onToggleAlert}
            value={item.alertEnabled}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onUnwatch}
          style={styles.unwatchButton}
        >
          <Text style={styles.unwatchText}>Unwatch item</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#000", flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  title: { color: "#fff", fontSize: 30, fontWeight: "700", marginBottom: 20 },
  screenshot: {
    backgroundColor: "#161616",
    height: 260,
    marginBottom: 18,
    width: "100%",
  },
  unavailableCard: {
    backgroundColor: "#161616",
    borderRadius: 12,
    marginBottom: 18,
    padding: 18,
  },
  unavailableTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 6,
  },
  secondaryText: { color: "#aaa", fontSize: 14, lineHeight: 20 },
  detailsCard: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  label: { color: "#aaa", fontSize: 13, marginBottom: 6 },
  input: {
    borderColor: "#444",
    borderRadius: 8,
    borderWidth: 1,
    color: "#fff",
    fontSize: 16,
    marginBottom: 14,
    padding: 11,
  },
  value: { color: "#fff", fontSize: 16, marginBottom: 14 },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2E8B57",
    borderRadius: 8,
    marginTop: 16,
    padding: 14,
  },
  primaryButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  secondaryButton: {
    alignItems: "center",
    borderColor: "#2E8B57",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 13,
  },
  secondaryButtonText: { color: "#79DCA0", fontSize: 15, fontWeight: "700" },
  saved: { color: "#79DCA0", marginTop: 12, textAlign: "center" },
  watchRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  unwatchButton: { marginTop: 18 },
  unwatchText: { color: "#ff7777", fontSize: 14, fontWeight: "600" },
});
