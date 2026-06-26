/**
 * Custom bottom tab bar (Footer / Navbar) for the NeuroNudge app.
 * Active tab renders as a pill-shaped button with the primary brand color.
 * Supports light and dark themes.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Fonts, FontSizes } from "../constants/theme";
import { ScaledSheet, scale } from "react-native-size-matters";
import { useTheme } from "../hooks/useTheme";

type TabIconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
  label: string;
  activeIcon: TabIconName;
  inactiveIcon: TabIconName;
}

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

  const [tabWidth, setTabWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(state.index)).current;

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setTabWidth(width / state.routes.length);
  };

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: state.index,
      useNativeDriver: true,
      tension: 60,
      friction: 8,
    }).start();
  }, [state.index, slideAnim]);

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
      <View style={styles.tabWrapper} onLayout={handleLayout}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              width: tabWidth,
              backgroundColor: colors.navbarActiveBackground,
              borderRadius: scale(30),
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: state.routes.length > 0 ? state.routes.map((_, i) => i) : [0, 1],
                    outputRange: state.routes.length > 0 ? state.routes.map((_, i) => i * tabWidth) : [0, 0],
                  }),
                },
              ],
              shadowColor: colors.shadow,
              elevation: 2,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 4,
            },
          ]}
        />
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
              style={styles.tabButton}
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
      </View>
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
  tabWrapper: {
    flex: 1,
    flexDirection: "row",
    position: "relative",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "4@vs",
    paddingVertical: "10@vs",
    borderRadius: "30@s",
  },
  tabLabel: {
    fontSize: FontSizes.xs,
    letterSpacing: 0.2,
  },
});
