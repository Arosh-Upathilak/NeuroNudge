/**
 * Theme constants for NeuroNudge mobile app.
 * Defines color palettes, font families, and font sizes
 * with full TypeScript type safety.
 */

// ─── Type Definitions ────────────────────────────────────────────────────────

export interface ThemeColors {
  // Primary brand colors
  readonly primary: string;
  readonly primaryLight: string;
  readonly primaryDark: string;

  // Background colors
  readonly background: string;
  readonly surface: string;
  readonly card: string;

  // Text colors
  readonly text: string;
  readonly textSecondary: string;
  readonly textMuted: string;

  // Navbar
  readonly navbarBackground: string;
  readonly navbarActiveBackground: string;
  readonly navbarActiveText: string;
  readonly navbarInactiveText: string;
  readonly navbarBorder: string;

  // Header
  readonly headerBackground: string;
  readonly headerText: string;
  readonly headerIcon: string;

  // Feedback and Accent colors
  readonly success: string;
  readonly error: string;
  readonly warning: string;
  readonly info: string;

  // UI Structure
  readonly divider: string;
  readonly overlay: string;
  readonly shadow: string;

  // Toggle & Switch controls
  readonly toggleTrackInactive: string;
  readonly toggleTrackActive: string;
  readonly sunIcon: string;
  readonly moonIcon: string;
}

export interface FontFamilies {
  readonly regular: string;
  readonly medium: string;
  readonly semiBold: string;
  readonly bold: string;
}

export interface FontSizeScale {
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly xxl: number;
  readonly brandTitle: number;
}

export type ThemeMode = "light" | "dark";

// ─── Color Palettes ──────────────────────────────────────────────────────────

export const Colors: Record<ThemeMode, ThemeColors> = {
  light: {
    // Primary brand colors
    primary: "#3C6255",
    primaryLight: "#4A7A6A",
    primaryDark: "#2D4A40",

    // Background colors
    background: "#F5F0EB",
    surface: "#FFFFFF",
    card: "#E8E3DD",

    // Text colors
    text: "#1A1A1A",
    textSecondary: "#6B6B6B",
    textMuted: "#999999",

    // Navbar
    navbarBackground: "#F5F0EB",
    navbarActiveBackground: "#3C6255",
    navbarActiveText: "#FFFFFF",
    navbarInactiveText: "#6B6B6B",
    navbarBorder: "#E0DBD5",

    // Header
    headerBackground: "#F5F0EB",
    headerText: "#3C6255",
    headerIcon: "#3C3C3C",

    // Feedback and Accent colors
    success: "#2ECC71",
    error: "#C0392B",
    warning: "#F1C40F",
    info: "#3498DB",

    // UI Structure
    divider: "#E0DBD5",
    overlay: "rgba(0, 0, 0, 0.45)",
    shadow: "#000000",

    // Toggle & Switch controls
    toggleTrackInactive: "#E0DBD5",
    toggleTrackActive: "#3C6255",
    sunIcon: "#E8A838",
    moonIcon: "#999999",
  },
  dark: {
    // Primary brand colors
    primary: "#5A9E8F",
    primaryLight: "#6BB3A3",
    primaryDark: "#4A8A7C",

    // Background colors
    background: "#121212",
    surface: "#1E1E1E",
    card: "#2A2A2A",

    // Text colors
    text: "#F0F0F0",
    textSecondary: "#A0A0A0",
    textMuted: "#707070",

    // Navbar
    navbarBackground: "#1A1A1A",
    navbarActiveBackground: "#5A9E8F",
    navbarActiveText: "#FFFFFF",
    navbarInactiveText: "#808080",
    navbarBorder: "#2A2A2A",

    // Header
    headerBackground: "#121212",
    headerText: "#5A9E8F",
    headerIcon: "#E0E0E0",

    // Feedback and Accent colors
    success: "#2ECC71",
    error: "#E74C3C",
    warning: "#F1C40F",
    info: "#3498DB",

    // UI Structure
    divider: "#2A2A2A",
    overlay: "rgba(0, 0, 0, 0.65)",
    shadow: "#000000",

    // Toggle & Switch controls
    toggleTrackInactive: "#2A2A2A",
    toggleTrackActive: "#5A9E8F",
    sunIcon: "#707070",
    moonIcon: "#5A9E8F",
  },
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

export const Fonts: FontFamilies = {
  regular: "Poppins-Regular",
  medium: "Poppins-Medium",
  semiBold: "Poppins-SemiBold",
  bold: "Poppins-Bold",
} as const;

export const FontSizes: FontSizeScale = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  brandTitle: 20,
} as const;
