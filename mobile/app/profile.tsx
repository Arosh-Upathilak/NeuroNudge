import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ProfileScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleSignOut = async () => {
    // Later:
    // await removeToken();
    router.replace("/");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileSection}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <Feather
              name="user"
              size={32}
              color="#5E5E5E"
            />
          </View>

          <View style={styles.userDetails}>
            <Text style={styles.userName}>
              Alex Doe
            </Text>

            <TouchableOpacity
              onPress={handleSignOut}
            >
              <Text style={styles.signOut}>
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity>
          <Feather
            name="x"
            size={28}
            color="#555"
          />
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Settings */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          router.push("/settings")
        }
      >
        <Feather
          name="settings"
          size={24}
          color="#555"
        />

        <Text style={styles.menuText}>
          Settings
        </Text>
      </TouchableOpacity>

      {/* Help */}
      <TouchableOpacity
        style={styles.menuItem}
        onPress={() =>
          router.push("/help-feedback")
        }
      >
        <Feather
          name="help-circle"
          size={24}
          color="#555"
        />

        <Text style={styles.menuText}>
          Help & Feedback
        </Text>
      </TouchableOpacity>

      {/* Bottom Theme Toggle */}
      <View style={styles.themeContainer}>
        <Text style={styles.themeLabel}>
          Light
        </Text>

        <Switch
          value={isDarkMode}
          onValueChange={setIsDarkMode}
          trackColor={{
            false: "#C7CCC6",
            true: "#486B5A",
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F3EC",
    paddingHorizontal: 24,
    paddingTop: 30,
  },

  profileSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#C5C5C5",
    justifyContent: "center",
    alignItems: "center",
  },

  userDetails: {
    marginLeft: 16,
  },

  userName: {
    fontSize: 28,
    color: "#333",
    fontWeight: "500",
  },

  signOut: {
    color: "#FF4B4B",
    fontSize: 16,
    marginTop: 4,
  },

  divider: {
    height: 1,
    backgroundColor: "#D9D9D9",
    marginVertical: 30,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 35,
  },

  menuText: {
    marginLeft: 18,
    fontSize: 22,
    color: "#333",
  },

  themeContainer: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  themeLabel: {
    fontSize: 22,
    color: "#666",
    marginRight: 15,
  },
});