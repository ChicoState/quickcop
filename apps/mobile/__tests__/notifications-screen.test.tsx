import { fireEvent, render } from "@testing-library/react-native";

import {
  NotificationsScreen,
  type PriceAlert,
} from "../features/notifications/NotificationsScreen";

describe("NotificationsScreen", () => {
  it("shows example price-drop alerts and lets the user toggle an alert locally", async () => {
    const screen = await render(<NotificationsScreen />);

    expect(screen.getByText("Nintendo Switch 2")).toBeTruthy();
    expect(screen.getByText("Price dropped from $499.99 to $449.99")).toBeTruthy();

    const alertToggle = screen.getByRole("switch", {
      name: "Nintendo Switch 2 price alert",
    });
    expect(alertToggle.props.value).toBe(true);

    await fireEvent(alertToggle, "valueChange", false);

    expect(
      screen.getByRole("switch", { name: "Nintendo Switch 2 price alert" }).props
        .value,
    ).toBe(false);
  });

  it("shows an empty state when no price alerts are available", async () => {
    const alerts: PriceAlert[] = [];
    const screen = await render(<NotificationsScreen alerts={alerts} />);

    expect(screen.getByText("No price alerts yet")).toBeTruthy();
    expect(
      screen.getByText("Watch an item and set a target price to see alerts here."),
    ).toBeTruthy();
  });

  it("lets the user toggle notification settings locally", async () => {
    const screen = await render(<NotificationsScreen />);
    const priceDropToggle = screen.getByRole("switch", {
      name: "Price drop notifications",
    });

    expect(priceDropToggle.props.value).toBe(true);
    await fireEvent(priceDropToggle, "valueChange", false);

    expect(
      screen.getByRole("switch", { name: "Price drop notifications" }).props
        .value,
    ).toBe(false);
  });
});
