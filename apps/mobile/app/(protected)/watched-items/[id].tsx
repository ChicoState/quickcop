import { useLocalSearchParams, useRouter } from "expo-router";
import { Text } from "react-native";

import { useAuth } from "../../../features/auth/AuthProvider";
import { ProductDetailsScreen } from "../../../features/watched-items/ProductDetailsScreen";
import {
  getWatchedItems,
  removeWatchedItem,
  updateWatchedItem,
  updateWatchedItemAlert,
} from "../../../features/watched-items/watchedItemsStore";

export default function WatchedItemDetailsRoute() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { logout } = useAuth();
  const item = getWatchedItems().find((watchedItem) => watchedItem.id === id);

  if (!item) {
    return <Text>Watched item not found.</Text>;
  }

  return (
    <>
      <ProductDetailsScreen
        item={item}
        onSave={(updates) => updateWatchedItem(item.id, updates)}
        onToggleAlert={(enabled) => updateWatchedItemAlert(item.id, enabled)}
        onUnwatch={() => {
          removeWatchedItem(item.id);
          router.replace("/(protected)/watched-items");
        }}
        navigation={{
          push: (route) => router.push(`/(protected)${route}` as never),
          replace: (route) => router.replace(route as never),
        }}
        onLogout={async () => {
          await logout();
          router.replace("/(public)");
        }}
      />
    </>
  );
}
