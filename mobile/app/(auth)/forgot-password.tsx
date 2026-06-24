import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import { isValidEmail } from "../../utils/validation";

import { ScaledSheet } from "react-native-size-matters";

export default function ForgotPasswordScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [email, setEmail] = useState<string>("");

  const handleResetPassword = (): void => {
  if (!email.trim()) {
    Alert.alert(
      "Validation Error",
      "Please enter your email address."
    );
    return;
  }

  if (!!isValidEmail(email)) {
    Alert.alert(
      "Validation Error",
      "Please enter a valid email address."
    );
    return;
  }

  router.push("/(auth)/check-email");
};

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.content}>
        <Text
          style={[
            styles.title,
            { color: colors.primary },
          ]}
        >
          Forgot Password?
        </Text>

        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary },
          ]}
        >
          Enter your email address and we&apos;ll send you
          instructions to reset your password.
        </Text>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card },
          ]}
        >
          <Text
            style={[
              styles.label,
              { color: colors.text },
            ]}
          >
            Email Address
          </Text>

          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: colors.surface,
                borderColor: colors.divider,
              },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={22}
              color={colors.textSecondary}
            />

            <TextInput
              placeholder="alex@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              style={[
                styles.input,
                { color: colors.text },
              ]}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              { backgroundColor: colors.primary },
            ]}
            onPress={handleResetPassword}
          >
            <Text
              style={[
                styles.buttonText,
                { color: colors.navbarActiveText },
              ]}
            >
              Send Reset Link
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backContainer}
          onPress={() =>
            router.push("/(auth)/login")
          }
        >
          <Text
            style={[
              styles.backText,
              { color: colors.primary },
            ]}
          >
            ← Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: "20@s",
  },
  title: {
    textAlign: "center",
    fontFamily: Fonts.bold,
    fontSize: FontSizes.xxl,
    marginBottom: "12@vs",
  },
  subtitle: {
    textAlign: "center",
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
    marginBottom: "40@vs",
    lineHeight: "22@vs",
  },
  card: {
    borderRadius: "24@s",
    padding: "20@s",
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
    marginBottom: "10@vs",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: "14@s",
    paddingHorizontal: "14@s",
    height: "52@vs",
  },
  input: {
    flex: 1,
    marginLeft: "10@s",
    fontFamily: Fonts.regular,
  },
  button: {
    marginTop: "24@vs",
    height: "54@vs",
    borderRadius: "27@s",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
  },
  backContainer: {
    marginTop: "30@vs",
    alignItems: "center",
  },
  backText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
  },
});
