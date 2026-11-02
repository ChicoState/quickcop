import { Pressable, StyleSheet, Text, View } from "react-native";

import { addCartItem } from "../cart/cartStore";

type ProductCardProps = {
  layout?: "row" | "grid";
  name: string;
  store: string;
  price: string;
  onAddToCart?: () => void;
};

export function ProductCard({
  layout = "row",
  name,
  store,
  price,
  onAddToCart,
}: ProductCardProps) {
  const isGrid = layout === "grid";

  return (
    <View style={[styles.productCard, isGrid && styles.gridProductCard]}>
      <View
        style={[styles.imagePlaceholder, isGrid && styles.gridImagePlaceholder]}
      >
        <Text style={styles.imagePlaceholderText}>IMG</Text>
      </View>
      <View
        style={[styles.productDetails, isGrid && styles.gridProductDetails]}
      >
        <Text style={[styles.productName, isGrid && styles.gridProductName]}>
          {name}
        </Text>
        <Text style={[styles.store, isGrid && styles.gridStore]}>{store}</Text>
        <Text style={[styles.price, isGrid && styles.gridPrice]}>{price}</Text>
        {onAddToCart && (
          <Pressable
            accessibilityLabel={`Add ${name} to cart`}
            accessibilityRole="button"
            onPress={onAddToCart}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Add to cart</Text>
          </Pressable>
        )}
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
  gridProductCard: {
    alignItems: "stretch",
    flex: 1,
    flexDirection: "column",
    padding: 12,
  },
  imagePlaceholder: {
    alignItems: "center",
    backgroundColor: "#252525",
    borderRadius: 8,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  gridImagePlaceholder: {
    height: 110,
    marginBottom: 12,
    width: "100%",
  },
  imagePlaceholderText: { color: "#777", fontSize: 12, fontWeight: "600" },
  productDetails: { flex: 1, marginLeft: 14 },
  gridProductDetails: { marginLeft: 0 },
  productName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  gridProductName: { marginBottom: 4 },
  store: { color: "#aaa", fontSize: 14, marginTop: 4 },
  gridStore: { color: "#888", fontSize: 13, marginBottom: 6, marginTop: 0 },
  price: { color: "#79DCA0", fontSize: 17, fontWeight: "700", marginTop: 7 },
  gridPrice: { color: "#fff", marginTop: 0 },
  addButton: {
    alignSelf: "flex-start",
    backgroundColor: "#2E8B57",
    borderRadius: 6,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  addButtonText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});

export function productPriceToNumber(value: string) {
  const normalized = value.replace(/[^0-9.-]/g, "");
  const price = Number.parseFloat(normalized);
  return Number.isFinite(price) ? price : null;
}

export function addProductToCart({
  id,
  name,
  store,
  price,
}: {
  id: string;
  name: string;
  store: string;
  price: string;
}) {
  addCartItem({
    id,
    name,
    retailer: store,
    price: productPriceToNumber(price),
  });
}
