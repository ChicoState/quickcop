jest.mock("expo-image-picker", () => ({
  MediaTypeOptions: { Images: "Images" },
  launchImageLibraryAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
}));

import * as ImagePicker from "expo-image-picker";
import { fireEvent, render } from "@testing-library/react-native";

import {
  ScreenshotTrackingScreen,
  validateScreenshotProduct,
} from "../features/screenshot-tracking/ScreenshotTrackingScreen";
import {
  getWatchedItems,
  resetWatchedItemsForTests,
} from "../features/watched-items/watchedItemsStore";

const requestPermission =
  ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const launchPicker = ImagePicker.launchImageLibraryAsync as jest.Mock;

describe("ScreenshotTrackingScreen", () => {
  beforeEach(() => {
    resetWatchedItemsForTests();
    requestPermission.mockResolvedValue({ granted: true });
    launchPicker.mockResolvedValue({
      canceled: false,
      assets: [{ uri: "file:///product.png" }],
    });
  });

  it("selects and previews a screenshot", async () => {
    const screen = await render(<ScreenshotTrackingScreen />);

    await fireEvent.press(
      screen.getByRole("button", { name: "Choose product screenshot" }),
    );

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(launchPicker).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Selected product screenshot")).toBeTruthy();
  });

  it("shows validation errors for a missing screenshot and invalid price", async () => {
    expect(
      validateScreenshotProduct(null, {
        productName: "Product",
        store: "Store",
        productUrl: "",
        targetPrice: "20",
      }),
    ).toBe("Select a product screenshot first.");
    expect(
      validateScreenshotProduct("file:///product.png", {
        productName: "Product",
        store: "Store",
        productUrl: "",
        targetPrice: "not-a-price",
      }),
    ).toBe("Enter a valid target price greater than zero.");
    expect(
      validateScreenshotProduct("file:///product.png", {
        productName: "",
        store: "Store",
        productUrl: "",
        targetPrice: "20",
      }),
    ).toBe("Enter a product name.");

    const screen = await render(<ScreenshotTrackingScreen />);
    await fireEvent.press(
      screen.getByRole("button", { name: "Add to Watched Items" }),
    );
    expect(screen.getByRole("alert")).toBeTruthy();
  });

  it("navigates from the hamburger menu and hands off the item locally", async () => {
    const replace = jest.fn();
    const screen = await render(
      <ScreenshotTrackingScreen navigation={{ replace }} />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));
    await fireEvent.press(
      screen.getByRole("button", { name: "Track from Screenshot" }),
    );
    expect(replace).toHaveBeenCalledWith("/track-from-screenshot");

    await fireEvent.press(
      screen.getByRole("button", { name: "Choose product screenshot" }),
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Add to Watched Items" }),
    );

    expect(getWatchedItems()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Example running shoes",
          screenshotUri: "file:///product.png",
          targetPrice: "$89.99",
        }),
      ]),
    );
    expect(screen.getByText(/Added locally/)).toBeTruthy();
  });
});
