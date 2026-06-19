/**
 * Custom bottom tab bar (Footer / Navbar) for the NeuroNudge app.
 * Active tab renders as a pill-shaped button with the primary brand color.
 * Supports light and dark themes.
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Fonts, FontSizes } from "../constants/theme";
import { ScaledSheet } from "react-native-size-matters";
import { useTheme } from "../hooks/useTheme";




const TAB_CONFIG: Readonly<Record<string, TabConfig>> = {
  index: {
    label: "Dashboard",
    activeIcon: "grid",
    inactiveIcon: "grid-outline",
  },
  sanctuary: {
    label: "Sanctuary",
    activeIcon: "options",
    inactiveIcon: "options-outline",
  },
  "lost-found": {
    label: "Lost-Found",
    activeIcon: "archive",
    inactiveIcon: "archive-outline",
  },
} as const;


export default function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[
        styles.container,
        {
          backgroundColor: colors.navbarBackground,
          borderTopColor: colors.navbarBorder,
          paddingBottom: 10,
        },
      ]}
    >
      {state.routes.map((route, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused: boolean = state.index === index;
        const config: TabConfig | undefined = TAB_CONFIG[route.name];

        if (!config) return null;

        const onPress = (): void => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = (): void => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        const iconName: TabIconName = isFocused
          ? config.activeIcon
          : config.inactiveIcon;
        const iconColor: string = isFocused
          ? colors.navbarActiveText
          : colors.navbarInactiveText;
        const textColor: string = isFocused
          ? colors.navbarActiveText
          : colors.navbarInactiveText;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            onLongPress={onLongPress}
            activeOpacity={0.7}
            style={[
              styles.tabButton,
              isFocused && [
                styles.tabButtonActive,
                { backgroundColor: colors.navbarActiveBackground, shadowColor: colors.shadow },
              ],
            ]}
          >
            <Ionicons name={iconName} size={22} color={iconColor} />
            <Text
              style={[
                styles.tabLabel,
                {
                  color: textColor,
                  fontFamily: isFocused ? Fonts.semiBold : Fonts.medium,
                },
              ]}
              numberOfLines={1}
            >
              {config.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </SafeAreaView>
  );
}


const styles = ScaledSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: "12@vs",
    paddingHorizontal: "16@s",
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "4@vs",
    paddingVertical: "10@vs",
    paddingHorizontal: "32@s",
    borderRadius: "30@s",
    minWidth: "120@s",
  },
  tabButtonActive: {
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  tabLabel: {
    fontSize: FontSizes.xs,
    letterSpacing: 0.2,
  },
});
