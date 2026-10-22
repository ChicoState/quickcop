jest.mock("../lib/supabase", () => ({
  supabase: { auth: { signOut: jest.fn() } },
}));

jest.mock("../features/products/ProductCard", () => ({
  ProductCard: ({ name }: { name: string }) => {
    const { Text: MockText } = require("react-native");
    return <MockText testID="shared-product-card">{name}</MockText>;
  },
}));

import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

import { HomeScreen } from "../features/home/HomeScreen";

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
});
