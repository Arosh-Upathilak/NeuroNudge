/**
 * Custom hook that provides theme-aware colors.
 * Reads from ThemeContext (which supports manual override)
 * so that the Light / Dark toggle in the SideDrawer works.
 */

import { useThemeContext } from "../contexts/ThemeContext";





export function useTheme(): UseThemeReturn {
  const { isDark, colors, toggleTheme } = useThemeContext();

  return { isDark, colors, toggleTheme } as const;
}
