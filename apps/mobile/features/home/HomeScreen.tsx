import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  AuthenticatedHeader,
  type AuthenticatedNavigation,
} from "../navigation/AuthenticatedHeader";
import { supabase } from "../../lib/supabase";

type HomeScreenProps = {
  navigation?: AuthenticatedNavigation;
  onLogout: () => void;
  onOpenNotifications: () => void;
  onOpenWatchedItems?: () => void;
  onOpenPopularProducts?: () => void;
};

export function HomeScreen({
  navigation,
  onLogout,
  onOpenNotifications,
  onOpenWatchedItems = () => undefined,
  onOpenPopularProducts = () => undefined,
}: HomeScreenProps) {
  async function handleLogout() {
    await supabase.auth.signOut();
    onLogout();
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AuthenticatedHeader
          navigation={navigation}
          onLogout={handleLogout}
          onNavigate={(route) => {
            if (route === "/watched-items") onOpenWatchedItems();
            else if (route === "/home/popular-products")
              onOpenPopularProducts();
            else if (route === "/notifications") onOpenNotifications();
            else navigation?.replace(route);
          }}
        />

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
