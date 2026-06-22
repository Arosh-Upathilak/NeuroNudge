/**
 * Sound Sanctuary screen – manages acoustic environments
 * and calming audioscapes.
 */

import React from "react";
import { Text } from "react-native";
import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";




import { SafeAreaView } from "react-native-safe-area-context";


import { ScaledSheet } from "react-native-size-matters";

export default function SanctuaryScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Sound Sanctuary
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
