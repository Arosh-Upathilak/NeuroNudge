import React from "react";
import {
  View,
  Text,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

export default function NoiseLevelCard(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
        },
      ]}
    >
      {/* Safe Zone Badge */}

      <View style={styles.badgeContainer}>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: colors.background,
            },
          ]}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={14}
            color={colors.primary}
          />

          <Text
            style={[
              styles.badgeText,
              {
                color: colors.text,
              },
            ]}
          >
            Safe Zone
          </Text>
        </View>
      </View>

      {/* Sound Visualizer */}

      <View style={styles.visualizer}>
        <View
          style={[
            styles.bar,
            styles.bar1,
            { backgroundColor: "#536B7E" },
          ]}
        />

        <View
          style={[
            styles.bar,
            styles.bar2,
            { backgroundColor: colors.primary },
          ]}
        />

        <View
          style={[
            styles.bar,
            styles.bar3,
            { backgroundColor: "#536B7E" },
          ]}
        />

        <View
          style={[
            styles.bar,
            styles.bar4,
            { backgroundColor: colors.primary },
          ]}
        />

        <View
          style={[
            styles.bar,
            styles.bar5,
            { backgroundColor: "#536B7E" },
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
        42 dB
      </Text>

      <Text
        style={[
          styles.levelText,
          {
            color: colors.primary,
          },
        ]}
      >
        CURRENT LEVEL
      </Text>
    </View>
  );
}

const styles = ScaledSheet.create({
  card: {
    borderRadius: "28@s",
    paddingVertical: "12@vs",
    paddingHorizontal: "20@s",
    marginTop: "12@vs",
    marginBottom: "12@vs",
  },

  badgeContainer: {
    alignItems: "flex-end",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: "10@s",
    paddingVertical: "5@vs",
    borderRadius: "16@s",
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
    marginTop: "14@vs",
    marginBottom: "12@vs",
    height: "60@vs",
  },

  bar: {
    width: "10@s",
    borderRadius: "8@s",
    marginHorizontal: "3@s",
  },

  bar1: {
    height: "32@vs",
  },

  bar2: {
    height: "46@vs",
  },

  bar3: {
    height: "60@vs",
  },

  bar4: {
    height: "48@vs",
  },

  bar5: {
    height: "36@vs",
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