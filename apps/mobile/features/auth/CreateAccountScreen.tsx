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

import { authStyles } from "./styles";

type CreateAccountScreenProps = {
  onAccountCreated: () => void;
  onBackToLogin: () => void;
};

export function CreateAccountScreen({
  onAccountCreated,
  onBackToLogin,
}: CreateAccountScreenProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleCreateAccount() {
    if ((!email.trim() && !phone.trim()) || !username.trim() || !password) {
      setError("Add an email or phone number, a username, and a password.");
      return;
    }

    setError("");
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
              placeholder="For future text alerts"
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

          <Pressable
            accessibilityRole="button"
            onPress={handleCreateAccount}
            style={authStyles.button}
          >
            <Text style={authStyles.buttonText}>Create account</Text>
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
