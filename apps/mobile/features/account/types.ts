export type AlertType = "priceChange" | "restock";
export type DeliveryChannel = "email" | "push";

export type NotificationPreferences = Record<
  AlertType,
  Record<DeliveryChannel, boolean>
>;

export type AccountInfo = {
  email: string;
  notificationPreferences: NotificationPreferences;
  pendingEmail: string | null;
  phone: string | null;
  pushAvailability: "available" | "unavailable";
  username: string;
  verifiedEmail: string;
};
