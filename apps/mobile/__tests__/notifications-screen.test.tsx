import { fireEvent, render } from "@testing-library/react-native";
import { describe, it, expect } from "@jest/globals";

import {
  NotificationsScreen,
  type PriceAlert,
} from "../features/notifications/NotificationsScreen";

describe("NotificationsScreen", () => {
  it("shows example price-drop alerts and lets the user toggle an alert locally", async () => {
    const screen = await render(
      <NotificationsScreen onManageDeliveryPreferences={jest.fn()} />,
    );

    expect(screen.getByText("Nintendo Switch 2")).toBeTruthy();
    expect(
      screen.getByText("Price dropped from $499.99 to $449.99"),
    ).toBeTruthy();

    const alertToggle = screen.getByRole("switch", {
      name: "Nintendo Switch 2 price alert",
    });
    expect(alertToggle.props.value).toBe(true);

    await fireEvent(alertToggle, "valueChange", false);

    expect(
      screen.getByRole("switch", { name: "Nintendo Switch 2 price alert" })
        .props.value,
    ).toBe(false);
  });

  it("shows an empty state when no price alerts are available", async () => {
    const alerts: PriceAlert[] = [];
    const screen = await render(
      <NotificationsScreen
        alerts={alerts}
        onManageDeliveryPreferences={jest.fn()}
      />,
    );

    expect(screen.getByText("No price alerts yet")).toBeTruthy();
    expect(
      screen.getByText(
        "Watch an item and set a target price to see alerts here.",
      ),
    ).toBeTruthy();
  });

  it("opens delivery preferences without rendering duplicate global settings", async () => {
    const onManageDeliveryPreferences = jest.fn();
    const screen = await render(
      <NotificationsScreen
        onManageDeliveryPreferences={onManageDeliveryPreferences}
      />,
    );

    await fireEvent.press(
      screen.getByRole("button", { name: "Manage delivery preferences" }),
    );

    expect(onManageDeliveryPreferences).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole("switch", { name: "Price drop notifications" }),
    ).toBeNull();
    expect(
      screen.queryByRole("switch", { name: "Back in stock notifications" }),
    ).toBeNull();
  });
});
