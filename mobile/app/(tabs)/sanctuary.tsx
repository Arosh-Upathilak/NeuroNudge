/**
 * Sound Sanctuary screen – manages acoustic environments
 * and calming audioscapes.
 */

import React from "react";
import { Text } from "react-native";
import { Fonts } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import NoiseLevelCard from "../../components/sanctuary/NoiseLevelCard";
import ThresholdCard from "../../components/sanctuary/ThresholdCard";
import HeadphoneCard from "../../components/sanctuary/HeadphoneCard";

import { SafeAreaView } from "react-native-safe-area-context";


import { ScaledSheet } from "react-native-size-matters";

export default function SanctuaryScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
  <SafeAreaView
    style={[
      styles.container,
      { backgroundColor: colors.background },
    ]}
  >
    <Text
  style={[
    styles.title,
    { color: colors.text },
  ]}
>
  Sound Sanctuary
</Text>

<Text
  style={[
    styles.subtitle,
    { color: colors.textSecondary },
  ]}
>
  Monitoring ambient noise levels to support focus.
</Text>

    <NoiseLevelCard />
    <ThresholdCard />
    <HeadphoneCard />
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
  fontSize: "30@s",
  fontFamily: Fonts.bold,
  textAlign: "center",
},
  subtitle: {
  fontSize: "12@s",
  fontFamily: Fonts.regular,
  textAlign: "center",
  marginTop: "8@vs",
  marginBottom: "16@vs",
},
});
