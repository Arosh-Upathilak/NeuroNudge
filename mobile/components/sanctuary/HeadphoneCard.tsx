import React from "react";
import {
  View,
  Text,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

export default function HeadphoneCard(): React.JSX.Element {
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
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Ionicons
          name="headset"
          size={22}
          color={colors.primary}
        />
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
            },
          ]}
        >
          Optimize your experience
        </Text>

        <Text
          style={[
            styles.description,
            {
              color: colors.textSecondary,
            },
          ]}
        >
          Connect headphones for active noise
          cancellation suggestions.
        </Text>
      </View>
    </View>
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
