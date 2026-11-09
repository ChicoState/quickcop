import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { loadProducts, type Product } from "../api/productsClient";
import {
  AuthenticatedHeader,
  type AuthenticatedNavigation,
} from "../navigation/AuthenticatedHeader";
import { ProductCard } from "../products/ProductCard";
import { useWatchedItems } from "../watched-items/WatchedItemsContext";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const POKEMON_POSTER_IMAGE = require("../../assets/images/pokemon-30th-poster.webp");

type HomeScreenProps = {
  navigation?: AuthenticatedNavigation;
  onAccountInfo?: () => void;
  onLogout: () => void | Promise<void>;
  onOpenNotifications: () => void;
  onOpenWatchedItems?: () => void;
  onOpenPopularProducts?: () => void;
};

export function HomeScreen({
  navigation,
  onAccountInfo,
  onLogout,
  onOpenNotifications,
  onOpenWatchedItems = () => undefined,
  onOpenPopularProducts = () => undefined,
}: HomeScreenProps) {
  const watchedItems = useWatchedItems()?.items ?? [];
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    loadProducts().then((result) => {
      if (!cancelled && result.ok) setPopularProducts(result.data);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthenticatedHeader
          navigation={navigation}
          onLogout={onLogout}
          onNavigate={(route) => {
            if (route === "/watched-items") onOpenWatchedItems();
            else if (route === "/home/popular-products")
              onOpenPopularProducts();
            else if (route === "/notifications") onOpenNotifications();
            else if (route === "/account" && onAccountInfo) onAccountInfo();
            else navigation?.replace(route);
          }}
        />

        {/* Home */}
        <Text style={styles.title}>Home</Text>

        {/* Watched Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Watched Items</Text>

          {watchedItems.length === 0 ? (
            <Pressable
              accessibilityLabel="View watched items"
              accessibilityRole="button"
              onPress={onOpenWatchedItems}
              style={styles.emptyCard}
            >
              <Text style={styles.emptyText}>
                You are not watching any items yet.
              </Text>
              <Text style={styles.emptyAction}>
                Add or manage watched items
              </Text>
            </Pressable>
          ) : (
            <View style={styles.watchedItems}>
              {watchedItems.slice(0, 2).map((item) => (
                <ProductCard
                  key={item.id}
                  name={item.name}
                  imageUrl={item.imageUrl}
                  price={item.currentPrice}
                  targetPrice={item.targetPrice}
                  store={item.store}
                />
              ))}
              <Pressable
                accessibilityLabel="View watched items"
                accessibilityRole="button"
                onPress={onOpenWatchedItems}
              >
                <Text style={styles.sectionAction}>View all watched items</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Recommended */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended</Text>

          <View style={styles.productRow}>
            <ProductCard
              layout="grid"
              name="Product Name"
              price="$24.99"
              store="Amazon"
            />

            <ProductCard
              layout="grid"
              name="Product Name"
              price="$39.99"
              store="Target"
            />
          </View>
        </View>

        {/* Popular */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular</Text>
            <Pressable
              accessibilityLabel="View popular products"
              accessibilityRole="button"
              onPress={onOpenPopularProducts}
            >
              <Text style={styles.sectionAction}>See all</Text>
            </Pressable>
          </View>

          <View style={styles.productRow}>
            {popularProducts.length === 0 ? (
              <Text style={styles.emptyText}>Loading products...</Text>
            ) : (
              popularProducts
                .slice(0, 2)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    available={product.available}
                    layout="grid"
                    localImage={POKEMON_POSTER_IMAGE}
                    name={product.name}
                    price={product.price}
                    store={product.store}
                  />
                ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  },

  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  sectionAction: {
    color: "#79DCA0",
    fontSize: 14,
    fontWeight: "600",
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

  watchedItems: {
    gap: 12,
    marginTop: 14,
  },
});
