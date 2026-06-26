import React, { useState } from "react";
import {
  View,
  Text,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import CustomToggle from "../settings/CustomToggle";

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

      <CustomToggle
        value={enabled}
        onToggle={() => setEnabled((prev) => !prev)}
      />
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
});
