/**
 * Custom hook that provides theme-aware colors.
 * Reads from ThemeContext (which supports manual override)
 * so that the Light / Dark toggle in the SideDrawer works.
 */

import { useThemeContext } from "../contexts/ThemeContext";
import type { ThemeColors } from "../constants/theme";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UseThemeReturn {
  readonly isDark: boolean;
  readonly colors: ThemeColors;
  readonly toggleTheme: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTheme(): UseThemeReturn {
  const { isDark, colors, toggleTheme } = useThemeContext();

  return { isDark, colors, toggleTheme } as const;
}
