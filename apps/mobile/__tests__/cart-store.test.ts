import * as SecureStore from "expo-secure-store";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

import {
  addCartItem,
  clearCart,
  decrementCartItem,
  getCartItems,
  loadCart,
  incrementCartItem,
  removeCartItem,
  resetCartForTests,
} from "../features/cart/cartStore";

describe("cartStore", () => {
  beforeEach(() => resetCartForTests());
  afterEach(() => clearCart());

  it("adds products and combines duplicate retailer entries", () => {
    addCartItem({
      id: "switch",
      name: "Switch 2",
      retailer: "Target",
      price: 449.99,
    });
    addCartItem({
      id: "switch-copy",
      name: "Switch 2",
      retailer: "Target",
      price: 449.99,
    });

    expect(getCartItems()).toEqual([
      expect.objectContaining({ id: "switch", name: "Switch 2", quantity: 2 }),
    ]);
  });

  it("increments, decrements, and removes cart quantities", () => {
    addCartItem({
      id: "headphones",
      name: "Headphones",
      retailer: "Amazon",
      price: 99,
    });
    incrementCartItem("headphones");
    decrementCartItem("headphones");
    decrementCartItem("headphones");

    expect(getCartItems()).toEqual([]);
  });

  it("keeps unavailable prices in the cart without including them in the subtotal", () => {
    addCartItem({
      id: "unknown",
      name: "Unknown item",
      retailer: "Store",
      price: null,
    });
    addCartItem({
      id: "known",
      name: "Known item",
      retailer: "Store",
      price: 12.5,
    });

    expect(getCartItems()).toHaveLength(2);
    expect(getCartItems().filter((item) => item.price !== null)).toHaveLength(
      1,
    );
  });

  it("removes a specific cart item", () => {
    addCartItem({ id: "one", name: "One", retailer: "Store", price: 1 });
    addCartItem({ id: "two", name: "Two", retailer: "Store", price: 2 });

    removeCartItem("one");

    expect(getCartItems().map((item) => item.id)).toEqual(["two"]);
  });

  it("restores cart contents from local persistence", async () => {
    const persisted = JSON.stringify([
      {
        id: "saved",
        name: "Saved item",
        retailer: "Store",
        price: 5,
        quantity: 2,
      },
    ]);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(persisted);
    resetCartForTests();

    await loadCart();

    expect(getCartItems()).toEqual([
      expect.objectContaining({ id: "saved", quantity: 2 }),
    ]);
  });
});
