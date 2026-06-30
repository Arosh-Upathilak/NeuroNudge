/**
 * SideDrawer – slides in from the right when the hamburger
 * menu in the Header is tapped.
 *
 * Sections (top → bottom):
 *   1. User profile (avatar, name, sign-out)
 *   2. Menu items (Settings, Help & Feedback)
 *   3. Theme toggle (Light / Dark)
 */

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from "react-native";
import {
  useSafeAreaInsets,
  type EdgeInsets,
} from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, FontSizes } from "../constants/theme";
import { ScaledSheet } from "react-native-size-matters";
import { useTheme } from "../hooks/useTheme";
import { useDrawer } from "../contexts/DrawerContext";
import { useAuth } from "../contexts/AuthContext";
import { router } from "expo-router";

const SCREEN_WIDTH: number = Dimensions.get("window").width;
const DRAWER_WIDTH: number = SCREEN_WIDTH * 0.78;
const ANIMATION_DURATION: number = 280;

function MenuItem({
  icon,
  label,
  onPress,
  colors,
}: MenuItemProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={22} color={colors.textSecondary} />
      <Text
        style={[
          styles.menuLabel,
          { color: colors.text, fontFamily: Fonts.medium },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function SideDrawer(): React.JSX.Element | null {
  const { isOpen, closeDrawer } = useDrawer();
  const { colors, isDark, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const insets: EdgeInsets = useSafeAreaInsets();

  const translateX = useRef<Animated.Value>(
    new Animated.Value(DRAWER_WIDTH),
  ).current;
  const backdropOpacity = useRef<Animated.Value>(new Animated.Value(0)).current;

  useEffect((): void => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: DRAWER_WIDTH,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOpen, translateX, backdropOpacity]);

  const thumbTranslateX = useRef<Animated.Value>(
    new Animated.Value(isDark ? 28 : 0),
  ).current;

  useEffect((): void => {
    Animated.timing(thumbTranslateX, {
      toValue: isDark ? 28 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isDark, thumbTranslateX]);

  const hasBeenOpened = useRef<boolean>(false);
  if (isOpen) hasBeenOpened.current = true;
  if (!hasBeenOpened.current) return null;

  return (
    <View style={styles.overlay} pointerEvents={isOpen ? "auto" : "none"}>
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropOpacity, backgroundColor: colors.overlay },
          ]}
        />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            backgroundColor: colors.surface,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateX }],
            shadowColor: colors.shadow,
          },
        ]}
      >
        <View style={styles.profileSection}>
          <View
            style={[styles.avatarCircle, { borderColor: colors.textMuted }]}
          >
            <Ionicons
              name="person-outline"
              size={28}
              color={colors.textSecondary}
            />
          </View>

          <View style={styles.profileInfo}>
            <Text
              style={[
                styles.profileName,
                { color: colors.text, fontFamily: Fonts.semiBold },
              ]}
            >
              {user?.displayName || user?.email?.split("@")[0] || "User"}
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              accessibilityLabel="Sign Out"
              onPress={async () => {
                try {
                  await signOut();
                  closeDrawer();
                } catch {}
              }}
            >
              <Text
                style={[
                  styles.signOutText,
                  { color: colors.error, fontFamily: Fonts.medium },
                ]}
              >
                Sign Out
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={closeDrawer}
            activeOpacity={0.7}
            accessibilityLabel="Close menu"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View
          style={[styles.separator, { backgroundColor: colors.navbarBorder }]}
        />

        <View style={styles.menuSection}>
          <MenuItem
            icon="settings-outline"
            label="Settings"
            colors={colors}
            onPress={() => {
              closeDrawer();
              router.push("/settings");
            }}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Feedback"
            colors={colors}
          />
        </View>

        <View style={{ flex: 1 }} />

        <View style={styles.themeSection}>
          <View style={styles.themeToggleRow}>
            <Text
              style={[
                styles.themeLabel,
                { color: colors.text, fontFamily: Fonts.medium },
              ]}
            >
              {isDark ? "Dark" : "Light"}
            </Text>

            <TouchableOpacity
              onPress={toggleTheme}
              activeOpacity={0.8}
              accessibilityRole="switch"
              accessibilityState={{ checked: isDark }}
              accessibilityLabel="Toggle dark mode"
            >
              <View
                style={[
                  styles.toggleTrack,
                  {
                    backgroundColor: isDark
                      ? colors.toggleTrackActive
                      : colors.toggleTrackInactive,
                  },
                ]}
              >
                <Animated.View
                  style={[
                    styles.toggleThumb,
                    {
                      backgroundColor: colors.surface,
                      transform: [{ translateX: thumbTranslateX }],
                      shadowColor: colors.shadow,
                    },
                  ]}
                >
                  <Ionicons
                    name={isDark ? "moon" : "sunny"}
                    size={14}
                    color={isDark ? colors.moonIcon : colors.sunIcon}
                  />
                </Animated.View>

                <View style={[styles.toggleIcon, { left: 6 }]}>
                  <Ionicons
                    name="sunny"
                    size={14}
                    color={isDark ? colors.textMuted : "transparent"}
                  />
                </View>
                <View style={[styles.toggleIcon, { right: 6 }]}>
                  <Ionicons
                    name="moon"
                    size={14}
                    color={isDark ? "transparent" : colors.textMuted}
                  />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = ScaledSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  drawer: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: "24@s",
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: "16@vs",
  },
  avatarCircle: {
    width: "48@s",
    height: "48@s",
    borderRadius: "24@s",
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: "12@s",
  },
  profileName: {
    fontSize: FontSizes.lg,
    marginBottom: "2@vs",
  },
  signOutText: {
    fontSize: FontSizes.sm,
    color: "#C0392B",
  },
  closeButton: {
    padding: "4@s",
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginBottom: "20@vs",
  },
  menuSection: {
    gap: "8@s",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: "14@s",
    paddingVertical: "12@vs",
    paddingHorizontal: "4@s",
    borderRadius: "10@s",
  },
  menuLabel: {
    fontSize: FontSizes.md,
  },
  themeSection: {
    paddingTop: "16@vs",
  },
  themeToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "10@s",
  },
  themeLabel: {
    fontSize: FontSizes.sm,
  },
  toggleTrack: {
    width: "56@s",
    height: "28@vs",
    borderRadius: "14@s",
    justifyContent: "center",
    position: "relative",
  },
  toggleThumb: {
    width: "24@s",
    height: "24@s",
    borderRadius: "12@s",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "2@s",
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleIcon: {
    position: "absolute",
    top: "7@vs",
    zIndex: 1,
  },
});
