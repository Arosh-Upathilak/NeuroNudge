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

  // ─── Auth ─────────────────────────────────────────────────────────────────────

  interface AuthUser {
    readonly uid: string;
    readonly email: string | null;
    readonly displayName: string | null;
    readonly emailVerified: boolean;
  }

  interface AuthContextType {
    /** The currently authenticated user, or null if signed out. */
    readonly user: AuthUser | null;
    /** True while Firebase is resolving the initial auth state on startup. */
    readonly isLoading: boolean;
    /** Signs in with email + password via Firebase. */
    readonly signIn: (email: string, password: string) => Promise<void>;
    /** Creates a Firebase user and sends verification email. Does not register with backend yet. */
    readonly signUp: (
      email: string,
      password: string,
      name: string
    ) => Promise<void>;
    /** Signs the current user out of Firebase. */
    readonly signOut: () => Promise<void>;
    /** Signs in with Google. */
    readonly signInWithGoogle: () => Promise<void>;
    /** Reloads the Firebase user to check for email verification status. Registers backend user if verified. */
    readonly reloadUser: () => Promise<void>;
    /** Resends the verification email. */
    readonly resendVerificationEmail: () => Promise<void>;
    /** Sends a password reset email to the user. */
    readonly resetPassword: (email: string) => Promise<void>;
  }
}
