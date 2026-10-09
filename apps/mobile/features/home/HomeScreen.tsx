import { useState } from "react";

import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { supabase } from "../../lib/supabase";

type HomeScreenProps = {
  onLogout: () => void;
  onOpenNotifications: () => void;
  onOpenWatchedItems?: () => void;
};

export function HomeScreen({
  onLogout,
  onOpenNotifications,
  onOpenWatchedItems = () => undefined,
}: HomeScreenProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [storesOpen, setStoresOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    onLogout();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            accessibilityLabel="Open menu"
            accessibilityRole="button"
            style={styles.iconButton}
            onPress={() => setMenuOpen(!menuOpen)}
          >
            <Text style={styles.iconText}>☰</Text>
          </Pressable>

          <Text style={styles.logo}>QuickCop</Text>

          <Pressable style={styles.iconButton}>
            <Text style={styles.iconText}>⌕</Text>
          </Pressable>
        </View>

        {/* Hamburger Menu */}
        {menuOpen && (
          <View style={styles.menu}>
            <Pressable>
              <Text style={styles.menuItem}>Home</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={onOpenWatchedItems}>
              <Text style={styles.menuItem}>Watched Items</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={onOpenNotifications}>
              <Text style={styles.menuItem}>Price alerts</Text>
            </Pressable>

            <Pressable>
              <Text style={styles.menuItem}>Recommended</Text>
            </Pressable>

            <Pressable>
              <Text style={styles.menuItem}>Popular</Text>
            </Pressable>

            {/* Categories */}
            <Pressable onPress={() => setCategoriesOpen(!categoriesOpen)}>
              <Text style={styles.menuItem}>
                Categories {categoriesOpen ? "▲" : "▼"}
              </Text>
            </Pressable>

            {categoriesOpen && (
              <View style={styles.subMenu}>
                <Text style={styles.subMenuItem}>Tickets</Text>
                <Text style={styles.subMenuItem}>Cards</Text>
                <Text style={styles.subMenuItem}>Lego</Text>
                <Text style={styles.subMenuItem}>See All</Text>
              </View>
            )}

            {/* Stores */}
            <Pressable onPress={() => setStoresOpen(!storesOpen)}>
              <Text style={styles.menuItem}>
                Stores {storesOpen ? "▲" : "▼"}
              </Text>
            </Pressable>

            {storesOpen && (
              <View style={styles.subMenu}>
                <Text style={styles.subMenuItem}>Amazon</Text>
                <Text style={styles.subMenuItem}>Target</Text>
                <Text style={styles.subMenuItem}>Walmart</Text>
                <Text style={styles.subMenuItem}>See All</Text>
              </View>
            )}

            {/* Settings */}
            <Pressable>
              <Text style={styles.menuItem}>Settings</Text>
            </Pressable>

            <Pressable accessibilityRole="button" onPress={handleLogout}>
              <Text style={styles.logoutMenuItem}>Log out</Text>
            </Pressable>
          </View>
        )}

        {/* Home */}
        <Text style={styles.title}>Home</Text>

        {/* Watched Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Watched Items</Text>

          <Pressable
            accessibilityLabel="View watched items"
            accessibilityRole="button"
            onPress={onOpenWatchedItems}
            style={styles.emptyCard}
          >
            <Text style={styles.emptyText}>
              You are not watching any items yet.
            </Text>
            <Text style={styles.emptyAction}>Add or manage watched items</Text>
          </Pressable>
        </View>

        {/* Recommended */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended</Text>

          <View style={styles.productRow}>
            <ProductCard name="Product Name" store="Amazon" price="$24.99" />

            <ProductCard name="Product Name" store="Target" price="$39.99" />
          </View>
        </View>

        {/* Popular */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular</Text>

          <View style={styles.productRow}>
            <ProductCard name="Product Name" store="Walmart" price="$19.99" />

            <ProductCard name="Product Name" store="Amazon" price="$49.99" />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type ProductCardProps = {
  name: string;
  store: string;
  price: string;
};

function ProductCard({ name, store, price }: ProductCardProps) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productImage}>
        <Text style={styles.imageText}>IMG</Text>
      </View>

      <Text style={styles.productName}>{name}</Text>
      <Text style={styles.productStore}>{store}</Text>
      <Text style={styles.productPrice}>{price}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },

  content: {
    padding: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  logo: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },

  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  iconText: {
    color: "#fff",
    fontSize: 26,
  },

  menu: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    padding: 18,
    marginBottom: 25,
  },

  menuItem: {
    color: "#fff",
    fontSize: 18,
    paddingVertical: 10,
  },

  subMenu: {
    marginLeft: 20,
    marginBottom: 6,
  },

  subMenuItem: {
    color: "#aaa",
    fontSize: 16,
    paddingVertical: 7,
  },

  logoutMenuItem: {
    color: "#ff7777",
    fontSize: 18,
    paddingVertical: 10,
    marginTop: 8,
  },

  title: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 28,
  },

  section: {
    marginBottom: 32,
  },

  sectionTitle: {
    color: "#fff",
    fontSize: 21,
    fontWeight: "600",
    marginBottom: 14,
  },

  emptyCard: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#2b2b2b",
    borderRadius: 12,
    padding: 22,
  },

  emptyText: {
    color: "#aaa",
    fontSize: 15,
  },

  emptyAction: {
    color: "#79DCA0",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
  },

  productRow: {
    flexDirection: "row",
    gap: 14,
  },

  productCard: {
    flex: 1,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#2b2b2b",
    borderRadius: 12,
    padding: 12,
  },

  productImage: {
    height: 110,
    backgroundColor: "#252525",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  imageText: {
    color: "#777",
    fontSize: 14,
  },

  productName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },

  productStore: {
    color: "#888",
    fontSize: 13,
    marginBottom: 6,
  },

  productPrice: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
