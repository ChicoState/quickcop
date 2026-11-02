import { fireEvent, render } from "@testing-library/react-native";

import { ProductDetailsScreen } from "../features/watched-items/ProductDetailsScreen";
import { type WatchedItem } from "../features/watched-items/watchedItemsStore";

const item: WatchedItem = {
  id: "screenshot-item",
  name: "Running shoes",
  store: "Example Store",
  currentPrice: "See screenshot",
  targetPrice: "$89.99",
  alertEnabled: true,
  productUrl: "https://example.com/shoes",
  screenshotUri: "file:///shoes.png",
};

describe("ProductDetailsScreen", () => {
  it("shows the saved screenshot and editable product details", async () => {
    const screen = await render(<ProductDetailsScreen item={item} />);

    expect(screen.getByLabelText("Original product screenshot")).toBeTruthy();
    expect(screen.getByDisplayValue("Running shoes")).toBeTruthy();
    expect(screen.getByDisplayValue("Example Store")).toBeTruthy();
    expect(screen.getByDisplayValue("https://example.com/shoes")).toBeTruthy();
    expect(screen.getByDisplayValue("89.99")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Open retailer URL" }),
    ).toBeTruthy();
  });

  it("saves edited fields and keeps watch controls available", async () => {
    const onSave = jest.fn();
    const screen = await render(
      <ProductDetailsScreen item={item} onSave={onSave} />,
    );

    await fireEvent.changeText(
      screen.getByLabelText("Product name"),
      "Trail shoes",
    );
    await fireEvent.changeText(screen.getByLabelText("Target price"), "79.99");
    await fireEvent.press(screen.getByRole("button", { name: "Save changes" }));

    expect(onSave).toHaveBeenCalledWith({
      name: "Trail shoes",
      store: "Example Store",
      productUrl: "https://example.com/shoes",
      targetPrice: "$79.99",
    });
    expect(
      screen.getByRole("switch", { name: "Running shoes price alert" }),
    ).toBeTruthy();
  });

  it("shows a fallback when the screenshot is unavailable", async () => {
    const screen = await render(<ProductDetailsScreen item={item} />);

    await fireEvent(
      screen.getByLabelText("Original product screenshot"),
      "error",
    );

    expect(screen.getByText("Screenshot unavailable")).toBeTruthy();
  });
});
