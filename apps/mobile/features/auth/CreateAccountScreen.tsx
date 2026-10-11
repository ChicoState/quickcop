import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { supabase } from "../../lib/supabase";
import { authStyles } from "./styles";

type CreateAccountScreenProps = {
  onAccountCreated: () => void;
  onBackToLogin: () => void;
};

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export function CreateAccountScreen({
  onAccountCreated,
  onBackToLogin,
}: CreateAccountScreenProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreateAccount() {
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedUsername = username.trim();

    setNotice("");

    if (!trimmedEmail || !trimmedUsername || !password) {
      setError("Add an email, a username, and a password.");
      return;
    }
    if (!USERNAME_PATTERN.test(trimmedUsername)) {
      setError("Username must be 3-20 letters, numbers, or underscores.");
      return;
    }
    if (trimmedPhone && !PHONE_PATTERN.test(trimmedPhone)) {
      setError("Phone must include country code, like +15305551234.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setLoading(true);

    // 1. Check the username is free
    const { data: available, error: rpcError } = await supabase.rpc(
      "username_available",
      { p_username: trimmedUsername },
    );
    if (rpcError) {
      console.log("username_available error:", rpcError);
      setLoading(false);
      setError(rpcError.message);
      return;
    }
    if (!available) {
      setLoading(false);
      setError("That username is taken.");
      return;
    }

    // 2. Create the account (the database trigger creates the profile row)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          username: trimmedUsername,
          display_name: trimmedUsername,
          phone: trimmedPhone || null,
        },
      },
    });
    console.log("signUp result:", { data, error: signUpError });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    // If email confirmation is ON in Supabase, there's no session yet
    if (!data.session) {
      setNotice("Check your email to confirm your account, then log in.");
      return;
    }

    onAccountCreated();
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
            Create your account.
          </Text>
          <Text style={authStyles.subtitle}>
            Phone number is optional and will be used for text alerts later.
          </Text>

          <View style={authStyles.inputGroup}>
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
          </View>

          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Phone number (optional)</Text>
            <TextInput
              accessibilityLabel="Phone number (optional)"
              autoComplete="tel"
              keyboardType="phone-pad"
              onChangeText={setPhone}
              placeholder="+15305551234"
              placeholderTextColor="#7A7A7A"
              style={authStyles.input}
              value={phone}
            />
          </View>

          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Username</Text>
            <TextInput
              accessibilityLabel="Username"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setUsername}
              placeholder="Choose a username"
              placeholderTextColor="#7A7A7A"
              style={authStyles.input}
              value={username}
            />
          </View>

          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Password</Text>
            <TextInput
              accessibilityLabel="Password"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setPassword}
              placeholder="Create a password"
              placeholderTextColor="#7A7A7A"
              secureTextEntry
              style={authStyles.input}
              value={password}
            />
          </View>

          {error ? (
            <Text
              accessibilityLiveRegion="polite"
              style={authStyles.validation}
            >
              {error}
            </Text>
          ) : null}
          {notice ? (
            <Text accessibilityLiveRegion="polite" style={authStyles.subtitle}>
              {notice}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: loading }}
            disabled={loading}
            onPress={handleCreateAccount}
            style={[authStyles.button, loading && { opacity: 0.6 }]}
          >
            <Text style={authStyles.buttonText}>
              {loading ? "Creating..." : "Create account"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={onBackToLogin}
            style={authStyles.link}
          >
            <Text style={authStyles.linkText}>Back to log in</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
