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

import { supabase } from "../../lib/supabase";
import { authStyles } from "./styles";

type LoginScreenProps = {
  onCreateAccount: () => void;
  onLogin: () => void;
};

const INVALID_MESSAGE = "Invalid username or password.";

export function LoginScreen({ onCreateAccount, onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    const trimmedUsername = username.trim();

    if (!trimmedUsername || !password) {
      setError("Enter your username and password to continue.");
      return;
    }

    setError("");
    setLoading(true);

    // 1. Look up the email that belongs to this username
    const { data: email, error: lookupError } = await supabase.rpc(
      "get_email_for_username",
      { p_username: trimmedUsername },
    );

    if (lookupError) {
      console.log("get_email_for_username error:", lookupError);
      setLoading(false);
      setError("Something went wrong. Try again.");
      return;
    }

    if (!email) {
      setLoading(false);
      setError(INVALID_MESSAGE); // same message on purpose
      return;
    }

    // 2. Sign in with that email + the password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (signInError) {
      console.log("signIn error:", signInError.message);
      setError(INVALID_MESSAGE);
      return;
    }

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