import {
  fireEvent,
  render,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { CreateAccountScreen } from "../features/auth/CreateAccountScreen";
import { LoginScreen } from "../features/auth/LoginScreen";
import { HomeScreen } from "../features/home/HomeScreen";
import * as authService from "../features/auth/authService";

jest.mock("../features/auth/authService", () => ({
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signOut: jest.fn(),
}));

const mockAuthService = authService as jest.Mocked<typeof authService>;

beforeEach(() => {
  jest.clearAllMocks();

  mockAuthService.signUpWithEmail.mockResolvedValue({
    ok: true,
    sessionCreated: true,
  });
  mockAuthService.signInWithEmail.mockResolvedValue({ ok: true });
  mockAuthService.signOut.mockResolvedValue({ ok: true });
});

describe("login", () => {
  async function submitLogin(
    onLogin = jest.fn(),
    email = "person@example.com",
  ) {
    const screen = await render(
      <LoginScreen onLogin={onLogin} onCreateAccount={jest.fn()} />,
    );

    await fireEvent.changeText(screen.getByLabelText("Email"), email);
    await fireEvent.changeText(
      screen.getByLabelText("Password"),
      "password123",
    );
    await fireEvent.press(screen.getByRole("button", { name: "Log in" }));

    return { screen, onLogin };
  }

  it("signs in with email and password", async () => {
    mockAuthService.signInWithEmail.mockResolvedValue({ ok: true });
    const { onLogin } = await submitLogin();

    await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(1));
    expect(mockAuthService.signInWithEmail).toHaveBeenCalledWith(
      "person@example.com",
      "password123",
    );
  });

  it("shows an error when the password is wrong", async () => {
    mockAuthService.signInWithEmail.mockResolvedValue({
      ok: false,
      failure: { kind: "credentials" },
    });

    const { screen, onLogin } = await submitLogin();

    await waitFor(() =>
      expect(screen.getByText("Invalid email or password.")).toBeTruthy(),
    );
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("uses the same login message for unknown emails and wrong passwords", async () => {
    mockAuthService.signInWithEmail.mockResolvedValue({
      ok: false,
      failure: { kind: "credentials" },
    });

    const first = await submitLogin(jest.fn(), "unknown@example.com");
    expect(
      await first.screen.findByText("Invalid email or password."),
    ).toBeTruthy();

    const second = await submitLogin(jest.fn(), "person@example.com");
    expect(
      await second.screen.findByText("Invalid email or password."),
    ).toBeTruthy();
  });

  it("shows a retryable message when the network request fails", async () => {
    mockAuthService.signInWithEmail.mockResolvedValue({
      ok: false,
      failure: { kind: "network" },
    });

    const { screen, onLogin } = await submitLogin();

    await waitFor(() =>
      expect(screen.getByText("Unable to connect. Try again.")).toBeTruthy(),
    );
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("does not expose unexpected provider errors as credential failures", async () => {
    mockAuthService.signInWithEmail.mockResolvedValue({
      ok: false,
      failure: { kind: "unknown" },
    });

    const { screen, onLogin } = await submitLogin();

    await waitFor(() =>
      expect(
        screen.getByText(
          "Authentication is temporarily unavailable. Try again later.",
        ),
      ).toBeTruthy(),
    );
    expect(onLogin).not.toHaveBeenCalled();
  });
});

describe("create account", () => {
  async function submitSignUp(onAccountCreated = jest.fn()) {
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

    return { screen, onAccountCreated };
  }

  it("allows account creation with an email and no phone number", async () => {
    const { onAccountCreated } = await submitSignUp();

    await waitFor(() => expect(onAccountCreated).toHaveBeenCalledTimes(1));
    expect(mockAuthService.signUpWithEmail).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "password123",
      username: "quickcop_user",
      phone: null,
    });
  });

  it("submits account creation without a client-side username lookup", async () => {
    const { screen, onAccountCreated } = await submitSignUp();

    await waitFor(() => expect(onAccountCreated).toHaveBeenCalledTimes(1));
    expect(mockAuthService.signUpWithEmail).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("That username is taken.")).toBeNull();
  });

  it("asks the user to confirm their email when no session is returned", async () => {
    mockAuthService.signUpWithEmail.mockResolvedValue({
      ok: true,
      sessionCreated: false,
    });

    const { screen, onAccountCreated } = await submitSignUp();

    await waitFor(() =>
      expect(
        screen.getByText(
          "Check your email to confirm your account, then log in.",
        ),
      ).toBeTruthy(),
    );
    expect(onAccountCreated).not.toHaveBeenCalled();
  });
});

describe("logout", () => {
  it("calls the route logout handler from the home menu", async () => {
    const onLogout = jest.fn(() => undefined);
    const screen = await render(
      <HomeScreen onLogout={onLogout} onOpenNotifications={jest.fn()} />,
    );

    // The Log out button lives inside the hamburger menu
    await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));
    await fireEvent.press(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
  });
});
