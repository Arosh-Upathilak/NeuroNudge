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
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { useSafeAreaInsets, type EdgeInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Fonts, FontSizes, type ThemeColors } from "../constants/theme";
import { useTheme } from "../hooks/useTheme";
import { useDrawer } from "../contexts/DrawerContext";

// ─── Constants ───────────────────────────────────────────────────────────────

const SCREEN_WIDTH: number = Dimensions.get("window").width;
const DRAWER_WIDTH: number = SCREEN_WIDTH * 0.78;
const ANIMATION_DURATION: number = 280;

// ─── Types ───────────────────────────────────────────────────────────────────

interface MenuItemProps {
  readonly icon: keyof typeof Ionicons.glyphMap;
  readonly label: string;
  readonly onPress?: () => void;
  readonly colors: ThemeColors;
}

interface SideDrawerStyles {
  overlay: ViewStyle;
  backdrop: ViewStyle;
  drawer: ViewStyle;
  profileSection: ViewStyle;
  avatarCircle: ViewStyle;
  profileInfo: ViewStyle;
  profileName: TextStyle;
  signOutText: TextStyle;
  closeButton: ViewStyle;
  separator: ViewStyle;
  menuSection: ViewStyle;
  menuItem: ViewStyle;
  menuLabel: TextStyle;
  themeSection: ViewStyle;
  themeToggleRow: ViewStyle;
  themeLabel: TextStyle;
  toggleTrack: ViewStyle;
  toggleThumb: ViewStyle;
  toggleIcon: ViewStyle;
}

// ─── MenuItem Sub-component ──────────────────────────────────────────────────

function MenuItem({ icon, label, onPress, colors }: MenuItemProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={22} color={colors.textSecondary} />
      <Text style={[styles.menuLabel, { color: colors.text, fontFamily: Fonts.medium }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function SideDrawer(): React.JSX.Element | null {
  const { isOpen, closeDrawer } = useDrawer();
  const { colors, isDark, toggleTheme } = useTheme();
  const insets: EdgeInsets = useSafeAreaInsets();

  // Animated values
  const translateX = useRef<Animated.Value>(new Animated.Value(DRAWER_WIDTH)).current;
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

  // Toggle thumb position
  const thumbTranslateX = useRef<Animated.Value>(
    new Animated.Value(isDark ? 28 : 0)
  ).current;

  useEffect((): void => {
    Animated.timing(thumbTranslateX, {
      toValue: isDark ? 28 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isDark, thumbTranslateX]);

  // Don't render anything if never opened (perf)
  const hasBeenOpened = useRef<boolean>(false);
  if (isOpen) hasBeenOpened.current = true;
  if (!hasBeenOpened.current) return null;

  return (
    <View style={styles.overlay} pointerEvents={isOpen ? "auto" : "none"}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={closeDrawer}>
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: backdropOpacity, backgroundColor: colors.overlay },
          ]}
        />
      </TouchableWithoutFeedback>

      {/* Drawer Panel */}
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
        {/* ── Profile Section ── */}
        <View style={styles.profileSection}>
          <View style={[styles.avatarCircle, { borderColor: colors.textMuted }]}>
            <Ionicons name="person-outline" size={28} color={colors.textSecondary} />
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text, fontFamily: Fonts.semiBold }]}>
              Alex Doe
            </Text>
            <TouchableOpacity activeOpacity={0.7} accessibilityLabel="Sign Out">
              <Text style={[styles.signOutText, { color: colors.error, fontFamily: Fonts.medium }]}>
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

        {/* ── Separator ── */}
        <View style={[styles.separator, { backgroundColor: colors.navbarBorder }]} />

        {/* ── Menu Items ── */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="settings-outline"
            label="Settings"
            colors={colors}
          />
          <MenuItem
            icon="help-circle-outline"
            label="Help & Feedback"
            colors={colors}
          />
        </View>

        {/* ── Spacer ── */}
        <View style={{ flex: 1 }} />

        {/* ── Theme Toggle ── */}
        <View style={styles.themeSection}>
          <View style={styles.themeToggleRow}>
            <Text style={[styles.themeLabel, { color: colors.text, fontFamily: Fonts.medium }]}>
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
                    backgroundColor: isDark ? colors.toggleTrackActive : colors.toggleTrackInactive,
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

                {/* Static background icons */}
                <View style={[styles.toggleIcon, { left: 6 }]}>
                  <Ionicons name="sunny" size={14} color={isDark ? colors.textMuted : "transparent"} />
                </View>
                <View style={[styles.toggleIcon, { right: 6 }]}>
                  <Ionicons name="moon" size={14} color={isDark ? "transparent" : colors.textMuted} />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: SideDrawerStyles = StyleSheet.create<SideDrawerStyles>({
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
    paddingHorizontal: 24,
    shadowColor: "#000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    fontSize: FontSizes.lg,
    marginBottom: 2,
  },
  signOutText: {
    fontSize: FontSizes.sm,
    color: "#C0392B",
  },
  closeButton: {
    padding: 4,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  menuSection: {
    gap: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  menuLabel: {
    fontSize: FontSizes.md,
  },
  themeSection: {
    paddingTop: 16,
  },
  themeToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
  },
  themeLabel: {
    fontSize: FontSizes.sm,
  },
  toggleTrack: {
    width: 56,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    position: "relative",
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 2,
    zIndex: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleIcon: {
    position: "absolute",
    top: 7,
    zIndex: 1,
  },
});
