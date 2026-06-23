import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { ScaledSheet } from "react-native-size-matters";
import CustomToggle from "./CustomToggle";

import { Fonts, FontSizes } from "../../constants/theme";
import { useTheme } from "../../hooks/useTheme";

export default function PrivacyTab(): React.JSX.Element {
  const { colors }: { colors: ThemeColors } = useTheme();

  const [locationAccess, setLocationAccess] =
    useState(true);

  const [microphoneAccess, setMicrophoneAccess] =
    useState(true);

  const [cameraAccess, setCameraAccess] =
    useState(false);

  const [shareUsageData, setShareUsageData] =
    useState(false);

  const [personalizedInsights, setPersonalizedInsights] =
    useState(true);

  return (
    <>
      {/* Device Permissions */}

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          Device Permissions
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemTitle,
                { color: colors.text },
              ]}
            >
              Location Access
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              Required for item tracking
            </Text>
          </View>

          <CustomToggle
  value={locationAccess}
  onToggle={() =>
    setLocationAccess(!locationAccess)
  }
/>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                colors.divider,
            },
          ]}
        />

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemTitle,
                { color: colors.text },
              ]}
            >
              Microphone Access
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              Used for ambient noise monitoring
            </Text>
          </View>

          <CustomToggle
  value={microphoneAccess}
  onToggle={() =>
    setMicrophoneAccess(
      !microphoneAccess
    )
  }
/>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                colors.divider,
            },
          ]}
        />

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemTitle,
                { color: colors.text },
              ]}
            >
              Camera Access
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              Scan items for memory logging
            </Text>
          </View>

          <CustomToggle
  value={cameraAccess}
  onToggle={() =>
    setCameraAccess(!cameraAccess)
  }
/>
        </View>
      </View>

      {/* Data & Analytics */}

      <View
        style={[
          styles.card,
          { backgroundColor: colors.card },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          Data & Analytics
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemTitle,
                { color: colors.text },
              ]}
            >
              Share Usage Data
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              Help improve NeuroNudge anonymously
            </Text>
          </View>

          <CustomToggle
  value={shareUsageData}
  onToggle={() =>
    setShareUsageData(
      !shareUsageData
    )
  }
/>
        </View>

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                colors.divider,
            },
          ]}
        />

        <View style={styles.settingRow}>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemTitle,
                { color: colors.text },
              ]}
            >
              Personalized Insights
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              Allow AI to learn your patterns
            </Text>
          </View>

          <CustomToggle
  value={personalizedInsights}
  onToggle={() =>
    setPersonalizedInsights(
      !personalizedInsights
    )
  }
/>
        </View>
      </View>

      {/* Data Management */}

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            marginBottom: 120,
          },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          Data Management
        </Text>

        <TouchableOpacity
          style={styles.actionRow}
          activeOpacity={0.7}
        >
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemTitle,
                { color: colors.text },
              ]}
            >
              Download Data
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              Export your memories and account
              information
            </Text>
          </View>

          <Ionicons
            name="download-outline"
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.divider,
            {
              backgroundColor:
                colors.divider,
            },
          ]}
        />

        <TouchableOpacity
          style={styles.actionRow}
          activeOpacity={0.7}
        >
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.itemTitle,
                { color: "#D9534F" },
              ]}
            >
              Clear Data
            </Text>

            <Text
              style={[
                styles.itemSubtitle,
                {
                  color:
                    colors.textSecondary,
                },
              ]}
            >
              Remove all stored memories and
              history
            </Text>
          </View>

          <Ionicons
            name="trash-outline"
            size={22}
            color="#D9534F"
          />
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = ScaledSheet.create({
  card: {
    borderRadius: "24@s",
    paddingHorizontal: "24@s",
    paddingVertical: "22@vs",
    marginBottom: "16@vs",
  },

  sectionTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.semiBold,
    marginBottom: "20@vs",
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    paddingRight: "12@s",
  },

  itemTitle: {
    fontSize: FontSizes.md,
    fontFamily: Fonts.medium,
    marginBottom: "4@vs",
  },

  itemSubtitle: {
    fontSize: FontSizes.sm,
    fontFamily: Fonts.regular,
    lineHeight: "18@vs",
  },

  divider: {
    height: 1,
    marginVertical: "18@vs",
  },
});