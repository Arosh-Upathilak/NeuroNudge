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

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSignup = () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (!agreeTerms) {
      Alert.alert(
        "Error",
        "Please accept Terms and Conditions"
      );
      return;
    }

    Alert.alert(
      "Success",
      "Account created successfully"
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Create Account
          </Text>

          <Text style={styles.subtitle}>
            Join NeuroNudge to start your journey.
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          {/* Full Name */}
          <Text style={styles.label}>
            Full Name
          </Text>

          <View style={styles.inputContainer}>
            <Feather
              name="user"
              size={20}
              color="#7B7F78"
            />

            <TextInput
              style={styles.input}
              placeholder="Alex Doe"
              placeholderTextColor="#B0B4AD"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email */}
          <Text
            style={[
              styles.label,
              { marginTop: 18 },
            ]}
          >
            Email Address
          </Text>

          <View style={styles.inputContainer}>
            <Feather
              name="mail"
              size={20}
              color="#7B7F78"
            />

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

          {/* Password */}
          <Text
            style={[
              styles.label,
              { marginTop: 18 },
            ]}
          >
            Password
          </Text>

          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={20}
              color="#7B7F78"
            />

            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#B0B4AD"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              onPress={() =>
                setShowPassword(!showPassword)
              }
            >
              <Feather
                name={
                  showPassword
                    ? "eye"
                    : "eye-off"
                }
                size={20}
                color="#7B7F78"
              />
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() =>
                setAgreeTerms(!agreeTerms)
              }
            >
              {agreeTerms && (
                <Text style={styles.checkmark}>
                  ✓
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              I agree to the{" "}
              <Text style={styles.link}>
                Terms and Conditions
              </Text>
              {"\n"}and{" "}
              <Text style={styles.link}>
                Privacy Policy
              </Text>
              .
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.signupButton}
            onPress={handleSignup}
          >
            <Text style={styles.signupButtonText}>
              Sign Up →
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            onPress={() => router.replace("/")}
          >
            <Text style={styles.signInText}>
              {" "}Sign In
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
    marginBottom: 35,
  },

  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#486B5A",
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#D8D7D1",
    borderRadius: 28,
    padding: 24,
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

  termsContainer: {
    flexDirection: "row",
    marginTop: 18,
    alignItems: "flex-start",
  },

  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: "#BDBDBD",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    backgroundColor: "#F5F3EC",
  },

  checkmark: {
    color: "#486B5A",
    fontWeight: "700",
  },

  termsText: {
    flex: 1,
    marginLeft: 10,
    color: "#555",
    lineHeight: 22,
    fontSize: 15,
  },

  link: {
    color: "#486B5A",
    fontWeight: "700",
  },

  signupButton: {
    marginTop: 25,
    height: 58,
    borderRadius: 32,
    backgroundColor: "#486B5A",
    justifyContent: "center",
    alignItems: "center",
  },

  signupButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 35,
  },

  footerText: {
    color: "#555",
    fontSize: 16,
  },

  signInText: {
    color: "#486B5A",
    fontSize: 16,
    fontWeight: "700",
  },
});