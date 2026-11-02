import { fireEvent, render } from "@testing-library/react-native";

import { PopularProductsScreen } from "../features/popular-products/PopularProductsScreen";

describe("PopularProductsScreen", () => {
  it("shows placeholder products with their stores and prices", async () => {
    const screen = await render(<PopularProductsScreen />);

    expect(screen.getByText("Nintendo Switch 2")).toBeTruthy();
    expect(screen.getByText("Target")).toBeTruthy();
    expect(screen.getByText("$449.99")).toBeTruthy();
  });

  it("filters products by search text", async () => {
    const screen = await render(<PopularProductsScreen />);

    await fireEvent.changeText(
      screen.getByLabelText("Search popular products"),
      "sony",
    );

    expect(screen.getByText("Sony WH-1000XM6")).toBeTruthy();
    expect(screen.queryByText("Nintendo Switch 2")).toBeNull();
  });

  it("filters products by category", async () => {
    const screen = await render(<PopularProductsScreen />);

    await fireEvent.press(screen.getByRole("button", { name: "Cards" }));

    expect(
      screen.getByText("Pokémon TCG: Prismatic Evolutions ETB"),
    ).toBeTruthy();
    expect(screen.queryByText("Sony WH-1000XM6")).toBeNull();
  });
});
