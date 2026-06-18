/**
 * Sound Sanctuary screen – manages acoustic environments
 * and calming audioscapes.
 */

import React from "react";
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native";
import { Fonts, FontSizes, type ThemeColors } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SanctuaryStyles {
  container: ViewStyle;
  title: TextStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SanctuaryScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Sound Sanctuary
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: SanctuaryStyles = StyleSheet.create<SanctuaryStyles>({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
  },
});
