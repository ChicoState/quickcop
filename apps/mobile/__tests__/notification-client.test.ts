import {
  loadNotifications,
  updateNotification,
} from "../features/api/notificationClient";

jest.mock("../lib/supabase", () => ({
  supabase: { auth: { getSession: jest.fn() } },
}));

const mockGetSession = jest.requireMock("../lib/supabase").supabase.auth
  .getSession as jest.Mock;

describe("notification client", () => {
  beforeEach(() => {
    mockGetSession.mockResolvedValue({
      data: { session: { access_token: "token" } },
    });
    global.fetch = jest.fn();
    process.env.EXPO_PUBLIC_API_URL = "https://api.example.com";
  });

  it("loads authenticated notifications", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    await loadNotifications();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/notifications",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer token" }),
      }),
    );
  });

  it("persists an alert toggle", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "alert-1", enabled: false }),
    });

    await updateNotification("alert-1", false);

    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/notifications/alert-1",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ enabled: false }),
      }),
    );
  });
});
