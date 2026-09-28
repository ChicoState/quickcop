import { Pressable, SafeAreaView, Text, View } from "react-native";

import { authStyles } from "../auth/styles";

type HomeScreenProps = {
  onLogout: () => void;
};

export function HomeScreen({ onLogout }: HomeScreenProps) {
  return (
    <SafeAreaView style={authStyles.screen}>
      <View style={authStyles.homeHeader}>
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
