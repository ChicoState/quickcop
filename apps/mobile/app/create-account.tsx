import { useRouter } from "expo-router";

import { CreateAccountScreen } from "../features/auth/CreateAccountScreen";

export default function CreateAccountRoute() {
  const router = useRouter();

  return (
    <CreateAccountScreen
      onAccountCreated={() => router.replace("/home")}
      onBackToLogin={() => router.back()}
    />
  );
}
