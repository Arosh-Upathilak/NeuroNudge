/**
 * Lost-to-Found screen – locate essential items
 * or log newly misplaced objects.
 */

import React from "react";
import { Text } from "react-native";
import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import { SafeAreaView } from "react-native-safe-area-context";


import { ScaledSheet } from "react-native-size-matters";




export default function LostFoundScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Lost-to-Found
      </Text>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: "20@s",
    paddingTop: "8@vs",
  },
  title: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
  },
});
