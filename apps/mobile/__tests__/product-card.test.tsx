import { render } from "@testing-library/react-native";

import { ProductCard } from "../features/products/ProductCard";

describe("ProductCard", () => {
  it("labels the current price and the user's target price separately", async () => {
    const screen = await render(
      <ProductCard
        name="LEGO Star Wars Set"
        store="Amazon"
        price="$69.99"
        targetPrice="$59.99"
      />,
    );

    expect(screen.getByText("Current price")).toBeTruthy();
    expect(screen.getByText("$69.99")).toBeTruthy();
    expect(screen.getByText("Your target")).toBeTruthy();
    expect(screen.getByText("$59.99")).toBeTruthy();
  });

  it("does not render a target-price row for products without a target", async () => {
    const screen = await render(
      <ProductCard name="Product Name" store="Amazon" price="$24.99" />,
    );

    expect(screen.queryByText("Your target")).toBeNull();
  });
});
