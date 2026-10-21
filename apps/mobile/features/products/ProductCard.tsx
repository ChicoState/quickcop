import { StyleSheet, Text, View } from "react-native";

type ProductCardProps = {
  name: string;
  store: string;
  price: string;
};

export function ProductCard({ name, store, price }: ProductCardProps) {
  return (
    <View style={styles.productCard}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imagePlaceholderText}>IMG</Text>
      </View>
      <View style={styles.productDetails}>
        <Text style={styles.productName}>{name}</Text>
        <Text style={styles.store}>{store}</Text>
        <Text style={styles.price}>{price}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: {
    alignItems: "center",
    backgroundColor: "#161616",
    borderColor: "#2b2b2b",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    padding: 14,
  },
  imagePlaceholder: {
    alignItems: "center",
    backgroundColor: "#252525",
    borderRadius: 8,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  imagePlaceholderText: { color: "#777", fontSize: 12, fontWeight: "600" },
  productDetails: { flex: 1, marginLeft: 14 },
  productName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  store: { color: "#aaa", fontSize: 14, marginTop: 4 },
  price: { color: "#79DCA0", fontSize: 17, fontWeight: "700", marginTop: 7 },
});
