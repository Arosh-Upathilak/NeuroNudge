import { Ionicons } from "@expo/vector-icons";

declare global {

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


  interface AuthUser {
    readonly uid: string;
    readonly email: string | null;
    readonly displayName: string | null;
    readonly emailVerified: boolean;
  }

  interface AuthContextType {
    readonly user: AuthUser | null;
    readonly isLoading: boolean;
    readonly signIn: (email: string, password: string) => Promise<void>;
    readonly signUp: (
      email: string,
      password: string,
      name: string,
    ) => Promise<void>;
    readonly signOut: () => Promise<void>;
    readonly signInWithGoogle: () => Promise<void>;
    readonly reloadUser: () => Promise<void>;
    readonly resendVerificationEmail: () => Promise<void>;
    readonly resetPassword: (email: string) => Promise<void>;
    readonly updateProfileName: (name: string) => Promise<void>;
  }
}
