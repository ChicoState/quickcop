import { useRouter } from "expo-router";

import { AccountInfoContainer } from "../../features/account/AccountInfoContainer";
import { useAuth } from "../../features/auth/AuthProvider";

export default function AccountRoute() {
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <AccountInfoContainer
      onUnauthorized={() => {
        void logout()
          .then((result) => {
            router.replace({
              pathname: "/(public)",
              params: result.ok ? undefined : { logout: "failed" },
            });
          })
          .catch(() => {
            router.replace({
              pathname: "/(public)",
              params: { logout: "failed" },
            });
          });
      }}
    />
  );
}
