import React from "react";
import { View, Text } from "react-native";

import Slider from "@react-native-community/slider";

import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

interface ThresholdCardProps {
  threshold: number;
  onValueChange: (value: number) => void;
}

export default function ThresholdCard({
  threshold,
  onValueChange,
}: ThresholdCardProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header */}

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Personal Threshold
        </Text>

        <Text style={[styles.dbValue, { color: colors.text }]}>
          {Math.round(threshold)} dB
        </Text>
      </View>

      {/* Slider */}

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        value={threshold}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.divider}
        thumbTintColor={colors.primary}
      />

      {/* Labels */}

      <View style={styles.labels}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Quiet
        </Text>

        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Loud
        </Text>
      </View>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    marginTop: "8@vs",
    marginBottom: "20@vs",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10@vs",
  },

  title: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
  },

  dbValue: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
  },

  slider: {
    width: "100%",
    height: "30@vs",
  },

  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "-2@vs",
  },

  label: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
  },
});
