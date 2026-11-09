import { fireEvent, render, waitFor } from "@testing-library/react-native";

jest.mock("../features/api/productsClient", () => ({
  loadProducts: jest.fn().mockResolvedValue({
    ok: true,
    data: [
      {
        id: "switch-2",
        name: "Nintendo Switch 2",
        store: "Target",
        price: "$449.99",
        available: true,
        imageUrl: null,
        checkedAt: "2026-11-08T00:00:00.000Z",
      },
      {
        id: "headphones",
        name: "Sony WH-1000XM6",
        store: "Amazon",
        price: "$398.00",
        available: true,
        imageUrl: null,
        checkedAt: "2026-11-08T00:00:00.000Z",
      },
      {
        id: "pokemon-etb",
        name: "Pokémon TCG: Prismatic Evolutions ETB",
        store: "Walmart",
        price: "$54.97",
        available: false,
        imageUrl: null,
        checkedAt: "2026-11-08T00:00:00.000Z",
      },
    ],
  }),
}));

import { PopularProductsScreen } from "../features/popular-products/PopularProductsScreen";

describe("PopularProductsScreen", () => {
  it("shows products with their stores and prices", async () => {
    const screen = await render(<PopularProductsScreen />);

    await waitFor(() => {
      expect(screen.getByText("Nintendo Switch 2")).toBeTruthy();
    });
    expect(screen.getByText("Nintendo Switch 2")).toBeTruthy();
    expect(screen.getByText("Target")).toBeTruthy();
    expect(screen.getByText("$449.99")).toBeTruthy();
  });

  it("filters products by search text", async () => {
    const screen = await render(<PopularProductsScreen />);

    await waitFor(() =>
      expect(screen.getByText("Sony WH-1000XM6")).toBeTruthy(),
    );

    await fireEvent.changeText(
      screen.getByLabelText("Search popular products"),
      "sony",
    );

    expect(screen.getByText("Sony WH-1000XM6")).toBeTruthy();
    expect(screen.queryByText("Nintendo Switch 2")).toBeNull();
  });

  it("shows stock status for unavailable products", async () => {
    const screen = await render(<PopularProductsScreen />);

    await waitFor(() => {
      expect(screen.getByText("Out of Stock")).toBeTruthy();
      expect(screen.getByText("$54.97")).toBeTruthy();
    });
  });
});
