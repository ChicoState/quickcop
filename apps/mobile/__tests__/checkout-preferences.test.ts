import {
  getCheckoutPreference,
  isValidRetailerUrl,
  resetCheckoutPreferenceForTests,
  setCheckoutPreference,
} from "../features/quick-checkout/checkoutPreferences";

describe("checkout preferences", () => {
  afterEach(() => resetCheckoutPreferenceForTests());

  it("persists the selected checkout method locally", () => {
    setCheckoutPreference("retailer");

    expect(getCheckoutPreference()).toBe("retailer");
  });

  it("accepts only HTTP and HTTPS retailer URLs", () => {
    expect(isValidRetailerUrl("https://example.com/item")).toBe(true);
    expect(isValidRetailerUrl("http://example.com/item")).toBe(true);
    expect(isValidRetailerUrl("javascript:alert(1)")).toBe(false);
    expect(isValidRetailerUrl("example.com/item")).toBe(false);
  });
});
