import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ScaledSheet } from "react-native-size-matters";

import Header from "../../components/Header";

import SettingsTabs from "../../components/settings/SettingsTabs";
import ProfileTab from "../../components/settings/ProfileTab";
import AlertsTab from "../../components/settings/AlertsTab";
import PrivacyTab from "../../components/settings/PrivacyTab";
import GlassesTab from "../../components/settings/GlassesTab";

import { useTheme } from "../../hooks/useTheme";
import { Fonts, FontSizes } from "../../constants/theme";

type SettingsTab = "profile" | "alerts" | "privacy" | "glasses";

export default function SettingsScreen(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const renderTabContent = (): React.JSX.Element => {
    switch (activeTab) {
      case "profile":
        return <ProfileTab />;

      case "alerts":
        return <AlertsTab />;

      case "privacy":
        return <PrivacyTab />;

      case "glasses":
        return <GlassesTab />;

      default:
        return <ProfileTab />;
    }
  };

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
              },
            ]}
          >
            Settings
          </Text>

          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            Manage your preferences and profile
          </Text>

          <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {renderTabContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = ScaledSheet.create({
  container: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: "120@vs",
  },

  content: {
    paddingHorizontal: "20@s",
  },

  title: {
    fontSize: FontSizes.xxl,
    fontFamily: Fonts.bold,
    marginTop: "10@vs",
  },

  subtitle: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.regular,
    marginTop: "6@vs",
    marginBottom: "10@vs",
  },
});
