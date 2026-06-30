import React from "react";
import { View, Text } from "react-native";
import Slider from "@react-native-community/slider";
import { ScaledSheet } from "react-native-size-matters";
import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

interface DelayCardProps {
  delay: number;
  onValueChange: (value: number) => void;
}

export default function DelayCard({
  delay,
  onValueChange,
}: DelayCardProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Activation Delay
        </Text>
        <Text style={[styles.timeValue, { color: colors.text }]}>
          {Math.round(delay)} s
        </Text>
      </View>

      {/* Slider */}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={30}
        value={delay}
        onValueChange={onValueChange}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.divider}
        thumbTintColor={colors.primary}
      />

      {/* Labels */}
      <View style={styles.labels}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Instant
        </Text>
        <Text style={[styles.label, { color: colors.textSecondary }]}>30s</Text>
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
  timeValue: {
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
