import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import type { ImageSourcePropType } from "react-native";

type ProductCardProps = {
  layout?: "row" | "grid";
  name: string;
  store: string;
  price: string;
  available?: boolean;
  imageUrl?: string | null;
  localImage?: ImageSourcePropType;
};

export function ProductCard({
  layout = "row",
  name,
  store,
  price,
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
          <Image contentFit="cover" source={imageSource} style={styles.image} />
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
        <Text style={[styles.price, isGrid && styles.gridPrice]}>{price}</Text>
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
  price: { color: "#79DCA0", fontSize: 17, fontWeight: "700", marginTop: 7 },
  gridPrice: { color: "#fff", marginTop: 0 },
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
