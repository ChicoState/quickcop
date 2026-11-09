import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { loadProducts, type Product } from "../api/productsClient";
import {
  AuthenticatedHeader,
  type AuthenticatedNavigation,
} from "../navigation/AuthenticatedHeader";
import { ProductCard } from "../products/ProductCard";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const POKEMON_POSTER_IMAGE = require("../../assets/images/pokemon-30th-poster.webp");

type PopularProductsScreenProps = {
  navigation?: AuthenticatedNavigation;
  onLogout?: () => void | Promise<void>;
};

export function PopularProductsScreen({
  navigation,
  onLogout,
}: PopularProductsScreenProps) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      const result = await loadProducts();
      if (cancelled) return;

      if (result.ok) {
        setProducts(result.data);
        setError(null);
      } else {
        setError("Unable to load products right now.");
      }
      setLoading(false);
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    if (!searchTerm) return products;

    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.store.toLowerCase().includes(searchTerm),
    );
  }, [search, products]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthenticatedHeader navigation={navigation} onLogout={onLogout} />
        <Text accessibilityRole="header" style={styles.title}>
          Popular Products
        </Text>
        <Text style={styles.subtitle}>
          Live stock status from tracked stores.
        </Text>

        <TextInput
          accessibilityLabel="Search popular products"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setSearch}
          placeholder="Search products or stores"
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={search}
        />

        <View style={styles.productList}>
          {loading ? (
            <ActivityIndicator
              color="#79DCA0"
              style={styles.loadingIndicator}
            />
          ) : error ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Something went wrong</Text>
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>Try another search.</Text>
            </View>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                available={product.available}
                localImage={POKEMON_POSTER_IMAGE}
                name={product.name}
                price={product.price}
                store={product.store}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#000" },
  content: { padding: 20, paddingBottom: 32 },
  title: { color: "#fff", fontSize: 30, fontWeight: "700" },
  subtitle: { color: "#aaa", fontSize: 15, lineHeight: 22, marginTop: 8 },
  searchInput: {
    backgroundColor: "#161616",
    borderColor: "#3a3a3a",
    borderRadius: 10,
    borderWidth: 1,
    color: "#fff",
    fontSize: 16,
    marginTop: 24,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  productList: { gap: 12, marginTop: 20 },
  loadingIndicator: { marginTop: 24 },
  emptyCard: {
    alignItems: "center",
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    padding: 24,
  },
  emptyTitle: { color: "#fff", fontSize: 17, fontWeight: "600" },
  emptyText: { color: "#aaa", fontSize: 14, marginTop: 6 },
});
