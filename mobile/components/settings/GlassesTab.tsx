/**
 * GlassesTab – Settings tab for AiSee smart glasses configuration.
 *
 * Allows the user to:
 * - Enter/edit the glasses Bluetooth MAC address
 * - Connect or disconnect from the glasses
 * - View the current connection status
 */

import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Platform, PermissionsAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { useTheme } from "../../hooks/useTheme";
import { Fonts, FontSizes } from "../../constants/theme";
import { useAiSeeGlasses } from "../../contexts/AiSeeGlassesContext";
import {
  DEFAULT_MAC_ADDRESS,
  AISEE_MAC_STORAGE_KEY,
} from "../../services/aisee/types";

const CONNECTION_DOT_COLORS: Record<string, string> = {
  READY: "#34C759",
  CONNECTED: "#34C759",
  CONNECTING: "#FF9500",
  INITIALIZING: "#FF9500",
  SCANNING: "#FF9500",
  DISCONNECTED: "#FF3B30",
  ERROR: "#FF3B30",
  IDLE: "#8E8E93",
};

const CONNECTION_LABELS: Record<string, string> = {
  READY: "Connected & Ready",
  CONNECTED: "Connected",
  CONNECTING: "Connecting...",
  INITIALIZING: "Initializing...",
  SCANNING: "Scanning...",
  DISCONNECTED: "Disconnected",
  ERROR: "Connection Error",
  IDLE: "Not Started",
};

export default function GlassesTab(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();
  const { connectionState, isConnected, isServiceRunning, connect, disconnect } =
    useAiSeeGlasses();

  const [macAddress, setMacAddress] = useState(DEFAULT_MAC_ADDRESS);

  useEffect(() => {
    AsyncStorage.getItem(AISEE_MAC_STORAGE_KEY).then((saved) => {
      if (saved) setMacAddress(saved);
    });
  }, []);

  const handleSaveMac = async () => {
    await AsyncStorage.setItem(AISEE_MAC_STORAGE_KEY, macAddress.trim());
  };

  const handleToggleConnection = async () => {
    if (isConnected || isServiceRunning) {
      disconnect();
    } else {
      if (Platform.OS === 'android' && (Platform.Version as number) >= 31) {
        try {
          const permissionsToRequest = [
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          ];
          if ((Platform.Version as number) >= 33) {
            permissionsToRequest.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
          }
          const granted = await PermissionsAndroid.requestMultiple(permissionsToRequest);
          if (
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] !== PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] !== PermissionsAndroid.RESULTS.GRANTED
          ) {
            console.warn("Bluetooth permissions denied");
            return;
          }
        } catch (err) {
          console.warn("Error requesting permissions", err);
        }
      }

      await handleSaveMac();
      await connect(macAddress.trim());
    }
  };

  if (Platform.OS !== "android") {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          AiSee Glasses
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          AiSee glasses integration is only available on Android.
        </Text>
      </View>
    );
  }

  const dotColor = CONNECTION_DOT_COLORS[connectionState] || "#8E8E93";
  const statusLabel = CONNECTION_LABELS[connectionState] || connectionState;

  return (
    <View>
      {/* Connection Status */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Connection Status
        </Text>

        <View style={[styles.statusCard, { backgroundColor: colors.card }]}>
          <View style={styles.statusRow}>
            <Ionicons
              name="glasses-outline"
              size={24}
              color={colors.text}
              style={styles.statusIcon}
            />
            <View style={styles.statusTextContainer}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                AiSee Smart Glasses
              </Text>
              <View style={styles.statusDotRow}>
                <View
                  style={[styles.statusDot, { backgroundColor: dotColor }]}
                />
                <Text
                  style={[styles.statusLabel, { color: colors.textSecondary }]}
                >
                  {statusLabel}
                </Text>
              </View>
            </View>
          </View>

          {isServiceRunning && (
            <View style={styles.serviceIndicator}>
              <View
                style={[styles.serviceActiveDot, { backgroundColor: "#34C759" }]}
              />
              <Text
                style={[styles.serviceText, { color: colors.textSecondary }]}
              >
                Background service active
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* MAC Address */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Glasses MAC Address
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          Enter the Bluetooth MAC address of your AiSee glasses.
        </Text>

        <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
          <Ionicons
            name="bluetooth-outline"
            size={20}
            color={colors.textSecondary}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.macInput, { color: colors.text }]}
            value={macAddress}
            onChangeText={setMacAddress}
            placeholder="AA:BB:CC:DD:EE:FF"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
            maxLength={17}
          />
        </View>
      </View>

      {/* Connect / Disconnect Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.connectButton,
            {
              backgroundColor:
                isConnected || isServiceRunning
                  ? colors.error
                  : colors.primary,
            },
          ]}
          onPress={handleToggleConnection}
          activeOpacity={0.8}
        >
          <Ionicons
            name={
              isConnected || isServiceRunning
                ? "close-circle-outline"
                : "link-outline"
            }
            size={20}
            color={colors.surface}
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonText, { color: colors.surface }]}>
            {isConnected || isServiceRunning
              ? "Disconnect Glasses"
              : "Connect Glasses"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          How It Works
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          When connected, press the button on your AiSee glasses to
          automatically capture a photo, record your voice, and save the memory.
          This works even when the app is in the background.
        </Text>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  section: {
    marginBottom: "20@vs",
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontFamily: Fonts.semiBold,
    marginBottom: "8@vs",
  },
  description: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    lineHeight: 20,
    marginBottom: "12@vs",
  },
  statusCard: {
    borderRadius: "16@s",
    padding: "16@s",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIcon: {
    marginRight: "12@s",
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
    marginBottom: "4@vs",
  },
  statusDotRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: "8@s",
    height: "8@s",
    borderRadius: "4@s",
    marginRight: "6@s",
  },
  statusLabel: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
  },
  serviceIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "12@vs",
    paddingTop: "12@vs",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)",
  },
  serviceActiveDot: {
    width: "6@s",
    height: "6@s",
    borderRadius: "3@s",
    marginRight: "6@s",
  },
  serviceText: {
    fontSize: FontSizes.xs,
    fontFamily: Fonts.regular,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: "12@s",
    paddingHorizontal: "14@s",
    paddingVertical: "12@vs",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: "10@s",
  },
  macInput: {
    flex: 1,
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
    letterSpacing: 1,
    padding: 0,
  },
  connectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12@s",
    paddingVertical: "14@vs",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    marginRight: "8@s",
  },
  buttonText: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
  },
});
