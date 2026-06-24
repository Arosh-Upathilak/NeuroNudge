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

export default function LoginScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = (): void => {
  if (!email.trim()) {
    Alert.alert(
      "Validation Error",
      "Please enter your email address."
    );
    return;
  }

  if (!isValidEmail(email)) {
    Alert.alert(
      "Validation Error",
      "Please enter a valid email address."
    );
    return;
  }

  if (!password.trim()) {
    Alert.alert(
      "Validation Error",
      "Please enter your password."
    );
    return;
  }

  if (password.length < 6) {
    Alert.alert(
      "Validation Error",
      "Password must be at least 6 characters."
    );
    return;
  }

  router.replace("/(tabs)");
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
            {
              color: colors.primary,
            },
          ]}
        >
          Welcome Back
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Sign in to continue to your Sanctuary.
        </Text>

        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
            },
          ]}
        >
          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
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
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
            />
          </View>

          <Text
            style={[
              styles.label,
              {
                color: colors.text,
              },
            ]}
          >
            Password
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
              name="lock-closed-outline"
              size={22}
              color={colors.textSecondary}
            />

            <TextInput
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              style={[
                styles.input,
                {
                  color: colors.text,
                },
              ]}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons
                name={
                  showPassword
                    ? "eye-outline"
                    : "eye-off-outline"
                }
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push("/(auth)/forgot-password")}
          >
            <Text
              style={[
                styles.forgotPassword,
                {
                  color: colors.primary,
                },
              ]}
            >
              Forgot password?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.signInButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={handleLogin}
          >
          <Text
            style={[
              styles.signInText,
              {
                color: colors.navbarActiveText,
              },
            ]}
          >
            Sign In
          </Text>

            <Ionicons
            name="arrow-forward-outline"
            size={20}
            color={colors.navbarActiveText}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Don&apos;t have an account?
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/signup")}
          >
            <Text
              style={[
                styles.createAccount,
                {
                  color: colors.primary,
                },
              ]}
            >
              {" "}Create one
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: "20@s",
  },

  title: {
    textAlign: "center",
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
    marginBottom: "8@vs",
  },

  subtitle: {
    textAlign: "center",
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
    marginBottom: "32@vs",
  },

  card: {
    borderRadius: "24@s",
    paddingHorizontal: "20@s",
    paddingVertical: "24@vs",
  },

  label: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
    marginBottom: "8@vs",
    marginTop: "8@vs",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: "14@s",
    paddingHorizontal: "14@s",
    height: "50@vs",
  },

  input: {
    flex: 1,
    marginLeft: "10@s",
    fontFamily: Fonts.regular,
    fontSize: FontSizes.md,
  },

  forgotPassword: {
    textAlign: "right",
    marginTop: "12@vs",
    fontFamily: Fonts.medium,
    fontSize: FontSizes.md,
  },

  signInButton: {
    marginTop: "28@vs",
    height: "52@vs",
    borderRadius: "26@s",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "8@s",
  },

  signInText: {
    fontFamily: Fonts.semiBold,
    fontSize: FontSizes.lg,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: "36@vs",
  },

  footerText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
  },

  createAccount: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
  },
});
