import { fireEvent, render } from "@testing-library/react-native";

import { CreateAccountScreen } from "../features/auth/CreateAccountScreen";
import { LoginScreen } from "../features/auth/LoginScreen";
import { HomeScreen } from "../features/home/HomeScreen";

describe("local authentication prototype", () => {
  it("opens the home screen after the user submits a username and password", () => {
    const onLogin = jest.fn();
    const screen = render(
      <LoginScreen onLogin={onLogin} onCreateAccount={jest.fn()} />,
    );

    fireEvent.changeText(screen.getByLabelText("Username"), "quickcop_user");
    fireEvent.changeText(screen.getByLabelText("Password"), "password123");
    fireEvent.press(screen.getByRole("button", { name: "Log in" }));

    expect(onLogin).toHaveBeenCalledTimes(1);
  });

  it("allows account creation with an email and no phone number", () => {
    const onAccountCreated = jest.fn();
    const screen = render(
      <CreateAccountScreen
        onAccountCreated={onAccountCreated}
        onBackToLogin={jest.fn()}
      />,
    );

    fireEvent.changeText(screen.getByLabelText("Email"), "person@example.com");
    fireEvent.changeText(screen.getByLabelText("Username"), "quickcop_user");
    fireEvent.changeText(screen.getByLabelText("Password"), "password123");
    fireEvent.press(screen.getByRole("button", { name: "Create account" }));

    expect(onAccountCreated).toHaveBeenCalledTimes(1);
  });

  it("returns to login when the user logs out from the empty home screen", () => {
    const onLogout = jest.fn();
    const screen = render(<HomeScreen onLogout={onLogout} />);

    fireEvent.press(screen.getByRole("button", { name: "Log out" }));

    expect(onLogout).toHaveBeenCalledTimes(1);
  });
});
