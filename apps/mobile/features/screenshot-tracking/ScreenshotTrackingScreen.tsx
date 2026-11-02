import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AuthenticatedHeader,
  type AuthenticatedNavigation,
} from "../navigation/AuthenticatedHeader";
import { addWatchedItem } from "../watched-items/watchedItemsStore";

export type ScreenshotProductForm = {
  productName: string;
  store: string;
  productUrl: string;
  targetPrice: string;
};

export function validateScreenshotProduct(
  screenshotUri: string | null,
  form: ScreenshotProductForm,
) {
  if (!screenshotUri) return "Select a product screenshot first.";
  if (!form.productName.trim()) return "Enter a product name.";
  if (!form.store.trim()) return "Enter a store or website.";

  const targetPrice = Number(form.targetPrice);
  if (
    !form.targetPrice.trim() ||
    !Number.isFinite(targetPrice) ||
    targetPrice <= 0
  ) {
    return "Enter a valid target price greater than zero.";
  }

  if (form.productUrl.trim()) {
    try {
      new URL(form.productUrl.trim());
    } catch {
      return "Enter a valid product URL or leave it blank.";
    }
  }

  return null;
}

type ScreenshotTrackingScreenProps = {
  navigation?: AuthenticatedNavigation;
  onLogout?: () => void | Promise<void>;
};

const demoProduct = {
  productName: "Example running shoes",
  store: "Example Store",
  productUrl: "https://example.com/product",
  targetPrice: "89.99",
};

export function ScreenshotTrackingScreen({
  navigation,
  onLogout,
}: ScreenshotTrackingScreenProps) {
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null);
  const [form, setForm] = useState<ScreenshotProductForm>(demoProduct);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function updateForm(field: keyof ScreenshotProductForm, value: string) {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function selectScreenshot() {
    setError(null);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("Photo library access is needed to choose a screenshot.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setScreenshotUri(result.assets[0].uri);
      setSaved(false);
    }
  }

  function addToWatchedItems() {
    const validationError = validateScreenshotProduct(screenshotUri, form);
    if (validationError) {
      setError(validationError);
      return;
    }

    addWatchedItem({
      id: `screenshot-${Date.now()}`,
      name: form.productName.trim(),
      store: form.store.trim(),
      currentPrice: "See screenshot",
      targetPrice: `$${Number(form.targetPrice).toFixed(2)}`,
      alertEnabled: true,
      productUrl: form.productUrl.trim() || undefined,
      screenshotUri: screenshotUri ?? undefined,
    });
    setSaved(true);
    setError(null);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthenticatedHeader navigation={navigation} onLogout={onLogout} />
        <Text accessibilityRole="header" style={styles.title}>
          Track from Screenshot
        </Text>
        <Text style={styles.subtitle}>
          Choose a product screenshot, then tell QuickCop what to watch. Product
          details below are examples and can be edited.
        </Text>

        <Pressable
          accessibilityLabel="Choose product screenshot"
          accessibilityRole="button"
          onPress={selectScreenshot}
          style={styles.uploadCard}
        >
          {screenshotUri ? (
            <Image
              accessibilityLabel="Selected product screenshot"
              source={{ uri: screenshotUri }}
              style={styles.preview}
            />
          ) : (
            <>
              <Text style={styles.uploadTitle}>Choose product screenshot</Text>
              <Text style={styles.uploadText}>
                Nothing is uploaded or recognized automatically.
              </Text>
            </>
          )}
          <Text style={styles.uploadAction}>
            {screenshotUri
              ? "Choose a different screenshot"
              : "Select from device"}
          </Text>
        </Pressable>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Product details</Text>
          <TextInput
            accessibilityLabel="Product name"
            onChangeText={(value) => updateForm("productName", value)}
            placeholder="Product name"
            placeholderTextColor="#777"
            style={styles.input}
            value={form.productName}
          />
          <TextInput
            accessibilityLabel="Store or website"
            onChangeText={(value) => updateForm("store", value)}
            placeholder="Store or website"
            placeholderTextColor="#777"
            style={styles.input}
            value={form.store}
          />
          <TextInput
            accessibilityLabel="Product URL"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            onChangeText={(value) => updateForm("productUrl", value)}
            placeholder="Product URL (optional)"
            placeholderTextColor="#777"
            style={styles.input}
            value={form.productUrl}
          />
          <TextInput
            accessibilityLabel="Target price"
            inputMode="decimal"
            keyboardType="decimal-pad"
            onChangeText={(value) => updateForm("targetPrice", value)}
            placeholder="Target price"
            placeholderTextColor="#777"
            style={styles.input}
            value={form.targetPrice}
          />
        </View>

        {error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        {saved && (
          <Text accessibilityLiveRegion="polite" style={styles.success}>
            Added locally. Open Watched Items to see it.
          </Text>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={addToWatchedItems}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Add to Watched Items</Text>
        </Pressable>
        <Text style={styles.note}>
          This prototype keeps the item and screenshot reference on this device
          only.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#000", flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  title: { color: "#fff", fontSize: 30, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#aaa", fontSize: 16, lineHeight: 22, marginBottom: 22 },
  uploadCard: {
    alignItems: "center",
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 170,
    justifyContent: "center",
    marginBottom: 18,
    overflow: "hidden",
    padding: 18,
  },
  uploadTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
  },
  uploadText: { color: "#aaa", fontSize: 14, textAlign: "center" },
  uploadAction: {
    color: "#79DCA0",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 14,
  },
  preview: { height: 220, resizeMode: "contain", width: "100%" },
  formCard: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
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
  error: { color: "#ff8b8b", fontSize: 14, marginTop: 14 },
  success: { color: "#79DCA0", fontSize: 14, marginTop: 14 },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#2E8B57",
    borderRadius: 8,
    marginTop: 20,
    paddingVertical: 14,
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  note: {
    color: "#777",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    textAlign: "center",
  },
});
