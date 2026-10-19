import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authStyles } from "./styles";
import { signInWithEmail } from "./authService";

type LoginScreenProps = {
  initialNotice?: string;
  onCreateAccount: () => void;
  onLogin: () => void;
};

const INVALID_MESSAGE = "Invalid email or password.";
const SERVICE_MESSAGE =
  "Authentication is temporarily unavailable. Try again later.";

export function LoginScreen({
  initialNotice,
  onCreateAccount,
  onLogin,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(initialNotice ?? "");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError("Enter your email and password to continue.");
      return;
    }

    setError("");
    setNotice("");
    setLoading(true);

    try {
      const result = await signInWithEmail(trimmedEmail, password);

      if (!result.ok) {
        setError(
          result.failure.kind === "network"
            ? "Unable to connect. Try again."
            : result.failure.kind === "credentials"
              ? INVALID_MESSAGE
              : SERVICE_MESSAGE,
        );
        return;
      }

      onLogin();
    } finally {
      setLoading(false);
    }
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
          {notice ? (
            <Text accessibilityLiveRegion="polite" style={authStyles.subtitle}>
              {notice}
            </Text>
          ) : null}

          <Text style={authStyles.label}>Email</Text>
          <TextInput
            accessibilityLabel="Email"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#7A7A7A"
            style={authStyles.input}
            value={email}
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
            accessibilityState={{ disabled: loading }}
            disabled={loading}
            onPress={handleLogin}
            style={[authStyles.button, loading && { opacity: 0.6 }]}
          >
            <Text style={authStyles.buttonText}>
              {loading ? "Logging in..." : "Log in"}
            </Text>
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
