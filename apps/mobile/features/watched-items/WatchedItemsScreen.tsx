import { useState } from "react";

import {
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

export type WatchedItem = {
  id: string;
  name: string;
  store: string;
  currentPrice: string;
  targetPrice: string;
  alertEnabled: boolean;
};

const placeholderItems: WatchedItem[] = [
  {
    id: "switch-2",
    name: "Nintendo Switch 2",
    store: "Target",
    currentPrice: "$449.99",
    targetPrice: "$450.00",
    alertEnabled: true,
  },
  {
    id: "headphones",
    name: "Sony WH-1000XM6",
    store: "Amazon",
    currentPrice: "$398.00",
    targetPrice: "$400.00",
    alertEnabled: false,
  },
];

type WatchedItemsScreenProps = {
  initialItems?: WatchedItem[];
  navigation?: AuthenticatedNavigation;
  onLogout?: () => void | Promise<void>;
};

export function WatchedItemsScreen({
  initialItems = placeholderItems,
  navigation,
  onLogout,
}: WatchedItemsScreenProps) {
  const [items, setItems] = useState(initialItems);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [name, setName] = useState("");
  const [store, setStore] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");

  function formatPrice(value: string) {
    return value.startsWith("$") ? value : `$${value}`;
  }

  function addItem() {
    if (
      !name.trim() ||
      !store.trim() ||
      !currentPrice.trim() ||
      !targetPrice.trim()
    ) {
      return;
    }

    setItems((currentItems) => [
      ...currentItems,
      {
        id: `${name.trim()}-${Date.now()}`,
        name: name.trim(),
        store: store.trim(),
        currentPrice: formatPrice(currentPrice.trim()),
        targetPrice: formatPrice(targetPrice.trim()),
        alertEnabled: true,
      },
    ]);
    setName("");
    setStore("");
    setCurrentPrice("");
    setTargetPrice("");
    setIsAddingItem(false);
  }

  function removeItem(id: string) {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }

  function setAlertEnabled(id: string, alertEnabled: boolean) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, alertEnabled } : item,
      ),
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthenticatedHeader navigation={navigation} onLogout={onLogout} />
        <View style={styles.headingRow}>
          <View style={styles.headingContent}>
            <Text accessibilityRole="header" style={styles.title}>
              Watched Items
            </Text>
            <Text style={styles.subtitle}>
              Track the prices you care about. Changes stay on this device for
              now.
            </Text>
          </View>
          <Pressable
            accessibilityLabel="Add item"
            accessibilityRole="button"
            onPress={() => setIsAddingItem(true)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Add Item</Text>
          </Pressable>
        </View>

        {isAddingItem && (
          <View style={styles.formCard}>
            <Text accessibilityRole="header" style={styles.formTitle}>
              Watch an item
            </Text>
            <TextInput
              accessibilityLabel="Product name"
              onChangeText={setName}
              placeholder="Product name"
              placeholderTextColor="#888"
              style={styles.input}
              value={name}
            />
            <TextInput
              accessibilityLabel="Store"
              onChangeText={setStore}
              placeholder="Store"
              placeholderTextColor="#888"
              style={styles.input}
              value={store}
            />
            <TextInput
              accessibilityLabel="Current price"
              inputMode="decimal"
              keyboardType="decimal-pad"
              onChangeText={setCurrentPrice}
              placeholder="Current price"
              placeholderTextColor="#888"
              style={styles.input}
              value={currentPrice}
            />
            <TextInput
              accessibilityLabel="Target price"
              inputMode="decimal"
              keyboardType="decimal-pad"
              onChangeText={setTargetPrice}
              placeholder="Target price"
              placeholderTextColor="#888"
              style={styles.input}
              value={targetPrice}
            />
            <View style={styles.formActions}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setIsAddingItem(false)}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={addItem}
                style={styles.watchButton}
              >
                <Text style={styles.watchButtonText}>Watch item</Text>
              </Pressable>
            </View>
          </View>
        )}

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No watched items yet</Text>
            <Text style={styles.emptyText}>
              Add an item to start tracking its price locally.
            </Text>
          </View>
        ) : (
          <View style={styles.items}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemContent}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.store}>{item.store}</Text>
                  </View>
                  <Switch
                    accessibilityLabel={`${item.name} price alert`}
                    onValueChange={(enabled) =>
                      setAlertEnabled(item.id, enabled)
                    }
                    thumbColor={item.alertEnabled ? "#FFFFFF" : "#B8B8B8"}
                    trackColor={{ false: "#4A4A4A", true: "#2E8B57" }}
                    value={item.alertEnabled}
                  />
                </View>
                <View style={styles.priceRow}>
                  <Text style={styles.currentPrice}>
                    Current price: {item.currentPrice}
                  </Text>
                  <Text style={styles.targetPrice}>
                    Target price: {item.targetPrice}
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={`Unwatch ${item.name}`}
                  accessibilityRole="button"
                  onPress={() => removeItem(item.id)}
                  style={styles.unwatchButton}
                >
                  <Text style={styles.unwatchButtonText}>Unwatch</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { padding: 20, paddingBottom: 40 },
  headingRow: { flexDirection: "row", gap: 12, marginBottom: 28 },
  headingContent: { flex: 1 },
  title: { color: "#fff", fontSize: 30, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#aaa", fontSize: 16, lineHeight: 22 },
  addButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2E8B57",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  formCard: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
    padding: 16,
  },
  formTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 14,
  },
  input: {
    borderColor: "#444",
    borderRadius: 8,
    borderWidth: 1,
    color: "#fff",
    fontSize: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  formActions: { flexDirection: "row", gap: 12, justifyContent: "flex-end" },
  cancelButton: { paddingHorizontal: 14, paddingVertical: 12 },
  cancelButtonText: { color: "#aaa", fontSize: 15, fontWeight: "600" },
  watchButton: {
    backgroundColor: "#2E8B57",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  watchButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  items: { gap: 12 },
  itemCard: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  itemHeader: { alignItems: "center", flexDirection: "row" },
  itemContent: { flex: 1, paddingRight: 12 },
  productName: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  store: { color: "#aaa", fontSize: 14 },
  priceRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 14 },
  currentPrice: { color: "#fff", fontSize: 15 },
  targetPrice: { color: "#79DCA0", fontSize: 15, fontWeight: "600" },
  unwatchButton: { alignSelf: "flex-start", marginTop: 16 },
  unwatchButtonText: { color: "#ff7777", fontSize: 14, fontWeight: "600" },
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
});
