/**
 * Root layout – bootstraps fonts, context providers,
 * and the navigation stack for the entire app.
 *
 * Provider order (outermost → innermost):
 *   ThemeProvider  → theme colours & light/dark toggle
 *   DrawerProvider → side drawer open/close state
 */

import React, { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import * as SplashScreen from "expo-splash-screen";
import { ThemeProvider } from "../contexts/ThemeContext";
import { DrawerProvider } from "../contexts/DrawerContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import SideDrawer from "../components/SideDrawer";
import { useTheme } from "../hooks/useTheme";


import { ScaledSheet } from "react-native-size-matters";





SplashScreen.preventAutoHideAsync();


export default function RootLayout(): React.JSX.Element | null {
  const [fontsLoaded]: [boolean, Error | null] = useFonts({
    "Poppins-Regular": Poppins_400Regular,
    "Poppins-Medium": Poppins_500Medium,
    "Poppins-SemiBold": Poppins_600SemiBold,
    "Poppins-Bold": Poppins_700Bold,
  });

  useEffect((): void => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <DrawerProvider>
        <NotificationProvider>
          <ThemedApp />
        </NotificationProvider>
      </DrawerProvider>
    </ThemeProvider>
  );
}

/**
 * Inner component that consumes theme context.
 * Renders the StatusBar and applies layout styling reactively.
 */
function ThemedApp(): React.JSX.Element {
  const { colors, isDark }: { colors: ThemeColors; isDark: boolean } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="notifications" options={{ presentation: 'modal' }} />
      </Stack>
      <SideDrawer />
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
});
