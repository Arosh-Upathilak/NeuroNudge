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

import { ScaledSheet } from "react-native-size-matters";

export default function SignupScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);

  const handleSignup = (): void => {
  if (!fullName.trim()) {
    Alert.alert(
      "Validation Error",
      "Please enter your full name."
    );
    return;
  }

  if (!email.trim()) {
    Alert.alert(
      "Validation Error",
      "Please enter your email address."
    );
    return;
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
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

  if (!acceptedTerms) {
    Alert.alert(
      "Validation Error",
      "Please accept the Terms and Conditions."
    );
    return;
  }

  Alert.alert(
    "Success",
    "Account created successfully."
  );

  router.replace("/(auth)/login");
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
          Create Account
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Join NeuroNudge to start your journey.
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
            Full Name
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
              name="person-outline"
              size={22}
              color={colors.textSecondary}
            />

            <TextInput
              placeholder="Alex Doe"
              placeholderTextColor={colors.textMuted}
              value={fullName}
              onChangeText={setFullName}
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
            style={styles.termsContainer}
            activeOpacity={0.7}
            onPress={() => setAcceptedTerms(!acceptedTerms)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: colors.textMuted,
                  backgroundColor: acceptedTerms
                    ? colors.primary
                    : colors.surface,
                },
              ]}
            >
              {acceptedTerms && (
                <Ionicons
                  name="checkmark"
                  size={14}
                  color="#FFFFFF"
                />
              )}
            </View>

            <Text
              style={[
                styles.termsText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              I agree to the{" "}
              <Text
                style={[
                  styles.linkText,
                  { color: colors.primary },
                ]}
              >
                Terms and Conditions
              </Text>{" "}
              and{" "}
              <Text
                style={[
                  styles.linkText,
                  { color: colors.primary },
                ]}
              >
                Privacy Policy
              </Text>
              .
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.signUpButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={handleSignup}
          >
          
          <Text
            style={[
              styles.signUpText,
              {
                color: colors.navbarActiveText,
              },
            ]}
          >
            Sign Up
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
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/login")}
          >
            <Text
              style={[
                styles.signInLink,
                {
                  color: colors.primary,
                },
              ]}
            >
              {" "}Sign In
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

  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: "18@vs",
  },

  checkbox: {
    width: "20@s",
    height: "20@s",
    borderWidth: 1,
    borderRadius: "4@s",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "2@vs",
  },

  termsText: {
    flex: 1,
    marginLeft: "12@s",
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
    lineHeight: 22,
  },

  linkText: {
    fontFamily: Fonts.semiBold,
  },

  signUpButton: {
    marginTop: "24@vs",
    height: "52@vs",
    borderRadius: "26@s",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "8@s",
  },

  signUpText: {
    color: "#FFFFFF",
    fontSize: FontSizes.lg,
    fontFamily: Fonts.semiBold,
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

  signInLink: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
  },
});
