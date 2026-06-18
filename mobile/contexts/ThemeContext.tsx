/**
 * ThemeContext – allows manual override of the system color scheme.
 * Wraps the app so that the Light / Dark toggle in the SideDrawer
 * can control the theme across all screens.
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type PropsWithChildren,
} from "react";
import { useColorScheme, type ColorSchemeName } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, type ThemeColors, type ThemeMode } from "../constants/theme";

// ─── Constants ───────────────────────────────────────────────────────────────

const THEME_STORAGE_KEY: string = "neuronudge_theme_mode";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ThemeContextType {
  readonly isDark: boolean;
  readonly colors: ThemeColors;
  readonly themeMode: ThemeMode;
  readonly toggleTheme: () => void;
  readonly setThemeMode: (mode: ThemeMode) => void;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function ThemeProvider({ children }: PropsWithChildren): React.JSX.Element {
  const systemColorScheme: ColorSchemeName = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    systemColorScheme === "dark" ? "dark" : "light"
  );

  // Load persistent theme preference on initialization
  useEffect((): void => {
    const loadTheme = async (): Promise<void> => {
      try {
        const storedTheme: string | null = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === "light" || storedTheme === "dark") {
          setThemeModeState(storedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme preference from AsyncStorage:", error);
      }
    };
    loadTheme();
  }, []);

  const isDark: boolean = themeMode === "dark";
  const colors: ThemeColors = isDark ? Colors.dark : Colors.light;

  const setThemeMode = useCallback((mode: ThemeMode): void => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch((error: unknown): void => {
      console.error("Failed to save theme preference to AsyncStorage:", error);
    });
  }, []);

  const toggleTheme = useCallback((): void => {
    setThemeModeState((prev: ThemeMode): ThemeMode => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch((error: unknown): void => {
        console.error("Failed to save toggled theme preference to AsyncStorage:", error);
      });
      return next;
    });
  }, []);

  const value: ThemeContextType = useMemo(
    () => ({
      isDark,
      colors,
      themeMode,
      toggleTheme,
      setThemeMode,
    }),
    [isDark, colors, themeMode, toggleTheme, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useThemeContext(): ThemeContextType {
  const context: ThemeContextType | undefined = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }

  return context;
}
