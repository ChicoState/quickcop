import { PermissionsAndroid, Platform } from "react-native";

import type { AccountInfo } from "./types";

export async function getPushAvailability(): Promise<
  AccountInfo["pushAvailability"]
> {
  if (Platform.OS !== "android") return "available";

  try {
    const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
    const granted = await PermissionsAndroid.check(permission);
    return granted ? "available" : "unavailable";
  } catch {
    return "unavailable";
  }
}
