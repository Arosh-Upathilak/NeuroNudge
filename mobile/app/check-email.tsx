import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTheme } from "../hooks/useTheme";

export default function CheckEmailScreen() {
  const { colors } = useTheme();

  const openEmailApp = async () => {
    try {
      const supported = await Linking.canOpenURL("mailto:");

      if (supported) {
        await Linking.openURL("mailto:");
      } else {
        Alert.alert(
          "Email App Not Found",
          "No email application is installed on this device."
        );
      }
    } catch {
      Alert.alert(
        "Error",
        "Unable to open the email application."
      );
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={styles.content}>
        {/* Mail Icon */}
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.card },
          ]}
        >
          <Feather
            name="mail"
            size={50}
            color={colors.primary}
          />
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            { color: colors.primary },
          ]}
        >
          Check your mail
        </Text>

        {/* Description */}
        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary },
          ]}
        >
          We have sent password reset instructions
          {"\n"}
          to your email address.
        </Text>

        {/* Open Email App Button */}
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={openEmailApp}
        >
          <Text style={styles.primaryButtonText}>
            Open Email App
          </Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => router.replace("/")}
        >
          <Text
            style={[
              styles.backText,
              { color: colors.primary },
            ]}
          >
            Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  iconContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 15,
  },

  subtitle: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
  },

  primaryButton: {
    width: "100%",
    height: 58,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  backText: {
    fontSize: 16,
    fontWeight: "600",
  },
});