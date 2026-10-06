import { useState } from "react";

import { AccountInfoScreen } from "../features/account/AccountInfoScreen";
import type { AccountInfo } from "../features/account/types";

const prototypeAccount: AccountInfo = {
  email: "shopper@example.com",
  notificationPreferences: {
    priceChange: { email: false, push: false },
    restock: { email: false, push: false },
  },
  pendingEmail: null,
  phone: null,
  pushAvailability: "unavailable",
  username: "quickcop_user",
  verifiedEmail: "shopper@example.com",
};

export default function AccountRoute() {
  const [account, setAccount] = useState(prototypeAccount);

  return (
    <AccountInfoScreen
      account={account}
      onSave={async (next) => setAccount(next)}
    />
  );
}
