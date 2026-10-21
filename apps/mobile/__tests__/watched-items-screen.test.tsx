import { fireEvent, render } from "@testing-library/react-native";

import {
  WatchedItemsScreen,
  type WatchedItem,
} from "../features/watched-items/WatchedItemsScreen";

describe("WatchedItemsScreen", () => {
  it("shows placeholder watched products and lets the user toggle an alert locally", async () => {
    const screen = await render(<WatchedItemsScreen />);

    expect(screen.getByText("Nintendo Switch 2")).toBeTruthy();
    expect(screen.getByText("Target")).toBeTruthy();
    expect(screen.getByText("Current price: $449.99")).toBeTruthy();
    expect(screen.getByText("Target price: $450.00")).toBeTruthy();

    const alertToggle = screen.getByRole("switch", {
      name: "Nintendo Switch 2 price alert",
    });
    expect(alertToggle.props.value).toBe(true);

    await fireEvent(alertToggle, "valueChange", false);

    expect(
      screen.getByRole("switch", { name: "Nintendo Switch 2 price alert" })
        .props.value,
    ).toBe(false);
  });

  it("adds an item with a target price and removes it locally", async () => {
    const screen = await render(<WatchedItemsScreen initialItems={[]} />);

    expect(screen.getByText("No watched items yet")).toBeTruthy();

    await fireEvent.press(screen.getByRole("button", { name: "Add item" }));
    await fireEvent.changeText(
      screen.getByLabelText("Product name"),
      "LEGO Star Wars Set",
    );
    await fireEvent.changeText(screen.getByLabelText("Store"), "Amazon");
    await fireEvent.changeText(screen.getByLabelText("Current price"), "69.99");
    await fireEvent.changeText(screen.getByLabelText("Target price"), "59.99");
    await fireEvent.press(screen.getByRole("button", { name: "Watch item" }));

    expect(screen.getByText("LEGO Star Wars Set")).toBeTruthy();
    expect(screen.getByText("Target price: $59.99")).toBeTruthy();

    await fireEvent.press(
      screen.getByRole("button", { name: "Unwatch LEGO Star Wars Set" }),
    );

    expect(screen.getByText("No watched items yet")).toBeTruthy();
  });

  it("shows an empty state when no watched items are available", async () => {
    const items: WatchedItem[] = [];
    const screen = await render(<WatchedItemsScreen initialItems={items} />);

    expect(screen.getByText("No watched items yet")).toBeTruthy();
    expect(
      screen.getByText("Add an item to start tracking its price locally."),
    ).toBeTruthy();
  });
});
