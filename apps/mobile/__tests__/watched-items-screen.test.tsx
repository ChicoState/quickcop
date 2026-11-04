import { fireEvent, render } from "@testing-library/react-native";

import {
  WatchedItemsScreen,
  type ProductPreview,
  type WatchedItem,
} from "../features/watched-items/WatchedItemsScreen";

describe("WatchedItemsScreen", () => {
  it("shows placeholder watched products and lets the user toggle an alert locally", async () => {
    const screen = await render(<WatchedItemsScreen />);

    expect(screen.getByText("Nintendo Switch 2")).toBeTruthy();
    expect(screen.getByText("Target")).toBeTruthy();
    expect(screen.getByText("Current price: $449.99")).toBeTruthy();
    expect(screen.getByText("Target price: $450.00")).toBeTruthy();

    const alertToggle = screen.getByRole("switch", {
      name: "Nintendo Switch 2 price alert",
    });
    expect(alertToggle.props.value).toBe(true);

    await fireEvent(alertToggle, "valueChange", false);

    expect(
      screen.getByRole("switch", { name: "Nintendo Switch 2 price alert" })
        .props.value,
    ).toBe(false);
  });

  it("previews a URL and adds the returned product with a target price", async () => {
    const previewProduct = jest
      .fn<Promise<ProductPreview>, [string]>()
      .mockResolvedValue({
        name: "LEGO Star Wars Set",
        priceCents: 6999,
        currency: "USD",
        sourceUrl: "https://www.amazon.com/dp/lego-star-wars",
        images: ["https://cdn.example.com/lego-star-wars.jpg"],
      });
    const screen = await render(
      <WatchedItemsScreen initialItems={[]} previewProduct={previewProduct} />,
    );

    expect(screen.getByText("No watched items yet")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Add item" }));
    await fireEvent.changeText(
      screen.getByLabelText("Product URL"),
      "https://www.amazon.com/dp/lego-star-wars",
    );
    await fireEvent.changeText(screen.getByLabelText("Target price"), "59.99");
    await fireEvent.press(
      screen.getByRole("button", { name: "Preview product" }),
    );
    expect(previewProduct).toHaveBeenCalledWith(
      "https://www.amazon.com/dp/lego-star-wars",
    );
    await fireEvent.press(screen.getByRole("button", { name: "Watch item" }));

    expect(screen.getByText("LEGO Star Wars Set")).toBeTruthy();
    expect(screen.getByText("Amazon")).toBeTruthy();
    expect(screen.getByText("Current price: $69.99")).toBeTruthy();
    expect(screen.getByText("Target price: $59.99")).toBeTruthy();
    expect(
      screen.getByLabelText("LEGO Star Wars Set product image"),
    ).toBeTruthy();

    await fireEvent.press(
      screen.getByRole("button", { name: "Unwatch LEGO Star Wars Set" }),
    );

    expect(screen.getByText("No watched items yet")).toBeTruthy();
  });

  it("shows a preview error without adding an item", async () => {
    const previewProduct = jest
      .fn<Promise<ProductPreview>, [string]>()
      .mockRejectedValue(new Error("Product name or price was not found."));
    const screen = await render(
      <WatchedItemsScreen initialItems={[]} previewProduct={previewProduct} />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Add item" }));
    await fireEvent.changeText(
      screen.getByLabelText("Product URL"),
      "https://store.example/missing",
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Preview product" }),
    );

    expect(
      screen.getByText("Product name or price was not found."),
    ).toBeTruthy();
    expect(screen.getByText("No watched items yet")).toBeTruthy();
  });

  it("shows an empty state when no watched items are available", async () => {
    const items: WatchedItem[] = [];
    const screen = await render(<WatchedItemsScreen initialItems={items} />);

    expect(screen.getByText("No watched items yet")).toBeTruthy();
    expect(
      screen.getByText(
        "Add a product URL to start tracking its price locally.",
      ),
    ).toBeTruthy();
  });
});
