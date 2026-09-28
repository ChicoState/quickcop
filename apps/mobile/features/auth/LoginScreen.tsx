import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
} from "react-native";

import { authStyles } from "./styles";

type LoginScreenProps = {
  onCreateAccount: () => void;
  onLogin: () => void;
};

export function LoginScreen({ onCreateAccount, onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    if (!username.trim() || !password) {
      setError("Enter your username and password to continue.");
      return;
    }

    setError("");
    onLogin();
  }

  return (
    <SafeAreaView style={authStyles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={authStyles.screen}
      >
        <ScrollView
          contentContainerStyle={authStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text accessibilityRole="header" style={authStyles.title}>
            Welcome back.
          </Text>
          <Text style={authStyles.subtitle}>
            Log in to continue to QuickCop.
          </Text>

          <Text style={authStyles.label}>Username</Text>
          <TextInput
            accessibilityLabel="Username"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setUsername}
            placeholder="Your username"
            placeholderTextColor="#7A7A7A"
            style={authStyles.input}
            value={username}
          />

          <Text style={[authStyles.label, authStyles.passwordLabel]}>
            Password
          </Text>
          <TextInput
            accessibilityLabel="Password"
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setPassword}
            placeholder="Your password"
            placeholderTextColor="#7A7A7A"
            secureTextEntry
            style={authStyles.input}
            value={password}
          />

          {error ? (
            <Text
              accessibilityLiveRegion="polite"
              style={authStyles.validation}
            >
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            onPress={handleLogin}
            style={authStyles.button}
          >
            <Text style={authStyles.buttonText}>Log in</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onCreateAccount}
            style={authStyles.link}
          >
            <Text style={authStyles.linkText}>Make an account</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
