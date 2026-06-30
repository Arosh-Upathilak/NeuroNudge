/**
 * Dashboard screen – the main landing page of the app.
 * Shows a personalised greeting and the current date.
 */

import React, { useEffect, useState } from "react";
import { Text, ScrollView } from "react-native";
import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";
import FeatureCard from "../../components/dashboard/FeatureCard";
import NoiseMonitoringCard from "../../components/dashboard/NoiseMonitoringCard";
import { router } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

import { SafeAreaView } from "react-native-safe-area-context";
import { ScaledSheet } from "react-native-size-matters";

export default function DashboardScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();
  const { user } = useAuth();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = currentTime.getHours();

  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.greeting, { color: colors.text }]}>
          {greeting},{" "}
          {user?.displayName
            ? user.displayName.split(" ")[0]
            : user?.email?.split("@")[0] || "User"}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formattedDate}
        </Text>

        <FeatureCard
          title="Sound Sanctuary"
          description="Manage your acoustic environment and access calming audioscapes."
          icon="volume-medium"
          onPress={() => router.push("/(tabs)/sanctuary")}
        />

        <FeatureCard
          title="Lost-to-Found"
          description="Quickly locate essential items or log new misplaced objects."
          icon="archive"
          onPress={() => router.push("/(tabs)/lost-found")}
        />

        <NoiseMonitoringCard />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: "20@s",
    paddingTop: "8@vs",
    paddingBottom: "80@vs",
  },
  greeting: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
    marginBottom: "2@vs",
  },
  date: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
    marginBottom: "14@vs",
  },
});
