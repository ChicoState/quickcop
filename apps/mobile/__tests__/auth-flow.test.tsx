import { fireEvent, render } from "@testing-library/react-native";

import { CreateAccountScreen } from "../features/auth/CreateAccountScreen";
import { LoginScreen } from "../features/auth/LoginScreen";
import { HomeScreen } from "../features/home/HomeScreen";

describe("local authentication prototype", () => {
  it("opens the home screen after the user submits a username and password", async () => {
    const onLogin = jest.fn();
    const screen = await render(
      <LoginScreen onLogin={onLogin} onCreateAccount={jest.fn()} />,
    );

    await fireEvent.changeText(
      screen.getByLabelText("Username"),
      "quickcop_user",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Password"),
      "password123",
    );
    await fireEvent.press(screen.getByRole("button", { name: "Log in" }));

    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it("allows account creation with an email and no phone number", async () => {
    const onAccountCreated = jest.fn();
    const screen = await render(
      <CreateAccountScreen
        onAccountCreated={onAccountCreated}
        onBackToLogin={jest.fn()}
      />,
    );

    await fireEvent.changeText(
      screen.getByLabelText("Email"),
      "person@example.com",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Username"),
      "quickcop_user",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Password"),
      "password123",
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Create account" }),
    );

    expect(onAccountCreated).toHaveBeenCalledTimes(1);
  });

  it("requires an email even when a phone number is provided", async () => {
    const onAccountCreated = jest.fn();
    const screen = await render(
      <CreateAccountScreen
        onAccountCreated={onAccountCreated}
        onBackToLogin={jest.fn()}
      />,
    );

    await fireEvent.changeText(
      screen.getByLabelText("Phone number (optional)"),
      "555-0100",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Username"),
      "quickcop_user",
    );
    await fireEvent.changeText(
      screen.getByLabelText("Password"),
      "password123",
    );
    await fireEvent.press(
      screen.getByRole("button", { name: "Create account" }),
    );

    expect(onAccountCreated).not.toHaveBeenCalled();
    expect(
      screen.getByText("Enter an email, a username, and a password."),
    ).toBeTruthy();
  });

  it("returns to login when the user logs out from the empty home screen", async () => {
    const onLogout = jest.fn();
    const screen = await render(
      <HomeScreen onLogout={onLogout} onOpenNotifications={jest.fn()} />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));
    await fireEvent.press(screen.getByRole("button", { name: "Log out" }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
