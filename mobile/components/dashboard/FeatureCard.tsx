import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

export default function FeatureCard({
  title,
  description,
  icon,
  onPress,
}: FeatureCardProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
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
            backgroundColor: colors.primary,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color="#FFFFFF"
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
        {title}
      </Text>

      <Text
        style={[
          styles.description,
          {
            color: colors.textSecondary,
          },
        ]}
      >
        {description}
      </Text>
    </TouchableOpacity>
  );
}

const styles = ScaledSheet.create({
  card: {
    borderRadius: "24@s",
    paddingHorizontal: "24@s",
    paddingTop: "18@vs",
    paddingBottom: "18@vs",
    marginBottom: "14@vs",
  },

  iconContainer: {
    width: "48@s",
    height: "48@s",
    borderRadius: "24@s",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16@vs",
  },

  title: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.semiBold,
    marginBottom: "8@vs",
  },

  description: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
    lineHeight: "20@vs",
  },
});
