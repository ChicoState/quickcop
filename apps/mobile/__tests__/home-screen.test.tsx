jest.mock("../lib/supabase", () => ({
  supabase: { auth: { signOut: jest.fn() } },
}));

import { fireEvent, render } from "@testing-library/react-native";

import { HomeScreen } from "../features/home/HomeScreen";

describe("HomeScreen", () => {
  it("opens Watched Items from the homepage section", async () => {
    const onOpenWatchedItems = jest.fn();
    const screen = await render(
      <HomeScreen
        onLogout={jest.fn()}
        onOpenNotifications={jest.fn()}
        onOpenWatchedItems={onOpenWatchedItems}
      />,
    );

    await fireEvent.press(
      screen.getByRole("button", { name: "View watched items" }),
    );

    expect(onOpenWatchedItems).toHaveBeenCalledTimes(1);
  });

  it("opens Watched Items from the menu", async () => {
    const onOpenWatchedItems = jest.fn();
    const screen = await render(
      <HomeScreen
        onLogout={jest.fn()}
        onOpenNotifications={jest.fn()}
        onOpenWatchedItems={onOpenWatchedItems}
      />,
    );

    await fireEvent.press(screen.getByRole("button", { name: "Open menu" }));
    await fireEvent.press(
      screen.getByRole("button", { name: "Watched Items" }),
    );

    expect(onOpenWatchedItems).toHaveBeenCalledTimes(1);
  });
});
