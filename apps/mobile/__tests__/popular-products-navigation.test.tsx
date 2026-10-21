jest.mock("../lib/supabase", () => ({
  supabase: { auth: { signOut: jest.fn() } },
}));

import { fireEvent, render } from "@testing-library/react-native";

import { HomeScreen } from "../features/home/HomeScreen";

describe("HomeScreen popular products navigation", () => {
  it("opens Popular Products from the homepage section", async () => {
    const onOpenPopularProducts = jest.fn();
    const screen = await render(
      <HomeScreen
        onLogout={jest.fn()}
        onOpenNotifications={jest.fn()}
        onOpenPopularProducts={onOpenPopularProducts}
      />,
    );

    await fireEvent.press(
      screen.getByRole("button", { name: "View popular products" }),
    );

    expect(onOpenPopularProducts).toHaveBeenCalledTimes(1);
  });
});
