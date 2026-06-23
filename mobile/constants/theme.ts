/**
 * Theme constants for NeuroNudge mobile app.
 * Defines color palettes, font families, and font sizes
 * with full TypeScript type safety.
 */




export const Colors: Record<ThemeMode, ThemeColors> = {
  light: {
    primary: "#3C6255",
    primaryLight: "#4A7A6A",
    primaryDark: "#2D4A40",

    background: "#F5F0EB",
    surface: "#FFFFFF",
    card: "#E8E3DD",

    text: "#1A1A1A",
    textSecondary: "#6B6B6B",
    textMuted: "#999999",

    navbarBackground: "#F5F0EB",
    navbarActiveBackground: "#3C6255",
    navbarActiveText: "#FFFFFF",
    navbarInactiveText: "#6B6B6B",
    navbarBorder: "#E0DBD5",

    headerBackground: "#F5F0EB",
    headerText: "#3C6255",
    headerIcon: "#3C3C3C",

    success: "#2ECC71",
    error: "#C0392B",
    warning: "#F1C40F",
    info: "#3498DB",

    divider: "#E0DBD5",
    overlay: "rgba(0, 0, 0, 0.45)",
    shadow: "#000000",

    toggleTrackInactive: "#E0DBD5",
    toggleTrackActive: "#3C6255",
    sunIcon: "#E8A838",
    moonIcon: "#999999",
  },
  dark: {
    primary: "#5A9E8F",
    primaryLight: "#6BB3A3",
    primaryDark: "#4A8A7C",

    background: "#121212",
    surface: "#1E1E1E",
    card: "#2A2A2A",

    text: "#F0F0F0",
    textSecondary: "#A0A0A0",
    textMuted: "#707070",

    navbarBackground: "#1A1A1A",
    navbarActiveBackground: "#5A9E8F",
    navbarActiveText: "#FFFFFF",
    navbarInactiveText: "#808080",
    navbarBorder: "#2A2A2A",

    headerBackground: "#121212",
    headerText: "#5A9E8F",
    headerIcon: "#E0E0E0",

    success: "#2ECC71",
    error: "#E74C3C",
    warning: "#F1C40F",
    info: "#3498DB",

    divider: "#2A2A2A",
    overlay: "rgba(0, 0, 0, 0.65)",
    shadow: "#000000",

    toggleTrackInactive: "#2A2A2A",
    toggleTrackActive: "#5A9E8F",
    sunIcon: "#707070",
    moonIcon: "#5A9E8F",
  },
} as const;


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
