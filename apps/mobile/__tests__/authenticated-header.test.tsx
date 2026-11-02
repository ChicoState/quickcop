import { fireEvent, render } from "@testing-library/react-native";

import { AuthenticatedHeader } from "../features/navigation/AuthenticatedHeader";
import { addCartItem, resetCartForTests } from "../features/cart/cartStore";

describe("AuthenticatedHeader", () => {
  afterEach(() => resetCartForTests());

  it("shows the cart item count and opens the cart", async () => {
    addCartItem({
      id: "cart-item",
      name: "Cart item",
      retailer: "Store",
      price: 10,
    });
    const push = jest.fn();
    const screen = await render(
      <AuthenticatedHeader navigation={{ replace: jest.fn(), push }} />,
    );

    expect(screen.getByLabelText("Shopping cart, 1 items")).toBeTruthy();
    await fireEvent.press(screen.getByLabelText("Shopping cart, 1 items"));

    expect(push).toHaveBeenCalledWith("/cart");
  });

  it("navigates to every existing menu route and disables unfinished routes", async () => {
    const replace = jest.fn();
    const screen = await render(
      <AuthenticatedHeader
        navigation={{ replace }}
        onLogout={() => replace("/")}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));

    for (const route of [
      ["Home", "/home"],
      ["Watched Items", "/watched-items"],
      ["Track from Screenshot", "/track-from-screenshot"],
      ["Recommended", "/recommended"],
      ["Popular", "/home/popular-products"],
      ["Notifications", "/notifications"],
      ["Quick Checkout", "/quick-checkout"],
    ]) {
      await fireEvent.press(screen.getByRole("button", { name: route[0] }));
      expect(replace).toHaveBeenLastCalledWith(route[1]);
      await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));
    }

    expect(
      screen.getByRole("button", { name: "Categories, Coming Soon" }).props
        .accessibilityState.disabled,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Stores, Coming Soon" }).props
        .accessibilityState.disabled,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Settings, Coming Soon" }).props
        .accessibilityState.disabled,
    ).toBe(true);
  });

  it("signs out and navigates to login", async () => {
    const replace = jest.fn();
    const screen = await render(
      <AuthenticatedHeader
        navigation={{ replace }}
        onLogout={() => replace("/")}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));
    await fireEvent.press(screen.getByRole("button", { name: "Log out" }));

    expect(replace).toHaveBeenCalledWith("/");
  });
});
