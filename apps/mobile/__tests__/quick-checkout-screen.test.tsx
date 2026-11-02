import { fireEvent, render } from "@testing-library/react-native";

import { QuickCheckoutScreen } from "../features/quick-checkout/QuickCheckoutScreen";

describe("QuickCheckoutScreen", () => {
  it("requires checkout information and a valid spending limit", async () => {
    const screen = await render(<QuickCheckoutScreen />);

    await fireEvent.press(
      screen.getByRole("button", { name: "Simulate Checkout" }),
    );

    expect(screen.getByText("Enter your checkout information.")).toBeTruthy();

    await fireEvent(
      screen.getByRole("switch", { name: "Auto-fill saved information" }),
      "valueChange",
      true,
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Simulate Checkout" }),
    );
    expect(screen.getByText("Enter a valid maximum price.")).toBeTruthy();
  });

  it("auto-fills saved information and toggles auto-buy", async () => {
    const screen = await render(<QuickCheckoutScreen />);

    const autoFill = screen.getByRole("switch", {
      name: "Auto-fill saved information",
    });
    await fireEvent(
      screen.getByRole("switch", { name: "Auto-fill saved information" }),
      "valueChange",
      true,
    );
    await fireEvent(
      screen.getByRole("switch", { name: "Auto-buy simulation" }),
      "valueChange",
      true,
    );

    expect(autoFill.props.value).toBe(true);
    expect(screen.getByDisplayValue("Alex Shopper")).toBeTruthy();
    expect(screen.getByDisplayValue("123 Sample Street")).toBeTruthy();
    expect(
      screen.getByRole("switch", { name: "Auto-buy simulation" }).props.value,
    ).toBe(true);
  });

  it("succeeds when the product is within the spending limit and fails when it is not", async () => {
    const screen = await render(<QuickCheckoutScreen />);

    await fireEvent(
      screen.getByRole("switch", { name: "Auto-fill saved information" }),
      "valueChange",
      true,
    );
    await fireEvent.changeText(
      screen.getByLabelText("Maximum purchase price"),
      "60",
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Simulate Checkout" }),
    );
    expect(screen.getByText("Checkout simulation successful.")).toBeTruthy();

    await fireEvent.changeText(
      screen.getByLabelText("Maximum purchase price"),
      "40",
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Simulate Checkout" }),
    );
    expect(
      screen.getByText(
        "Checkout simulation stopped: the product exceeds your spending limit.",
      ),
    ).toBeTruthy();
  });
});
