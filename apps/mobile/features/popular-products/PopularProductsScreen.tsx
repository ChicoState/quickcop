import { useMemo, useState } from "react";

import {
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
import { ProductCard } from "../products/ProductCard";

type Category = "All" | "Electronics" | "Cards" | "Collectibles";

type PopularProduct = {
  id: string;
  name: string;
  store: string;
  price: string;
  category: Exclude<Category, "All">;
};

const categories: Category[] = ["All", "Electronics", "Cards", "Collectibles"];

const products: PopularProduct[] = [
  {
    id: "switch-2",
    name: "Nintendo Switch 2",
    store: "Target",
    price: "$449.99",
    category: "Electronics",
  },
  {
    id: "headphones",
    name: "Sony WH-1000XM6",
    store: "Amazon",
    price: "$398.00",
    category: "Electronics",
  },
  {
    id: "pokemon-etb",
    name: "Pokémon TCG: Prismatic Evolutions ETB",
    store: "Walmart",
    price: "$54.97",
    category: "Cards",
  },
  {
    id: "lego-f1",
    name: "LEGO Technic Ferrari SF-24 F1 Car",
    store: "LEGO",
    price: "$229.99",
    category: "Collectibles",
  },
];

type PopularProductsScreenProps = {
  navigation?: AuthenticatedNavigation;
  onLogout?: () => void | Promise<void>;
};

export function PopularProductsScreen({
  navigation,
  onLogout,
}: PopularProductsScreenProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");

  const filteredProducts = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return products.filter((product) => {
      const inCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        product.store.toLowerCase().includes(searchTerm);

      return inCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthenticatedHeader navigation={navigation} onLogout={onLogout} />
        <Text accessibilityRole="header" style={styles.title}>
          Popular Products
        </Text>
        <Text style={styles.subtitle}>
          Browse placeholder deals from stores shoppers watch most.
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

        <ScrollView
          contentContainerStyle={styles.categoryList}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((category) => {
            const selected = category === selectedCategory;

            return (
              <Pressable
                key={category}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryButton,
                  selected && styles.categoryButtonSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selected && styles.categoryButtonTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.productList}>
          {filteredProducts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>
                Try another search or category.
              </Text>
            </View>
          ) : (
            filteredProducts.map((product) => (
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
  categoryList: { gap: 10, paddingVertical: 18 },
  categoryButton: {
    borderColor: "#454545",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  categoryButtonSelected: {
    backgroundColor: "#79DCA0",
    borderColor: "#79DCA0",
  },
  categoryButtonText: { color: "#ddd", fontSize: 14, fontWeight: "600" },
  categoryButtonTextSelected: { color: "#092313" },
  productList: { gap: 12 },
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
