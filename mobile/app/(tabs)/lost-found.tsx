/**
 * Lost-to-Found screen – locate essential items
 * or log newly misplaced objects.
 */

import React from "react";
import { View, Text, StyleSheet, type ViewStyle, type TextStyle } from "react-native";
import { Fonts, FontSizes, type ThemeColors } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LostFoundStyles {
  container: ViewStyle;
  title: TextStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LostFoundScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Lost-to-Found
      </Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: LostFoundStyles = StyleSheet.create<LostFoundStyles>({
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
