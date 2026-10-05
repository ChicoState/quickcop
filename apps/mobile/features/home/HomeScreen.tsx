import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type HomeScreenProps = {
  onLogout: () => void;
};

export function HomeScreen({ onLogout }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.iconButton}>
            <Text style={styles.iconText}>☰</Text>
          </Pressable>

          <Text style={styles.logo}>QuickCop</Text>

          <Pressable style={styles.iconButton}>
            <Text style={styles.iconText}>⌕</Text>
          </Pressable>
        </View>

        <Text style={styles.title}>Home</Text>

        {/* Watched Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Watched Items</Text>

          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              You are not watching any items yet.
            </Text>
          </View>
        </View>

        {/* Recommended */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended</Text>

          <View style={styles.productRow}>
            <ProductCard
              name="Product Name"
              store="Amazon"
              price="$24.99"
            />

            <ProductCard
              name="Product Name"
              store="Target"
              price="$39.99"
            />
          </View>
        </View>

        {/* Popular */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular</Text>

          <View style={styles.productRow}>
            <ProductCard
              name="Product Name"
              store="Walmart"
              price="$19.99"
            />

            <ProductCard
              name="Product Name"
              store="Amazon"
              price="$49.99"
            />
          </View>
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

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
    marginBottom: 30,
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

  logoutButton: {
    borderWidth: 1,
    borderColor: "#444",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 30,
  },

  logoutText: {
    color: "#fff",
    fontSize: 15,
  },
});