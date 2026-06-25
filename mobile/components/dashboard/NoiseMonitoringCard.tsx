import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

export default function NoiseMonitoringCard(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [enabled, setEnabled] =
    useState(true);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
        },
      ]}
    >
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor:
                colors.background,
            },
          ]}
        >
          <Ionicons
            name="mic"
            size={18}
            color={colors.primary}
          />
        </View>

        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Ambient Noise Monitoring
        </Text>
      </View>

      <TouchableOpacity
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled }}
        accessibilityLabel="Ambient Noise Monitoring"
        activeOpacity={0.8}
        onPress={() => setEnabled(!enabled)}
        style={[
          styles.toggleTrack,
          {
            backgroundColor: enabled
              ? colors.primary
              : "#C9CECA",
          },
        ]}
      >
        <View
          style={[
            styles.toggleThumb,
            {
              alignSelf: enabled
                ? "flex-end"
                : "flex-start",
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = ScaledSheet.create({
  card: {
    borderRadius: "22@s",
    paddingHorizontal: "20@s",
    paddingVertical: "14@vs",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  iconContainer: {
    width: "32@s",
    height: "32@s",
    borderRadius: "16@s",
    justifyContent: "center",
    alignItems: "center",
    marginRight: "12@s",
  },

  title: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
    flexShrink: 1,
  },

  toggleTrack: {
    width: "52@s",
    height: "32@vs",
    borderRadius: "16@s",
    justifyContent: "center",
    paddingHorizontal: "3@s",
  },

  toggleThumb: {
    width: "26@s",
    height: "26@s",
    borderRadius: "13@s",
    backgroundColor: "#FFFFFF",
  },
});
