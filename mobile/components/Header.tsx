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
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, FontSizes, type ThemeColors } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";
import { useDrawer } from "../contexts/DrawerContext";

// ─── Types ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  readonly onNotificationPress?: () => void;
}

interface HeaderStyles {
  container: ViewStyle;
  brandText: TextStyle;
  iconsContainer: ViewStyle;
  iconButton: ViewStyle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Header({
  onNotificationPress,
}: HeaderProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();
  const { openDrawer }: { openDrawer: () => void } = useDrawer();
  const insets: EdgeInsets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.headerBackground,
          paddingTop: insets.top + 8,
        },
      ]}
    >
      {/* Brand Name */}
      <Text style={[styles.brandText, { color: colors.headerText }]}>
        NeuroNudge
      </Text>

      {/* Right side icons */}
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
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: HeaderStyles = StyleSheet.create<HeaderStyles>({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  brandText: {
    fontSize: FontSizes.brandTitle,
    fontFamily: Fonts.semiBold,
    letterSpacing: 0.3,
  },
  iconsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconButton: {
    padding: 6,
    borderRadius: 20,
  },
});
