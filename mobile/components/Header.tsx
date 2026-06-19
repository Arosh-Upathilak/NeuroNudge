/**
 * Header component for the NeuroNudge app.
 * Displays the brand name on the left with notification
 * and menu action icons on the right.
 *
 * The hamburger menu icon opens the SideDrawer via DrawerContext.
 * Supports light and dark themes via ThemeContext.
 */

import React from "react";
import {
  View,
  Text,

  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, FontSizes } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";
import { useDrawer } from "../contexts/DrawerContext";


import { ScaledSheet } from "react-native-size-matters";




export default function Header({
  onNotificationPress,
}: HeaderProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();
  const { openDrawer }: { openDrawer: () => void } = useDrawer();

  return (
    <SafeAreaView
      edges={['top']}
      style={[
        styles.container,
        {
          backgroundColor: colors.headerBackground,
          paddingTop: 8,
        },
      ]}
    >

      <Text style={[styles.brandText, { color: colors.headerText }]}>
        NeuroNudge
      </Text>

      <View style={styles.iconsContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
        >
          <Ionicons
            name="notifications-outline"
            size={22}
            color={colors.headerIcon}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconButton}
          onPress={openDrawer}
          activeOpacity={0.7}
          accessibilityLabel="Open menu"
          accessibilityRole="button"
        >
          <Ionicons name="menu" size={26} color={colors.headerIcon} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "20@s",
    paddingBottom: "12@vs",
  },
  brandText: {
    fontSize: FontSizes.brandTitle,
    fontFamily: Fonts.semiBold,
    letterSpacing: 0.3,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: "6@s",
  },
  iconButton: {
    padding: "6@ms",
    borderRadius: "20@s",
  },
});
