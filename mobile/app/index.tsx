import React from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "../hooks/useTheme";
import { ScaledSheet } from "react-native-size-matters";

export default function Index(): React.JSX.Element {
  const { colors } = useTheme();
  
  // Return a loading spinner while the _layout.tsx auth guard determines the correct route
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
