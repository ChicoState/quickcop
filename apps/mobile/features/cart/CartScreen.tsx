import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AuthenticatedHeader,
  type AuthenticatedNavigation,
} from "../navigation/AuthenticatedHeader";
import {
  decrementCartItem,
  getCartItems,
  getCartSubtotal,
  incrementCartItem,
  loadCart,
  removeCartItem,
  hasUnavailableCartPrices,
  subscribeToCart,
  type CartItem,
} from "./cartStore";

type CartScreenProps = {
  navigation?: AuthenticatedNavigation;
  onLogout?: () => void | Promise<void>;
};

export function CartScreen({ navigation, onLogout }: CartScreenProps) {
  const [items, setItems] = useState<CartItem[]>(getCartItems());

  useEffect(() => {
    void loadCart().then(setItems);
    return subscribeToCart(() => setItems([...getCartItems()]));
  }, []);

  const unavailablePrices = hasUnavailableCartPrices();

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthenticatedHeader navigation={navigation} onLogout={onLogout} />
        <Text accessibilityRole="header" style={styles.title}>
          Shopping Cart
        </Text>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Your cart is empty.</Text>
            <Text style={styles.secondaryText}>
              Browse products to get started.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.items}>
              {items.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.secondaryText}>{item.retailer}</Text>
                    <Text style={styles.price}>
                      {item.price === null
                        ? "Price unavailable"
                        : `$${item.price.toFixed(2)}`}
                    </Text>
                  </View>
                  <View style={styles.controls}>
                    <View style={styles.quantityControls}>
                      <Pressable
                        accessibilityLabel={`Decrease ${item.name} quantity`}
                        accessibilityRole="button"
                        onPress={() => decrementCartItem(item.id)}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>−</Text>
                      </Pressable>
                      <Text
                        accessibilityLabel={`${item.name} quantity`}
                        style={styles.quantity}
                      >
                        {item.quantity}
                      </Text>
                      <Pressable
                        accessibilityLabel={`Increase ${item.name} quantity`}
                        accessibilityRole="button"
                        onPress={() => incrementCartItem(item.id)}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </Pressable>
                    </View>
                    <Pressable
                      accessibilityLabel={`Remove ${item.name} from cart`}
                      accessibilityRole="button"
                      onPress={() => removeCartItem(item.id)}
                    >
                      <Text style={styles.removeText}>Remove</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Known-price subtotal</Text>
              <Text style={styles.summaryValue}>
                ${getCartSubtotal().toFixed(2)}
              </Text>
              {unavailablePrices && (
                <Text style={styles.warning}>
                  Some prices are unavailable. Resolve them before completing
                  checkout.
                </Text>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={() => navigation?.push?.("/quick-checkout")}
                style={styles.checkoutButton}
              >
                <Text style={styles.checkoutButtonText}>
                  Proceed to Quick Checkout
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: "#000", flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  title: { color: "#fff", fontSize: 30, fontWeight: "700", marginBottom: 20 },
  emptyCard: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    padding: 22,
  },
  emptyTitle: { color: "#fff", fontSize: 18, fontWeight: "600" },
  secondaryText: { color: "#aaa", fontSize: 14, lineHeight: 20, marginTop: 4 },
  items: { gap: 12 },
  itemCard: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    padding: 16,
  },
  itemCopy: { flex: 1, paddingRight: 12 },
  itemName: { color: "#fff", fontSize: 17, fontWeight: "600" },
  price: { color: "#79DCA0", fontSize: 15, fontWeight: "600", marginTop: 8 },
  controls: { alignItems: "flex-end", justifyContent: "space-between" },
  quantityControls: { alignItems: "center", flexDirection: "row", gap: 10 },
  quantityButton: {
    alignItems: "center",
    borderColor: "#555",
    borderRadius: 6,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
  quantityButtonText: { color: "#fff", fontSize: 18 },
  quantity: { color: "#fff", fontSize: 16, minWidth: 16, textAlign: "center" },
  removeText: {
    color: "#ff7777",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 10,
  },
  summaryCard: {
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 20,
    padding: 16,
  },
  summaryLabel: { color: "#aaa", fontSize: 14 },
  summaryValue: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
  },
  warning: { color: "#f0c674", fontSize: 14, lineHeight: 20, marginTop: 10 },
  checkoutButton: {
    alignItems: "center",
    backgroundColor: "#2E8B57",
    borderRadius: 8,
    marginTop: 16,
    padding: 14,
  },
  checkoutButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
