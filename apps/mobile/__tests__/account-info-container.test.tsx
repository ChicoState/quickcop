import { fireEvent, render, waitFor } from "@testing-library/react-native";

import { AccountInfoContainer } from "../features/account/AccountInfoContainer";
import type { AccountInfo } from "../features/account/types";
import {
  AccountSaveError,
  loadAccount,
  saveAccount,
} from "../features/api/accountClient";

jest.mock("../features/api/accountClient", () => {
  class AccountSaveError extends Error {}
  return {
    AccountSaveError,
    loadAccount: jest.fn(),
    saveAccount: jest.fn(),
  };
});

const mockedLoad = loadAccount as jest.MockedFunction<typeof loadAccount>;
const mockedSave = saveAccount as jest.MockedFunction<typeof saveAccount>;

const loaded: Omit<AccountInfo, "pushAvailability"> = {
  email: "shopper@example.com",
  notificationPreferences: {
    priceChange: { email: true, push: true },
    restock: { email: true, push: true },
  },
  pendingEmail: null,
  phone: null,
  username: "quickcop_user",
  verifiedEmail: "shopper@example.com",
};

async function renderContainer(onUnauthorized = jest.fn()) {
  const screen = await render(
    <AccountInfoContainer onUnauthorized={onUnauthorized} />,
  );
  return { screen, onUnauthorized };
}

describe("AccountInfoContainer", () => {
  beforeEach(() => {
    mockedLoad.mockReset();
    mockedSave.mockReset();
  });

  it("shows a loading indicator while the account loads", async () => {
    mockedLoad.mockReturnValue(new Promise(() => {}));
    const { screen } = await renderContainer();

    expect(screen.getByLabelText("Loading account")).toBeTruthy();
  });

  it("renders the loaded account", async () => {
    mockedLoad.mockResolvedValue({ ok: true, data: loaded });
    const { screen } = await renderContainer();

    expect(await screen.findByDisplayValue("quickcop_user")).toBeTruthy();
    expect(screen.getByDisplayValue("shopper@example.com")).toBeTruthy();
  });

  it("saves changes and shows a success message", async () => {
    mockedLoad.mockResolvedValue({ ok: true, data: loaded });
    mockedSave.mockResolvedValue();
    const { screen } = await renderContainer();

    await screen.findByDisplayValue("quickcop_user");
    await fireEvent.changeText(screen.getByLabelText("Username"), "new_name");
    await fireEvent.press(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockedSave).toHaveBeenCalledWith(
        expect.objectContaining({ username: "new_name" }),
      );
    });
    expect(await screen.findByText("Changes saved.")).toBeTruthy();
  });

  it("shows an offline message and recovers on retry", async () => {
    mockedLoad
      .mockResolvedValueOnce({ ok: false, failure: { kind: "network" } })
      .mockResolvedValueOnce({ ok: true, data: loaded });
    const { screen } = await renderContainer();

    expect(
      await screen.findByText("Unable to connect. Try again."),
    ).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Retry" }));

    expect(await screen.findByDisplayValue("quickcop_user")).toBeTruthy();
    expect(mockedLoad).toHaveBeenCalledTimes(2);
  });

  it("shows a retryable error when loading rejects", async () => {
    mockedLoad.mockRejectedValue(new Error("request failed"));
    const { screen } = await renderContainer();

    expect(
      await screen.findByText("Unable to connect. Try again."),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });

  it("uses the device push capability result", async () => {
    mockedLoad.mockResolvedValue({ ok: true, data: loaded });
    const screen = await render(
      <AccountInfoContainer
        getPushAvailability={async () => "unavailable"}
        onUnauthorized={jest.fn()}
      />,
    );

    expect(
      await screen.findByText(
        "Push notifications are unavailable on this device.",
      ),
    ).toBeTruthy();
  });

  it("shows the conflict message when the username is taken", async () => {
    mockedLoad.mockResolvedValue({ ok: true, data: loaded });
    mockedSave.mockRejectedValue(
      new AccountSaveError("That username is taken."),
    );
    const { screen } = await renderContainer();

    await screen.findByDisplayValue("quickcop_user");
    await fireEvent.changeText(screen.getByLabelText("Username"), "taken_name");
    await fireEvent.press(screen.getByRole("button", { name: "Save changes" }));

    expect(await screen.findByText("That username is taken.")).toBeTruthy();
  });

  it("calls onUnauthorized when the session is invalid", async () => {
    mockedLoad.mockResolvedValue({
      ok: false,
      failure: { kind: "unauthorized" },
    });
    const { onUnauthorized } = await renderContainer();

    await waitFor(() => {
      expect(onUnauthorized).toHaveBeenCalledTimes(1);
    });
  });

  it("tells the user to confirm a changed email address", async () => {
    mockedLoad.mockResolvedValue({ ok: true, data: loaded });
    mockedSave.mockResolvedValue();
    const { screen } = await renderContainer();

    await screen.findByDisplayValue("quickcop_user");
    await fireEvent.changeText(
      screen.getByLabelText("Email"),
      "new@example.com",
    );
    await fireEvent.press(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(mockedSave).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@example.com",
          pendingEmail: "new@example.com",
        }),
      );
    });
    expect(
      await screen.findByText(
        "Saved. Check your email to confirm the new address.",
      ),
    ).toBeTruthy();
  });
});
