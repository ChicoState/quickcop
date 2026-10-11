import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { CreateAccountScreen } from "../features/auth/CreateAccountScreen";
import { LoginScreen } from "../features/auth/LoginScreen";
import { HomeScreen } from "../features/home/HomeScreen";
import { supabase } from "../lib/supabase";

jest.mock("../lib/supabase", () => ({
  supabase: {
    rpc: jest.fn(),
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  },
}));

// Loosely typed so the mocks accept any resolved value
type MockFn = jest.Mock<(...args: unknown[]) => Promise<unknown>>;

const mockSupabase = supabase as unknown as {
  rpc: MockFn;
  auth: {
    signUp: MockFn;
    signInWithPassword: MockFn;
    signOut: MockFn;
  };
};

beforeEach(() => {
  jest.clearAllMocks();

  // username_available -> true, get_email_for_username -> an email
  mockSupabase.rpc.mockImplementation((fn: unknown) =>
    Promise.resolve({
      data: fn === "username_available" ? true : "person@example.com",
      error: null,
    }),
  );
  mockSupabase.auth.signUp.mockResolvedValue({
    data: { session: {} },
    error: null,
  });
  mockSupabase.auth.signInWithPassword.mockResolvedValue({ error: null });
  mockSupabase.auth.signOut.mockResolvedValue({ error: null });
});

describe("login", () => {
  async function submitLogin(onLogin = jest.fn()) {
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

    return { screen, onLogin };
  }

  it("looks up the email, signs in, and opens the home screen", async () => {
    const { onLogin } = await submitLogin();

    await waitFor(() => expect(onLogin).toHaveBeenCalledTimes(1));
    expect(mockSupabase.rpc).toHaveBeenCalledWith("get_email_for_username", {
      p_username: "quickcop_user",
    });
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "password123",
    });
  });

  it("shows an error when the password is wrong", async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const { screen, onLogin } = await submitLogin();

    await waitFor(() =>
      expect(screen.getByText("Invalid username or password.")).toBeTruthy(),
    );
    expect(onLogin).not.toHaveBeenCalled();
  });

  it("shows the same error when the username does not exist", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

    const { screen, onLogin } = await submitLogin();

    await waitFor(() =>
      expect(screen.getByText("Invalid username or password.")).toBeTruthy(),
    );
    expect(mockSupabase.auth.signInWithPassword).not.toHaveBeenCalled();
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
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: "person@example.com",
      password: "password123",
      options: {
        data: {
          username: "quickcop_user",
          display_name: "quickcop_user",
          phone: null,
        },
      },
    });
  });

  it("rejects a taken username without creating an account", async () => {
    mockSupabase.rpc.mockResolvedValue({ data: false, error: null });

    const { screen, onAccountCreated } = await submitSignUp();

    await waitFor(() =>
      expect(screen.getByText("That username is taken.")).toBeTruthy(),
    );
    expect(mockSupabase.auth.signUp).not.toHaveBeenCalled();
    expect(onAccountCreated).not.toHaveBeenCalled();
  });

  it("asks the user to confirm their email when no session is returned", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { session: null },
      error: null,
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
  it("signs out and returns to login from the home menu", async () => {
    const onLogout = jest.fn();
    const screen = await render(
      <HomeScreen onLogout={onLogout} onOpenNotifications={jest.fn()} />,
    );

    // The Log out button lives inside the hamburger menu
    await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));
    await fireEvent.press(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1));
    expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
  });
});
