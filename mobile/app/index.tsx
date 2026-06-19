import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log("Login pressed");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>

          <Text style={styles.subtitle}>
            Sign in to continue to your Sanctuary.
          </Text>
        </View>

        {/* Login Card */}
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

          <Text style={[styles.label, { marginTop: 18 }]}>
            Password
          </Text>

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#7B7F78" />

            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#B0B4AD"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Feather
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color="#7B7F78"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
          onPress={() => router.push("/forgot-password")}
          >
            <Text style={styles.forgotPassword}>
              Forgot password?
              </Text>
              </TouchableOpacity>

          <TouchableOpacity
            style={styles.signInButton}
            onPress={handleLogin}
          >
            <Text style={styles.signInText}>
              Sign In →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?
          </Text>

          <TouchableOpacity
          onPress={() => router.push("/signup")}
          >
            <Text style={styles.createAccount}>
              {" "}Create one
            </Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: 45,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#486B5A",
  },

  subtitle: {
    marginTop: 8,
    fontSize: 1,
    color: "#555",
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

  forgotPassword: {
    textAlign: "right",
    marginTop: 10,
    color: "#486B5A",
    fontSize: 15,
    fontWeight: "600",
  },

  signInButton: {
    marginTop: 24,
    height: 58,
    borderRadius: 32,
    backgroundColor: "#486B5A",
    justifyContent: "center",
    alignItems: "center",
  },

  signInText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
  },

  footerText: {
    fontSize: 16,
    color: "#505050",
  },

  createAccount: {
    fontSize: 16,
    color: "#4D6E5D",
    fontWeight: "700",
  },
});