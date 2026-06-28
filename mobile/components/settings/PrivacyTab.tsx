import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";
import * as ImagePicker from "expo-image-picker";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";
import CustomToggle from "./CustomToggle";
import { clearUserData } from "../../services/api";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

export default function PrivacyTab(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [locationAccess, setLocationAccess] = useState(true);

  const [microphoneAccess, setMicrophoneAccess] = useState(true);

  const [cameraAccess, setCameraAccess] = useState(false);

  const [bluetoothAccess, setBluetoothAccess] = useState(false);

  const [shareUsageData, setShareUsageData] = useState(false);

  const [personalizedInsights, setPersonalizedInsights] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const location = await AsyncStorage.getItem("privacy_location_access");
        if (location !== null) setLocationAccess(location === "true");

        const mic = await AsyncStorage.getItem("privacy_microphone_access");
        if (mic !== null) setMicrophoneAccess(mic === "true");

        const camera = await AsyncStorage.getItem("privacy_camera_access");
        if (camera !== null) setCameraAccess(camera === "true");

        const bluetooth = await AsyncStorage.getItem(
          "privacy_bluetooth_access",
        );
        if (bluetooth !== null) setBluetoothAccess(bluetooth === "true");

        const shareData = await AsyncStorage.getItem(
          "privacy_share_usage_data",
        );
        if (shareData !== null) setShareUsageData(shareData === "true");

        const insights = await AsyncStorage.getItem(
          "privacy_personalized_insights",
        );
        if (insights !== null) setPersonalizedInsights(insights === "true");
      } catch {}
    };
    loadSettings();
  }, []);

  const handleToggle = async (
    key: string,
    value: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    setter(value);
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch {}
  };

  const handlePermissionToggle = async (
    key: string,
    currentValue: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>,
    requestPermission: () => Promise<boolean>,
  ) => {
    const newVal = !currentValue;
    if (newVal) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "Please enable this permission in your device Settings.",
        );
        return;
      }
    }
    await handleToggle(key, newVal, setter);
  };

  const handleClearData = () => {
    Alert.alert(
      "Clear Data",
      "Are you sure you want to clear all data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await clearUserData();
              await AsyncStorage.clear();
              Alert.alert("Success", "All data has been cleared.");
            } catch (error) {
              const errMsg =
                error instanceof Error ? error.message : "Unknown error";
              Alert.alert("Error", `Failed to clear data: ${errMsg}`);
            }
          },
        },
      ],
    );
  };

  const handleDownloadData = () => {
    Alert.alert(
      "Download Data",
      "Your data is being prepared and will be downloaded shortly.",
    );
  };

  return (
    <>
      {/* Device Permissions */}

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Device Permissions
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              Location Access
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Required for item tracking
            </Text>
          </View>

          <CustomToggle
            value={locationAccess}
            onToggle={() =>
              handlePermissionToggle(
                "privacy_location_access",
                locationAccess,
                setLocationAccess,
                async () =>
                  (await Location.requestForegroundPermissionsAsync())
                    .status === "granted",
              )
            }
          />
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: colors.divider,
            },
          ]}
        />

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              Microphone Access
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Used for ambient noise monitoring
            </Text>
          </View>

          <CustomToggle
            value={microphoneAccess}
            onToggle={() =>
              handlePermissionToggle(
                "privacy_microphone_access",
                microphoneAccess,
                setMicrophoneAccess,
                async () =>
                  (await ExpoSpeechRecognitionModule.requestPermissionsAsync())
                    .granted,
              )
            }
          />
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: colors.divider,
            },
          ]}
        />

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              Camera Access
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Scan items for memory logging
            </Text>
          </View>

          <CustomToggle
            value={cameraAccess}
            onToggle={() =>
              handlePermissionToggle(
                "privacy_camera_access",
                cameraAccess,
                setCameraAccess,
                async () =>
                  (await ImagePicker.requestCameraPermissionsAsync()).granted,
              )
            }
          />
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: colors.divider,
            },
          ]}
        />

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              Bluetooth Access
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Used for headphone integration
            </Text>
          </View>

          <CustomToggle
            value={bluetoothAccess}
            onToggle={() =>
              handlePermissionToggle(
                "privacy_bluetooth_access",
                bluetoothAccess,
                setBluetoothAccess,
                async () => {
                  if (Platform.OS === "android" && Platform.Version >= 31) {
                    const result = await PermissionsAndroid.requestMultiple([
                      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    ]);
                    return (
                      result[
                        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
                      ] === PermissionsAndroid.RESULTS.GRANTED
                    );
                  }
                  return true;
                },
              )
            }
          />
        </View>
      </View>

      {/* Data & Analytics */}

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Data & Analytics
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              Share Usage Data
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Help improve NeuroNudge anonymously
            </Text>
          </View>

          <CustomToggle
            value={shareUsageData}
            onToggle={() =>
              handleToggle(
                "privacy_share_usage_data",
                !shareUsageData,
                setShareUsageData,
              )
            }
          />
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: colors.divider,
            },
          ]}
        />

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              Personalized Insights
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Allow AI to learn your patterns
            </Text>
          </View>

          <CustomToggle
            value={personalizedInsights}
            onToggle={() =>
              handleToggle(
                "privacy_personalized_insights",
                !personalizedInsights,
                setPersonalizedInsights,
              )
            }
          />
        </View>
      </View>

      {/* Data Management */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            marginBottom: 120,
          },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Data Management
        </Text>

        <TouchableOpacity
          style={styles.actionRow}
          activeOpacity={0.7}
          onPress={handleDownloadData}
        >
          <View style={styles.textContainer}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              Download Data
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Export your memories and account information
            </Text>
          </View>

          <Ionicons name="download-outline" size={22} color={colors.primary} />
        </TouchableOpacity>

        <View
          style={[
            styles.divider,
            {
              backgroundColor: colors.divider,
            },
          ]}
        />

        <TouchableOpacity
          style={styles.actionRow}
          activeOpacity={0.7}
          onPress={handleClearData}
        >
          <View style={styles.textContainer}>
            <Text style={[styles.itemTitle, { color: "#D9534F" }]}>
              Clear Data
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color: colors.textSecondary,
                },
              ]}
            >
              Remove all stored memories and history
            </Text>
          </View>

          <Ionicons name="trash-outline" size={22} color="#D9534F" />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = ScaledSheet.create({
  card: {
    borderRadius: "24@s",
    paddingHorizontal: "24@s",
    paddingVertical: "22@vs",
    marginBottom: "16@vs",
  },

  sectionTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.semiBold,
    marginBottom: "20@vs",
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    paddingRight: "12@s",
  },

  itemTitle: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
    marginBottom: "4@vs",
  },

  itemSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    lineHeight: "18@vs",
  },

  divider: {
    height: 1,
    marginVertical: "18@vs",
  },
});
