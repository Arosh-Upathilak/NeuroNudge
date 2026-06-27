import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

interface NoiseLevelCardProps {
  currentLevel: number;
  threshold: number;
  permissionGranted: boolean | null;
  onRequestPermission: () => void;
  isMonitoringEnabled: boolean;
  thresholdAction: "none" | "sound" | "anc" | "both";
}

export default function NoiseLevelCard({
  currentLevel,
  threshold,
  permissionGranted,
  onRequestPermission,
  isMonitoringEnabled,
  thresholdAction,
}: NoiseLevelCardProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const isLoud = currentLevel > threshold;
  const volumeFactor = Math.max(0.2, Math.min(1.8, currentLevel / 60));

  // Generate dynamic heights with a small random flutter for live visual feedback
  const getBarHeight = (baseHeight: number) => {
    if (!permissionGranted || !isMonitoringEnabled) return baseHeight;
    const flutter = Math.random() * 8 - 4; // -4 to +4 px
    return Math.max(8, Math.min(90, Math.round(baseHeight * volumeFactor + flutter)));
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
        },
      ]}
    >
      {!isMonitoringEnabled ? (
        // Disabled from Dashboard state
        <View style={styles.permissionContainer}>
          <Ionicons
            name="mic-off-outline"
            size={36}
            color={colors.textSecondary}
            style={styles.permissionIcon}
          />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Ambient Monitoring Disabled
          </Text>
          <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>
            {"Enable \"Ambient Noise Monitoring\" on the Dashboard to measure live noise levels."}
          </Text>
        </View>
      ) : permissionGranted === null ? (
        // Loading state
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Initializing noise monitor...
          </Text>
        </View>
      ) : permissionGranted === false ? (
        // Permission prompt state
        <View style={styles.permissionContainer}>
          <Ionicons
            name="mic-off-outline"
            size={36}
            color={colors.textSecondary}
            style={styles.permissionIcon}
          />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Microphone Access Required
          </Text>
          <Text style={[styles.permissionDesc, { color: colors.textSecondary }]}>
            Allow NeuroNudge to access your microphone to measure real-time ambient noise levels.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onRequestPermission}
          >
            <Text style={[styles.buttonText, { color: colors.surface }]}>
              Enable Noise Monitor
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Normal monitoring state
        <>
          {/* Badge Row */}
          <View style={styles.badgeRow}>
            {/* Safe/Loud Zone Badge */}
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.background,
                },
              ]}
            >
              <Ionicons
                name={isLoud ? "alert-circle-outline" : "checkmark-circle-outline"}
                size={14}
                color={isLoud ? colors.error : colors.primary}
              />

              <Text
                style={[
                  styles.badgeText,
                  {
                    color: isLoud ? colors.error : colors.text,
                  },
                ]}
              >
                {isLoud ? "Loud Zone" : "Safe Zone"}
              </Text>
            </View>

            {/* Simulated ANC Badge */}
            {isLoud && (thresholdAction === "anc" || thresholdAction === "both") && (
              <View
                style={[
                  styles.badge,
                  styles.ancBadge,
                  {
                    backgroundColor: colors.info,
                  },
                ]}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={12}
                  color={colors.surface}
                />
                <Text
                  style={[
                    styles.badgeText,
                    {
                      color: colors.surface,
                    },
                  ]}
                >
                  ANC Simulated
                </Text>
              </View>
            )}
          </View>

          {/* Sound Visualizer */}
          <View style={styles.visualizer}>
            <View
              style={[
                styles.bar,
                {
                  backgroundColor: colors.textSecondary,
                  height: getBarHeight(32),
                },
              ]}
            />

            <View
              style={[
                styles.bar,
                {
                  backgroundColor: isLoud ? colors.error : colors.primary,
                  height: getBarHeight(46),
                },
              ]}
            />

            <View
              style={[
                styles.bar,
                {
                  backgroundColor: colors.textSecondary,
                  height: getBarHeight(60),
                },
              ]}
            />

            <View
              style={[
                styles.bar,
                {
                  backgroundColor: isLoud ? colors.error : colors.primary,
                  height: getBarHeight(48),
                },
              ]}
            />

            <View
              style={[
                styles.bar,
                {
                  backgroundColor: colors.textSecondary,
                  height: getBarHeight(36),
                },
              ]}
            />
          </View>

          {/* Current Level */}
          <Text
            style={[
              styles.dbText,
              {
                color: colors.text,
              },
            ]}
          >
            {currentLevel} dB
          </Text>

          <Text
            style={[
              styles.levelText,
              {
                color: isLoud ? colors.error : colors.primary,
              },
            ]}
          >
            CURRENT LEVEL
          </Text>
        </>
      )}
    </View>
  );
}

const styles = ScaledSheet.create({
  card: {
    borderRadius: "28@s",
    paddingVertical: "16@vs",
    paddingHorizontal: "20@s",
    marginTop: "12@vs",
    marginBottom: "12@vs",
    minHeight: "170@vs",
    justifyContent: "center",
  },

  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "24@vs",
  },

  loadingText: {
    marginTop: "12@vs",
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
  },

  permissionContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "10@vs",
  },

  permissionIcon: {
    marginBottom: "8@vs",
  },

  permissionTitle: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
    textAlign: "center",
    marginBottom: "4@vs",
  },

  permissionDesc: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginBottom: "14@vs",
    lineHeight: "18@vs",
    paddingHorizontal: "10@s",
  },

  button: {
    paddingHorizontal: "22@s",
    paddingVertical: "10@vs",
    borderRadius: "20@s",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  buttonText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
  },

  badgeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "8@s",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "10@s",
    paddingVertical: "5@vs",
    borderRadius: "16@s",
  },

  ancBadge: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },

  badgeText: {
    marginLeft: "4@s",
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
  },

  visualizer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: "10@vs",
    marginBottom: "12@vs",
    height: "60@vs",
  },

  bar: {
    width: "10@s",
    borderRadius: "8@s",
    marginHorizontal: "3@s",
  },

  dbText: {
    textAlign: "center",
    fontSize: "22@s",
    fontFamily: Fonts.bold,
  },

  levelText: {
    textAlign: "center",
    marginTop: "4@vs",
    letterSpacing: 2,
    fontSize: FontSizes.sm,
    fontFamily: Fonts.medium,
  },
});
