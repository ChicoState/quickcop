import { act, render, waitFor } from "@testing-library/react-native";

const mockReplace = jest.fn();
const mockUseAuth = jest.fn();
const mockUseSegments = jest.fn();

jest.mock("expo-router", () => ({
  Stack: () => null,
  useRouter: () => ({ replace: mockReplace }),
  useSegments: () => mockUseSegments(),
}));

jest.mock("expo-status-bar", () => ({
  StatusBar: () => null,
}));

jest.mock("../features/auth/AuthProvider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: () => mockUseAuth(),
}));

import RootLayout from "../app/_layout";

describe("authenticated route access", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUseAuth.mockReturnValue({
      session: { user: { id: "user-1" } },
      loading: false,
    });
  });

  it.each([
    ["home", ["home"]],
    ["watched items", ["watched-items"]],
    ["notifications", ["notifications"]],
    ["popular products", ["home", "popular-products"]],
    ["recommended products", ["recommended"]],
  ])("allows logged-in users to access %s", async (_name, segments) => {
    mockUseSegments.mockReturnValue(segments);

    await act(async () => {
      render(<RootLayout />);
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("redirects logged-in users from the login route to home", async () => {
    mockUseSegments.mockReturnValue([]);

    await act(async () => {
      render(<RootLayout />);
    });

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/home"));
  });
});

describe("unauthenticated route access", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockUseAuth.mockReturnValue({ session: null, loading: false });
  });

  it.each([
    ["watched items", ["watched-items"]],
    ["notifications", ["notifications"]],
    ["popular products", ["home", "popular-products"]],
    ["recommended products", ["recommended"]],
  ])(
    "redirects unauthenticated users from %s to login",
    async (_name, segments) => {
      mockUseSegments.mockReturnValue(segments);

      await act(async () => {
        render(<RootLayout />);
      });

      await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/"));
    },
  );
});
