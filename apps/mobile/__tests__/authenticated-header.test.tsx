import { fireEvent, render } from "@testing-library/react-native";

import { AuthenticatedHeader } from "../features/navigation/AuthenticatedHeader";

describe("AuthenticatedHeader", () => {
  it("navigates to every existing menu route and disables unfinished routes", async () => {
    const replace = jest.fn();
    const screen = await render(
      <AuthenticatedHeader
        navigation={{ replace }}
        onLogout={() => replace("/")}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));

    for (const route of [
      ["Home", "/home"],
      ["Watched Items", "/watched-items"],
      ["Recommended", "/recommended"],
      ["Popular", "/home/popular-products"],
      ["Notifications", "/notifications"],
    ]) {
      await fireEvent.press(screen.getByRole("button", { name: route[0] }));
      expect(replace).toHaveBeenLastCalledWith(route[1]);
      await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));
    }

    expect(
      screen.getByRole("button", { name: "Categories, Coming Soon" }).props
        .accessibilityState.disabled,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Stores, Coming Soon" }).props
        .accessibilityState.disabled,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Settings, Coming Soon" }).props
        .accessibilityState.disabled,
    ).toBe(true);
  });

  it("signs out and navigates to login", async () => {
    const replace = jest.fn();
    const screen = await render(
      <AuthenticatedHeader
        navigation={{ replace }}
        onLogout={() => replace("/")}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));
    await fireEvent.press(screen.getByRole("button", { name: "Log out" }));

    expect(replace).toHaveBeenCalledWith("/");
  });
});
