/**
 * Dashboard screen – the main landing page of the app.
 * Shows a personalised greeting and the current date.
 */

import React from "react";
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native";
import { Fonts, FontSizes, type ThemeColors } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardStyles {
  container: ViewStyle;
  greeting: TextStyle;
  date: TextStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

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

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: DashboardStyles = StyleSheet.create<DashboardStyles>({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  greeting: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
    marginBottom: 2,
  },
  date: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
  },
});
