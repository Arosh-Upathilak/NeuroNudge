/**
 * Dashboard screen – the main landing page of the app.
 * Shows a personalised greeting and the current date.
 */

import React from "react";
import { View, Text } from "react-native";
import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";







import { ScaledSheet } from "react-native-size-matters";

export default function DashboardScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.greeting, { color: colors.text }]}>
        Good morning, Alex
      </Text>
      <Text style={[styles.date, { color: colors.textSecondary }]}>
        Friday, June 12
      </Text>
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: "20@s",
    paddingTop: "8@vs",
  },
  greeting: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
    marginBottom: "2@vs",
  },
  date: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
  },
});
