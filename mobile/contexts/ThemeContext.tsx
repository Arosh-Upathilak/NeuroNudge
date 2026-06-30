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
import { Colors } from "../constants/theme";

const THEME_STORAGE_KEY: string = "neuronudge_theme_mode";

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
}: PropsWithChildren): React.JSX.Element {
  const systemColorScheme: ColorSchemeName = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>(
    systemColorScheme === "dark" ? "dark" : "light",
  );

  useEffect((): void => {
    const loadTheme = async (): Promise<void> => {
      try {
        const storedTheme: string | null =
          await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === "light" || storedTheme === "dark") {
          setThemeModeState(storedTheme);
        }
      } catch {}
    };
    loadTheme();
  }, [setThemeModeState]);

  const isDark: boolean = themeMode === "dark";
  const colors: ThemeColors = isDark ? Colors.dark : Colors.light;

  const setThemeMode = useCallback((mode: ThemeMode): void => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, mode).catch(
      (error: unknown): void => {},
    );
  }, []);

  const toggleTheme = useCallback((): void => {
    setThemeModeState((prev: ThemeMode): ThemeMode => {
      const next: ThemeMode = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(
        (error: unknown): void => {},
      );
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
    [isDark, colors, themeMode, toggleTheme, setThemeMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextType {
  const context: ThemeContextType | undefined = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }

  return context;
}
