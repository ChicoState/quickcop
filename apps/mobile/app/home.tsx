import { useRouter } from "expo-router";

import { HomeScreen } from "../features/home/HomeScreen";

export default function HomeRoute() {
  const router = useRouter();

  return <HomeScreen onLogout={() => router.replace("/")} />;
}
