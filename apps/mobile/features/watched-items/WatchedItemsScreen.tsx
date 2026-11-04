import { useState } from "react";

import {
  Image,
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
  requestProductPreview,
  type ProductPreview,
} from "../api/productPreviewClient";
import {
  AuthenticatedHeader,
  type AuthenticatedNavigation,
} from "../navigation/AuthenticatedHeader";
import { useWatchedItems } from "./WatchedItemsContext";

export type WatchedItem = {
  id: string;
  name: string;
  store: string;
  currentPrice: string;
  targetPrice: string;
  alertEnabled: boolean;
  imageUrl?: string;
};

export type { ProductPreview } from "../api/productPreviewClient";

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
  previewProduct?: (url: string) => Promise<ProductPreview>;
  navigation?: AuthenticatedNavigation;
  onLogout?: () => void | Promise<void>;
};

export function WatchedItemsScreen({
  initialItems = placeholderItems,
  previewProduct = requestProductPreview,
  navigation,
  onLogout,
}: WatchedItemsScreenProps) {
  const sharedItems = useWatchedItems();
  const [localItems, setLocalItems] = useState(
    initialItems ?? placeholderItems,
  );
  const items = sharedItems?.items ?? localItems;
  const updateItems = (
    updater: (currentItems: WatchedItem[]) => WatchedItem[],
  ) => {
    if (sharedItems) sharedItems.setItems(updater);
    else setLocalItems(updater);
  };
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [productUrl, setProductUrl] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [preview, setPreview] = useState<ProductPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);

  async function previewItem() {
    const url = productUrl.trim();
    if (!url) return;

    setIsPreviewing(true);
    setPreviewError(null);
    setPreview(null);
    try {
      setPreview(await previewProduct(url));
    } catch (error) {
      setPreviewError(
        error instanceof Error
          ? error.message
          : "We could not preview this product.",
      );
    } finally {
      setIsPreviewing(false);
    }
  }

  function addItem() {
    if (!preview || !targetPrice.trim()) return;

    updateItems((currentItems) => [
      ...currentItems,
      {
        id: `${preview.sourceUrl}-${Date.now()}`,
        name: preview.name,
        store: storeName(preview.sourceUrl),
        currentPrice: formatCurrency(preview.priceCents, preview.currency),
        targetPrice: formatPrice(targetPrice.trim()),
        alertEnabled: true,
        imageUrl: preview.images[0],
      },
    ]);
    setProductUrl("");
    setTargetPrice("");
    setPreview(null);
    setPreviewError(null);
    setIsAddingItem(false);
  }

  function closeForm() {
    setIsAddingItem(false);
    setProductUrl("");
    setTargetPrice("");
    setPreview(null);
    setPreviewError(null);
  }

  function removeItem(id: string) {
    updateItems((currentItems) =>
      currentItems.filter((item) => item.id !== id),
    );
  }

  function setAlertEnabled(id: string, alertEnabled: boolean) {
    updateItems((currentItems) =>
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
              Paste a product link to automatically add its name and current
              price.
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
              accessibilityLabel="Product URL"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(value) => {
                setProductUrl(value);
                setPreview(null);
                setPreviewError(null);
              }}
              placeholder="Product URL (https://...)"
              placeholderTextColor="#888"
              style={styles.input}
              value={productUrl}
            />
            <Pressable
              accessibilityRole="button"
              disabled={isPreviewing || !productUrl.trim()}
              onPress={previewItem}
              style={styles.previewButton}
            >
              <Text style={styles.previewButtonText}>
                {isPreviewing ? "Previewing…" : "Preview product"}
              </Text>
            </Pressable>
            {previewError && (
              <Text style={styles.errorText}>{previewError}</Text>
            )}
            {preview && (
              <View style={styles.previewCard}>
                <Text style={styles.previewName}>{preview.name}</Text>
                <Text style={styles.previewPrice}>
                  Current price:{" "}
                  {formatCurrency(preview.priceCents, preview.currency)}
                </Text>
              </View>
            )}
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
                onPress={closeForm}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={!preview || !targetPrice.trim()}
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
              Add a product URL to start tracking its price locally.
            </Text>
          </View>
        ) : (
          <View style={styles.items}>
            {items.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemHeader}>
                  {item.imageUrl ? (
                    <Image
                      accessibilityLabel={`${item.name} product image`}
                      source={{ uri: item.imageUrl }}
                      style={styles.itemImage}
                    />
                  ) : null}
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

function formatPrice(value: string) {
  return value.startsWith("$") ? value : `$${value}`;
}

function formatCurrency(priceCents: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(priceCents / 100);
  } catch {
    return `${currency} ${(priceCents / 100).toFixed(2)}`;
  }
}

function storeName(sourceUrl: string) {
  try {
    const hostname = new URL(sourceUrl).hostname.replace(/^www\./, "");
    const name = hostname.split(".")[0] ?? "Store";
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return "Store";
  }
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
  previewButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2b2b2b",
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  previewButtonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  errorText: { color: "#ff9999", fontSize: 14, marginBottom: 12 },
  previewCard: {
    backgroundColor: "#202020",
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
  },
  previewName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  previewPrice: { color: "#aaa", fontSize: 14, marginTop: 4 },
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
  itemImage: { borderRadius: 8, height: 64, marginRight: 12, width: 64 },
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
