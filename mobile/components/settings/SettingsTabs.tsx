import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { ScaledSheet } from "react-native-size-matters";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

interface SettingsTabsProps {
  activeTab: "profile" | "alerts" | "privacy" | "glasses";
  onTabChange: (tab: "profile" | "alerts" | "privacy" | "glasses") => void;
}

export default function SettingsTabs({
  activeTab,
  onTabChange,
}: SettingsTabsProps): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const tabs: ("profile" | "alerts" | "privacy" | "glasses")[] = [
    "profile",
    "alerts",
    "privacy",
    "glasses",
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.8}
            onPress={() => onTabChange(tab)}
            style={[
              styles.tabButton,
              {
                backgroundColor: isActive ? colors.primary : colors.card,
              },
            ]}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color: isActive ? colors.navbarActiveText : colors.text,
                },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = ScaledSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "12@vs",
    marginBottom: "24@vs",
  },

  tabButton: {
    paddingHorizontal: "18@s",
    paddingVertical: "10@vs",
    borderRadius: "20@s",
    marginRight: "10@s",
    minWidth: "80@s",
    alignItems: "center",
    justifyContent: "center",
  },

  tabText: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.semiBold,
  },
});
