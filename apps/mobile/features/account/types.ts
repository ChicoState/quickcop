export type AlertType = "priceChange" | "restock";
export type DeliveryChannel = "email" | "push";

export type NotificationPreferences = Record<
  AlertType,
  Record<DeliveryChannel, boolean>
>;

const defaultChannelPreferences = (): Record<DeliveryChannel, boolean> => ({
  email: false,
  push: false,
});

export function normalizeNotificationPreferences(
  value: unknown,
): NotificationPreferences {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};

  const normalizeChannel = (channel: unknown) => {
    const input =
      channel && typeof channel === "object"
        ? (channel as Record<string, unknown>)
        : {};
    return {
      email: input.email === true,
      push: input.push === true,
    };
  };

  return {
    priceChange: source.priceChange
      ? normalizeChannel(source.priceChange)
      : defaultChannelPreferences(),
    restock: source.restock
      ? normalizeChannel(source.restock)
      : defaultChannelPreferences(),
  };
}

export type AccountInfo = {
  email: string;
  notificationPreferences: NotificationPreferences;
  pendingEmail: string | null;
  phone: string | null;
  pushAvailability: "available" | "unavailable";
  username: string;
  verifiedEmail: string;
};
