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

const product = {
  name: "QuickCop Sample Headphones",
  store: "Sample Store",
  price: 49.99,
};

const savedInformation = {
  name: "Alex Shopper",
  address: "123 Sample Street",
  city: "Sampletown",
  state: "CA",
  zip: "90210",
};

type QuickCheckoutScreenProps = {
  navigation?: AuthenticatedNavigation;
  onLogout?: () => void | Promise<void>;
};

export function QuickCheckoutScreen({
  navigation,
  onLogout,
}: QuickCheckoutScreenProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [autoFill, setAutoFill] = useState(false);
  const [autoBuy, setAutoBuy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function toggleAutoFill(enabled: boolean) {
    setAutoFill(enabled);
    if (enabled) {
      setName(savedInformation.name);
      setAddress(savedInformation.address);
      setCity(savedInformation.city);
      setState(savedInformation.state);
      setZip(savedInformation.zip);
    }
  }

  function simulateCheckout() {
    const hasInformation = [name, address, city, state, zip].every((value) =>
      value.trim(),
    );
    const limit = Number.parseFloat(maximumPrice);

    if (!hasInformation) {
      setMessage("Enter your checkout information.");
      return;
    }

    if (!Number.isFinite(limit) || limit < 0) {
      setMessage("Enter a valid maximum price.");
      return;
    }

    if (product.price > limit) {
      setMessage(
        "Checkout simulation stopped: the product exceeds your spending limit.",
      );
      return;
    }

    setMessage(
      autoBuy
        ? "Checkout simulation successful. Auto-buy would place this sample order."
        : "Checkout simulation successful.",
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthenticatedHeader navigation={navigation} onLogout={onLogout} />
        <Text accessibilityRole="header" style={styles.title}>
          Quick Checkout
        </Text>
        <Text style={styles.subtitle}>
          Practice a faster checkout with placeholder information. No purchase
          or payment will be made.
        </Text>

        <View style={styles.productCard}>
          <Text style={styles.cardLabel}>Sample product</Text>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.store}>{product.store}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Checkout information</Text>
          <TextInput
            accessibilityLabel="Name"
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor="#888"
            style={styles.input}
            value={name}
          />
          <TextInput
            accessibilityLabel="Shipping address"
            onChangeText={setAddress}
            placeholder="Shipping address"
            placeholderTextColor="#888"
            style={styles.input}
            value={address}
          />
          <TextInput
            accessibilityLabel="City"
            onChangeText={setCity}
            placeholder="City"
            placeholderTextColor="#888"
            style={styles.input}
            value={city}
          />
          <TextInput
            accessibilityLabel="State"
            onChangeText={setState}
            placeholder="State"
            placeholderTextColor="#888"
            style={styles.input}
            value={state}
          />
          <TextInput
            accessibilityLabel="ZIP code"
            keyboardType="number-pad"
            onChangeText={setZip}
            placeholder="ZIP code"
            placeholderTextColor="#888"
            style={styles.input}
            value={zip}
          />

          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.toggleTitle}>Auto-fill</Text>
              <Text style={styles.toggleDescription}>
                Use saved placeholder information.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Auto-fill saved information"
              onValueChange={toggleAutoFill}
              trackColor={{ false: "#444", true: "#2E8B57" }}
              value={autoFill}
            />
          </View>

          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text style={styles.toggleTitle}>Auto-buy simulation</Text>
              <Text style={styles.toggleDescription}>
                Show what an automatic purchase would do.
              </Text>
            </View>
            <Switch
              accessibilityLabel="Auto-buy simulation"
              onValueChange={setAutoBuy}
              trackColor={{ false: "#444", true: "#2E8B57" }}
              value={autoBuy}
            />
          </View>

          <TextInput
            accessibilityLabel="Maximum purchase price"
            inputMode="decimal"
            keyboardType="decimal-pad"
            onChangeText={setMaximumPrice}
            placeholder="Maximum purchase price"
            placeholderTextColor="#888"
            style={styles.input}
            value={maximumPrice}
          />
          <Pressable
            accessibilityRole="button"
            onPress={simulateCheckout}
            style={styles.simulateButton}
          >
            <Text style={styles.simulateButtonText}>Simulate Checkout</Text>
          </Pressable>
          {message && (
            <Text accessibilityRole="alert" style={styles.message}>
              {message}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#000", flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { color: "#fff", fontSize: 30, fontWeight: "700", marginBottom: 8 },
  subtitle: { color: "#aaa", fontSize: 16, lineHeight: 22, marginBottom: 20 },
  productCard: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    padding: 16,
  },
  cardLabel: { color: "#79DCA0", fontSize: 13, fontWeight: "700" },
  productName: { color: "#fff", fontSize: 20, fontWeight: "600", marginTop: 8 },
  store: { color: "#aaa", fontSize: 14, marginTop: 4 },
  price: { color: "#fff", fontSize: 24, fontWeight: "700", marginTop: 12 },
  formCard: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 19,
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
  toggleRow: {
    alignItems: "center",
    borderTopColor: "#2b2b2b",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  toggleCopy: { flex: 1, paddingRight: 12 },
  toggleTitle: { color: "#fff", fontSize: 16, fontWeight: "600" },
  toggleDescription: { color: "#888", fontSize: 13, marginTop: 3 },
  simulateButton: {
    alignItems: "center",
    backgroundColor: "#2E8B57",
    borderRadius: 8,
    marginTop: 4,
    paddingVertical: 14,
  },
  simulateButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  message: { color: "#79DCA0", fontSize: 15, lineHeight: 21, marginTop: 14 },
});
