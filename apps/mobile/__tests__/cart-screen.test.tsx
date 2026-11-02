import { fireEvent, render } from "@testing-library/react-native";

import { CartScreen } from "../features/cart/CartScreen";
import { addCartItem, resetCartForTests } from "../features/cart/cartStore";

describe("CartScreen", () => {
  beforeEach(() => resetCartForTests());

  it("shows the empty cart state", async () => {
    const screen = await render(<CartScreen />);

    expect(screen.getByText("Your cart is empty.")).toBeTruthy();
    expect(screen.getByText("Browse products to get started.")).toBeTruthy();
  });

  it("supports quantity changes, removal, unavailable prices, and checkout navigation", async () => {
    addCartItem({
      id: "known",
      name: "Known item",
      retailer: "Target",
      price: 10,
    });
    addCartItem({
      id: "unknown",
      name: "Unknown item",
      retailer: "Amazon",
      price: null,
    });
    const push = jest.fn();
    const screen = await render(
      <CartScreen navigation={{ replace: jest.fn(), push }} />,
    );

    await fireEvent.press(
      screen.getByRole("button", { name: "Increase Known item quantity" }),
    );
    expect(screen.getByLabelText("Known item quantity").props.children).toBe(2);
    expect(screen.getByText("$20.00")).toBeTruthy();
    expect(screen.getByText(/Some prices are unavailable/)).toBeTruthy();

    await fireEvent.press(
      screen.getByRole("button", { name: "Remove Unknown item from cart" }),
    );
    expect(screen.queryByText("Unknown item")).toBeNull();

    await fireEvent.press(
      screen.getByRole("button", { name: "Proceed to Quick Checkout" }),
    );
    expect(push).toHaveBeenCalledWith("/quick-checkout");
  });
});
