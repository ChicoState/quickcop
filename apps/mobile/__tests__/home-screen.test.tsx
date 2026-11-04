jest.mock("../lib/supabase", () => ({
  supabase: { auth: { signOut: jest.fn() } },
}));

jest.mock("../features/products/ProductCard", () => ({
  ProductCard: ({ name, imageUrl }: { name: string; imageUrl?: string }) => {
    return (
      <>
        <MockText testID="shared-product-card">{name}</MockText>
        {imageUrl && (
          <MockText accessibilityLabel={`${name} product image`}>
            image
          </MockText>
        )}
      </>
    );
  },
}));

import { fireEvent, render } from "@testing-library/react-native";
import { Text as MockText } from "react-native";

import { HomeScreen } from "../features/home/HomeScreen";
import { WatchedItemsProvider } from "../features/watched-items/WatchedItemsContext";
import type { WatchedItem } from "../features/watched-items/WatchedItemsScreen";

describe("HomeScreen", () => {
  it("renders homepage products with the shared ProductCard", async () => {
    const screen = await render(
      <HomeScreen onLogout={jest.fn()} onOpenNotifications={jest.fn()} />,
    );

    expect(screen.getAllByTestId("shared-product-card")).toHaveLength(4);
  });

  it("opens Watched Items from the homepage section", async () => {
    const onOpenWatchedItems = jest.fn();
    const screen = await render(
      <HomeScreen
        onLogout={jest.fn()}
        onOpenNotifications={jest.fn()}
        onOpenWatchedItems={onOpenWatchedItems}
      />,
    );

    await fireEvent.press(
      screen.getByRole("button", { name: "View watched items" }),
    );

    expect(onOpenWatchedItems).toHaveBeenCalledTimes(1);
  });

  it("opens Watched Items from the menu", async () => {
    const onOpenWatchedItems = jest.fn();
    const screen = await render(
      <HomeScreen
        onLogout={jest.fn()}
        onOpenNotifications={jest.fn()}
        onOpenWatchedItems={onOpenWatchedItems}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));
    await fireEvent.press(
      screen.getByRole("button", { name: "Watched Items" }),
    );

    expect(onOpenWatchedItems).toHaveBeenCalledTimes(1);
  });

  it("renders shared watched items and their scraper image on the homepage", async () => {
    const watchedItem: WatchedItem = {
      id: "lego",
      name: "LEGO Star Wars Set",
      store: "Amazon",
      currentPrice: "$69.99",
      targetPrice: "$59.99",
      alertEnabled: true,
      imageUrl: "https://cdn.example.com/lego-star-wars.jpg",
    };
    const screen = await render(
      <WatchedItemsProvider initialItems={[watchedItem]}>
        <HomeScreen onLogout={jest.fn()} onOpenNotifications={jest.fn()} />
      </WatchedItemsProvider>,
    );

    expect(screen.getByText("LEGO Star Wars Set")).toBeTruthy();
    expect(
      screen.getByLabelText("LEGO Star Wars Set product image"),
    ).toBeTruthy();
  });
});
