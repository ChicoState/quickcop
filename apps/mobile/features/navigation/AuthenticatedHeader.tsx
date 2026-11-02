import { useEffect, useState } from "react";

import { Pressable, StyleSheet, Text, View } from "react-native";

import { getCartItemCount, subscribeToCart } from "../cart/cartStore";

export type AuthenticatedNavigation = {
  replace: (route: string) => void;
  push?: (route: string) => void;
};

type AuthenticatedHeaderProps = {
  navigation?: AuthenticatedNavigation;
  onLogout?: () => void | Promise<void>;
  onNavigate?: (route: string) => void;
};

const menuItems = [
  { label: "Home", route: "/home" },
  { label: "Watched Items", route: "/watched-items" },
  { label: "Track from Screenshot", route: "/track-from-screenshot" },
  { label: "Recommended", route: "/recommended" },
  { label: "Popular", route: "/home/popular-products" },
  { label: "Notifications", route: "/notifications" },
  { label: "Quick Checkout", route: "/quick-checkout" },
  { label: "Account", route: "/account" },
];

const comingSoonItems = ["Categories", "Stores", "Settings"];

export function AuthenticatedHeader({
  navigation,
  onLogout,
  onNavigate,
}: AuthenticatedHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(getCartItemCount());

  useEffect(() => subscribeToCart(() => setCartCount(getCartItemCount())), []);

  function navigate(route: string) {
    setMenuOpen(false);
    if (onNavigate) {
      onNavigate(route);
    } else {
      navigation?.replace(route);
    }
  }

  async function handleLogout() {
    setMenuOpen(false);
    if (onLogout) {
      await onLogout();
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandGroup}>
          <Pressable
            accessibilityLabel="Open menu"
            accessibilityRole="button"
            accessibilityState={{ expanded: menuOpen }}
            onPress={() => setMenuOpen((isOpen) => !isOpen)}
            style={styles.iconButton}
          >
            <Text style={styles.iconText}>☰</Text>
          </Pressable>
          <Text style={styles.logo}>QuickCop</Text>
        </View>
        <Pressable
          accessibilityLabel={`Shopping cart${cartCount ? `, ${cartCount} items` : ""}`}
          accessibilityRole="button"
          onPress={() =>
            navigation?.push?.("/cart") ?? navigation?.replace("/cart")
          }
          style={styles.cartButton}
        >
          <Text style={styles.cartIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {menuOpen && (
        <View accessibilityViewIsModal style={styles.menu}>
          {menuItems.map((item) => (
            <Pressable
              key={item.label}
              accessibilityLabel={item.label}
              accessibilityRole="button"
              onPress={() => navigate(item.route)}
              style={styles.menuButton}
            >
              <Text style={styles.menuItem}>{item.label}</Text>
            </Pressable>
          ))}

          {comingSoonItems.map((item) => (
            <Pressable
              key={item}
              accessibilityLabel={`${item}, Coming Soon`}
              accessibilityRole="button"
              accessibilityState={{ disabled: true }}
              disabled
              style={styles.menuButton}
            >
              <Text style={styles.disabledMenuItem}>
                {item} <Text style={styles.comingSoon}>Coming Soon</Text>
              </Text>
            </Pressable>
          ))}

          <Pressable
            accessibilityLabel="Log out"
            accessibilityRole="button"
            onPress={handleLogout}
            style={styles.menuButton}
          >
            <Text style={styles.logoutMenuItem}>Log out</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 20 },
  header: { alignItems: "center", flexDirection: "row" },
  brandGroup: { alignItems: "center", flexDirection: "row" },
  logo: { color: "#fff", fontSize: 24, fontWeight: "700" },
  cartButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginLeft: "auto",
    position: "relative",
    width: 44,
  },
  cartIcon: { fontSize: 22 },
  badge: {
    backgroundColor: "#79DCA0",
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 2,
    position: "absolute",
    right: -2,
    top: 0,
  },
  badgeText: {
    color: "#092313",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
  },
  iconButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    marginRight: 8,
    width: 44,
  },
  iconText: { color: "#fff", fontSize: 26 },
  menu: {
    backgroundColor: "#161616",
    borderColor: "#333",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 10,
    padding: 12,
  },
  menuButton: { borderRadius: 8 },
  menuItem: { color: "#fff", fontSize: 18, paddingVertical: 10 },
  disabledMenuItem: { color: "#666", fontSize: 18, paddingVertical: 10 },
  comingSoon: { color: "#888", fontSize: 14 },
  logoutMenuItem: {
    color: "#ff7777",
    fontSize: 18,
    marginTop: 8,
    paddingVertical: 10,
  },
});
