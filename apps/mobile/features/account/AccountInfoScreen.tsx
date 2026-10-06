import { useState, type ComponentProps } from "react";
import {
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import type {
  AccountInfo,
  AlertType,
  DeliveryChannel,
  NotificationPreferences,
} from "./types";
import { accountStyles } from "./styles";

type AccountInfoScreenProps = {
  account: AccountInfo;
  onSave: (account: AccountInfo) => Promise<void>;
};

const alertRows: Array<{ key: AlertType; label: string }> = [
  { key: "restock", label: "Restock alerts" },
  { key: "priceChange", label: "Price-change alerts" },
];

function isValidEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value);
}

function preferenceLabel(alertType: AlertType, channel: DeliveryChannel) {
  const alertLabel = alertType === "restock" ? "Restock" : "Price-change";
  const channelLabel = channel === "push" ? "push" : "email";
  return `${alertLabel} ${channelLabel} alerts`;
}

export function AccountInfoScreen({ account, onSave }: AccountInfoScreenProps) {
  const [email, setEmail] = useState(account.email);
  const [phone, setPhone] = useState(account.phone ?? "");
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    account.notificationPreferences,
  );
  const [username, setUsername] = useState(account.username);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  function updatePreference(
    alertType: AlertType,
    channel: DeliveryChannel,
    value: boolean,
  ) {
    setPreferences((current) => ({
      ...current,
      [alertType]: { ...current[alertType], [channel]: value },
    }));
  }

  async function handleSave() {
    const nextErrors: string[] = [];
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedUsername) {
      nextErrors.push("Enter a username.");
    }

    if (!isValidEmail(normalizedEmail)) {
      nextErrors.push("Enter a valid email address.");
    }

    if (nextErrors.length > 0) {
      setErrors(nextErrors);
      setSaveMessage("");
      return;
    }

    setErrors([]);
    setIsSaving(true);
    setSaveMessage("");

    try {
      await onSave({
        ...account,
        email: normalizedEmail,
        notificationPreferences: preferences,
        pendingEmail:
          normalizedEmail === account.verifiedEmail ? null : normalizedEmail,
        phone: phone.trim() || null,
        username: normalizedUsername,
      });
      setSaveMessage("Changes saved for this session.");
    } catch {
      setSaveMessage("We could not save your changes. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={accountStyles.screen}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={accountStyles.screen}
      >
        <ScrollView
          contentContainerStyle={accountStyles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text accessibilityRole="header" style={accountStyles.title}>
            Account info
          </Text>
          <Text style={accountStyles.subtitle}>
            Update your details and choose how you receive alerts.
          </Text>

          <Text accessibilityRole="header" style={accountStyles.sectionTitle}>
            Profile
          </Text>
          <Field label="Username" onChangeText={setUsername} value={username} />
          <Field
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            label="Email"
            onChangeText={setEmail}
            value={email}
          />
          {account.pendingEmail ? (
            <Text style={accountStyles.helper}>
              Confirm {account.pendingEmail} to use it for email alerts. Until
              then, alerts go to {account.verifiedEmail}.
            </Text>
          ) : null}
          <Field
            autoComplete="tel"
            keyboardType="phone-pad"
            label="Phone number (optional)"
            onChangeText={setPhone}
            value={phone}
          />

          <Text accessibilityRole="header" style={accountStyles.sectionTitle}>
            Alert preferences
          </Text>
          <Text style={accountStyles.helper}>
            Monitoring continues even when every alert is off.
          </Text>
          {alertRows.map(({ key, label }) => (
            <View key={key} style={accountStyles.alertRow}>
              <Text style={accountStyles.alertLabel}>{label}</Text>
              <Toggle
                alertType={key}
                channel="push"
                onValueChange={updatePreference}
                preferences={preferences}
              />
              <Toggle
                alertType={key}
                channel="email"
                onValueChange={updatePreference}
                preferences={preferences}
              />
            </View>
          ))}
          {account.pushAvailability === "unavailable" ? (
            <View style={accountStyles.availabilityNotice}>
              <Text style={accountStyles.helper}>
                Push notifications are unavailable on this device.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  void Linking.openSettings().catch(() => {
                    setSaveMessage(
                      "Open your device settings to enable notifications.",
                    );
                  })
                }
                style={accountStyles.settingsLink}
              >
                <Text style={accountStyles.linkText}>
                  Open notification settings
                </Text>
              </Pressable>
            </View>
          ) : null}

          {errors.map((error) => (
            <Text
              accessibilityLiveRegion="polite"
              key={error}
              style={accountStyles.validation}
            >
              {error}
            </Text>
          ))}
          {saveMessage ? (
            <Text accessibilityLiveRegion="polite" style={accountStyles.helper}>
              {saveMessage}
            </Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            disabled={isSaving}
            onPress={() => void handleSave()}
            style={[
              accountStyles.button,
              isSaving ? accountStyles.buttonDisabled : undefined,
            ]}
          >
            <Text style={accountStyles.buttonText}>
              {isSaving ? "Saving changes…" : "Save changes"}
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = Pick<
  ComponentProps<typeof TextInput>,
  "autoCapitalize" | "autoComplete" | "autoCorrect" | "keyboardType"
> & {
  label: string;
  onChangeText: (value: string) => void;
  value: string;
};

function Field({ label, onChangeText, value, ...inputProps }: FieldProps) {
  return (
    <View style={accountStyles.inputGroup}>
      <Text style={accountStyles.label}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        onChangeText={onChangeText}
        placeholderTextColor="#7A7A7A"
        style={accountStyles.input}
        value={value}
        {...inputProps}
      />
    </View>
  );
}

type ToggleProps = {
  alertType: AlertType;
  channel: DeliveryChannel;
  onValueChange: (
    alertType: AlertType,
    channel: DeliveryChannel,
    value: boolean,
  ) => void;
  preferences: NotificationPreferences;
};

function Toggle({
  alertType,
  channel,
  onValueChange,
  preferences,
}: ToggleProps) {
  const label = preferenceLabel(alertType, channel);

  return (
    <View style={accountStyles.toggleGroup}>
      <Text style={accountStyles.toggleLabel}>
        {channel === "push" ? "Push" : "Email"}
      </Text>
      <Switch
        accessibilityLabel={label}
        onValueChange={(value) => onValueChange(alertType, channel, value)}
        value={preferences[alertType][channel]}
      />
    </View>
  );
}
