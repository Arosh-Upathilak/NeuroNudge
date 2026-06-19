import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }

    Alert.alert(
      "Password Reset",
      "Password reset instructions have been sent to your email.",
      [
        {
          text: "OK",
          onPress: () => router.push("/check-email"),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password?</Text>

          <Text style={styles.subtitle}>
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.label}>Email Address</Text>

          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#7B7F78" />

            <TextInput
              style={styles.input}
              placeholder="alex@example.com"
              placeholderTextColor="#B0B4AD"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleResetPassword}
          >
            <Text style={styles.resetButtonText}>
              Send Reset Link
            </Text>
          </TouchableOpacity>
        </View>

        {/* Back to Login */}
        <TouchableOpacity
        onPress={() => router.replace("/")}
        >
          <Text style={styles.backToLogin}>
            ← Back to Login
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EC",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  header: {
    alignItems: "center",
    marginBottom: 40,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#486B5A",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 12,
    fontSize: 15,
    color: "#555",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },

  card: {
    backgroundColor: "#D8D7D1",
    borderRadius: 24,
    padding: 20,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#454545",
    marginBottom: 10,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3EC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C9CBC6",
    height: 50,
    paddingHorizontal: 14,
  },

  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },

  resetButton: {
    marginTop: 25,
    height: 58,
    borderRadius: 32,
    backgroundColor: "#486B5A",
    justifyContent: "center",
    alignItems: "center",
  },

  resetButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },

  backToLogin: {
    textAlign: "center",
    marginTop: 30,
    color: "#486B5A",
    fontSize: 16,
    fontWeight: "600",
  },
});