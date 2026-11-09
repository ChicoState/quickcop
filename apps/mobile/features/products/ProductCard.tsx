import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

type ProductCardProps = {
  layout?: "row" | "grid";
  name: string;
  store: string;
  price: string;
  targetPrice?: string;
  available?: boolean;
  imageUrl?: string | null;
  localImage?: ImageSourcePropType;
};

export function ProductCard({
  layout = "row",
  name,
  store,
  price,
  targetPrice,
  available,
  imageUrl,
  localImage,
}: ProductCardProps) {
  const isGrid = layout === "grid";
  const imageSource = localImage ?? (imageUrl ? { uri: imageUrl } : null);

  return (
    <View style={[styles.productCard, isGrid && styles.gridProductCard]}>
      <View
        style={[styles.imagePlaceholder, isGrid && styles.gridImagePlaceholder]}
      >
        {imageSource ? (
          <Image
            accessibilityLabel={`${name} product image`}
            contentFit="cover"
            source={imageSource}
            style={styles.image}
          />
        ) : (
          <Text style={styles.imagePlaceholderText}>IMG</Text>
        )}
      </View>
      <View
        style={[styles.productDetails, isGrid && styles.gridProductDetails]}
      >
        <Text style={[styles.productName, isGrid && styles.gridProductName]}>
          {name}
        </Text>
        <Text style={[styles.store, isGrid && styles.gridStore]}>{store}</Text>
        <View style={[styles.priceSummary, isGrid && styles.gridPriceSummary]}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Current price</Text>
            <Text style={[styles.price, isGrid && styles.gridPrice]}>
              {price}
            </Text>
          </View>
          {targetPrice ? (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Your target</Text>
              <Text style={styles.targetPrice}>{targetPrice}</Text>
            </View>
          ) : null}
        </View>
        {available !== undefined && (
          <View
            style={[
              styles.stockBadge,
              available ? styles.inStockBadge : styles.outOfStockBadge,
            ]}
          >
            <Text style={styles.stockBadgeText}>
              {available ? "In Stock" : "Out of Stock"}
            </Text>
          </View>
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
    overflow: "hidden",
    width: 72,
  },
  gridImagePlaceholder: {
    height: 110,
    marginBottom: 12,
    width: "100%",
  },
  image: { height: "100%", width: "100%" },
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
  priceSummary: { gap: 6, marginTop: 10 },
  gridPriceSummary: { gap: 4, marginTop: 8 },
  priceRow: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceLabel: { color: "#888", fontSize: 12 },
  price: { color: "#fff", fontSize: 17, fontWeight: "700" },
  gridPrice: { fontSize: 16 },
  targetPrice: { color: "#79DCA0", fontSize: 15, fontWeight: "600" },
  stockBadge: {
    alignSelf: "flex-start",
    borderRadius: 6,
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  inStockBadge: { backgroundColor: "#1d3a28" },
  outOfStockBadge: { backgroundColor: "#3a1d1d" },
  stockBadgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
});
