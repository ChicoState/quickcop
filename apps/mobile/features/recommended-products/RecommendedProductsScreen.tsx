import { useMemo, useState } from "react";

import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  AuthenticatedHeader,
  type AuthenticatedNavigation,
} from "../navigation/AuthenticatedHeader";
import { ProductCard } from "../products/ProductCard";

type RecommendedProduct = {
  id: string;
  name: string;
  store: string;
  price: string;
};

const sampleRecommendations: RecommendedProduct[] = [
  {
    id: "gaming-headset",
    name: "SteelSeries Arctis Nova 7",
    store: "Amazon",
    price: "$179.99",
  },
  {
    id: "pokemon-binder",
    name: "Pokémon TCG 9-Pocket Binder",
    store: "Target",
    price: "$14.99",
  },
  {
    id: "lego-space-rover",
    name: "LEGO City Space Explorer Rover",
    store: "Walmart",
    price: "$49.99",
  },
];

type RecommendedProductsScreenProps = {
  navigation?: AuthenticatedNavigation;
  onLogout?: () => void | Promise<void>;
};

export function RecommendedProductsScreen({
  navigation,
  onLogout,
}: RecommendedProductsScreenProps) {
  const [search, setSearch] = useState("");
  const filteredRecommendations = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    if (!searchTerm) return sampleRecommendations;

    return sampleRecommendations.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.store.toLowerCase().includes(searchTerm),
    );
  }, [search]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthenticatedHeader navigation={navigation} onLogout={onLogout} />
        <Text accessibilityRole="header" style={styles.title}>
          Recommended Products
        </Text>
        <Text style={styles.subtitle}>
          Sample recommendations for preview only. These are not personalized
          yet.
        </Text>

        <TextInput
          accessibilityLabel="Search recommended products"
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setSearch}
          placeholder="Search products or stores"
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={search}
        />

        <View style={styles.productList}>
          {filteredRecommendations.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No recommendations found</Text>
              <Text style={styles.emptyText}>Try another search.</Text>
            </View>
          ) : (
            filteredRecommendations.map((product) => (
              <ProductCard
                key={product.id}
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
  productList: { gap: 12, marginTop: 18 },
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
