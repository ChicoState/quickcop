import { Pressable, SafeAreaView, Text, View } from "react-native";

import { authStyles } from "../auth/styles";

type HomeScreenProps = {
  onAccountInfo?: () => void;
  onLogout: () => void;
};

export function HomeScreen({ onAccountInfo, onLogout }: HomeScreenProps) {
  return (
    <SafeAreaView style={authStyles.screen}>
      <View style={authStyles.homeHeader}>
        {onAccountInfo ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAccountInfo}
            style={authStyles.homeLogout}
          >
            <Text style={authStyles.linkText}>Account info</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          onPress={onLogout}
          style={authStyles.homeLogout}
        >
          <Text style={authStyles.linkText}>Log out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
