import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import { useAuth } from "../../contexts/AuthContext";

export default function VerifyEmailScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();
  const { user, reloadUser, resendVerificationEmail, signOut } = useAuth();

  const [isReloading, setIsReloading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);

  const handleVerify = async (): Promise<void> => {
    setIsReloading(true);
    try {
      await reloadUser();
      setTimeout(() => {
        setIsReloading(false);
        Alert.alert(
          "Not Verified",
          "We checked your account but the email is not verified yet. Please check your inbox and click the link.",
        );
      }, 1000);
    } catch (error) {
      setIsReloading(false);
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleResend = async (): Promise<void> => {
    setIsResending(true);
    try {
      await resendVerificationEmail();
      Alert.alert("Success", "Verification email has been resent.");
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert("Sign Out Failed", (error as Error).message);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: colors.card,
            },
          ]}
        >
          <Ionicons name="mail-unread" size={50} color={colors.primary} />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.primary,
            },
          ]}
        >
          Verify your email
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          We&apos;ve sent a verification link to
          {"\n"}
          <Text style={{ fontFamily: Fonts.semiBold, color: colors.text }}>
            {user?.email}
          </Text>
          {"\n\n"}
          Please verify your account to continue.
        </Text>

        <TouchableOpacity
          style={[
            styles.secondaryButton,
            {
              borderColor: colors.primary,
              backgroundColor: colors.background,
            },
          ]}
          onPress={handleVerify}
          activeOpacity={0.8}
          disabled={isReloading}
        >
          {isReloading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text
              style={[
                styles.secondaryButtonText,
                {
                  color: colors.primary,
                },
              ]}
            >
              I&apos;ve Verified My Email
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.textButton}
          onPress={handleResend}
          disabled={isResending}
          activeOpacity={0.7}
        >
          {isResending ? (
            <ActivityIndicator size="small" color={colors.textSecondary} />
          ) : (
            <Text
              style={[
                styles.resendText,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Didn&apos;t receive it?{" "}
              <Text
                style={{ color: colors.primary, fontFamily: Fonts.semiBold }}
              >
                Resend
              </Text>
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Text style={[styles.signOutText, { color: colors.error }]}>
            Sign Out
          </Text>
        </TouchableOpacity>
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
    alignItems: "center",
    paddingHorizontal: "30@s",
  },
  iconContainer: {
    width: "110@s",
    height: "110@s",
    borderRadius: "55@s",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "30@vs",
  },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
    marginBottom: "15@vs",
  },
  subtitle: {
    textAlign: "center",
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
    lineHeight: "24@vs",
    marginBottom: "40@vs",
  },
  primaryButton: {
    width: "100%",
    height: "58@vs",
    borderRadius: "32@s",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "15@vs",
  },
  primaryButtonText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.semiBold,
  },
  secondaryButton: {
    width: "100%",
    height: "58@vs",
    borderRadius: "32@s",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "25@vs",
  },
  secondaryButtonText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.semiBold,
  },
  textButton: {
    padding: "10@s",
    marginBottom: "20@vs",
  },
  resendText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
  },
  signOutButton: {
    marginTop: "20@vs",
    padding: "10@s",
  },
  signOutText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
  },
});
