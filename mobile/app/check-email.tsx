import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function CheckEmailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Mail Icon */}
        <View style={styles.iconContainer}>
          <Feather
            name="mail"
            size={50}
            color="#486B5A"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Check your mail
        </Text>

        {/* Description */}
        <Text style={styles.subtitle}>
          We have sent password reset instructions
          to your email address.
        </Text>

        {/* Open Email App Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            // Later you can open Gmail/Email app here
          }}
        >
          <Text style={styles.primaryButtonText}>
            Open Email App
          </Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity
          onPress={() => router.replace("/")}
        >
          <Text style={styles.backText}>
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
    backgroundColor: "#F5F3EC",
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
    backgroundColor: "#D8D7D1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    color: "#486B5A",
    marginBottom: 15,
  },

  subtitle: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    marginBottom: 40,
  },

  primaryButton: {
    width: "100%",
    height: 58,
    backgroundColor: "#486B5A",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  primaryButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "700",
  },

  backText: {
    fontSize: 16,
    color: "#486B5A",
    fontWeight: "600",
  },
});