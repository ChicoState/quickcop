import { Pressable, SafeAreaView, Text } from "react-native";

type ConfigurationErrorScreenProps = {
  message: string;
  onRetry?: () => void;
};

export function ConfigurationErrorScreen({
  message,
  onRetry,
}: ConfigurationErrorScreenProps) {
  return (
    <SafeAreaView style={{ backgroundColor: "#000", flex: 1, padding: 24 }}>
      <Text accessibilityRole="header" style={{ color: "#fff", fontSize: 24 }}>
        Authentication is unavailable
      </Text>
      <Text style={{ color: "#aaa", marginTop: 12 }}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={{ marginTop: 24 }}
        >
          <Text style={{ color: "#79DCA0", fontSize: 16 }}>Retry</Text>
        </Pressable>
      ) : null}
    </SafeAreaView>
  );
}
