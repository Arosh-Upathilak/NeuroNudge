import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

interface HeadphoneCardProps {
  isConnected?: boolean;
  isConnecting?: boolean;
  deviceName?: string;
  onConnectToggle?: () => void;
}

export default function HeadphoneCard({
  isConnected = false,
  isConnecting = false,
  deviceName,
  onConnectToggle,
}: HeadphoneCardProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onConnectToggle}
      disabled={isConnecting}
      style={[
        styles.card,
        {
          backgroundColor: isConnected ? colors.primary + "15" : colors.card,
          borderColor: isConnected ? colors.primary : "transparent",
          borderWidth: 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor:
              isConnected || isConnecting ? colors.primary : colors.surface,
          },
        ]}
      >
        {isConnecting ? (
          <ActivityIndicator size="small" color={colors.background} />
        ) : (
          <Ionicons
            name="headset"
            size={22}
            color={isConnected ? colors.background : colors.primary}
          />
        )}
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color: isConnected || isConnecting ? colors.primary : colors.text,
            },
          ]}
        >
          {isConnecting
            ? "Scanning for devices..."
            : isConnected
              ? deviceName || "Supported Headphones"
              : "Optimize your experience"}
        </Text>

        <Text
          style={[
            styles.description,
            {
              color:
                isConnected || isConnecting
                  ? colors.primary
                  : colors.textSecondary,
            },
          ]}
        >
          {isConnecting
            ? "Searching for nearby supported headphones."
            : isConnected
              ? "Supported headphone is connected."
              : "Tap to check for a compatible headphone to enable active noise cancellation."}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = ScaledSheet.create({
  card: {
    borderRadius: "24@s",
    padding: "18@s",
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: "12@vs",
  },

  iconContainer: {
    width: "38@s",
    height: "38@s",
    borderRadius: "19@s",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "12@s",
  },

  textContainer: {
    flex: 1,
  },

  title: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.semiBold,
    marginBottom: "4@vs",
  },

  description: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    lineHeight: "20@vs",
  },
});
