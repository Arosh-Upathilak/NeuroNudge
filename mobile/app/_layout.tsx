/**
 * Root layout – bootstraps fonts, context providers,
 * and the navigation stack for the entire app.
 *
 * Provider order (outermost → innermost):
 *   ThemeProvider  → theme colours & light/dark toggle
 *   DrawerProvider → side drawer open/close state
 *   AuthProvider   → Firebase auth state & sign-in/sign-up/sign-out
 */

import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, router } from "expo-router";
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
import { AuthProvider } from "../contexts/AuthContext";
import SideDrawer from "../components/SideDrawer";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../contexts/AuthContext";

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
          <AuthProvider>
            <ThemedApp />
          </AuthProvider>
        </NotificationProvider>
      </DrawerProvider>
    </ThemeProvider>
  );
}

/**
 * Inner component that consumes theme + auth context.
 * Handles auth-based route protection and applies layout styling reactively.
 */
function ThemedApp(): React.JSX.Element {
  const { colors, isDark }: { colors: ThemeColors; isDark: boolean } =
    useTheme();
  const { user, isLoading } = useAuth();

  // Guard: redirect based on auth state once Firebase has resolved.
  useEffect(() => {
    if (isLoading) return;

    if (user) {
      if (user.emailVerified) {
        router.replace("/(tabs)" as any);
      } else {
        router.replace("/verify-email" as any);
      }
    } else {
      router.replace("/login" as any);
    }
  }, [user, isLoading]);

  // Show a neutral loading screen while Firebase resolves the persisted session.
  if (isLoading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="notifications"
          options={{ presentation: "modal" }}
        />
      </Stack>
      <SideDrawer />
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
