import * as SecureStore from "expo-secure-store";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
}));

import {
  addWatchedItem,
  getWatchedItems,
  resetWatchedItemsForTests,
  updateWatchedItem,
} from "../features/watched-items/watchedItemsStore";

describe("watchedItemsStore", () => {
  afterEach(() => resetWatchedItemsForTests());

  it("hands a locally added screenshot item to watched items", () => {
    addWatchedItem({
      id: "lego-screenshot",
      name: "LEGO Star Wars Set",
      store: "Amazon",
      currentPrice: "$69.99",
      targetPrice: "$59.99",
      alertEnabled: true,
      screenshotUri: "file:///screenshot.png",
    });

    expect(getWatchedItems()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "LEGO Star Wars Set",
          screenshotUri: "file:///screenshot.png",
        }),
      ]),
    );
  });

  it("updates editable product details while preserving the screenshot reference", () => {
    addWatchedItem({
      id: "editable-item",
      name: "Old name",
      store: "Old store",
      currentPrice: "See screenshot",
      targetPrice: "$59.99",
      alertEnabled: true,
      productUrl: "https://example.com/old",
      screenshotUri: "file:///screenshot.png",
    });

    updateWatchedItem("editable-item", {
      name: "New name",
      store: "New store",
      productUrl: "https://example.com/new",
      targetPrice: "$49.99",
    });

    expect(getWatchedItems()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "editable-item",
          name: "New name",
          store: "New store",
          productUrl: "https://example.com/new",
          targetPrice: "$49.99",
          screenshotUri: "file:///screenshot.png",
        }),
      ]),
    );
  });

  it("persists added screenshot references and product details", () => {
    addWatchedItem({
      id: "persisted-item",
      name: "Persisted item",
      store: "Example Store",
      currentPrice: "See screenshot",
      targetPrice: "$20.00",
      alertEnabled: true,
      productUrl: "https://example.com/item",
      screenshotUri: "file:///persisted.png",
    });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "quickcop.watched-items",
      expect.stringContaining('"screenshotUri":"file:///persisted.png"'),
    );
  });
});
