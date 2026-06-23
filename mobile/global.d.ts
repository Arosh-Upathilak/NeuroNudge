import { ViewStyle, TextStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";

declare global {
  // ─── Theme Constants ─────────────────────────────────────────────────────────

  interface ThemeColors {
    readonly primary: string;
    readonly primaryLight: string;
    readonly primaryDark: string;
    readonly background: string;
    readonly surface: string;
    readonly card: string;
    readonly text: string;
    readonly textSecondary: string;
    readonly textMuted: string;
    readonly navbarBackground: string;
    readonly navbarActiveBackground: string;
    readonly navbarActiveText: string;
    readonly navbarInactiveText: string;
    readonly navbarBorder: string;
    readonly headerBackground: string;
    readonly headerText: string;
    readonly headerIcon: string;
    readonly success: string;
    readonly error: string;
    readonly warning: string;
    readonly info: string;
    readonly divider: string;
    readonly overlay: string;
    readonly shadow: string;
    readonly toggleTrackInactive: string;
    readonly toggleTrackActive: string;
    readonly sunIcon: string;
    readonly moonIcon: string;
  }

  interface FontFamilies {
    readonly regular: string;
    readonly medium: string;
    readonly semiBold: string;
    readonly bold: string;
  }

  interface FontSizeScale {
    readonly xs: number;
    readonly sm: number;
    readonly md: number;
    readonly lg: number;
    readonly xl: number;
    readonly xxl: number;
    readonly brandTitle: number;
  }

  type ThemeMode = "light" | "dark";

  // ─── Contexts & Hooks ───────────────────────────────────────────────────────

  interface DrawerContextType {
    readonly isOpen: boolean;
    readonly openDrawer: () => void;
    readonly closeDrawer: () => void;
    readonly toggleDrawer: () => void;
  }

  interface ThemeContextType {
    readonly isDark: boolean;
    readonly colors: ThemeColors;
    readonly themeMode: ThemeMode;
    readonly toggleTheme: () => void;
    readonly setThemeMode: (mode: ThemeMode) => void;
  }

  interface UseThemeReturn {
    readonly isDark: boolean;
    readonly colors: ThemeColors;
    readonly toggleTheme: () => void;
  }

  // ─── Component Props ─────────────────────────────────────────────────────────

  interface HeaderProps {
    readonly onNotificationPress?: () => void;
  }

  interface MenuItemProps {
    readonly icon: keyof typeof Ionicons.glyphMap;
    readonly label: string;
    readonly onPress?: () => void;
    readonly colors: ThemeColors;
  }

  type TabIconName =
    | "grid"
    | "grid-outline"
    | "options"
    | "options-outline"
    | "archive"
    | "archive-outline";

  interface TabConfig {
    readonly label: string;
    readonly activeIcon: TabIconName;
    readonly inactiveIcon: TabIconName;
  }


}
