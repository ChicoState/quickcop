import { fireEvent, render } from "@testing-library/react-native";

import { NotificationsContainer } from "../features/notifications/NotificationsContainer";
import {
  loadNotifications,
  updateNotification,
} from "../features/api/notificationClient";

jest.mock("../features/api/notificationClient", () => ({
  loadNotifications: jest.fn(),
  updateNotification: jest.fn(),
}));

const mockedLoad = loadNotifications as jest.MockedFunction<
  typeof loadNotifications
>;
const mockedUpdate = updateNotification as jest.MockedFunction<
  typeof updateNotification
>;

const alert = {
  id: "alert-1",
  kind: "price_change" as const,
  name: "Nintendo Switch 2",
  retailer: "Target",
  previousPrice: "$499.99",
  currentPrice: "$449.99",
  targetPrice: "$450.00",
  enabled: true,
  createdAt: "2026-10-19T00:00:00.000Z",
};

describe("NotificationsContainer", () => {
  beforeEach(() => {
    mockedLoad.mockReset();
    mockedUpdate.mockReset();
  });

  it("loads alerts from the server and persists a toggle", async () => {
    mockedLoad.mockResolvedValue({ ok: true, data: [alert] });
    mockedUpdate.mockResolvedValue({
      ok: true,
      data: { ...alert, enabled: false },
    });

    const screen = await render(
      <NotificationsContainer onManageDeliveryPreferences={jest.fn()} />,
    );

    const toggle = await screen.findByRole("switch", {
      name: "Nintendo Switch 2 price alert",
    });
    await fireEvent(toggle, "valueChange", false);

    expect(mockedUpdate).toHaveBeenCalledWith("alert-1", false);
    expect(
      screen.getByRole("switch", { name: "Nintendo Switch 2 price alert" })
        .props.value,
    ).toBe(false);
  });

  it("shows a retryable error when alerts fail to load", async () => {
    mockedLoad.mockResolvedValue({ ok: false, failure: { kind: "network" } });

    const screen = await render(
      <NotificationsContainer onManageDeliveryPreferences={jest.fn()} />,
    );

    expect(
      await screen.findByText("Unable to load notifications. Try again."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});
