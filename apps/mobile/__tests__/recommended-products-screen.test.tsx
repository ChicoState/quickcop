import { fireEvent, render } from "@testing-library/react-native";

import { RecommendedProductsScreen } from "../features/recommended-products/RecommendedProductsScreen";

describe("RecommendedProductsScreen", () => {
  it("shows clearly labeled sample products with stores and prices", async () => {
    const screen = await render(<RecommendedProductsScreen />);

    expect(screen.getByText("Recommended Products")).toBeTruthy();
    expect(
      screen.getByText(/Sample recommendations for preview only/),
    ).toBeTruthy();
    expect(screen.getByText("SteelSeries Arctis Nova 7")).toBeTruthy();
    expect(screen.getByText("Amazon")).toBeTruthy();
    expect(screen.getByText("$179.99")).toBeTruthy();
  });

  it("filters recommendations by product or store", async () => {
    const screen = await render(<RecommendedProductsScreen />);

    await fireEvent.changeText(
      screen.getByLabelText("Search recommended products"),
      "target",
    );

    expect(screen.getByText("Pokémon TCG 9-Pocket Binder")).toBeTruthy();
    expect(screen.queryByText("SteelSeries Arctis Nova 7")).toBeNull();
  });
});
