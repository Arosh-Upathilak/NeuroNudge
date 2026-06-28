import React from "react";
import { View, Text, TouchableOpacity, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

export default function CheckEmailScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const openEmailApp = async (): Promise<void> => {
    try {
      const gmailUrl = "googlegmail://";

      const canOpenGmail = await Linking.canOpenURL(gmailUrl);

      if (canOpenGmail) {
        await Linking.openURL(gmailUrl);
        return;
      }

      const supported = await Linking.canOpenURL("mailto:");

      if (supported) {
        await Linking.openURL("mailto:");
      } else {
        Alert.alert(
          "Email App Not Found",
          "No email application is installed on this device.",
        );
      }
    } catch {
      Alert.alert("Error", "Unable to open the email application.");
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
          <Ionicons name="mail" size={50} color={colors.primary} />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.primary,
            },
          ]}
        >
          Check your mail
        </Text>

        <Text
          style={[
            styles.subtitle,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          We have sent password reset instructions
          {"\n"}
          to your email address.
        </Text>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
          onPress={openEmailApp}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.primaryButtonText,
              {
                color: colors.navbarActiveText,
              },
            ]}
          >
            Open Email App
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(auth)/login")}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.backText,
              {
                color: colors.primary,
              },
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
    marginBottom: "20@vs",
  },

  primaryButtonText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.semiBold,
  },

  backText: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.semiBold,
  },
});
