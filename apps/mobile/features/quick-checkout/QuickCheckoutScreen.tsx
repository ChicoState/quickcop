import { useEffect, useState } from "react";

import {
  Pressable,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getCartItems,
  getCartSubtotal,
  hasUnavailableCartPrices,
  loadCart,
  type CartItem,
} from "../cart/cartStore";

import {
  AuthenticatedHeader,
  type AuthenticatedNavigation,
} from "../navigation/AuthenticatedHeader";
import {
  getCheckoutPreference,
  isValidRetailerUrl,
  loadCheckoutPreference,
  setCheckoutPreference,
  type CheckoutPreference,
} from "./checkoutPreferences";

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
  const [preference, setPreference] = useState<CheckoutPreference>(
    getCheckoutPreference(),
  );
  const [cartItems, setCartItems] = useState<CartItem[]>(getCartItems());

  useEffect(() => {
    void loadCheckoutPreference().then(setPreference);
    void loadCart().then(setCartItems);
  }, []);

  const checkoutItems = cartItems.length
    ? cartItems
    : [
        {
          id: "sample",
          name: product.name,
          retailer: product.store,
          price: product.price,
          quantity: 1,
        },
      ];
  const retailerUrl = cartItems[0]?.productUrl;

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

    if (cartItems.length && hasUnavailableCartPrices()) {
      setMessage(
        "Resolve unavailable product prices before simulating cart checkout.",
      );
      return;
    }

    const subtotal = cartItems.length ? getCartSubtotal() : product.price;
    if (subtotal > limit) {
      setMessage(
        "Checkout simulation stopped: the product exceeds your spending limit.",
      );
      return;
    }

    setMessage(
      autoBuy
        ? "Checkout simulation successful. No purchase was made; this only simulates the cart order."
        : "Checkout simulation successful.",
    );
  }

  function choosePreference(value: CheckoutPreference) {
    setPreference(value);
    setCheckoutPreference(value);
    setMessage(null);
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

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Purchase Preferences</Text>
          <Text style={styles.preferenceDescription}>
            Choose how QuickCop should hand off or simulate a purchase.
          </Text>
          <PreferenceOption
            description="Open the product's actual retailer website."
            label="Retailer Checkout"
            onPress={() => choosePreference("retailer")}
            selected={preference === "retailer"}
          />
          <PreferenceOption
            disabled
            description="Assisted purchasing is not implemented yet."
            label="Assisted Checkout"
            onPress={() => undefined}
            selected={preference === "assisted"}
          />
          <PreferenceOption
            description="Run a local checkout simulation without purchasing."
            label="Automatic Purchase Simulation"
            onPress={() => choosePreference("automatic")}
            selected={preference === "automatic"}
          />
          {preference === "retailer" && (
            <>
              <Text style={styles.preferenceNote}>
                QuickCop will not complete the purchase for you.
              </Text>
              {retailerUrl && isValidRetailerUrl(retailerUrl) ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void Linking.openURL(retailerUrl)}
                  style={styles.retailerButton}
                >
                  <Text style={styles.retailerButtonText}>
                    Open Retailer Website
                  </Text>
                </Pressable>
              ) : (
                <Text style={styles.preferenceNote}>
                  A valid retailer URL is not available for this cart.
                </Text>
              )}
            </>
          )}
          {preference === "assisted" && (
            <Text style={styles.preferenceNote}>Coming Soon</Text>
          )}
        </View>

        <View style={styles.productCard}>
          <Text style={styles.cardLabel}>
            {cartItems.length ? "Cart products" : "Sample product"}
          </Text>
          {checkoutItems.map((item) => (
            <View key={item.id} style={styles.checkoutItem}>
              <View style={styles.checkoutItemCopy}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.store}>{item.retailer}</Text>
              </View>
              <Text style={styles.price}>
                {item.price === null
                  ? "Price unavailable"
                  : `$${(item.price * item.quantity).toFixed(2)}`}
              </Text>
            </View>
          ))}
        </View>

        {preference === "automatic" && (
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function PreferenceOption({
  description,
  disabled = false,
  label,
  onPress,
  selected,
}: {
  description: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  selected: boolean;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="radio"
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPress={onPress}
      style={styles.preferenceRow}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <View style={styles.preferenceCopy}>
        <Text style={[styles.toggleTitle, disabled && styles.disabledText]}>
          {label}
        </Text>
        <Text style={styles.toggleDescription}>{description}</Text>
      </View>
      {disabled && <Text style={styles.comingSoon}>Coming Soon</Text>}
    </Pressable>
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
  checkoutItem: { alignItems: "center", flexDirection: "row", marginTop: 12 },
  checkoutItemCopy: { flex: 1 },
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
  preferenceDescription: {
    color: "#aaa",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  preferenceRow: {
    alignItems: "center",
    borderTopColor: "#2b2b2b",
    borderTopWidth: 1,
    flexDirection: "row",
    paddingVertical: 13,
  },
  radio: {
    alignItems: "center",
    borderColor: "#777",
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: "center",
    marginRight: 12,
    width: 20,
  },
  radioSelected: { borderColor: "#79DCA0" },
  radioDot: {
    backgroundColor: "#79DCA0",
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  preferenceCopy: { flex: 1 },
  preferenceNote: {
    color: "#f0c674",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  disabledText: { color: "#777" },
  comingSoon: { color: "#888", fontSize: 12, fontWeight: "700" },
  retailerButton: {
    alignItems: "center",
    borderColor: "#79DCA0",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 13,
  },
  retailerButtonText: { color: "#79DCA0", fontSize: 15, fontWeight: "700" },
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
