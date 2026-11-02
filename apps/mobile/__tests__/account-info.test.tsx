import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { AccountSaveError } from "../features/api/accountClient";
import { AccountInfoScreen } from "../features/account/AccountInfoScreen";
import type { AccountInfo } from "../features/account/types";

jest.mock("../features/api/accountClient", () => {
  class AccountSaveError extends Error {}
  return {
    AccountSaveError,
    loadAccount: jest.fn(),
    saveAccount: jest.fn(),
  };
});

const account: AccountInfo = {
  email: "shopper@example.com",
  notificationPreferences: {
    priceChange: { email: false, push: false },
    restock: { email: false, push: false },
  },
  pendingEmail: null,
  phone: null,
  pushAvailability: "unavailable",
  username: "quickcop_user",
  verifiedEmail: "shopper@example.com",
};

describe("AccountInfoScreen", () => {
  it("saves editable account details and independent alert preferences", async () => {
    const onSave = jest.fn<Promise<void>, [AccountInfo]>().mockResolvedValue();
    const screen = await render(
      <AccountInfoScreen account={account} onSave={onSave} />,
    );

    expect(screen.getByDisplayValue("quickcop_user")).toBeTruthy();
    expect(
      screen.getByText("Monitoring continues even when every alert is off."),
    ).toBeTruthy();
    expect(
      screen.getByText("Push notifications are unavailable on this device."),
    ).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText("Username"), "new_name");
    await fireEvent.changeText(
      screen.getByLabelText("Phone number (optional)"),
      "555-0100",
    );
    await fireEvent(
      screen.getByLabelText("Restock push alerts"),
      "valueChange",
      true,
    );
    await fireEvent(
      screen.getByLabelText("Price-change email alerts"),
      "valueChange",
      true,
    );
    await fireEvent.press(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({
        ...account,
        notificationPreferences: {
          priceChange: { email: true, push: false },
          restock: { email: false, push: true },
        },
        phone: "555-0100",
        username: "new_name",
      });
    });

    expect(await screen.findByText("Changes saved.")).toBeTruthy();
  });

  it("requires a username and a valid email before saving", async () => {
    const screen = await render(
      <AccountInfoScreen account={account} onSave={jest.fn()} />,
    );

    await fireEvent.changeText(screen.getByLabelText("Username"), " ");
    await fireEvent.changeText(screen.getByLabelText("Email"), "not-an-email");
    await fireEvent.press(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByText("Enter a username.")).toBeTruthy();
    expect(screen.getByText("Enter a valid email address.")).toBeTruthy();
  });

  it("renders safe defaults when the server omits a preference group", async () => {
    const incompleteAccount = {
      ...account,
      notificationPreferences: { priceChange: { email: true, push: true } },
    } as AccountInfo;
    const screen = await render(
      <AccountInfoScreen account={incompleteAccount} onSave={jest.fn()} />,
    );

    expect(screen.getByLabelText("Restock push alerts").props.value).toBe(
      false,
    );
    expect(screen.getByLabelText("Price-change push alerts").props.value).toBe(
      true,
    );
  });

  it("shows the message from a failed save", async () => {
    const onSave = jest
      .fn<Promise<void>, [AccountInfo]>()
      .mockRejectedValue(new AccountSaveError("That username is taken."));
    const screen = await render(
      <AccountInfoScreen account={account} onSave={onSave} />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("That username is taken.")).toBeTruthy();
  });
});
